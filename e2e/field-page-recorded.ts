// RECORDED, NOT WRITTEN: the two field-page payloads as the backend
// emits them (branch field-page-api, served locally by uvicorn on
// 2026-09-23 from research_archive/league_field_cups_union_2026-09-23 and
// cross_league_axes.read_axes). TRIMMED ONLY BY DROPPING ROWS — three
// clubs per column in the bundle's own (name) order, plus every
// zero-bridge club and every club rated on another division; per cup and
// axis the top six plus Arsenal, Club Brugge and two below-floor clubs.
// No key, value or sentence was edited, so the fixture speaks the wire's
// language. Variants the page must handle and this recording does not
// contain (two ladders, a whole section below the floor, absent figures)
// are DERIVED from these rows in e2e/the-field-page.spec.ts, each named.
//
// Regenerate: see the python snippet in that spec's header.
export const LEAGUES = {
 "source": "research_archive/league_field_cups_union_2026-09-23/slices.json",
 "slices_sha256": "af4217aaf598655a59ffe085ae68c38fe09719c5d5d63437a84e0e8d7ac25f07",
 "corpus_sha256": "bf58f88facb0378a4e70fd294ba85c96b03521b81720f8b6cc93be349bac5695",
 "passes": 10,
 "jackknife_replicates": 200,
 "published_sweep": [
  1,
  2,
  3,
  5,
  10,
  20
 ],
 "goal_axes_have_no_pass_count": "Attack and defence come from a Poisson GLM over closed (league, season) round-robins plus a bridge design. There is no chain, no warm start and no pass count; this field does not apply to them and is not carried on their rows.",
 "columns": [
  {
   "key": "epl",
   "display": "Premier League",
   "measured": true
  },
  {
   "key": "laliga",
   "display": "La Liga",
   "measured": true
  },
  {
   "key": "mls",
   "display": "MLS",
   "measured": true
  },
  {
   "key": "ligamx",
   "display": "Liga MX",
   "measured": true
  },
  {
   "key": "bundesliga",
   "display": "Bundesliga",
   "measured": true
  },
  {
   "key": "seriea",
   "display": "Serie A",
   "measured": true
  },
  {
   "key": "ligue1",
   "display": "Ligue 1",
   "measured": true
  },
  {
   "key": "eredivisie",
   "display": "Eredivisie",
   "measured": true
  }
 ],
 "axes": {
  "overall": {
   "columns": {
    "epl": {
     "measured": true,
     "unit": "elo",
     "n_rows": 6,
     "value_min": 1630.8177,
     "value_max": 2045.7031,
     "n_clubs": 20,
     "median_half_width_95": 31.82755,
     "median_half_width_95_bridged_only": 31.82755,
     "distinguishable_levels_all_clubs": 6.52,
     "distinguishable_levels_bridged_only": 6.52,
     "cut_against": "the 20 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    },
    "laliga": {
     "measured": true,
     "unit": "elo",
     "n_rows": 3,
     "value_min": 1656.7896,
     "value_max": 1998.3385,
     "n_clubs": 17,
     "median_half_width_95": 37.4237,
     "median_half_width_95_bridged_only": 37.4237,
     "distinguishable_levels_all_clubs": 4.56,
     "distinguishable_levels_bridged_only": 4.56,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    },
    "mls": {
     "measured": true,
     "unit": "elo",
     "n_rows": 3,
     "value_min": 1460.0181,
     "value_max": 1763.3976,
     "n_clubs": 30,
     "median_half_width_95": 32.45055,
     "median_half_width_95_bridged_only": 32.45055,
     "distinguishable_levels_all_clubs": 4.67,
     "distinguishable_levels_bridged_only": 4.67,
     "cut_against": "the 30 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    },
    "ligamx": {
     "measured": true,
     "unit": "elo",
     "n_rows": 3,
     "value_min": 1383.2626,
     "value_max": 1754.8452,
     "n_clubs": 17,
     "median_half_width_95": 42.8685,
     "median_half_width_95_bridged_only": 42.8685,
     "distinguishable_levels_all_clubs": 4.33,
     "distinguishable_levels_bridged_only": 4.33,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    },
    "bundesliga": {
     "measured": true,
     "unit": "elo",
     "n_rows": 3,
     "value_min": 1569.8457,
     "value_max": 2063.703,
     "n_clubs": 17,
     "median_half_width_95": 42.3283,
     "median_half_width_95_bridged_only": 42.3283,
     "distinguishable_levels_all_clubs": 5.83,
     "distinguishable_levels_bridged_only": 5.83,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    },
    "seriea": {
     "measured": true,
     "unit": "elo",
     "n_rows": 3,
     "value_min": 1367.43,
     "value_max": 1888.5838,
     "n_clubs": 19,
     "median_half_width_95": 35.602,
     "median_half_width_95_bridged_only": 35.602,
     "distinguishable_levels_all_clubs": 7.32,
     "distinguishable_levels_bridged_only": 7.32,
     "cut_against": "the 19 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    },
    "ligue1": {
     "measured": true,
     "unit": "elo",
     "n_rows": 3,
     "value_min": 1622.3182,
     "value_max": 1986.6271,
     "n_clubs": 16,
     "median_half_width_95": 39.99805,
     "median_half_width_95_bridged_only": 39.99805,
     "distinguishable_levels_all_clubs": 4.55,
     "distinguishable_levels_bridged_only": 4.55,
     "cut_against": "the 16 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    },
    "eredivisie": {
     "measured": true,
     "unit": "elo",
     "n_rows": 5,
     "value_min": 1322.5101,
     "value_max": 1842.2054,
     "n_clubs": 18,
     "median_half_width_95": 40.90165,
     "median_half_width_95_bridged_only": 42.0564,
     "distinguishable_levels_all_clubs": 6.35,
     "distinguishable_levels_bridged_only": 5.33,
     "cut_against": "the 18 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile over the live 2026-27 roster, not over the fit's corpus-era set. A club's tier here is not its tier on ladder A, and neither number means anything without this field named beside it"
    }
   },
   "rows": [
    {
     "club": "Arsenal",
     "value": 2045.7031,
     "lo": 2002.5978,
     "hi": 2088.8084,
     "half_width_95": 43.1053,
     "bridge_fixtures": 36,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 1.2085,
     "placeable_in_a_quintile_of_its_own_league": false,
     "column": "epl",
     "tier": 1,
     "tier_set": [
      1
     ],
     "straddles": false
    },
    {
     "club": "Aston Villa",
     "value": 1948.0414,
     "lo": 1911.0545,
     "hi": 1985.0283,
     "half_width_95": 36.9869,
     "bridge_fixtures": 28,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 1.0369,
     "placeable_in_a_quintile_of_its_own_league": false,
     "column": "epl",
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "Bournemouth",
     "value": 1911.0986,
     "lo": 1884.9441,
     "hi": 1937.2531,
     "half_width_95": 26.1545,
     "bridge_fixtures": 1,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.7333,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "epl",
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "Coventry",
     "value": 1723.4843,
     "lo": 1703.5485,
     "hi": 1743.42,
     "half_width_95": 19.9357,
     "bridge_fixtures": 3,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.6083,
     "placeable_in_a_quintile_of_its_own_league": true,
     "rated_on_another_division": "The fit attributes 'Coventry' to 'championship', not 'epl': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "epl",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Hull City",
     "value": 1630.8177,
     "lo": 1612.3005,
     "hi": 1649.3349,
     "half_width_95": 18.5172,
     "bridge_fixtures": 2,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.565,
     "placeable_in_a_quintile_of_its_own_league": true,
     "rated_on_another_division": "The fit attributes 'Hull City' to 'championship', not 'epl': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "epl",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Ipswich",
     "value": 1705.5182,
     "lo": 1686.7457,
     "hi": 1724.2907,
     "half_width_95": 18.7725,
     "bridge_fixtures": 5,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.5728,
     "placeable_in_a_quintile_of_its_own_league": true,
     "rated_on_another_division": "The fit attributes 'Ipswich' to 'championship', not 'epl': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "epl",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Alaves",
     "value": 1690.3768,
     "lo": 1656.4918,
     "hi": 1724.2619,
     "half_width_95": 33.885,
     "bridge_fixtures": 4,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.5454,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "laliga",
     "tier": 4,
     "tier_set": [
      3,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Athletic Club",
     "value": 1697.2997,
     "lo": 1660.6902,
     "hi": 1733.9092,
     "half_width_95": 36.6095,
     "bridge_fixtures": 23,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 6,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.5892,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "laliga",
     "tier": 3,
     "tier_set": [
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atletico Madrid",
     "value": 1851.1936,
     "lo": 1809.4947,
     "hi": 1892.8925,
     "half_width_95": 41.6989,
     "bridge_fixtures": 30,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.6712,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "laliga",
     "tier": 1,
     "tier_set": [
      1
     ],
     "straddles": false
    },
    {
     "club": "Atlanta United FC",
     "value": 1483.2711,
     "lo": 1450.6156,
     "hi": 1515.9267,
     "half_width_95": 32.6555,
     "bridge_fixtures": 8,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 1.0764,
     "placeable_in_a_quintile_of_its_own_league": false,
     "column": "mls",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Austin",
     "value": 1559.7354,
     "lo": 1527.5049,
     "hi": 1591.9659,
     "half_width_95": 32.2305,
     "bridge_fixtures": 6,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 1.0624,
     "placeable_in_a_quintile_of_its_own_league": false,
     "column": "mls",
     "tier": 4,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "CF Montreal",
     "value": 1484.2508,
     "lo": 1452.8218,
     "hi": 1515.6799,
     "half_width_95": 31.4291,
     "bridge_fixtures": 4,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 1.036,
     "placeable_in_a_quintile_of_its_own_league": false,
     "column": "mls",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Atlas",
     "value": 1529.0746,
     "lo": 1480.9934,
     "hi": 1577.1557,
     "half_width_95": 48.0811,
     "bridge_fixtures": 8,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 1.294,
     "placeable_in_a_quintile_of_its_own_league": false,
     "column": "ligamx",
     "tier": 3,
     "tier_set": [
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atletico San Luis",
     "value": 1481.7314,
     "lo": 1445.7333,
     "hi": 1517.7294,
     "half_width_95": 35.9981,
     "bridge_fixtures": 7,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.9688,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "ligamx",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "CF Pachuca",
     "value": 1624.9871,
     "lo": 1576.528,
     "hi": 1673.4463,
     "half_width_95": 48.4592,
     "bridge_fixtures": 17,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 1.3041,
     "placeable_in_a_quintile_of_its_own_league": false,
     "column": "ligamx",
     "tier": 2,
     "tier_set": [
      1,
      2,
      3
     ],
     "straddles": true
    },
    {
     "club": "1. FC Köln",
     "value": 1611.1678,
     "lo": 1569.8939,
     "hi": 1652.4417,
     "half_width_95": 41.2739,
     "bridge_fixtures": 4,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.7999,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "bundesliga",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "1899 Hoffenheim",
     "value": 1743.1426,
     "lo": 1707.6692,
     "hi": 1778.6159,
     "half_width_95": 35.4734,
     "bridge_fixtures": 11,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.6875,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "bundesliga",
     "tier": 2,
     "tier_set": [
      2,
      3
     ],
     "straddles": true
    },
    {
     "club": "Bayer Leverkusen",
     "value": 1840.2239,
     "lo": 1794.5495,
     "hi": 1885.8983,
     "half_width_95": 45.6744,
     "bridge_fixtures": 24,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.8852,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "bundesliga",
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "AC Milan",
     "value": 1754.0203,
     "lo": 1719.7713,
     "hi": 1788.2693,
     "half_width_95": 34.249,
     "bridge_fixtures": 11,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.6572,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "seriea",
     "tier": 2,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "AS Roma",
     "value": 1793.6486,
     "lo": 1758.0467,
     "hi": 1829.2506,
     "half_width_95": 35.602,
     "bridge_fixtures": 21,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.6831,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "seriea",
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "Atalanta",
     "value": 1747.1919,
     "lo": 1700.657,
     "hi": 1793.7267,
     "half_width_95": 46.5349,
     "bridge_fixtures": 23,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.8929,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "seriea",
     "tier": 2,
     "tier_set": [
      1,
      2,
      3
     ],
     "straddles": true
    },
    {
     "club": "Angers",
     "value": 1622.3182,
     "lo": 1585.0274,
     "hi": 1659.609,
     "half_width_95": 37.2908,
     "bridge_fixtures": 3,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.7277,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "ligue1",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Auxerre",
     "value": 1647.2459,
     "lo": 1610.6729,
     "hi": 1683.8188,
     "half_width_95": 36.573,
     "bridge_fixtures": 1,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.7137,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "ligue1",
     "tier": 4,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Le Havre",
     "value": 1623.5203,
     "lo": 1587.0839,
     "hi": 1659.9567,
     "half_width_95": 36.4364,
     "bridge_fixtures": 2,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.7111,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "ligue1",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "ADO Den Haag",
     "value": 1322.5101,
     "lo": 1307.4822,
     "hi": 1337.538,
     "half_width_95": 15.0279,
     "bridge_fixtures": 0,
     "bridged": false,
     "evidence_warning": "ZERO BRIDGE FIXTURES — this narrow bar means the OPPOSITE of confidence; read bridge_fixtures, not half_width_95",
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.2892,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "AZ Alkmaar",
     "value": 1698.7207,
     "lo": 1650.6247,
     "hi": 1746.8166,
     "half_width_95": 48.0959,
     "bridge_fixtures": 31,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.9255,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "eredivisie",
     "tier": 2,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "Ajax",
     "value": 1705.4362,
     "lo": 1656.2907,
     "hi": 1754.5817,
     "half_width_95": 49.1455,
     "bridge_fixtures": 26,
     "bridged": true,
     "evidence_warning": null,
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.9457,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "eredivisie",
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "Cambuur",
     "value": 1422.8266,
     "lo": 1398.3712,
     "hi": 1447.2821,
     "half_width_95": 24.4555,
     "bridge_fixtures": 0,
     "bridged": false,
     "evidence_warning": "ZERO BRIDGE FIXTURES — this narrow bar means the OPPOSITE of confidence; read bridge_fixtures, not half_width_95",
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.4706,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Sparta Rotterdam",
     "value": 1561.5278,
     "lo": 1524.131,
     "hi": 1598.9246,
     "half_width_95": 37.3968,
     "bridge_fixtures": 0,
     "bridged": false,
     "evidence_warning": "ZERO BRIDGE FIXTURES — this narrow bar means the OPPOSITE of confidence; read bridge_fixtures, not half_width_95",
     "below_floor": false,
     "floor_refusal": null,
     "floor_failing_condition": null,
     "jackknife_replicates": 200,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "quintiles_spanned_own_league": 0.7196,
     "placeable_in_a_quintile_of_its_own_league": true,
     "column": "eredivisie",
     "tier": 4,
     "tier_set": [
      3,
      4,
      5
     ],
     "straddles": true
    }
   ],
   "scale": "Elo, 1500 start, K=20, +65 home term, 10-PASS chain. Comparable ONLY inside a connected component: read `ladder`."
  },
  "attack": {
   "columns": {
    "epl": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 4,
     "value_min": 0.146699,
     "value_max": 0.919545,
     "n_clubs": 18,
     "median_half_width_95": 0.273018,
     "median_half_width_95_bridged_only": 0.273018,
     "distinguishable_levels_all_clubs": 1.42,
     "distinguishable_levels_bridged_only": 1.42,
     "cut_against": "the 18 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "laliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": 0.045561,
     "value_max": 1.1341,
     "n_clubs": 17,
     "median_half_width_95": 0.255484,
     "median_half_width_95_bridged_only": 0.255484,
     "distinguishable_levels_all_clubs": 2.13,
     "distinguishable_levels_bridged_only": 2.13,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "mls": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": -0.085749,
     "value_max": 0.736011,
     "n_clubs": 30,
     "median_half_width_95": 0.436465,
     "median_half_width_95_bridged_only": 0.436465,
     "distinguishable_levels_all_clubs": 0.94,
     "distinguishable_levels_bridged_only": 0.94,
     "cut_against": "the 30 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligamx": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": -0.185815,
     "value_max": 0.414813,
     "n_clubs": 17,
     "median_half_width_95": 0.303961,
     "median_half_width_95_bridged_only": 0.303961,
     "distinguishable_levels_all_clubs": 0.99,
     "distinguishable_levels_bridged_only": 0.99,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "bundesliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": 0.121418,
     "value_max": 1.293022,
     "n_clubs": 15,
     "median_half_width_95": 0.279098,
     "median_half_width_95_bridged_only": 0.279098,
     "distinguishable_levels_all_clubs": 2.1,
     "distinguishable_levels_bridged_only": 2.1,
     "cut_against": "the 15 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "seriea": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": -0.339952,
     "value_max": 0.842949,
     "n_clubs": 19,
     "median_half_width_95": 0.301419,
     "median_half_width_95_bridged_only": 0.301419,
     "distinguishable_levels_all_clubs": 1.96,
     "distinguishable_levels_bridged_only": 1.96,
     "cut_against": "the 19 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligue1": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": -0.123688,
     "value_max": 0.792466,
     "n_clubs": 16,
     "median_half_width_95": 0.320534,
     "median_half_width_95_bridged_only": 0.320534,
     "distinguishable_levels_all_clubs": 1.43,
     "distinguishable_levels_bridged_only": 1.43,
     "cut_against": "the 16 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "eredivisie": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 4,
     "value_min": -0.118396,
     "value_max": 0.879939,
     "n_clubs": 16,
     "median_half_width_95": 0.279151,
     "median_half_width_95_bridged_only": 0.27803,
     "distinguishable_levels_all_clubs": 1.79,
     "distinguishable_levels_bridged_only": 1.8,
     "cut_against": "the 16 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    }
   },
   "rows": [
    {
     "club": "Arsenal",
     "value": 0.830139,
     "lo": 0.613512,
     "hi": 1.046766,
     "half_width_95": 0.216627,
     "bridge_fixtures": 36,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.315143,
      "low": 2.149526,
      "means": "scored",
      "point": 2.669454
     },
     "column": "epl",
     "tier": 1,
     "tier_set": [
      1,
      2
     ],
     "straddles": true
    },
    {
     "club": "Aston Villa",
     "value": 0.614408,
     "lo": 0.308929,
     "hi": 0.919886,
     "half_width_95": 0.305479,
     "bridge_fixtures": 28,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.92011,
      "low": 1.585126,
      "means": "scored",
      "point": 2.151451
     },
     "column": "epl",
     "tier": 2,
     "tier_set": [
      1,
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Bournemouth",
     "value": 0.654686,
     "lo": 0.383718,
     "hi": 0.925654,
     "half_width_95": 0.270968,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.937001,
      "low": 1.708221,
      "means": "scored",
      "point": 2.239877
     },
     "column": "epl",
     "tier": 2,
     "tier_set": [
      1,
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Ipswich",
     "value": 0.146699,
     "lo": -0.185226,
     "hi": 0.478625,
     "half_width_95": 0.331925,
     "bridge_fixtures": 5,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.878286,
      "low": 0.967064,
      "means": "scored",
      "point": 1.347747
     },
     "column": "epl",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Alaves",
     "value": 0.382808,
     "lo": 0.084668,
     "hi": 0.680949,
     "half_width_95": 0.298141,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.299482,
      "low": 1.266684,
      "means": "scored",
      "point": 1.706669
     },
     "column": "laliga",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Athletic Club",
     "value": 0.361818,
     "lo": 0.026675,
     "hi": 0.696961,
     "half_width_95": 0.335143,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 6,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.336599,
      "low": 1.195315,
      "means": "scored",
      "point": 1.671219
     },
     "column": "laliga",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atletico Madrid",
     "value": 0.714314,
     "lo": 0.472877,
     "hi": 0.955752,
     "half_width_95": 0.241437,
     "bridge_fixtures": 30,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.026741,
      "low": 1.867521,
      "means": "scored",
      "point": 2.377499
     },
     "column": "laliga",
     "tier": 1,
     "tier_set": [
      1,
      3
     ],
     "straddles": true
    },
    {
     "club": "Atlanta United FC",
     "value": -0.085749,
     "lo": -0.595804,
     "hi": 0.424307,
     "half_width_95": 0.510055,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.778982,
      "low": 0.641421,
      "means": "scored",
      "point": 1.068212
     },
     "column": "mls",
     "tier": 5,
     "tier_set": [
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Austin",
     "value": 0.148491,
     "lo": -0.286342,
     "hi": 0.583324,
     "half_width_95": 0.434833,
     "bridge_fixtures": 6,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.085605,
      "low": 0.874059,
      "means": "scored",
      "point": 1.350164
     },
     "column": "mls",
     "tier": 4,
     "tier_set": [
      1,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "CF Montreal",
     "value": 0.036896,
     "lo": -0.487137,
     "hi": 0.560929,
     "half_width_95": 0.524033,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.039417,
      "low": 0.71505,
      "means": "scored",
      "point": 1.207595
     },
     "column": "mls",
     "tier": 5,
     "tier_set": [
      1,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atlas",
     "value": -0.033944,
     "lo": -0.358444,
     "hi": 0.290557,
     "half_width_95": 0.324501,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.55627,
      "low": 0.813256,
      "means": "scored",
      "point": 1.125009
     },
     "column": "ligamx",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atletico San Luis",
     "value": 0.166593,
     "lo": -0.142085,
     "hi": 0.47527,
     "half_width_95": 0.308677,
     "bridge_fixtures": 7,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.871996,
      "low": 1.009697,
      "means": "scored",
      "point": 1.374827
     },
     "column": "ligamx",
     "tier": 3,
     "tier_set": [
      1,
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "CF Pachuca",
     "value": 0.099567,
     "lo": -0.209306,
     "hi": 0.40844,
     "half_width_95": 0.308873,
     "bridge_fixtures": 17,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.750978,
      "low": 0.944055,
      "means": "scored",
      "point": 1.285698
     },
     "column": "ligamx",
     "tier": 3,
     "tier_set": [
      1,
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "1. FC Köln",
     "value": 0.406367,
     "lo": 0.127269,
     "hi": 0.685465,
     "half_width_95": 0.279098,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.309889,
      "low": 1.321813,
      "means": "scored",
      "point": 1.747353
     },
     "column": "bundesliga",
     "tier": 3,
     "tier_set": [
      2,
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "1899 Hoffenheim",
     "value": 0.678104,
     "lo": 0.40998,
     "hi": 0.946228,
     "half_width_95": 0.268124,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.998054,
      "low": 1.753678,
      "means": "scored",
      "point": 2.292951
     },
     "column": "bundesliga",
     "tier": 2,
     "tier_set": [
      1,
      2,
      3
     ],
     "straddles": true
    },
    {
     "club": "Bayer Leverkusen",
     "value": 0.71798,
     "lo": 0.47806,
     "hi": 0.9579,
     "half_width_95": 0.23992,
     "bridge_fixtures": 24,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.033252,
      "low": 1.877225,
      "means": "scored",
      "point": 2.386231
     },
     "column": "bundesliga",
     "tier": 1,
     "tier_set": [
      1,
      3
     ],
     "straddles": true
    },
    {
     "club": "AC Milan",
     "value": 0.322892,
     "lo": 0.065942,
     "hi": 0.579842,
     "half_width_95": 0.25695,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.078356,
      "low": 1.243185,
      "means": "scored",
      "point": 1.607414
     },
     "column": "seriea",
     "tier": 2,
     "tier_set": [
      1,
      2,
      4
     ],
     "straddles": true
    },
    {
     "club": "AS Roma",
     "value": 0.425822,
     "lo": 0.176211,
     "hi": 0.675433,
     "half_width_95": 0.249611,
     "bridge_fixtures": 21,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.286833,
      "low": 1.388114,
      "means": "scored",
      "point": 1.78168
     },
     "column": "seriea",
     "tier": 1,
     "tier_set": [
      1,
      3
     ],
     "straddles": true
    },
    {
     "club": "Atalanta",
     "value": 0.285475,
     "lo": 0.005851,
     "hi": 0.565099,
     "half_width_95": 0.279624,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.047938,
      "low": 1.170682,
      "means": "scored",
      "point": 1.548381
     },
     "column": "seriea",
     "tier": 2,
     "tier_set": [
      1,
      2,
      4
     ],
     "straddles": true
    },
    {
     "club": "Angers",
     "value": -0.123688,
     "lo": -0.503281,
     "hi": 0.255906,
     "half_width_95": 0.379594,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.503267,
      "low": 0.703599,
      "means": "scored",
      "point": 1.028444
     },
     "column": "ligue1",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Auxerre",
     "value": 0.030907,
     "lo": -0.36052,
     "hi": 0.422335,
     "half_width_95": 0.391427,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.775478,
      "low": 0.811569,
      "means": "scored",
      "point": 1.200385
     },
     "column": "ligue1",
     "tier": 5,
     "tier_set": [
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Le Havre",
     "value": -0.029843,
     "lo": -0.404244,
     "hi": 0.344558,
     "half_width_95": 0.374401,
     "bridge_fixtures": 2,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.642621,
      "low": 0.77685,
      "means": "scored",
      "point": 1.129633
     },
     "column": "ligue1",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "AZ Alkmaar",
     "value": 0.329408,
     "lo": 0.093374,
     "hi": 0.565442,
     "half_width_95": 0.236034,
     "bridge_fixtures": 31,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.048643,
      "low": 1.27776,
      "means": "scored",
      "point": 1.617923
     },
     "column": "eredivisie",
     "tier": 2,
     "tier_set": [
      1,
      2,
      4
     ],
     "straddles": true
    },
    {
     "club": "Ajax",
     "value": 0.389148,
     "lo": 0.148797,
     "hi": 0.629499,
     "half_width_95": 0.240351,
     "bridge_fixtures": 26,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.184165,
      "low": 1.350577,
      "means": "scored",
      "point": 1.717522
     },
     "column": "eredivisie",
     "tier": 1,
     "tier_set": [
      1,
      4
     ],
     "straddles": true
    },
    {
     "club": "Excelsior",
     "value": 0.034661,
     "lo": -0.306987,
     "hi": 0.376309,
     "half_width_95": 0.341648,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.695612,
      "low": 0.8562,
      "means": "scored",
      "point": 1.204899
     },
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Sparta Rotterdam",
     "value": -0.031367,
     "lo": -0.366727,
     "hi": 0.303994,
     "half_width_95": 0.335361,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.577323,
      "low": 0.806548,
      "means": "scored",
      "point": 1.127912
     },
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      3,
      5
     ],
     "straddles": true
    }
   ],
   "scale": "log-goals. Expected goals SCORED against an average cross-league defence at a neutral venue, logged. Higher is better."
  },
  "defence": {
   "columns": {
    "epl": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 4,
     "value_min": 0.166116,
     "value_max": 1.186643,
     "n_clubs": 18,
     "median_half_width_95": 0.275651,
     "median_half_width_95_bridged_only": 0.275651,
     "distinguishable_levels_all_clubs": 1.85,
     "distinguishable_levels_bridged_only": 1.85,
     "cut_against": "the 18 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "laliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": 0.031026,
     "value_max": 0.569613,
     "n_clubs": 17,
     "median_half_width_95": 0.264305,
     "median_half_width_95_bridged_only": 0.264305,
     "distinguishable_levels_all_clubs": 1.02,
     "distinguishable_levels_bridged_only": 1.02,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "mls": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": -0.294845,
     "value_max": 0.811082,
     "n_clubs": 30,
     "median_half_width_95": 0.429797,
     "median_half_width_95_bridged_only": 0.429797,
     "distinguishable_levels_all_clubs": 1.29,
     "distinguishable_levels_bridged_only": 1.29,
     "cut_against": "the 30 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligamx": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": -0.169844,
     "value_max": 0.488019,
     "n_clubs": 17,
     "median_half_width_95": 0.322882,
     "median_half_width_95_bridged_only": 0.322882,
     "distinguishable_levels_all_clubs": 1.02,
     "distinguishable_levels_bridged_only": 1.02,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "bundesliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": 0.075018,
     "value_max": 0.715665,
     "n_clubs": 15,
     "median_half_width_95": 0.286483,
     "median_half_width_95_bridged_only": 0.286483,
     "distinguishable_levels_all_clubs": 1.12,
     "distinguishable_levels_bridged_only": 1.12,
     "cut_against": "the 15 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "seriea": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": -0.041462,
     "value_max": 0.727502,
     "n_clubs": 19,
     "median_half_width_95": 0.312712,
     "median_half_width_95_bridged_only": 0.312712,
     "distinguishable_levels_all_clubs": 1.23,
     "distinguishable_levels_bridged_only": 1.23,
     "cut_against": "the 19 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligue1": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 3,
     "value_min": 0.105269,
     "value_max": 0.789194,
     "n_clubs": 16,
     "median_half_width_95": 0.342458,
     "median_half_width_95_bridged_only": 0.342458,
     "distinguishable_levels_all_clubs": 1.0,
     "distinguishable_levels_bridged_only": 1.0,
     "cut_against": "the 16 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "eredivisie": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 4,
     "value_min": -0.367007,
     "value_max": 0.192305,
     "n_clubs": 16,
     "median_half_width_95": 0.297458,
     "median_half_width_95_bridged_only": 0.297185,
     "distinguishable_levels_all_clubs": 0.94,
     "distinguishable_levels_bridged_only": 0.94,
     "cut_against": "the 16 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    }
   },
   "rows": [
    {
     "club": "Arsenal",
     "value": 1.186643,
     "lo": 0.790309,
     "hi": 1.582977,
     "half_width_95": 0.396334,
     "bridge_fixtures": 36,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.528045,
      "low": 0.239012,
      "means": "conceded",
      "point": 0.355259
     },
     "column": "epl",
     "tier": 1,
     "tier_set": [
      1
     ],
     "straddles": false
    },
    {
     "club": "Aston Villa",
     "value": 0.604372,
     "lo": 0.301874,
     "hi": 0.906869,
     "half_width_95": 0.302497,
     "bridge_fixtures": 28,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.860588,
      "low": 0.469947,
      "means": "conceded",
      "point": 0.635949
     },
     "column": "epl",
     "tier": 2,
     "tier_set": [
      1,
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Bournemouth",
     "value": 0.504883,
     "lo": 0.214106,
     "hi": 0.79566,
     "half_width_95": 0.290777,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.939534,
      "low": 0.525227,
      "means": "conceded",
      "point": 0.702473
     },
     "column": "epl",
     "tier": 4,
     "tier_set": [
      1,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Ipswich",
     "value": 0.166116,
     "lo": -0.079012,
     "hi": 0.411244,
     "half_width_95": 0.245128,
     "bridge_fixtures": 5,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.259541,
      "low": 0.77143,
      "means": "conceded",
      "point": 0.985722
     },
     "column": "epl",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Alaves",
     "value": 0.132446,
     "lo": -0.13186,
     "hi": 0.396751,
     "half_width_95": 0.264305,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.327895,
      "low": 0.782692,
      "means": "conceded",
      "point": 1.019477
     },
     "column": "laliga",
     "tier": 4,
     "tier_set": [
      1,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Athletic Club",
     "value": 0.098292,
     "lo": -0.12409,
     "hi": 0.320675,
     "half_width_95": 0.222382,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 6,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.317618,
      "low": 0.84456,
      "means": "conceded",
      "point": 1.054897
     },
     "column": "laliga",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atletico Madrid",
     "value": 0.355692,
     "lo": 0.064672,
     "hi": 0.646712,
     "half_width_95": 0.29102,
     "bridge_fixtures": 30,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.090965,
      "low": 0.609585,
      "means": "conceded",
      "point": 0.815497
     },
     "column": "laliga",
     "tier": 2,
     "tier_set": [
      1,
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atlanta United FC",
     "value": 0.040257,
     "lo": -0.319654,
     "hi": 0.400169,
     "half_width_95": 0.359912,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.602218,
      "low": 0.780021,
      "means": "conceded",
      "point": 1.117929
     },
     "column": "mls",
     "tier": 4,
     "tier_set": [
      1,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Austin",
     "value": -0.071775,
     "lo": -0.468191,
     "hi": 0.32464,
     "half_width_95": 0.396416,
     "bridge_fixtures": 6,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.85879,
      "low": 0.841217,
      "means": "conceded",
      "point": 1.250459
     },
     "column": "mls",
     "tier": 5,
     "tier_set": [
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "CF Montreal",
     "value": 0.001228,
     "lo": -0.425529,
     "hi": 0.427985,
     "half_width_95": 0.426757,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.781159,
      "low": 0.758624,
      "means": "conceded",
      "point": 1.162424
     },
     "column": "mls",
     "tier": 4,
     "tier_set": [
      1,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atlas",
     "value": 0.069668,
     "lo": -0.276555,
     "hi": 0.415891,
     "half_width_95": 0.346223,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.534632,
      "low": 0.767853,
      "means": "conceded",
      "point": 1.085529
     },
     "column": "ligamx",
     "tier": 3,
     "tier_set": [
      2,
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Atletico San Luis",
     "value": 0.007051,
     "lo": -0.318295,
     "hi": 0.332396,
     "half_width_95": 0.325346,
     "bridge_fixtures": 7,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.600042,
      "low": 0.834718,
      "means": "conceded",
      "point": 1.155675
     },
     "column": "ligamx",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "CF Pachuca",
     "value": 0.44135,
     "lo": 0.146048,
     "hi": 0.736652,
     "half_width_95": 0.295302,
     "bridge_fixtures": 17,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.005704,
      "low": 0.557152,
      "means": "conceded",
      "point": 0.748552
     },
     "column": "ligamx",
     "tier": 1,
     "tier_set": [
      1,
      3
     ],
     "straddles": true
    },
    {
     "club": "1. FC Köln",
     "value": 0.119454,
     "lo": -0.102585,
     "hi": 0.341493,
     "half_width_95": 0.222039,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.289585,
      "low": 0.827159,
      "means": "conceded",
      "point": 1.032808
     },
     "column": "bundesliga",
     "tier": 5,
     "tier_set": [
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "1899 Hoffenheim",
     "value": 0.294766,
     "lo": 0.006367,
     "hi": 0.583165,
     "half_width_95": 0.288399,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.156465,
      "low": 0.64958,
      "means": "conceded",
      "point": 0.866727
     },
     "column": "bundesliga",
     "tier": 3,
     "tier_set": [
      1,
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Bayer Leverkusen",
     "value": 0.392999,
     "lo": 0.099018,
     "hi": 0.68698,
     "half_width_95": 0.293981,
     "bridge_fixtures": 24,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.054131,
      "low": 0.585526,
      "means": "conceded",
      "point": 0.785634
     },
     "column": "bundesliga",
     "tier": 1,
     "tier_set": [
      1,
      5
     ],
     "straddles": true
    },
    {
     "club": "AC Milan",
     "value": 0.552741,
     "lo": 0.15327,
     "hi": 0.952212,
     "half_width_95": 0.399471,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.998466,
      "low": 0.449115,
      "means": "conceded",
      "point": 0.669646
     },
     "column": "seriea",
     "tier": 1,
     "tier_set": [
      1,
      5
     ],
     "straddles": true
    },
    {
     "club": "AS Roma",
     "value": 0.667532,
     "lo": 0.278421,
     "hi": 1.056644,
     "half_width_95": 0.389111,
     "bridge_fixtures": 21,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.88101,
      "low": 0.404579,
      "means": "conceded",
      "point": 0.597024
     },
     "column": "seriea",
     "tier": 1,
     "tier_set": [
      1,
      3
     ],
     "straddles": true
    },
    {
     "club": "Atalanta",
     "value": 0.526786,
     "lo": 0.169702,
     "hi": 0.883869,
     "half_width_95": 0.357083,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.982193,
      "low": 0.480882,
      "means": "conceded",
      "point": 0.687254
     },
     "column": "seriea",
     "tier": 2,
     "tier_set": [
      1,
      2,
      4
     ],
     "straddles": true
    },
    {
     "club": "Angers",
     "value": 0.33871,
     "lo": -0.004696,
     "hi": 0.682115,
     "half_width_95": 0.343405,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.16933,
      "low": 0.588382,
      "means": "conceded",
      "point": 0.829465
     },
     "column": "ligue1",
     "tier": 3,
     "tier_set": [
      1,
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Auxerre",
     "value": 0.419905,
     "lo": 0.092235,
     "hi": 0.747574,
     "half_width_95": 0.327669,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.061305,
      "low": 0.5511,
      "means": "conceded",
      "point": 0.764778
     },
     "column": "ligue1",
     "tier": 2,
     "tier_set": [
      1,
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Le Havre",
     "value": 0.422302,
     "lo": 0.056225,
     "hi": 0.788379,
     "half_width_95": 0.366077,
     "bridge_fixtures": 2,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.10022,
      "low": 0.529065,
      "means": "conceded",
      "point": 0.762947
     },
     "column": "ligue1",
     "tier": 2,
     "tier_set": [
      1,
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "AZ Alkmaar",
     "value": -0.05031,
     "lo": -0.363299,
     "hi": 0.262679,
     "half_width_95": 0.312989,
     "bridge_fixtures": 31,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.673696,
      "low": 0.894989,
      "means": "conceded",
      "point": 1.223903
     },
     "column": "eredivisie",
     "tier": 2,
     "tier_set": [
      1,
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Ajax",
     "value": 0.186409,
     "lo": -0.105576,
     "hi": 0.478395,
     "half_width_95": 0.291986,
     "bridge_fixtures": 26,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.293448,
      "low": 0.721329,
      "means": "conceded",
      "point": 0.96592
     },
     "column": "eredivisie",
     "tier": 1,
     "tier_set": [
      1,
      3
     ],
     "straddles": true
    },
    {
     "club": "Excelsior",
     "value": -0.127813,
     "lo": -0.387222,
     "hi": 0.131595,
     "half_width_95": 0.259408,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.714217,
      "low": 1.020344,
      "means": "conceded",
      "point": 1.322532
     },
     "column": "eredivisie",
     "tier": 4,
     "tier_set": [
      1,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Sparta Rotterdam",
     "value": -0.226637,
     "lo": -0.548457,
     "hi": 0.095182,
     "half_width_95": 0.321819,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 2.014139,
      "low": 1.058182,
      "means": "conceded",
      "point": 1.459906
     },
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      1,
      5
     ],
     "straddles": true
    }
   ],
   "scale": "log-goals. Expected goals CONCEDED against an average cross-league attack at a neutral venue, logged and SIGNED SO THAT HIGHER IS BETTER — a defence value is goals PREVENTED. Arsenal is FIRST on defence, not last. Both goal axes sort descending."
  }
 },
 "provisional": [
  {
   "club": "Deportivo",
   "column": "laliga",
   "status": "provisional_from_live_standings",
   "matches_played": 7,
   "read_this_first": "THIS RATING IS 7 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 1.428571,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 1.142857,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  },
  {
   "club": "Málaga",
   "column": "laliga",
   "status": "provisional_from_live_standings",
   "matches_played": 7,
   "read_this_first": "THIS RATING IS 7 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 0.428571,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 1.714286,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  },
  {
   "club": "Racing Santander",
   "column": "laliga",
   "status": "provisional_from_live_standings",
   "matches_played": 7,
   "read_this_first": "THIS RATING IS 7 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 1.571429,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 3.0,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  },
  {
   "club": "Atlante",
   "column": "ligamx",
   "status": "provisional_from_live_standings",
   "matches_played": 9,
   "read_this_first": "THIS RATING IS 9 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 0.888889,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 1.444444,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  },
  {
   "club": "Schalke 04",
   "column": "bundesliga",
   "status": "provisional_from_live_standings",
   "matches_played": 4,
   "read_this_first": "THIS RATING IS 4 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 0.75,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 1.0,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  },
  {
   "club": "Frosinone",
   "column": "seriea",
   "status": "provisional_from_live_standings",
   "matches_played": 5,
   "read_this_first": "THIS RATING IS 5 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 1.8,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 0.8,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  },
  {
   "club": "Le Mans",
   "column": "ligue1",
   "status": "provisional_from_live_standings",
   "matches_played": 5,
   "read_this_first": "THIS RATING IS 5 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 1.8,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 1.8,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  },
  {
   "club": "Troyes",
   "column": "ligue1",
   "status": "provisional_from_live_standings",
   "matches_played": 5,
   "read_this_first": "THIS RATING IS 5 MATCHES OF EVIDENCE.",
   "what_this_value_is_not": "NOT A FITTED RATING. This is the club's own scoring/conceding rate from the live table, put on the published log-goals convention so it can be read in the same unit — and it is NOT opponent-adjusted, NOT home/away-adjusted, NOT shrunk toward any prior, and carries NO interval. Every measured value in this bundle is all four of those things. Read `evidence.matches_played` before reading the value: on a handful of matches the difference between this number and a fitted one is larger than the difference between the best and worst club in the league.",
   "overall_not_measured": "There is no Elo row for this club and none is derivable from a league table. An Elo rating is a position in a CHAIN OF RESULTS against rated opponents; goals for and against say nothing about who they were against. The one axis this bundle cannot give a provisional value for is this one, and it is named rather than filled.",
   "goals_per_match": {
    "attack": {
     "better": "higher",
     "high": null,
     "low": null,
     "means": "scored",
     "point": 0.8,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    },
    "defence": {
     "better": "lower",
     "high": null,
     "low": null,
     "means": "conceded",
     "point": 2.2,
     "why_no_interval": "no half width on this row, so no exponentiated endpoints; NOT reported as the point estimate twice"
    }
   }
  }
 ],
 "live_ucl_field": {
  "corpus_sha256": "bf58f88facb0378a4e70fd294ba85c96b03521b81720f8b6cc93be349bac5695",
  "passes": "10",
  "same_fit": true
 },
 "not_a_trading_signal": true
};

export const CUPS = {
 "cups": [
  {
   "key": "ucl",
   "aliases": [
    "ucl"
   ],
   "display": "Champions League",
   "passes": "10",
   "corpus_sha256": "bf58f88facb0378a4e70fd294ba85c96b03521b81720f8b6cc93be349bac5695",
   "admitted_leagues": [
    "bundesliga",
    "epl",
    "eredivisie",
    "la-liga",
    "ligue-1",
    "primeira-liga",
    "serie-a"
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
   "below_floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
   "basis": "the 36 entrants of the 2026-27 league phase, on three axes: overall from the Elo measurement, attack and defence from the goals measurement Elo cannot supply.",
   "axes_measured": [
    "overall",
    "attack",
    "defence"
   ],
   "axes": {
    "overall": {
     "label": "overall",
     "unit": "elo",
     "bands": 5,
     "source": "elo",
     "artifact": "research_archive/elo_cups_union_2026-09-23/elo-secondary",
     "passes": "10",
     "rows": [
      {
       "rank": 1,
       "club": "Bayern Munich",
       "league": "bundesliga",
       "league_display": "Bundesliga",
       "board_column": "bundesliga",
       "value": 2063.702955990677,
       "half_width_95": 54.15246901718159,
       "lo": 2009.5504869734953,
       "hi": 2117.8554250078582,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 2,
       "club": "Arsenal",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 2045.7030975513337,
       "half_width_95": 43.10529591550382,
       "lo": 2002.59780163583,
       "hi": 2088.8083934668375,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 3,
       "club": "Manchester City",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 2031.8364676268197,
       "half_width_95": 40.695397954742226,
       "lo": 1991.1410696720775,
       "hi": 2072.5318655815618,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 4,
       "club": "Barcelona",
       "league": "la-liga",
       "league_display": "La Liga",
       "board_column": "laliga",
       "value": 1998.338468584953,
       "half_width_95": 37.938674099392614,
       "lo": 1960.3997944855605,
       "hi": 2036.2771426843456,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 5,
       "club": "Paris Saint-Germain",
       "league": "ligue-1",
       "league_display": "Ligue 1",
       "board_column": "ligue1",
       "value": 1986.6271425853083,
       "half_width_95": 59.17816975038017,
       "lo": 1927.448972834928,
       "hi": 2045.8053123356885,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 6,
       "club": "Aston Villa",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1948.041393534381,
       "half_width_95": 36.98689989813637,
       "lo": 1911.0544936362446,
       "hi": 1985.0282934325176,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 17,
       "club": "Club Brugge",
       "league": null,
       "league_display": null,
       "board_column": null,
       "value": 1810.474776428082,
       "half_width_95": 97.19745857410277,
       "lo": 1713.2773178539792,
       "hi": 1907.6722350021846,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": null
      },
      {
       "rank": 23,
       "club": "Bodo/Glimt",
       "league": "eliteserien",
       "league_display": "Eliteserien",
       "board_column": null,
       "value": 1786.578552849968,
       "half_width_95": 138.9133164853035,
       "lo": 1647.6652363646645,
       "hi": 1925.4918693352715,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": null
      }
     ]
    },
    "attack": {
     "label": "attack",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/goals_cross_league_2026-09-09",
     "rows": [
      {
       "rank": 1,
       "club": "Bayern Munich",
       "league": "bundesliga",
       "league_display": "Bundesliga",
       "board_column": "bundesliga",
       "value": 1.1444968706263052,
       "half_width_95": 0.20437807541351002,
       "lo": 0.9401187952127952,
       "hi": 1.3488749460398153,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": 3.354669545246071
      },
      {
       "rank": 2,
       "club": "Barcelona",
       "league": "la-liga",
       "league_display": "La Liga",
       "board_column": "laliga",
       "value": 1.0406494491805691,
       "half_width_95": 0.19935204315779642,
       "lo": 0.8412974060227727,
       "hi": 1.2400014923383655,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 3.0237743865933053
      },
      {
       "rank": 3,
       "club": "Manchester City",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.9563549905098389,
       "half_width_95": 0.22166363294836616,
       "lo": 0.7346913575614726,
       "hi": 1.178018623458205,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.7793341628664607
      },
      {
       "rank": 4,
       "club": "Arsenal",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.8669493518706866,
       "half_width_95": 0.23662633847746606,
       "lo": 0.6303230133932205,
       "hi": 1.1035756903481526,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.5416303637690043
      },
      {
       "rank": 5,
       "club": "Manchester United",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.8616595674548948,
       "half_width_95": 0.25395044651627685,
       "lo": 0.607709120938618,
       "hi": 1.1156100139711715,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.528221184182394
      },
      {
       "rank": 6,
       "club": "Internazionale",
       "league": "serie-a",
       "league_display": "Serie A",
       "board_column": "seriea",
       "value": 0.8483016139664489,
       "half_width_95": 0.2512032838288809,
       "lo": 0.597098330137568,
       "hi": 1.0995048977953297,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.494673883668225
      },
      {
       "rank": 27,
       "club": "Club Brugge",
       "league": null,
       "league_display": null,
       "board_column": null,
       "value": 0.38643152078393805,
       "half_width_95": 0.33096432562997175,
       "lo": 0.05546719515396631,
       "hi": 0.7173958464139099,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 1.5719044654241496
      },
      {
       "rank": 17,
       "club": "Bodo/Glimt",
       "league": "eliteserien",
       "league_display": "Eliteserien",
       "board_column": null,
       "value": 0.5819782497789964,
       "half_width_95": 0.236296863852482,
       "lo": 0.3456813859265144,
       "hi": 0.8182751136314783,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 1.9113974973567853
      },
      {
       "rank": 22,
       "club": "Viking FK",
       "league": "eliteserien",
       "league_display": "Eliteserien",
       "board_column": null,
       "value": 0.4941082605649051,
       "half_width_95": 0.31230706695762955,
       "lo": 0.18180119360727554,
       "hi": 0.8064153275225346,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 1.7506106314157572
      }
     ]
    },
    "defence": {
     "label": "defence",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/goals_cross_league_2026-09-09",
     "rows": [
      {
       "rank": 1,
       "club": "Arsenal",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1.1491051691398355,
       "half_width_95": 0.3704181241313197,
       "lo": 0.7786870450085158,
       "hi": 1.5195232932711553,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.3384940479480024
      },
      {
       "rank": 2,
       "club": "Manchester City",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.8829269500997903,
       "half_width_95": 0.3669247020076396,
       "lo": 0.5160022480921507,
       "hi": 1.2498516521074299,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.4417237680859219
      },
      {
       "rank": 3,
       "club": "FC Porto",
       "league": "primeira-liga",
       "league_display": "Primeira Liga",
       "board_column": null,
       "value": 0.8823734551806961,
       "half_width_95": 0.4901701529299186,
       "lo": 0.3922033022507775,
       "hi": 1.3725436081106146,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.44196832762218746
      },
      {
       "rank": 4,
       "club": "Paris Saint-Germain",
       "league": "ligue-1",
       "league_display": "Ligue 1",
       "board_column": "ligue1",
       "value": 0.7026257366911585,
       "half_width_95": 0.3832960729634358,
       "lo": 0.31932966372772265,
       "hi": 1.0859218096545944,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.5289986823568436
      },
      {
       "rank": 5,
       "club": "Como",
       "league": "serie-a",
       "league_display": "Serie A",
       "board_column": "seriea",
       "value": 0.6906545032091379,
       "half_width_95": 0.49019048111416846,
       "lo": 0.20046402209496944,
       "hi": 1.1808449843233064,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.535369506321986
      },
      {
       "rank": 6,
       "club": "Borussia Dortmund",
       "league": "bundesliga",
       "league_display": "Bundesliga",
       "board_column": "bundesliga",
       "value": 0.6401332773233889,
       "half_width_95": 0.3469451797144548,
       "lo": 0.29318809760893405,
       "hi": 0.9870784570378437,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.5631119199078066
      },
      {
       "rank": 28,
       "club": "Club Brugge",
       "league": null,
       "league_display": null,
       "board_column": null,
       "value": 0.09065700393810697,
       "half_width_95": 0.19939430708240305,
       "lo": -0.10873730314429608,
       "hi": 0.29005131102051,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 0.9755044031499056
      },
      {
       "rank": 18,
       "club": "Slavia Prague",
       "league": "czech-liga",
       "league_display": "Czech Liga",
       "board_column": null,
       "value": 0.45158742559812515,
       "half_width_95": 0.35955144441453074,
       "lo": 0.0920359811835944,
       "hi": 0.8111388700126558,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 0.6799533902897686
      },
      {
       "rank": 21,
       "club": "Galatasaray",
       "league": "super-lig",
       "league_display": "Süper Lig",
       "board_column": null,
       "value": 0.29599624893281384,
       "half_width_95": 0.35440060462329614,
       "lo": -0.0584043556904823,
       "hi": 0.65039685355611,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 0.7944224945995271
      }
     ]
    }
   },
   "carries_bridge_counts": false
  },
  {
   "key": "campeones",
   "aliases": [
    "leaguescup",
    "campeones"
   ],
   "display": "Leagues Cup · Campeones Cup",
   "passes": "3",
   "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
   "admitted_leagues": [
    "liga-mx",
    "mls"
   ],
   "below_floor_clubs": [],
   "below_floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
   "basis": "every club of MLS and Liga MX on one cross-league scale, on the OVERALL axis alone. Attack and defence are not measured for these two leagues by anything in this repository — the goals artifact holds the 36 Champions League entrants and no club of either — so this field carries one axis and says so, rather than carrying three of which two would be somebody else's.",
   "axes_measured": [
    "overall"
   ],
   "axes": {
    "overall": {
     "label": "overall",
     "unit": "elo",
     "bands": 5,
     "source": "elo",
     "artifact": "research_archive/elo_two_league_2026-09-15",
     "passes": "3",
     "rows": [
      {
       "rank": 1,
       "club": "Cruz Azul",
       "league": "liga-mx",
       "league_display": "Liga MX",
       "board_column": "ligamx",
       "value": 1677.2151375858139,
       "half_width_95": 23.34884669130682,
       "lo": 1653.866290894507,
       "hi": 1700.5639842771207,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 2,
       "club": "Inter Miami",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 1670.701017179858,
       "half_width_95": 32.49078772889447,
       "lo": 1638.2102294509634,
       "hi": 1703.1918049087524,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 3,
       "club": "Los Angeles FC",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 1633.9632351309922,
       "half_width_95": 26.904316434473095,
       "lo": 1607.0589186965192,
       "hi": 1660.8675515654652,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 4,
       "club": "Toluca",
       "league": "liga-mx",
       "league_display": "Liga MX",
       "board_column": "ligamx",
       "value": 1598.7686095495067,
       "half_width_95": 29.849161943467337,
       "lo": 1568.9194476060393,
       "hi": 1628.617771492974,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 5,
       "club": "Vancouver Whitecaps",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 1588.7732897172846,
       "half_width_95": 37.50893154868419,
       "lo": 1551.2643581686004,
       "hi": 1626.2822212659687,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 6,
       "club": "Club America",
       "league": "liga-mx",
       "league_display": "Liga MX",
       "board_column": "ligamx",
       "value": 1586.9306046837976,
       "half_width_95": 23.94536083618529,
       "lo": 1562.9852438476123,
       "hi": 1610.8759655199829,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      }
     ]
    }
   },
   "carries_bridge_counts": false
  },
  {
   "key": "eflcup",
   "aliases": [
    "eflcup"
   ],
   "display": "EFL Cup",
   "passes": "2",
   "corpus_sha256": "c7b35fb63ab9ddfefecbd74c291a600dad09d25d809c546eff86a04b9042bfb2",
   "admitted_leagues": [
    "championship",
    "epl",
    "league-one",
    "league-two"
   ],
   "below_floor_clubs": [],
   "below_floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This club's league did not clear the floor: its median club interval is wider than one band of the field, so the evidence does not place it in a tier. The rating itself stands and is shown — the wide interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
   "basis": "the 94 clubs of the EFL Cup's four English tiers on one cross-tier scale, on the OVERALL axis alone. The corpus held the Championship at 1,114 domestic fixtures and ZERO bridges and held neither lower tier at all; research_archive/efl_bridges_2026-09-15/ adds two seasons of the EFL Cup, the FA Cup and the EFL Trophy and the two missing tiers' own seasons, and all four clear the floor at two passes. Attack and defence are not measured for any English club outside the Premier League by anything in this repository, so this field carries one axis and says so. WHAT THE BRIDGES DO NOT SEPARATE, measured and published rather than left for a reader to notice: the Championship and League One. Over the two seasons in the corpus those two tiers met 36 times and the higher one scored 0.486 — 15 wins, 5 draws, 16 defeats — so the chain puts League One's level at +22.9 Elo and the Championship's at -1.5 at the pinned two passes, and a reading that treats a club being in the higher division as evidence of anything is not reading this field. The other three tier pairs do separate, in the expected direction: 0.824 for the Premier League over the Championship, 0.859 and 0.917 over the two lower tiers, 0.760 for the Championship over League Two and 0.586 for League One over League Two.",
   "axes_measured": [
    "overall"
   ],
   "axes": {
    "overall": {
     "label": "overall",
     "unit": "elo",
     "bands": 5,
     "source": "elo",
     "artifact": "research_archive/elo_efl_tiers_2026-09-15",
     "passes": "2",
     "rows": [
      {
       "rank": 1,
       "club": "Arsenal",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1845.912983000057,
       "half_width_95": 33.16014917338294,
       "lo": 1812.752833826674,
       "hi": 1879.07313217344,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 2,
       "club": "Manchester City",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1827.180495210498,
       "half_width_95": 32.838000880813425,
       "lo": 1794.3424943296845,
       "hi": 1860.0184960913116,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 3,
       "club": "Aston Villa",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1747.363545536788,
       "half_width_95": 27.617501950875496,
       "lo": 1719.7460435859125,
       "hi": 1774.9810474876635,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 4,
       "club": "Manchester United",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1725.8076719064982,
       "half_width_95": 14.604908087291303,
       "lo": 1711.202763819207,
       "hi": 1740.4125799937894,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 5,
       "club": "Lincoln City",
       "league": "league-one",
       "league_display": "League One",
       "board_column": null,
       "value": 1706.301953278875,
       "half_width_95": 14.223822566427902,
       "lo": 1692.078130712447,
       "hi": 1720.525775845303,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      },
      {
       "rank": 6,
       "club": "Liverpool",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1696.3779739479733,
       "half_width_95": 36.02539174233313,
       "lo": 1660.3525822056401,
       "hi": 1732.4033656903064,
       "tier": 2,
       "tier_set": [
        2
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": null
      }
     ]
    }
   },
   "carries_bridge_counts": false
  }
 ],
 "not_a_trading_signal": true
};

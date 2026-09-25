// RECORDED, NOT WRITTEN: the two field-page payloads as the backend
// emits them. RE-RECORDED 2026-09-25 from the backend ship branch
// `be-ship-2026-09-25` @ 7eee6d17 (regenerated at the final tip ef4b16c0
// and byte-identical), generated IN-PROCESS
// (`src.picker.field_page.leagues_payload()` and `cups_payload()`, the
// functions behind GET /api/field/leagues and /api/field/cups, with the
// network blocked for the run). The first recording (branch
// field-page-api, 2026-09-23) went stale on three facts, all of them the
// backend's and none of them edited here:
//   * every cup field now carries THREE axes — the Leagues Cup ·
//     Campeones Cup and EFL Cup fields were overall-only (backend #183
//     measured attack and defence for every club on the union corpus);
//   * a FOURTH cup field, the Europa League (`uel`, backend uel-field);
//   * `below_floor_note` is the corrected BELOW_FLOOR_NOTE (backend
//     ceb7cc30): it names the three floor conditions and no longer
//     claims the club's interval is wider than a placed club's.
// The league field moved to research_archive/goal_axes_every_club_
// 2026-09-24, so its attack and defence rows gained the clubs that were
// unmeasured before.
//
// TRIMMED ONLY BY DROPPING ROWS, by the rule the first recording used —
// three clubs per column in the bundle's own (name) order, plus every
// zero-bridge club and every club rated on another division (read off
// the overall axis); per cup and axis the top six plus Arsenal, Club
// Brugge and the two best-ranked below-floor clubs, where the field
// holds them. No key, value or sentence was edited, so the fixture
// speaks the wire's language. Rows kept: leagues {"overall": 29, "attack": 30, "defence": 30}; cups
// {"ucl": {"overall": 8, "attack": 9, "defence": 9}, "campeones": {"overall": 6, "attack": 6, "defence": 6}, "eflcup": {"overall": 6, "attack": 6, "defence": 6}, "uel": {"overall": 8, "attack": 7, "defence": 8}}. Variants the page must handle and this recording
// does not contain (two ladders, a whole section below the floor,
// absent figures, a cup short of an axis) are DERIVED from these rows in
// e2e/the-field-page.spec.ts, each named.
//
// Regenerate: see the python snippet in that spec's header.
export const LEAGUES = {
 "source": "research_archive/goal_axes_every_club_2026-09-24/league_field/slices.json",
 "slices_sha256": "595010ab60f9409877a66b91c7784ea5ac6e19fbbc9d176495e38c2b1b3b866d",
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
     "n_rows": 20,
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
     "n_rows": 17,
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
     "n_rows": 30,
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
     "n_rows": 17,
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
     "n_rows": 17,
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
     "n_rows": 19,
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
     "n_rows": 16,
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
     "n_rows": 18,
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
     "n_rows": 20,
     "value_min": 0.184084,
     "value_max": 0.956929,
     "n_clubs": 20,
     "median_half_width_95": 0.291233,
     "median_half_width_95_bridged_only": 0.291233,
     "distinguishable_levels_all_clubs": 1.33,
     "distinguishable_levels_bridged_only": 1.33,
     "cut_against": "the 20 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "laliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 17,
     "value_min": 0.057553,
     "value_max": 1.146092,
     "n_clubs": 17,
     "median_half_width_95": 0.255281,
     "median_half_width_95_bridged_only": 0.255281,
     "distinguishable_levels_all_clubs": 2.13,
     "distinguishable_levels_bridged_only": 2.13,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "mls": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 30,
     "value_min": -0.048042,
     "value_max": 0.773717,
     "n_clubs": 30,
     "median_half_width_95": 0.433527,
     "median_half_width_95_bridged_only": 0.433527,
     "distinguishable_levels_all_clubs": 0.95,
     "distinguishable_levels_bridged_only": 0.95,
     "cut_against": "the 30 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligamx": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 17,
     "value_min": -0.148212,
     "value_max": 0.452416,
     "n_clubs": 17,
     "median_half_width_95": 0.30252,
     "median_half_width_95_bridged_only": 0.30252,
     "distinguishable_levels_all_clubs": 0.99,
     "distinguishable_levels_bridged_only": 0.99,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "bundesliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 17,
     "value_min": 0.116046,
     "value_max": 1.287651,
     "n_clubs": 17,
     "median_half_width_95": 0.300276,
     "median_half_width_95_bridged_only": 0.300276,
     "distinguishable_levels_all_clubs": 1.95,
     "distinguishable_levels_bridged_only": 1.95,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "seriea": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 19,
     "value_min": -0.321158,
     "value_max": 0.861743,
     "n_clubs": 19,
     "median_half_width_95": 0.291304,
     "median_half_width_95_bridged_only": 0.291304,
     "distinguishable_levels_all_clubs": 2.03,
     "distinguishable_levels_bridged_only": 2.03,
     "cut_against": "the 19 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligue1": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 16,
     "value_min": -0.109617,
     "value_max": 0.806537,
     "n_clubs": 16,
     "median_half_width_95": 0.328535,
     "median_half_width_95_bridged_only": 0.328535,
     "distinguishable_levels_all_clubs": 1.39,
     "distinguishable_levels_bridged_only": 1.39,
     "cut_against": "the 16 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "eredivisie": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 18,
     "value_min": -0.463713,
     "value_max": 0.830923,
     "n_clubs": 18,
     "median_half_width_95": 0.292067,
     "median_half_width_95_bridged_only": 0.283256,
     "distinguishable_levels_all_clubs": 2.22,
     "distinguishable_levels_bridged_only": 1.76,
     "cut_against": "the 18 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on attack. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    }
   },
   "rows": [
    {
     "club": "Arsenal",
     "value": 0.867523,
     "lo": 0.631637,
     "hi": 1.10341,
     "half_width_95": 0.235886,
     "bridge_fixtures": 36,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.572022,
      "low": 2.228567,
      "means": "scored",
      "point": 2.821434
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
     "value": 0.651792,
     "lo": 0.341745,
     "hi": 0.961839,
     "half_width_95": 0.310047,
     "bridge_fixtures": 28,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.100492,
      "low": 1.667736,
      "means": "scored",
      "point": 2.27394
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
     "value": 0.69207,
     "lo": 0.431339,
     "hi": 0.952802,
     "half_width_95": 0.260732,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.072599,
      "low": 1.824052,
      "means": "scored",
      "point": 2.3674
     },
     "column": "epl",
     "tier": 1,
     "tier_set": [
      1,
      4
     ],
     "straddles": true
    },
    {
     "club": "Ipswich",
     "value": 0.184084,
     "lo": -0.147736,
     "hi": 0.515904,
     "half_width_95": 0.33182,
     "bridge_fixtures": 5,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.985013,
      "low": 1.02223,
      "means": "scored",
      "point": 1.424478
     },
     "column": "epl",
     "tier": 5,
     "tier_set": [
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Coventry",
     "value": 0.529208,
     "lo": 0.225656,
     "hi": 0.832759,
     "half_width_95": 0.303551,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.725034,
      "low": 1.484946,
      "means": "scored",
      "point": 2.011598
     },
     "rated_on_another_division": "The fit attributes 'Coventry' to 'championship', not 'epl': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "epl",
     "tier": 3,
     "tier_set": [
      1,
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "Hull City",
     "value": 0.204589,
     "lo": -0.091686,
     "hi": 0.500865,
     "half_width_95": 0.296275,
     "bridge_fixtures": 2,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.955384,
      "low": 1.081161,
      "means": "scored",
      "point": 1.453989
     },
     "rated_on_another_division": "The fit attributes 'Hull City' to 'championship', not 'epl': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
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
     "value": 0.3948,
     "lo": 0.090448,
     "hi": 0.699153,
     "half_width_95": 0.304352,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.384226,
      "low": 1.29715,
      "means": "scored",
      "point": 1.758607
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
     "value": 0.37381,
     "lo": 0.072677,
     "hi": 0.674944,
     "half_width_95": 0.301133,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 6,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.327199,
      "low": 1.274303,
      "means": "scored",
      "point": 1.722079
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
     "value": 0.726306,
     "lo": 0.487138,
     "hi": 0.965474,
     "half_width_95": 0.239168,
     "bridge_fixtures": 30,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.111784,
      "low": 1.928727,
      "means": "scored",
      "point": 2.449853
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
     "value": -0.048042,
     "lo": -0.544709,
     "hi": 0.448625,
     "half_width_95": 0.496667,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.855857,
      "low": 0.687298,
      "means": "scored",
      "point": 1.129392
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
     "value": 0.186198,
     "lo": -0.286016,
     "hi": 0.658411,
     "half_width_95": 0.472213,
     "bridge_fixtures": 6,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.28904,
      "low": 0.890214,
      "means": "scored",
      "point": 1.427492
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
     "value": 0.074603,
     "lo": -0.486919,
     "hi": 0.636125,
     "half_width_95": 0.561522,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.23859,
      "low": 0.728187,
      "means": "scored",
      "point": 1.276758
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
     "value": 0.003659,
     "lo": -0.342159,
     "hi": 0.349477,
     "half_width_95": 0.345818,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.680681,
      "low": 0.841611,
      "means": "scored",
      "point": 1.189319
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
     "value": 0.204196,
     "lo": -0.098324,
     "hi": 0.506716,
     "half_width_95": 0.30252,
     "bridge_fixtures": 7,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.966858,
      "low": 1.074009,
      "means": "scored",
      "point": 1.453418
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
     "value": 0.13717,
     "lo": -0.163302,
     "hi": 0.437642,
     "half_width_95": 0.300472,
     "bridge_fixtures": 17,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.835586,
      "low": 1.00644,
      "means": "scored",
      "point": 1.359194
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
     "value": 0.400996,
     "lo": 0.133005,
     "hi": 0.668986,
     "half_width_95": 0.267991,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.313376,
      "low": 1.353544,
      "means": "scored",
      "point": 1.769536
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
     "value": 0.672733,
     "lo": 0.413826,
     "hi": 0.93164,
     "half_width_95": 0.258907,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.008259,
      "low": 1.792387,
      "means": "scored",
      "point": 2.32206
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
     "value": 0.712609,
     "lo": 0.443283,
     "hi": 0.981934,
     "half_width_95": 0.269325,
     "bridge_fixtures": 24,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.163427,
      "low": 1.84597,
      "means": "scored",
      "point": 2.416525
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
     "value": 0.341686,
     "lo": 0.106368,
     "hi": 0.577004,
     "half_width_95": 0.235318,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.110081,
      "low": 1.317966,
      "means": "scored",
      "point": 1.667638
     },
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
     "club": "AS Roma",
     "value": 0.444616,
     "lo": 0.20762,
     "hi": 0.681612,
     "half_width_95": 0.236996,
     "bridge_fixtures": 21,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.342769,
      "low": 1.458403,
      "means": "scored",
      "point": 1.848433
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
     "value": 0.304269,
     "lo": 0.019449,
     "hi": 0.589089,
     "half_width_95": 0.28482,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.135735,
      "low": 1.208248,
      "means": "scored",
      "point": 1.606393
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
     "value": -0.109617,
     "lo": -0.494364,
     "hi": 0.275131,
     "half_width_95": 0.384747,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.56026,
      "low": 0.722786,
      "means": "scored",
      "point": 1.061948
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
     "value": 0.044978,
     "lo": -0.337394,
     "hi": 0.427351,
     "half_width_95": 0.382373,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.816793,
      "low": 0.845631,
      "means": "scored",
      "point": 1.23949
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
     "value": -0.015771,
     "lo": -0.380847,
     "hi": 0.349304,
     "half_width_95": 0.365076,
     "bridge_fixtures": 2,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.68039,
      "low": 0.809673,
      "means": "scored",
      "point": 1.166433
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
     "value": 0.280393,
     "lo": 0.023542,
     "hi": 0.537244,
     "half_width_95": 0.256851,
     "bridge_fixtures": 31,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.027828,
      "low": 1.213202,
      "means": "scored",
      "point": 1.568492
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
     "value": 0.340132,
     "lo": 0.105103,
     "hi": 0.575161,
     "half_width_95": 0.235029,
     "bridge_fixtures": 26,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.106195,
      "low": 1.3163,
      "means": "scored",
      "point": 1.665048
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
     "value": -0.014355,
     "lo": -0.359556,
     "hi": 0.330847,
     "half_width_95": 0.345202,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.64966,
      "low": 0.827096,
      "means": "scored",
      "point": 1.168087
     },
     "column": "eredivisie",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Sparta Rotterdam",
     "value": -0.080382,
     "lo": -0.439317,
     "hi": 0.278552,
     "half_width_95": 0.358935,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 1.565608,
      "low": 0.763689,
      "means": "scored",
      "point": 1.093452
     },
     "column": "eredivisie",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "ADO Den Haag",
     "value": -0.298241,
     "lo": -1.546531,
     "hi": 0.950049,
     "half_width_95": 1.24829,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 3.064152,
      "low": 0.252383,
      "means": "scored",
      "point": 0.879397
     },
     "rated_on_another_division": "The fit attributes 'ADO Den Haag' to 'eerste-divisie', not 'eredivisie': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      1,
      5
     ],
     "straddles": true
    },
    {
     "club": "Cambuur",
     "value": -0.463713,
     "lo": -1.720445,
     "hi": 0.793019,
     "half_width_95": 1.256732,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "higher",
      "high": 2.618865,
      "low": 0.212095,
      "means": "scored",
      "point": 0.745283
     },
     "rated_on_another_division": "The fit attributes 'Cambuur' to 'eerste-divisie', not 'eredivisie': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      1,
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
     "n_rows": 20,
     "value_min": -0.073222,
     "value_max": 1.228426,
     "n_clubs": 20,
     "median_half_width_95": 0.291852,
     "median_half_width_95_bridged_only": 0.291852,
     "distinguishable_levels_all_clubs": 2.23,
     "distinguishable_levels_bridged_only": 2.23,
     "cut_against": "the 20 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "laliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 17,
     "value_min": 0.060262,
     "value_max": 0.598849,
     "n_clubs": 17,
     "median_half_width_95": 0.261818,
     "median_half_width_95_bridged_only": 0.261818,
     "distinguishable_levels_all_clubs": 1.03,
     "distinguishable_levels_bridged_only": 1.03,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "mls": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 30,
     "value_min": -0.245421,
     "value_max": 0.860506,
     "n_clubs": 30,
     "median_half_width_95": 0.430926,
     "median_half_width_95_bridged_only": 0.430926,
     "distinguishable_levels_all_clubs": 1.28,
     "distinguishable_levels_bridged_only": 1.28,
     "cut_against": "the 30 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligamx": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 17,
     "value_min": -0.118085,
     "value_max": 0.539778,
     "n_clubs": 17,
     "median_half_width_95": 0.309007,
     "median_half_width_95_bridged_only": 0.309007,
     "distinguishable_levels_all_clubs": 1.06,
     "distinguishable_levels_bridged_only": 1.06,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "bundesliga": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 17,
     "value_min": 0.015495,
     "value_max": 0.762296,
     "n_clubs": 17,
     "median_half_width_95": 0.276781,
     "median_half_width_95_bridged_only": 0.276781,
     "distinguishable_levels_all_clubs": 1.35,
     "distinguishable_levels_bridged_only": 1.35,
     "cut_against": "the 17 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "seriea": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 19,
     "value_min": -0.009959,
     "value_max": 0.759005,
     "n_clubs": 19,
     "median_half_width_95": 0.329013,
     "median_half_width_95_bridged_only": 0.329013,
     "distinguishable_levels_all_clubs": 1.17,
     "distinguishable_levels_bridged_only": 1.17,
     "cut_against": "the 19 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "ligue1": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 16,
     "value_min": 0.137133,
     "value_max": 0.821058,
     "n_clubs": 16,
     "median_half_width_95": 0.351961,
     "median_half_width_95_bridged_only": 0.351961,
     "distinguishable_levels_all_clubs": 0.97,
     "distinguishable_levels_bridged_only": 0.97,
     "cut_against": "the 16 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    },
    "eredivisie": {
     "measured": true,
     "unit": "log-goals",
     "n_rows": 18,
     "value_min": -0.572668,
     "value_max": 0.193584,
     "n_clubs": 18,
     "median_half_width_95": 0.308081,
     "median_half_width_95_bridged_only": 0.299703,
     "distinguishable_levels_all_clubs": 1.24,
     "distinguishable_levels_bridged_only": 0.93,
     "cut_against": "the 18 CURRENT-SEASON clubs of this slice only — a WITHIN-LEAGUE quintile on defence. Inside one league the cross-league level is a CONSTANT shared by every row, so this cut is drawn entirely on the clubs' own domestic deviations"
    }
   },
   "rows": [
    {
     "club": "Arsenal",
     "value": 1.228426,
     "lo": 0.815245,
     "hi": 1.641608,
     "half_width_95": 0.413181,
     "bridge_fixtures": 36,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.524388,
      "low": 0.229492,
      "means": "conceded",
      "point": 0.346905
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
     "value": 0.646155,
     "lo": 0.349737,
     "hi": 0.942572,
     "half_width_95": 0.296418,
     "bridge_fixtures": 28,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.835257,
      "low": 0.461695,
      "means": "conceded",
      "point": 0.620995
     },
     "column": "epl",
     "tier": 1,
     "tier_set": [
      1,
      5
     ],
     "straddles": true
    },
    {
     "club": "Bournemouth",
     "value": 0.546666,
     "lo": 0.245259,
     "hi": 0.848073,
     "half_width_95": 0.301407,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.927246,
      "low": 0.507453,
      "means": "conceded",
      "point": 0.685954
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
     "value": 0.207899,
     "lo": -0.032708,
     "hi": 0.448505,
     "half_width_95": 0.240606,
     "bridge_fixtures": 5,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.224374,
      "low": 0.756704,
      "means": "conceded",
      "point": 0.962543
     },
     "column": "epl",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Coventry",
     "value": 0.224292,
     "lo": -0.100152,
     "hi": 0.548736,
     "half_width_95": 0.324444,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.309799,
      "low": 0.684536,
      "means": "conceded",
      "point": 0.946892
     },
     "rated_on_another_division": "The fit attributes 'Coventry' to 'championship', not 'epl': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "epl",
     "tier": 5,
     "tier_set": [
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "Hull City",
     "value": -0.073222,
     "lo": -0.397997,
     "hi": 0.251552,
     "half_width_95": 0.324774,
     "bridge_fixtures": 2,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.764237,
      "low": 0.921429,
      "means": "conceded",
      "point": 1.274998
     },
     "rated_on_another_division": "The fit attributes 'Hull City' to 'championship', not 'epl': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "epl",
     "tier": 5,
     "tier_set": [
      5
     ],
     "straddles": false
    },
    {
     "club": "Alaves",
     "value": 0.161682,
     "lo": -0.100136,
     "hi": 0.4235,
     "half_width_95": 0.261818,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.309779,
      "low": 0.775864,
      "means": "conceded",
      "point": 1.008073
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
     "value": 0.127528,
     "lo": -0.099774,
     "hi": 0.354831,
     "half_width_95": 0.227302,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 6,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.309304,
      "low": 0.831014,
      "means": "conceded",
      "point": 1.043096
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
     "value": 0.384928,
     "lo": 0.095471,
     "hi": 0.674386,
     "half_width_95": 0.289457,
     "bridge_fixtures": 30,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.077077,
      "low": 0.603709,
      "means": "conceded",
      "point": 0.806375
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
     "value": 0.089682,
     "lo": -0.271501,
     "hi": 0.450864,
     "half_width_95": 0.361182,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.554607,
      "low": 0.754921,
      "means": "conceded",
      "point": 1.083331
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
     "value": -0.022351,
     "lo": -0.387061,
     "hi": 0.342359,
     "half_width_95": 0.36471,
     "bridge_fixtures": 6,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.74505,
      "low": 0.841443,
      "means": "conceded",
      "point": 1.211759
     },
     "column": "mls",
     "tier": 5,
     "tier_set": [
      3,
      5
     ],
     "straddles": true
    },
    {
     "club": "CF Montreal",
     "value": 0.050652,
     "lo": -0.351163,
     "hi": 0.452467,
     "half_width_95": 0.401815,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 26,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.683517,
      "low": 0.753712,
      "means": "conceded",
      "point": 1.126449
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
     "value": 0.121427,
     "lo": -0.18758,
     "hi": 0.430434,
     "half_width_95": 0.309007,
     "bridge_fixtures": 8,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.429468,
      "low": 0.770502,
      "means": "conceded",
      "point": 1.04948
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
     "value": 0.05881,
     "lo": -0.238642,
     "hi": 0.356262,
     "half_width_95": 0.297452,
     "bridge_fixtures": 7,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.504355,
      "low": 0.829826,
      "means": "conceded",
      "point": 1.117297
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
     "value": 0.493109,
     "lo": 0.208136,
     "hi": 0.778082,
     "half_width_95": 0.284973,
     "bridge_fixtures": 17,
     "bridged": true,
     "games_played": 9,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.962314,
      "low": 0.544243,
      "means": "conceded",
      "point": 0.723694
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
     "value": 0.166085,
     "lo": -0.051845,
     "hi": 0.384014,
     "half_width_95": 0.21793,
     "bridge_fixtures": 4,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.248031,
      "low": 0.807112,
      "means": "conceded",
      "point": 1.003644
     },
     "column": "bundesliga",
     "tier": 4,
     "tier_set": [
      2,
      4,
      5
     ],
     "straddles": true
    },
    {
     "club": "1899 Hoffenheim",
     "value": 0.341397,
     "lo": 0.091485,
     "hi": 0.591308,
     "half_width_95": 0.249912,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.081379,
      "low": 0.656005,
      "means": "conceded",
      "point": 0.842253
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
     "value": 0.43963,
     "lo": 0.135663,
     "hi": 0.743596,
     "half_width_95": 0.303967,
     "bridge_fixtures": 24,
     "bridged": true,
     "games_played": 4,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.034645,
      "low": 0.563338,
      "means": "conceded",
      "point": 0.76345
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
     "value": 0.584244,
     "lo": 0.186199,
     "hi": 0.98229,
     "half_width_95": 0.398046,
     "bridge_fixtures": 11,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.983658,
      "low": 0.443717,
      "means": "conceded",
      "point": 0.660656
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
     "value": 0.699036,
     "lo": 0.313723,
     "hi": 1.084348,
     "half_width_95": 0.385313,
     "bridge_fixtures": 21,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.865887,
      "low": 0.400666,
      "means": "conceded",
      "point": 0.589009
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
     "value": 0.558289,
     "lo": 0.222944,
     "hi": 0.893634,
     "half_width_95": 0.335345,
     "bridge_fixtures": 23,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 0.948169,
      "low": 0.484852,
      "means": "conceded",
      "point": 0.678028
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
     "value": 0.370573,
     "lo": 0.021819,
     "hi": 0.719328,
     "half_width_95": 0.348754,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.1594,
      "low": 0.577177,
      "means": "conceded",
      "point": 0.818034
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
     "value": 0.451769,
     "lo": 0.115813,
     "hi": 0.787724,
     "half_width_95": 0.335955,
     "bridge_fixtures": 1,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.055388,
      "low": 0.53902,
      "means": "conceded",
      "point": 0.754238
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
     "value": 0.454166,
     "lo": 0.061498,
     "hi": 0.846833,
     "half_width_95": 0.392667,
     "bridge_fixtures": 2,
     "bridged": true,
     "games_played": 5,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.114297,
      "low": 0.508083,
      "means": "conceded",
      "point": 0.752433
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
     "value": -0.049031,
     "lo": -0.348734,
     "hi": 0.250673,
     "half_width_95": 0.299703,
     "bridge_fixtures": 31,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.679432,
      "low": 0.922239,
      "means": "conceded",
      "point": 1.244523
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
     "value": 0.187689,
     "lo": -0.102579,
     "hi": 0.477956,
     "half_width_95": 0.290267,
     "bridge_fixtures": 26,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.312981,
      "low": 0.734743,
      "means": "conceded",
      "point": 0.982194
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
     "value": -0.126534,
     "lo": -0.38333,
     "hi": 0.130262,
     "half_width_95": 0.256796,
     "bridge_fixtures": 3,
     "bridged": true,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 1.73855,
      "low": 1.040248,
      "means": "conceded",
      "point": 1.344814
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
     "value": -0.225357,
     "lo": -0.54056,
     "hi": 0.089846,
     "half_width_95": 0.315203,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 2.034566,
      "low": 1.083153,
      "means": "conceded",
      "point": 1.484502
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
     "club": "ADO Den Haag",
     "value": -0.357153,
     "lo": -0.799386,
     "hi": 0.08508,
     "half_width_95": 0.442233,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 2.635591,
      "low": 1.088327,
      "means": "conceded",
      "point": 1.69363
     },
     "rated_on_another_division": "The fit attributes 'ADO Den Haag' to 'eerste-divisie', not 'eredivisie': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      2,
      5
     ],
     "straddles": true
    },
    {
     "club": "Cambuur",
     "value": -0.572668,
     "lo": -1.006131,
     "hi": -0.139206,
     "half_width_95": 0.433462,
     "bridge_fixtures": 0,
     "bridged": false,
     "games_played": 7,
     "ladder": "A",
     "component": 0,
     "goals_per_match": {
      "better": "lower",
      "high": 3.240905,
      "low": 1.361964,
      "means": "conceded",
      "point": 2.100951
     },
     "rated_on_another_division": "The fit attributes 'Cambuur' to 'eerste-divisie', not 'eredivisie': this club is in the current season of this column and its rating is of the division it came up from. Reached through a measured or reviewed join, never through bare exactness.",
     "column": "eredivisie",
     "tier": 5,
     "tier_set": [
      4,
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
   "below_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
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
   "below_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
   "basis": "every club of MLS and Liga MX on one cross-league scale, on three axes: overall from the Elo measurement of the two leagues' own component at three passes, attack and defence from the goals measurement on the union corpus — each club's own MLS or Liga MX round-robin plus its league's level, placed by the bridges, with the club's own 95% interval. The two measurements are separate fits on separate corpora, so the overall axis and the goal axes carry no shared pass count and are not one scale.",
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
    },
    "attack": {
     "label": "attack",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/goal_axes_every_club_2026-09-24/cup_fields",
     "rows": [
      {
       "rank": 1,
       "club": "FC Cincinnati",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.773717,
       "half_width_95": 0.395326,
       "lo": 0.378391,
       "hi": 1.169043,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.5688
      },
      {
       "rank": 2,
       "club": "Inter Miami",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.717289,
       "half_width_95": 0.382977,
       "lo": 0.33431199999999994,
       "hi": 1.100266,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.427862
      },
      {
       "rank": 3,
       "club": "Vancouver Whitecaps",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.714853,
       "half_width_95": 0.432837,
       "lo": 0.28201599999999993,
       "hi": 1.1476899999999999,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.421954
      },
      {
       "rank": 4,
       "club": "Portland Timbers",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.604472,
       "half_width_95": 0.434216,
       "lo": 0.17025600000000002,
       "hi": 1.038688,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.168842
      },
      {
       "rank": 5,
       "club": "FC Dallas",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.589161,
       "half_width_95": 0.415709,
       "lo": 0.17345200000000005,
       "hi": 1.00487,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.135889
      },
      {
       "rank": 6,
       "club": "San Jose Earthquakes",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.546306,
       "half_width_95": 0.408074,
       "lo": 0.13823199999999997,
       "hi": 0.95438,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.046289
      }
     ]
    },
    "defence": {
     "label": "defence",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/goal_axes_every_club_2026-09-24/cup_fields",
     "rows": [
      {
       "rank": 1,
       "club": "Nashville SC",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.860506,
       "half_width_95": 0.588386,
       "lo": 0.27212000000000003,
       "hi": 1.4488919999999998,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.501183
      },
      {
       "rank": 2,
       "club": "Vancouver Whitecaps",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.74202,
       "half_width_95": 0.487904,
       "lo": 0.254116,
       "hi": 1.229924,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.564228
      },
      {
       "rank": 3,
       "club": "Los Angeles FC",
       "league": "mls",
       "league_display": "MLS",
       "board_column": "mls",
       "value": 0.716142,
       "half_width_95": 0.693416,
       "lo": 0.022725999999999913,
       "hi": 1.409558,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.579019
      },
      {
       "rank": 4,
       "club": "Toluca",
       "league": "liga-mx",
       "league_display": "Liga MX",
       "board_column": "ligamx",
       "value": 0.539778,
       "half_width_95": 0.346823,
       "lo": 0.192955,
       "hi": 0.886601,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.690696
      },
      {
       "rank": 5,
       "club": "Tigres UANL",
       "league": "liga-mx",
       "league_display": "Liga MX",
       "board_column": "ligamx",
       "value": 0.534473,
       "half_width_95": 0.312421,
       "lo": 0.22205199999999997,
       "hi": 0.846894,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.69437
      },
      {
       "rank": 6,
       "club": "CF Pachuca",
       "league": "liga-mx",
       "league_display": "Liga MX",
       "board_column": "ligamx",
       "value": 0.493109,
       "half_width_95": 0.284973,
       "lo": 0.20813600000000004,
       "hi": 0.7780819999999999,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.723694
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
   "below_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
   "basis": "the 94 clubs of the EFL Cup's four English tiers on one cross-tier scale, on three axes. Attack and defence come from the goals measurement on the union corpus, which fits a round-robin for every one of the four tiers — League One's and League Two's since 2026-09-24, when a definition the goals fit had bound at import stopped leaving both tiers attributed and unfitted — each club with its own 95% interval. The overall axis is the Elo measurement below, on its own corpus. The corpus held the Championship at 1,114 domestic fixtures and ZERO bridges and held neither lower tier at all; research_archive/efl_bridges_2026-09-15/ adds two seasons of the EFL Cup, the FA Cup and the EFL Trophy and the two missing tiers' own seasons, and all four clear the floor at two passes. WHAT THE BRIDGES DO NOT SEPARATE, measured and published rather than left for a reader to notice: the Championship and League One. Over the two seasons in the corpus those two tiers met 36 times and the higher one scored 0.486 — 15 wins, 5 draws, 16 defeats — so the chain puts League One's level at +22.9 Elo and the Championship's at -1.5 at the pinned two passes, and a reading that treats a club being in the higher division as evidence of anything is not reading this field. The other three tier pairs do separate, in the expected direction: 0.824 for the Premier League over the Championship, 0.859 and 0.917 over the two lower tiers, 0.760 for the Championship over League Two and 0.586 for League One over League Two.",
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
    },
    "attack": {
     "label": "attack",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/goal_axes_every_club_2026-09-24/cup_fields",
     "rows": [
      {
       "rank": 1,
       "club": "Manchester City",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.956929,
       "half_width_95": 0.225783,
       "lo": 0.7311460000000001,
       "hi": 1.182712,
       "tier": 1,
       "tier_set": [
        1
       ],
       "straddles": false,
       "below_floor": false,
       "floor_note": null,
       "rate": 3.085306
      },
      {
       "rank": 2,
       "club": "Arsenal",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.867523,
       "half_width_95": 0.235886,
       "lo": 0.631637,
       "hi": 1.103409,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.821434
      },
      {
       "rank": 3,
       "club": "Manchester United",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.862234,
       "half_width_95": 0.228375,
       "lo": 0.633859,
       "hi": 1.090609,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.806549
      },
      {
       "rank": 4,
       "club": "Liverpool",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.774018,
       "half_width_95": 0.23145,
       "lo": 0.5425679999999999,
       "hi": 1.005468,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.569573
      },
      {
       "rank": 5,
       "club": "Bournemouth",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.69207,
       "half_width_95": 0.260732,
       "lo": 0.43133799999999994,
       "hi": 0.9528019999999999,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.3674
      },
      {
       "rank": 6,
       "club": "Chelsea",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.690032,
       "half_width_95": 0.288589,
       "lo": 0.401443,
       "hi": 0.978621,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.362579
      }
     ]
    },
    "defence": {
     "label": "defence",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/goal_axes_every_club_2026-09-24/cup_fields",
     "rows": [
      {
       "rank": 1,
       "club": "Arsenal",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1.228426,
       "half_width_95": 0.413181,
       "lo": 0.815245,
       "hi": 1.641607,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.346905
      },
      {
       "rank": 2,
       "club": "Manchester City",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.962248,
       "half_width_95": 0.344377,
       "lo": 0.6178710000000001,
       "hi": 1.306625,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.4527
      },
      {
       "rank": 3,
       "club": "Brighton",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.71353,
       "half_width_95": 0.280608,
       "lo": 0.432922,
       "hi": 0.994138,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.580533
      },
      {
       "rank": 4,
       "club": "Sunderland",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.680877,
       "half_width_95": 0.359053,
       "lo": 0.32182399999999994,
       "hi": 1.03993,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.599802
      },
      {
       "rank": 5,
       "club": "Aston Villa",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.646155,
       "half_width_95": 0.296418,
       "lo": 0.349737,
       "hi": 0.9425730000000001,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.620995
      },
      {
       "rank": 6,
       "club": "Everton",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.63497,
       "half_width_95": 0.355835,
       "lo": 0.279135,
       "hi": 0.990805,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.62798
      }
     ]
    }
   },
   "carries_bridge_counts": false
  },
  {
   "key": "uel",
   "aliases": [
    "uel"
   ],
   "display": "Europa League",
   "passes": "10",
   "corpus_sha256": "0dbb69159e0bb0cf2d1fb9fe8b3f4947723f1997173ae07328361a4fcd7b914f",
   "admitted_leagues": [
    "arg-primera",
    "belgian-pro-league",
    "brasileirao",
    "bulgarian-first-league",
    "bundesliga",
    "championship",
    "cypriot-first-division",
    "czech-liga",
    "ekstraklasa",
    "eliteserien",
    "epl",
    "greek-super-league",
    "hungarian-nb-i",
    "israeli-premier-league",
    "la-liga",
    "league-one",
    "league-two",
    "liga-mx",
    "ligue-1",
    "mls",
    "primeira-liga",
    "scottish-premiership",
    "serie-a",
    "super-lig",
    "usl-championship"
   ],
   "below_floor_clubs": [
    "AZ Alkmaar",
    "Ararat-Armenia",
    "Celje",
    "Dinamo Zagreb",
    "NEC Nijmegen",
    "Red Bull Salzburg",
    "Sturm Graz"
   ],
   "below_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
   "basis": "the 36 entrants of the 2026-27 Europa League league phase, on three axes, on a corpus of the field's own: the union corpus the other fields use plus the domestic seasons of the sixteen leagues its entrants play in that the union corpus lacks (ESPN where ESPN carries them, API-Football for Poland, Croatia, Hungary, Bulgaria, Slovenia, Armenia, Czechia, Israel, Cyprus and Liga Portugal 2) and the 2026 UEFA ties before the first league-phase kickoff. Overall is the Elo chain at ten passes; attack and defence are the goals measurement on the same corpus, each club with its own 95% interval. Seven clubs are below the floor: Armenia and Slovenia clear it at no pass count, and the Austrian Bundesliga, the HNL and the Eredivisie clear it at five and not at ten, the pin the preregistered rule picks. Torreense's Elo is filed under the Primeira Liga by its two promotion play-off fixtures, while its attack and defence are read on its own 2025-26 Liga Portugal 2 round-robin. Lillestrom played no UEFA tie in the window and is placed by Eliteserien 2026 alone. This field is its own measurement and is never merged with or ranked against another cup's.",
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
     "artifact": "research_archive/uel_field_2026-09-24/elo",
     "passes": "10",
     "rows": [
      {
       "rank": 1,
       "club": "Bournemouth",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1935.2092710057561,
       "half_width_95": 24.87596605705554,
       "lo": 1910.3333049487005,
       "hi": 1960.0852370628118,
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
       "club": "Bayer Leverkusen",
       "league": "bundesliga",
       "league_display": "Bundesliga",
       "board_column": "bundesliga",
       "value": 1867.5178116999539,
       "half_width_95": 40.864686115599284,
       "lo": 1826.6531255843547,
       "hi": 1908.382497815553,
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
       "rank": 3,
       "club": "Benfica",
       "league": "primeira-liga",
       "league_display": "Primeira Liga",
       "board_column": null,
       "value": 1864.0759456377305,
       "half_width_95": 63.36089463646278,
       "lo": 1800.7150510012677,
       "hi": 1927.4368402741932,
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
       "club": "Crystal Palace",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 1847.0046545860812,
       "half_width_95": 44.97698872438745,
       "lo": 1802.0276658616938,
       "hi": 1891.9816433104686,
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
       "club": "Juventus",
       "league": "serie-a",
       "league_display": "Serie A",
       "board_column": "seriea",
       "value": 1816.8818685477722,
       "half_width_95": 37.03471990418977,
       "lo": 1779.8471486435824,
       "hi": 1853.916588451962,
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
       "club": "Union St. Gilloise",
       "league": "belgian-pro-league",
       "league_display": "Belgian Pro League",
       "board_column": null,
       "value": 1816.7116636612448,
       "half_width_95": 50.55972934446362,
       "lo": 1766.151934316781,
       "hi": 1867.2713930057084,
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
       "rank": 17,
       "club": "Dinamo Zagreb",
       "league": "croatian-hnl",
       "league_display": "HNL",
       "board_column": null,
       "value": 1745.9949110985995,
       "half_width_95": 57.400360683543894,
       "lo": 1688.5945504150557,
       "hi": 1803.3952717821433,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": null
      },
      {
       "rank": 19,
       "club": "AZ Alkmaar",
       "league": "eredivisie",
       "league_display": "Eredivisie",
       "board_column": "eredivisie",
       "value": 1726.1255723339991,
       "half_width_95": 51.195077454088754,
       "lo": 1674.9304948799104,
       "hi": 1777.3206497880878,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": null
      }
     ]
    },
    "attack": {
     "label": "attack",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/uel_field_2026-09-24",
     "rows": [
      {
       "rank": 1,
       "club": "Bayer Leverkusen",
       "league": "bundesliga",
       "league_display": "Bundesliga",
       "board_column": "bundesliga",
       "value": 0.87020212140355,
       "half_width_95": 0.2546758955808226,
       "lo": 0.6155262258227274,
       "hi": 1.1248780169843726,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.656459435608012
      },
      {
       "rank": 2,
       "club": "Bournemouth",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.8520537034841369,
       "half_width_95": 0.2742715304349052,
       "lo": 0.5777821730492316,
       "hi": 1.1263252339190422,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.6086837375486738
      },
      {
       "rank": 3,
       "club": "1899 Hoffenheim",
       "league": "bundesliga",
       "league_display": "Bundesliga",
       "board_column": "bundesliga",
       "value": 0.8303264845792255,
       "half_width_95": 0.25137734805233597,
       "lo": 0.5789491365268895,
       "hi": 1.0817038326315616,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.5526156029125633
      },
      {
       "rank": 4,
       "club": "Real Sociedad",
       "league": "la-liga",
       "league_display": "La Liga",
       "board_column": "laliga",
       "value": 0.8266284561701811,
       "half_width_95": 0.2182028506906532,
       "lo": 0.6084256054795278,
       "hi": 1.0448313068608344,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.5431933904380446
      },
      {
       "rank": 5,
       "club": "Marseille",
       "league": "ligue-1",
       "league_display": "Ligue 1",
       "board_column": "ligue1",
       "value": 0.8031555458179224,
       "half_width_95": 0.3264704088508412,
       "lo": 0.47668513696708115,
       "hi": 1.1296259546687635,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 2.484192411315543
      },
      {
       "rank": 6,
       "club": "NEC Nijmegen",
       "league": "eredivisie",
       "league_display": "Eredivisie",
       "board_column": "eredivisie",
       "value": 0.7945754396676018,
       "half_width_95": 0.22113376466150514,
       "lo": 0.5734416750060967,
       "hi": 1.015709204329107,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 2.462968956678057
      },
      {
       "rank": 12,
       "club": "AZ Alkmaar",
       "league": "eredivisie",
       "league_display": "Eredivisie",
       "board_column": "eredivisie",
       "value": 0.5077857406897034,
       "half_width_95": 0.23749748317367136,
       "lo": 0.270288257516032,
       "hi": 0.7452832238633748,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 1.8488758693517349
      }
     ]
    },
    "defence": {
     "label": "defence",
     "unit": "log_goals",
     "bands": 5,
     "source": "goals",
     "artifact": "research_archive/uel_field_2026-09-24",
     "rows": [
      {
       "rank": 1,
       "club": "Sunderland",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.8344221157236874,
       "half_width_95": 0.32336789133271066,
       "lo": 0.5110542243909768,
       "hi": 1.157790007056398,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.4830524494659596
      },
      {
       "rank": 2,
       "club": "Union St. Gilloise",
       "league": "belgian-pro-league",
       "league_display": "Belgian Pro League",
       "board_column": null,
       "value": 0.7839872273521401,
       "half_width_95": 0.41907548506947,
       "lo": 0.3649117422826701,
       "hi": 1.2030627124216102,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.5080399707974826
      },
      {
       "rank": 3,
       "club": "Crystal Palace",
       "league": "epl",
       "league_display": "Premier League",
       "board_column": "epl",
       "value": 0.7746712118249217,
       "half_width_95": 0.28503517425308994,
       "lo": 0.4896360375718318,
       "hi": 1.0597063860780116,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.5127949935970785
      },
      {
       "rank": 4,
       "club": "Olympiakos Piraeus",
       "league": "greek-super-league",
       "league_display": "Greek Super League",
       "board_column": null,
       "value": 0.7404616059796536,
       "half_width_95": 0.537788773692366,
       "lo": 0.2026728322872876,
       "hi": 1.2782503796720195,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.5306410205864963
      },
      {
       "rank": 5,
       "club": "Juventus",
       "league": "serie-a",
       "league_display": "Serie A",
       "board_column": "seriea",
       "value": 0.7253486362658992,
       "half_width_95": 0.3021425003851698,
       "lo": 0.42320613588072936,
       "hi": 1.027491136651069,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.5387214883932138
      },
      {
       "rank": 6,
       "club": "AC Milan",
       "league": "serie-a",
       "league_display": "Serie A",
       "board_column": "seriea",
       "value": 0.7054623392412784,
       "half_width_95": 0.3860317353692564,
       "lo": 0.31943060387202205,
       "hi": 1.0914940746105348,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "straddles": true,
       "below_floor": false,
       "floor_note": null,
       "rate": 0.5495418962587907
      },
      {
       "rank": 16,
       "club": "Dinamo Zagreb",
       "league": "croatian-hnl",
       "league_display": "HNL",
       "board_column": null,
       "value": 0.21235392396670877,
       "half_width_95": 0.38660200679473533,
       "lo": -0.17424808282802656,
       "hi": 0.598955930761444,
       "tier": 3,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 0.8998188187343202
      },
      {
       "rank": 20,
       "club": "Sturm Graz",
       "league": "austrian-bundesliga",
       "league_display": "Austrian Bundesliga",
       "board_column": null,
       "value": 0.14609296569323743,
       "half_width_95": 0.391078896944653,
       "lo": -0.24498593125141555,
       "hi": 0.5371718626378904,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "straddles": true,
       "below_floor": true,
       "floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
       "rate": 0.9614613713456832
      }
     ]
    }
   },
   "carries_bridge_counts": false
  }
 ],
 "not_a_trading_signal": true
};

/* THE CAMPEONES CUP BOARD, OFF THE EMITTER — not off a brief.
 *
 * Inter Miami CF v Cruz Azul, ESPN `campeones.cup` event 401901377, the
 * first fixture of `tables.FOLDED_INTO_COLUMNS`: a competition with ROWS
 * AND NO COLUMN, drawn in the MLS and Liga MX columns instead.
 *
 * HOW THIS FILE WAS MADE. `board.assemble_board(date="20260916", days=1)`
 * was run on backend PR #136 (`campeones-cup-cross-league`, f1b0f79) with
 * ESPN's own event payload, the two canned member tables whose tier
 * triples reproduce the live ones, and a past-window sweep so the form
 * strips are derived by the backend's OWN parser rather than typed here.
 * The result is below verbatim. A fixture written in the code's
 * vocabulary instead of the feed's is how six bugs shipped in one week,
 * so nothing in it was hand-authored.
 *
 * THE ONE EDIT, NAMED. Every kickoff was moved from the real
 * `2026-09-17T00:00Z` to `2026-12-11T00:00Z` — the same shape ESPN
 * serves, `YYYY-MM-DDTHH:MMZ`, no seconds — so this spec does not rot
 * the way `decision-safety.spec.ts` did when its fixture settled
 * (AGENTS.md §6). `generated_at` and `date` moved with it. Nothing else
 * is touched: the refusal's `club: null`, `columns`, `sides`, `refusal
 * .detail.no_field`, `reg_time_note` and `kalshi: null` are the wire's.
 *
 * The four rated rows are ordinary league fixtures, one per drawn
 * column, so the refused card is measured BESIDE a ranked one in both
 * columns it rides in rather than alone on an empty board. */
export const CAMPEONES_BOARD = {
  "generated_at": "2026-12-10T12:00:00Z",
  "date": "20261210",
  "days": 1,
  "leagues": {
    "epl": {
      "src": "current",
      "min_current_gp": 20,
      "clubs": 20,
      "kind": "league",
      "blend_k": 10.0,
      "blend_constant_w": null
    },
    "laliga": {
      "src": "current",
      "min_current_gp": 20,
      "clubs": 20,
      "kind": "league",
      "blend_k": 10.0,
      "blend_constant_w": null
    },
    "mls": {
      "src": "current",
      "min_current_gp": 20,
      "clubs": 20,
      "kind": "league",
      "blend_k": 10.0,
      "blend_constant_w": null
    },
    "ligamx": {
      "src": "current",
      "min_current_gp": 20,
      "clubs": 17,
      "kind": "league",
      "blend_k": 10.0,
      "blend_constant_w": null
    }
  },
  "rows": [
    {
      "refused": false,
      "league": "ligamx",
      "column": "ligamx",
      "columns": [
        "ligamx"
      ],
      "home": "MEX 01",
      "away": "MEX 02",
      "favourite": "MEX 01",
      "opponent": "MEX 02",
      "fav_side": "home",
      "fav_source": "rank",
      "venue_favourite": {
        "refused": false,
        "venue_class": "DOMESTIC",
        "home_side": "home",
        "gdg_gap_abs": 0.2999999999999998,
        "threshold": 0.26311764705882335,
        "threshold_source": "derived",
        "policy": "off",
        "favourite": "MEX 01",
        "side": "home",
        "agrees": true,
        "reason": "favourite_already_at_home",
        "flipped": false
      },
      "resolution": {
        "MEX 01": "exact",
        "MEX 02": "exact"
      },
      "ppg_gap": 0.3999999999999999,
      "gdg_gap": 0.2999999999999998,
      "rank_gap": 2,
      "gp_current": {
        "home": 20,
        "away": 20,
        "min": 20
      },
      "weights": {
        "home": 1.0,
        "away": 1.0,
        "min": 1.0,
        "k": 10.0,
        "constant": null,
        "basis": {
          "home": "current_only",
          "away": "current_only"
        }
      },
      "src": "current",
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
        "opp": 3
      },
      "rates": {
        "ppg": [
          2.3,
          1.9
        ],
        "gf": [
          2.1,
          1.7
        ],
        "ga": [
          0.7,
          0.6
        ],
        "gdg": [
          1.4,
          1.1
        ]
      },
      "own_gdg": {
        "diff": 0.2999999999999998,
        "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
      "event_id": "401800002",
      "competition_id": "401800002",
      "kickoff": "2026-12-11T00:00Z",
      "espn": "mex.1",
      "venue": {
        "name": "Estadio Akron",
        "city": "Zapopan",
        "country": "Mexico"
      },
      "venue_class": {
        "class": "DOMESTIC",
        "home_side": "home"
      },
      "kalshi": null,
      "form": {
        "fav": "D",
        "opp": "L",
        "scope": "Liga MX",
        "scope_is_cup": false
      },
      "current_only": {
        "ppg_gap": 0.3999999999999999,
        "gdg_gap": 0.2999999999999998,
        "rank_gap": 2
      }
    },
    {
      "refused": false,
      "league": "mls",
      "column": "mls",
      "columns": [
        "mls"
      ],
      "home": "MLS 01",
      "away": "MLS 02",
      "favourite": "MLS 01",
      "opponent": "MLS 02",
      "fav_side": "home",
      "fav_source": "rank",
      "venue_favourite": {
        "refused": false,
        "venue_class": "DOMESTIC",
        "home_side": "home",
        "gdg_gap_abs": 0.19999999999999996,
        "threshold": 0.44474399999999964,
        "threshold_source": "derived",
        "policy": "off",
        "favourite": "MLS 01",
        "side": "home",
        "agrees": true,
        "reason": "favourite_already_at_home",
        "flipped": false
      },
      "resolution": {
        "MLS 01": "exact",
        "MLS 02": "exact"
      },
      "ppg_gap": 0.10000000000000009,
      "gdg_gap": 0.19999999999999996,
      "rank_gap": 1,
      "gp_current": {
        "home": 20,
        "away": 20,
        "min": 20
      },
      "weights": {
        "home": 1.0,
        "away": 1.0,
        "min": 1.0,
        "k": 10.0,
        "constant": null,
        "basis": {
          "home": "current_only",
          "away": "current_only"
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
        "fav": 1,
        "opp": 2
      },
      "rates": {
        "ppg": [
          3.0,
          2.9
        ],
        "gf": [
          2.9,
          2.8
        ],
        "ga": [
          1.2,
          1.3
        ],
        "gdg": [
          1.7,
          1.5
        ]
      },
      "own_gdg": {
        "diff": 0.19999999999999996,
        "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
          2
        ]
      },
      "tier_gaps": {
        "ovr": 0,
        "atk": 0,
        "def": 1
      },
      "shape": "SPLIT",
      "event_id": "401800001",
      "competition_id": "401800001",
      "kickoff": "2026-12-11T00:00Z",
      "espn": "usa.1",
      "venue": {
        "name": "Q2 Stadium",
        "city": "Austin, Texas",
        "country": "USA"
      },
      "venue_class": {
        "class": "DOMESTIC",
        "home_side": "home"
      },
      "kalshi": null,
      "form": {
        "fav": "D",
        "opp": "W",
        "scope": "MLS",
        "scope_is_cup": false
      },
      "current_only": {
        "ppg_gap": 0.10000000000000009,
        "gdg_gap": 0.19999999999999996,
        "rank_gap": 1
      }
    },
    {
      "refused": false,
      "league": "epl",
      "column": "epl",
      "columns": [
        "epl"
      ],
      "home": "EPL 01",
      "away": "EPL 02",
      "favourite": "EPL 01",
      "opponent": "EPL 02",
      "fav_side": "home",
      "fav_source": "rank",
      "venue_favourite": {
        "refused": false,
        "venue_class": "DOMESTIC",
        "home_side": "home",
        "gdg_gap_abs": 0.15000000000000013,
        "threshold": 0.4185449999999997,
        "threshold_source": "derived",
        "policy": "off",
        "favourite": "EPL 01",
        "side": "home",
        "agrees": true,
        "reason": "favourite_already_at_home",
        "flipped": false
      },
      "resolution": {
        "EPL 01": "exact",
        "EPL 02": "exact"
      },
      "ppg_gap": 0.10000000000000009,
      "gdg_gap": 0.15000000000000013,
      "rank_gap": 1,
      "gp_current": {
        "home": 20,
        "away": 20,
        "min": 20
      },
      "weights": {
        "home": 1.0,
        "away": 1.0,
        "min": 1.0,
        "k": 10.0,
        "constant": null,
        "basis": {
          "home": "current_only",
          "away": "current_only"
        }
      },
      "src": "current",
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
        "opp": 3
      },
      "rates": {
        "ppg": [
          2.9,
          2.8
        ],
        "gf": [
          2.65,
          2.55
        ],
        "ga": [
          1.05,
          1.1
        ],
        "gdg": [
          1.6,
          1.45
        ]
      },
      "own_gdg": {
        "diff": 0.15000000000000013,
        "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
      "event_id": "401800003",
      "competition_id": "401800003",
      "kickoff": "2026-12-11T00:00Z",
      "espn": "eng.1",
      "venue": {
        "name": "Anfield",
        "city": "Liverpool",
        "country": "England"
      },
      "venue_class": {
        "class": "DOMESTIC",
        "home_side": "home"
      },
      "kalshi": null,
      "form": {
        "fav": "WWL",
        "opp": null,
        "scope": "EPL",
        "scope_is_cup": false
      },
      "current_only": {
        "ppg_gap": 0.10000000000000009,
        "gdg_gap": 0.15000000000000013,
        "rank_gap": 1
      }
    },
    {
      "refused": false,
      "league": "laliga",
      "column": "laliga",
      "columns": [
        "laliga"
      ],
      "home": "ESP 01",
      "away": "ESP 02",
      "favourite": "ESP 01",
      "opponent": "ESP 02",
      "fav_side": "home",
      "fav_source": "rank",
      "venue_favourite": {
        "refused": false,
        "venue_class": "DOMESTIC",
        "home_side": "home",
        "gdg_gap_abs": 0.15000000000000013,
        "threshold": 0.4185449999999997,
        "threshold_source": "derived",
        "policy": "off",
        "favourite": "ESP 01",
        "side": "home",
        "agrees": true,
        "reason": "favourite_already_at_home",
        "flipped": false
      },
      "resolution": {
        "ESP 01": "exact",
        "ESP 02": "exact"
      },
      "ppg_gap": 0.10000000000000009,
      "gdg_gap": 0.15000000000000013,
      "rank_gap": 1,
      "gp_current": {
        "home": 20,
        "away": 20,
        "min": 20
      },
      "weights": {
        "home": 1.0,
        "away": 1.0,
        "min": 1.0,
        "k": 10.0,
        "constant": null,
        "basis": {
          "home": "current_only",
          "away": "current_only"
        }
      },
      "src": "current",
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
        "opp": 3
      },
      "rates": {
        "ppg": [
          2.9,
          2.8
        ],
        "gf": [
          2.65,
          2.55
        ],
        "ga": [
          1.05,
          1.1
        ],
        "gdg": [
          1.6,
          1.45
        ]
      },
      "own_gdg": {
        "diff": 0.15000000000000013,
        "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
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
      "event_id": "401800004",
      "competition_id": "401800004",
      "kickoff": "2026-12-11T00:00Z",
      "espn": "esp.1",
      "venue": {
        "name": "Mestalla",
        "city": "Valencia",
        "country": "Spain"
      },
      "venue_class": {
        "class": "DOMESTIC",
        "home_side": "home"
      },
      "kalshi": null,
      "form": {
        "fav": "DLW",
        "opp": null,
        "scope": "La Liga",
        "scope_is_cup": false
      },
      "current_only": {
        "ppg_gap": 0.10000000000000009,
        "gdg_gap": 0.15000000000000013,
        "rank_gap": 1
      }
    }
  ],
  "refusals": [
    {
      "refused": true,
      "club": null,
      "reason": "no_shared_scale",
      "home": "Inter Miami CF",
      "away": "Cruz Azul",
      "league": "campeones",
      "column": "mls",
      "columns": [
        "mls",
        "ligamx"
      ],
      "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
      "this_season": null,
      "admission": null,
      "opponent_row": null,
      "sides": {
        "home": {
          "club": "Inter Miami CF",
          "table_club": "Inter Miami CF",
          "resolved_by": "exact",
          "rated": true,
          "rated_in": "mls",
          "table_note": null,
          "ppg": 2.8,
          "gf": 3.1,
          "ga": 2.2,
          "gdg": 0.9,
          "gp_current": 20,
          "rank": 3,
          "of": 20,
          "weight": 1.0,
          "basis": "current_only"
        },
        "away": {
          "club": "Cruz Azul",
          "table_club": "Cruz Azul",
          "resolved_by": "exact",
          "rated": true,
          "rated_in": "ligamx",
          "table_note": null,
          "ppg": 2.2,
          "gf": 2.0,
          "ga": 0.95,
          "gdg": 1.05,
          "gp_current": 20,
          "rank": 2,
          "of": 17,
          "weight": 1.0,
          "basis": "current_only"
        }
      },
      "refusal": {
        "reason": "no_shared_scale",
        "case": "no_shared_scale",
        "why": "BOTH CLUBS ARE RATED, in different leagues, and no field has been measured that puts those leagues on one scale — so there is no ordering that holds them both and nothing to take a favourite from. Each club's own rank, rates and games played are measured on its own league's table and are reported here; the favourite is not. Naming one would mean setting a quintile of one league against a quintile of another and, when those tie, breaking it on the club's name — which is a coin toss with the coin hidden. `refusal.detail.no_field` on this row, and `no_field` on this column's meta, carry the corpus numbers behind the missing field.",
        "carries": [
          "sides"
        ],
        "absent": {
          "this_season": "this block is the REFUSED club's own current season, and this refusal names no club. Both clubs' figures are in `sides`, off the blended table the board ranks on; repeating one of them here on this season alone would be the same club under two names on two weightings, which is how a card comes to contradict itself.",
          "admission": "the admission gate is a promoted club's countdown to having a prior-season row, and neither club is short of it — both are rated. THIS REFUSAL HAS NO COUNTDOWN AT ALL: it ends when somebody measures a field for this competition, not when a club plays more football, and printing a number of games here would promise a date nobody has.",
          "opponent_row": "nothing was refused about one club, so neither of these two is the OPPONENT of the other here — `sides` reports them both, each on its own league's table, and neither is signed against the other."
        },
        "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another.",
        "detail": {
          "no_field": "NO MEASURED FIELD, AND THE CORPUS SAYS WHY ON BOTH AXES IT WOULD NEED. (1) ELO: MLS and Liga MX are in the corpus — 30 and 18 clubs, Inter Miami 1656.2 +/- 27.3 and Cruz Azul 1664.8 +/- 13.4 at the pinned 10-pass estimator — and they are connected to EACH OTHER, forming a 49-club component of their own. They are NOT connected to the reference set at any pass count (components.json: the big-five component holds 14 leagues and neither of these), so condition C1 of the placeability floor fails for both at every pass count in the sweep, and MLS fails C2 as well (league prior-persistence 0.89 at one pass, still 0.59 at twenty — more than half the rating is the 1500 starting constant). (2) ATTACK AND DEFENCE: the goals artifact holds exactly the 36 Champions League entrants across 13 leagues, and neither MLS nor Liga MX is one of them — so two of the three axes a field is defined on have no row for either club, and a field cut on the third alone would not be the object `field_block` publishes. Two clubs' point estimates 8.6 Elo apart with half-widths of 27.3 and 13.4 do not separate in any case: an ordering of them would be an ordering of point estimates presented as a placement."
        }
      },
      "event_id": "401901377",
      "competition_id": "401901377",
      "kickoff": "2026-12-11T00:00Z",
      "espn": "campeones.cup",
      "venue": {
        "name": "Nu Stadium",
        "city": "Miami, Florida",
        "country": "USA"
      },
      "venue_class": {
        "class": "TRUE_HOME",
        "home_side": "home"
      },
      "kalshi": null,
      "form": {
        "home": "WDLWW",
        "away": "WDWLW",
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
  "folded": {
    "campeones": {
      "src": "current",
      "min_current_gp": 20,
      "clubs": 37,
      "kind": "cup",
      "rated_on": [
        "mls",
        "ligamx"
      ],
      "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
      "no_field": "NO MEASURED FIELD, AND THE CORPUS SAYS WHY ON BOTH AXES IT WOULD NEED. (1) ELO: MLS and Liga MX are in the corpus — 30 and 18 clubs, Inter Miami 1656.2 +/- 27.3 and Cruz Azul 1664.8 +/- 13.4 at the pinned 10-pass estimator — and they are connected to EACH OTHER, forming a 49-club component of their own. They are NOT connected to the reference set at any pass count (components.json: the big-five component holds 14 leagues and neither of these), so condition C1 of the placeability floor fails for both at every pass count in the sweep, and MLS fails C2 as well (league prior-persistence 0.89 at one pass, still 0.59 at twenty — more than half the rating is the 1500 starting constant). (2) ATTACK AND DEFENCE: the goals artifact holds exactly the 36 Champions League entrants across 13 leagues, and neither MLS nor Liga MX is one of them — so two of the three axes a field is defined on have no row for either club, and a field cut on the third alone would not be the object `field_block` publishes. Two clubs' point estimates 8.6 Elo apart with half-widths of 27.3 and 13.4 do not separate in any case: an ordering of them would be an ordering of point estimates presented as a placement.",
      "league_levels": {
        "artifact": "research_archive/goals_cross_league_2026-09-09",
        "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
        "mu": 0.06585639874539755,
        "leagues_measured": 13,
        "members_measured": [],
        "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit"
      },
      "no_kalshi_series": "Campeones Cup has no Kalshi series, so there is no book to quote and none was asked for. That is a fact about the market — nobody lists this competition — and not a failed fetch; the rows carry `kalshi: null` as they would for a fixture the book does not name.",
      "folded_into": [
        "ligamx",
        "mls"
      ],
      "fixtures": 0,
      "refusals": 1,
      "off_board": 0
    }
  },
  "capture": {
    "backend": "null",
    "writable": false,
    "stored": 0,
    "already": 0,
    "refused": 4,
    "errors": 0,
    "reasons": [
      "no_store_configured"
    ]
  }
} as const;

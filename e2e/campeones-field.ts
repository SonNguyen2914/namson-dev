/* THE CAMPEONES CUP FIXTURE, RATED ON ITS FIELD — TWICE RECORDED.
 *
 * RE-RECORDED 2026-09-25, AND THE OLD RECORDING KEPT UNDER ITS OWN NAME.
 * Backend #183 measured attack and defence for every club on the union
 * corpus, MLS and Liga MX included, so the field below now carries
 * THREE axes and the row rides under `field`, with a `shape`, exactly as
 * a Champions League row does (`stages.compare_cup` picks the key off
 * the block's own axis set). `CAMPEONES_FIELD_ROW`, `_FOLD` and `_BOARD`
 * are that re-recording, made the same way the first one was (see HOW
 * THIS FILE WAS MADE) on the backend ship branch.
 *
 * `CAMPEONES_PARTIAL_ROW`, `_FOLD` and `_BOARD` are the 2026-09-15
 * recording, VERBATIM and renamed rather than deleted. It is this
 * repository's only real payload of the `field_partial` wire shape, and
 * that shape is still live code on both sides: the backend emits it for
 * any field short of an axis, and the card draws it on its own branch
 * (field-on-the-card.spec.ts, section "the partial block"). No
 * registered competition emits it today — which is a fact about which
 * fields are measured, not a reason to stop proving the card can draw
 * one. Everything below this paragraph describes that first recording.
 *
 * Inter Miami CF v Cruz Azul, ESPN `campeones.cup` event 401901377 —
 * the same fixture `campeones-board.ts` records, one backend PR later.
 * On #136 it arrived as a `no_shared_scale` REFUSAL: both clubs rated,
 * each in its own league, and no measured field putting those two
 * tables on one scale. Backend #141 measures that field
 * (`research_archive/elo_two_league_2026-09-15` — MLS + Liga MX on one
 * Elo scale) and the row arrives RATED, `fav_source: "field"`,
 * favourite Cruz Azul.
 *
 * AND THAT FIELD CARRIES ONE AXIS. Attack and defence are measured for
 * neither league anywhere in the backend — the goals artifact holds the
 * 36 Champions League entrants and no club of either — so the reading
 * has `ovr` and nothing else, has NO `shape` (which is CLEAN/CUT/HOLLOW
 * read off all three gaps together), and rides under `field_partial`
 * rather than under `field`. See `stages.FIELD_PARTIAL_BASIS`, whose
 * words are on the block itself as `why_not_field`.
 *
 * HOW THIS FILE WAS MADE. `board.assemble_board(date="20260916",
 * days=1, leagues=["campeones"])` was run on backend PR #141
 * (`cross-league-mls-ligamx`) through the `wired` fixture of that
 * branch's own `tests/test_picker_no_shared_scale.py` — ESPN's real
 * event payload, the two canned member tables, and the standings,
 * scoreboard and Kalshi fetches monkeypatched exactly as that test
 * does it. The row below is the result verbatim. Nothing in it is
 * hand-authored: a fixture written in the code's vocabulary instead of
 * the feed's is how six bugs shipped in one week.
 *
 * THE ONE EDIT, NAMED. The kickoff moved from the real
 * `2026-09-17T00:00Z` to `2026-12-11T00:00Z` — the same value, for the
 * same reason and in the same shape that `campeones-board.ts` already
 * declares, so the spec cannot rot the way `decision-safety.spec.ts`
 * did when its fixture settled (AGENTS.md section 6). Nothing else is
 * touched: `field_partial`, `fav_source`, the within-league `tiers`,
 * the `gap_note` and `form` are the emitter's.
 *
 * WHY THE COLUMNS COME FROM THE OTHER RECORDING. That run was narrowed
 * to `leagues=["campeones"]`, and a folded competition declares NO
 * column of its own — so its `leagues` map is empty and there is no
 * board to draw at all. `CAMPEONES_BOARD` is this same fixture's own
 * recording WITH the four columns and four ordinary league rows beside
 * it, so the rated row replaces the refusal there and is measured
 * beside ranked cards in both columns it rides in. */
import { CAMPEONES_BOARD } from "./campeones-board";

/** THE RATED ROW, RE-RECORDED 2026-09-25 — three axes, `field` and a
 *  `shape`. `board.assemble_board(date="20260916", days=1,
 *  leagues=["campeones"])` on the backend ship branch
 *  `be-ship-2026-09-25` @ 7eee6d17, through the SAME `wired` fixture of that
 *  branch's tests/test_picker_no_shared_scale.py the Sep-15 row came
 *  through, network blocked for the run. The result verbatim but for the
 *  one edit this file has always named: the kickoff, 2026-09-17T00:00Z
 *  → 2026-12-11T00:00Z. */
export const CAMPEONES_FIELD_ROW = {
  "refused": false,
  "league": "campeones",
  "column": "mls",
  "columns": [
    "mls",
    "ligamx"
  ],
  "home": "Inter Miami CF",
  "away": "Cruz Azul",
  "favourite": "Cruz Azul",
  "opponent": "Inter Miami CF",
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
    "Inter Miami CF": "exact",
    "Cruz Azul": "exact"
  },
  "ppg_gap": null,
  "gdg_gap": null,
  "rank_gap": null,
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
  "cross_league": true,
  "rated_in": {
    "home": "mls",
    "away": "ligamx"
  },
  "table_notes": {
    "home": null,
    "away": null
  },
  "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different competitions, and 2.0 ppg in MLS is not 2.0 ppg in Liga MX: subtracting them would invent a gap that was never measured. In this competition that is EVERY case — the Campeones Cup is the MLS champion against the Liga MX champion, so a same-league tie cannot occur. There is no measured field for it either, so the row does not name a favourite: see `cross_league_axes.NO_FIELD`, which carries the corpus numbers behind that refusal.",
  "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
  "ranks": {
    "fav": 2,
    "opp": 3
  },
  "rates": {
    "ppg": [
      2.2,
      2.8
    ],
    "gf": [
      2.0,
      3.1
    ],
    "ga": [
      0.95,
      2.2
    ],
    "gdg": [
      1.05,
      0.9
    ]
  },
  "own_gdg": {
    "diff": 0.15000000000000002,
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
  "field": {
    "competition": "campeones",
    "clubs": {
      "fav": "Cruz Azul",
      "opp": "Inter Miami"
    },
    "size": 48,
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
          "value": 1677.2151375858139,
          "half_width_95": 23.34884669130682,
          "interval": [
            1653.866290894507,
            1700.5639842771207
          ]
        },
        "opp": {
          "rank": 2,
          "tier": 1,
          "tier_set": [
            1
          ],
          "straddles": false,
          "below_floor": false,
          "value": 1670.701017179858,
          "half_width_95": 32.49078772889447,
          "interval": [
            1638.2102294509634,
            1703.1918049087524
          ]
        },
        "tier_gap": 0,
        "unit": "elo",
        "label": "overall"
      },
      "atk": {
        "fav": {
          "rank": 14,
          "tier": 2,
          "tier_set": [
            1,
            2,
            3,
            4
          ],
          "straddles": true,
          "below_floor": false,
          "value": 0.423332,
          "half_width_95": 0.23826,
          "interval": [
            0.185072,
            0.661592
          ]
        },
        "opp": {
          "rank": 2,
          "tier": 1,
          "tier_set": [
            1,
            2,
            3
          ],
          "straddles": true,
          "below_floor": false,
          "value": 0.717289,
          "half_width_95": 0.382977,
          "interval": [
            0.33431199999999994,
            1.100266
          ]
        },
        "tier_gap": -1,
        "unit": "log_goals",
        "label": "attack"
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
          "below_floor": false,
          "value": 0.492593,
          "half_width_95": 0.28327,
          "interval": [
            0.20932299999999998,
            0.775863
          ]
        },
        "opp": {
          "rank": 31,
          "tier": 4,
          "tier_set": [
            2,
            3,
            4,
            5
          ],
          "straddles": true,
          "below_floor": false,
          "value": 0.130544,
          "half_width_95": 0.437157,
          "interval": [
            -0.306613,
            0.567701
          ]
        },
        "tier_gap": 2,
        "unit": "log_goals",
        "label": "defence"
      }
    },
    "shape": "SPLIT",
    "axes_measured": [
      "ovr",
      "atk",
      "def"
    ],
    "field_basis": "every club of MLS and Liga MX on one cross-league scale, on three axes: overall from the Elo measurement of the two leagues' own component at three passes, attack and defence from the goals measurement on the union corpus — each club's own MLS or Liga MX round-robin plus its league's level, placed by the bridges, with the club's own 95% interval. The two measurements are separate fits on separate corpora, so the overall axis and the goal axes carry no shared pass count and are not one scale.",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one cross-league scale — and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence."
  },
  "event_id": "401901377",
  "competition_id": "401901377",
  "kickoff": "2026-12-11T00:00Z",
  "espn": "campeones.cup",
  "state": "pre",
  "in_play": false,
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
    "fav": null,
    "opp": null,
    "scope": "its own league",
    "scope_is_cup": false
  },
  "current_only": {
    "ppg_gap": null,
    "gdg_gap": null,
    "rank_gap": null
  }
};

/** `folded.campeones` off the same run: its field summary now reads
 *  `axes_measured` ["ovr", "atk", "def"]. */
export const CAMPEONES_FIELD_FOLD = {
  "src": "current",
  "min_current_gp": 20,
  "clubs": 37,
  "kind": "cup",
  "rated_on": [
    "mls",
    "ligamx"
  ],
  "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
  "field": {
    "competition": "campeones",
    "size": 48,
    "axes_measured": [
      "ovr",
      "atk",
      "def"
    ],
    "passes": "3",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "below_floor_clubs": [],
    "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads."
  },
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
  "fixtures": 1,
  "refusals": 0,
  "off_board": 0
};

/** #136's recorded board with the refusal replaced by the re-recorded
 *  three-axis row. */
export const CAMPEONES_FIELD_BOARD = {
  ...CAMPEONES_BOARD,
  rows: [...CAMPEONES_BOARD.rows, CAMPEONES_FIELD_ROW],
  refusals: [],
  folded: { campeones: CAMPEONES_FIELD_FOLD },
};

/** THE SEP-15 RATED ROW, off backend #141's emitter — `field_partial`,
 *  one axis. Kept verbatim under its own name; see the header. */
export const CAMPEONES_PARTIAL_ROW = {
  "refused": false,
  "league": "campeones",
  "column": "mls",
  "columns": [
    "mls",
    "ligamx"
  ],
  "home": "Inter Miami CF",
  "away": "Cruz Azul",
  "favourite": "Cruz Azul",
  "opponent": "Inter Miami CF",
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
    "Inter Miami CF": "exact",
    "Cruz Azul": "exact"
  },
  "ppg_gap": null,
  "gdg_gap": null,
  "rank_gap": null,
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
  "cross_league": true,
  "rated_in": {
    "home": "mls",
    "away": "ligamx"
  },
  "table_notes": {
    "home": null,
    "away": null
  },
  "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different competitions, and 2.0 ppg in MLS is not 2.0 ppg in Liga MX: subtracting them would invent a gap that was never measured. In this competition that is EVERY case — the Campeones Cup is the MLS champion against the Liga MX champion, so a same-league tie cannot occur. There is no measured field for it either, so the row does not name a favourite: see `cross_league_axes.NO_FIELD`, which carries the corpus numbers behind that refusal.",
  "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
  "ranks": {
    "fav": 2,
    "opp": 3
  },
  "rates": {
    "ppg": [
      2.2,
      2.8
    ],
    "gf": [
      2.0,
      3.1
    ],
    "ga": [
      0.95,
      2.2
    ],
    "gdg": [
      1.05,
      0.9
    ]
  },
  "own_gdg": {
    "diff": 0.15000000000000002,
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
  "field_partial": {
    "competition": "campeones",
    "clubs": {
      "fav": "Cruz Azul",
      "opp": "Inter Miami"
    },
    "size": 48,
    "axes": {
      "ovr": {
        "fav": {
          "rank": 1,
          "tier": 1,
          "tier_set": [
            1
          ],
          "straddles": false,
          "below_floor": false
        },
        "opp": {
          "rank": 2,
          "tier": 1,
          "tier_set": [
            1
          ],
          "straddles": false,
          "below_floor": false
        },
        "tier_gap": 0
      }
    },
    "shape_absent": {
      "axes_absent": [
        "atk",
        "def"
      ],
      "why": "`shape` is CLEAN/HOLLOW/SPLIT read off all 3 of ['ovr', 'atk', 'def'] together, and this field has no atk or def axis. A label composed from 1 measured gap(s) and 2 absent one(s) would be a sentence about the fixture that no measurement stands behind. Absent, not null, and not guessed from the axes that do exist. What this field IS: every club of MLS and Liga MX on one cross-league scale, on the OVERALL axis alone. Attack and defence are not measured for these two leagues by anything in this repository — the goals artifact holds the 36 Champions League entrants and no club of either — so this field carries one axis and says so, rather than carrying three of which two would be somebody else's."
    },
    "axes_measured": [
      "ovr"
    ],
    "field_basis": "every club of MLS and Liga MX on one cross-league scale, on the OVERALL axis alone. Attack and defence are not measured for these two leagues by anything in this repository — the goals artifact holds the 36 Champions League entrants and no club of either — so this field carries one axis and says so, rather than carrying three of which two would be somebody else's.",
    "basis": "rated on the competition's own FIELD — its whole entrant set on one cross-league scale — and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence.",
    "why_not_field": "THE FIELD PLACED BOTH CLUBS, ON FEWER AXES THAN `field` IS DEFINED ON. This key is not `field` because `field` is a three-axis contract its readers walk unguarded, and this field carries only the axes somebody has measured for these leagues. `axes_measured` says which; `shape_absent` says which are missing and why. Nothing here is padded to the shape of the other key: an axis nobody measured is absent, not a pair of nulls, because those two are different facts about different evidence."
  },
  "event_id": "401901377",
  "competition_id": "401901377",
  "kickoff": "2026-12-11T00:00Z",
  "espn": "campeones.cup",
  "state": "pre",
  "in_play": false,
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
    "fav": null,
    "opp": null,
    "scope": "its own league",
    "scope_is_cup": false
  },
  "current_only": {
    "ppg_gap": null,
    "gdg_gap": null,
    "rank_gap": null
  }
};

/** `folded.campeones` off the same run — one FIXTURE now and no
 *  refusal, and a `field` summary saying the competition has a measured
 *  field and NO viewer page to fetch the whole of it from. */
export const CAMPEONES_PARTIAL_FOLD = {
  "src": "current",
  "min_current_gp": 20,
  "clubs": 37,
  "kind": "cup",
  "rated_on": [
    "mls",
    "ligamx"
  ],
  "reg_time_note": "NO KALSHI MARKET, SO NO SETTLEMENT RULE IS STATED HERE. Every other registered competition names the series its legs settle under; this one names none because none exists. Probed 2026-09-14 across Kalshi's entire Sports series listing: no ticker and no title contains \"campeones\", and KXCAMPEONESGAME and KXCAMPEONESCUPGAME both list zero markets. KXCONCACAFCCUPGAME is the CONCACAF CHAMPIONS Cup — the continental club championship, a different tournament — and borrowing it would publish another competition's settlement rule on this fixture. WHAT HAPPENS AFTER 90 MINUTES IS ALSO NOT CLAIMED: the ESPN payload says nothing about extra time or penalties, nothing here was measured, and an unmeasured rule written down reads exactly like a measured one.",
  "field": {
    "competition": "campeones",
    "size": 48,
    "axes_measured": [
      "ovr"
    ],
    "passes": "3",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "below_floor_clubs": [],
    "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads."
  },
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
  "fixtures": 1,
  "refusals": 0,
  "off_board": 0
};

/** #136's recorded board — its columns, its four league rows, its
 *  `generated_at` and `date` — with the refusal replaced by #141's
 *  one-axis rated row. */
export const CAMPEONES_PARTIAL_BOARD = {
  ...CAMPEONES_BOARD,
  rows: [...CAMPEONES_BOARD.rows, CAMPEONES_PARTIAL_ROW],
  refusals: [],
  folded: { campeones: CAMPEONES_PARTIAL_FOLD },
};

/** A SECOND READING OFF THE SAME FIELD, and the reason it is here: on
 *  the fixture above both clubs sit in band 1 with their intervals
 *  inside it, so neither side straddles a cut and the card draws no
 *  dagger — which makes that card unable to prove the mark still fires
 *  on a partial block. This is `stages.field_block(read_axes
 *  ("campeones"), "Cruz Azul", "Austin")` off the same branch,
 *  verbatim: Cruz Azul #1 in band 1 against Austin #33, whose 95%
 *  interval touches bands 3 and 4. A Liga MX club against an MLS club
 *  is what this competition IS, so it is a pairing the field can
 *  really be asked for — the ROW it is hung on is built in the spec,
 *  and says so there.
 *
 *  NOT ONE OF THE 48 IS BELOW THE PLACEABILITY FLOOR — every club
 *  cleared it — so the dagger's OTHER sentence has no fixture here and
 *  this file does not invent one. */
export const WIDE_PARTIAL = {
  "competition": "campeones",
  "clubs": {
    "fav": "Cruz Azul",
    "opp": "Austin"
  },
  "size": 48,
  "axes": {
    "ovr": {
      "fav": {
        "rank": 1,
        "tier": 1,
        "tier_set": [
          1
        ],
        "straddles": false,
        "below_floor": false
      },
      "opp": {
        "rank": 33,
        "tier": 3,
        "tier_set": [
          3,
          4
        ],
        "straddles": true,
        "below_floor": false
      },
      "tier_gap": 2
    }
  },
  "shape_absent": {
    "axes_absent": [
      "atk",
      "def"
    ],
    "why": "`shape` is CLEAN/HOLLOW/SPLIT read off all 3 of ['ovr', 'atk', 'def'] together, and this field has no atk or def axis. A label composed from 1 measured gap(s) and 2 absent one(s) would be a sentence about the fixture that no measurement stands behind. Absent, not null, and not guessed from the axes that do exist. What this field IS: every club of MLS and Liga MX on one cross-league scale, on the OVERALL axis alone. Attack and defence are not measured for these two leagues by anything in this repository — the goals artifact holds the 36 Champions League entrants and no club of either — so this field carries one axis and says so, rather than carrying three of which two would be somebody else's."
  },
  "axes_measured": [
    "ovr"
  ],
  "field_basis": "every club of MLS and Liga MX on one cross-league scale, on the OVERALL axis alone. Attack and defence are not measured for these two leagues by anything in this repository — the goals artifact holds the 36 Champions League entrants and no club of either — so this field carries one axis and says so, rather than carrying three of which two would be somebody else's.",
  "basis": "rated on the competition's own FIELD — its whole entrant set on one cross-league scale — and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence.",
  "why_not_field": "THE FIELD PLACED BOTH CLUBS, ON FEWER AXES THAN `field` IS DEFINED ON. This key is not `field` because `field` is a three-axis contract its readers walk unguarded, and this field carries only the axes somebody has measured for these leagues. `axes_measured` says which; `shape_absent` says which are missing and why. Nothing here is padded to the shape of the other key: an axis nobody measured is absent, not a pair of nulls, because those two are different facts about different evidence."
};

/** THE SAME ONE-AXIS READING, FROM A BACKEND THAT ALSO CARRIES THE
 *  MEASUREMENT (frontend #81, backend 2026-09-16).
 *
 *  WHY IT IS A SECOND FIXTURE AND NOT A FIELD ADDED ABOVE. The blocks
 *  above were captured on 2026-09-15, the day `field_partial` was
 *  emitted, and the value/half-width pair landed the day AFTER — so
 *  they are a faithful record of a payload with no measurement in it,
 *  which is the state this card must still draw (`measurementOf`
 *  returns null for both sides and no figure is drawn). Adding the
 *  numbers to them would delete that case and silently retarget every
 *  assertion that reads a trio's text content.
 *
 *  WHAT IT IS FOR. `FieldSide` is the type BOTH keys' axes are built
 *  from, so an axis arriving under `field_partial` carries the pair
 *  exactly as an axis under `field` does. This is the fixture that
 *  makes that inheritance a measured fact rather than a reading of the
 *  type — the two keys stay separate, and the one axis this one has is
 *  drawn with its number like any other.
 *
 *  THE NUMBERS ARE THE ELO SCALE THE `ovr` AXIS IS ON, and each
 *  `interval` is the backend's own — never `value ± half_width`
 *  computed here, which is the reconstruction `measurementOf` refuses
 *  a payload for. */
export const WIDE_PARTIAL_MEASURED = {
  ...WIDE_PARTIAL,
  "axes": {
    "ovr": {
      ...WIDE_PARTIAL.axes.ovr,
      "fav": {
        ...WIDE_PARTIAL.axes.ovr.fav,
        "value": 1811,
        "half_width_95": 27,
        "interval": [1784, 1838],
      },
      "opp": {
        ...WIDE_PARTIAL.axes.ovr.opp,
        "value": 1523,
        "half_width_95": 41,
        "interval": [1482, 1564],
      },
      "unit": "elo",
      "label": "overall",
    },
  },
};

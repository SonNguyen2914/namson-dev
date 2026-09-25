// A REAL EFL CUP BOARD, RECORDED — not a payload written from a brief.
//
// WHY THIS FILE EXISTS AT ALL. This repo has certified a live bug with a
// green test more than once because the fixture spoke the CODE's
// vocabulary instead of the FEED's — a venue guard whose fixture said
// "ESP" where ESPN says "Spain" mislabelled half a board and twelve
// tests approved it. So nothing about the EFL Cup column is typed here.
//
// RE-RECORDED 2026-09-16, AND THE REASON IS THE WHOLE POINT OF THE FILE.
// The first recording was taken on 2026-09-15 and it froze a premise that
// was measured false the next morning. It carried, on the column's meta,
// `no_field` — the corpus account of why no favourite could be named in
// this competition — and THREE refusals, two of them `no_shared_scale`.
// Backend #151 (302a557) harvested the cup's own cross-tier ties as the
// bridges the Championship lacked, all four English tiers cleared the
// placeability floor at two passes, and `cross_league_axes.NO_FIELD` is
// now `{}`. There is no `NO_FIELD["eflcup"]` to quote and no
// `no_shared_scale` refusal left in this column to draw.
//
// A fixture that no longer matches production is the failure; the
// assertions built on it are not. So this is re-recorded rather than
// edited, and picker-efl-cup-column.spec.ts is restated around what is
// now true rather than having its refusal assertions deleted.
//
// WHERE THIS ONE CAME FROM. `GET /api/picker/board?days=2&leagues=eflcup`
// on wc26-bet-suggester-production.up.railway.app at 2026-09-16T21:40Z,
// against the live ESPN and Kalshi feeds. `/api/ready` reported
// code_revision e864ec0, which is origin/main — so this is what the
// deployed backend emits, byte for byte, including the `narrowed_to` the
// query parameter adds. The 2026-09-15 recording was an in-process
// `assemble_board(...)` call on a branch; an HTTP read of the live route
// is what a reader's browser actually receives.
//
// WHAT IT CONTAINS, and what makes the guards non-vacuous NOW. One row
// and no refusals, where the first recording had one row and three:
//
//   * Manchester City v Norwich City — a CROSS-TIER tie, `rated_in`
//     {home: "epl", away: "championship"}, which the first recording
//     drew as a `no_shared_scale` REFUSAL and which now names a
//     favourite with `fav_source: "field"`. The same fixture, the same
//     two clubs, the opposite outcome: that is the change, recorded.
//   * ITS COMPARISON GAPS ARE STILL WITHHELD. `ppg_gap`, `gdg_gap` and
//     `rank_gap` are null and `gap_note` says why — 2.0 ppg in League
//     Two is not 2.0 ppg in the Premier League. A measured field names a
//     favourite; it does not make two divisions' tables subtractable.
//     So "missing is never zero" is still live on this payload, on a
//     RATED card rather than a refused one, and that is where the
//     rendering guard now runs.
//   * `field` on the row and `field` + `league_levels` on the column's
//     meta, carrying the corpus the favourite was read off. Until
//     2026-09-25 this was `field_partial` with `shape_absent`, because
//     the field had one axis — see the re-splice below.
//   * The other four third-round ties of the same window are in
//     `off_board` under `finished`, which is the honest state of this
//     competition on this date and not a gap in the recording.
//
// WHAT IS NOT PROVEN BY THIS PAYLOAD, said rather than left to be
// noticed: it has no refusal, so nothing here exercises a refused EFL
// Cup card. That is not a hole in the guard, it is the competition's
// current state — the board serves no refusal to draw. The refused card
// is proven against its own recorded payloads in refused-card.spec.ts
// and one-fixture-two-columns.spec.ts, and this spec asserts positively
// that no row and no refusal here carries `no_shared_scale`, which is
// the assertion the old fixture could never have passed.
//
// RE-SPLICED 2026-09-25, AND ONLY WHERE THE BACKEND CHANGED. The cup's
// field gained its attack and defence axes (backend #183 measured them
// for every club on the union corpus, League One and League Two
// included) and BELOW_FLOOR_NOTE was corrected (backend ceb7cc30, on the
// ship branch `be-ship-2026-09-25` @ 7eee6d17). The board route cannot be
// re-read for this fixture — the tie was played on 2026-09-17, and the
// e2e hold-out refuses `GET /api/picker/board` against production by
// design — so the parts those two changes reach were regenerated
// IN-PROCESS on that branch, by the backend's own functions, for the
// SAME two clubs, and put where the board puts them:
//   * rows[0].field  = stages.field_block(read_axes("eflcup"),
//     "Manchester City", "Norwich") — three axes and a `shape`, so by
//     the backend's own rule (stages.compare_cup: all of SHAPE_AXES →
//     `field`, fewer → `field_partial`) it replaces `field_partial`.
//     Its overall axis was checked equal to the recorded one before the
//     splice (ranks 2 v 48, tiers 1 v 3, sets [1] v [3, 4]), so the
//     favourite the recording named is the one this block names.
//   * leagues.eflcup.field — the column summary board.assemble_board
//     builds, off the same reading: `axes_measured` ["ovr","atk","def"].
//   * field_unit_notes and field_floor_note — the board-level sentences
//     every board has carried beside its field blocks since they were
//     added, the second one in its corrected wording.
// Every other byte is the 2026-09-16 production read, unedited.
//
// THE CLOCK IS THE ONE THING REBASED, and only the clock. A recorded
// payload is frozen on 2026-09-16, so every kickoff in it is in the past
// the day after it was taken and the board would draw finished matches
// for a suite that is about live ones. `rebased()` shifts the kickoffs
// forward, PRESERVING THEIR ORDER AND SPACING, and touches nothing else:
// every club name, reason, note, venue country and Kalshi ticker is the
// byte the wire carried. Same discipline as e2e/standing.ts — transform
// a real payload, never invent one.

/** The payload as the backend emitted it, with the field re-splice above. */
export const RECORDED = {
  "generated_at": "2026-09-16T21:40:22.206539+00:00",
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
      "field": {
        "competition": "eflcup",
        "size": 94,
        "axes_measured": [
          "ovr",
          "atk",
          "def"
        ],
        "passes": "2",
        "corpus_sha256": "c7b35fb63ab9ddfefecbd74c291a600dad09d25d809c546eff86a04b9042bfb2",
        "below_floor_clubs": [],
        "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads."
      },
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
      "column": "eflcup",
      "columns": [
        "eflcup"
      ],
      "home": "Manchester City",
      "away": "Norwich City",
      "favourite": "Manchester City",
      "opponent": "Norwich City",
      "fav_side": "home",
      "fav_source": "field",
      "venue_favourite": {
        "refused": true,
        "reason": "no_gdg_gap",
        "policy": "off",
        "flipped": false,
        "venue_class": "DOMESTIC",
        "home_side": "home"
      },
      "resolution": {
        "Manchester City": "exact",
        "Norwich City": "exact"
      },
      "ppg_gap": null,
      "gdg_gap": null,
      "rank_gap": null,
      "gp_current": {
        "home": 4,
        "away": 7,
        "min": 4
      },
      "weights": {
        "home": 0.2857142857142857,
        "away": 0.4117647058823529,
        "min": 0.2857142857142857,
        "k": 10.0,
        "constant": null,
        "basis": {
          "home": "blend",
          "away": "blend"
        }
      },
      "src": "prior",
      "cross_league": true,
      "rated_in": {
        "home": "epl",
        "away": "championship"
      },
      "table_notes": {
        "home": null,
        "away": null
      },
      "gap_note": "CROSS-TIER FIXTURE \u2014 ppg, GD/g and rank gaps withheld. The two clubs are rated in different divisions of one pyramid, and 2.0 ppg in League Two is not 2.0 ppg in the Premier League: subtracting them would invent a gap that was never measured. Four rungs of the same ladder make that MORE of a problem than two foreign leagues and not less, because the tables look alike \u2014 same country, same calendar, same shape \u2014 while the fields they measure are graded by construction. In this competition it is very nearly every case: of the 76 fixtures played to 2026-09-15, 47 paired two different tiers and 29 did not. The tiers below survive because they are WITHIN-LEAGUE quintiles by construction \u2014 a League Two T1 and a Premier League T1 each mean \"best fifth of its own division\", which is the one comparison two tables built on different populations can actually support.",
      "reg_time_note": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix \u2014 the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 \u2014 better than one in six \u2014 finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
      "ranks": {
        "fav": 2,
        "opp": 10
      },
      "rates": {
        "ppg": [
          2.3233082706766917,
          1.360613810741688
        ],
        "gf": [
          2.018796992481203,
          1.5703324808184145
        ],
        "ga": [
          0.8007518796992481,
          1.4808184143222507
        ],
        "gdg": [
          1.218045112781955,
          0.08951406649616378
        ]
      },
      "own_gdg": {
        "diff": 1.1285310462857912,
        "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED \u2014 how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other."
      },
      "tiers": {
        "ovr": [
          1,
          3
        ],
        "atk": [
          1,
          1
        ],
        "def": [
          1,
          5
        ]
      },
      "tier_gaps": {
        "ovr": 2,
        "atk": 0,
        "def": 4
      },
      "shape": "SPLIT",
      "field": {
        "competition": "eflcup",
        "clubs": {
          "fav": "Manchester City",
          "opp": "Norwich"
        },
        "size": 94,
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
              "value": 1827.180495210498,
              "half_width_95": 32.838000880813425,
              "interval": [
                1794.3424943296845,
                1860.0184960913116
              ]
            },
            "opp": {
              "rank": 48,
              "tier": 3,
              "tier_set": [
                3,
                4
              ],
              "straddles": true,
              "below_floor": false,
              "value": 1527.3942403000735,
              "half_width_95": 16.421393804779562,
              "interval": [
                1510.9728464952939,
                1543.8156341048532
              ]
            },
            "tier_gap": 2,
            "unit": "elo",
            "label": "overall"
          },
          "atk": {
            "fav": {
              "rank": 1,
              "tier": 1,
              "tier_set": [
                1
              ],
              "straddles": false,
              "below_floor": false,
              "value": 0.956929,
              "half_width_95": 0.225783,
              "interval": [
                0.7311460000000001,
                1.182712
              ]
            },
            "opp": {
              "rank": 44,
              "tier": 3,
              "tier_set": [
                2,
                3,
                4
              ],
              "straddles": true,
              "below_floor": false,
              "value": 0.104822,
              "half_width_95": 0.318861,
              "interval": [
                -0.214039,
                0.42368300000000003
              ]
            },
            "tier_gap": 2,
            "unit": "log_goals",
            "label": "attack"
          },
          "def": {
            "fav": {
              "rank": 2,
              "tier": 1,
              "tier_set": [
                1,
                2
              ],
              "straddles": true,
              "below_floor": false,
              "value": 0.962248,
              "half_width_95": 0.344377,
              "interval": [
                0.6178710000000001,
                1.306625
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
              "below_floor": false,
              "value": 0.030231,
              "half_width_95": 0.269454,
              "interval": [
                -0.23922300000000002,
                0.29968500000000003
              ]
            },
            "tier_gap": 3,
            "unit": "log_goals",
            "label": "defence"
          }
        },
        "shape": "CLEAN",
        "axes_measured": [
          "ovr",
          "atk",
          "def"
        ],
        "field_basis": "the 94 clubs of the EFL Cup's four English tiers on one cross-tier scale, on three axes. Attack and defence come from the goals measurement on the union corpus, which fits a round-robin for every one of the four tiers \u2014 League One's and League Two's since 2026-09-24, when a definition the goals fit had bound at import stopped leaving both tiers attributed and unfitted \u2014 each club with its own 95% interval. The overall axis is the Elo measurement below, on its own corpus. The corpus held the Championship at 1,114 domestic fixtures and ZERO bridges and held neither lower tier at all; research_archive/efl_bridges_2026-09-15/ adds two seasons of the EFL Cup, the FA Cup and the EFL Trophy and the two missing tiers' own seasons, and all four clear the floor at two passes. WHAT THE BRIDGES DO NOT SEPARATE, measured and published rather than left for a reader to notice: the Championship and League One. Over the two seasons in the corpus those two tiers met 36 times and the higher one scored 0.486 \u2014 15 wins, 5 draws, 16 defeats \u2014 so the chain puts League One's level at +22.9 Elo and the Championship's at -1.5 at the pinned two passes, and a reading that treats a club being in the higher division as evidence of anything is not reading this field. The other three tier pairs do separate, in the expected direction: 0.824 for the Premier League over the Championship, 0.859 and 0.917 over the two lower tiers, 0.760 for the Championship over League Two and 0.586 for League One over League Two.",
        "basis": "rated on the competition's own FIELD \u2014 its whole entrant set on one cross-league scale \u2014 and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence."
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
        "ask_c": 87,
        "bid_c": 86,
        "spread_c": 1,
        "ask_size": 3757,
        "bid_size": 12237,
        "flags": []
      },
      "form": {
        "fav": "WWWW",
        "opp": "WLWWL",
        "scope": "its own league",
        "scope_is_cup": false
      },
      "current_only": {
        "ppg_gap": null,
        "gdg_gap": null,
        "rank_gap": null
      }
    }
  ],
  "refusals": [],
  "off_board": [
    {
      "event_id": "401914282",
      "competition_id": "401914282",
      "kickoff": "2026-09-16T18:45Z",
      "state": "post",
      "home": "Everton",
      "away": "Wolverhampton Wanderers",
      "code": "finished",
      "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this \u2014 'once a match finished I have no way to access it to see where could I do better' \u2014 and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous",
      "league": "eflcup"
    },
    {
      "event_id": "401914266",
      "competition_id": "401914266",
      "kickoff": "2026-09-16T18:45Z",
      "state": "post",
      "home": "Fleetwood Town",
      "away": "Sheffield United",
      "code": "finished",
      "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this \u2014 'once a match finished I have no way to access it to see where could I do better' \u2014 and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous",
      "league": "eflcup"
    },
    {
      "event_id": "401914258",
      "competition_id": "401914258",
      "kickoff": "2026-09-16T19:00Z",
      "state": "post",
      "home": "Coventry City",
      "away": "Aston Villa",
      "code": "finished",
      "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this \u2014 'once a match finished I have no way to access it to see where could I do better' \u2014 and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous",
      "league": "eflcup"
    },
    {
      "event_id": "401914261",
      "competition_id": "401914261",
      "kickoff": "2026-09-16T19:00Z",
      "state": "post",
      "home": "Manchester United",
      "away": "Brighton & Hove Albion",
      "code": "finished",
      "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this \u2014 'once a match finished I have no way to access it to see where could I do better' \u2014 and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous",
      "league": "eflcup"
    }
  ],
  "off_board_counts": {
    "kicked_off": 0,
    "finished": 4,
    "not_yet_kicked_off": 0,
    "state_unrecognised": 0,
    "no_state": 0,
    "event_unreadable": 0
  },
  "folded": {},
  "field_unit_notes": {
    "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
    "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better \u2014 the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
  },
  "field_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) \u2014 or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
  "narrowed_to": [
    "eflcup"
  ]
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

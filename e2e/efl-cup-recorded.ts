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
//   * `field_partial` on the row and `field` + `league_levels` on the
//     column's meta, carrying the corpus the favourite was read off —
//     and `shape_absent`, because this field has one axis and a
//     CLEAN/HOLLOW/SPLIT label reads three.
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
          "ovr"
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
      "field_partial": {
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
              "below_floor": false
            },
            "opp": {
              "rank": 48,
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
          "why": "`shape` is CLEAN/HOLLOW/SPLIT read off all 3 of ['ovr', 'atk', 'def'] together, and this field has no atk or def axis. A label composed from 1 measured gap(s) and 2 absent one(s) would be a sentence about the fixture that no measurement stands behind. Absent, not null, and not guessed from the axes that do exist. What this field IS: the 94 clubs of the EFL Cup's four English tiers on one cross-tier scale, on the OVERALL axis alone. The corpus held the Championship at 1,114 domestic fixtures and ZERO bridges and held neither lower tier at all; research_archive/efl_bridges_2026-09-15/ adds two seasons of the EFL Cup, the FA Cup and the EFL Trophy and the two missing tiers' own seasons, and all four clear the floor at two passes. Attack and defence are not measured for any English club outside the Premier League by anything in this repository, so this field carries one axis and says so. WHAT THE BRIDGES DO NOT SEPARATE, measured and published rather than left for a reader to notice: the Championship and League One. Over the two seasons in the corpus those two tiers met 36 times and the higher one scored 0.486 \u2014 15 wins, 5 draws, 16 defeats \u2014 so the chain puts League One's level at +22.9 Elo and the Championship's at -1.5 at the pinned two passes, and a reading that treats a club being in the higher division as evidence of anything is not reading this field. The other three tier pairs do separate, in the expected direction: 0.824 for the Premier League over the Championship, 0.859 and 0.917 over the two lower tiers, 0.760 for the Championship over League Two and 0.586 for League One over League Two."
        },
        "axes_measured": [
          "ovr"
        ],
        "field_basis": "the 94 clubs of the EFL Cup's four English tiers on one cross-tier scale, on the OVERALL axis alone. The corpus held the Championship at 1,114 domestic fixtures and ZERO bridges and held neither lower tier at all; research_archive/efl_bridges_2026-09-15/ adds two seasons of the EFL Cup, the FA Cup and the EFL Trophy and the two missing tiers' own seasons, and all four clear the floor at two passes. Attack and defence are not measured for any English club outside the Premier League by anything in this repository, so this field carries one axis and says so. WHAT THE BRIDGES DO NOT SEPARATE, measured and published rather than left for a reader to notice: the Championship and League One. Over the two seasons in the corpus those two tiers met 36 times and the higher one scored 0.486 \u2014 15 wins, 5 draws, 16 defeats \u2014 so the chain puts League One's level at +22.9 Elo and the Championship's at -1.5 at the pinned two passes, and a reading that treats a club being in the higher division as evidence of anything is not reading this field. The other three tier pairs do separate, in the expected direction: 0.824 for the Premier League over the Championship, 0.859 and 0.917 over the two lower tiers, 0.760 for the Championship over League Two and 0.586 for League One over League Two.",
        "basis": "rated on the competition's own FIELD \u2014 its whole entrant set on one cross-league scale \u2014 and not on either club's domestic league. `field_basis` beside this says which field and how deeply it was measured, because two competitions' fields are not measured to the same depth. The `tiers` pair beside this block answers a different question and keeps answering it: a within-league quintile says 'best fifth of its own league', which is the same sentence in two leagues but not the same club. `straddles` and `below_floor` travel with each side because a band published without them reads as a measurement of the club rather than of the evidence.",
        "why_not_field": "THE FIELD PLACED BOTH CLUBS, ON FEWER AXES THAN `field` IS DEFINED ON. This key is not `field` because `field` is a three-axis contract its readers walk unguarded, and this field carries only the axes somebody has measured for these leagues. `axes_measured` says which; `shape_absent` says which are missing and why. Nothing here is padded to the shape of the other key: an axis nobody measured is absent, not a pair of nulls, because those two are different facts about different evidence."
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

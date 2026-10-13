/* THE CUPS TAB'S 22 CUPS AND THE LEAGUES BOARD, RECORDED 2026-10-13
 * against TRIVELA branch cups-rules (the super-cup registry, season state,
 * cup ties out of league columns) — real assemblies, no relabelled rows
 * (AGENTS.md §8).
 *
 * HOW. `api.main._picker_board_assemble("20261013", 8, tables.CUPS_TAB,
 * capture=False)` and the declared board (`columns=None`), plus
 * `review.assemble_review(back=8)` for each, run IN PROCESS with
 * `board.assemble_board` forced to capture=False and
 * `snapshots.capture_rows` made to raise — the method of
 * e2e/cups-recorded.ts. No request reached /api/picker/board or
 * /api/picker/review, locally or in production, and nothing was written.
 * Live ESPN and Kalshi were read; API-Football-backed member tables had no
 * key in process and are named in `member_errors`.
 *
 * TRIMMED, NOTHING ELSE TOUCHED: the cups board keeps the first 4 rows
 * and first 2 refusals per cup and the first 4 `off_board` entries. The leagues board keeps the first 3 rows and the
 * first refusal per league, the review the first 2 finished per league.
 * `narrowed_to` is the route's, added as `picker_board` adds it. */
export const RULES_CLOCK = "2026-10-13T05:39:31Z";
export const CUPS_RULES_BOARD = {
 "date": "20261013",
 "days": 8,
 "field_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
 "field_unit_notes": {
  "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
  "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better — the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
 },
 "folded": {
  "campeondecampeones": {
   "clubs": 18,
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
    "ligamx"
   ],
   "refusals": 0,
   "reg_time_note": "NO KALSHI SERIES, SO NO SETTLEMENT RULE IS STATED HERE. Kalshi's public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json, 3,778 series) lists no series for this competition. A blank series is skipped, never keyed: this cup has no book and no settlement rule rather than a borrowed one.",
   "season": {
    "last_played": "2026-07-25",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "current"
  },
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
   "season": {
    "last_played": "2026-09-16",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "current"
  },
  "communityshield": {
   "clubs": 35,
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
    "championship"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXENGCSGAME (\"England Community Shield\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-08-16",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "prior"
  },
  "concacafcc": {
   "clubs": 48,
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
   "reg_time_note": "KALSHI LISTS KXCONCACAFCCUPGAME (\"CONCACAF Champions Cup Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-05-30",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "current"
  },
  "copadelrey": {
   "clubs": 17,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "laliga"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 6,
   "off_board": 0,
   "rated_on": [
    "laliga"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXCOPADELREYGAME (\"Copa Del Rey Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": null,
    "next_fixture": null,
    "state": "in_season"
   },
   "src": "prior"
  },
  "coppaitalia": {
   "clubs": 17,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "seriea"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 6,
   "off_board": 0,
   "rated_on": [
    "seriea"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXCOPPAITALIAGAME (\"Coppa Italia Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-09-15",
    "next_fixture": "2027-02-03",
    "state": "in_season"
   },
   "src": "prior"
  },
  "coupedefrance": {
   "clubs": 16,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "ligue1"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 6,
   "off_board": 0,
   "rated_on": [
    "ligue1"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXCOUPEDEFRANCEGAME (\"Coupe de France Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-05-22",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "prior"
  },
  "dfbpokal": {
   "clubs": 15,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "bundesliga"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 5,
   "off_board": 0,
   "rated_on": [
    "bundesliga"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXDFBPOKALGAME (\"DFB Pokal Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-09-02",
    "next_fixture": "2026-10-27",
    "state": "in_season"
   },
   "src": "prior"
  },
  "dflsupercup": {
   "clubs": 15,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "bundesliga"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 5,
   "off_board": 0,
   "rated_on": [
    "bundesliga"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXGERSCGAME (\"Germany Super Cup\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-08-22",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "prior"
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
   "season": {
    "last_played": "2026-09-17",
    "next_fixture": "2026-10-27",
    "state": "in_season"
   },
   "src": "prior"
  },
  "facup": {
   "clubs": 73,
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
   "reg_time_note": "KALSHI LISTS KXFACUPGAME (\"FA Cup Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-05-16",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "prior"
  },
  "johancruijff": {
   "clubs": 15,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "eredivisie"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 8,
   "off_board": 0,
   "rated_on": [
    "eredivisie"
   ],
   "refusals": 0,
   "reg_time_note": "NO KALSHI SERIES, SO NO SETTLEMENT RULE IS STATED HERE. Kalshi's public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json, 3,778 series) lists no series for this competition. A blank series is skipped, never keyed: this cup has no book and no settlement rule rather than a borrowed one.",
   "season": {
    "last_played": "2026-08-02",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "prior"
  },
  "knvbbeker": {
   "clubs": 15,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "eredivisie"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 8,
   "off_board": 0,
   "rated_on": [
    "eredivisie"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXKNVBCUPGAME (\"KNVB Cup Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-09-23",
    "next_fixture": "2026-10-27",
    "state": "in_season"
   },
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
   "season": {
    "last_played": "2026-09-06",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "current"
  },
  "supercopa": {
   "clubs": 17,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "laliga"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 6,
   "off_board": 0,
   "rated_on": [
    "laliga"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXESPSUPERCUPGAME (\"Spain Super Cup Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": null,
    "next_fixture": "2027-02-02",
    "state": "not_started"
   },
   "src": "prior"
  },
  "supercoppa": {
   "clubs": 17,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "seriea"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 6,
   "off_board": 0,
   "rated_on": [
    "seriea"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXITASUPERCUPGAME (\"Italy Super Cup Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": null,
    "next_fixture": "2026-12-22",
    "state": "not_started"
   },
   "src": "prior"
  },
  "tropheechampions": {
   "clubs": 16,
   "fixtures": 0,
   "folded_into": [],
   "kind": "cup",
   "league_levels": {
    "artifact": "research_archive/goals_cross_league_2026-09-09",
    "corpus_sha256": "00b3d0a3a08668a412d583a5b10e943244e49d20e3364bbd4aca812d7d773acf",
    "leagues_measured": 13,
    "levels_are": "selection-corrected (two-stage) attack and defence, not the bridge-only league fit",
    "members_measured": [
     "ligue1"
    ],
    "mu": 0.06585639874539755
   },
   "min_current_gp": 6,
   "off_board": 0,
   "rated_on": [
    "ligue1"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXFRASUPERCUPGAME (\"France Super Cup Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-08-16",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "prior"
  },
  "uefasuper": {
   "clubs": 196,
   "fixtures": 0,
   "folded_into": [],
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
   "off_board": 0,
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
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXUEFASCGAME (\"UEFA Super Cup\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-08-12",
    "next_fixture": null,
    "state": "finished"
   },
   "src": "prior"
  },
  "usopencup": {
   "clubs": 30,
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
   "min_current_gp": 27,
   "off_board": 0,
   "rated_on": [
    "mls"
   ],
   "refusals": 0,
   "reg_time_note": "KALSHI LISTS KXUSOPENCUPGAME (\"US Open Cup Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": "2026-09-16",
    "next_fixture": "2026-10-21",
    "state": "in_season"
   },
   "src": "current"
  }
 },
 "generated_at": "2026-10-13T05:39:31.032442+00:00",
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
   "season": {
    "last_played": null,
    "next_fixture": null,
    "state": "in_season"
   },
   "src": "prior"
  },
  "uecl": {
   "clubs": 196,
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
   "reg_time_note": "KALSHI LISTS KXUECLGAME (\"UEFA Conference League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": null,
    "next_fixture": null,
    "state": "in_season"
   },
   "src": "prior"
  },
  "uel": {
   "clubs": 196,
   "field": {
    "axes_measured": [
     "ovr",
     "atk",
     "def"
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
    "competition": "uel",
    "corpus_sha256": "0dbb69159e0bb0cf2d1fb9fe8b3f4947723f1997173ae07328361a4fcd7b914f",
    "field_not_served": "this competition has a measured field and no viewer page, so there is no route to fetch the whole field from. The block on each row carries the two clubs of that row, which is all this board reads.",
    "passes": "10",
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
   "reg_time_note": "KALSHI LISTS KXUELGAME (\"UEFA Europa League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "season": {
    "last_played": null,
    "next_fixture": null,
    "state": "in_season"
   },
   "src": "prior"
  }
 },
 "narrowed_to": [
  "ucl",
  "uel",
  "uecl",
  "concacafcc",
  "leaguescup",
  "campeones",
  "uefasuper",
  "communityshield",
  "supercopa",
  "dflsupercup",
  "supercoppa",
  "tropheechampions",
  "johancruijff",
  "campeondecampeones",
  "facup",
  "eflcup",
  "copadelrey",
  "dfbpokal",
  "coppaitalia",
  "coupedefrance",
  "knvbbeker",
  "usopencup"
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
    "ask_c": 81,
    "ask_size": 313930,
    "bid_c": 80,
    "bid_size": 68144,
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
     "a": 0.068627,
     "d": 0.137255,
     "h": 0.794118
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 7,
       "ask_size": 553808,
       "bid_c": 6,
       "bid_size": 2921,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ARSLIL-LIL"
      },
      "d": {
       "ask_c": 14,
       "ask_size": 123096,
       "bid_c": 13,
       "bid_size": 17719,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ARSLIL-TIE"
      },
      "h": {
       "ask_c": 81,
       "ask_size": 313930,
       "bid_c": 80,
       "bid_size": 68144,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ARSLIL-ARS"
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
    "ask_size": 106111,
    "bid_c": 77,
    "bid_size": 70156,
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
     "a": 0.079208,
     "d": 0.148515,
     "h": 0.772277
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 8,
       "ask_size": 284781,
       "bid_c": 7,
       "bid_size": 50702,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13INTBRU-BRU"
      },
      "d": {
       "ask_c": 15,
       "ask_size": 136064,
       "bid_c": 14,
       "bid_size": 17375,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13INTBRU-TIE"
      },
      "h": {
       "ask_c": 78,
       "ask_size": 106111,
       "bid_c": 77,
       "bid_size": 70156,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13INTBRU-INT"
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
  },
  {
   "admission": null,
   "away": "Hapoel Be'er",
   "club": "Hapoel Be'er",
   "column": "uel",
   "columns": [
    "uel"
   ],
   "competition_id": "401915573",
   "espn": "uefa.europa",
   "event_id": "401915573",
   "form": {
    "away": null,
    "home": "WDWL",
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
      "corpus_name": "AZ Alkmaar",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: Hapoel Be'er (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "AZ Alkmaar",
   "in_play": false,
   "kalshi": null,
   "kickoff": "2026-10-15T16:45Z",
   "league": "uel",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "HBE",
     "h": "AZ"
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
   "opponent_row": {
    "basis": "blend",
    "club": "AZ Alkmaar",
    "ga": 1.2777777777777777,
    "gdg": 0.6699346405228759,
    "gf": 1.9477124183006536,
    "gp_current": 8,
    "of": 15,
    "ppg": 1.9052287581699345,
    "rank": 3,
    "rated": true,
    "rated_in": "eredivisie",
    "resolved_by": "exact",
    "table_club": "AZ Alkmaar",
    "table_note": null,
    "weight": 0.4444444444444444
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
   "reg_time_note": "KALSHI LISTS KXUELGAME (\"UEFA Europa League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "sides": null,
   "state": "pre",
   "this_season": null,
   "venue": {
    "city": "Alkmaar",
    "country": "Netherlands",
    "name": "AFAS Stadion"
   },
   "venue_class": {
    "class": "UNKNOWN",
    "home_side": null
   }
  },
  {
   "admission": null,
   "away": "Bayer Leverkusen",
   "club": "Lech Poznan",
   "column": "uel",
   "columns": [
    "uel"
   ],
   "competition_id": "401915576",
   "espn": "uefa.europa",
   "event_id": "401915576",
   "form": {
    "away": "WDWW",
    "home": null,
    "scope": "its own league",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Bayer Leverkusen",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": null,
      "resolved_by": "no_rated_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: Lech Poznan (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "Lech Poznan",
   "in_play": false,
   "kalshi": {
    "ask_c": 21,
    "ask_size": 610,
    "bid_c": 19,
    "bid_size": 604,
    "event_ticker": "KXUELGAME-26OCT15LPOLEV",
    "flags": [],
    "side": "Lech Poznan",
    "spread_c": 2,
    "ticker": "KXUELGAME-26OCT15LPOLEV-LPO"
   },
   "kickoff": "2026-10-15T16:45Z",
   "league": "uel",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "B04",
     "h": "LECH"
    },
    "market": {
     "a": 0.588235,
     "d": 0.205882,
     "h": 0.205882
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 60,
       "ask_size": 1784,
       "bid_c": 58,
       "bid_size": 1011,
       "spread_c": 2,
       "ticker": "KXUELGAME-26OCT15LPOLEV-LEV"
      },
      "d": {
       "ask_c": 21,
       "ask_size": 199,
       "bid_c": 20,
       "bid_size": 990,
       "spread_c": 1,
       "ticker": "KXUELGAME-26OCT15LPOLEV-TIE"
      },
      "h": {
       "ask_c": 21,
       "ask_size": 610,
       "bid_c": 19,
       "bid_size": 604,
       "spread_c": 2,
       "ticker": "KXUELGAME-26OCT15LPOLEV-LPO"
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
   "opponent_row": {
    "basis": "blend",
    "club": "Bayer Leverkusen",
    "ga": 1.4549019607843139,
    "gdg": 0.8117647058823527,
    "gf": 2.2666666666666666,
    "gp_current": 5,
    "of": 15,
    "ppg": 1.823529411764706,
    "rank": 4,
    "rated": true,
    "rated_in": "bundesliga",
    "resolved_by": "exact",
    "table_club": "Bayer Leverkusen",
    "table_note": null,
    "weight": 0.3333333333333333
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
   "reg_time_note": "KALSHI LISTS KXUELGAME (\"UEFA Europa League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "sides": null,
   "state": "pre",
   "this_season": null,
   "venue": {
    "city": "Poznan",
    "country": "Poland",
    "name": "Municipal Stadium-Poznan"
   },
   "venue_class": {
    "class": "UNKNOWN",
    "home_side": null
   }
  },
  {
   "admission": null,
   "away": "AS Monaco",
   "club": "CSKA Sofia",
   "column": "uecl",
   "columns": [
    "uecl"
   ],
   "competition_id": "401915855",
   "espn": "uefa.europa.conf",
   "event_id": "401915855",
   "form": {
    "away": "WDWD",
    "home": null,
    "scope": "its own league",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Monaco",
      "resolved_by": "contained"
     },
     "home": {
      "corpus_name": null,
      "resolved_by": "no_rated_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: CSKA Sofia (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "CSKA Sofia",
   "in_play": false,
   "kalshi": {
    "ask_c": 15,
    "ask_size": 94,
    "bid_c": 13,
    "bid_size": 8383,
    "event_ticker": "KXUECLGAME-26OCT15CSKASM",
    "flags": [
     "THIN"
    ],
    "side": "CSKA Sofia",
    "spread_c": 2,
    "ticker": "KXUECLGAME-26OCT15CSKASM-CSK"
   },
   "kickoff": "2026-10-15T16:45Z",
   "league": "uecl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "MON",
     "h": "CSKA"
    },
    "market": {
     "a": 0.656863,
     "d": 0.196078,
     "h": 0.147059
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 67,
       "ask_size": 5406,
       "bid_c": 65,
       "bid_size": 363,
       "spread_c": 2,
       "ticker": "KXUECLGAME-26OCT15CSKASM-ASM"
      },
      "d": {
       "ask_c": 20,
       "ask_size": 99,
       "bid_c": 19,
       "bid_size": 114,
       "spread_c": 1,
       "ticker": "KXUECLGAME-26OCT15CSKASM-TIE"
      },
      "h": {
       "ask_c": 15,
       "ask_size": 94,
       "bid_c": 13,
       "bid_size": 8383,
       "spread_c": 2,
       "ticker": "KXUECLGAME-26OCT15CSKASM-CSK"
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
   "opponent_row": {
    "basis": "blend",
    "club": "AS Monaco",
    "ga": 1.3051470588235294,
    "gdg": 0.4227941176470589,
    "gf": 1.7279411764705883,
    "gp_current": 6,
    "of": 16,
    "ppg": 1.8676470588235294,
    "rank": 4,
    "rated": true,
    "rated_in": "ligue1",
    "resolved_by": "exact",
    "table_club": "AS Monaco",
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
   "reg_time_note": "KALSHI LISTS KXUECLGAME (\"UEFA Conference League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "sides": null,
   "state": "pre",
   "this_season": null,
   "venue": {
    "city": "Sofia",
    "country": "Bulgaria",
    "name": "Vasil Levski National Stadium"
   },
   "venue_class": {
    "class": "UNKNOWN",
    "home_side": null
   }
  },
  {
   "admission": null,
   "away": "Getafe",
   "club": "CSU Craiova",
   "column": "uecl",
   "columns": [
    "uecl"
   ],
   "competition_id": "401915854",
   "espn": "uefa.europa.conf",
   "event_id": "401915854",
   "form": {
    "away": "DDLWL",
    "home": null,
    "scope": "its own league",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Getafe",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": null,
      "resolved_by": "no_rated_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: CSU Craiova (no_rated_league) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "CSU Craiova",
   "in_play": false,
   "kalshi": null,
   "kickoff": "2026-10-15T16:45Z",
   "league": "uecl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "GET",
     "h": "UCRA"
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
   "opponent_row": {
    "basis": "blend",
    "club": "Getafe",
    "ga": 1.1111111111111112,
    "gdg": -0.42105263157894746,
    "gf": 0.6900584795321637,
    "gp_current": 8,
    "of": 17,
    "ppg": 1.1900584795321638,
    "rank": 12,
    "rated": true,
    "rated_in": "laliga",
    "resolved_by": "exact",
    "table_club": "Getafe",
    "table_note": null,
    "weight": 0.4444444444444444
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
   "reg_time_note": "KALSHI LISTS KXUECLGAME (\"UEFA Conference League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "sides": null,
   "state": "pre",
   "this_season": null,
   "venue": {
    "city": "Craiova",
    "country": "Romania",
    "name": "Stadionul Ion Oblemenco"
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
    "ask_size": 157793,
    "bid_c": 37,
    "bid_size": 16882,
    "event_ticker": "KXUCLGAME-26OCT13RCLSPO",
    "flags": [],
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
     "a": 0.372549,
     "d": 0.254902,
     "h": 0.372549
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 38,
       "ask_size": 229379,
       "bid_c": 36,
       "bid_size": 39257,
       "spread_c": 2,
       "ticker": "KXUCLGAME-26OCT13RCLSPO-SPO"
      },
      "d": {
       "ask_c": 26,
       "ask_size": 15062,
       "bid_c": 25,
       "bid_size": 36195,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RCLSPO-TIE"
      },
      "h": {
       "ask_c": 38,
       "ask_size": 157793,
       "bid_c": 37,
       "bid_size": 16882,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13RCLSPO-RCL"
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
      "h",
      "a"
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
    "ask_size": 1232,
    "bid_c": 25,
    "bid_size": 45919,
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
       "ask_size": 1232,
       "bid_c": 25,
       "bid_size": 45919,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ATMMUN-MUN"
      },
      "d": {
       "ask_c": 25,
       "ask_size": 37888,
       "bid_c": 24,
       "bid_size": 35569,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13ATMMUN-TIE"
      },
      "h": {
       "ask_c": 51,
       "ask_size": 655983,
       "bid_c": 50,
       "bid_size": 4717,
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
    "ask_size": 257648,
    "bid_c": 76,
    "bid_size": 22273,
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
       "ask_size": 257648,
       "bid_c": 76,
       "bid_size": 22273,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13GALBAR-BAR"
      },
      "d": {
       "ask_c": 13,
       "ask_size": 15089,
       "bid_c": 12,
       "bid_size": 64636,
       "spread_c": 1,
       "ticker": "KXUCLGAME-26OCT13GALBAR-TIE"
      },
      "h": {
       "ask_c": 11,
       "ask_size": 303292,
       "bid_c": 10,
       "bid_size": 49983,
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
   "away": "Crystal Palace",
   "column": "uel",
   "columns": [
    "uel"
   ],
   "competition_id": "401915566",
   "cross_league": true,
   "current_only": {
    "favourite": "Crystal Palace",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Crystal Palace"
   },
   "espn": "uefa.europa",
   "event_id": "401915566",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Crystal Palace",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.28250685036107986,
       "interval": [
        0.21874608214975017,
        0.7837597828719098
       ],
       "rank": 13,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.50125293251083
      },
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.27801014816892894,
       "interval": [
        0.34546845091890416,
        0.9014887472567621
       ],
       "rank": 9,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.6234785990878331
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.28503517425308994,
       "interval": [
        0.4896360375718318,
        1.0597063860780116
       ],
       "rank": 3,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.7746712118249217
      },
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.359730581436104,
       "interval": [
        0.24990488110727976,
        0.9693660439794878
       ],
       "rank": 9,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.6096354625433837
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 44.97698872438745,
       "interval": [
        1802.0276658616938,
        1891.9816433104686
       ],
       "rank": 4,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1847.0046545860812
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 46.88786592361857,
       "interval": [
        1763.5154168029871,
        1857.2911486502244
       ],
       "rank": 8,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1810.4032827266058
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
     "fav": "Crystal Palace",
     "opp": "Lyon"
    },
    "competition": "uel",
    "field_basis": "the 36 entrants of the 2026-27 Europa League league phase, on three axes, on a corpus of the field's own: the union corpus the other fields use plus the domestic seasons of the sixteen leagues its entrants play in that the union corpus lacks (ESPN where ESPN carries them, API-Football for Poland, Croatia, Hungary, Bulgaria, Slovenia, Armenia, Czechia, Israel, Cyprus and Liga Portugal 2) and the 2026 UEFA ties before the first league-phase kickoff. Overall is the Elo chain at ten passes; attack and defence are the goals measurement on the same corpus, each club with its own 95% interval. Seven clubs are below the floor: Armenia and Slovenia clear it at no pass count, and the Austrian Bundesliga, the HNL and the Eredivisie clear it at five and not at ten, the pin the preregistered rule picks. Torreense's Elo is filed under the Primeira Liga by its two promotion play-off fixtures, while its attack and defence are read on its own 2025-26 Liga Portugal 2 round-robin. Lillestrom played no UEFA tie in the window and is placed by Eliteserien 2026 alone. This field is its own measurement and is never merged with or ranked against another cup's.",
    "shape": "HOLLOW",
    "size": 36
   },
   "form": {
    "fav": "WLDW",
    "opp": "WDWL",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. A Europa League tie usually pairs two countries' tables. The two clubs are rated on different tables (or one of them on none), and subtracting figures measured on different populations would invent a gap that was never measured. The tiers survive because they are WITHIN-LEAGUE quintiles by construction.",
   "gdg_gap": null,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Crystal Palace",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Lyon",
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
   "home": "Lyon",
   "in_play": false,
   "kalshi": {
    "ask_c": 31,
    "ask_size": 673,
    "bid_c": 30,
    "bid_size": 1296,
    "event_ticker": "KXUELGAME-26OCT15OLCRY",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUELGAME-26OCT15OLCRY-CRY"
   },
   "kickoff": "2026-10-15T16:45Z",
   "league": "uel",
   "league_gap": {
    "basis": "TWO LEAGUES MEETING — NOT THESE TWO CLUBS. It is the goal difference a league-AVERAGE club of the favourite's league would have against a league-average club of the opponent's, read off the cross-league goals model as exp(mu + attack - defence) each way. Neither club enters it: swap either side for the bottom of its own table and this number does not move. The levels are the SELECTION-CORRECTED ones — fitted with each club's own domestic deviation held fixed, so a league is not credited with the quality of the few clubs that qualify for Europe. It is not a forecast of this fixture, not a scoreline, and not a gap between the two sides: the clubs' own cross-league ratings are the `field` block and their own-league margins are `own_gdg`.",
    "ga": 0.7906094568650074,
    "gd": 0.6661692146296988,
    "gf": 1.4567786714947062,
    "leagues": {
     "fav": "epl",
     "opp": "ligue1"
    },
    "measured_as": {
     "fav": "epl",
     "opp": "ligue-1"
    }
   },
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "CRY",
     "h": "LYON"
    },
    "market": {
     "a": 0.303922,
     "d": 0.264706,
     "h": 0.431373
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 31,
       "ask_size": 673,
       "bid_c": 30,
       "bid_size": 1296,
       "spread_c": 1,
       "ticker": "KXUELGAME-26OCT15OLCRY-CRY"
      },
      "d": {
       "ask_c": 27,
       "ask_size": 14193,
       "bid_c": 26,
       "bid_size": 58,
       "spread_c": 1,
       "ticker": "KXUELGAME-26OCT15OLCRY-TIE"
      },
      "h": {
       "ask_c": 44,
       "ask_size": 86,
       "bid_c": 43,
       "bid_size": 466,
       "spread_c": 1,
       "ticker": "KXUELGAME-26OCT15OLCRY-OL"
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
   "opponent": "Lyon",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": -1.02844427244582
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 12,
    "opp": 5
   },
   "rated_in": {
    "away": "epl",
    "home": "ligue1"
   },
   "rates": {
    "ga": [
     1.588815789473684,
     0.9852941176470589
    ],
    "gdg": [
     -0.3519736842105261,
     0.6764705882352939
    ],
    "gf": [
     1.236842105263158,
     1.6617647058823528
    ],
    "ppg": [
     1.1776315789473684,
     1.7904411764705883
    ]
   },
   "refused": false,
   "reg_time_note": "KALSHI LISTS KXUELGAME (\"UEFA Europa League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "resolution": {
    "Crystal Palace": "exact",
    "Lyon": "exact"
   },
   "shape": "HOLLOW",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": -2,
    "def": -3,
    "ovr": -2
   },
   "tiers": {
    "atk": [
     4,
     2
    ],
    "def": [
     4,
     1
    ],
    "ovr": [
     4,
     2
    ]
   },
   "venue": {
    "city": "Lyon",
    "country": "France",
    "name": "Groupama Stadium"
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
    "home": 0.375,
    "k": 10.0,
    "min": 0.375
   }
  },
  {
   "away": "Juventus",
   "column": "uel",
   "columns": [
    "uel"
   ],
   "competition_id": "401915560",
   "cross_league": true,
   "current_only": {
    "favourite": "Juventus",
    "gdg_gap": null,
    "ppg_gap": null,
    "rank_gap": null,
    "reoriented": false,
    "signed_from": "Juventus"
   },
   "espn": "uefa.europa",
   "event_id": "401915560",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Juventus",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.2857050692989636,
       "interval": [
        0.3114599394149768,
        0.882870078012904
       ],
       "rank": 10,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.5971650087139404
      },
      "label": "attack",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.2678994192892291,
       "interval": [
        0.4375852908569121,
        0.9733841294353703
       ],
       "rank": 8,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.7054847101461412
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": false,
       "half_width_95": 0.3021425003851698,
       "interval": [
        0.42320613588072936,
        1.027491136651069
       ],
       "rank": 5,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.7253486362658992
      },
      "label": "defence",
      "opp": {
       "below_floor": false,
       "half_width_95": 0.3276933510106318,
       "interval": [
        0.07095889427825397,
        0.7263455962995176
       ],
       "rank": 13,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.39865224528888576
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 37.03471990418977,
       "interval": [
        1779.8471486435824,
        1853.916588451962
       ],
       "rank": 5,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1816.8818685477722
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 56.35232517974153,
       "interval": [
        1721.595515536908,
        1834.3001658963908
       ],
       "rank": 13,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "value": 1777.9478407166494
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
     "fav": "Juventus",
     "opp": "Celta Vigo"
    },
    "competition": "uel",
    "field_basis": "the 36 entrants of the 2026-27 Europa League league phase, on three axes, on a corpus of the field's own: the union corpus the other fields use plus the domestic seasons of the sixteen leagues its entrants play in that the union corpus lacks (ESPN where ESPN carries them, API-Football for Poland, Croatia, Hungary, Bulgaria, Slovenia, Armenia, Czechia, Israel, Cyprus and Liga Portugal 2) and the 2026 UEFA ties before the first league-phase kickoff. Overall is the Elo chain at ten passes; attack and defence are the goals measurement on the same corpus, each club with its own 95% interval. Seven clubs are below the floor: Armenia and Slovenia clear it at no pass count, and the Austrian Bundesliga, the HNL and the Eredivisie clear it at five and not at ten, the pin the preregistered rule picks. Torreense's Elo is filed under the Primeira Liga by its two promotion play-off fixtures, while its attack and defence are read on its own 2025-26 Liga Portugal 2 round-robin. Lillestrom played no UEFA tie in the window and is placed by Eliteserien 2026 alone. This field is its own measurement and is never merged with or ranked against another cup's.",
    "shape": "SPLIT",
    "size": 36
   },
   "form": {
    "fav": "DLWD",
    "opp": "DDDWD",
    "scope": "its own league",
    "scope_is_cup": false
   },
   "gap_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. A Europa League tie usually pairs two countries' tables. The two clubs are rated on different tables (or one of them on none), and subtracting figures measured on different populations would invent a gap that was never measured. The tiers survive because they are WITHIN-LEAGUE quintiles by construction.",
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
      "corpus_name": "Juventus",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Celta Vigo",
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
   "home": "Celta Vigo",
   "in_play": false,
   "kalshi": {
    "ask_c": 46,
    "ask_size": 137,
    "bid_c": 45,
    "bid_size": 1691,
    "event_ticker": "KXUELGAME-26OCT15RCCJUV",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUELGAME-26OCT15RCCJUV-JUV"
   },
   "kickoff": "2026-10-15T19:00Z",
   "league": "uel",
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
     "a": "JUV",
     "h": "CEL"
    },
    "market": {
     "a": 0.455446,
     "d": 0.277228,
     "h": 0.267327
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 46,
       "ask_size": 137,
       "bid_c": 45,
       "bid_size": 1691,
       "spread_c": 1,
       "ticker": "KXUELGAME-26OCT15RCCJUV-JUV"
      },
      "d": {
       "ask_c": 28,
       "ask_size": 78,
       "bid_c": 27,
       "bid_size": 1212,
       "spread_c": 1,
       "ticker": "KXUELGAME-26OCT15RCCJUV-TIE"
      },
      "h": {
       "ask_c": 27,
       "ask_size": 1330,
       "bid_c": 25,
       "bid_size": 4669,
       "spread_c": 2,
       "ticker": "KXUELGAME-26OCT15RCCJUV-RCC"
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
   "opponent": "Celta Vigo",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 0.5098684210526315
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 7,
    "opp": 11
   },
   "rated_in": {
    "away": "seriea",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     0.8717105263157895,
     1.0350877192982455
    ],
    "gdg": [
     0.6940789473684211,
     0.1842105263157896
    ],
    "gf": [
     1.5657894736842106,
     1.219298245614035
    ],
    "ppg": [
     1.8223684210526316,
     1.2339181286549707
    ]
   },
   "refused": false,
   "reg_time_note": "KALSHI LISTS KXUELGAME (\"UEFA Europa League Game\") in its public Sports series listing (archived research_archive/kalshi_tape_2026-08-29/series_discovery.json). Its markets' settlement wording has NOT been read here, so no settlement rule is claimed for this competition. Every Kalshi soccer GAME series read so far (UCL, Leagues Cup, EFL Cup) settles on 90 minutes plus stoppage — that is a pattern, not a measurement of this series.",
   "resolution": {
    "Celta Vigo": "exact",
    "Juventus": "exact"
   },
   "shape": "SPLIT",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 2,
    "def": 0,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     2,
     4
    ],
    "def": [
     1,
     1
    ],
    "ovr": [
     2,
     3
    ]
   },
   "venue": {
    "city": "Vigo",
    "country": "Spain",
    "name": "Balaidos"
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
};
export const CUPS_RULES_REVIEW = {
 "back": 8,
 "date": "20261013",
 "finished": [
  {
   "away": "CF San Rafael",
   "column": "copadelrey",
   "columns": [
    "copadelrey"
   ],
   "competition_id": "401918752",
   "espn": "esp.copa_del_rey",
   "event_id": "401918752",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "AE Prat",
   "kickoff": "2026-10-11T14:00Z",
   "kind": "cup",
   "league": "copadelrey",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "unavailable",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read for this fixture, and a cup cannot be rebuilt from the archive: A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key.",
    "reconstructed_from": null,
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "cup_has_no_season_archive"
   },
   "result": {
    "away": 0,
    "home": 5,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Sporting Hortaleza",
   "column": "copadelrey",
   "columns": [
    "copadelrey"
   ],
   "competition_id": "401918758",
   "espn": "esp.copa_del_rey",
   "event_id": "401918758",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Atlético Unión Güímar",
   "kickoff": "2026-10-11T11:00Z",
   "kind": "cup",
   "league": "copadelrey",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "unavailable",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read for this fixture, and a cup cannot be rebuilt from the archive: A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key.",
    "reconstructed_from": null,
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "cup_has_no_season_archive"
   },
   "result": {
    "away": 3,
    "home": 3,
    "source": "espn_scoreboard",
    "winner": "draw"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": null,
    "outcome_basis": null,
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "AET"
  }
 ],
 "folded": {},
 "generated_at": "2026-10-13T05:39:38.358897+00:00",
 "lead_band_ladder": [
  {
   "band": "near_kickoff",
   "ceiling_seconds": 10800.0,
   "means": "taken within 3h of kickoff — the table is final and the book is open. The tightest rung, and the one the scheduled capture sweep aims at"
  },
  {
   "band": "matchday",
   "ceiling_seconds": 172800.0,
   "means": "taken within 2 days — inside the window /api/picker/board serves when nobody asks for another"
  },
  {
   "band": "approach",
   "ceiling_seconds": 1209600.0,
   "means": "taken within 14 days — inside the widest window that route will serve at all"
  },
  {
   "band": "far",
   "ceiling_seconds": null,
   "means": "taken more than 14 days out, which is wider than the board route will serve: this read could only have been frozen by a caller naming a future `date`. It is a table read about a fixture whose clubs will play several more times first, and it is NOT comparable evidence to a read taken near kickoff"
  }
 ],
 "leagues": {
  "campeondecampeones": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "campeones": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "communityshield": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "concacafcc": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "copadelrey": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 2,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 2
  },
  "coppaitalia": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "coupedefrance": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "dfbpokal": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "dflsupercup": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "eflcup": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "facup": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "johancruijff": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "knvbbeker": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "leaguescup": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "supercopa": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "supercoppa": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "tropheechampions": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "ucl": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "uecl": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "uefasuper": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "uel": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  },
  "usopencup": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 0,
   "kind": "cup",
   "pre_kickoff_limit": {
    "code": "cup_has_no_season_archive",
    "why": "A CUP CANNOT BE REBUILT FROM THE ARCHIVE. The rewind in src/picker/replay.py is keyed on a LeagueSpec: it opens that league's states-<prior_slug>.json and rebuilds the table from the fixtures played by kickoff. A cup has neither half — no season file of its own, and no table to rank inside, which is the entire reason tables.CupSpec is a separate registry. Rebuilding one would mean rewinding EVERY member league's archive to the kickoff and rebuilding the cup table on top. That is NOT BUILT — a missing capability, written down as one, not an impossibility and not a fact about this fixture. What the row still carries is unaffected: the result, the shot state at all three checkpoints, the two verdicts, and — whenever the fixture was on a live board before kickoff — the real frozen CAPTURE, because the board stores a cup row under the cup's own slug (stages.compare_cup sets `league` to the cup) and this surface reads it back with the same key."
   },
   "reconstructed": 0,
   "unavailable": 0
  }
 },
 "narrowed_to": [
  "ucl",
  "uel",
  "uecl",
  "concacafcc",
  "leaguescup",
  "campeones",
  "uefasuper",
  "communityshield",
  "supercopa",
  "dflsupercup",
  "supercoppa",
  "tropheechampions",
  "johancruijff",
  "campeondecampeones",
  "facup",
  "eflcup",
  "copadelrey",
  "dfbpokal",
  "coppaitalia",
  "coupedefrance",
  "knvbbeker",
  "usopencup"
 ],
 "refusals": [],
 "store": {
  "backend": "null",
  "note": "no snapshot store is configured — set LIVE_DATABASE_URL (prod) or PICKER_SNAPSHOT_DIR (local); pre-kickoff reads are NOT being frozen",
  "writable": false
 },
 "window": {
  "from": "20261005",
  "to": "20261013"
 }
};
export const LEAGUES_RULES_BOARD = {
 "date": "20261013",
 "days": 8,
 "field_floor_note": "BELOW THE PLACEABILITY FLOOR. The floor is a test of this club's LEAGUE, taken on the Elo measurement at this field's pinned pass count, and the league did not pass it: it is not connected to the reference leagues (C1), or more than half of its cross-league level is still the 1500 starting prior (C2), or its clubs' median 95% interval does not fit inside one fifth of the field's spread (C3) — or the club has no league attribution at all (no league). So the evidence does not place this club in a tier. The value and the 95% interval beside it are this club's own measurement on this axis and are shown as measured; the mark is its league's verdict carried onto every axis, and it does not say that this club's interval is wider than a placed club's. It is ranked with everyone else because a club the evidence cannot place is not thereby a worse club; dropping it to the bottom would state exactly that.",
 "field_unit_notes": {
  "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
  "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better — the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
 },
 "folded": {},
 "generated_at": "2026-10-13T05:39:45.528622+00:00",
 "leagues": {
  "bundesliga": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 15,
   "kind": "league",
   "min_current_gp": 5,
   "season": {
    "last_played": "2026-10-11",
    "next_fixture": "2026-10-23",
    "state": "in_season"
   },
   "src": "prior"
  },
  "epl": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 17,
   "kind": "league",
   "min_current_gp": 6,
   "season": {
    "last_played": "2026-10-12",
    "next_fixture": "2026-10-23",
    "state": "in_season"
   },
   "src": "prior"
  },
  "eredivisie": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 15,
   "kind": "league",
   "min_current_gp": 8,
   "season": {
    "last_played": "2026-10-11",
    "next_fixture": "2026-10-23",
    "state": "in_season"
   },
   "src": "prior"
  },
  "laliga": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 17,
   "kind": "league",
   "min_current_gp": 6,
   "season": {
    "last_played": "2026-10-12",
    "next_fixture": "2026-10-21",
    "state": "in_season"
   },
   "src": "prior"
  },
  "ligamx": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 18,
   "kind": "league",
   "min_current_gp": 10,
   "season": {
    "last_played": "2026-10-11",
    "next_fixture": "2026-10-21",
    "state": "in_season"
   },
   "src": "current"
  },
  "ligue1": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 16,
   "kind": "league",
   "min_current_gp": 6,
   "season": {
    "last_played": "2026-10-11",
    "next_fixture": "2026-10-23",
    "state": "in_season"
   },
   "src": "prior"
  },
  "mls": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 30,
   "kind": "league",
   "min_current_gp": 27,
   "season": {
    "last_played": "2026-10-11",
    "next_fixture": "2026-10-21",
    "state": "in_season"
   },
   "src": "current"
  },
  "seriea": {
   "blend_constant_w": null,
   "blend_k": 10.0,
   "clubs": 17,
   "kind": "league",
   "min_current_gp": 6,
   "season": {
    "last_played": "2026-10-12",
    "next_fixture": "2026-10-23",
    "state": "in_season"
   },
   "src": "prior"
  }
 },
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
   "admission": {
    "basis_when_admitted": "current_only",
    "games_until_rated": 4,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "gp": 6,
    "k": 10.0,
    "says": "Hull City has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 6; 4 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "away": "Hull City",
   "club": "Hull City",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401878770",
   "espn": "eng.1",
   "event_id": "401878770",
   "form": {
    "away": "DDLD",
    "home": "LDDL",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Hull City",
      "resolved_by": "name_join"
     },
     "home": {
      "corpus_name": "Fulham",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-08, corpus to 2026-05-16; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-16",
     "from": "2024-08-13",
     "label": "since 2024-08, corpus to 2026-05-16; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Fulham",
   "in_play": false,
   "kalshi": {
    "ask_c": 57,
    "ask_size": 989,
    "bid_c": 56,
    "bid_size": 1330,
    "event_ticker": "KXEPLGAME-26OCT17FULHUL",
    "flags": [],
    "side": "Fulham",
    "spread_c": 1,
    "ticker": "KXEPLGAME-26OCT17FULHUL-FUL"
   },
   "kickoff": "2026-10-17T14:00Z",
   "league": "epl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "HUL",
     "h": "FUL"
    },
    "market": {
     "a": 0.205882,
     "d": 0.235294,
     "h": 0.558824
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 21,
       "ask_size": 33152,
       "bid_c": 20,
       "bid_size": 28,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT17FULHUL-HUL"
      },
      "d": {
       "ask_c": 24,
       "ask_size": 7318,
       "bid_c": 23,
       "bid_size": 3323,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT17FULHUL-TIE"
      },
      "h": {
       "ask_c": 57,
       "ask_size": 989,
       "bid_c": 56,
       "bid_size": 1330,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT17FULHUL-FUL"
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
   "opponent_row": {
    "basis": "blend",
    "club": "Fulham",
    "ga": 1.463815789473684,
    "gdg": -0.3157894736842104,
    "gf": 1.1480263157894737,
    "gp_current": 6,
    "of": 17,
    "ppg": 0.9802631578947368,
    "rank": 16,
    "rated": true,
    "rated_in": "epl",
    "resolved_by": "exact",
    "table_club": "Fulham",
    "table_note": null,
    "weight": 0.375
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "case": "below_admission",
    "reason": "no_prior_row",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": null,
   "sides": null,
   "state": "pre",
   "this_season": {
    "club": "Hull City",
    "ga": 1.0,
    "gdg": 0.3333333333333333,
    "gf": 1.3333333333333333,
    "gp": 6,
    "ppg": 1.5,
    "rated_in": "epl",
    "rates_absent": null,
    "resolved_by": "exact",
    "table_club": "Hull City"
   },
   "venue": {
    "city": "London",
    "country": "England",
    "name": "Craven Cottage"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   }
  },
  {
   "admission": {
    "basis_when_admitted": "current_only",
    "games_until_rated": 2,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "gp": 8,
    "k": 10.0,
    "says": "Deportivo has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 8; 2 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "away": "Levante",
   "club": "Deportivo",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882844",
   "espn": "esp.1",
   "event_id": "401882844",
   "form": {
    "away": "DLLD",
    "home": "WDLDL",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Levante",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": null,
      "resolved_by": "ambiguous:9"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no head-to-head: Deportivo (ambiguous:9) did not resolve to one corpus club. An ambiguous or unknown club is refused, never guessed",
    "source": "club_corpus",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": null
   },
   "home": "Deportivo",
   "in_play": false,
   "kalshi": {
    "ask_c": 47,
    "ask_size": 2255,
    "bid_c": 45,
    "bid_size": 4623,
    "event_ticker": "KXLALIGAGAME-26OCT16DEPLEV",
    "flags": [],
    "side": "Deportivo",
    "spread_c": 2,
    "ticker": "KXLALIGAGAME-26OCT16DEPLEV-DEP"
   },
   "kickoff": "2026-10-16T19:00Z",
   "league": "laliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "LEV",
     "h": "DEP"
    },
    "market": {
     "a": 0.267327,
     "d": 0.267327,
     "h": 0.465347
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 27,
       "ask_size": 32,
       "bid_c": 26,
       "bid_size": 569,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT16DEPLEV-LEV"
      },
      "d": {
       "ask_c": 27,
       "ask_size": 202,
       "bid_c": 26,
       "bid_size": 3429,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT16DEPLEV-TIE"
      },
      "h": {
       "ask_c": 47,
       "ask_size": 2255,
       "bid_c": 45,
       "bid_size": 4623,
       "spread_c": 2,
       "ticker": "KXLALIGAGAME-26OCT16DEPLEV-DEP"
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
    "club": "Levante",
    "ga": 1.8266253869969042,
    "gdg": -0.4520123839009291,
    "gf": 1.3746130030959751,
    "gp_current": 7,
    "of": 17,
    "ppg": 1.0030959752321982,
    "rank": 15,
    "rated": true,
    "rated_in": "laliga",
    "resolved_by": "exact",
    "table_club": "Levante",
    "table_note": null,
    "weight": 0.4117647058823529
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "case": "below_admission",
    "reason": "no_prior_row",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": null,
   "sides": null,
   "state": "pre",
   "this_season": {
    "club": "Deportivo",
    "ga": 1.375,
    "gdg": 0.125,
    "gf": 1.5,
    "gp": 8,
    "ppg": 1.25,
    "rated_in": "laliga",
    "rates_absent": null,
    "resolved_by": "exact",
    "table_club": "Deportivo"
   },
   "venue": {
    "city": "La Coruña",
    "country": "Spain",
    "name": "Riazor"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   }
  },
  {
   "admission": {
    "basis_when_admitted": "current_only",
    "games_until_rated": 5,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "gp": 5,
    "k": 10.0,
    "says": "Schalke 04 has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 5; 5 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "away": "Mainz",
   "club": "Schalke 04",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884765",
   "espn": "ger.1",
   "event_id": "401884765",
   "form": {
    "away": "WLWL",
    "home": "DWDL",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "FSV Mainz 05",
      "resolved_by": "contained"
     },
     "home": {
      "corpus_name": "FC Schalke 04",
      "resolved_by": "normalised_outside_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-08, corpus to 2026-05-23; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-05-23",
     "from": "2024-08-16",
     "label": "since 2024-08, corpus to 2026-05-23; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Schalke 04",
   "in_play": false,
   "kalshi": {
    "ask_c": 33,
    "ask_size": 1979,
    "bid_c": 31,
    "bid_size": 822,
    "event_ticker": "KXBUNDESLIGAGAME-26OCT17SCHM05",
    "flags": [],
    "side": "Schalke 04",
    "spread_c": 2,
    "ticker": "KXBUNDESLIGAGAME-26OCT17SCHM05-SCH"
   },
   "kickoff": "2026-10-17T13:30Z",
   "league": "bundesliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "M05",
     "h": "S04"
    },
    "market": {
     "a": 0.427184,
     "d": 0.252427,
     "h": 0.320388
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 44,
       "ask_size": 4286,
       "bid_c": 42,
       "bid_size": 38,
       "spread_c": 2,
       "ticker": "KXBUNDESLIGAGAME-26OCT17SCHM05-M05"
      },
      "d": {
       "ask_c": 26,
       "ask_size": 67,
       "bid_c": 25,
       "bid_size": 500,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17SCHM05-TIE"
      },
      "h": {
       "ask_c": 33,
       "ask_size": 1979,
       "bid_c": 31,
       "bid_size": 822,
       "spread_c": 2,
       "ticker": "KXBUNDESLIGAGAME-26OCT17SCHM05-SCH"
      }
     },
     "overround": 1.03,
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
   "opponent_row": {
    "basis": "blend",
    "club": "Mainz",
    "ga": 1.7058823529411766,
    "gdg": 0.0235294117647058,
    "gf": 1.7294117647058824,
    "gp_current": 5,
    "of": 15,
    "ppg": 1.2509803921568627,
    "rank": 9,
    "rated": true,
    "rated_in": "bundesliga",
    "resolved_by": "exact",
    "table_club": "Mainz",
    "table_note": null,
    "weight": 0.3333333333333333
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "case": "below_admission",
    "reason": "no_prior_row",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": null,
   "sides": null,
   "state": "pre",
   "this_season": {
    "club": "Schalke 04",
    "ga": 1.2,
    "gdg": -0.4,
    "gf": 0.8,
    "gp": 5,
    "ppg": 1.0,
    "rated_in": "bundesliga",
    "rates_absent": null,
    "resolved_by": "exact",
    "table_club": "Schalke 04"
   },
   "venue": {
    "city": "Gelsenkirchen",
    "country": "Germany",
    "name": "Veltins Arena"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   }
  },
  {
   "admission": {
    "basis_when_admitted": "current_only",
    "games_until_rated": 4,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "gp": 6,
    "k": 10.0,
    "says": "Frosinone has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 6; 4 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "away": "Sassuolo",
   "club": "Frosinone",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "competition_id": "401874959",
   "espn": "ita.1",
   "event_id": "401874959",
   "form": {
    "away": "DWLD",
    "home": "WDWL",
    "scope": "Serie A",
    "scope_is_cup": false
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Sassuolo",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Frosinone",
      "resolved_by": "exact_outside_league"
     }
    },
    "last_meeting": {
     "away": "Frosinone",
     "away_score": 1,
     "competition": "coppa-italia",
     "completed": true,
     "date": "2026-09-02T13:00:00+00:00",
     "home": "Sassuolo",
     "home_score": 1,
     "season": 2026,
     "shootout": true,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Frosinone",
      "away_score": 1,
      "competition": "coppa-italia",
      "completed": true,
      "date": "2026-09-02T13:00:00+00:00",
      "home": "Sassuolo",
      "home_score": 1,
      "season": 2026,
      "shootout": true,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 1,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-03",
     "corpus_to": "2026-09-15",
     "from": "2024-08-03",
     "label": "since 2024-08, corpus to 2026-09-15; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Frosinone",
   "in_play": false,
   "kalshi": {
    "ask_c": 38,
    "ask_size": 956,
    "bid_c": 37,
    "bid_size": 121,
    "event_ticker": "KXSERIEAGAME-26OCT16FROSAS",
    "flags": [],
    "side": "Frosinone",
    "spread_c": 1,
    "ticker": "KXSERIEAGAME-26OCT16FROSAS-FRO"
   },
   "kickoff": "2026-10-16T18:45Z",
   "league": "seriea",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "SAS",
     "h": "FRO"
    },
    "market": {
     "a": 0.362745,
     "d": 0.264706,
     "h": 0.372549
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 37,
       "ask_size": 5186,
       "bid_c": 35,
       "bid_size": 2836,
       "spread_c": 2,
       "ticker": "KXSERIEAGAME-26OCT16FROSAS-SAS"
      },
      "d": {
       "ask_c": 27,
       "ask_size": 2826,
       "bid_c": 26,
       "bid_size": 10,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT16FROSAS-TIE"
      },
      "h": {
       "ask_c": 38,
       "ask_size": 956,
       "bid_c": 37,
       "bid_size": 121,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT16FROSAS-FRO"
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
   "opponent_row": {
    "basis": "blend",
    "club": "Sassuolo",
    "ga": 1.4473684210526316,
    "gdg": -0.06578947368421062,
    "gf": 1.381578947368421,
    "gp_current": 6,
    "of": 17,
    "ppg": 1.305921052631579,
    "rank": 10,
    "rated": true,
    "rated_in": "seriea",
    "resolved_by": "exact",
    "table_club": "Sassuolo",
    "table_note": null,
    "weight": 0.375
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "case": "below_admission",
    "reason": "no_prior_row",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": null,
   "sides": null,
   "state": "pre",
   "this_season": {
    "club": "Frosinone",
    "ga": 1.1666666666666667,
    "gdg": 0.3333333333333333,
    "gf": 1.5,
    "gp": 6,
    "ppg": 1.6666666666666667,
    "rated_in": "seriea",
    "rates_absent": null,
    "resolved_by": "exact",
    "table_club": "Frosinone"
   },
   "venue": {
    "city": "Frosinone",
    "country": "Italy",
    "name": "Stadio Benito Stirpe"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   }
  },
  {
   "admission": {
    "basis_when_admitted": "current_only",
    "games_until_rated": 4,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "gp": 6,
    "k": 10.0,
    "says": "Le Mans has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 6; 4 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "away": "Toulouse",
   "club": "Le Mans",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "competition_id": "401876437",
   "espn": "fra.1",
   "event_id": "401876437",
   "form": {
    "away": "LDWD",
    "home": "DDWL",
    "scope": "Ligue 1",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Toulouse",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Le Mans",
      "resolved_by": "exact_outside_league"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-11, corpus to 2026-05-22; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-11-15",
     "corpus_to": "2026-05-22",
     "from": "2024-11-15",
     "label": "since 2024-11, corpus to 2026-05-22; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Le Mans",
   "in_play": false,
   "kalshi": {
    "ask_c": 32,
    "ask_size": 1899,
    "bid_c": 31,
    "bid_size": 860,
    "event_ticker": "KXLIGUE1GAME-26OCT16MANTFC",
    "flags": [],
    "side": "Le Mans",
    "spread_c": 1,
    "ticker": "KXLIGUE1GAME-26OCT16MANTFC-MAN"
   },
   "kickoff": "2026-10-16T18:45Z",
   "league": "ligue1",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "TOU",
     "h": "MNS"
    },
    "market": {
     "a": 0.411765,
     "d": 0.27451,
     "h": 0.313725
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 42,
       "ask_size": 1596,
       "bid_c": 41,
       "bid_size": 213,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT16MANTFC-TFC"
      },
      "d": {
       "ask_c": 28,
       "ask_size": 5217,
       "bid_c": 27,
       "bid_size": 113,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT16MANTFC-TIE"
      },
      "h": {
       "ask_c": 32,
       "ask_size": 1899,
       "bid_c": 31,
       "bid_size": 860,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT16MANTFC-MAN"
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
   "opponent_row": {
    "basis": "blend",
    "club": "Toulouse",
    "ga": 1.5587121212121213,
    "gdg": -0.10606060606060619,
    "gf": 1.4526515151515151,
    "gp_current": 6,
    "of": 16,
    "ppg": 1.2083333333333333,
    "rank": 12,
    "rated": true,
    "rated_in": "ligue1",
    "resolved_by": "exact",
    "table_club": "Toulouse",
    "table_note": null,
    "weight": 0.375
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "case": "below_admission",
    "reason": "no_prior_row",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": null,
   "sides": null,
   "state": "pre",
   "this_season": {
    "club": "Le Mans",
    "ga": 2.0,
    "gdg": -0.3333333333333333,
    "gf": 1.6666666666666667,
    "gp": 6,
    "ppg": 1.0,
    "rated_in": "ligue1",
    "rates_absent": null,
    "resolved_by": "exact",
    "table_club": "Le Mans"
   },
   "venue": {
    "city": "Le Mans",
    "country": "France",
    "name": "Stade Marie-Marvingt"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   }
  },
  {
   "admission": {
    "basis_when_admitted": "current_only",
    "games_until_rated": 2,
    "gate": "a club with no prior-season row is rated only once this season's weight reaches the majority — w_current = GP/(GP+k) >= 0.5 at k = 10, which is GP >= 10",
    "gp": 8,
    "k": 10.0,
    "says": "ADO Den Haag has no prior-season row, so the board needs 10 games of this one before it can rate the club on this season alone. It has played 8; 2 to go. Until then it has no row in the table every other club is placed in, so no comparison is shown."
   },
   "away": "PSV Eindhoven",
   "club": "ADO Den Haag",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "competition_id": "401875582",
   "espn": "ned.1",
   "event_id": "401875582",
   "form": {
    "away": "WWLW",
    "home": "LLDD",
    "scope": "Eredivisie",
    "scope_is_cup": false
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "PSV Eindhoven",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "ADO Den Haag",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-08, corpus to 2026-04-19; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-09",
     "corpus_to": "2026-04-19",
     "from": "2024-08-09",
     "label": "since 2024-08, corpus to 2026-04-19; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "ADO Den Haag",
   "in_play": false,
   "kalshi": {
    "ask_c": 11,
    "ask_size": 2124,
    "bid_c": 8,
    "bid_size": 149,
    "event_ticker": "KXEREDIVISIEGAME-26OCT17ADOPSV",
    "flags": [],
    "side": "ADO Den Haag",
    "spread_c": 3,
    "ticker": "KXEREDIVISIEGAME-26OCT17ADOPSV-ADO"
   },
   "kickoff": "2026-10-17T14:30Z",
   "league": "eredivisie",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "PSV",
     "h": "ADO"
    },
    "market": {
     "a": 0.759615,
     "d": 0.134615,
     "h": 0.105769
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 79,
       "ask_size": 525,
       "bid_c": 76,
       "bid_size": 84,
       "spread_c": 3,
       "ticker": "KXEREDIVISIEGAME-26OCT17ADOPSV-PSV"
      },
      "d": {
       "ask_c": 14,
       "ask_size": 2134,
       "bid_c": 11,
       "bid_size": 305,
       "spread_c": 3,
       "ticker": "KXEREDIVISIEGAME-26OCT17ADOPSV-TIE"
      },
      "h": {
       "ask_c": 11,
       "ask_size": 2124,
       "bid_c": 8,
       "bid_size": 149,
       "spread_c": 3,
       "ticker": "KXEREDIVISIEGAME-26OCT17ADOPSV-ADO"
      }
     },
     "overround": 1.04,
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
   "opponent_row": {
    "basis": "blend",
    "club": "PSV Eindhoven",
    "ga": 1.2908496732026145,
    "gdg": 1.803921568627451,
    "gf": 3.0947712418300655,
    "gp_current": 8,
    "of": 15,
    "ppg": 2.428104575163399,
    "rank": 1,
    "rated": true,
    "rated_in": "eredivisie",
    "resolved_by": "exact",
    "table_club": "PSV Eindhoven",
    "table_note": null,
    "weight": 0.4444444444444444
   },
   "reason": "no_prior_row",
   "refusal": {
    "absent": {
     "sides": "this refusal names ONE club, and that club has no row to report a side for — which is the refusal itself. The club that does have one is `opponent_row`. A `sides` pair belongs to a refusal of the PAIRING, where both clubs are rated and it is the two orderings that cannot meet."
    },
    "carries": [
     "this_season",
     "admission",
     "opponent_row"
    ],
    "case": "below_admission",
    "reason": "no_prior_row",
    "why": "the club has no prior-season row and has not yet played enough of this one, so the blend gives it no row to compare with. Its OWN current season is measured and is reported, beside the gate it has not passed yet.",
    "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another."
   },
   "refused": true,
   "reg_time_note": null,
   "sides": null,
   "state": "pre",
   "this_season": {
    "club": "ADO Den Haag",
    "ga": 2.375,
    "gdg": -1.25,
    "gf": 1.125,
    "gp": 8,
    "ppg": 0.375,
    "rated_in": "eredivisie",
    "rates_absent": null,
    "resolved_by": "exact",
    "table_club": "ADO Den Haag"
   },
   "venue": {
    "city": "Den Haag",
    "country": "Netherlands",
    "name": "ADO Den Haag Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   }
  }
 ],
 "rows": [
  {
   "away": "Borussia Dortmund",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884769",
   "cross_league": false,
   "current_only": {
    "favourite": "Borussia Dortmund",
    "gdg_gap": 3.8,
    "ppg_gap": 1.8,
    "rank_gap": 11,
    "reoriented": false,
    "signed_from": "Borussia Dortmund"
   },
   "espn": "ger.1",
   "event_id": "401884769",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Borussia Dortmund",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 14
      },
      "opp": {
       "rank": 94
      }
     },
     "def": {
      "fav": {
       "rank": 5
      },
      "opp": {
       "rank": 85
      }
     },
     "ovr": {
      "fav": {
       "rank": 16
      },
      "opp": {
       "rank": 88
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWWD",
    "opp": "LLLW",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 2.2470588235294118,
   "gp_current": {
    "away": 5,
    "home": 5,
    "min": 5
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Borussia Dortmund",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Union Berlin",
      "resolved_by": "contained"
     }
    },
    "last_meeting": {
     "away": "Borussia Dortmund",
     "away_score": 3,
     "competition": "bundesliga",
     "completed": true,
     "date": "2026-01-24T17:30:00+00:00",
     "home": "Union Berlin",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Borussia Dortmund",
      "away_score": 1,
      "competition": "bundesliga",
      "completed": true,
      "date": "2024-10-05T13:30:00+00:00",
      "home": "Union Berlin",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Union Berlin",
      "away_score": 0,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-02-22T17:30:00+00:00",
      "home": "Borussia Dortmund",
      "home_score": 6,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Union Berlin",
      "away_score": 0,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-08-31T15:30:00+00:00",
      "home": "Borussia Dortmund",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Borussia Dortmund",
      "away_score": 3,
      "competition": "bundesliga",
      "completed": true,
      "date": "2026-01-24T17:30:00+00:00",
      "home": "Union Berlin",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 0,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-09-02",
     "from": "2024-08-16",
     "label": "since 2024-08, corpus to 2026-09-02; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "1. FC Union Berlin",
   "in_play": false,
   "kalshi": {
    "ask_c": 60,
    "ask_size": 219,
    "bid_c": 59,
    "bid_size": 436,
    "event_ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-BVB"
   },
   "kickoff": "2026-10-17T13:30Z",
   "league": "bundesliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "DOR",
     "h": "FCU"
    },
    "market": {
     "a": 0.588235,
     "d": 0.215686,
     "h": 0.196078
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 60,
       "ask_size": 219,
       "bid_c": 59,
       "bid_size": 436,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-BVB"
      },
      "d": {
       "ask_c": 22,
       "ask_size": 964,
       "bid_c": 21,
       "bid_size": 1477,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-TIE"
      },
      "h": {
       "ask_c": 20,
       "ask_size": 1059,
       "bid_c": 19,
       "bid_size": 330,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17UNIBVB-UNI"
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
   "opponent": "1. FC Union Berlin",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 2.2470588235294118
   },
   "ppg_gap": 1.2666666666666664,
   "rank_gap": 12,
   "ranks": {
    "fav": 2,
    "opp": 14
   },
   "rated_in": {
    "away": "bundesliga",
    "home": "bundesliga"
   },
   "rates": {
    "ga": [
     0.9333333333333333,
     2.2705882352941176
    ],
    "gdg": [
     1.1725490196078432,
     -1.0745098039215684
    ],
    "gf": [
     2.1058823529411765,
     1.1960784313725492
    ],
    "ppg": [
     2.2980392156862743,
     1.031372549019608
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "1. FC Union Berlin": "exact",
    "Borussia Dortmund": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 4,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     5
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Berlin",
    "country": "Germany",
    "name": "Stadion An der Alten Försterei"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Borussia Dortmund",
    "flipped": false,
    "gdg_gap_abs": 2.2470588235294118,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.4529298823529409,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.3333333333333333,
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
   "away": "Sporting Kansas City",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "competition_id": "761866",
   "cross_league": false,
   "current_only": {
    "favourite": "Nashville SC",
    "gdg_gap": 2.5,
    "ppg_gap": 1.4642857142857144,
    "rank_gap": 29,
    "reoriented": false,
    "signed_from": "Nashville SC"
   },
   "espn": "usa.1",
   "event_id": "761866",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Nashville SC",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 44
      },
      "opp": {
       "rank": 141
      }
     },
     "def": {
      "fav": {
       "rank": 3
      },
      "opp": {
       "rank": 148
      }
     },
     "ovr": {
      "fav": {
       "rank": 76
      },
      "opp": {
       "rank": 148
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "LDWWW",
    "opp": "WLWLD",
    "scope": "MLS",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 2.0847627813572083,
   "gp_current": {
    "away": 28,
    "home": 28,
    "min": 28
   },
   "h2h": {
    "available": false,
    "identity": {
     "away": {
      "corpus_name": "Sporting Kansas City",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Nashville SC",
      "resolved_by": "exact"
     }
    },
    "last_meeting": null,
    "meetings": [],
    "reason": "no meeting in our corpus (since 2024-02, corpus to 2026-08-08; this season's results 2026-09-01 to 2026-10-13). A measured absence over that window, not a claim the clubs never met",
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-02-22",
     "corpus_to": "2026-08-08",
     "from": "2024-02-22",
     "label": "since 2024-02, corpus to 2026-08-08; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Nashville SC",
   "in_play": false,
   "kalshi": {
    "ask_c": 79,
    "ask_size": 5833,
    "bid_c": 78,
    "bid_size": 5941,
    "event_ticker": "KXMLSGAME-26OCT14NSHSKC",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXMLSGAME-26OCT14NSHSKC-NSH"
   },
   "kickoff": "2026-10-15T00:30Z",
   "league": "mls",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "SKC",
     "h": "NSH"
    },
    "market": {
     "a": 0.089109,
     "d": 0.128713,
     "h": 0.782178
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 9,
       "ask_size": 14678,
       "bid_c": 8,
       "bid_size": 8736,
       "spread_c": 1,
       "ticker": "KXMLSGAME-26OCT14NSHSKC-SKC"
      },
      "d": {
       "ask_c": 13,
       "ask_size": 17169,
       "bid_c": 12,
       "bid_size": 7885,
       "spread_c": 1,
       "ticker": "KXMLSGAME-26OCT14NSHSKC-TIE"
      },
      "h": {
       "ask_c": 79,
       "ask_size": 5833,
       "bid_c": 78,
       "bid_size": 5941,
       "spread_c": 1,
       "ticker": "KXMLSGAME-26OCT14NSHSKC-NSH"
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
   "opponent": "Sporting Kansas City",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 2.0847627813572083
   },
   "ppg_gap": 1.267634507572588,
   "rank_gap": 29,
   "ranks": {
    "fav": 1,
    "opp": 30
   },
   "rated_in": {
    "away": "mls",
    "home": "mls"
   },
   "rates": {
    "ga": [
     0.9559032716927454,
     2.331269349845201
    ],
    "gdg": [
     1.030583214793741,
     -1.0541795665634672
    ],
    "gf": [
     1.9864864864864864,
     1.2770897832817338
    ],
    "ppg": [
     2.0633001422475106,
     0.7956656346749226
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Nashville SC": "exact",
    "Sporting Kansas City": "exact"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 4,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     5
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Nashville, Tennessee",
    "country": "USA",
    "name": "GEODIS Park"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Nashville SC",
    "flipped": false,
    "gdg_gap_abs": 2.0847627813572083,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.40817862269854793,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.7368421052631579,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.7368421052631579,
    "k": 10.0,
    "min": 0.7368421052631579
   }
  },
  {
   "away": "Feyenoord Rotterdam",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "competition_id": "401875580",
   "cross_league": false,
   "current_only": {
    "favourite": "Feyenoord Rotterdam",
    "gdg_gap": 3.375,
    "ppg_gap": 1.75,
    "rank_gap": 13,
    "reoriented": false,
    "signed_from": "Feyenoord Rotterdam"
   },
   "espn": "ned.1",
   "event_id": "401875580",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Feyenoord Rotterdam",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 57
      },
      "opp": {
       "rank": 124
      }
     },
     "def": {
      "fav": {
       "rank": 121
      },
      "opp": {
       "rank": 143
      }
     },
     "ovr": {
      "fav": {
       "rank": 58
      },
      "opp": {
       "rank": 117
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWWW",
    "opp": "DLDLD",
    "scope": "Eredivisie",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 2.022875816993464,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Feyenoord",
      "resolved_by": "contained"
     },
     "home": {
      "corpus_name": "Telstar",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Telstar",
     "away_score": 1,
     "competition": "eredivisie",
     "completed": true,
     "date": "2026-02-22T19:00:00+00:00",
     "home": "Feyenoord",
     "home_score": 2,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Feyenoord",
      "away_score": 2,
      "competition": "eredivisie",
      "completed": true,
      "date": "2025-11-30T13:30:00+00:00",
      "home": "Telstar",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Telstar",
      "away_score": 1,
      "competition": "eredivisie",
      "completed": true,
      "date": "2026-02-22T19:00:00+00:00",
      "home": "Feyenoord",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 0,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-09",
     "corpus_to": "2026-05-21",
     "from": "2024-08-09",
     "label": "since 2024-08, corpus to 2026-05-21; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Telstar",
   "in_play": false,
   "kalshi": {
    "ask_c": 75,
    "ask_size": 1837,
    "bid_c": 71,
    "bid_size": 557,
    "event_ticker": "KXEREDIVISIEGAME-26OCT17TELFEY",
    "flags": [
     "WIDE"
    ],
    "spread_c": 4,
    "ticker": "KXEREDIVISIEGAME-26OCT17TELFEY-FEY"
   },
   "kickoff": "2026-10-17T18:00Z",
   "league": "eredivisie",
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "FEY",
     "h": "TEL"
    },
    "market": {
     "a": 0.721154,
     "d": 0.163462,
     "h": 0.115385
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "a",
     "legs": {
      "a": {
       "ask_c": 75,
       "ask_size": 1837,
       "bid_c": 71,
       "bid_size": 557,
       "spread_c": 4,
       "ticker": "KXEREDIVISIEGAME-26OCT17TELFEY-FEY"
      },
      "d": {
       "ask_c": 17,
       "ask_size": 1196,
       "bid_c": 14,
       "bid_size": 160,
       "spread_c": 3,
       "ticker": "KXEREDIVISIEGAME-26OCT17TELFEY-TIE"
      },
      "h": {
       "ask_c": 12,
       "ask_size": 2497,
       "bid_c": 9,
       "bid_size": 160,
       "spread_c": 3,
       "ticker": "KXEREDIVISIEGAME-26OCT17TELFEY-TEL"
      }
     },
     "overround": 1.04,
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
   "opponent": "Telstar",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 2.022875816993464
   },
   "ppg_gap": 1.235294117647059,
   "rank_gap": 12,
   "ranks": {
    "fav": 2,
    "opp": 14
   },
   "rated_in": {
    "away": "eredivisie",
    "home": "eredivisie"
   },
   "rates": {
    "ga": [
     1.107843137254902,
     1.676470588235294
    ],
    "gdg": [
     1.5359477124183005,
     -0.4869281045751632
    ],
    "gf": [
     2.6437908496732025,
     1.1895424836601307
    ],
    "ppg": [
     2.1732026143790852,
     0.9379084967320261
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Feyenoord Rotterdam": "exact",
    "Telstar": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 2,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     3
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Velsen-Zuid",
    "country": "Netherlands",
    "name": "711 Stadion"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Feyenoord Rotterdam",
    "flipped": false,
    "gdg_gap_abs": 2.022875816993464,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.4417393277310921,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "Barcelona",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882846",
   "cross_league": false,
   "current_only": {
    "favourite": "Barcelona",
    "gdg_gap": 2.75,
    "ppg_gap": 0.625,
    "rank_gap": 2,
    "reoriented": false,
    "signed_from": "Barcelona"
   },
   "espn": "esp.1",
   "event_id": "401882846",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Barcelona",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 2
      },
      "opp": {
       "rank": 24
      }
     },
     "def": {
      "fav": {
       "rank": 29
      },
      "opp": {
       "rank": 76
      }
     },
     "ovr": {
      "fav": {
       "rank": 4
      },
      "opp": {
       "rank": 32
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWWWW",
    "opp": "WWWDW",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.9239766081871346,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Barcelona",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Real Betis",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Real Betis",
     "away_score": 1,
     "competition": "la-liga",
     "completed": true,
     "date": "2026-05-17T19:15:00+00:00",
     "home": "Barcelona",
     "home_score": 3,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Barcelona",
      "away_score": 2,
      "competition": "la-liga",
      "completed": true,
      "date": "2024-12-07T15:15:00+00:00",
      "home": "Real Betis",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Betis",
      "away_score": 1,
      "competition": "copa-del-rey",
      "completed": true,
      "date": "2025-01-15T20:00:00+00:00",
      "home": "Barcelona",
      "home_score": 5,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Betis",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-04-05T19:00:00+00:00",
      "home": "Barcelona",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Barcelona",
      "away_score": 5,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-12-06T17:30:00+00:00",
      "home": "Real Betis",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Betis",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2026-05-17T19:15:00+00:00",
      "home": "Barcelona",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 2,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-15",
     "corpus_to": "2026-05-24",
     "from": "2024-08-15",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Real Betis",
   "in_play": false,
   "kalshi": {
    "ask_c": 71,
    "ask_size": 9402,
    "bid_c": 70,
    "bid_size": 79,
    "event_ticker": "KXLALIGAGAME-26OCT17RBBBAR",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLALIGAGAME-26OCT17RBBBAR-BAR"
   },
   "kickoff": "2026-10-17T16:30Z",
   "league": "laliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "BAR",
     "h": "BET"
    },
    "market": {
     "a": 0.682692,
     "d": 0.163462,
     "h": 0.153846
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 71,
       "ask_size": 9402,
       "bid_c": 70,
       "bid_size": 79,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17RBBBAR-BAR"
      },
      "d": {
       "ask_c": 17,
       "ask_size": 5135,
       "bid_c": 16,
       "bid_size": 400,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17RBBBAR-TIE"
      },
      "h": {
       "ask_c": 16,
       "ask_size": 3063,
       "bid_c": 15,
       "bid_size": 476,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17RBBBAR-RBB"
      }
     },
     "overround": 1.04,
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
   "opponent": "Real Betis",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.9239766081871346
   },
   "ppg_gap": 0.7748538011695907,
   "rank_gap": 3,
   "ranks": {
    "fav": 1,
    "opp": 4
   },
   "rated_in": {
    "away": "laliga",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     0.915204678362573,
     1.2017543859649122
    ],
    "gdg": [
     2.3625730994152048,
     0.4385964912280702
    ],
    "gf": [
     3.2777777777777777,
     1.6403508771929824
    ],
    "ppg": [
     2.7076023391812867,
     1.932748538011696
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Barcelona": "exact",
    "Real Betis": "exact"
   },
   "shape": "SPLIT",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 1,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     1,
     2
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
    "city": "Sevilla",
    "country": "Spain",
    "name": "Estadio La Cartuja"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Barcelona",
    "flipped": false,
    "gdg_gap_abs": 1.9239766081871346,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3680569659442722,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "Genoa",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "competition_id": "401874935",
   "cross_league": false,
   "current_only": {
    "favourite": "AS Roma",
    "gdg_gap": 2.8333333333333335,
    "ppg_gap": 1.666666666666667,
    "rank_gap": 12,
    "reoriented": false,
    "signed_from": "AS Roma"
   },
   "espn": "ita.1",
   "event_id": "401874935",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "AS Roma",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 60
      },
      "opp": {
       "rank": 125
      }
     },
     "def": {
      "fav": {
       "rank": 10
      },
      "opp": {
       "rank": 92
      }
     },
     "ovr": {
      "fav": {
       "rank": 30
      },
      "opp": {
       "rank": 111
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWDD",
    "opp": "LDLW",
    "scope": "Serie A",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.6875,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Genoa",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "AS Roma",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "AS Roma",
     "away_score": 1,
     "competition": "serie-a",
     "completed": true,
     "date": "2026-03-08T17:00:00+00:00",
     "home": "Genoa",
     "home_score": 2,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "AS Roma",
      "away_score": 1,
      "competition": "serie-a",
      "completed": true,
      "date": "2024-09-15T10:30:00+00:00",
      "home": "Genoa",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Genoa",
      "away_score": 1,
      "competition": "serie-a",
      "completed": true,
      "date": "2025-01-17T19:45:00+00:00",
      "home": "AS Roma",
      "home_score": 3,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Genoa",
      "away_score": 1,
      "competition": "serie-a",
      "completed": true,
      "date": "2025-12-29T19:45:00+00:00",
      "home": "AS Roma",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "AS Roma",
      "away_score": 1,
      "competition": "serie-a",
      "completed": true,
      "date": "2026-03-08T17:00:00+00:00",
      "home": "Genoa",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 1,
     "draw": 1,
     "home": 2
    },
    "window": {
     "corpus_from": "2024-08-03",
     "corpus_to": "2026-05-24",
     "from": "2024-08-03",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "AS Roma",
   "in_play": false,
   "kalshi": {
    "ask_c": 71,
    "ask_size": 82,
    "bid_c": 70,
    "bid_size": 1365,
    "event_ticker": "KXSERIEAGAME-26OCT17ROMGEN",
    "flags": [
     "THIN"
    ],
    "spread_c": 1,
    "ticker": "KXSERIEAGAME-26OCT17ROMGEN-ROM"
   },
   "kickoff": "2026-10-17T18:45Z",
   "league": "seriea",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "GEN",
     "h": "ROMA"
    },
    "market": {
     "a": 0.108911,
     "d": 0.188119,
     "h": 0.70297
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 11,
       "ask_size": 79,
       "bid_c": 10,
       "bid_size": 1883,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT17ROMGEN-GEN"
      },
      "d": {
       "ask_c": 19,
       "ask_size": 4570,
       "bid_c": 18,
       "bid_size": 830,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT17ROMGEN-TIE"
      },
      "h": {
       "ask_c": 71,
       "ask_size": 82,
       "bid_c": 70,
       "bid_size": 1365,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT17ROMGEN-ROM"
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
   "opponent": "Genoa",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.6875
   },
   "ppg_gap": 1.151315789473684,
   "rank_gap": 15,
   "ranks": {
    "fav": 2,
    "opp": 17
   },
   "rated_in": {
    "away": "seriea",
    "home": "seriea"
   },
   "rates": {
    "ga": [
     0.6973684210526315,
     1.526315789473684
    ],
    "gdg": [
     1.148026315789474,
     -0.5394736842105261
    ],
    "gf": [
     1.8453947368421053,
     0.986842105263158
    ],
    "ppg": [
     2.075657894736842,
     0.924342105263158
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "AS Roma": "exact",
    "Genoa": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 3,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     4
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Roma",
    "country": "Italy",
    "name": "Olimpico"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "AS Roma",
    "flipped": false,
    "gdg_gap_abs": 1.6875,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.3273391253869967,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "Internazionale",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "competition_id": "401874953",
   "cross_league": false,
   "current_only": {
    "favourite": "Internazionale",
    "gdg_gap": 2.0,
    "ppg_gap": 1.833333333333333,
    "rank_gap": 12,
    "reoriented": false,
    "signed_from": "Internazionale"
   },
   "espn": "ita.1",
   "event_id": "401874953",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Internazionale",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 8
      },
      "opp": {
       "rank": 99
      }
     },
     "def": {
      "fav": {
       "rank": 32
      },
      "opp": {
       "rank": 73
      }
     },
     "ovr": {
      "fav": {
       "rank": 11
      },
      "opp": {
       "rank": 57
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWDW",
    "opp": "DLDW",
    "scope": "Serie A",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.588815789473684,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Inter",
      "resolved_by": "contained"
     },
     "home": {
      "corpus_name": "Bologna",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Inter",
     "away_score": 3,
     "competition": "serie-a",
     "completed": true,
     "date": "2026-05-23T16:00:00+00:00",
     "home": "Bologna",
     "home_score": 3,
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Bologna",
      "away_score": 2,
      "competition": "serie-a",
      "completed": true,
      "date": "2025-01-15T19:45:00+00:00",
      "home": "Inter",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Inter",
      "away_score": 0,
      "competition": "serie-a",
      "completed": true,
      "date": "2025-04-20T16:00:00+00:00",
      "home": "Bologna",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Bologna",
      "away_score": 1,
      "competition": "serie-a",
      "completed": true,
      "date": "2026-01-04T19:45:00+00:00",
      "home": "Inter",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Inter",
      "away_score": 3,
      "competition": "serie-a",
      "completed": true,
      "date": "2026-05-23T16:00:00+00:00",
      "home": "Bologna",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 1,
     "draw": 2,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-07-09",
     "corpus_to": "2026-05-24",
     "from": "2024-07-09",
     "label": "since 2024-07, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Bologna",
   "in_play": false,
   "kalshi": {
    "ask_c": 62,
    "ask_size": 6126,
    "bid_c": 61,
    "bid_size": 455,
    "event_ticker": "KXSERIEAGAME-26OCT17BFCINT",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXSERIEAGAME-26OCT17BFCINT-INT"
   },
   "kickoff": "2026-10-17T16:00Z",
   "league": "seriea",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "INT",
     "h": "BOL"
    },
    "market": {
     "a": 0.607843,
     "d": 0.235294,
     "h": 0.156863
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 62,
       "ask_size": 6126,
       "bid_c": 61,
       "bid_size": 455,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT17BFCINT-INT"
      },
      "d": {
       "ask_c": 24,
       "ask_size": 7357,
       "bid_c": 22,
       "bid_size": 3757,
       "spread_c": 2,
       "ticker": "KXSERIEAGAME-26OCT17BFCINT-TIE"
      },
      "h": {
       "ask_c": 16,
       "ask_size": 4354,
       "bid_c": 15,
       "bid_size": 3782,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT17BFCINT-BFC"
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
   "opponent": "Bologna",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.588815789473684
   },
   "ppg_gap": 1.1973684210526314,
   "rank_gap": 10,
   "ranks": {
    "fav": 1,
    "opp": 11
   },
   "rated_in": {
    "away": "seriea",
    "home": "seriea"
   },
   "rates": {
    "ga": [
     1.075657894736842,
     1.194078947368421
    ],
    "gdg": [
     1.513157894736842,
     -0.07565789473684204
    ],
    "gf": [
     2.588815789473684,
     1.118421052631579
    ],
    "ppg": [
     2.4309210526315788,
     1.2335526315789473
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Bologna": "exact",
    "Internazionale": "exact"
   },
   "shape": "SPLIT",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 0,
    "ovr": 2
   },
   "tiers": {
    "atk": [
     1,
     4
    ],
    "def": [
     3,
     3
    ],
    "ovr": [
     1,
     3
    ]
   },
   "venue": {
    "city": "Bologna",
    "country": "Italy",
    "name": "Renato Dall'Ara"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Internazionale",
    "flipped": false,
    "gdg_gap_abs": 1.588815789473684,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3273391253869967,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "Vancouver Whitecaps",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "competition_id": "761882",
   "cross_league": false,
   "current_only": {
    "favourite": "Vancouver Whitecaps",
    "gdg_gap": 1.6428571428571426,
    "ppg_gap": 0.7142857142857142,
    "rank_gap": 23,
    "reoriented": false,
    "signed_from": "Vancouver Whitecaps"
   },
   "espn": "usa.1",
   "event_id": "761882",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Vancouver Whitecaps",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 17
      },
      "opp": {
       "rank": 116
      }
     },
     "def": {
      "fav": {
       "rank": 7
      },
      "opp": {
       "rank": 134
      }
     },
     "ovr": {
      "fav": {
       "rank": 78
      },
      "opp": {
       "rank": 133
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "LWDLD",
    "opp": "DWDDL",
    "scope": "MLS",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.5074224021592444,
   "gp_current": {
    "away": 28,
    "home": 28,
    "min": 28
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Vancouver Whitecaps",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Austin",
      "resolved_by": "normalised"
     }
    },
    "last_meeting": {
     "away": "Austin FC",
     "away_score": 2,
     "competition": "board_form_sweep",
     "completed": true,
     "date": "2026-09-13T22:30Z",
     "home": "Vancouver Whitecaps",
     "home_score": 1,
     "season": null,
     "source": "board_sweep",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Austin",
      "away_score": 0,
      "competition": "mls",
      "completed": true,
      "date": "2024-05-05T02:30:00+00:00",
      "home": "Vancouver Whitecaps",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Vancouver Whitecaps",
      "away_score": 1,
      "competition": "mls",
      "completed": true,
      "date": "2024-09-01T00:30:00+00:00",
      "home": "Austin",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Austin",
      "away_score": 1,
      "competition": "mls",
      "completed": true,
      "date": "2025-04-12T23:30:00+00:00",
      "home": "Vancouver Whitecaps",
      "home_score": 5,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Vancouver Whitecaps",
      "away_score": 0,
      "competition": "mls",
      "completed": true,
      "date": "2025-05-18T00:30:00+00:00",
      "home": "Austin",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Austin FC",
      "away_score": 2,
      "competition": "board_form_sweep",
      "completed": true,
      "date": "2026-09-13T22:30Z",
      "home": "Vancouver Whitecaps",
      "home_score": 1,
      "season": null,
      "source": "board_sweep",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 2,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-02-22",
     "corpus_to": "2026-08-12",
     "from": "2024-02-22",
     "label": "since 2024-02, corpus to 2026-08-12; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Austin FC",
   "in_play": false,
   "kalshi": {
    "ask_c": 61,
    "ask_size": 162,
    "bid_c": 57,
    "bid_size": 45,
    "event_ticker": "KXMLSGAME-26OCT17ATXVAN",
    "flags": [
     "WIDE"
    ],
    "spread_c": 4,
    "ticker": "KXMLSGAME-26OCT17ATXVAN-VAN"
   },
   "kickoff": "2026-10-18T00:30Z",
   "league": "mls",
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "VAN",
     "h": "ATX"
    },
    "market": {
     "a": 0.570093,
     "d": 0.214953,
     "h": 0.214953
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 61,
       "ask_size": 162,
       "bid_c": 57,
       "bid_size": 45,
       "spread_c": 4,
       "ticker": "KXMLSGAME-26OCT17ATXVAN-VAN"
      },
      "d": {
       "ask_c": 23,
       "ask_size": 85,
       "bid_c": 19,
       "bid_size": 102,
       "spread_c": 4,
       "ticker": "KXMLSGAME-26OCT17ATXVAN-TIE"
      },
      "h": {
       "ask_c": 23,
       "ask_size": 111,
       "bid_c": 17,
       "bid_size": 218,
       "spread_c": 6,
       "ticker": "KXMLSGAME-26OCT17ATXVAN-ATX"
      }
     },
     "overround": 1.07,
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
   "opponent": "Austin FC",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.5074224021592444
   },
   "ppg_gap": 0.6618308591992803,
   "rank_gap": 21,
   "ranks": {
    "fav": 2,
    "opp": 23
   },
   "rated_in": {
    "away": "mls",
    "home": "mls"
   },
   "rates": {
    "ga": [
     1.0931174089068825,
     1.7149122807017545
    ],
    "gdg": [
     1.024966261808367,
     -0.48245614035087736
    ],
    "gf": [
     2.1180836707152495,
     1.2324561403508771
    ],
    "ppg": [
     1.8211875843454792,
     1.159356725146199
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Austin FC": "exact",
    "Vancouver Whitecaps": "exact"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 3,
    "ovr": 3
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     4
    ],
    "ovr": [
     1,
     4
    ]
   },
   "venue": {
    "city": "Austin, Texas",
    "country": "USA",
    "name": "Q2 Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Vancouver Whitecaps",
    "flipped": false,
    "gdg_gap_abs": 1.5074224021592444,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.40817862269854793,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.7368421052631579,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.7368421052631579,
    "k": 10.0,
    "min": 0.7368421052631579
   }
  },
  {
   "away": "RB Leipzig",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884772",
   "cross_league": false,
   "current_only": {
    "favourite": "Bayern Munich",
    "gdg_gap": 0.40000000000000036,
    "ppg_gap": 0.40000000000000013,
    "rank_gap": 2,
    "reoriented": false,
    "signed_from": "Bayern Munich"
   },
   "espn": "ger.1",
   "event_id": "401884772",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Bayern Munich",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 23
      }
     },
     "def": {
      "fav": {
       "rank": 12
      },
      "opp": {
       "rank": 45
      }
     },
     "ovr": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 27
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "DWWD",
    "opp": "LWLW",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.447058823529412,
   "gp_current": {
    "away": 5,
    "home": 5,
    "min": 5
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "RB Leipzig",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Bayern München",
      "resolved_by": "alias"
     }
    },
    "last_meeting": {
     "away": "RB Leipzig",
     "away_score": 0,
     "competition": "dfb-pokal",
     "completed": true,
     "date": "2026-02-11T19:45:00+00:00",
     "home": "Bayern München",
     "home_score": 2,
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "RB Leipzig",
      "away_score": 1,
      "competition": "bundesliga",
      "completed": true,
      "date": "2024-12-20T19:30:00+00:00",
      "home": "Bayern München",
      "home_score": 5,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Bayern München",
      "away_score": 3,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-05-03T13:30:00+00:00",
      "home": "RB Leipzig",
      "home_score": 3,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "RB Leipzig",
      "away_score": 0,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-08-22T18:30:00+00:00",
      "home": "Bayern München",
      "home_score": 6,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Bayern München",
      "away_score": 5,
      "competition": "bundesliga",
      "completed": true,
      "date": "2026-01-17T17:30:00+00:00",
      "home": "RB Leipzig",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "RB Leipzig",
      "away_score": 0,
      "competition": "dfb-pokal",
      "completed": true,
      "date": "2026-02-11T19:45:00+00:00",
      "home": "Bayern München",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 1,
     "home": 4
    },
    "window": {
     "corpus_from": "2024-07-09",
     "corpus_to": "2026-09-02",
     "from": "2024-07-09",
     "label": "since 2024-07, corpus to 2026-09-02; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Bayern Munich",
   "in_play": false,
   "kalshi": {
    "ask_c": 80,
    "ask_size": 734,
    "bid_c": 78,
    "bid_size": 4081,
    "event_ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-BMU"
   },
   "kickoff": "2026-10-17T16:30Z",
   "league": "bundesliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "RBL",
     "h": "MUN"
    },
    "market": {
     "a": 0.098039,
     "d": 0.117647,
     "h": 0.784314
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 10,
       "ask_size": 5733,
       "bid_c": 9,
       "bid_size": 330,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-RBL"
      },
      "d": {
       "ask_c": 12,
       "ask_size": 2110,
       "bid_c": 11,
       "bid_size": 550,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-TIE"
      },
      "h": {
       "ask_c": 80,
       "ask_size": 734,
       "bid_c": 78,
       "bid_size": 4081,
       "spread_c": 2,
       "ticker": "KXBUNDESLIGAGAME-26OCT17BMURBL-BMU"
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
   "opponent": "RB Leipzig",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.447058823529412
   },
   "ppg_gap": 0.603921568627451,
   "rank_gap": 2,
   "ranks": {
    "fav": 1,
    "opp": 3
   },
   "rated_in": {
    "away": "bundesliga",
    "home": "bundesliga"
   },
   "rates": {
    "ga": [
     0.9725490196078432,
     1.2549019607843137
    ],
    "gdg": [
     2.4862745098039216,
     1.0392156862745097
    ],
    "gf": [
     3.458823529411765,
     2.2941176470588234
    ],
    "ppg": [
     2.4784313725490197,
     1.8745098039215686
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Bayern Munich": "exact",
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
    "city": "München",
    "country": "Germany",
    "name": "Allianz Arena"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Bayern Munich",
    "flipped": false,
    "gdg_gap_abs": 1.447058823529412,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.4529298823529409,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.3333333333333333,
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
   "away": "Go Ahead Eagles",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "competition_id": "401875578",
   "cross_league": false,
   "current_only": {
    "favourite": "Go Ahead Eagles",
    "gdg_gap": 2.125,
    "ppg_gap": 0.875,
    "rank_gap": 7,
    "reoriented": false,
    "signed_from": "Go Ahead Eagles"
   },
   "espn": "ned.1",
   "event_id": "401875578",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Go Ahead Eagles",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 109
      },
      "opp": {
       "rank": 137
      }
     },
     "def": {
      "fav": {
       "rank": 139
      },
      "opp": {
       "rank": 153
      }
     },
     "ovr": {
      "fav": {
       "rank": 126
      },
      "opp": {
       "rank": 135
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "DDDD",
    "opp": "DLLL",
    "scope": "Eredivisie",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.4019607843137252,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "GO Ahead Eagles",
      "resolved_by": "normalised"
     },
     "home": {
      "corpus_name": "PEC Zwolle",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "PEC Zwolle",
     "away_score": 0,
     "competition": "eredivisie",
     "completed": true,
     "date": "2026-04-05T10:15:00+00:00",
     "home": "GO Ahead Eagles",
     "home_score": 5,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "PEC Zwolle",
      "away_score": 2,
      "competition": "eredivisie",
      "completed": true,
      "date": "2024-11-03T11:15:00+00:00",
      "home": "GO Ahead Eagles",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "GO Ahead Eagles",
      "away_score": 1,
      "competition": "eredivisie",
      "completed": true,
      "date": "2025-05-11T10:15:00+00:00",
      "home": "PEC Zwolle",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "GO Ahead Eagles",
      "away_score": 2,
      "competition": "eredivisie",
      "completed": true,
      "date": "2025-09-21T10:15:00+00:00",
      "home": "PEC Zwolle",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "PEC Zwolle",
      "away_score": 0,
      "competition": "eredivisie",
      "completed": true,
      "date": "2026-04-05T10:15:00+00:00",
      "home": "GO Ahead Eagles",
      "home_score": 5,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 2,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-09",
     "corpus_to": "2026-05-21",
     "from": "2024-08-09",
     "label": "since 2024-08, corpus to 2026-05-21; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "PEC Zwolle",
   "in_play": false,
   "kalshi": {
    "ask_c": 50,
    "ask_size": 964,
    "bid_c": 48,
    "bid_size": 0,
    "event_ticker": "KXEREDIVISIEGAME-26OCT18ZWOGAE",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXEREDIVISIEGAME-26OCT18ZWOGAE-GAE"
   },
   "kickoff": "2026-10-18T10:15Z",
   "league": "eredivisie",
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "GAE",
     "h": "PEC"
    },
    "market": {
     "a": 0.47619,
     "d": 0.257143,
     "h": 0.266667
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "d",
     "legs": {
      "a": {
       "ask_c": 50,
       "ask_size": 964,
       "bid_c": 48,
       "bid_size": 0,
       "spread_c": 2,
       "ticker": "KXEREDIVISIEGAME-26OCT18ZWOGAE-GAE"
      },
      "d": {
       "ask_c": 27,
       "ask_size": 1300,
       "bid_c": 23,
       "bid_size": 337,
       "spread_c": 4,
       "ticker": "KXEREDIVISIEGAME-26OCT18ZWOGAE-TIE"
      },
      "h": {
       "ask_c": 28,
       "ask_size": 1416,
       "bid_c": 26,
       "bid_size": 141,
       "spread_c": 2,
       "ticker": "KXEREDIVISIEGAME-26OCT18ZWOGAE-ZWO"
      }
     },
     "overround": 1.05,
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
   "opponent": "PEC Zwolle",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.4019607843137252
   },
   "ppg_gap": 0.40522875816993476,
   "rank_gap": 4,
   "ranks": {
    "fav": 11,
    "opp": 15
   },
   "rated_in": {
    "away": "eredivisie",
    "home": "eredivisie"
   },
   "rates": {
    "ga": [
     1.8104575163398693,
     2.3267973856209148
    ],
    "gdg": [
     0.12745098039215685,
     -1.2745098039215683
    ],
    "gf": [
     1.9379084967320261,
     1.0522875816993464
    ],
    "ppg": [
     1.2320261437908497,
     0.826797385620915
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Go Ahead Eagles": "exact",
    "PEC Zwolle": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 1,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     2,
     5
    ],
    "def": [
     4,
     5
    ],
    "ovr": [
     4,
     5
    ]
   },
   "venue": {
    "city": "Zwolle",
    "country": "Netherlands",
    "name": "MAC³PARK Stadion"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Go Ahead Eagles",
    "flipped": false,
    "gdg_gap_abs": 1.4019607843137252,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.4417393277310921,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "Sevilla",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882839",
   "cross_league": false,
   "current_only": {
    "favourite": "Real Madrid",
    "gdg_gap": 1.25,
    "ppg_gap": 0.5,
    "rank_gap": 1,
    "reoriented": false,
    "signed_from": "Real Madrid"
   },
   "espn": "esp.1",
   "event_id": "401882839",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Real Madrid",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 4
      },
      "opp": {
       "rank": 61
      }
     },
     "def": {
      "fav": {
       "rank": 22
      },
      "opp": {
       "rank": 119
      }
     },
     "ovr": {
      "fav": {
       "rank": 7
      },
      "opp": {
       "rank": 89
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "LWWLW",
    "opp": "DWWLD",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.3742690058479528,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Sevilla",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Real Madrid",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Real Madrid",
     "away_score": 1,
     "competition": "la-liga",
     "completed": true,
     "date": "2026-05-17T17:00:00+00:00",
     "home": "Sevilla",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Sevilla",
      "away_score": 2,
      "competition": "la-liga",
      "completed": true,
      "date": "2024-12-22T15:15:00+00:00",
      "home": "Real Madrid",
      "home_score": 4,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Madrid",
      "away_score": 2,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-05-18T17:00:00+00:00",
      "home": "Sevilla",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Sevilla",
      "away_score": 0,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-12-20T20:00:00+00:00",
      "home": "Real Madrid",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Real Madrid",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2026-05-17T17:00:00+00:00",
      "home": "Sevilla",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 0,
     "home": 4
    },
    "window": {
     "corpus_from": "2024-08-15",
     "corpus_to": "2026-05-24",
     "from": "2024-08-15",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Real Madrid",
   "in_play": false,
   "kalshi": {
    "ask_c": 79,
    "ask_size": 3132,
    "bid_c": 78,
    "bid_size": 2,
    "event_ticker": "KXLALIGAGAME-26OCT18RMASEV",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLALIGAGAME-26OCT18RMASEV-RMA"
   },
   "kickoff": "2026-10-18T19:00Z",
   "league": "laliga",
   "model_vs_market": {
    "book_flag": "THIN",
    "codes": {
     "a": "SEV",
     "h": "RMA"
    },
    "market": {
     "a": 0.087379,
     "d": 0.145631,
     "h": 0.76699
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 9,
       "ask_size": 7,
       "bid_c": 8,
       "bid_size": 526,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT18RMASEV-SEV"
      },
      "d": {
       "ask_c": 15,
       "ask_size": 5303,
       "bid_c": 13,
       "bid_size": 1377,
       "spread_c": 2,
       "ticker": "KXLALIGAGAME-26OCT18RMASEV-TIE"
      },
      "h": {
       "ask_c": 79,
       "ask_size": 3132,
       "bid_c": 78,
       "bid_size": 2,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT18RMASEV-RMA"
      }
     },
     "overround": 1.03,
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
   "opponent": "Sevilla",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.3742690058479528
   },
   "ppg_gap": 0.8508771929824563,
   "rank_gap": 4,
   "ranks": {
    "fav": 2,
    "opp": 6
   },
   "rated_in": {
    "away": "laliga",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     0.956140350877193,
     1.543859649122807
    ],
    "gdg": [
     1.225146198830409,
     -0.14912280701754366
    ],
    "gf": [
     2.181286549707602,
     1.3947368421052633
    ],
    "ppg": [
     2.257309941520468,
     1.4064327485380117
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Real Madrid": "exact",
    "Sevilla": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 2,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     1,
     2
    ],
    "def": [
     1,
     3
    ],
    "ovr": [
     1,
     2
    ]
   },
   "venue": {
    "city": "Madrid",
    "country": "Spain",
    "name": "Santiago Bernabéu"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Real Madrid",
    "flipped": false,
    "gdg_gap_abs": 1.3742690058479528,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.3680569659442722,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "Como",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "competition_id": "401874774",
   "cross_league": false,
   "current_only": {
    "favourite": "Como",
    "gdg_gap": 1.6666666666666667,
    "ppg_gap": 1.1666666666666665,
    "rank_gap": 10,
    "reoriented": false,
    "signed_from": "Como"
   },
   "espn": "ita.1",
   "event_id": "401874774",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Como",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 41
      },
      "opp": {
       "rank": 126
      }
     },
     "def": {
      "fav": {
       "rank": 6
      },
      "opp": {
       "rank": 87
      }
     },
     "ovr": {
      "fav": {
       "rank": 39
      },
      "opp": {
       "rank": 70
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWLD",
    "opp": "LWDL",
    "scope": "Serie A",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.3651315789473684,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Como",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Fiorentina",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Fiorentina",
     "away_score": 2,
     "competition": "serie-a",
     "completed": true,
     "date": "2026-02-14T14:00:00+00:00",
     "home": "Como",
     "home_score": 1,
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Fiorentina",
      "away_score": 2,
      "competition": "serie-a",
      "completed": true,
      "date": "2024-11-24T14:00:00+00:00",
      "home": "Como",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Como",
      "away_score": 2,
      "competition": "serie-a",
      "completed": true,
      "date": "2025-02-16T11:30:00+00:00",
      "home": "Fiorentina",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Como",
      "away_score": 2,
      "competition": "serie-a",
      "completed": true,
      "date": "2025-09-21T16:00:00+00:00",
      "home": "Fiorentina",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Como",
      "away_score": 3,
      "competition": "coppa-italia",
      "completed": true,
      "date": "2026-01-27T20:00:00+00:00",
      "home": "Fiorentina",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Fiorentina",
      "away_score": 2,
      "competition": "serie-a",
      "completed": true,
      "date": "2026-02-14T14:00:00+00:00",
      "home": "Como",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 0,
     "home": 2
    },
    "window": {
     "corpus_from": "2024-08-03",
     "corpus_to": "2026-05-24",
     "from": "2024-08-03",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Fiorentina",
   "in_play": false,
   "kalshi": {
    "ask_c": 48,
    "ask_size": 6076,
    "bid_c": 46,
    "bid_size": 1936,
    "event_ticker": "KXSERIEAGAME-26OCT18FIOCOM",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXSERIEAGAME-26OCT18FIOCOM-COM"
   },
   "kickoff": "2026-10-18T13:00Z",
   "league": "seriea",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "COMO",
     "h": "FIO"
    },
    "market": {
     "a": 0.470588,
     "d": 0.254902,
     "h": 0.27451
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 48,
       "ask_size": 6076,
       "bid_c": 46,
       "bid_size": 1936,
       "spread_c": 2,
       "ticker": "KXSERIEAGAME-26OCT18FIOCOM-COM"
      },
      "d": {
       "ask_c": 26,
       "ask_size": 1135,
       "bid_c": 25,
       "bid_size": 1579,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT18FIOCOM-TIE"
      },
      "h": {
       "ask_c": 28,
       "ask_size": 1121,
       "bid_c": 27,
       "bid_size": 1832,
       "spread_c": 1,
       "ticker": "KXSERIEAGAME-26OCT18FIOCOM-FIO"
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
   "opponent": "Fiorentina",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.3651315789473684
   },
   "ppg_gap": 0.9144736842105263,
   "rank_gap": 10,
   "ranks": {
    "fav": 6,
    "opp": 16
   },
   "rated_in": {
    "away": "seriea",
    "home": "seriea"
   },
   "rates": {
    "ga": [
     0.8519736842105263,
     1.6973684210526316
    ],
    "gdg": [
     0.7796052631578947,
     -0.5855263157894737
    ],
    "gf": [
     1.631578947368421,
     1.111842105263158
    ],
    "ppg": [
     1.855263157894737,
     0.9407894736842106
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Como": "exact",
    "Fiorentina": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 4,
    "ovr": 3
   },
   "tiers": {
    "atk": [
     1,
     4
    ],
    "def": [
     1,
     5
    ],
    "ovr": [
     2,
     5
    ]
   },
   "venue": {
    "city": "Firenze",
    "country": "Italy",
    "name": "Stadio Artemio Franchi"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Como",
    "flipped": false,
    "gdg_gap_abs": 1.3651315789473684,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3273391253869967,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "FC Juárez",
   "column": "ligamx",
   "columns": [
    "ligamx"
   ],
   "competition_id": "401876939",
   "cross_league": false,
   "current_only": {
    "favourite": "Cruz Azul",
    "gdg_gap": 1.7272727272727273,
    "ppg_gap": 1.1818181818181817,
    "rank_gap": 11,
    "reoriented": false,
    "signed_from": "Cruz Azul"
   },
   "espn": "mex.1",
   "event_id": "401876939",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Cruz Azul",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 67
      },
      "opp": {
       "rank": 100
      }
     },
     "def": {
      "fav": {
       "rank": 40
      },
      "opp": {
       "rank": 130
      }
     },
     "ovr": {
      "fav": {
       "rank": 44
      },
      "opp": {
       "rank": 132
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWLDD",
    "opp": "LLWLD",
    "scope": "Liga MX",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.3422191843244475,
   "gp_current": {
    "away": 11,
    "home": 11,
    "min": 11
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "FC Juarez",
      "resolved_by": "normalised"
     },
     "home": {
      "corpus_name": "Cruz Azul",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Cruz Azul",
     "away_score": 4,
     "competition": "liga-mx",
     "completed": true,
     "date": "2026-01-31T03:06:00+00:00",
     "home": "FC Juarez",
     "home_score": 3,
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "FC Juarez",
      "away_score": 0,
      "competition": "liga-mx",
      "completed": true,
      "date": "2024-10-24T01:00:00+00:00",
      "home": "Cruz Azul",
      "home_score": 4,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Cruz Azul",
      "away_score": 0,
      "competition": "liga-mx",
      "completed": true,
      "date": "2025-01-18T23:00:00+00:00",
      "home": "FC Juarez",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "FC Juarez",
      "away_score": 2,
      "competition": "liga-mx",
      "completed": true,
      "date": "2025-09-20T01:00:00+00:00",
      "home": "Cruz Azul",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Cruz Azul",
      "away_score": 4,
      "competition": "liga-mx",
      "completed": true,
      "date": "2026-01-31T03:06:00+00:00",
      "home": "FC Juarez",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 1,
     "draw": 0,
     "home": 3
    },
    "window": {
     "corpus_from": "2024-07-05",
     "corpus_to": "2026-08-12",
     "from": "2024-07-05",
     "label": "since 2024-07, corpus to 2026-08-12; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Cruz Azul",
   "in_play": false,
   "kalshi": {
    "ask_c": 75,
    "ask_size": 6787,
    "bid_c": 72,
    "bid_size": 1164,
    "event_ticker": "KXLIGAMXGAME-26OCT17CRAJUA",
    "flags": [],
    "spread_c": 3,
    "ticker": "KXLIGAMXGAME-26OCT17CRAJUA-CRA"
   },
   "kickoff": "2026-10-18T03:00Z",
   "league": "ligamx",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "JUA",
     "h": "CAZ"
    },
    "market": {
     "a": 0.106796,
     "d": 0.165049,
     "h": 0.728155
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 11,
       "ask_size": 2166,
       "bid_c": 9,
       "bid_size": 2352,
       "spread_c": 2,
       "ticker": "KXLIGAMXGAME-26OCT17CRAJUA-JUA"
      },
      "d": {
       "ask_c": 17,
       "ask_size": 2214,
       "bid_c": 16,
       "bid_size": 1002,
       "spread_c": 1,
       "ticker": "KXLIGAMXGAME-26OCT17CRAJUA-TIE"
      },
      "h": {
       "ask_c": 75,
       "ask_size": 6787,
       "bid_c": 72,
       "bid_size": 1164,
       "spread_c": 3,
       "ticker": "KXLIGAMXGAME-26OCT17CRAJUA-CRA"
      }
     },
     "overround": 1.03,
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
   "opponent": "FC Juárez",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.3422191843244475
   },
   "ppg_gap": 0.9949874686716792,
   "rank_gap": 15,
   "ranks": {
    "fav": 3,
    "opp": 18
   },
   "rated_in": {
    "away": "ligamx",
    "home": "ligamx"
   },
   "rates": {
    "ga": [
     1.5194805194805194,
     2.0651629072681703
    ],
    "gdg": [
     0.37229437229437234,
     -0.9699248120300752
    ],
    "gf": [
     1.8917748917748918,
     1.0952380952380951
    ],
    "ppg": [
     1.7619047619047619,
     0.7669172932330827
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Cruz Azul": "exact",
    "FC Juárez": "exact"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 2,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     3,
     5
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Mexico City",
    "country": "Mexico",
    "name": "Estadio Banorte"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Cruz Azul",
    "flipped": false,
    "gdg_gap_abs": 1.3422191843244475,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.37380887461212126,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.5238095238095238,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.5238095238095238,
    "k": 10.0,
    "min": 0.5238095238095238
   }
  },
  {
   "away": "Inter Miami CF",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "competition_id": "761880",
   "cross_league": false,
   "current_only": {
    "favourite": "Inter Miami CF",
    "gdg_gap": 1.1785714285714282,
    "ppg_gap": 0.7857142857142857,
    "rank_gap": 24,
    "reoriented": false,
    "signed_from": "Inter Miami CF"
   },
   "espn": "usa.1",
   "event_id": "761880",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Inter Miami CF",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 16
      },
      "opp": {
       "rank": 142
      }
     },
     "def": {
      "fav": {
       "rank": 113
      },
      "opp": {
       "rank": 120
      }
     },
     "ovr": {
      "fav": {
       "rank": 40
      },
      "opp": {
       "rank": 146
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "DDDLW",
    "opp": "LDWDL",
    "scope": "MLS",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.3316563467492257,
   "gp_current": {
    "away": 28,
    "home": 28,
    "min": 28
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Inter Miami",
      "resolved_by": "normalised"
     },
     "home": {
      "corpus_name": "Atlanta United FC",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Atlanta United FC",
     "away_score": 2,
     "competition": "board_form_sweep",
     "completed": true,
     "date": "2026-09-06T01:05Z",
     "home": "Inter Miami CF",
     "home_score": 2,
     "season": null,
     "source": "board_sweep",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Atlanta United FC",
      "away_score": 3,
      "competition": "mls",
      "completed": true,
      "date": "2024-05-29T23:30:00+00:00",
      "home": "Inter Miami",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Inter Miami",
      "away_score": 2,
      "competition": "mls",
      "completed": true,
      "date": "2024-09-18T23:30:00+00:00",
      "home": "Atlanta United FC",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Atlanta United FC",
      "away_score": 1,
      "competition": "mls",
      "completed": true,
      "date": "2024-10-26T00:30:00+00:00",
      "home": "Inter Miami",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Inter Miami",
      "away_score": 1,
      "competition": "mls",
      "completed": true,
      "date": "2024-11-02T23:00:00+00:00",
      "home": "Atlanta United FC",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Atlanta United FC",
      "away_score": 3,
      "competition": "mls",
      "completed": true,
      "date": "2024-11-10T01:00:00+00:00",
      "home": "Inter Miami",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Inter Miami",
      "away_score": 2,
      "competition": "mls",
      "completed": true,
      "date": "2025-03-16T23:00:00+00:00",
      "home": "Atlanta United FC",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Atlanta United FC",
      "away_score": 0,
      "competition": "mls",
      "completed": true,
      "date": "2025-10-11T23:30:00+00:00",
      "home": "Inter Miami",
      "home_score": 4,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Atlanta United FC",
      "away_score": 2,
      "competition": "board_form_sweep",
      "completed": true,
      "date": "2026-09-06T01:05Z",
      "home": "Inter Miami CF",
      "home_score": 2,
      "season": null,
      "source": "board_sweep",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 2,
     "home": 3
    },
    "window": {
     "corpus_from": "2024-02-22",
     "corpus_to": "2026-08-08",
     "from": "2024-02-22",
     "label": "since 2024-02, corpus to 2026-08-08; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Atlanta United FC",
   "in_play": false,
   "kalshi": {
    "ask_c": 57,
    "ask_size": 703,
    "bid_c": 54,
    "bid_size": 2,
    "event_ticker": "KXMLSGAME-26OCT17ATLMIA",
    "flags": [],
    "spread_c": 3,
    "ticker": "KXMLSGAME-26OCT17ATLMIA-MIA"
   },
   "kickoff": "2026-10-17T23:30Z",
   "league": "mls",
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "MIA",
     "h": "ATL"
    },
    "market": {
     "a": 0.548077,
     "d": 0.211538,
     "h": 0.240385
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "d",
     "legs": {
      "a": {
       "ask_c": 57,
       "ask_size": 703,
       "bid_c": 54,
       "bid_size": 2,
       "spread_c": 3,
       "ticker": "KXMLSGAME-26OCT17ATLMIA-MIA"
      },
      "d": {
       "ask_c": 22,
       "ask_size": 5,
       "bid_c": 18,
       "bid_size": 200,
       "spread_c": 4,
       "ticker": "KXMLSGAME-26OCT17ATLMIA-TIE"
      },
      "h": {
       "ask_c": 25,
       "ask_size": 5,
       "bid_c": 22,
       "bid_size": 99,
       "spread_c": 3,
       "ticker": "KXMLSGAME-26OCT17ATLMIA-ATL"
      }
     },
     "overround": 1.04,
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
   "opponent": "Atlanta United FC",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.3316563467492257
   },
   "ppg_gap": 0.8885448916408669,
   "rank_gap": 25,
   "ranks": {
    "fav": 3,
    "opp": 28
   },
   "rated_in": {
    "away": "mls",
    "home": "mls"
   },
   "rates": {
    "ga": [
     1.710526315789474,
     1.7507739938080495
    ],
    "gdg": [
     0.7434210526315788,
     -0.588235294117647
    ],
    "gf": [
     2.4539473684210527,
     1.1625386996904026
    ],
    "ppg": [
     1.8157894736842106,
     0.9272445820433437
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Atlanta United FC": "exact",
    "Inter Miami CF": "exact"
   },
   "shape": "SPLIT",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 0,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     4,
     4
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Atlanta, Georgia",
    "country": "USA",
    "name": "Mercedes-Benz Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Inter Miami CF",
    "flipped": false,
    "gdg_gap_abs": 1.3316563467492257,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.40817862269854793,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.7368421052631579,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.7368421052631579,
    "k": 10.0,
    "min": 0.7368421052631579
   }
  },
  {
   "away": "VfB Stuttgart",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884767",
   "cross_league": false,
   "current_only": {
    "favourite": "VfB Stuttgart",
    "gdg_gap": 1.8,
    "ppg_gap": 0.0,
    "rank_gap": 1,
    "reoriented": false,
    "signed_from": "VfB Stuttgart"
   },
   "espn": "ger.1",
   "event_id": "401884767",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "VfB Stuttgart",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 13
      },
      "opp": {
       "rank": 114
      }
     },
     "def": {
      "fav": {
       "rank": 52
      },
      "opp": {
       "rank": 71
      }
     },
     "ovr": {
      "fav": {
       "rank": 33
      },
      "opp": {
       "rank": 77
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WLLW",
    "opp": "LLWW",
    "scope": "Bundesliga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.3058823529411763,
   "gp_current": {
    "away": 5,
    "home": 5,
    "min": 5
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "VfB Stuttgart",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Hamburger SV",
      "resolved_by": "alias"
     }
    },
    "last_meeting": {
     "away": "Hamburger SV",
     "away_score": 0,
     "competition": "bundesliga",
     "completed": true,
     "date": "2026-04-12T15:30:00+00:00",
     "home": "VfB Stuttgart",
     "home_score": 4,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "VfB Stuttgart",
      "away_score": 1,
      "competition": "bundesliga",
      "completed": true,
      "date": "2025-11-30T14:30:00+00:00",
      "home": "Hamburger SV",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Hamburger SV",
      "away_score": 0,
      "competition": "bundesliga",
      "completed": true,
      "date": "2026-04-12T15:30:00+00:00",
      "home": "VfB Stuttgart",
      "home_score": 4,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 1,
     "draw": 0,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-09-02",
     "from": "2024-08-16",
     "label": "since 2024-08, corpus to 2026-09-02; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Hamburg SV",
   "in_play": false,
   "kalshi": {
    "ask_c": 54,
    "ask_size": 951,
    "bid_c": 52,
    "bid_size": 340,
    "event_ticker": "KXBUNDESLIGAGAME-26OCT17HSVVFB",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXBUNDESLIGAGAME-26OCT17HSVVFB-VFB"
   },
   "kickoff": "2026-10-17T13:30Z",
   "league": "bundesliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "VFB",
     "h": "HSV"
    },
    "market": {
     "a": 0.529412,
     "d": 0.235294,
     "h": 0.235294
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 54,
       "ask_size": 951,
       "bid_c": 52,
       "bid_size": 340,
       "spread_c": 2,
       "ticker": "KXBUNDESLIGAGAME-26OCT17HSVVFB-VFB"
      },
      "d": {
       "ask_c": 24,
       "ask_size": 34,
       "bid_c": 23,
       "bid_size": 1805,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17HSVVFB-TIE"
      },
      "h": {
       "ask_c": 24,
       "ask_size": 1006,
       "bid_c": 23,
       "bid_size": 380,
       "spread_c": 1,
       "ticker": "KXBUNDESLIGAGAME-26OCT17HSVVFB-HSV"
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
   "opponent": "Hamburg SV",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.3058823529411763
   },
   "ppg_gap": 0.47058823529411753,
   "rank_gap": 6,
   "ranks": {
    "fav": 6,
    "opp": 12
   },
   "rated_in": {
    "away": "bundesliga",
    "home": "bundesliga"
   },
   "rates": {
    "ga": [
     1.5607843137254904,
     2.0588235294117645
    ],
    "gdg": [
     0.3647058823529412,
     -0.9411764705882351
    ],
    "gf": [
     1.9254901960784316,
     1.1176470588235294
    ],
    "ppg": [
     1.615686274509804,
     1.1450980392156864
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Hamburg SV": "exact",
    "VfB Stuttgart": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 2,
    "ovr": 2
   },
   "tiers": {
    "atk": [
     2,
     5
    ],
    "def": [
     2,
     4
    ],
    "ovr": [
     2,
     4
    ]
   },
   "venue": {
    "city": "Hamburg Norderstedt",
    "country": "Germany",
    "name": "Volksparkstadion"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "VfB Stuttgart",
    "flipped": false,
    "gdg_gap_abs": 1.3058823529411763,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.4529298823529409,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.3333333333333333,
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
   "away": "Arsenal",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401878769",
   "cross_league": false,
   "current_only": {
    "favourite": "Arsenal",
    "gdg_gap": 1.3333333333333333,
    "ppg_gap": 1.6666666666666665,
    "rank_gap": 10,
    "reoriented": false,
    "signed_from": "Arsenal"
   },
   "espn": "eng.1",
   "event_id": "401878769",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Arsenal",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 6
      },
      "opp": {
       "rank": 48
      }
     },
     "def": {
      "fav": {
       "rank": 1
      },
      "opp": {
       "rank": 18
      }
     },
     "ovr": {
      "fav": {
       "rank": 2
      },
      "opp": {
       "rank": 21
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWLW",
    "opp": "DWLL",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.2730263157894737,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Arsenal",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Nottingham Forest",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Arsenal",
     "away_score": 0,
     "competition": "epl",
     "completed": true,
     "date": "2026-01-17T17:30:00+00:00",
     "home": "Nottingham Forest",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Nottingham Forest",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2024-11-23T15:00:00+00:00",
      "home": "Arsenal",
      "home_score": 3,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Arsenal",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2025-02-26T19:30:00+00:00",
      "home": "Nottingham Forest",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Nottingham Forest",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2025-09-13T11:30:00+00:00",
      "home": "Arsenal",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Arsenal",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2026-01-17T17:30:00+00:00",
      "home": "Nottingham Forest",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 2,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "from": "2024-08-13",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Nottingham Forest",
   "in_play": false,
   "kalshi": {
    "ask_c": 62,
    "ask_size": 55493,
    "bid_c": 61,
    "bid_size": 934,
    "event_ticker": "KXEPLGAME-26OCT18NFOARS",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXEPLGAME-26OCT18NFOARS-ARS"
   },
   "kickoff": "2026-10-18T15:30Z",
   "league": "epl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "ARS",
     "h": "NFO"
    },
    "market": {
     "a": 0.607843,
     "d": 0.245098,
     "h": 0.147059
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 62,
       "ask_size": 55493,
       "bid_c": 61,
       "bid_size": 934,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18NFOARS-ARS"
      },
      "d": {
       "ask_c": 25,
       "ask_size": 16114,
       "bid_c": 23,
       "bid_size": 11187,
       "spread_c": 2,
       "ticker": "KXEPLGAME-26OCT18NFOARS-TIE"
      },
      "h": {
       "ask_c": 15,
       "ask_size": 14894,
       "bid_c": 13,
       "bid_size": 28915,
       "spread_c": 2,
       "ticker": "KXEPLGAME-26OCT18NFOARS-NFO"
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
   "opponent": "Nottingham Forest",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.2730263157894737
   },
   "ppg_gap": 1.2993421052631575,
   "rank_gap": 13,
   "ranks": {
    "fav": 2,
    "opp": 15
   },
   "rated_in": {
    "away": "epl",
    "home": "epl"
   },
   "rates": {
    "ga": [
     0.756578947368421,
     1.338815789473684
    ],
    "gdg": [
     1.036184210526316,
     -0.23684210526315774
    ],
    "gf": [
     1.792763157894737,
     1.1019736842105263
    ],
    "ppg": [
     2.3355263157894735,
     1.036184210526316
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Arsenal": "exact",
    "Nottingham Forest": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 4,
    "def": 2,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     5
    ],
    "def": [
     1,
     3
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Nottingham",
    "country": "England",
    "name": "The City Ground"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Arsenal",
    "flipped": false,
    "gdg_gap_abs": 1.2730263157894737,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3613416408668728,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "Crystal Palace",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401879261",
   "cross_league": false,
   "current_only": {
    "favourite": "Brighton & Hove Albion",
    "gdg_gap": 2.6666666666666665,
    "ppg_gap": 0.9999999999999998,
    "rank_gap": 7,
    "reoriented": false,
    "signed_from": "Brighton & Hove Albion"
   },
   "espn": "eng.1",
   "event_id": "401879261",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Brighton & Hove Albion",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 36
      },
      "opp": {
       "rank": 83
      }
     },
     "def": {
      "fav": {
       "rank": 9
      },
      "opp": {
       "rank": 16
      }
     },
     "ovr": {
      "fav": {
       "rank": 12
      },
      "opp": {
       "rank": 25
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "DWWW",
    "opp": "WLDW",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.2631578947368418,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Crystal Palace",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Brighton",
      "resolved_by": "contained"
     }
    },
    "last_meeting": {
     "away": "Crystal Palace",
     "away_score": 1,
     "competition": "epl",
     "completed": true,
     "date": "2026-02-08T14:00:00+00:00",
     "home": "Brighton",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Crystal Palace",
      "away_score": 3,
      "competition": "epl",
      "completed": true,
      "date": "2024-12-15T14:00:00+00:00",
      "home": "Brighton",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Brighton",
      "away_score": 1,
      "competition": "epl",
      "completed": true,
      "date": "2025-04-05T14:00:00+00:00",
      "home": "Crystal Palace",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Brighton",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2025-11-09T14:00:00+00:00",
      "home": "Crystal Palace",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Crystal Palace",
      "away_score": 1,
      "competition": "epl",
      "completed": true,
      "date": "2026-02-08T14:00:00+00:00",
      "home": "Brighton",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 3,
     "draw": 1,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "from": "2024-08-13",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Brighton & Hove Albion",
   "in_play": false,
   "kalshi": {
    "ask_c": 63,
    "ask_size": 8557,
    "bid_c": 62,
    "bid_size": 1,
    "event_ticker": "KXEPLGAME-26OCT18BRICRY",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXEPLGAME-26OCT18BRICRY-BRI"
   },
   "kickoff": "2026-10-18T13:00Z",
   "league": "epl",
   "model_vs_market": {
    "book_flag": "THIN",
    "codes": {
     "a": "CRY",
     "h": "BHA"
    },
    "market": {
     "a": 0.174757,
     "d": 0.213592,
     "h": 0.61165
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 18,
       "ask_size": 7554,
       "bid_c": 17,
       "bid_size": 594,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18BRICRY-CRY"
      },
      "d": {
       "ask_c": 22,
       "ask_size": 8244,
       "bid_c": 21,
       "bid_size": 1120,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18BRICRY-TIE"
      },
      "h": {
       "ask_c": 63,
       "ask_size": 8557,
       "bid_c": 62,
       "bid_size": 1,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT18BRICRY-BRI"
      }
     },
     "overround": 1.03,
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
   "opponent": "Crystal Palace",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.2631578947368418
   },
   "ppg_gap": 0.506578947368421,
   "rank_gap": 9,
   "ranks": {
    "fav": 3,
    "opp": 12
   },
   "rated_in": {
    "away": "epl",
    "home": "epl"
   },
   "rates": {
    "ga": [
     1.069078947368421,
     1.588815789473684
    ],
    "gdg": [
     0.9111842105263157,
     -0.3519736842105261
    ],
    "gf": [
     1.9802631578947367,
     1.236842105263158
    ],
    "ppg": [
     1.6842105263157894,
     1.1776315789473684
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Brighton & Hove Albion": "exact",
    "Crystal Palace": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 3,
    "ovr": 3
   },
   "tiers": {
    "atk": [
     1,
     4
    ],
    "def": [
     1,
     4
    ],
    "ovr": [
     1,
     4
    ]
   },
   "venue": {
    "city": "Falmer",
    "country": "England",
    "name": "American Express Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Brighton & Hove Albion",
    "flipped": false,
    "gdg_gap_abs": 1.2631578947368418,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.3613416408668728,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "Atlético de San Luis",
   "column": "ligamx",
   "columns": [
    "ligamx"
   ],
   "competition_id": "401876940",
   "cross_league": false,
   "current_only": {
    "favourite": "Toluca",
    "gdg_gap": 1.363636363636364,
    "ppg_gap": 0.7272727272727273,
    "rank_gap": 12,
    "reoriented": false,
    "signed_from": "Toluca"
   },
   "espn": "mex.1",
   "event_id": "401876940",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Toluca",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 58
      },
      "opp": {
       "rank": 112
      }
     },
     "def": {
      "fav": {
       "rank": 33
      },
      "opp": {
       "rank": 125
      }
     },
     "ovr": {
      "fav": {
       "rank": 69
      },
      "opp": {
       "rank": 147
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWLDL",
    "opp": "LLWWL",
    "scope": "Liga MX",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.2091503267973862,
   "gp_current": {
    "away": 11,
    "home": 11,
    "min": 11
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Atletico San Luis",
      "resolved_by": "alias"
     },
     "home": {
      "corpus_name": "Toluca",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Atletico San Luis",
     "away_score": 1,
     "competition": "liga-mx",
     "completed": true,
     "date": "2026-04-13T01:00:00+00:00",
     "home": "Toluca",
     "home_score": 1,
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Atletico San Luis",
      "away_score": 1,
      "competition": "liga-mx",
      "completed": true,
      "date": "2024-08-25T18:00:00+00:00",
      "home": "Toluca",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Toluca",
      "away_score": 1,
      "competition": "liga-mx",
      "completed": true,
      "date": "2025-04-17T02:00:00+00:00",
      "home": "Atletico San Luis",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Toluca",
      "away_score": 3,
      "competition": "liga-mx",
      "completed": true,
      "date": "2025-08-30T01:00:00+00:00",
      "home": "Atletico San Luis",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Atletico San Luis",
      "away_score": 1,
      "competition": "liga-mx",
      "completed": true,
      "date": "2026-04-13T01:00:00+00:00",
      "home": "Toluca",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 0,
     "draw": 1,
     "home": 3
    },
    "window": {
     "corpus_from": "2024-07-05",
     "corpus_to": "2026-08-12",
     "from": "2024-07-05",
     "label": "since 2024-07, corpus to 2026-08-12; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Toluca",
   "in_play": false,
   "kalshi": {
    "ask_c": 74,
    "ask_size": 8823,
    "bid_c": 72,
    "bid_size": 1015,
    "event_ticker": "KXLIGAMXGAME-26OCT17TOLASL",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXLIGAMXGAME-26OCT17TOLASL-TOL"
   },
   "kickoff": "2026-10-18T01:00Z",
   "league": "ligamx",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "ASL",
     "h": "TOL"
    },
    "market": {
     "a": 0.117647,
     "d": 0.156863,
     "h": 0.72549
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 12,
       "ask_size": 2748,
       "bid_c": 10,
       "bid_size": 2770,
       "spread_c": 2,
       "ticker": "KXLIGAMXGAME-26OCT17TOLASL-ASL"
      },
      "d": {
       "ask_c": 16,
       "ask_size": 2081,
       "bid_c": 15,
       "bid_size": 1236,
       "spread_c": 1,
       "ticker": "KXLIGAMXGAME-26OCT17TOLASL-TIE"
      },
      "h": {
       "ask_c": 74,
       "ask_size": 8823,
       "bid_c": 72,
       "bid_size": 1015,
       "spread_c": 2,
       "ticker": "KXLIGAMXGAME-26OCT17TOLASL-TOL"
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
   "opponent": "Atlético de San Luis",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.2091503267973862
   },
   "ppg_gap": 0.7777777777777779,
   "rank_gap": 13,
   "ranks": {
    "fav": 2,
    "opp": 15
   },
   "rated_in": {
    "away": "ligamx",
    "home": "ligamx"
   },
   "rates": {
    "ga": [
     1.201814058956916,
     1.7366946778711485
    ],
    "gdg": [
     0.8730158730158735,
     -0.33613445378151274
    ],
    "gf": [
     2.0748299319727894,
     1.4005602240896358
    ],
    "ppg": [
     1.8253968253968254,
     1.0476190476190474
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Atlético de San Luis": "exact",
    "Toluca": "exact"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 2,
    "def": 3,
    "ovr": 3
   },
   "tiers": {
    "atk": [
     1,
     3
    ],
    "def": [
     2,
     5
    ],
    "ovr": [
     1,
     4
    ]
   },
   "venue": {
    "city": "Toluca",
    "country": "Mexico",
    "name": "Estadio Nemesio Díez Riega"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Toluca",
    "flipped": false,
    "gdg_gap_abs": 1.2091503267973862,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.37380887461212126,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.5238095238095238,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.5238095238095238,
    "k": 10.0,
    "min": 0.5238095238095238
   }
  },
  {
   "away": "Necaxa",
   "column": "ligamx",
   "columns": [
    "ligamx"
   ],
   "competition_id": "401876934",
   "cross_league": false,
   "current_only": {
    "favourite": "Guadalajara",
    "gdg_gap": 1.3636363636363638,
    "ppg_gap": 0.9090909090909091,
    "rank_gap": 13,
    "reoriented": false,
    "signed_from": "Guadalajara"
   },
   "espn": "mex.1",
   "event_id": "401876934",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Guadalajara",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 66
      },
      "opp": {
       "rank": 132
      }
     },
     "def": {
      "fav": {
       "rank": 58
      },
      "opp": {
       "rank": 127
      }
     },
     "ovr": {
      "fav": {
       "rank": 95
      },
      "opp": {
       "rank": 143
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WWDLD",
    "opp": "DLLLD",
    "scope": "Liga MX",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.1603641456582632,
   "gp_current": {
    "away": 11,
    "home": 11,
    "min": 11
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Necaxa",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Guadalajara Chivas",
      "resolved_by": "contained"
     }
    },
    "last_meeting": {
     "away": "Guadalajara Chivas",
     "away_score": 0,
     "competition": "liga-mx",
     "completed": true,
     "date": "2026-04-23T03:10:00+00:00",
     "home": "Necaxa",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Necaxa",
      "away_score": 2,
      "competition": "liga-mx",
      "completed": true,
      "date": "2024-10-23T01:05:00+00:00",
      "home": "Guadalajara Chivas",
      "home_score": 3,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Guadalajara Chivas",
      "away_score": 2,
      "competition": "liga-mx",
      "completed": true,
      "date": "2025-01-18T03:05:00+00:00",
      "home": "Necaxa",
      "home_score": 3,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Necaxa",
      "away_score": 1,
      "competition": "liga-mx",
      "completed": true,
      "date": "2025-09-24T01:07:00+00:00",
      "home": "Guadalajara Chivas",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Guadalajara Chivas",
      "away_score": 0,
      "competition": "liga-mx",
      "completed": true,
      "date": "2026-04-23T03:10:00+00:00",
      "home": "Necaxa",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 1,
     "draw": 1,
     "home": 2
    },
    "window": {
     "corpus_from": "2024-07-05",
     "corpus_to": "2026-08-12",
     "from": "2024-07-05",
     "label": "since 2024-07, corpus to 2026-08-12; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Guadalajara",
   "in_play": false,
   "kalshi": {
    "ask_c": 62,
    "ask_size": 0,
    "bid_c": 47,
    "bid_size": 2,
    "event_ticker": "KXLIGAMXGAME-26OCT20CDGNCX",
    "flags": [
     "WIDE",
     "THIN"
    ],
    "spread_c": 15,
    "ticker": "KXLIGAMXGAME-26OCT20CDGNCX-CDG"
   },
   "kickoff": "2026-10-21T00:07Z",
   "league": "ligamx",
   "model_vs_market": {
    "book_flag": "WIDE",
    "codes": {
     "a": "NCX",
     "h": "GDL"
    },
    "market": {
     "a": 0.331034,
     "d": 0.241379,
     "h": 0.427586
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 48,
       "ask_size": 100,
       "bid_c": 5,
       "bid_size": 690,
       "spread_c": 43,
       "ticker": "KXLIGAMXGAME-26OCT20CDGNCX-NCX"
      },
      "d": {
       "ask_c": 35,
       "ask_size": 100,
       "bid_c": 8,
       "bid_size": 100,
       "spread_c": 27,
       "ticker": "KXLIGAMXGAME-26OCT20CDGNCX-TIE"
      },
      "h": {
       "ask_c": 62,
       "ask_size": 0,
       "bid_c": 47,
       "bid_size": 2,
       "spread_c": 15,
       "ticker": "KXLIGAMXGAME-26OCT20CDGNCX-CDG"
      }
     },
     "overround": 1.45,
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
   "opponent": "Necaxa",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.1603641456582632
   },
   "ppg_gap": 0.8193277310924371,
   "rank_gap": 13,
   "ranks": {
    "fav": 4,
    "opp": 17
   },
   "rated_in": {
    "away": "ligamx",
    "home": "ligamx"
   },
   "rates": {
    "ga": [
     1.1071428571428572,
     1.8935574229691876
    ],
    "gdg": [
     0.5833333333333333,
     -0.5770308123249299
    ],
    "gf": [
     1.6904761904761905,
     1.3165266106442577
    ],
    "ppg": [
     1.7380952380952381,
     0.9187675070028011
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Guadalajara": "exact",
    "Necaxa": "exact"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 4,
    "ovr": 4
   },
   "tiers": {
    "atk": [
     1,
     4
    ],
    "def": [
     1,
     5
    ],
    "ovr": [
     1,
     5
    ]
   },
   "venue": {
    "city": "Guadalajara",
    "country": "Mexico",
    "name": "Estadio Akron"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Guadalajara",
    "flipped": false,
    "gdg_gap_abs": 1.1603641456582632,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.37380887461212126,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.5238095238095238,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.5238095238095238,
    "k": 10.0,
    "min": 0.5238095238095238
   }
  },
  {
   "away": "Nice",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "competition_id": "401876434",
   "cross_league": false,
   "current_only": {
    "favourite": "Lyon",
    "gdg_gap": 1.5,
    "ppg_gap": 0.5,
    "rank_gap": 5,
    "reoriented": false,
    "signed_from": "Lyon"
   },
   "espn": "fra.1",
   "event_id": "401876434",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "Lyon",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 51
      },
      "opp": {
       "rank": 119
      }
     },
     "def": {
      "fav": {
       "rank": 36
      },
      "opp": {
       "rank": 112
      }
     },
     "ovr": {
      "fav": {
       "rank": 28
      },
      "opp": {
       "rank": 92
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WDWL",
    "opp": "DLWW",
    "scope": "Ligue 1",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.148692810457516,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Nice",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Lyon",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Nice",
     "away_score": 0,
     "competition": "ligue-1",
     "completed": true,
     "date": "2026-02-15T19:45:00+00:00",
     "home": "Lyon",
     "home_score": 2,
     "season": 2025,
     "source": "club_corpus",
     "winner": "home",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Nice",
      "away_score": 1,
      "competition": "ligue-1",
      "completed": true,
      "date": "2024-12-01T16:00:00+00:00",
      "home": "Lyon",
      "home_score": 4,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Lyon",
      "away_score": 2,
      "competition": "ligue-1",
      "completed": true,
      "date": "2025-03-09T19:45:00+00:00",
      "home": "Nice",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Lyon",
      "away_score": 2,
      "competition": "ligue-1",
      "completed": true,
      "date": "2025-10-18T15:00:00+00:00",
      "home": "Nice",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Nice",
      "away_score": 0,
      "competition": "ligue-1",
      "completed": true,
      "date": "2026-02-15T19:45:00+00:00",
      "home": "Lyon",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 1,
     "draw": 0,
     "home": 3
    },
    "window": {
     "corpus_from": "2024-07-11",
     "corpus_to": "2026-05-29",
     "from": "2024-07-11",
     "label": "since 2024-07, corpus to 2026-05-29; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Lyon",
   "in_play": false,
   "kalshi": {
    "ask_c": 58,
    "ask_size": 100,
    "bid_c": 57,
    "bid_size": 533,
    "event_ticker": "KXLIGUE1GAME-26OCT18OLNIC",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLIGUE1GAME-26OCT18OLNIC-OL"
   },
   "kickoff": "2026-10-18T18:45Z",
   "league": "ligue1",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "NICE",
     "h": "LYON"
    },
    "market": {
     "a": 0.19802,
     "d": 0.227723,
     "h": 0.574257
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 20,
       "ask_size": 1196,
       "bid_c": 19,
       "bid_size": 433,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT18OLNIC-NIC"
      },
      "d": {
       "ask_c": 23,
       "ask_size": 866,
       "bid_c": 22,
       "bid_size": 1873,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT18OLNIC-TIE"
      },
      "h": {
       "ask_c": 58,
       "ask_size": 100,
       "bid_c": 57,
       "bid_size": 533,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT18OLNIC-OL"
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
   "opponent": "Nice",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.148692810457516
   },
   "ppg_gap": 0.6654411764705883,
   "rank_gap": 8,
   "ranks": {
    "fav": 5,
    "opp": 13
   },
   "rated_in": {
    "away": "ligue1",
    "home": "ligue1"
   },
   "rates": {
    "ga": [
     0.9852941176470589,
     1.4965277777777777
    ],
    "gdg": [
     0.6764705882352939,
     -0.4722222222222221
    ],
    "gf": [
     1.6617647058823528,
     1.0243055555555556
    ],
    "ppg": [
     1.7904411764705883,
     1.125
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Lyon": "exact",
    "Nice": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 2,
    "ovr": 2
   },
   "tiers": {
    "atk": [
     2,
     5
    ],
    "def": [
     1,
     3
    ],
    "ovr": [
     2,
     4
    ]
   },
   "venue": {
    "city": "Lyon",
    "country": "France",
    "name": "Groupama Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Lyon",
    "flipped": false,
    "gdg_gap_abs": 1.148692810457516,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.3632773019719249,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "FC Utrecht",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "competition_id": "401875577",
   "cross_league": false,
   "current_only": {
    "favourite": "FC Twente",
    "gdg_gap": 2.375,
    "ppg_gap": 1.125,
    "rank_gap": 8,
    "reoriented": false,
    "signed_from": "FC Twente"
   },
   "espn": "ned.1",
   "event_id": "401875577",
   "fav_side": "home",
   "fav_source": "rank",
   "favourite": "FC Twente",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 95
      },
      "opp": {
       "rank": 103
      }
     },
     "def": {
      "fav": {
       "rank": 98
      },
      "opp": {
       "rank": 114
      }
     },
     "ovr": {
      "fav": {
       "rank": 62
      },
      "opp": {
       "rank": 81
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "DWWWD",
    "opp": "DWLW",
    "scope": "Eredivisie",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 1.1437908496732028,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Utrecht",
      "resolved_by": "normalised"
     },
     "home": {
      "corpus_name": "Twente",
      "resolved_by": "normalised"
     }
    },
    "last_meeting": {
     "away": "Utrecht",
     "away_score": 2,
     "competition": "eredivisie",
     "completed": true,
     "date": "2026-03-15T11:15:00+00:00",
     "home": "Twente",
     "home_score": 0,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Twente",
      "away_score": 1,
      "competition": "eredivisie",
      "completed": true,
      "date": "2024-09-01T10:15:00+00:00",
      "home": "Utrecht",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Utrecht",
      "away_score": 0,
      "competition": "eredivisie",
      "completed": true,
      "date": "2025-05-11T12:30:00+00:00",
      "home": "Twente",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Twente",
      "away_score": 1,
      "competition": "eredivisie",
      "completed": true,
      "date": "2025-12-07T11:15:00+00:00",
      "home": "Utrecht",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Twente",
      "away_score": 2,
      "competition": "knvb-beker",
      "completed": true,
      "date": "2026-01-13T20:00:00+00:00",
      "home": "Utrecht",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Utrecht",
      "away_score": 2,
      "competition": "eredivisie",
      "completed": true,
      "date": "2026-03-15T11:15:00+00:00",
      "home": "Twente",
      "home_score": 0,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 1,
     "home": 2
    },
    "window": {
     "corpus_from": "2024-08-09",
     "corpus_to": "2026-05-21",
     "from": "2024-08-09",
     "label": "since 2024-08, corpus to 2026-05-21; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "FC Twente",
   "in_play": false,
   "kalshi": {
    "ask_c": 76,
    "ask_size": 550,
    "bid_c": 75,
    "bid_size": 0,
    "event_ticker": "KXEREDIVISIEGAME-26OCT18TWEFCU",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXEREDIVISIEGAME-26OCT18TWEFCU-TWE"
   },
   "kickoff": "2026-10-18T18:00Z",
   "league": "eredivisie",
   "model_vs_market": {
    "book_flag": "THIN",
    "codes": {
     "a": "UTR",
     "h": "TWE"
    },
    "market": {
     "a": 0.115385,
     "d": 0.153846,
     "h": 0.730769
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": "h",
     "legs": {
      "a": {
       "ask_c": 12,
       "ask_size": 2174,
       "bid_c": 9,
       "bid_size": 320,
       "spread_c": 3,
       "ticker": "KXEREDIVISIEGAME-26OCT18TWEFCU-FCU"
      },
      "d": {
       "ask_c": 16,
       "ask_size": 1944,
       "bid_c": 14,
       "bid_size": 153,
       "spread_c": 2,
       "ticker": "KXEREDIVISIEGAME-26OCT18TWEFCU-TIE"
      },
      "h": {
       "ask_c": 76,
       "ask_size": 550,
       "bid_c": 75,
       "bid_size": 0,
       "spread_c": 1,
       "ticker": "KXEREDIVISIEGAME-26OCT18TWEFCU-TWE"
      }
     },
     "overround": 1.04,
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
   "opponent": "FC Utrecht",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 1.1437908496732028
   },
   "ppg_gap": 0.5588235294117645,
   "rank_gap": 5,
   "ranks": {
    "fav": 4,
    "opp": 9
   },
   "rated_in": {
    "away": "eredivisie",
    "home": "eredivisie"
   },
   "rates": {
    "ga": [
     1.0980392156862746,
     2.0873015873015874
    ],
    "gdg": [
     0.7549019607843137,
     -0.38888888888888906
    ],
    "gf": [
     1.8529411764705883,
     1.6984126984126984
    ],
    "ppg": [
     1.892156862745098,
     1.3333333333333335
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "FC Twente": "exact",
    "FC Utrecht": "exact"
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
    "def": 3,
    "ovr": 2
   },
   "tiers": {
    "atk": [
     3,
     3
    ],
    "def": [
     1,
     4
    ],
    "ovr": [
     1,
     3
    ]
   },
   "venue": {
    "city": "Enschede",
    "country": "Netherlands",
    "name": "De Grolsch Veste"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "FC Twente",
    "flipped": false,
    "gdg_gap_abs": 1.1437908496732028,
    "home_side": "home",
    "policy": "off",
    "reason": "favourite_already_at_home",
    "refused": false,
    "side": "home",
    "threshold": 0.4417393277310921,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "Atlético Madrid",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882843",
   "cross_league": false,
   "current_only": {
    "favourite": "Atlético Madrid",
    "gdg_gap": 1.25,
    "ppg_gap": 1.375,
    "rank_gap": 10,
    "reoriented": false,
    "signed_from": "Atlético Madrid"
   },
   "espn": "esp.1",
   "event_id": "401882843",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Atlético Madrid",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 15
      },
      "opp": {
       "rank": 78
      }
     },
     "def": {
      "fav": {
       "rank": 55
      },
      "opp": {
       "rank": 104
      }
     },
     "ovr": {
      "fav": {
       "rank": 17
      },
      "opp": {
       "rank": 87
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "LWWWW",
    "opp": "DWLLD",
    "scope": "La Liga",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 0.9941520467836258,
   "gp_current": {
    "away": 8,
    "home": 8,
    "min": 8
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Atletico Madrid",
      "resolved_by": "normalised"
     },
     "home": {
      "corpus_name": "Espanyol",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Espanyol",
     "away_score": 2,
     "competition": "la-liga",
     "completed": true,
     "date": "2026-02-21T20:00:00+00:00",
     "home": "Atletico Madrid",
     "home_score": 4,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Espanyol",
      "away_score": 0,
      "competition": "la-liga",
      "completed": true,
      "date": "2024-08-28T19:30:00+00:00",
      "home": "Atletico Madrid",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Atletico Madrid",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-03-29T15:15:00+00:00",
      "home": "Espanyol",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Atletico Madrid",
      "away_score": 1,
      "competition": "la-liga",
      "completed": true,
      "date": "2025-08-17T19:30:00+00:00",
      "home": "Espanyol",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Espanyol",
      "away_score": 2,
      "competition": "la-liga",
      "completed": true,
      "date": "2026-02-21T20:00:00+00:00",
      "home": "Atletico Madrid",
      "home_score": 4,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 1,
     "draw": 2,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-08-15",
     "corpus_to": "2026-05-24",
     "from": "2024-08-15",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Espanyol",
   "in_play": false,
   "kalshi": {
    "ask_c": 56,
    "ask_size": 12752,
    "bid_c": 55,
    "bid_size": 12,
    "event_ticker": "KXLALIGAGAME-26OCT17ESPATM",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLALIGAGAME-26OCT17ESPATM-ATM"
   },
   "kickoff": "2026-10-17T12:00Z",
   "league": "laliga",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "ATM",
     "h": "ESP"
    },
    "market": {
     "a": 0.543689,
     "d": 0.242718,
     "h": 0.213592
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 56,
       "ask_size": 12752,
       "bid_c": 55,
       "bid_size": 12,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17ESPATM-ATM"
      },
      "d": {
       "ask_c": 25,
       "ask_size": 1130,
       "bid_c": 24,
       "bid_size": 9531,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17ESPATM-TIE"
      },
      "h": {
       "ask_c": 22,
       "ask_size": 1607,
       "bid_c": 21,
       "bid_size": 330,
       "spread_c": 1,
       "ticker": "KXLALIGAGAME-26OCT17ESPATM-ESP"
      }
     },
     "overround": 1.03,
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
   "opponent": "Espanyol",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 0.9941520467836258
   },
   "ppg_gap": 0.9473684210526316,
   "rank_gap": 10,
   "ranks": {
    "fav": 3,
    "opp": 13
   },
   "rated_in": {
    "away": "laliga",
    "home": "laliga"
   },
   "rates": {
    "ga": [
     1.087719298245614,
     1.4152046783625731
    ],
    "gdg": [
     0.8187134502923976,
     -0.17543859649122817
    ],
    "gf": [
     1.9064327485380117,
     1.239766081871345
    ],
    "ppg": [
     2.064327485380117,
     1.1169590643274854
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Atlético Madrid": "exact",
    "Espanyol": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 2,
    "ovr": 3
   },
   "tiers": {
    "atk": [
     1,
     4
    ],
    "def": [
     1,
     3
    ],
    "ovr": [
     1,
     4
    ]
   },
   "venue": {
    "city": "Barcelona",
    "country": "Spain",
    "name": "RCDE Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Atlético Madrid",
    "flipped": false,
    "gdg_gap_abs": 0.9941520467836258,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3680569659442722,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.4444444444444444,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.4444444444444444,
    "k": 10.0,
    "min": 0.4444444444444444
   }
  },
  {
   "away": "Marseille",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "competition_id": "401876439",
   "cross_league": false,
   "current_only": {
    "favourite": "Angers",
    "gdg_gap": 0.6666666666666667,
    "ppg_gap": -0.16666666666666674,
    "rank_gap": -1,
    "reoriented": true,
    "signed_from": "Marseille"
   },
   "espn": "fra.1",
   "event_id": "401876439",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Marseille",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 26
      },
      "opp": {
       "rank": 145
      }
     },
     "def": {
      "fav": {
       "rank": 53
      },
      "opp": {
       "rank": 60
      }
     },
     "ovr": {
      "fav": {
       "rank": 36
      },
      "opp": {
       "rank": 109
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "LLLW",
    "opp": "LDWL",
    "scope": "Ligue 1",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 0.9301470588235295,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Marseille",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Angers",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Marseille",
     "away_score": 5,
     "competition": "ligue-1",
     "completed": true,
     "date": "2026-01-17T20:05:00+00:00",
     "home": "Angers",
     "home_score": 2,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Angers",
      "away_score": 1,
      "competition": "ligue-1",
      "completed": true,
      "date": "2024-10-04T18:45:00+00:00",
      "home": "Marseille",
      "home_score": 1,
      "season": 2024,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Marseille",
      "away_score": 2,
      "competition": "ligue-1",
      "completed": true,
      "date": "2025-02-09T19:45:00+00:00",
      "home": "Angers",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Angers",
      "away_score": 2,
      "competition": "ligue-1",
      "completed": true,
      "date": "2025-10-29T20:05:00+00:00",
      "home": "Marseille",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Marseille",
      "away_score": 5,
      "competition": "ligue-1",
      "completed": true,
      "date": "2026-01-17T20:05:00+00:00",
      "home": "Angers",
      "home_score": 2,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 2,
     "home": 0
    },
    "window": {
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-05-29",
     "from": "2024-08-16",
     "label": "since 2024-08, corpus to 2026-05-29; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Angers",
   "in_play": false,
   "kalshi": {
    "ask_c": 47,
    "ask_size": 3861,
    "bid_c": 46,
    "bid_size": 1312,
    "event_ticker": "KXLIGUE1GAME-26OCT18ANGOLM",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLIGUE1GAME-26OCT18ANGOLM-OLM"
   },
   "kickoff": "2026-10-18T13:00Z",
   "league": "ligue1",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "OLM",
     "h": "ANG"
    },
    "market": {
     "a": 0.460784,
     "d": 0.254902,
     "h": 0.284314
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 47,
       "ask_size": 3861,
       "bid_c": 46,
       "bid_size": 1312,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT18ANGOLM-OLM"
      },
      "d": {
       "ask_c": 26,
       "ask_size": 5125,
       "bid_c": 25,
       "bid_size": 100,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT18ANGOLM-TIE"
      },
      "h": {
       "ask_c": 29,
       "ask_size": 5164,
       "bid_c": 28,
       "bid_size": 100,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT18ANGOLM-ANG"
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
   "opponent": "Angers",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 0.9301470588235295
   },
   "ppg_gap": 0.3602941176470589,
   "rank_gap": 6,
   "ranks": {
    "fav": 8,
    "opp": 14
   },
   "rated_in": {
    "away": "ligue1",
    "home": "ligue1"
   },
   "rates": {
    "ga": [
     1.3272058823529411,
     1.5073529411764706
    ],
    "gdg": [
     0.3933823529411766,
     -0.5367647058823529
    ],
    "gf": [
     1.7205882352941178,
     0.9705882352941176
    ],
    "ppg": [
     1.4595588235294117,
     1.0992647058823528
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Angers": "exact",
    "Marseille": "exact"
   },
   "shape": "CLEAN",
   "src": "prior",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 1,
    "ovr": 2
   },
   "tiers": {
    "atk": [
     2,
     5
    ],
    "def": [
     3,
     4
    ],
    "ovr": [
     3,
     5
    ]
   },
   "venue": {
    "city": "Angers",
    "country": "France",
    "name": "Stade Raymond Kopa"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Marseille",
    "flipped": false,
    "gdg_gap_abs": 0.9301470588235295,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3632773019719249,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "Paris Saint-Germain",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "competition_id": "401876432",
   "cross_league": false,
   "current_only": {
    "favourite": "Paris Saint-Germain",
    "gdg_gap": 0.6666666666666667,
    "ppg_gap": 0.6666666666666665,
    "rank_gap": 5,
    "reoriented": false,
    "signed_from": "Paris Saint-Germain"
   },
   "espn": "fra.1",
   "event_id": "401876432",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Paris Saint-Germain",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 10
      },
      "opp": {
       "rank": 35
      }
     },
     "def": {
      "fav": {
       "rank": 4
      },
      "opp": {
       "rank": 63
      }
     },
     "ovr": {
      "fav": {
       "rank": 5
      },
      "opp": {
       "rank": 45
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "LWWW",
    "opp": "WDLL",
    "scope": "Ligue 1",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": 0.875,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Paris Saint Germain",
      "resolved_by": "normalised"
     },
     "home": {
      "corpus_name": "Strasbourg",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Paris Saint Germain",
     "away_score": 2,
     "competition": "ligue-1",
     "completed": true,
     "date": "2026-02-01T19:45:00+00:00",
     "home": "Strasbourg",
     "home_score": 1,
     "season": 2025,
     "source": "club_corpus",
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Strasbourg",
      "away_score": 2,
      "competition": "ligue-1",
      "completed": true,
      "date": "2024-10-19T19:00:00+00:00",
      "home": "Paris Saint Germain",
      "home_score": 4,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Paris Saint Germain",
      "away_score": 1,
      "competition": "ligue-1",
      "completed": true,
      "date": "2025-05-03T15:00:00+00:00",
      "home": "Strasbourg",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Strasbourg",
      "away_score": 3,
      "competition": "ligue-1",
      "completed": true,
      "date": "2025-10-17T18:45:00+00:00",
      "home": "Paris Saint Germain",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Paris Saint Germain",
      "away_score": 2,
      "competition": "ligue-1",
      "completed": true,
      "date": "2026-02-01T19:45:00+00:00",
      "home": "Strasbourg",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 1,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-08-16",
     "corpus_to": "2026-05-29",
     "from": "2024-08-16",
     "label": "since 2024-08, corpus to 2026-05-29; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Strasbourg",
   "in_play": false,
   "kalshi": {
    "ask_c": 70,
    "ask_size": 496,
    "bid_c": 69,
    "bid_size": 342,
    "event_ticker": "KXLIGUE1GAME-26OCT17RCSPSG",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXLIGUE1GAME-26OCT17RCSPSG-PSG"
   },
   "kickoff": "2026-10-17T15:15Z",
   "league": "ligue1",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "PSG",
     "h": "STR"
    },
    "market": {
     "a": 0.686275,
     "d": 0.176471,
     "h": 0.137255
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 70,
       "ask_size": 496,
       "bid_c": 69,
       "bid_size": 342,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT17RCSPSG-PSG"
      },
      "d": {
       "ask_c": 18,
       "ask_size": 4397,
       "bid_c": 16,
       "bid_size": 1281,
       "spread_c": 2,
       "ticker": "KXLIGUE1GAME-26OCT17RCSPSG-TIE"
      },
      "h": {
       "ask_c": 14,
       "ask_size": 42,
       "bid_c": 13,
       "bid_size": 1935,
       "spread_c": 1,
       "ticker": "KXLIGUE1GAME-26OCT17RCSPSG-RCS"
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
   "opponent": "Strasbourg",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": 0.875
   },
   "ppg_gap": 0.6727941176470589,
   "rank_gap": 8,
   "ranks": {
    "fav": 1,
    "opp": 9
   },
   "rated_in": {
    "away": "ligue1",
    "home": "ligue1"
   },
   "rates": {
    "ga": [
     1.0330882352941178,
     1.6139705882352942
    ],
    "gdg": [
     1.0147058823529411,
     0.13970588235294112
    ],
    "gf": [
     2.047794117647059,
     1.7536764705882353
    ],
    "ppg": [
     2.0845588235294117,
     1.4117647058823528
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Paris Saint-Germain": "exact",
    "Strasbourg": "exact"
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
    "def": 4,
    "ovr": 2
   },
   "tiers": {
    "atk": [
     1,
     1
    ],
    "def": [
     1,
     5
    ],
    "ovr": [
     1,
     3
    ]
   },
   "venue": {
    "city": "Strasbourg",
    "country": "France",
    "name": "Stade de la Meinau"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": true,
    "favourite": "Paris Saint-Germain",
    "flipped": false,
    "gdg_gap_abs": 0.875,
    "home_side": "home",
    "policy": "off",
    "reason": "table_gap_beats_venue",
    "refused": false,
    "side": "away",
    "threshold": 0.3632773019719249,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
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
   "away": "Liverpool",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401879262",
   "cross_league": false,
   "current_only": {
    "favourite": "Brentford",
    "gdg_gap": -1.0,
    "ppg_gap": -0.16666666666666674,
    "rank_gap": -4,
    "reoriented": true,
    "signed_from": "Liverpool"
   },
   "espn": "eng.1",
   "event_id": "401879262",
   "fav_side": "away",
   "fav_source": "rank",
   "favourite": "Liverpool",
   "field_rank": {
    "axes": {
     "atk": {
      "fav": {
       "rank": 11
      },
      "opp": {
       "rank": 28
      }
     },
     "def": {
      "fav": {
       "rank": 27
      },
      "opp": {
       "rank": 23
      }
     },
     "ovr": {
      "fav": {
       "rank": 10
      },
      "opp": {
       "rank": 13
      }
     }
    },
    "size": 154
   },
   "form": {
    "fav": "WDWL",
    "opp": "DDWD",
    "scope": "EPL",
    "scope_is_cup": false
   },
   "gap_note": null,
   "gdg_gap": -0.2598684210526314,
   "gp_current": {
    "away": 6,
    "home": 6,
    "min": 6
   },
   "h2h": {
    "available": true,
    "identity": {
     "away": {
      "corpus_name": "Liverpool",
      "resolved_by": "exact"
     },
     "home": {
      "corpus_name": "Brentford",
      "resolved_by": "exact"
     }
    },
    "last_meeting": {
     "away": "Brentford",
     "away_score": 1,
     "competition": "epl",
     "completed": true,
     "date": "2026-05-24T15:00:00+00:00",
     "home": "Liverpool",
     "home_score": 1,
     "season": 2025,
     "source": "club_corpus",
     "winner": "draw",
     "winner_means": "this fixture's home/away sides"
    },
    "meetings": [
     {
      "away": "Brentford",
      "away_score": 0,
      "competition": "epl",
      "completed": true,
      "date": "2024-08-25T15:30:00+00:00",
      "home": "Liverpool",
      "home_score": 2,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Liverpool",
      "away_score": 2,
      "competition": "epl",
      "completed": true,
      "date": "2025-01-18T15:00:00+00:00",
      "home": "Brentford",
      "home_score": 0,
      "season": 2024,
      "source": "club_corpus",
      "winner": "away",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Liverpool",
      "away_score": 2,
      "competition": "epl",
      "completed": true,
      "date": "2025-10-25T19:00:00+00:00",
      "home": "Brentford",
      "home_score": 3,
      "season": 2025,
      "source": "club_corpus",
      "winner": "home",
      "winner_means": "this fixture's home/away sides"
     },
     {
      "away": "Brentford",
      "away_score": 1,
      "competition": "epl",
      "completed": true,
      "date": "2026-05-24T15:00:00+00:00",
      "home": "Liverpool",
      "home_score": 1,
      "season": 2025,
      "source": "club_corpus",
      "winner": "draw",
      "winner_means": "this fixture's home/away sides"
     }
    ],
    "reason": null,
    "source": "club_corpus+board_sweep",
    "tally": {
     "away": 2,
     "draw": 1,
     "home": 1
    },
    "window": {
     "corpus_from": "2024-08-13",
     "corpus_to": "2026-05-24",
     "from": "2024-08-13",
     "label": "since 2024-08, corpus to 2026-05-24; this season's results 2026-09-01 to 2026-10-13",
     "sweep": {
      "from": "2026-09-01",
      "to": "2026-10-13"
     },
     "to": "2026-10-13"
    }
   },
   "home": "Brentford",
   "in_play": false,
   "kalshi": {
    "ask_c": 36,
    "ask_size": 45345,
    "bid_c": 35,
    "bid_size": 566,
    "event_ticker": "KXEPLGAME-26OCT17BRELFC",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXEPLGAME-26OCT17BRELFC-LFC"
   },
   "kickoff": "2026-10-17T14:00Z",
   "league": "epl",
   "model_vs_market": {
    "book_flag": null,
    "codes": {
     "a": "LIV",
     "h": "BRE"
    },
    "market": {
     "a": 0.352941,
     "d": 0.254902,
     "h": 0.392157
    },
    "market_meta": {
     "basis": "Kalshi's three GAME legs (home, tie, away), YES asks, overround removed proportionally so H + D + A = 100 -- the de-vig the trader's anchor reads (patterns.devig)",
     "book_flag_leg": null,
     "legs": {
      "a": {
       "ask_c": 36,
       "ask_size": 45345,
       "bid_c": 35,
       "bid_size": 566,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT17BRELFC-LFC"
      },
      "d": {
       "ask_c": 26,
       "ask_size": 74,
       "bid_c": 25,
       "bid_size": 11747,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT17BRELFC-TIE"
      },
      "h": {
       "ask_c": 40,
       "ask_size": 15137,
       "bid_c": 39,
       "bid_size": 34,
       "spread_c": 1,
       "ticker": "KXEPLGAME-26OCT17BRELFC-BRE"
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
   "opponent": "Brentford",
   "own_gdg": {
    "basis": "EACH CLUB'S OWN GD/g, DIFFERENCED — how much more one club outscores its own league than the other does theirs. It is NOT the withheld `gdg_gap`: 2.0 GD/g in the Eredivisie is not 2.0 GD/g in La Liga, so this sets two own-league margins side by side and never says one side is this many goals a game better than the other.",
    "diff": -0.2598684210526314
   },
   "ppg_gap": 0.052631578947368585,
   "rank_gap": 2,
   "ranks": {
    "fav": 4,
    "opp": 6
   },
   "rated_in": {
    "away": "epl",
    "home": "epl"
   },
   "rates": {
    "ga": [
     1.3092105263157894,
     1.2302631578947367
    ],
    "gdg": [
     0.16447368421052655,
     0.42434210526315796
    ],
    "gf": [
     1.473684210526316,
     1.6546052631578947
    ],
    "ppg": [
     1.549342105263158,
     1.4967105263157894
    ]
   },
   "refused": false,
   "reg_time_note": null,
   "resolution": {
    "Brentford": "exact",
    "Liverpool": "exact"
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
    "def": 0,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     3,
     2
    ],
    "def": [
     2,
     2
    ],
    "ovr": [
     1,
     2
    ]
   },
   "venue": {
    "city": "Brentford",
    "country": "England",
    "name": "Gtech Community Stadium"
   },
   "venue_class": {
    "class": "DOMESTIC",
    "home_side": "home"
   },
   "venue_favourite": {
    "agrees": false,
    "favourite": "Brentford",
    "flipped": false,
    "gdg_gap_abs": 0.2598684210526314,
    "home_side": "home",
    "policy": "off",
    "reason": "venue_outweighs_table_gap",
    "refused": false,
    "side": "home",
    "threshold": 0.3613416408668728,
    "threshold_source": "derived",
    "venue_class": "DOMESTIC"
   },
   "weights": {
    "away": 0.375,
    "basis": {
     "away": "blend",
     "home": "blend"
    },
    "constant": null,
    "home": 0.375,
    "k": 10.0,
    "min": 0.375
   }
  }
 ]
};
export const LEAGUES_RULES_REVIEW = {
 "back": 8,
 "date": "20261013",
 "finished": [
  {
   "away": "Newcastle United",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401879267",
   "espn": "eng.1",
   "event_id": "401879267",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Coventry City",
   "kickoff": "2026-10-12T19:00Z",
   "kind": "league",
   "league": "epl",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T15:30:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-epl-2026.json"
      },
      {
       "last_fixture": "2026-05-24T15:00:00+00:00",
       "path": "research_archive/inplay_states/states-epl-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 4,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Sevilla",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882852",
   "espn": "esp.1",
   "event_id": "401882852",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Levante",
   "kickoff": "2026-10-12T19:00Z",
   "kind": "league",
   "league": "laliga",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T15:00:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-la-liga-2026.json"
      },
      {
       "last_fixture": "2026-05-24T19:00:00+00:00",
       "path": "research_archive/inplay_states/states-la-liga-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 3,
    "home": 3,
    "source": "espn_scoreboard",
    "winner": "draw"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "D",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Udinese",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "competition_id": "401874763",
   "espn": "ita.1",
   "event_id": "401874763",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Torino",
   "kickoff": "2026-10-12T18:45Z",
   "kind": "league",
   "league": "seriea",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-24T18:45:00+00:00",
       "path": "research_archive/inplay_states/states-serie-a-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 2,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Venezia",
   "column": "seriea",
   "columns": [
    "seriea"
   ],
   "competition_id": "401875005",
   "espn": "ita.1",
   "event_id": "401875005",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Atalanta",
   "kickoff": "2026-10-12T16:30Z",
   "kind": "league",
   "league": "seriea",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-24T18:45:00+00:00",
       "path": "research_archive/inplay_states/states-serie-a-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 3,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Cruz Azul",
   "column": "ligamx",
   "columns": [
    "ligamx"
   ],
   "competition_id": "401876947",
   "espn": "mex.1",
   "event_id": "401876947",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Pumas UNAM",
   "kickoff": "2026-10-12T01:15Z",
   "kind": "league",
   "league": "ligamx",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T03:10:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-liga-mx-2026.json"
      },
      {
       "last_fixture": "2026-05-25T01:00:00+00:00",
       "path": "research_archive/inplay_states/states-liga-mx-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 3,
    "home": 3,
    "source": "espn_scoreboard",
    "winner": "draw"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "D",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Necaxa",
   "column": "ligamx",
   "columns": [
    "ligamx"
   ],
   "competition_id": "401876949",
   "espn": "mex.1",
   "event_id": "401876949",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Pachuca",
   "kickoff": "2026-10-11T23:10Z",
   "kind": "league",
   "league": "ligamx",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T03:10:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-liga-mx-2026.json"
      },
      {
       "last_fixture": "2026-05-25T01:00:00+00:00",
       "path": "research_archive/inplay_states/states-liga-mx-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 3,
    "home": 3,
    "source": "espn_scoreboard",
    "winner": "draw"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "D",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "LA Galaxy",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "competition_id": "761859",
   "espn": "usa.1",
   "event_id": "761859",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "St. Louis CITY SC",
   "kickoff": "2026-10-11T23:00Z",
   "kind": "league",
   "league": "mls",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T02:30:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-mls-2026.json"
      },
      {
       "last_fixture": "2026-08-08T20:30:00+00:00",
       "path": "research_archive/inplay_states/states-mls-2026.json"
      },
      {
       "last_fixture": "2025-12-06T19:30:00+00:00",
       "path": "research_archive/inplay_states/states-mls-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 2,
    "home": 6,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Valencia",
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882850",
   "espn": "esp.1",
   "event_id": "401882850",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Racing Santander",
   "kickoff": "2026-10-11T19:00Z",
   "kind": "league",
   "league": "laliga",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T15:00:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-la-liga-2026.json"
      },
      {
       "last_fixture": "2026-05-24T19:00:00+00:00",
       "path": "research_archive/inplay_states/states-la-liga-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 2,
    "home": 2,
    "source": "espn_scoreboard",
    "winner": "draw"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "D",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Marseille",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "competition_id": "401876440",
   "espn": "fra.1",
   "event_id": "401876440",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Troyes",
   "kickoff": "2026-10-11T18:45Z",
   "kind": "league",
   "league": "ligue1",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-29T18:45:00+00:00",
       "path": "research_archive/inplay_states/states-ligue-1-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 2,
    "home": 0,
    "source": "espn_scoreboard",
    "winner": "away"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "A",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Manchester City",
   "column": "epl",
   "columns": [
    "epl"
   ],
   "competition_id": "401879264",
   "espn": "eng.1",
   "event_id": "401879264",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Liverpool",
   "kickoff": "2026-10-11T15:30Z",
   "kind": "league",
   "league": "epl",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T15:30:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-epl-2026.json"
      },
      {
       "last_fixture": "2026-05-24T15:00:00+00:00",
       "path": "research_archive/inplay_states/states-epl-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 3,
    "home": 0,
    "source": "espn_scoreboard",
    "winner": "away"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "A",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Schalke 04",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884778",
   "espn": "ger.1",
   "event_id": "401884778",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "SC Freiburg",
   "kickoff": "2026-10-11T15:30Z",
   "kind": "league",
   "league": "bundesliga",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-21T18:30:00+00:00",
       "path": "research_archive/inplay_states/states-bundesliga-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 2,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "AJ Auxerre",
   "column": "ligue1",
   "columns": [
    "ligue1"
   ],
   "competition_id": "401876441",
   "espn": "fra.1",
   "event_id": "401876441",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Stade Rennais",
   "kickoff": "2026-10-11T15:15Z",
   "kind": "league",
   "league": "ligue1",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-29T18:45:00+00:00",
       "path": "research_archive/inplay_states/states-ligue-1-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 4,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "FC Groningen",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "competition_id": "401875584",
   "espn": "ned.1",
   "event_id": "401875584",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "Excelsior",
   "kickoff": "2026-10-11T14:45Z",
   "kind": "league",
   "league": "eredivisie",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-21T19:00:00+00:00",
       "path": "research_archive/inplay_states/states-eredivisie-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 5,
    "home": 1,
    "source": "espn_scoreboard",
    "winner": "away"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "A",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Borussia Mönchengladbach",
   "column": "bundesliga",
   "columns": [
    "bundesliga"
   ],
   "competition_id": "401884774",
   "espn": "ger.1",
   "event_id": "401884774",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "FC Cologne",
   "kickoff": "2026-10-11T13:30Z",
   "kind": "league",
   "league": "bundesliga",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-21T18:30:00+00:00",
       "path": "research_archive/inplay_states/states-bundesliga-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 2,
    "source": "espn_scoreboard",
    "winner": "home"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "H",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "SC Cambuur",
   "column": "eredivisie",
   "columns": [
    "eredivisie"
   ],
   "competition_id": "401875586",
   "espn": "ned.1",
   "event_id": "401875586",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "PEC Zwolle",
   "kickoff": "2026-10-11T12:30Z",
   "kind": "league",
   "league": "eredivisie",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-05-21T19:00:00+00:00",
       "path": "research_archive/inplay_states/states-eredivisie-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 0,
    "source": "espn_scoreboard",
    "winner": "away"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "A",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  },
  {
   "away": "Vancouver Whitecaps",
   "column": "mls",
   "columns": [
    "mls"
   ],
   "competition_id": "761858",
   "espn": "usa.1",
   "event_id": "761858",
   "fit": {
    "checkpoint_minute": 20,
    "confirm_note": "EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW. The confirm rule is: the favourite leads the card's threat tilt (band patterns.TILT_THREAT) AND leads the on-target count. The band is the card's own; the on-target leg adds no tuned number. It was written after looking at three fixtures and it describes a row — it forecasts nothing.",
    "confirm_reason": "no_pre_kickoff_favourite",
    "confirm_rule": "tilt_fav_and_on_target_lead",
    "confirmed_at_20": null,
    "favourite_won": null,
    "favourite_won_reason": "no_pre_kickoff_favourite"
   },
   "home": "LAFC",
   "kickoff": "2026-10-11T02:30Z",
   "kind": "league",
   "league": "mls",
   "market_t10": {
    "absent_detail": null,
    "absent_note": "match archive not reachable here — no T-10 book read",
    "absent_reason": "archive_not_configured",
    "ask_sum_c": null,
    "captured_at": null,
    "event_ticker": null,
    "legs": null,
    "market_favourite": null,
    "mid_sum_c": null,
    "overround_c": null,
    "overround_reason": null,
    "picker_favourite": null,
    "price_clock": null,
    "rung": "t10",
    "seconds_before_kickoff": null,
    "source": "match_archive.prematch.t10",
    "status": "absent"
   },
   "mm_lock": {
    "book_flag": null,
    "codes": null,
    "kickoff_at_lock": null,
    "locked_at": null,
    "market": null,
    "market_meta": null,
    "market_why": null,
    "model": null,
    "model_meta": null,
    "model_why": null,
    "note": "the model/market lock store is not reachable here — not read for this match",
    "reason": "store_not_configured",
    "seconds_before_kickoff": null,
    "source": "picker_mm_lock",
    "status": "unread",
    "top": null,
    "verdict": null
   },
   "pre_kickoff": {
    "board_date": null,
    "captured_at": null,
    "captured_lead_band": null,
    "captured_lead_band_means": null,
    "captured_seconds_before_kickoff": null,
    "corrections": 0,
    "origin": "reconstructed",
    "origin_label": "NOT AVAILABLE",
    "origin_note": "no stored read, and the archive cannot rebuild one for this fixture",
    "reconstructed_from": {
     "considered": [
      {
       "last_fixture": "2026-08-30T02:30:00+00:00",
       "path": "research_archive/apif_pro_topup_2026-08-30/inplay_states_2026/states-mls-2026.json"
      },
      {
       "last_fixture": "2026-08-08T20:30:00+00:00",
       "path": "research_archive/inplay_states/states-mls-2026.json"
      },
      {
       "last_fixture": "2025-12-06T19:30:00+00:00",
       "path": "research_archive/inplay_states/states-mls-2025.json"
      }
     ],
     "season_file": null
    },
    "state": null,
    "store_read": "ok",
    "store_read_error": null,
    "superseded": [],
    "unavailable_reason": "fixture_not_in_archive"
   },
   "result": {
    "away": 1,
    "home": 1,
    "source": "espn_scoreboard",
    "winner": "draw"
   },
   "result_lean": {
    "market_lean": null,
    "market_lean_why": "unread",
    "market_matched": null,
    "model_lean": null,
    "model_lean_why": "unread",
    "model_matched": null,
    "outcome": "D",
    "outcome_basis": "final_score",
    "reason": "store_not_configured",
    "status": "unread"
   },
   "shot_state": {
    "at_20": null,
    "before_first_goal": null,
    "error": "shot state not requested",
    "first_goal_minute": null,
    "full_time": null
   },
   "status_detail": "FT"
  }
 ],
 "folded": {},
 "generated_at": "2026-10-13T05:39:47.905291+00:00",
 "lead_band_ladder": [
  {
   "band": "near_kickoff",
   "ceiling_seconds": 10800.0,
   "means": "taken within 3h of kickoff — the table is final and the book is open. The tightest rung, and the one the scheduled capture sweep aims at"
  },
  {
   "band": "matchday",
   "ceiling_seconds": 172800.0,
   "means": "taken within 2 days — inside the window /api/picker/board serves when nobody asks for another"
  },
  {
   "band": "approach",
   "ceiling_seconds": 1209600.0,
   "means": "taken within 14 days — inside the widest window that route will serve at all"
  },
  {
   "band": "far",
   "ceiling_seconds": null,
   "means": "taken more than 14 days out, which is wider than the board route will serve: this read could only have been frozen by a caller naming a future `date`. It is a table read about a fixture whose clubs will play several more times first, and it is NOT comparable evidence to a read taken near kickoff"
  }
 ],
 "leagues": {
  "bundesliga": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 9,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 9
  },
  "epl": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 10,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 10
  },
  "eredivisie": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 9,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 9
  },
  "laliga": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 9,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 9
  },
  "ligamx": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 9,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 9
  },
  "ligue1": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 9,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 9
  },
  "mls": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 16,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 16
  },
  "seriea": {
   "captured": 0,
   "captured_by_lead_band": {},
   "corrected": 0,
   "error": null,
   "finished": 10,
   "kind": "league",
   "reconstructed": 0,
   "unavailable": 10
  }
 },
 "refusals": [
  {
   "away": "Athletic Club",
   "away_id": "93",
   "away_score": 0,
   "column": "laliga",
   "columns": [
    "laliga"
   ],
   "competition_id": "401882849",
   "espn": "esp.1",
   "event_id": "401882849",
   "home": "Rayo Vallecano",
   "home_id": "101",
   "home_score": 0,
   "kickoff": "2026-10-10T12:00Z",
   "league": "laliga",
   "reason": "not_completed",
   "status_detail": "Abandoned"
  }
 ],
 "store": {
  "backend": "null",
  "note": "no snapshot store is configured — set LIVE_DATABASE_URL (prod) or PICKER_SNAPSHOT_DIR (local); pre-kickoff reads are NOT being frozen",
  "writable": false
 },
 "window": {
  "from": "20261005",
  "to": "20261013"
 }
};

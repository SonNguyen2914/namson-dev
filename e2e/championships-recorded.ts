/* THE CHAMPIONSHIPS BOARD, RECORDED OFF THE ROUTE — not off a brief.
 *
 * GET /api/championships/board on the backend branch
 * `championships-integrated`, assembled 2026-09-24T23:32:30.506453+00:00 (date
 * 2026-09-24, days 14) with the national-team ratings merged:
 * 206 ranked rows, 0 refusals, 17 off the board.
 *
 * HOW IT WAS TRIMMED, AND NOTHING ELSE WAS TOUCHED. The recording was cut
 * to the page's own ask (`days=8`) exactly as the backend's
 * `payload._in_window` cuts it, then to 19 rows — the first few of
 * each column by kickoff, both `field_partial` rows, one with the starting
 * XIs announced, one with no Kalshi book and one with no head-to-head on
 * ESPN's record — and three of the off-board entries. The per-competition
 * `competitions` block is cut to what a surface reads: each column's
 * stages, its derived group tables and the Asian Cup's next fixtures.
 * Every kept key, value and absence is the wire's.
 * `off_board_counts` is left as the backend counted it.
 *
 * The AFC Asian Cup has no fixture in this window (it starts 7 Jan 2027),
 * so its column is declared and empty — which is itself a case the board
 * must draw.
 *
 * SAMPLE_REFUSAL IS THE ROUTE'S OWN REFUSED CARD FOR A PAIR THE FIELD
 * CANNOT PLACE. The merged recording rates every side in its window and so
 * carries no refusal; this one was built by the backend's own code —
 * `stages.refused_row`, `payload._side_block`/`_record` and
 * `markets.card_quote`, called exactly as `payload._card` calls them on
 * that branch (backend aca990d, run read-only) — around the RECORDED
 * Georgia v Northern Ireland fixture's own facts: its event, venue, group
 * record, book, form, head-to-head and lineups. The test that uses it
 * swaps it in for that fixture's ranked row rather than inventing a
 * fixture. */
export const CHAMP_CLOCK = "2026-09-24T23:32:30.506453+00:00";

export const CHAMP_BOARD = {
 "capture": {
  "backend": "not_requested",
  "writable": false
 },
 "columns": [
  "unl",
  "cnl",
  "asiancup",
  "afcon"
 ],
 "competitions": {
  "afcon": {
   "structure": {
    "stages": [
     {
      "dates": "25-31 Mar 2026",
      "key": "preliminary-round",
      "kind": "knockout",
      "label": "Qualifying preliminary round (two legs)",
      "on_provider": true
     },
     {
      "dates": "MD1-2 24 Sep-6 Oct 2026, MD3-4 9-17 Nov 2026, MD5-6 22-30 Mar 2027",
      "key": "group-stage",
      "kind": "group",
      "label": "Qualifying groups (12 groups of 4, home and away)",
      "on_provider": true
     },
     {
      "dates": "19 Jun-17 Jul 2027",
      "key": "finals",
      "kind": "finals",
      "label": "Finals, Kenya / Uganda / Tanzania",
      "on_provider": false
     }
    ]
   },
   "standings": {
    "derived": {
     "Group A": [
      {
       "d": 0,
       "espn_id": "4231",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "gabon",
       "l": 0,
       "name": "Gabon",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "6640",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "lesotho",
       "l": 0,
       "name": "Lesotho",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2869",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "morocco",
       "l": 0,
       "name": "Morocco",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "8937",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "niger",
       "l": 0,
       "name": "Niger",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group B": [
      {
       "d": 0,
       "espn_id": "653",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "angola",
       "l": 0,
       "name": "Angola",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2620",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "egypt",
       "l": 0,
       "name": "Egypt",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4325",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "malawi",
       "l": 0,
       "name": "Malawi",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "14075",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "south-sudan",
       "l": 0,
       "name": "South Sudan",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group C": [
      {
       "d": 0,
       "espn_id": "4789",
       "ga": 0,
       "gd": 2,
       "gf": 2,
       "gp": 1,
       "key": "ivory-coast",
       "l": 0,
       "name": "Ivory Coast",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "7368",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "gambia",
       "l": 0,
       "name": "Gambia",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "5776",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "somalia",
       "l": 0,
       "name": "Somalia",
       "position": 3,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4469",
       "ga": 2,
       "gd": -2,
       "gf": 0,
       "gp": 1,
       "key": "ghana",
       "l": 1,
       "name": "Ghana",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "Group D": [
      {
       "d": 0,
       "espn_id": "5774",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "eritrea",
       "l": 0,
       "name": "Eritrea",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2847",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "guinea",
       "l": 0,
       "name": "Guinea",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2848",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "kenya",
       "l": 0,
       "name": "Kenya",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "467",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "south-africa",
       "l": 0,
       "name": "South Africa",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group E": [
      {
       "d": 0,
       "espn_id": "2850",
       "ga": 0,
       "gd": 2,
       "gf": 2,
       "gp": 1,
       "key": "congo-dr",
       "l": 0,
       "name": "Congo DR",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "4214",
       "ga": 2,
       "gd": 1,
       "gf": 3,
       "gp": 1,
       "key": "zimbabwe",
       "l": 0,
       "name": "Zimbabwe",
       "position": 2,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "8600",
       "ga": 3,
       "gd": -1,
       "gf": 2,
       "gp": 1,
       "key": "sierra-leone",
       "l": 1,
       "name": "Sierra Leone",
       "position": 3,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "8938",
       "ga": 2,
       "gd": -2,
       "gf": 0,
       "gp": 1,
       "key": "equatorial-guinea",
       "l": 1,
       "name": "Equatorial Guinea",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "Group F": [
      {
       "d": 0,
       "espn_id": "8940",
       "ga": 1,
       "gd": 2,
       "gf": 3,
       "gp": 1,
       "key": "mauritania",
       "l": 0,
       "name": "Mauritania",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "2844",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "benin",
       "l": 0,
       "name": "Benin",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2845",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "burkina-faso",
       "l": 0,
       "name": "Burkina Faso",
       "position": 3,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "10528",
       "ga": 3,
       "gd": -2,
       "gf": 1,
       "gp": 1,
       "key": "central-african-republic",
       "l": 1,
       "name": "Central African Republic",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "Group G": [
      {
       "d": 0,
       "espn_id": "656",
       "ga": 1,
       "gd": 2,
       "gf": 3,
       "gp": 1,
       "key": "cameroon",
       "l": 0,
       "name": "Cameroon",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "6725",
       "ga": 0,
       "gd": 1,
       "gf": 1,
       "gp": 1,
       "key": "namibia",
       "l": 0,
       "name": "Namibia",
       "position": 2,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "4276",
       "ga": 1,
       "gd": -1,
       "gf": 0,
       "gp": 1,
       "key": "congo",
       "l": 1,
       "name": "Congo",
       "position": 3,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "8601",
       "ga": 3,
       "gd": -2,
       "gf": 1,
       "gp": 1,
       "key": "comoros",
       "l": 1,
       "name": "Comoros",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "Group H": [
      {
       "d": 1,
       "espn_id": "4245",
       "ga": 2,
       "gd": 0,
       "gf": 2,
       "gp": 1,
       "key": "botswana",
       "l": 0,
       "name": "Botswana",
       "position": 1,
       "pts": 1,
       "w": 0
      },
      {
       "d": 1,
       "espn_id": "2621",
       "ga": 2,
       "gd": 0,
       "gf": 2,
       "gp": 1,
       "key": "libya",
       "l": 0,
       "name": "Libya",
       "position": 2,
       "pts": 1,
       "w": 0
      },
      {
       "d": 1,
       "espn_id": "659",
       "ga": 1,
       "gd": 0,
       "gf": 1,
       "gp": 1,
       "key": "tunisia",
       "l": 0,
       "name": "Tunisia",
       "position": 3,
       "pts": 1,
       "w": 0
      },
      {
       "d": 1,
       "espn_id": "4211",
       "ga": 1,
       "gd": 0,
       "gf": 1,
       "gp": 1,
       "key": "uganda",
       "l": 0,
       "name": "Uganda",
       "position": 4,
       "pts": 1,
       "w": 0
      }
     ],
     "Group I": [
      {
       "d": 0,
       "espn_id": "624",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "algeria",
       "l": 0,
       "name": "Algeria",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "5779",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "burundi",
       "l": 0,
       "name": "Burundi",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4356",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "togo",
       "l": 0,
       "name": "Togo",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4277",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "zambia",
       "l": 0,
       "name": "Zambia",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group J": [
      {
       "d": 0,
       "espn_id": "5777",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "ethiopia",
       "l": 0,
       "name": "Ethiopia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "8939",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "mozambique",
       "l": 0,
       "name": "Mozambique",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "654",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "senegal",
       "l": 0,
       "name": "Senegal",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4319",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "sudan",
       "l": 0,
       "name": "Sudan",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group K": [
      {
       "d": 0,
       "espn_id": "2597",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "cape-verde",
       "l": 0,
       "name": "Cape Verde",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4205",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "liberia",
       "l": 0,
       "name": "Liberia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2849",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "mali",
       "l": 0,
       "name": "Mali",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2851",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "rwanda",
       "l": 0,
       "name": "Rwanda",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group L": [
      {
       "d": 0,
       "espn_id": "8602",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "guinea-bissau",
       "l": 0,
       "name": "Guinea-Bissau",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "5533",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "madagascar",
       "l": 0,
       "name": "Madagascar",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "657",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "nigeria",
       "l": 0,
       "name": "Nigeria",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "5778",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "tanzania",
       "l": 0,
       "name": "Tanzania",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   }
  },
  "asiancup": {
   "structure": {
    "stages": [
     {
      "dates": "7-20 Jan 2027",
      "key": "group-stage",
      "kind": "group",
      "label": "Group stage (6 groups of 4)",
      "on_provider": true
     },
     {
      "dates": "22-25 Jan 2027",
      "key": "round-of-16",
      "kind": "knockout",
      "label": "Round of 16",
      "on_provider": true
     },
     {
      "dates": "28-29 Jan 2027",
      "key": "quarterfinals",
      "kind": "knockout",
      "label": "Quarter-finals",
      "on_provider": true
     },
     {
      "dates": "1-2 Feb 2027",
      "key": "semifinals",
      "kind": "knockout",
      "label": "Semi-finals",
      "on_provider": true
     },
     {
      "dates": "5 Feb 2027",
      "key": "final",
      "kind": "knockout",
      "label": "Final",
      "on_provider": true
     }
    ]
   },
   "standings": {
    "derived": {
     "Group A": [
      {
       "d": 0,
       "espn_id": "841",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "kuwait",
       "l": 0,
       "name": "Kuwait",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2841",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "oman",
       "l": 0,
       "name": "Oman",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "6167",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "palestine",
       "l": 0,
       "name": "Palestine",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "655",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "saudi-arabia",
       "l": 0,
       "name": "Saudi Arabia",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group B": [
      {
       "d": 0,
       "espn_id": "4381",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "bahrain",
       "l": 0,
       "name": "Bahrain",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2917",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "jordan",
       "l": 0,
       "name": "Jordan",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4860",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "north-korea",
       "l": 0,
       "name": "North Korea",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2570",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "uzbekistan",
       "l": 0,
       "name": "Uzbekistan",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group C": [
      {
       "d": 0,
       "espn_id": "658",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "china",
       "l": 0,
       "name": "China",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "469",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "iran",
       "l": 0,
       "name": "Iran",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "6724",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "kyrgyz-republic",
       "l": 0,
       "name": "Kyrgyz Republic",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4380",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "syria",
       "l": 0,
       "name": "Syria",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group D": [
      {
       "d": 0,
       "espn_id": "628",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "australia",
       "l": 0,
       "name": "Australia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4375",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "iraq",
       "l": 0,
       "name": "Iraq",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4384",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "singapore",
       "l": 0,
       "name": "Singapore",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "6723",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "tajikistan",
       "l": 0,
       "name": "Tajikistan",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group E": [
      {
       "d": 0,
       "espn_id": "451",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "south-korea",
       "l": 0,
       "name": "South Korea",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4397",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "united-arab-emirates",
       "l": 0,
       "name": "United Arab Emirates",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "7349",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "vietnam",
       "l": 0,
       "name": "Vietnam",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "6014",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "yemen",
       "l": 0,
       "name": "Yemen",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group F": [
      {
       "d": 0,
       "espn_id": "4895",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "indonesia",
       "l": 0,
       "name": "Indonesia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "627",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "japan",
       "l": 0,
       "name": "Japan",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4398",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "qatar",
       "l": 0,
       "name": "Qatar",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "4396",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "thailand",
       "l": 0,
       "name": "Thailand",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   },
   "teams": {
    "australia": {
     "name": "Australia",
     "espn_id": "628",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401872242",
      "kickoff": "2027-01-09T20:00Z",
      "opponent": "Singapore"
     }
    },
    "bahrain": {
     "name": "Bahrain",
     "espn_id": "4381",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401872239",
      "kickoff": "2027-01-08T20:00Z",
      "opponent": "North Korea"
     }
    },
    "china": {
     "name": "China",
     "espn_id": "658",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401872244",
      "kickoff": "2027-01-09T20:00Z",
      "opponent": "Iran"
     }
    },
    "indonesia": {
     "name": "Indonesia",
     "espn_id": "4895",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401872248",
      "kickoff": "2027-01-11T20:00Z",
      "opponent": "Japan"
     }
    },
    "iran": {
     "name": "Iran",
     "espn_id": "469",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401872244",
      "kickoff": "2027-01-09T20:00Z",
      "opponent": "China"
     }
    },
    "iraq": {
     "name": "Iraq",
     "espn_id": "4375",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401872246",
      "kickoff": "2027-01-10T20:00Z",
      "opponent": "Tajikistan"
     }
    },
    "japan": {
     "name": "Japan",
     "espn_id": "627",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401872248",
      "kickoff": "2027-01-11T20:00Z",
      "opponent": "Indonesia"
     }
    },
    "jordan": {
     "name": "Jordan",
     "espn_id": "2917",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401872241",
      "kickoff": "2027-01-08T20:00Z",
      "opponent": "Uzbekistan"
     }
    },
    "kuwait": {
     "name": "Kuwait",
     "espn_id": "841",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401872240",
      "kickoff": "2027-01-08T20:00Z",
      "opponent": "Oman"
     }
    },
    "kyrgyz-republic": {
     "name": "Kyrgyz Republic",
     "espn_id": "6724",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401872243",
      "kickoff": "2027-01-09T20:00Z",
      "opponent": "Syria"
     }
    },
    "north-korea": {
     "name": "North Korea",
     "espn_id": "4860",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401872239",
      "kickoff": "2027-01-08T20:00Z",
      "opponent": "Bahrain"
     }
    },
    "oman": {
     "name": "Oman",
     "espn_id": "2841",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401872240",
      "kickoff": "2027-01-08T20:00Z",
      "opponent": "Kuwait"
     }
    },
    "palestine": {
     "name": "Palestine",
     "espn_id": "6167",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401872238",
      "kickoff": "2027-01-07T20:00Z",
      "opponent": "Saudi Arabia"
     }
    },
    "qatar": {
     "name": "Qatar",
     "espn_id": "4398",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401872247",
      "kickoff": "2027-01-11T20:00Z",
      "opponent": "Thailand"
     }
    },
    "saudi-arabia": {
     "name": "Saudi Arabia",
     "espn_id": "655",
     "group": "Group A",
     "next_fixture": {
      "event_id": "401872238",
      "kickoff": "2027-01-07T20:00Z",
      "opponent": "Palestine"
     }
    },
    "singapore": {
     "name": "Singapore",
     "espn_id": "4384",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401872242",
      "kickoff": "2027-01-09T20:00Z",
      "opponent": "Australia"
     }
    },
    "south-korea": {
     "name": "South Korea",
     "espn_id": "451",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401872245",
      "kickoff": "2027-01-10T20:00Z",
      "opponent": "Yemen"
     }
    },
    "syria": {
     "name": "Syria",
     "espn_id": "4380",
     "group": "Group C",
     "next_fixture": {
      "event_id": "401872243",
      "kickoff": "2027-01-09T20:00Z",
      "opponent": "Kyrgyz Republic"
     }
    },
    "tajikistan": {
     "name": "Tajikistan",
     "espn_id": "6723",
     "group": "Group D",
     "next_fixture": {
      "event_id": "401872246",
      "kickoff": "2027-01-10T20:00Z",
      "opponent": "Iraq"
     }
    },
    "thailand": {
     "name": "Thailand",
     "espn_id": "4396",
     "group": "Group F",
     "next_fixture": {
      "event_id": "401872247",
      "kickoff": "2027-01-11T20:00Z",
      "opponent": "Qatar"
     }
    },
    "united-arab-emirates": {
     "name": "United Arab Emirates",
     "espn_id": "4397",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401872249",
      "kickoff": "2027-01-11T20:00Z",
      "opponent": "Vietnam"
     }
    },
    "uzbekistan": {
     "name": "Uzbekistan",
     "espn_id": "2570",
     "group": "Group B",
     "next_fixture": {
      "event_id": "401872241",
      "kickoff": "2027-01-08T20:00Z",
      "opponent": "Jordan"
     }
    },
    "vietnam": {
     "name": "Vietnam",
     "espn_id": "7349",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401872249",
      "kickoff": "2027-01-11T20:00Z",
      "opponent": "United Arab Emirates"
     }
    },
    "yemen": {
     "name": "Yemen",
     "espn_id": "6014",
     "group": "Group E",
     "next_fixture": {
      "event_id": "401872245",
      "kickoff": "2027-01-10T20:00Z",
      "opponent": "South Korea"
     }
    }
   }
  },
  "cnl": {
   "structure": {
    "stages": [
     {
      "dates": "21 Sep-6 Oct 2026; League B also 9-17 Nov 2026",
      "key": "group-stage",
      "kind": "group",
      "label": "Group stage (Leagues A, B, C)",
      "on_provider": true
     },
     {
      "dates": "9-17 Nov 2026",
      "key": "quarterfinals",
      "kind": "knockout",
      "label": "League A quarter-finals (two legs)",
      "on_provider": false
     },
     {
      "dates": "25-28 Mar 2027",
      "key": "finals",
      "kind": "finals",
      "label": "League A Finals, SoFi Stadium",
      "on_provider": false
     },
     {
      "dates": "22-30 Mar 2027",
      "key": "league-bc-championships",
      "kind": "finals",
      "label": "League B and League C Championships",
      "on_provider": false
     }
    ]
   },
   "standings": {
    "derived": {
     "League A - Group A": [
      {
       "d": 0,
       "espn_id": "214",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "costa-rica",
       "l": 0,
       "name": "Costa Rica",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "11678",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "curacao",
       "l": 0,
       "name": "Curaçao",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2649",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "dominican-republic",
       "l": 0,
       "name": "Dominican Republic",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2654",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "haiti",
       "l": 0,
       "name": "Haiti",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2658",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "nicaragua",
       "l": 0,
       "name": "Nicaragua",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2627",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "trinidad-and-tobago",
       "l": 0,
       "name": "Trinidad and Tobago",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "League A - Group B": [
      {
       "d": 0,
       "espn_id": "2650",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "el-salvador",
       "l": 0,
       "name": "El Salvador",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2652",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "guatemala",
       "l": 0,
       "name": "Guatemala",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "215",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "honduras",
       "l": 0,
       "name": "Honduras",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "1038",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "jamaica",
       "l": 0,
       "name": "Jamaica",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2728",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "martinique",
       "l": 0,
       "name": "Martinique",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2664",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "suriname",
       "l": 0,
       "name": "Suriname",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "League B - Group A": [
      {
       "d": 0,
       "espn_id": "2653",
       "ga": 0,
       "gd": 1,
       "gf": 1,
       "gp": 1,
       "key": "guyana",
       "l": 0,
       "name": "Guyana",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "2646",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "cayman-islands",
       "l": 0,
       "name": "Cayman Islands",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "13582",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "dominica",
       "l": 0,
       "name": "Dominica",
       "position": 3,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "11766",
       "ga": 1,
       "gd": -1,
       "gf": 0,
       "gp": 1,
       "key": "puerto-rico",
       "l": 1,
       "name": "Puerto Rico",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "League B - Group B": [
      {
       "d": 0,
       "espn_id": "2637",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "barbados",
       "l": 0,
       "name": "Barbados",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2643",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "bermuda",
       "l": 0,
       "name": "Bermuda",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "7657",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "guadeloupe",
       "l": 0,
       "name": "Guadeloupe",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2661",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "st-lucia",
       "l": 0,
       "name": "St. Lucia",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "League B - Group C": [
      {
       "d": 0,
       "espn_id": "19314",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "bonaire",
       "l": 0,
       "name": "Bonaire",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2647",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "cuba",
       "l": 0,
       "name": "Cuba",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2651",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "grenada",
       "l": 0,
       "name": "Grenada",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2662",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "st-kitts-and-nevis",
       "l": 0,
       "name": "St. Kitts and Nevis",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "League B - Group D": [
      {
       "d": 0,
       "espn_id": "2641",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "belize",
       "l": 0,
       "name": "Belize",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "10532",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "french-guiana",
       "l": 0,
       "name": "French Guiana",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "18243",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "sint-maarten",
       "l": 0,
       "name": "Sint Maarten",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "13584",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "st-vincent-and-the-grenadines",
       "l": 0,
       "name": "St. Vincent and the Grenadines",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "League C - Group A": [
      {
       "d": 0,
       "espn_id": "2655",
       "ga": 0,
       "gd": 2,
       "gf": 2,
       "gp": 1,
       "key": "montserrat",
       "l": 0,
       "name": "Montserrat",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "2644",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "british-virgin-islands",
       "l": 0,
       "name": "British Virgin Islands",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2665",
       "ga": 2,
       "gd": -2,
       "gf": 0,
       "gp": 1,
       "key": "turks-and-caicos-islands",
       "l": 1,
       "name": "Turks and Caicos Islands",
       "position": 3,
       "pts": 0,
       "w": 0
      }
     ],
     "League C - Group B": [
      {
       "d": 0,
       "espn_id": "2642",
       "ga": 0,
       "gd": 1,
       "gf": 1,
       "gp": 1,
       "key": "aruba",
       "l": 0,
       "name": "Aruba",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "8942",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "anguilla",
       "l": 0,
       "name": "Anguilla",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2638",
       "ga": 1,
       "gd": -1,
       "gf": 0,
       "gp": 1,
       "key": "antigua-and-barbuda",
       "l": 1,
       "name": "Antigua and Barbuda",
       "position": 3,
       "pts": 0,
       "w": 0
      }
     ],
     "League C - Group C": [
      {
       "d": 0,
       "espn_id": "10596",
       "ga": 0,
       "gd": 8,
       "gf": 8,
       "gp": 1,
       "key": "st-martin",
       "l": 0,
       "name": "St. Martin",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "2645",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "us-virgin-islands",
       "l": 0,
       "name": "US Virgin Islands",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2640",
       "ga": 8,
       "gd": -8,
       "gf": 0,
       "gp": 1,
       "key": "bahamas",
       "l": 1,
       "name": "Bahamas",
       "position": 3,
       "pts": 0,
       "w": 0
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   }
  },
  "unl": {
   "structure": {
    "stages": [
     {
      "dates": "MD1 24-26 Sep, MD2 27-29 Sep, MD3 30 Sep-3 Oct, MD4 4-6 Oct, MD5 12-14 Nov, MD6 15-17 Nov 2026",
      "key": "group-stage",
      "kind": "group",
      "label": "League phase (Leagues A-D)",
      "on_provider": true
     },
     {
      "dates": "25-30 Mar 2027",
      "key": "quarterfinals",
      "kind": "knockout",
      "label": "League A quarter-finals (two legs)",
      "on_provider": false
     },
     {
      "dates": "25-30 Mar 2027",
      "key": "promotion-relegation-playoffs",
      "kind": "playoff",
      "label": "League A/B and B/C promotion/relegation play-offs",
      "on_provider": false
     },
     {
      "dates": "9-13 Jun 2027",
      "key": "finals",
      "kind": "finals",
      "label": "Final tournament (four teams)",
      "on_provider": false
     },
     {
      "dates": "23-28 Mar 2028",
      "key": "league-cd-playoffs",
      "kind": "playoff",
      "label": "League C/D play-offs",
      "on_provider": false
     }
    ]
   },
   "standings": {
    "derived": {
     "Group A1": [
      {
       "d": 0,
       "espn_id": "459",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "belgium",
       "l": 0,
       "name": "Belgium",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "478",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "france",
       "l": 0,
       "name": "France",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "162",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "italy",
       "l": 0,
       "name": "Italy",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "465",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "turkiye",
       "l": 0,
       "name": "Türkiye",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group A2": [
      {
       "d": 0,
       "espn_id": "455",
       "ga": 1,
       "gd": 1,
       "gf": 2,
       "gp": 1,
       "key": "greece",
       "l": 0,
       "name": "Greece",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 1,
       "espn_id": "481",
       "ga": 1,
       "gd": 0,
       "gf": 1,
       "gp": 1,
       "key": "germany",
       "l": 0,
       "name": "Germany",
       "position": 2,
       "pts": 1,
       "w": 0
      },
      {
       "d": 1,
       "espn_id": "449",
       "ga": 1,
       "gd": 0,
       "gf": 1,
       "gp": 1,
       "key": "netherlands",
       "l": 0,
       "name": "Netherlands",
       "position": 3,
       "pts": 1,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "6757",
       "ga": 2,
       "gd": -1,
       "gf": 1,
       "gp": 1,
       "key": "serbia",
       "l": 1,
       "name": "Serbia",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "Group A3": [
      {
       "d": 0,
       "espn_id": "477",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "croatia",
       "l": 0,
       "name": "Croatia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "450",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "czechia",
       "l": 0,
       "name": "Czechia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "448",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "england",
       "l": 0,
       "name": "England",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "164",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "spain",
       "l": 0,
       "name": "Spain",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group A4": [
      {
       "d": 0,
       "espn_id": "464",
       "ga": 2,
       "gd": 1,
       "gf": 3,
       "gp": 1,
       "key": "norway",
       "l": 0,
       "name": "Norway",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "482",
       "ga": 0,
       "gd": 1,
       "gf": 1,
       "gp": 1,
       "key": "portugal",
       "l": 0,
       "name": "Portugal",
       "position": 2,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "479",
       "ga": 3,
       "gd": -1,
       "gf": 2,
       "gp": 1,
       "key": "denmark",
       "l": 1,
       "name": "Denmark",
       "position": 3,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "578",
       "ga": 1,
       "gd": -1,
       "gf": 0,
       "gp": 1,
       "key": "wales",
       "l": 1,
       "name": "Wales",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "Group B1": [
      {
       "d": 0,
       "espn_id": "463",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "north-macedonia",
       "l": 0,
       "name": "North Macedonia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "580",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "scotland",
       "l": 0,
       "name": "Scotland",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "472",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "slovenia",
       "l": 0,
       "name": "Slovenia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "475",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "switzerland",
       "l": 0,
       "name": "Switzerland",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group B2": [
      {
       "d": 0,
       "espn_id": "584",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "georgia",
       "l": 0,
       "name": "Georgia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "480",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "hungary",
       "l": 0,
       "name": "Hungary",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "586",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "northern-ireland",
       "l": 0,
       "name": "Northern Ireland",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "457",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "ukraine",
       "l": 0,
       "name": "Ukraine",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group B3": [
      {
       "d": 0,
       "espn_id": "474",
       "ga": 1,
       "gd": 2,
       "gf": 3,
       "gp": 1,
       "key": "austria",
       "l": 0,
       "name": "Austria",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "18272",
       "ga": 0,
       "gd": 1,
       "gf": 1,
       "gp": 1,
       "key": "kosovo",
       "l": 0,
       "name": "Kosovo",
       "position": 2,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "476",
       "ga": 1,
       "gd": -1,
       "gf": 0,
       "gp": 1,
       "key": "republic-of-ireland",
       "l": 1,
       "name": "Republic of Ireland",
       "position": 3,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "461",
       "ga": 3,
       "gd": -2,
       "gf": 1,
       "gp": 1,
       "key": "israel",
       "l": 1,
       "name": "Israel",
       "position": 4,
       "pts": 0,
       "w": 0
      }
     ],
     "Group B4": [
      {
       "d": 0,
       "espn_id": "452",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "bosnia-herzegovina",
       "l": 0,
       "name": "Bosnia-Herzegovina",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "471",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "poland",
       "l": 0,
       "name": "Poland",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "473",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "romania",
       "l": 0,
       "name": "Romania",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "466",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "sweden",
       "l": 0,
       "name": "Sweden",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group C1": [
      {
       "d": 0,
       "espn_id": "585",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "albania",
       "l": 0,
       "name": "Albania",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "583",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "belarus",
       "l": 0,
       "name": "Belarus",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "458",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "finland",
       "l": 0,
       "name": "Finland",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "588",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "san-marino",
       "l": 0,
       "name": "San Marino",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group C2": [
      {
       "d": 0,
       "espn_id": "579",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "armenia",
       "l": 0,
       "name": "Armenia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "445",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "cyprus",
       "l": 0,
       "name": "Cyprus",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "456",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "latvia",
       "l": 0,
       "name": "Latvia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "6775",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "montenegro",
       "l": 0,
       "name": "Montenegro",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group C3": [
      {
       "d": 0,
       "espn_id": "447",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "faroe-islands",
       "l": 0,
       "name": "Faroe Islands",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "2619",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "kazakhstan",
       "l": 0,
       "name": "Kazakhstan",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "483",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "moldova",
       "l": 0,
       "name": "Moldova",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "468",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "slovakia",
       "l": 0,
       "name": "Slovakia",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group C4": [
      {
       "d": 0,
       "espn_id": "462",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "bulgaria",
       "l": 0,
       "name": "Bulgaria",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "444",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "estonia",
       "l": 0,
       "name": "Estonia",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "470",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "iceland",
       "l": 0,
       "name": "Iceland",
       "position": null,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "582",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "luxembourg",
       "l": 0,
       "name": "Luxembourg",
       "position": null,
       "pts": 0,
       "w": 0
      }
     ],
     "Group D1": [
      {
       "d": 0,
       "espn_id": "453",
       "ga": 1,
       "gd": 1,
       "gf": 2,
       "gp": 1,
       "key": "malta",
       "l": 0,
       "name": "Malta",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "16721",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "gibraltar",
       "l": 0,
       "name": "Gibraltar",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "587",
       "ga": 2,
       "gd": -1,
       "gf": 1,
       "gp": 1,
       "key": "andorra",
       "l": 1,
       "name": "Andorra",
       "position": 3,
       "pts": 0,
       "w": 0
      }
     ],
     "Group D2": [
      {
       "d": 0,
       "espn_id": "460",
       "ga": 0,
       "gd": 2,
       "gf": 2,
       "gp": 1,
       "key": "lithuania",
       "l": 0,
       "name": "Lithuania",
       "position": 1,
       "pts": 3,
       "w": 1
      },
      {
       "d": 0,
       "espn_id": "581",
       "ga": 0,
       "gd": 0,
       "gf": 0,
       "gp": 0,
       "key": "azerbaijan",
       "l": 0,
       "name": "Azerbaijan",
       "position": 2,
       "pts": 0,
       "w": 0
      },
      {
       "d": 0,
       "espn_id": "589",
       "ga": 2,
       "gd": -2,
       "gf": 0,
       "gp": 1,
       "key": "liechtenstein",
       "l": 1,
       "name": "Liechtenstein",
       "position": 3,
       "pts": 0,
       "w": 0
      }
     ]
    },
    "ordering_note": "ordered by points, then goal difference, then goals scored, then name. THIS IS NOT THE GOVERNING BODY'S TIE-BREAK: UEFA, Concacaf, the AFC and CAF all break level points on head-to-head results first, so two teams level on points may legitimately sit in the other order on the official table. The NUMBERS are the claim here; the order on a points tie is not."
   }
  }
 },
 "date": "2026-09-24",
 "days": 8,
 "field_floor_note": "REFUSED BY THE PLACEABILITY FLOOR ON THE FIRST READING. This team's confederation did not clear the floor on this axis for this competition's field — on the goal axes that is G3: the median entrant's 95% interval is wider than one equal-width band of the field. The value is measured and shown; the interval beside it IS the refusal, and it is what stops the rank being read as precision. It is ranked with everyone else, because a team the evidence cannot place is not thereby a worse team.",
 "field_unit_notes": {
  "elo": "ELO, on the one cross-league scale this field is fitted on. Higher is better. It is a rating and not a rate: there is no per-match reading of it, which is why `rate` is null on this axis. The half-width beside it is a 95% half-width in the same elo points, so the interval is the value plus and minus it.",
  "log_goals": "LOG-GOALS, quoted from the measurement that publishes them: \"attack = expected goals a club scores against an average cross-league defence at a neutral venue, logged; defence = the same for goals conceded, SIGNED so that higher is better\". So HIGHER IS BETTER ON BOTH, and a surface must not re-invert defence on the grounds that conceding less is better — the artifact already did it, and the ranks are built on the signed value. THE HALF-WIDTH IS ON THE LOG SCALE. The readable goals-per-match figure is exp() of this value and the interval does not belong to it; the two must never be printed as a point and its band."
 },
 "generated_at": "2026-09-24T23:32:30.506453+00:00",
 "identity": {
  "path": "src/data/national_teams.json",
  "teams": 173
 },
 "leagues": {
  "afcon": {
   "clubs": 48,
   "confederation": "CAF",
   "display": "Africa Cup of Nations",
   "edition": "2027",
   "espn": [
    "caf.nations_qual",
    "caf.nations"
   ],
   "kind": "championship",
   "min_current_gp": null,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "src": null
  },
  "asiancup": {
   "clubs": 24,
   "confederation": "AFC",
   "display": "AFC Asian Cup",
   "edition": "2027",
   "espn": [
    "afc.asian.cup"
   ],
   "kind": "championship",
   "min_current_gp": null,
   "reg_time_note": "KXAFCACGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "src": null
  },
  "cnl": {
   "clubs": 37,
   "confederation": "CONCACAF",
   "display": "Concacaf Nations League",
   "edition": "2026-27",
   "espn": [
    "concacaf.nations.league"
   ],
   "kind": "championship",
   "min_current_gp": null,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "src": null
  },
  "unl": {
   "clubs": 54,
   "confederation": "UEFA",
   "display": "UEFA Nations League",
   "edition": "2026-27",
   "espn": [
    "uefa.nations"
   ],
   "kind": "championship",
   "min_current_gp": null,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "src": null
  }
 },
 "mode": "championships",
 "off_board": [
  {
   "away": "Malta",
   "code": "finished",
   "competition_id": "401861047",
   "event_id": "401861047",
   "home": "Andorra",
   "kickoff": "2026-09-24T16:00Z",
   "league": "unl",
   "state": "post",
   "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this — 'once a match finished I have no way to access it to see where could I do better' — and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous"
  },
  {
   "away": "Germany",
   "code": "finished",
   "competition_id": "401861041",
   "event_id": "401861041",
   "home": "Netherlands",
   "kickoff": "2026-09-24T18:45Z",
   "league": "unl",
   "state": "post",
   "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this — 'once a match finished I have no way to access it to see where could I do better' — and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous"
  },
  {
   "away": "Greece",
   "code": "finished",
   "competition_id": "401861042",
   "event_id": "401861042",
   "home": "Serbia",
   "kickoff": "2026-09-24T18:45Z",
   "league": "unl",
   "state": "post",
   "why": "the provider's own status says this match is OVER. This is now the ONLY way a fixture leaves the board, and it is the one departure that hands the reader a surface needing no token: a finished fixture is read on the picker REVIEW surface (GET /api/picker/review), which exists for exactly this — 'once a match finished I have no way to access it to see where could I do better' — and the frontend stacks it in the SAME column, under a divider, so the league's story stays continuous"
  }
 ],
 "off_board_counts": {
  "event_unreadable": 0,
  "finished": 17,
  "kicked_off": 0,
  "no_state": 0,
  "not_yet_kicked_off": 0,
  "state_unrecognised": 0
 },
 "refusals": [],
 "rows": [
  {
   "away": "Northern Ireland",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "competition_id": "401861049",
   "cross_league": false,
   "current_only": null,
   "espn": "uefa.nations",
   "event_id": "401861049",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Georgia",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3505339402792876,
       "interval": [
        0.20264425597253716,
        0.9037121365311123
       ],
       "rank": 25,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 0.5531781962518247
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4681312450618206,
       "interval": [
        0.025489789275269348,
        0.9617522793989105
       ],
       "rank": 27,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.4936210343370899
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3888902300840509,
       "interval": [
        0.007624380064627512,
        0.7854048402327293
       ],
       "rank": 28,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.3965146101486784
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.508658551872439,
       "interval": [
        0.10573175820915182,
        1.1230488619540298
       ],
       "rank": 19,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.6143903100815908
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 28.343159363309677,
       "interval": [
        1630.429858797688,
        1687.1161775243074
       ],
       "rank": 25,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "value": 1658.7730181609977
      },
      "field_size": 54,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 34.444644147682524,
       "interval": [
        1549.5160492620792,
        1618.4053375574442
       ],
       "rank": 32,
       "straddles": false,
       "tier": 3,
       "tier_set": [
        3
       ],
       "value": 1583.9606934097617
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Georgia",
     "opp": "Northern Ireland"
    },
    "competition": "unl",
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "HOLLOW",
    "size": 54
   },
   "form": {
    "fav": "LDWDW",
    "opp": "WLDWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Georgia",
   "in_play": false,
   "kalshi": {
    "ask_c": 53,
    "ask_size": 12601,
    "bid_c": 52,
    "bid_size": 1000,
    "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO"
   },
   "kickoff": "2026-09-25T16:00Z",
   "league": "unl",
   "national": {
    "competition": "unl",
    "group": "Group B2",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Georgia",
       "away_score": 1,
       "completed": true,
       "date": "2008-03-26T19:45:00Z",
       "event_id": "236855",
       "home": "Northern Ireland",
       "home_score": 4,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 1,
      "draw": 0,
      "home": 0
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Northern Ireland"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Georgia"
      }
     }
    },
    "market": {
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "legs": {
      "away": {
       "ask_c": 22,
       "ask_size": 13685,
       "bid_c": 20,
       "bid_size": 6388,
       "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
       "flags": [],
       "name": "Northern Ireland",
       "spread_c": 2,
       "ticker": "KXUEFANLGAME-26SEP25GEONIR-NIR"
      },
      "home": {
       "ask_c": 53,
       "ask_size": 12601,
       "bid_c": 52,
       "bid_size": 1000,
       "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
       "flags": [],
       "name": "Georgia",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO"
      },
      "tie": {
       "ask_c": 27,
       "ask_size": 88,
       "bid_c": 26,
       "bid_size": 7720,
       "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
       "flags": [
        "THIN"
       ],
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25GEONIR-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Georgia vs Northern Ireland"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 12:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "586",
      "form": {
       "available": true,
       "friendlies": 3,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-17T19:45Z",
         "event_id": "724910",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Luxembourg",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2026-03-26T19:45Z",
         "event_id": "761380",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Italy",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-31T18:45Z",
         "event_id": "401866761",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Wales",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-04T16:00Z",
         "event_id": "401871360",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Guinea",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-08T19:10Z",
         "event_id": "401869804",
         "ga": 3,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "France",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WLDWL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "northern-ireland",
      "name": "Northern Ireland",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4681312450618206,
         "interval": [
          0.025489789275269348,
          0.9617522793989105
         ],
         "rank": 27,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.4936210343370899
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.508658551872439,
         "interval": [
          0.10573175820915182,
          1.1230488619540298
         ],
         "rank": 19,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.6143903100815908
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 34.444644147682524,
         "interval": [
          1549.5160492620792,
          1618.4053375574442
         ],
         "rank": 32,
         "straddles": false,
         "tier": 3,
         "tier_set": [
          3
         ],
         "unit": "elo",
         "value": 1583.9606934097617
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "584",
      "form": {
       "available": true,
       "friendlies": 4,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-18T19:45Z",
         "event_id": "724916",
         "ga": 2,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Bulgaria",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-26T17:00Z",
         "event_id": "763032",
         "ga": 2,
         "gf": 2,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Israel",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-29T13:00Z",
         "event_id": "763033",
         "ga": 0,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Lithuania",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-02T17:00Z",
         "event_id": "401865145",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Romania",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-05T16:00Z",
         "event_id": "401870001",
         "ga": 0,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Bahrain",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "LDWDW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "georgia",
      "name": "Georgia",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3505339402792876,
         "interval": [
          0.20264425597253716,
          0.9037121365311123
         ],
         "rank": 25,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.5531781962518247
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3888902300840509,
         "interval": [
          0.007624380064627512,
          0.7854048402327293
         ],
         "rank": 28,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.3965146101486784
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 28.343159363309677,
         "interval": [
          1630.429858797688,
          1687.1161775243074
         ],
         "rank": 25,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "unit": "elo",
         "value": 1658.7730181609977
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Georgia"
   },
   "opponent": "Northern Ireland",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 25,
    "opp": 32
   },
   "rated_in": {
    "away": "unl",
    "home": "unl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Georgia": "espn_id",
    "Northern Ireland": "espn_id"
   },
   "shape": "HOLLOW",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 0,
    "def": 0,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     2,
     2
    ],
    "def": [
     2,
     2
    ],
    "ovr": [
     2,
     3
    ]
   },
   "venue": {
    "city": "Tbilisi",
    "country": "Georgia",
    "name": "Boris Paichadze Dinamo Arena"
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
   "weights": null
  },
  {
   "away": "Latvia",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "competition_id": "401861050",
   "cross_league": false,
   "current_only": null,
   "espn": "uefa.nations",
   "event_id": "401861050",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Armenia",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.5461650198079696,
       "interval": [
        -0.45858135412358136,
        0.6337486854923579
       ],
       "rank": 36,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "value": 0.08758366568438822
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4344354455138879,
       "interval": [
        -1.020358901682104,
        -0.15148801065432826
       ],
       "rank": 49,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "value": -0.5859234561682162
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.286613124733929,
       "interval": [
        -0.7734322388712598,
        -0.20020598940340179
       ],
       "rank": 51,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "value": -0.4868191141373308
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.49948067979257404,
       "interval": [
        -0.5825784145192461,
        0.41638294506590207
       ],
       "rank": 44,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": -0.08309773472667198
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 18.549093545442293,
       "interval": [
        1370.1372255650224,
        1407.2354126559069
       ],
       "rank": 46,
       "straddles": false,
       "tier": 4,
       "tier_set": [
        4
       ],
       "value": 1388.6863191104646
      },
      "field_size": 54,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 21.445019405859526,
       "interval": [
        1321.5493896848402,
        1364.4394284965592
       ],
       "rank": 49,
       "straddles": false,
       "tier": 4,
       "tier_set": [
        4
       ],
       "value": 1342.9944090906997
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Armenia",
     "opp": "Latvia"
    },
    "competition": "unl",
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 54
   },
   "form": {
    "fav": "LLLDD",
    "opp": "LDLWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Armenia",
   "in_play": false,
   "kalshi": {
    "ask_c": 54,
    "ask_size": 150,
    "bid_c": 53,
    "bid_size": 4584,
    "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUEFANLGAME-26SEP25ARMLAT-ARM"
   },
   "kickoff": "2026-09-25T16:00Z",
   "league": "unl",
   "national": {
    "competition": "unl",
    "group": "Group C2",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Armenia",
       "away_score": 0,
       "completed": true,
       "date": "2014-09-03T17:45:00Z",
       "event_id": "404031",
       "home": "Latvia",
       "home_score": 2,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Latvia",
       "away_score": 1,
       "completed": true,
       "date": "2023-06-19T16:00:00Z",
       "event_id": "655316",
       "home": "Armenia",
       "home_score": 2,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Armenia",
       "away_score": 0,
       "completed": true,
       "date": "2023-10-12T16:00:00Z",
       "event_id": "655388",
       "home": "Latvia",
       "home_score": 2,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Latvia",
       "away_score": 1,
       "completed": true,
       "date": "2024-09-07T16:00:00Z",
       "event_id": "698900",
       "home": "Armenia",
       "home_score": 4,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Armenia",
       "away_score": 2,
       "completed": true,
       "date": "2024-11-17T14:00:00Z",
       "event_id": "699012",
       "home": "Latvia",
       "home_score": 1,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 2,
      "draw": 0,
      "home": 3
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Latvia"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Armenia"
      }
     }
    },
    "market": {
     "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
     "legs": {
      "away": {
       "ask_c": 21,
       "ask_size": 9045,
       "bid_c": 20,
       "bid_size": 256,
       "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
       "flags": [],
       "name": "Latvia",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25ARMLAT-LAT"
      },
      "home": {
       "ask_c": 54,
       "ask_size": 150,
       "bid_c": 53,
       "bid_size": 4584,
       "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
       "flags": [],
       "name": "Armenia",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25ARMLAT-ARM"
      },
      "tie": {
       "ask_c": 27,
       "ask_size": 19199,
       "bid_c": 26,
       "bid_size": 10,
       "event_ticker": "KXUEFANLGAME-26SEP25ARMLAT",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25ARMLAT-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Armenia vs Latvia"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 12:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "456",
      "form": {
       "available": true,
       "friendlies": 1,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-10-14T18:45Z",
         "event_id": "724871",
         "ga": 5,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "England",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-13T17:00Z",
         "event_id": "757628",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "North Macedonia",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-16T17:00Z",
         "event_id": "724903",
         "ga": 2,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Serbia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "UEFA Nations League",
         "date": "2026-03-26T17:00Z",
         "event_id": "723731",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Gibraltar",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "UEFA Nations League",
         "date": "2026-03-31T16:00Z",
         "event_id": "723732",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Gibraltar",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "LDLWW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "latvia",
      "name": "Latvia",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4344354455138879,
         "interval": [
          -1.020358901682104,
          -0.15148801065432826
         ],
         "rank": 49,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "unit": "log_goals",
         "value": -0.5859234561682162
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.49948067979257404,
         "interval": [
          -0.5825784145192461,
          0.41638294506590207
         ],
         "rank": 44,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.08309773472667198
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 21.445019405859526,
         "interval": [
          1321.5493896848402,
          1364.4394284965592
         ],
         "rank": 49,
         "straddles": false,
         "tier": 4,
         "tier_set": [
          4
         ],
         "unit": "elo",
         "value": 1342.9944090906997
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "579",
      "form": {
       "available": true,
       "friendlies": 3,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-13T17:00Z",
         "event_id": "724876",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Hungary",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-16T14:00Z",
         "event_id": "724900",
         "ga": 9,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Portugal",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-29T14:00Z",
         "event_id": "401858183",
         "ga": 2,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Belarus",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-06T14:00Z",
         "event_id": "401866137",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Kazakhstan",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-09T15:00Z",
         "event_id": "401866138",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Moldova",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        }
       ],
       "letters": "LLLDD",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "armenia",
      "name": "Armenia",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5461650198079696,
         "interval": [
          -0.45858135412358136,
          0.6337486854923579
         ],
         "rank": 36,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.08758366568438822
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.286613124733929,
         "interval": [
          -0.7734322388712598,
          -0.20020598940340179
         ],
         "rank": 51,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.4868191141373308
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 18.549093545442293,
         "interval": [
          1370.1372255650224,
          1407.2354126559069
         ],
         "rank": 46,
         "straddles": false,
         "tier": 4,
         "tier_set": [
          4
         ],
         "unit": "elo",
         "value": 1388.6863191104646
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Armenia"
   },
   "opponent": "Latvia",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 46,
    "opp": 49
   },
   "rated_in": {
    "away": "unl",
    "home": "unl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Armenia": "espn_id",
    "Latvia": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": -1,
    "ovr": 0
   },
   "tiers": {
    "atk": [
     3,
     4
    ],
    "def": [
     5,
     4
    ],
    "ovr": [
     4,
     4
    ]
   },
   "venue": {
    "city": "Yerevan",
    "country": "Armenia",
    "name": "Vazgen Sargsyan Republican Stadium"
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
   "weights": null
  },
  {
   "away": "Romania",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "competition_id": "401861051",
   "cross_league": false,
   "current_only": null,
   "espn": "uefa.nations",
   "event_id": "401861051",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Sweden",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3556941909978883,
       "interval": [
        0.519299805195087,
        1.2306881871908637
       ],
       "rank": 13,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.8749939961929754
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.34807577062999884,
       "interval": [
        0.30084786118256956,
        0.9969994024425672
       ],
       "rank": 21,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 0.6489236318125684
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3175955775473188,
       "interval": [
        -0.0936801297698773,
        0.5415110253247604
       ],
       "rank": 37,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.22391544777744152
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.5350277015346563,
       "interval": [
        -0.05497701438485558,
        1.015078388684457
       ],
       "rank": 24,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.4800506871498007
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 40.82279375021259,
       "interval": [
        1667.6724069026614,
        1749.3179944030867
       ],
       "rank": 22,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1708.495200652874
      },
      "field_size": 54,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 23.93034098225602,
       "interval": [
        1611.329441789994,
        1659.190123754506
       ],
       "rank": 28,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "value": 1635.25978277225
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Sweden",
     "opp": "Romania"
    },
    "competition": "unl",
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 54
   },
   "form": {
    "fav": "DWLDL",
    "opp": "WLLDW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Sweden",
   "in_play": false,
   "kalshi": {
    "ask_c": 67,
    "ask_size": 9146,
    "bid_c": 66,
    "bid_size": 3882,
    "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUEFANLGAME-26SEP25SWEROU-SWE"
   },
   "kickoff": "2026-09-25T18:45Z",
   "league": "unl",
   "national": {
    "competition": "unl",
    "group": "Group B4",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Sweden",
       "away_score": 2,
       "completed": true,
       "date": "1994-07-10T07:00:00Z",
       "event_id": "198072",
       "home": "Romania",
       "home_score": 2,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Sweden",
       "away_score": 0,
       "completed": true,
       "date": "2018-03-27T18:30:00Z",
       "event_id": "504725",
       "home": "Romania",
       "home_score": 1,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Romania",
       "away_score": 1,
       "completed": true,
       "date": "2019-03-23T17:00:00Z",
       "event_id": "529075",
       "home": "Sweden",
       "home_score": 2,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Sweden",
       "away_score": 2,
       "completed": true,
       "date": "2019-11-15T19:45:00Z",
       "event_id": "528884",
       "home": "Romania",
       "home_score": 0,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 1,
      "draw": 1,
      "home": 2
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Romania"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Sweden"
      }
     }
    },
    "market": {
     "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
     "legs": {
      "away": {
       "ask_c": 15,
       "ask_size": 10913,
       "bid_c": 14,
       "bid_size": 220,
       "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
       "flags": [],
       "name": "Romania",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25SWEROU-ROU"
      },
      "home": {
       "ask_c": 67,
       "ask_size": 9146,
       "bid_c": 66,
       "bid_size": 3882,
       "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
       "flags": [],
       "name": "Sweden",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25SWEROU-SWE"
      },
      "tie": {
       "ask_c": 20,
       "ask_size": 36,
       "bid_c": 19,
       "bid_size": 3361,
       "event_ticker": "KXUEFANLGAME-26SEP25SWEROU",
       "flags": [
        "THIN"
       ],
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25SWEROU-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Sweden vs Romania"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "teams": {
     "away": {
      "espn_id": "473",
      "form": {
       "available": true,
       "friendlies": 3,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-18T19:45Z",
         "event_id": "724920",
         "ga": 1,
         "gf": 7,
         "kind": "competitive",
         "letter": "W",
         "opponent": "San Marino",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2026-03-26T17:00Z",
         "event_id": "761383",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Türkiye",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-31T18:45Z",
         "event_id": "401866739",
         "ga": 2,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Slovakia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-02T17:00Z",
         "event_id": "401865145",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Georgia",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-06T17:45Z",
         "event_id": "401869206",
         "ga": 1,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Wales",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "WLLDW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "romania",
      "name": "Romania",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.34807577062999884,
         "interval": [
          0.30084786118256956,
          0.9969994024425672
         ],
         "rank": 21,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.6489236318125684
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5350277015346563,
         "interval": [
          -0.05497701438485558,
          1.015078388684457
         ],
         "rank": 24,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": 0.4800506871498007
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 23.93034098225602,
         "interval": [
          1611.329441789994,
          1659.190123754506
         ],
         "rank": 28,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "unit": "elo",
         "value": 1635.25978277225
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "466",
      "form": {
       "available": true,
       "friendlies": 1,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-06-04T17:00Z",
         "event_id": "401870034",
         "ga": 2,
         "gf": 2,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Greece",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-15T02:00Z",
         "event_id": "760424",
         "ga": 1,
         "gf": 5,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Tunisia",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-20T17:00Z",
         "event_id": "760447",
         "ga": 5,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Netherlands",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-25T23:00Z",
         "event_id": "760471",
         "ga": 1,
         "gf": 1,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Japan",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-30T21:00Z",
         "event_id": "760492",
         "ga": 3,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "France",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "DWLDL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "sweden",
      "name": "Sweden",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3556941909978883,
         "interval": [
          0.519299805195087,
          1.2306881871908637
         ],
         "rank": 13,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.8749939961929754
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3175955775473188,
         "interval": [
          -0.0936801297698773,
          0.5415110253247604
         ],
         "rank": 37,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": 0.22391544777744152
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 40.82279375021259,
         "interval": [
          1667.6724069026614,
          1749.3179944030867
         ],
         "rank": 22,
         "straddles": false,
         "tier": 2,
         "tier_set": [
          2
         ],
         "unit": "elo",
         "value": 1708.495200652874
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Sweden"
   },
   "opponent": "Romania",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 22,
    "opp": 28
   },
   "rated_in": {
    "away": "unl",
    "home": "unl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Romania": "espn_id",
    "Sweden": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": -1,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     1,
     2
    ],
    "def": [
     3,
     2
    ],
    "ovr": [
     2,
     3
    ]
   },
   "venue": {
    "city": "Stockholm",
    "country": "Sweden",
    "name": "Friends Arena"
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
   "weights": null
  },
  {
   "away": "Belgium",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "competition_id": "401861052",
   "cross_league": false,
   "current_only": null,
   "espn": "uefa.nations",
   "event_id": "401861052",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Italy",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3577965771925674,
       "interval": [
        0.5740092011034782,
        1.2896023554886131
       ],
       "rank": 11,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.9318057782960456
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.3965603707179892,
       "interval": [
        0.47073810775837444,
        1.263858849194353
       ],
       "rank": 14,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.8672984784763637
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.42747737341096176,
       "interval": [
        0.23391183476637162,
        1.0888665815882952
       ],
       "rank": 15,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.6613892081773334
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4548703989845032,
       "interval": [
        0.13401582405658052,
        1.043756622025587
       ],
       "rank": 20,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.5888862230410837
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 29.69832941167836,
       "interval": [
        1833.4074795455076,
        1892.8041383688642
       ],
       "rank": 9,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1863.105808957186
      },
      "field_size": 54,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 45.72787803777344,
       "interval": [
        1800.9865755274145,
        1892.4423316029615
       ],
       "rank": 10,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1846.714453565188
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Italy",
     "opp": "Belgium"
    },
    "competition": "unl",
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "HOLLOW",
    "size": 54
   },
   "form": {
    "fav": "LWDWW",
    "opp": "DWWWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Italy",
   "in_play": false,
   "kalshi": {
    "ask_c": 44,
    "ask_size": 19884,
    "bid_c": 43,
    "bid_size": 100,
    "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUEFANLGAME-26SEP25ITABEL-ITA"
   },
   "kickoff": "2026-09-25T18:45Z",
   "league": "unl",
   "national": {
    "competition": "unl",
    "group": "Group A1",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Italy",
       "away_score": 2,
       "completed": true,
       "date": "2016-06-13T19:00:00Z",
       "event_id": "438195",
       "home": "Belgium",
       "home_score": 0,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Italy",
       "away_score": 2,
       "completed": true,
       "date": "2021-07-02T19:00:00Z",
       "event_id": "560299",
       "home": "Belgium",
       "home_score": 1,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Belgium",
       "away_score": 1,
       "completed": true,
       "date": "2021-10-10T13:00:00Z",
       "event_id": "589984",
       "home": "Italy",
       "home_score": 2,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Belgium",
       "away_score": 2,
       "completed": true,
       "date": "2024-10-10T18:45:00Z",
       "event_id": "698939",
       "home": "Italy",
       "home_score": 2,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Italy",
       "away_score": 1,
       "completed": true,
       "date": "2024-11-14T19:45:00Z",
       "event_id": "698988",
       "home": "Belgium",
       "home_score": 0,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 0,
      "draw": 1,
      "home": 4
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Belgium"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Italy"
      }
     }
    },
    "market": {
     "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
     "legs": {
      "away": {
       "ask_c": 31,
       "ask_size": 15513,
       "bid_c": 30,
       "bid_size": 3752,
       "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
       "flags": [],
       "name": "Belgium",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25ITABEL-BEL"
      },
      "home": {
       "ask_c": 44,
       "ask_size": 19884,
       "bid_c": 43,
       "bid_size": 100,
       "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
       "flags": [],
       "name": "Italy",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25ITABEL-ITA"
      },
      "tie": {
       "ask_c": 27,
       "ask_size": 12311,
       "bid_c": 26,
       "bid_size": 14975,
       "event_ticker": "KXUEFANLGAME-26SEP25ITABEL",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25ITABEL-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Italy vs Belgium"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "teams": {
     "away": {
      "espn_id": "459",
      "form": {
       "available": true,
       "friendlies": 0,
       "games": [
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-21T19:00Z",
         "event_id": "760451",
         "ga": 0,
         "gf": 0,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Iran",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-27T03:00Z",
         "event_id": "760477",
         "ga": 1,
         "gf": 5,
         "kind": "competitive",
         "letter": "W",
         "opponent": "New Zealand",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-01T20:00Z",
         "event_id": "760493",
         "ga": 2,
         "gf": 3,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Senegal",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-07T00:00Z",
         "event_id": "760507",
         "ga": 1,
         "gf": 4,
         "kind": "competitive",
         "letter": "W",
         "opponent": "United States",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-10T19:00Z",
         "event_id": "760511",
         "ga": 2,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Spain",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "DWWWL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "belgium",
      "name": "Belgium",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3965603707179892,
         "interval": [
          0.47073810775837444,
          1.263858849194353
         ],
         "rank": 14,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.8672984784763637
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4548703989845032,
         "interval": [
          0.13401582405658052,
          1.043756622025587
         ],
         "rank": 20,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.5888862230410837
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 45.72787803777344,
         "interval": [
          1800.9865755274145,
          1892.4423316029615
         ],
         "rank": 10,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "elo",
         "value": 1846.714453565188
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "162",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-16T19:45Z",
         "event_id": "724906",
         "ga": 4,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Norway",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2026-03-26T19:45Z",
         "event_id": "761380",
         "ga": 0,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Northern Ireland",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2026-03-31T18:45Z",
         "event_id": "761952",
         "ga": 1,
         "gf": 1,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Bosnia-Herzegovina",
         "provider_agrees": false,
         "provider_letter": "L",
         "shootout": {
          "against": 4,
          "for": 1,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         },
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-03T18:45Z",
         "event_id": "401869325",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Luxembourg",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-07T19:00Z",
         "event_id": "401870630",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Greece",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        }
       ],
       "letters": "LWDWW",
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "italy",
      "name": "Italy",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3577965771925674,
         "interval": [
          0.5740092011034782,
          1.2896023554886131
         ],
         "rank": 11,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.9318057782960456
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.42747737341096176,
         "interval": [
          0.23391183476637162,
          1.0888665815882952
         ],
         "rank": 15,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.6613892081773334
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 29.69832941167836,
         "interval": [
          1833.4074795455076,
          1892.8041383688642
         ],
         "rank": 9,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "elo",
         "value": 1863.105808957186
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Italy"
   },
   "opponent": "Belgium",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 9,
    "opp": 10
   },
   "rated_in": {
    "away": "unl",
    "home": "unl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Belgium": "espn_id",
    "Italy": "espn_id"
   },
   "shape": "HOLLOW",
   "src": "current",
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
     2,
     2
    ],
    "ovr": [
     2,
     2
    ]
   },
   "venue": {
    "city": "Roma",
    "country": "Italy",
    "name": "Olimpico"
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
   "weights": null
  },
  {
   "away": "France",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "competition_id": "401861053",
   "cross_league": false,
   "current_only": null,
   "espn": "uefa.nations",
   "event_id": "401861053",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "France",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3283153296980987,
       "interval": [
        0.8071467231186544,
        1.463777382514852
       ],
       "rank": 7,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 1.1354620528167532
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.42461230624549157,
       "interval": [
        0.5381371842243019,
        1.387361796715285
       ],
       "rank": 10,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.9627494904697934
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.5362318044047655,
       "interval": [
        0.21773959479343297,
        1.2902032036029638
       ],
       "rank": 8,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.7539713991981984
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.6800174362890935,
       "interval": [
        -0.027252014436459526,
        1.3327828581417274
       ],
       "rank": 16,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.652765421852634
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 58.17171607523273,
       "interval": [
        1919.101758712481,
        2035.4451908629464
       ],
       "rank": 2,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 1977.2734747877137
      },
      "field_size": 54,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 56.91255939570981,
       "interval": [
        1776.5469098032056,
        1890.3720285946254
       ],
       "rank": 12,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1833.4594691989155
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "France",
     "opp": "Türkiye"
    },
    "competition": "unl",
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 54
   },
   "form": {
    "fav": "WWWLL",
    "opp": "WWLLW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Türkiye",
   "in_play": false,
   "kalshi": {
    "ask_c": 72,
    "ask_size": 174116,
    "bid_c": 71,
    "bid_size": 15815,
    "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUEFANLGAME-26SEP25TURFRA-FRA"
   },
   "kickoff": "2026-09-25T18:45Z",
   "league": "unl",
   "national": {
    "competition": "unl",
    "group": "Group A1",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Türkiye",
       "away_score": 2,
       "completed": true,
       "date": "2003-06-26T19:00:00Z",
       "event_id": "98518",
       "home": "France",
       "home_score": 3,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Türkiye",
       "away_score": 0,
       "completed": true,
       "date": "2009-06-05T19:00:00Z",
       "event_id": "266292",
       "home": "France",
       "home_score": 1,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "France",
       "away_score": 0,
       "completed": true,
       "date": "2019-06-08T18:45:00Z",
       "event_id": "529020",
       "home": "Türkiye",
       "home_score": 2,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Türkiye",
       "away_score": 1,
       "completed": true,
       "date": "2019-10-14T18:45:00Z",
       "event_id": "528909",
       "home": "France",
       "home_score": 1,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 2,
      "draw": 1,
      "home": 1
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "France"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Türkiye"
      }
     }
    },
    "market": {
     "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
     "legs": {
      "away": {
       "ask_c": 72,
       "ask_size": 174116,
       "bid_c": 71,
       "bid_size": 15815,
       "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
       "flags": [],
       "name": "France",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25TURFRA-FRA"
      },
      "home": {
       "ask_c": 12,
       "ask_size": 126552,
       "bid_c": 11,
       "bid_size": 853,
       "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
       "flags": [],
       "name": "Turkiye",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25TURFRA-TUR"
      },
      "tie": {
       "ask_c": 18,
       "ask_size": 149,
       "bid_c": 17,
       "bid_size": 9432,
       "event_ticker": "KXUEFANLGAME-26SEP25TURFRA",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25TURFRA-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Turkiye vs France"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "teams": {
     "away": {
      "espn_id": "478",
      "form": {
       "available": true,
       "friendlies": 0,
       "games": [
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-30T21:00Z",
         "event_id": "760492",
         "ga": 0,
         "gf": 3,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Sweden",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-04T21:00Z",
         "event_id": "760503",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Paraguay",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-09T20:00Z",
         "event_id": "760510",
         "ga": 0,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Morocco",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-14T19:00Z",
         "event_id": "760514",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Spain",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-18T21:00Z",
         "event_id": "760516",
         "ga": 6,
         "gf": 4,
         "kind": "competitive",
         "letter": "L",
         "opponent": "England",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        }
       ],
       "letters": "WWWLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "france",
      "name": "France",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3283153296980987,
         "interval": [
          0.8071467231186544,
          1.463777382514852
         ],
         "rank": 7,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 1.1354620528167532
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5362318044047655,
         "interval": [
          0.21773959479343297,
          1.2902032036029638
         ],
         "rank": 8,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.7539713991981984
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 58.17171607523273,
         "interval": [
          1919.101758712481,
          2035.4451908629464
         ],
         "rank": 2,
         "straddles": false,
         "tier": 1,
         "tier_set": [
          1
         ],
         "unit": "elo",
         "value": 1977.2734747877137
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "465",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-06-01T17:30Z",
         "event_id": "401871359",
         "ga": 0,
         "gf": 4,
         "kind": "friendly",
         "letter": "W",
         "opponent": "North Macedonia",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-06T22:00Z",
         "event_id": "401871361",
         "ga": 1,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Venezuela",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-14T04:00Z",
         "event_id": "760421",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Australia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-20T03:00Z",
         "event_id": "760443",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Paraguay",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-26T02:00Z",
         "event_id": "760470",
         "ga": 2,
         "gf": 3,
         "kind": "competitive",
         "letter": "W",
         "opponent": "United States",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "WWLLW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "turkiye",
      "name": "Türkiye",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.42461230624549157,
         "interval": [
          0.5381371842243019,
          1.387361796715285
         ],
         "rank": 10,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.9627494904697934
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6800174362890935,
         "interval": [
          -0.027252014436459526,
          1.3327828581417274
         ],
         "rank": 16,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.652765421852634
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 56.91255939570981,
         "interval": [
          1776.5469098032056,
          1890.3720285946254
         ],
         "rank": 12,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "elo",
         "value": 1833.4594691989155
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Türkiye"
   },
   "opponent": "Türkiye",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 2,
    "opp": 12
   },
   "rated_in": {
    "away": "unl",
    "home": "unl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "France": "espn_id",
    "Türkiye": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 0,
    "def": 1,
    "ovr": 1
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
     2
    ]
   },
   "venue": {
    "city": "Kocaeli",
    "country": "Türkiye",
    "name": "Yildiz Entegre Kocaeli Stadyumu"
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
   "weights": null
  },
  {
   "away": "Ukraine",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "competition_id": "401861054",
   "cross_league": false,
   "current_only": null,
   "espn": "uefa.nations",
   "event_id": "401861054",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Ukraine",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.5040230868298657,
       "interval": [
        0.18432808922801258,
        1.192374262887744
       ],
       "rank": 20,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 0.6883511760578783
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.42739182869614123,
       "interval": [
        -0.10577360042171896,
        0.7490100569705636
       ],
       "rank": 30,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        2,
        3
       ],
       "value": 0.32161822827442227
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.400639482644058,
       "interval": [
        -0.062326780148120875,
        0.7389521851399952
       ],
       "rank": 30,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.33831270249593715
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.43564051874083337,
       "interval": [
        -0.03633110851760912,
        0.8349499289640576
       ],
       "rank": 27,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.39930941022322425
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 28.985386776955036,
       "interval": [
        1726.82553194851,
        1784.79630550242
       ],
       "rank": 15,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1755.810918725465
      },
      "field_size": 54,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 20.37983768144731,
       "interval": [
        1709.6730626015499,
        1750.4327379644444
       ],
       "rank": 17,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1730.0529002829971
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Ukraine",
     "opp": "Hungary"
    },
    "competition": "unl",
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "HOLLOW",
    "size": 54
   },
   "form": {
    "fav": "WLWWL",
    "opp": "LWDWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Hungary",
   "in_play": false,
   "kalshi": {
    "ask_c": 30,
    "ask_size": 8840,
    "bid_c": 29,
    "bid_size": 608,
    "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXUEFANLGAME-26SEP25HUNUKR-UKR"
   },
   "kickoff": "2026-09-25T18:45Z",
   "league": "unl",
   "national": {
    "competition": "unl",
    "group": "Group B2",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Ukraine"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Hungary"
      }
     }
    },
    "market": {
     "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
     "legs": {
      "away": {
       "ask_c": 30,
       "ask_size": 8840,
       "bid_c": 29,
       "bid_size": 608,
       "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
       "flags": [],
       "name": "Ukraine",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25HUNUKR-UKR"
      },
      "home": {
       "ask_c": 42,
       "ask_size": 6204,
       "bid_c": 41,
       "bid_size": 3276,
       "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
       "flags": [],
       "name": "Hungary",
       "spread_c": 1,
       "ticker": "KXUEFANLGAME-26SEP25HUNUKR-HUN"
      },
      "tie": {
       "ask_c": 30,
       "ask_size": 11342,
       "bid_c": 28,
       "bid_size": 4051,
       "event_ticker": "KXUEFANLGAME-26SEP25HUNUKR",
       "flags": [],
       "spread_c": 2,
       "ticker": "KXUEFANLGAME-26SEP25HUNUKR-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Hungary vs Ukraine"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 2:45 PM EDT",
    "teams": {
     "away": {
      "espn_id": "457",
      "form": {
       "available": true,
       "friendlies": 3,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-16T17:00Z",
         "event_id": "724904",
         "ga": 0,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Iceland",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2026-03-26T19:45Z",
         "event_id": "761384",
         "ga": 3,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Sweden",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-31T18:45Z",
         "event_id": "401866760",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Albania",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-05-31T15:30Z",
         "event_id": "401872548",
         "ga": 0,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Poland",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-07T16:30Z",
         "event_id": "401871170",
         "ga": 2,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Denmark",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WLWWL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "ukraine",
      "name": "Ukraine",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5040230868298657,
         "interval": [
          0.18432808922801258,
          1.192374262887744
         ],
         "rank": 20,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.6883511760578783
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.400639482644058,
         "interval": [
          -0.062326780148120875,
          0.7389521851399952
         ],
         "rank": 30,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": 0.33831270249593715
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 28.985386776955036,
         "interval": [
          1726.82553194851,
          1784.79630550242
         ],
         "rank": 15,
         "straddles": false,
         "tier": 2,
         "tier_set": [
          2
         ],
         "unit": "elo",
         "value": 1755.810918725465
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "480",
      "form": {
       "available": true,
       "friendlies": 4,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-16T14:00Z",
         "event_id": "724899",
         "ga": 3,
         "gf": 2,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Republic of Ireland",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-28T17:00Z",
         "event_id": "401857704",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Slovenia",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-31T17:00Z",
         "event_id": "401857705",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Greece",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-05T17:45Z",
         "event_id": "401861779",
         "ga": 1,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Finland",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-09T17:00Z",
         "event_id": "401861661",
         "ga": 1,
         "gf": 3,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Kazakhstan",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "LWDWW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "hungary",
      "name": "Hungary",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.42739182869614123,
         "interval": [
          -0.10577360042171896,
          0.7490100569705636
         ],
         "rank": 30,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.32161822827442227
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.43564051874083337,
         "interval": [
          -0.03633110851760912,
          0.8349499289640576
         ],
         "rank": 27,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.39930941022322425
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 20.37983768144731,
         "interval": [
          1709.6730626015499,
          1750.4327379644444
         ],
         "rank": 17,
         "straddles": false,
         "tier": 2,
         "tier_set": [
          2
         ],
         "unit": "elo",
         "value": 1730.0529002829971
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Hungary"
   },
   "opponent": "Hungary",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 15,
    "opp": 17
   },
   "rated_in": {
    "away": "unl",
    "home": "unl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Hungary": "espn_id",
    "Ukraine": "espn_id"
   },
   "shape": "HOLLOW",
   "src": "current",
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
     2,
     2
    ],
    "def": [
     3,
     2
    ],
    "ovr": [
     2,
     2
    ]
   },
   "venue": {
    "city": "Budapest",
    "country": "Hungary",
    "name": "Puskás Aréna"
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
   "weights": null
  },
  {
   "away": "Azerbaijan",
   "column": "unl",
   "columns": [
    "unl"
   ],
   "competition_id": "401861067",
   "cross_league": false,
   "current_only": null,
   "espn": "uefa.nations",
   "event_id": "401861067",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Azerbaijan",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.6447324219351562,
       "interval": [
        -1.3143303488197162,
        -0.02486550494940387
       ],
       "rank": 50,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -0.6695979268845601
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4905172225027586,
       "interval": [
        -0.8335100274868288,
        0.14752441751868844
       ],
       "rank": 46,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "value": -0.34299280498407014
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3391368406616741,
       "interval": [
        -0.5586560046774935,
        0.11961767664585471
       ],
       "rank": 48,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -0.2195191640158194
      },
      "field_size": 54,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.33449096479329327,
       "interval": [
        -0.21834621638359278,
        0.4506357132029938
       ],
       "rank": 39,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": 0.11614474840970049
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 50.919205997213275,
       "interval": [
        1366.989223728553,
        1468.8276357229797
       ],
       "rank": 43,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "value": 1417.9084297257664
      },
      "field_size": 54,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 18.904289528697067,
       "interval": [
        1304.4860013973528,
        1342.294580454747
       ],
       "rank": 50,
       "straddles": false,
       "tier": 4,
       "tier_set": [
        4
       ],
       "value": 1323.3902909260498
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Azerbaijan",
     "opp": "Lithuania"
    },
    "competition": "unl",
    "field_basis": "the UEFA Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "HOLLOW",
    "size": 54
   },
   "form": {
    "fav": "WDLWW",
    "opp": "LDLWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 1,
    "min": 0
   },
   "home": "Lithuania",
   "in_play": false,
   "kalshi": {
    "ask_c": 31,
    "ask_size": 956,
    "bid_c": 29,
    "bid_size": 63,
    "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXUEFANLGAME-26SEP27LTUAZE-AZE"
   },
   "kickoff": "2026-09-27T13:00Z",
   "league": "unl",
   "national": {
    "competition": "unl",
    "group": "Group D2",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Azerbaijan",
       "away_score": 0,
       "completed": true,
       "date": "2008-03-26T17:00:00Z",
       "event_id": "237441",
       "home": "Lithuania",
       "home_score": 1,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Lithuania",
       "away_score": 0,
       "completed": true,
       "date": "2019-03-25T14:00:00Z",
       "event_id": "501645",
       "home": "Azerbaijan",
       "home_score": 0,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 0,
      "draw": 1,
      "home": 1
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Azerbaijan"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Lithuania"
      }
     }
    },
    "market": {
     "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
     "legs": {
      "away": {
       "ask_c": 31,
       "ask_size": 956,
       "bid_c": 29,
       "bid_size": 63,
       "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
       "flags": [],
       "name": "Azerbaijan",
       "spread_c": 2,
       "ticker": "KXUEFANLGAME-26SEP27LTUAZE-AZE"
      },
      "home": {
       "ask_c": 39,
       "ask_size": 61,
       "bid_c": 36,
       "bid_size": 48,
       "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
       "flags": [
        "THIN"
       ],
       "name": "Lithuania",
       "spread_c": 3,
       "ticker": "KXUEFANLGAME-26SEP27LTUAZE-LTU"
      },
      "tie": {
       "ask_c": 33,
       "ask_size": 1415,
       "bid_c": 29,
       "bid_size": 62,
       "event_ticker": "KXUEFANLGAME-26SEP27LTUAZE",
       "flags": [
        "WIDE"
       ],
       "spread_c": 4,
       "ticker": "KXUEFANLGAME-26SEP27LTUAZE-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Lithuania vs Azerbaijan"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Sun, September 27th at 9:00 AM EDT",
    "teams": {
     "away": {
      "espn_id": "581",
      "form": {
       "available": true,
       "friendlies": 5,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-03-27T15:00Z",
         "event_id": "401861921",
         "ga": 1,
         "gf": 6,
         "kind": "friendly",
         "letter": "W",
         "opponent": "St. Lucia",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-30T15:00Z",
         "event_id": "401866531",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Sierra Leone",
         "provider_agrees": false,
         "provider_letter": "W",
         "shootout": {
          "against": 1,
          "for": 2,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         },
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-05T18:00Z",
         "event_id": "401871785",
         "ga": 2,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Malta",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-09T18:00Z",
         "event_id": "401871580",
         "ga": 1,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "San Marino",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-09-23T16:00Z",
         "event_id": "401898013",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Tajikistan",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "WDLWW",
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "azerbaijan",
      "name": "Azerbaijan",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6447324219351562,
         "interval": [
          -1.3143303488197162,
          -0.02486550494940387
         ],
         "rank": 50,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.6695979268845601
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3391368406616741,
         "interval": [
          -0.5586560046774935,
          0.11961767664585471
         ],
         "rank": 48,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.2195191640158194
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 50.919205997213275,
         "interval": [
          1366.989223728553,
          1468.8276357229797
         ],
         "rank": 43,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "unit": "elo",
         "value": 1417.9084297257664
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "460",
      "form": {
       "available": true,
       "friendlies": 3,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-10-12T18:45Z",
         "event_id": "724858",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Poland",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-13T17:00Z",
         "event_id": "755121",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Israel",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - UEFA",
         "date": "2025-11-17T19:45Z",
         "event_id": "724912",
         "ga": 4,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Netherlands",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-26T15:00Z",
         "event_id": "401851163",
         "ga": 0,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Moldova",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-29T13:00Z",
         "event_id": "763033",
         "ga": 2,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Georgia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        }
       ],
       "letters": "LDLWL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "lithuania",
      "name": "Lithuania",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4905172225027586,
         "interval": [
          -0.8335100274868288,
          0.14752441751868844
         ],
         "rank": 46,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "unit": "log_goals",
         "value": -0.34299280498407014
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.33449096479329327,
         "interval": [
          -0.21834621638359278,
          0.4506357132029938
         ],
         "rank": 39,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": 0.11614474840970049
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 18.904289528697067,
         "interval": [
          1304.4860013973528,
          1342.294580454747
         ],
         "rank": 50,
         "straddles": false,
         "tier": 4,
         "tier_set": [
          4
         ],
         "unit": "elo",
         "value": 1323.3902909260498
        }
       },
       "axes_absent": [],
       "competition": "unl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Lithuania"
   },
   "opponent": "Lithuania",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 43,
    "opp": 50
   },
   "rated_in": {
    "away": "unl",
    "home": "unl"
   },
   "rates": {
    "ga": [
     null,
     0
    ],
    "gdg": [
     null,
     2
    ],
    "gf": [
     null,
     2
    ],
    "ppg": [
     null,
     3
    ]
   },
   "refused": false,
   "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Azerbaijan": "espn_id",
    "Lithuania": "espn_id"
   },
   "shape": "HOLLOW",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": -1,
    "def": -1,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     4,
     3
    ],
    "def": [
     4,
     3
    ],
    "ovr": [
     3,
     4
    ]
   },
   "venue": {
    "city": "Kaunas",
    "country": "Lithuania",
    "name": "S. Darius and S. Gireno Stadium"
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
   "weights": null
  },
  {
   "away": "Nicaragua",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "competition_id": "401900637",
   "cross_league": false,
   "current_only": null,
   "espn": "concacaf.nations.league",
   "event_id": "401900637",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Nicaragua",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.31177945672676244,
       "interval": [
        -0.29202354267958996,
        0.3315353707739349
       ],
       "rank": 7,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.019755914047172474
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.3237226825292346,
       "interval": [
        -0.47098372680160727,
        0.1764616382568619
       ],
       "rank": 11,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": -0.1472610442723727
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.42929433394837696,
       "interval": [
        -0.572330581596761,
        0.2862580862999929
       ],
       "rank": 6,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": -0.14303624764838407
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.6082841330787719,
       "interval": [
        -1.031420825845823,
        0.18514744031172092
       ],
       "rank": 13,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.423136692767051
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 28.04371263951985,
       "interval": [
        1446.3658843209873,
        1502.4533096000268
       ],
       "rank": 11,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1474.409596960507
      },
      "field_size": 37,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 21.094833608511905,
       "interval": [
        1417.5723271779498,
        1459.7619943949735
       ],
       "rank": 13,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1438.6671607864616
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Nicaragua",
     "opp": "Dominican Republic"
    },
    "competition": "cnl",
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 37
   },
   "form": {
    "fav": "WLLDL",
    "opp": "WDDDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Dominican Republic",
   "in_play": false,
   "kalshi": {
    "ask_c": 19,
    "ask_size": 24584,
    "bid_c": 17,
    "bid_size": 3480,
    "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-NIC"
   },
   "kickoff": "2026-09-25T00:00Z",
   "league": "cnl",
   "national": {
    "competition": "cnl",
    "group": "League A - Group A",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Dominican Republic",
       "away_score": 3,
       "completed": true,
       "date": "2017-11-09T00:30:00Z",
       "event_id": "498510",
       "home": "Nicaragua",
       "home_score": 0,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Nicaragua",
       "away_score": 0,
       "completed": true,
       "date": "2017-11-11T20:00:00Z",
       "event_id": "498534",
       "home": "Dominican Republic",
       "home_score": 1,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Nicaragua",
       "away_score": 2,
       "completed": true,
       "date": "2023-09-08T23:00:00Z",
       "event_id": "680806",
       "home": "Dominican Republic",
       "home_score": 0,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Dominican Republic",
       "away_score": 0,
       "completed": true,
       "date": "2023-11-22T02:00:00Z",
       "event_id": "680856",
       "home": "Nicaragua",
       "home_score": 0,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 1,
      "draw": 1,
      "home": 2
     }
    },
    "leg": null,
    "lineups": {
     "announced": true,
     "reason": null,
     "sides": {
      "away": {
       "announced": true,
       "bench": 10,
       "formation": "5-4-1",
       "starters": [
        {
         "jersey": "23",
         "name": "Jason Vega",
         "position": "G"
        },
        {
         "jersey": "2",
         "name": "Joab Gutiérrez",
         "position": "D"
        },
        {
         "jersey": "6",
         "name": "Emmanuel Gómez",
         "position": "D"
        },
        {
         "jersey": "19",
         "name": "Juan Rodriguez",
         "position": "D"
        },
        {
         "jersey": "5",
         "name": "Justing Cano",
         "position": "D"
        },
        {
         "jersey": "4",
         "name": "Marvin David Fletes",
         "position": "D"
        },
        {
         "jersey": "14",
         "name": "Kadeem Cole",
         "position": "M"
        },
        {
         "jersey": "16",
         "name": "Raheem Giusseppe Cole Martinez",
         "position": "M"
        },
        {
         "jersey": "20",
         "name": "Jonathan Moncada",
         "position": "M"
        },
        {
         "jersey": "11",
         "name": "Efraín Antonio Mejía Alfaro",
         "position": "M"
        },
        {
         "jersey": "9",
         "name": "Jaime Moreno",
         "position": "F"
        }
       ],
       "team": "Nicaragua"
      },
      "home": {
       "announced": true,
       "bench": 11,
       "formation": "4-3-3",
       "starters": [
        {
         "jersey": "1",
         "name": "Xavier Valdez",
         "position": "G"
        },
        {
         "jersey": "5",
         "name": "Noah Dollenmayer",
         "position": "D"
        },
        {
         "jersey": "3",
         "name": "Junior Firpo",
         "position": "D"
        },
        {
         "jersey": "21",
         "name": "Juan Castillo",
         "position": "D"
        },
        {
         "jersey": "23",
         "name": "Luiyi de Lucas",
         "position": "D"
        },
        {
         "jersey": "14",
         "name": "Jean Carlos López",
         "position": "M"
        },
        {
         "jersey": "6",
         "name": "Pablo Rosario",
         "position": "M"
        },
        {
         "jersey": "8",
         "name": "Heinz Mörschel",
         "position": "M"
        },
        {
         "jersey": "19",
         "name": "Peter Federico",
         "position": "F"
        },
        {
         "jersey": "9",
         "name": "Mariano Díaz",
         "position": "F"
        },
        {
         "jersey": "11",
         "name": "Edarlyn Reyes",
         "position": "F"
        }
       ],
       "team": "Dominican Republic"
      }
     }
    },
    "market": {
     "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
     "legs": {
      "away": {
       "ask_c": 19,
       "ask_size": 24584,
       "bid_c": 17,
       "bid_size": 3480,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
       "flags": [],
       "name": "Nicaragua",
       "spread_c": 2,
       "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-NIC"
      },
      "home": {
       "ask_c": 62,
       "ask_size": 43212,
       "bid_c": 61,
       "bid_size": 3656,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
       "flags": [],
       "name": "Dominican Republic",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-DOM"
      },
      "tie": {
       "ask_c": 22,
       "ask_size": 7052,
       "bid_c": 21,
       "bid_size": 348,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24DOMNIC-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Dominican Republic vs Nicaragua"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Thu, September 24th at 8:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "2658",
      "form": {
       "available": true,
       "friendlies": 3,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "date": "2025-11-14T02:00Z",
         "event_id": "754261",
         "ga": 0,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Honduras",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "date": "2025-11-19T01:00Z",
         "event_id": "754268",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Haiti",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T16:30Z",
         "event_id": "401862882",
         "ga": 3,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Russia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-05-29T16:00Z",
         "event_id": "401871131",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "South Africa",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-05T22:45Z",
         "event_id": "401871132",
         "ga": 4,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Paraguay",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WLLDL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "nicaragua",
      "name": "Nicaragua",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.31177945672676244,
         "interval": [
          -0.29202354267958996,
          0.3315353707739349
         ],
         "rank": 7,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.019755914047172474
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.42929433394837696,
         "interval": [
          -0.572330581596761,
          0.2862580862999929
         ],
         "rank": 6,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": -0.14303624764838407
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 28.04371263951985,
         "interval": [
          1446.3658843209873,
          1502.4533096000268
         ],
         "rank": 11,
         "straddles": false,
         "tier": 2,
         "tier_set": [
          2
         ],
         "unit": "elo",
         "value": 1474.409596960507
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "2649",
      "form": {
       "available": true,
       "friendlies": 5,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-11-13T00:00Z",
         "event_id": "760870",
         "ga": 0,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "St. Vincent and the Grenadines",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-18T23:30Z",
         "event_id": "760901",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Martinique",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T00:00Z",
         "event_id": "401866383",
         "ga": 2,
         "gf": 2,
         "kind": "friendly",
         "letter": "D",
         "opponent": "El Salvador",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-29T22:00Z",
         "event_id": "401866390",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Cuba",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-04T00:45Z",
         "event_id": "401870075",
         "ga": 4,
         "gf": 2,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Panama",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WDDDL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "dominican-republic",
      "name": "Dominican Republic",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3237226825292346,
         "interval": [
          -0.47098372680160727,
          0.1764616382568619
         ],
         "rank": 11,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": -0.1472610442723727
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6082841330787719,
         "interval": [
          -1.031420825845823,
          0.18514744031172092
         ],
         "rank": 13,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.423136692767051
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 21.094833608511905,
         "interval": [
          1417.5723271779498,
          1459.7619943949735
         ],
         "rank": 13,
         "straddles": false,
         "tier": 2,
         "tier_set": [
          2
         ],
         "unit": "elo",
         "value": 1438.6671607864616
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Dominican Republic"
   },
   "opponent": "Dominican Republic",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 11,
    "opp": 13
   },
   "rated_in": {
    "away": "cnl",
    "home": "cnl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Dominican Republic": "espn_id",
    "Nicaragua": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
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
     2,
     2
    ]
   },
   "venue": {
    "city": "Santiago",
    "country": "Dominican Republic",
    "name": "Estadio Cibao"
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
   "weights": null
  },
  {
   "away": "Dominica",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "competition_id": "401900634",
   "cross_league": false,
   "current_only": null,
   "espn": "concacaf.nations.league",
   "event_id": "401900634",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Dominica",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.5499455258791347,
       "interval": [
        -1.5595855599693023,
        -0.45969450821103275
       ],
       "rank": 31,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": -1.0096400340901674
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.461207121166634,
       "interval": [
        -1.662894480430495,
        -0.7404802380972271
       ],
       "rank": 32,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -1.201687359263861
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.6041293299056487,
       "interval": [
        -1.6738273787072782,
        -0.4655687188959807
       ],
       "rank": 26,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": -1.0696980488016294
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4768584372866395,
       "interval": [
        -1.9768753307054292,
        -1.02315845613215
       ],
       "rank": 33,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -1.5000168934187896
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 16.785353018465205,
       "interval": [
        1196.4707323149403,
        1230.0414383518707
       ],
       "rank": 28,
       "straddles": false,
       "tier": 4,
       "tier_set": [
        4
       ],
       "value": 1213.2560853334055
      },
      "field_size": 37,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 44.870161413015694,
       "interval": [
        1061.8212756857588,
        1151.5615985117902
       ],
       "rank": 31,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        4,
        5
       ],
       "value": 1106.6914370987745
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Dominica",
     "opp": "Cayman Islands"
    },
    "competition": "cnl",
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 37
   },
   "form": {
    "fav": "LLLDW",
    "opp": "LWDWL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Cayman Islands",
   "in_play": false,
   "kalshi": {
    "ask_c": 62,
    "ask_size": 1557,
    "bid_c": 61,
    "bid_size": 1460,
    "event_ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA-DMA"
   },
   "kickoff": "2026-09-25T00:10Z",
   "league": "cnl",
   "national": {
    "competition": "cnl",
    "group": "League B - Group A",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": true,
     "reason": null,
     "sides": {
      "away": {
       "announced": true,
       "bench": 8,
       "formation": "5-4-1",
       "starters": [
        {
         "jersey": "1",
         "name": "Donte Newton",
         "position": "G"
        },
        {
         "jersey": "2",
         "name": "Tobi Jnohope",
         "position": "CD"
        },
        {
         "jersey": "13",
         "name": "Marcus Bredas",
         "position": "CD-L"
        },
        {
         "jersey": "4",
         "name": "Eustace Marshall",
         "position": "CD-R"
        },
        {
         "jersey": "16",
         "name": "Triston Sandy",
         "position": "LB"
        },
        {
         "jersey": "14",
         "name": "Reon Cuffy",
         "position": "RB"
        },
        {
         "jersey": "19",
         "name": "Briel Thomas",
         "position": "CM-L"
        },
        {
         "jersey": "9",
         "name": "Javid George",
         "position": "CM-R"
        },
        {
         "jersey": "23",
         "name": "Audel Laville",
         "position": "LM"
        },
        {
         "jersey": "20",
         "name": "Lyan Edwards",
         "position": "RM"
        },
        {
         "jersey": "10",
         "name": "Troy Jules",
         "position": "F"
        }
       ],
       "team": "Dominica"
      },
      "home": {
       "announced": true,
       "bench": 9,
       "formation": "5-4-1",
       "starters": [
        {
         "jersey": "1",
         "name": "Lachlin Lambert",
         "position": "G"
        },
        {
         "jersey": "5",
         "name": "Cameron Gray",
         "position": "CD"
        },
        {
         "jersey": "14",
         "name": "Joshwa Campbell",
         "position": "CD-L"
        },
        {
         "jersey": "3",
         "name": "D'Andre Rowe",
         "position": "CD-R"
        },
        {
         "jersey": "19",
         "name": "Gunnar Studenthofft",
         "position": "LB"
        },
        {
         "jersey": "23",
         "name": "Jabari Campbell",
         "position": "RB"
        },
        {
         "jersey": "8",
         "name": "Jordan Bonilla",
         "position": "CM-L"
        },
        {
         "jersey": "10",
         "name": "Zachary Scott",
         "position": "CM-R"
        },
        {
         "jersey": "7",
         "name": "Elijah Seymour",
         "position": "LM"
        },
        {
         "jersey": "17",
         "name": "Sebastian Martinez",
         "position": "RM"
        },
        {
         "jersey": "9",
         "name": "Christopher Reeves",
         "position": "F"
        }
       ],
       "team": "Cayman Islands"
      }
     }
    },
    "market": {
     "event_ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA",
     "legs": {
      "away": {
       "ask_c": 62,
       "ask_size": 1557,
       "bid_c": 61,
       "bid_size": 1460,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA",
       "flags": [],
       "name": "Dominica",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA-DMA"
      },
      "home": {
       "ask_c": 20,
       "ask_size": 7524,
       "bid_c": 19,
       "bid_size": 24,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA",
       "flags": [],
       "name": "Cayman Islands",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA-CAY"
      },
      "tie": {
       "ask_c": 21,
       "ask_size": 603,
       "bid_c": 20,
       "bid_size": 342,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24CAYDMA-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Cayman Islands vs Dominica"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Thu, September 24th at 8:10 PM EDT",
    "teams": {
     "away": {
      "espn_id": "13582",
      "form": {
       "available": true,
       "friendlies": 5,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-11-12T20:00Z",
         "event_id": "761045",
         "ga": 2,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "St. Martin",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-15T20:00Z",
         "event_id": "761282",
         "ga": 3,
         "gf": 2,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Sint Maarten",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T19:00Z",
         "event_id": "401866385",
         "ga": 2,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Guyana",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-30T23:30Z",
         "event_id": "401866394",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Sint Maarten",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-09-21T15:00Z",
         "event_id": "401922037",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Anguilla",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "LLLDW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "dominica",
      "name": "Dominica",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5499455258791347,
         "interval": [
          -1.5595855599693023,
          -0.45969450821103275
         ],
         "rank": 31,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -1.0096400340901674
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6041293299056487,
         "interval": [
          -1.6738273787072782,
          -0.4655687188959807
         ],
         "rank": 26,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -1.0696980488016294
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 16.785353018465205,
         "interval": [
          1196.4707323149403,
          1230.0414383518707
         ],
         "rank": 28,
         "straddles": false,
         "tier": 4,
         "tier_set": [
          4
         ],
         "unit": "elo",
         "value": 1213.2560853334055
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "2646",
      "form": {
       "available": true,
       "friendlies": 5,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-11-13T00:00Z",
         "event_id": "760874",
         "ga": 2,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "British Virgin Islands",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-16T00:00Z",
         "event_id": "760890",
         "ga": 0,
         "gf": 4,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Anguilla",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T00:00Z",
         "event_id": "401866382",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "British Virgin Islands",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-30T00:00Z",
         "event_id": "401866391",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Bahamas",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-06T17:00Z",
         "event_id": "401872613",
         "ga": 4,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Gibraltar",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "LWDWL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "cayman-islands",
      "name": "Cayman Islands",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.461207121166634,
         "interval": [
          -1.662894480430495,
          -0.7404802380972271
         ],
         "rank": 32,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -1.201687359263861
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4768584372866395,
         "interval": [
          -1.9768753307054292,
          -1.02315845613215
         ],
         "rank": 33,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -1.5000168934187896
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 44.870161413015694,
         "interval": [
          1061.8212756857588,
          1151.5615985117902
         ],
         "rank": 31,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          4,
          5
         ],
         "unit": "elo",
         "value": 1106.6914370987745
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Dominica"
   },
   "opponent": "Cayman Islands",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 28,
    "opp": 31
   },
   "rated_in": {
    "away": "cnl",
    "home": "cnl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Cayman Islands": "espn_id",
    "Dominica": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
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
     4,
     4
    ],
    "def": [
     4,
     5
    ],
    "ovr": [
     4,
     4
    ]
   },
   "venue": {
    "city": "Roseau",
    "country": "Dominica",
    "name": "Windsor Park, Roseau"
   },
   "venue_class": {
    "class": "OPPONENT_COUNTRY",
    "home_side": "away"
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": "away",
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "OPPONENT_COUNTRY"
   },
   "weights": null
  },
  {
   "away": "Trinidad and Tobago",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "competition_id": "401900636",
   "cross_league": false,
   "current_only": null,
   "espn": "concacaf.nations.league",
   "event_id": "401900636",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Haiti",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.46666958637005956,
       "interval": [
        -0.20842294274262974,
        0.7249162299974894
       ],
       "rank": 3,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.25824664362742983
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4291288965557644,
       "interval": [
        -0.41623400869337646,
        0.4420237844181524
       ],
       "rank": 8,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.01289488786238796
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.32699952636265206,
       "interval": [
        -0.7345878310878842,
        -0.08058877836258
       ],
       "rank": 12,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.40758830472523205
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.5801432800911851,
       "interval": [
        -0.8103134663006748,
        0.34997309388169534
       ],
       "rank": 7,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.23017018620948976
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 52.049410206531604,
       "interval": [
        1550.0310658124388,
        1654.1298862255019
       ],
       "rank": 3,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 1602.0804760189703
      },
      "field_size": 37,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 35.39466819959713,
       "interval": [
        1474.0498632900346,
        1544.839199689229
       ],
       "rank": 7,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1509.4445314896318
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Haiti",
     "opp": "Trinidad and Tobago"
    },
    "competition": "cnl",
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "HOLLOW",
    "size": 37
   },
   "form": {
    "fav": "WLLLL",
    "opp": "LDLLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Haiti",
   "in_play": false,
   "kalshi": {
    "ask_c": 65,
    "ask_size": 43873,
    "bid_c": 64,
    "bid_size": 9970,
    "event_ticker": "KXCONCACAFNLGAME-26SEP24HTITTO",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXCONCACAFNLGAME-26SEP24HTITTO-HTI"
   },
   "kickoff": "2026-09-25T00:20Z",
   "league": "cnl",
   "national": {
    "competition": "cnl",
    "group": "League A - Group A",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Haiti",
       "away_score": 0,
       "completed": false,
       "date": "2007-05-28T07:00:00Z",
       "event_id": "221257",
       "home": "Trinidad and Tobago",
       "home_score": 0
      },
      {
       "away": "Haiti",
       "away_score": 2,
       "completed": true,
       "date": "2013-07-12T23:00:00Z",
       "event_id": "370661",
       "home": "Trinidad and Tobago",
       "home_score": 0,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Haiti",
       "away_score": 1,
       "completed": true,
       "date": "2016-01-08T22:30:00Z",
       "event_id": "439858",
       "home": "Trinidad and Tobago",
       "home_score": 0,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Haiti",
       "away_score": 1,
       "completed": true,
       "date": "2025-06-19T22:45:00Z",
       "event_id": "735328",
       "home": "Trinidad and Tobago",
       "home_score": 1,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 0,
      "draw": 1,
      "home": 2
     }
    },
    "leg": null,
    "lineups": {
     "announced": true,
     "reason": null,
     "sides": {
      "away": {
       "announced": true,
       "bench": 10,
       "formation": "4-2-3-1",
       "starters": [
        {
         "jersey": "22",
         "name": "Denzil Smith",
         "position": "G"
        },
        {
         "jersey": "17",
         "name": "Justin Garcia",
         "position": "CD-L"
        },
        {
         "jersey": "5",
         "name": "Josiah Trimmingham",
         "position": "CD-R"
        },
        {
         "jersey": "23",
         "name": "Noah Powder",
         "position": "LB"
        },
        {
         "jersey": "19",
         "name": "Rio Cardines",
         "position": "RB"
        },
        {
         "jersey": "8",
         "name": "Daniel Phillips",
         "position": "AM"
        },
        {
         "jersey": "18",
         "name": "Andre Rampersad",
         "position": "LM"
        },
        {
         "jersey": "14",
         "name": "Wayne Frederick",
         "position": "RM"
        },
        {
         "jersey": "11",
         "name": "Levi García",
         "position": "F"
        },
        {
         "jersey": "16",
         "name": "Tyrese Spicer",
         "position": "AM-L"
        },
        {
         "jersey": "7",
         "name": "Ryan Telfer",
         "position": "AM-R"
        }
       ],
       "team": "Trinidad and Tobago"
      },
      "home": {
       "announced": true,
       "bench": 11,
       "formation": "4-4-2",
       "starters": [
        {
         "jersey": "1",
         "name": "Alexandre Pierre",
         "position": "G"
        },
        {
         "jersey": "5",
         "name": "Hannes Delcroix",
         "position": "CD-L"
        },
        {
         "jersey": "4",
         "name": "Garven Metusala",
         "position": "CD-R"
        },
        {
         "jersey": "8",
         "name": "Martin Expérience",
         "position": "LB"
        },
        {
         "jersey": "2",
         "name": "Carlens Arcus",
         "position": "RB"
        },
        {
         "jersey": "6",
         "name": "Carl Sainté",
         "position": "CM-L"
        },
        {
         "jersey": "17",
         "name": "Danley Jean Jacques",
         "position": "CM-R"
        },
        {
         "jersey": "7",
         "name": "Fafà Picault",
         "position": "LM"
        },
        {
         "jersey": "11",
         "name": "Louicius Deedson",
         "position": "RM"
        },
        {
         "jersey": "18",
         "name": "Wilson Isidor",
         "position": "CF-L"
        },
        {
         "jersey": "21",
         "name": "Dany Jean",
         "position": "CF-R"
        }
       ],
       "team": "Haiti"
      }
     }
    },
    "market": {
     "event_ticker": "KXCONCACAFNLGAME-26SEP24HTITTO",
     "legs": {
      "away": {
       "ask_c": 15,
       "ask_size": 9942,
       "bid_c": 14,
       "bid_size": 2623,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24HTITTO",
       "flags": [],
       "name": "Trinidad and Tobago",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24HTITTO-TTO"
      },
      "home": {
       "ask_c": 65,
       "ask_size": 43873,
       "bid_c": 64,
       "bid_size": 9970,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24HTITTO",
       "flags": [],
       "name": "Haiti",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24HTITTO-HTI"
      },
      "tie": {
       "ask_c": 21,
       "ask_size": 1218,
       "bid_c": 20,
       "bid_size": 799,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24HTITTO",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24HTITTO-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Haiti vs Trinidad and Tobago"
    },
    "neutral": true,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Thu, September 24th at 8:20 PM EDT",
    "teams": {
     "away": {
      "espn_id": "2627",
      "form": {
       "available": true,
       "friendlies": 5,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-03-27T10:00Z",
         "event_id": "401861039",
         "ga": 4,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Venezuela",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-30T10:00Z",
         "event_id": "401866485",
         "ga": 2,
         "gf": 2,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Gabon",
         "provider_agrees": false,
         "provider_letter": "L",
         "shootout": {
          "against": 3,
          "for": 2,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         },
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-05-31T01:00Z",
         "event_id": "401872679",
         "ga": 5,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "South Korea",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-09T17:00Z",
         "event_id": "401870855",
         "ga": 3,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Russia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Club Friendly",
         "date": "2026-07-26T00:00Z",
         "event_id": "401898835",
         "ga": 1,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Louisville City FC",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "LDLLL",
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "trinidad-and-tobago",
      "name": "Trinidad and Tobago",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4291288965557644,
         "interval": [
          -0.41623400869337646,
          0.4420237844181524
         ],
         "rank": 8,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.01289488786238796
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5801432800911851,
         "interval": [
          -0.8103134663006748,
          0.34997309388169534
         ],
         "rank": 7,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.23017018620948976
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 35.39466819959713,
         "interval": [
          1474.0498632900346,
          1544.839199689229
         ],
         "rank": 7,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "elo",
         "value": 1509.4445314896318
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "2654",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-06-03T00:36Z",
         "event_id": "401871830",
         "ga": 0,
         "gf": 4,
         "kind": "friendly",
         "letter": "W",
         "opponent": "New Zealand",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-06T00:00Z",
         "event_id": "401871781",
         "ga": 2,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Peru",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-14T01:00Z",
         "event_id": "760418",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Scotland",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-20T00:30Z",
         "event_id": "760444",
         "ga": 3,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Brazil",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-24T22:00Z",
         "event_id": "760464",
         "ga": 4,
         "gf": 2,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Morocco",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WLLLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "haiti",
      "name": "Haiti",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.46666958637005956,
         "interval": [
          -0.20842294274262974,
          0.7249162299974894
         ],
         "rank": 3,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.25824664362742983
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.32699952636265206,
         "interval": [
          -0.7345878310878842,
          -0.08058877836258
         ],
         "rank": 12,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.40758830472523205
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 52.049410206531604,
         "interval": [
          1550.0310658124388,
          1654.1298862255019
         ],
         "rank": 3,
         "straddles": false,
         "tier": 1,
         "tier_set": [
          1
         ],
         "unit": "elo",
         "value": 1602.0804760189703
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Jamaica"
   },
   "opponent": "Trinidad and Tobago",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 3,
    "opp": 7
   },
   "rated_in": {
    "away": "cnl",
    "home": "cnl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Haiti": "espn_id",
    "Trinidad and Tobago": "espn_id"
   },
   "shape": "HOLLOW",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 0,
    "def": 0,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     1,
     1
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
    "city": "Sabina Park",
    "country": "Jamaica",
    "name": "Sabina Park"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": null,
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "NEUTRAL"
   },
   "weights": null
  },
  {
   "away": "Curaçao",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "competition_id": "401900638",
   "cross_league": false,
   "current_only": null,
   "espn": "concacaf.nations.league",
   "event_id": "401900638",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Costa Rica",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.4461433431937113,
       "interval": [
        -0.15306404644142774,
        0.7392226399459949
       ],
       "rank": 1,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.29307929675228356
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.6849875773528515,
       "interval": [
        -0.9181009332593223,
        0.4518742214463808
       ],
       "rank": 13,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.23311335590647075
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.6284492965856469,
       "interval": [
        -0.41898822984882167,
        0.837910363322472
       ],
       "rank": 2,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.20946106673682519
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.3432319185392931,
       "interval": [
        -0.6605096019496686,
        0.02595423512891759
       ],
       "rank": 9,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.3172776834103755
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 41.14166983924553,
       "interval": [
        1638.297990298461,
        1720.5813299769518
       ],
       "rank": 1,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 1679.4396601377064
      },
      "field_size": 37,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 48.31226303904964,
       "interval": [
        1449.3978120625122,
        1546.0223381406115
       ],
       "rank": 8,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": 1497.7100751015619
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Costa Rica",
     "opp": "Curaçao"
    },
    "competition": "cnl",
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "CLEAN",
    "size": 37
   },
   "form": {
    "fav": "DDLLL",
    "opp": "LWLDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Costa Rica",
   "in_play": false,
   "kalshi": {
    "ask_c": 60,
    "ask_size": 355,
    "bid_c": 59,
    "bid_size": 2917,
    "event_ticker": "KXCONCACAFNLGAME-26SEP24CRICUW",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXCONCACAFNLGAME-26SEP24CRICUW-CRI"
   },
   "kickoff": "2026-09-25T02:00Z",
   "league": "cnl",
   "national": {
    "competition": "cnl",
    "group": "League A - Group A",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Curaçao",
       "away_score": 0,
       "completed": true,
       "date": "2019-10-14T00:00:00Z",
       "event_id": "540352",
       "home": "Costa Rica",
       "home_score": 0,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Costa Rica",
       "away_score": 2,
       "completed": true,
       "date": "2019-11-14T23:30:00Z",
       "event_id": "540347",
       "home": "Curaçao",
       "home_score": 1,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 0,
      "draw": 1,
      "home": 1
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Curaçao"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Costa Rica"
      }
     }
    },
    "market": {
     "event_ticker": "KXCONCACAFNLGAME-26SEP24CRICUW",
     "legs": {
      "away": {
       "ask_c": 17,
       "ask_size": 9,
       "bid_c": 16,
       "bid_size": 4386,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24CRICUW",
       "flags": [
        "THIN"
       ],
       "name": "Curacao",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24CRICUW-CUW"
      },
      "home": {
       "ask_c": 60,
       "ask_size": 355,
       "bid_c": 59,
       "bid_size": 2917,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24CRICUW",
       "flags": [],
       "name": "Costa Rica",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24CRICUW-CRI"
      },
      "tie": {
       "ask_c": 26,
       "ask_size": 6393,
       "bid_c": 25,
       "bid_size": 200,
       "event_ticker": "KXCONCACAFNLGAME-26SEP24CRICUW",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP24CRICUW-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Costa Rica vs Curacao"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Thu, September 24th at 10:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "11678",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-05-30T12:00Z",
         "event_id": "401856621",
         "ga": 4,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Scotland",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-07T00:00Z",
         "event_id": "401873741",
         "ga": 0,
         "gf": 4,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Aruba",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-14T17:00Z",
         "event_id": "760422",
         "ga": 7,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Germany",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-21T00:00Z",
         "event_id": "760446",
         "ga": 0,
         "gf": 0,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Ecuador",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-25T20:00Z",
         "event_id": "760473",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Ivory Coast",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        }
       ],
       "letters": "LWLDL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "curacao",
      "name": "Curaçao",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6849875773528515,
         "interval": [
          -0.9181009332593223,
          0.4518742214463808
         ],
         "rank": 13,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.23311335590647075
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3432319185392931,
         "interval": [
          -0.6605096019496686,
          0.02595423512891759
         ],
         "rank": 9,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.3172776834103755
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 48.31226303904964,
         "interval": [
          1449.3978120625122,
          1546.0223381406115
         ],
         "rank": 8,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "elo",
         "value": 1497.7100751015619
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "214",
      "form": {
       "available": true,
       "friendlies": 4,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "date": "2025-11-19T01:00Z",
         "event_id": "754270",
         "ga": 0,
         "gf": 0,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Honduras",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T17:30Z",
         "event_id": "401862038",
         "ga": 2,
         "gf": 2,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Jordan",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-31T13:00Z",
         "event_id": "401861778",
         "ga": 5,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Iran",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-01T23:00Z",
         "event_id": "401866134",
         "ga": 3,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Colombia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-10T21:00Z",
         "event_id": "401860829",
         "ga": 3,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "England",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "DDLLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "costa-rica",
      "name": "Costa Rica",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4461433431937113,
         "interval": [
          -0.15306404644142774,
          0.7392226399459949
         ],
         "rank": 1,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.29307929675228356
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6284492965856469,
         "interval": [
          -0.41898822984882167,
          0.837910363322472
         ],
         "rank": 2,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.20946106673682519
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 41.14166983924553,
         "interval": [
          1638.297990298461,
          1720.5813299769518
         ],
         "rank": 1,
         "straddles": false,
         "tier": 1,
         "tier_set": [
          1
         ],
         "unit": "elo",
         "value": 1679.4396601377064
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Costa Rica"
   },
   "opponent": "Curaçao",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 1,
    "opp": 8
   },
   "rated_in": {
    "away": "cnl",
    "home": "cnl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Costa Rica": "espn_id",
    "Curaçao": "espn_id"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 1,
    "ovr": 1
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
     2
    ]
   },
   "venue": {
    "city": "Estadio Nacional de Costa Rica",
    "country": "Costa Rica",
    "name": "Estadio Ricardo Saprissa"
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
   "weights": null
  },
  {
   "away": "Guadeloupe",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "competition_id": "401900630",
   "cross_league": false,
   "current_only": null,
   "espn": "concacaf.nations.league",
   "event_id": "401900630",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Guadeloupe",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.49228078000243763,
       "interval": [
        -0.6492424090794187,
        0.33531915092545655
       ],
       "rank": 12,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.15696162907698108
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4669319593985057,
       "interval": [
        -1.228240970428486,
        -0.2943770516314747
       ],
       "rank": 25,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": -0.7613090110299804
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.5711320836559003,
       "interval": [
        -0.945134682337066,
        0.1971294849747346
       ],
       "rank": 11,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.3740025986811657
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.5366161896275132,
       "interval": [
        -1.4620361523160255,
        -0.3888037730609991
       ],
       "rank": 20,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3,
        4
       ],
       "value": -0.9254199626885123
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 24.99565828375502,
       "interval": [
        1456.701518459375,
        1506.6928350268852
       ],
       "rank": 9,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1481.69717674313
      },
      "field_size": 37,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 21.98657824906775,
       "interval": [
        1272.9885624547826,
        1316.9617189529183
       ],
       "rank": 24,
       "straddles": false,
       "tier": 3,
       "tier_set": [
        3
       ],
       "value": 1294.9751407038505
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Guadeloupe",
     "opp": "Bermuda"
    },
    "competition": "cnl",
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "CLEAN",
    "size": 37
   },
   "form": {
    "fav": "WWLLL",
    "opp": "LLLDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Bermuda",
   "in_play": false,
   "kalshi": {
    "ask_c": 33,
    "ask_size": 1239,
    "bid_c": 32,
    "bid_size": 943,
    "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-GLP"
   },
   "kickoff": "2026-09-25T19:00Z",
   "league": "cnl",
   "national": {
    "competition": "cnl",
    "group": "League B - Group B",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Guadeloupe"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Bermuda"
      }
     }
    },
    "market": {
     "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
     "legs": {
      "away": {
       "ask_c": 33,
       "ask_size": 1239,
       "bid_c": 32,
       "bid_size": 943,
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
       "flags": [],
       "name": "Guadeloupe",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-GLP"
      },
      "home": {
       "ask_c": 39,
       "ask_size": 434,
       "bid_c": 38,
       "bid_size": 2211,
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
       "flags": [],
       "name": "Bermuda",
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-BMU"
      },
      "tie": {
       "ask_c": 30,
       "ask_size": 770,
       "bid_c": 29,
       "bid_size": 577,
       "event_ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXCONCACAFNLGAME-26SEP25BMUGLP-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Bermuda vs Guadeloupe"
    },
    "neutral": true,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 3:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "7657",
      "form": {
       "available": true,
       "friendlies": 0,
       "games": [
        {
         "competition": "Concacaf Gold Cup Qualifying",
         "date": "2025-03-22T00:00Z",
         "event_id": "734182",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Nicaragua",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "Concacaf Gold Cup Qualifying",
         "date": "2025-03-26T00:30Z",
         "event_id": "734188",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Nicaragua",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "Concacaf Gold Cup",
         "date": "2025-06-16T23:00Z",
         "event_id": "735322",
         "ga": 5,
         "gf": 2,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Panama",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Concacaf Gold Cup",
         "date": "2025-06-20T23:45Z",
         "event_id": "735330",
         "ga": 2,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Jamaica",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Concacaf Gold Cup",
         "date": "2025-06-24T23:00Z",
         "event_id": "735339",
         "ga": 3,
         "gf": 2,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Guatemala",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        }
       ],
       "letters": "WWLLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "guadeloupe",
      "name": "Guadeloupe",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.49228078000243763,
         "interval": [
          -0.6492424090794187,
          0.33531915092545655
         ],
         "rank": 12,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.15696162907698108
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5711320836559003,
         "interval": [
          -0.945134682337066,
          0.1971294849747346
         ],
         "rank": 11,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.3740025986811657
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 24.99565828375502,
         "interval": [
          1456.701518459375,
          1506.6928350268852
         ],
         "rank": 9,
         "straddles": false,
         "tier": 2,
         "tier_set": [
          2
         ],
         "unit": "elo",
         "value": 1481.69717674313
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "2643",
      "form": {
       "available": true,
       "friendlies": 1,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "date": "2025-10-10T22:00Z",
         "event_id": "754250",
         "ga": 3,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Trinidad and Tobago",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "date": "2025-10-15T00:00Z",
         "event_id": "754258",
         "ga": 4,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Jamaica",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "date": "2025-11-14T00:00Z",
         "event_id": "754265",
         "ga": 7,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Curaçao",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - Concacaf",
         "date": "2025-11-19T01:00Z",
         "event_id": "754271",
         "ga": 2,
         "gf": 2,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Trinidad and Tobago",
         "provider_agrees": false,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-25T22:00Z",
         "event_id": "401866396",
         "ga": 2,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Congo DR",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "LLLDL",
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "bermuda",
      "name": "Bermuda",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4669319593985057,
         "interval": [
          -1.228240970428486,
          -0.2943770516314747
         ],
         "rank": 25,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": -0.7613090110299804
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5366161896275132,
         "interval": [
          -1.4620361523160255,
          -0.3888037730609991
         ],
         "rank": 20,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": -0.9254199626885123
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 21.98657824906775,
         "interval": [
          1272.9885624547826,
          1316.9617189529183
         ],
         "rank": 24,
         "straddles": false,
         "tier": 3,
         "tier_set": [
          3
         ],
         "unit": "elo",
         "value": 1294.9751407038505
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "St Lucia"
   },
   "opponent": "Bermuda",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 9,
    "opp": 24
   },
   "rated_in": {
    "away": "cnl",
    "home": "cnl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Bermuda": "espn_id",
    "Guadeloupe": "espn_id"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 1,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     2,
     3
    ],
    "def": [
     2,
     3
    ],
    "ovr": [
     2,
     3
    ]
   },
   "venue": {
    "city": "Gros Islet",
    "country": "St Lucia",
    "name": "Beausejour Stadium"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": null,
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "NEUTRAL"
   },
   "weights": null
  },
  {
   "away": "Haiti",
   "column": "cnl",
   "columns": [
    "cnl"
   ],
   "competition_id": "401900594",
   "cross_league": false,
   "current_only": null,
   "espn": "concacaf.nations.league",
   "event_id": "401900594",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Haiti",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.46666958637005956,
       "interval": [
        -0.20842294274262974,
        0.7249162299974894
       ],
       "rank": 3,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.25824664362742983
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.3237226825292346,
       "interval": [
        -0.47098372680160727,
        0.1764616382568619
       ],
       "rank": 11,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2
       ],
       "value": -0.1472610442723727
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.32699952636265206,
       "interval": [
        -0.7345878310878842,
        -0.08058877836258
       ],
       "rank": 12,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.40758830472523205
      },
      "field_size": 37,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.6082841330787719,
       "interval": [
        -1.031420825845823,
        0.18514744031172092
       ],
       "rank": 13,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": -0.423136692767051
      },
      "tier_gap": 0,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 52.049410206531604,
       "interval": [
        1550.0310658124388,
        1654.1298862255019
       ],
       "rank": 3,
       "straddles": false,
       "tier": 1,
       "tier_set": [
        1
       ],
       "value": 1602.0804760189703
      },
      "field_size": 37,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 21.094833608511905,
       "interval": [
        1417.5723271779498,
        1459.7619943949735
       ],
       "rank": 13,
       "straddles": false,
       "tier": 2,
       "tier_set": [
        2
       ],
       "value": 1438.6671607864616
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Haiti",
     "opp": "Dominican Republic"
    },
    "competition": "cnl",
    "field_basis": "the CONCACAF Nations League 2026-27 field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 37
   },
   "form": {
    "fav": "WLLLL",
    "opp": "WDDDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Dominican Republic",
   "in_play": false,
   "kalshi": null,
   "kickoff": "2026-10-02T00:00Z",
   "league": "cnl",
   "national": {
    "competition": "cnl",
    "group": "League A - Group A",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Haiti"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Dominican Republic"
      }
     }
    },
    "market": {
     "status": "unmapped",
     "status_words": "no open event on this series names both teams on this date. A settled book LEAVES the open list, so for a finished match this is expected"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Thu, October 1st at 8:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "2654",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-06-03T00:36Z",
         "event_id": "401871830",
         "ga": 0,
         "gf": 4,
         "kind": "friendly",
         "letter": "W",
         "opponent": "New Zealand",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-06T00:00Z",
         "event_id": "401871781",
         "ga": 2,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Peru",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-14T01:00Z",
         "event_id": "760418",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Scotland",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-20T00:30Z",
         "event_id": "760444",
         "ga": 3,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Brazil",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-24T22:00Z",
         "event_id": "760464",
         "ga": 4,
         "gf": 2,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Morocco",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WLLLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "haiti",
      "name": "Haiti",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.46666958637005956,
         "interval": [
          -0.20842294274262974,
          0.7249162299974894
         ],
         "rank": 3,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.25824664362742983
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.32699952636265206,
         "interval": [
          -0.7345878310878842,
          -0.08058877836258
         ],
         "rank": 12,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.40758830472523205
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 52.049410206531604,
         "interval": [
          1550.0310658124388,
          1654.1298862255019
         ],
         "rank": 3,
         "straddles": false,
         "tier": 1,
         "tier_set": [
          1
         ],
         "unit": "elo",
         "value": 1602.0804760189703
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "2649",
      "form": {
       "available": true,
       "friendlies": 5,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-11-13T00:00Z",
         "event_id": "760870",
         "ga": 0,
         "gf": 2,
         "kind": "friendly",
         "letter": "W",
         "opponent": "St. Vincent and the Grenadines",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-18T23:30Z",
         "event_id": "760901",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Martinique",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T00:00Z",
         "event_id": "401866383",
         "ga": 2,
         "gf": 2,
         "kind": "friendly",
         "letter": "D",
         "opponent": "El Salvador",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-29T22:00Z",
         "event_id": "401866390",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Cuba",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-04T00:45Z",
         "event_id": "401870075",
         "ga": 4,
         "gf": 2,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Panama",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WDDDL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "dominican-republic",
      "name": "Dominican Republic",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3237226825292346,
         "interval": [
          -0.47098372680160727,
          0.1764616382568619
         ],
         "rank": 11,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": -0.1472610442723727
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6082841330787719,
         "interval": [
          -1.031420825845823,
          0.18514744031172092
         ],
         "rank": 13,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": -0.423136692767051
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 21.094833608511905,
         "interval": [
          1417.5723271779498,
          1459.7619943949735
         ],
         "rank": 13,
         "straddles": false,
         "tier": 2,
         "tier_set": [
          2
         ],
         "unit": "elo",
         "value": 1438.6671607864616
        }
       },
       "axes_absent": [],
       "competition": "cnl",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Dominican Republic"
   },
   "opponent": "Dominican Republic",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 3,
    "opp": 13
   },
   "rated_in": {
    "away": "cnl",
    "home": "cnl"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXCONCACAFNLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Dominican Republic": "espn_id",
    "Haiti": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 0,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     1,
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
    "city": "Santo Domingo",
    "country": "Dominican Republic",
    "name": "Stadio Olímpico Félix Sánchez"
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
   "weights": null
  },
  {
   "away": "Senegal",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "competition_id": "401920048",
   "cross_league": false,
   "current_only": null,
   "espn": "caf.nations_qual",
   "event_id": "401920048",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Senegal",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.35712827511535206,
       "interval": [
        0.5173576942465525,
        1.2316142444772566
       ],
       "rank": 1,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 0.8744859693619046
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4524523439017298,
       "interval": [
        -0.21471089549002578,
        0.6901937923134338
       ],
       "rank": 20,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.237741448411704
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.7169734093274278,
       "interval": [
        0.03970318149668395,
        1.4736500001515396
       ],
       "rank": 5,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        1,
        2,
        3,
        4
       ],
       "value": 0.7566765908241118
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.41081436056461007,
       "interval": [
        -0.7040725415456639,
        0.11755617958355624
       ],
       "rank": 36,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "value": -0.29325818098105383
      },
      "tier_gap": 2,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 56.400398941547046,
       "interval": [
        1739.7705261315182,
        1852.5713240146124
       ],
       "rank": 4,
       "straddles": true,
       "tier": 1,
       "tier_set": [
        1,
        2
       ],
       "value": 1796.1709250730653
      },
      "field_size": 48,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 31.9114484984195,
       "interval": [
        1480.3040565598753,
        1544.1269535567144
       ],
       "rank": 28,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "value": 1512.2155050582949
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Senegal",
     "opp": "Mozambique"
    },
    "competition": "afconq",
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "CLEAN",
    "size": 48
   },
   "form": {
    "fav": "DLLWL",
    "opp": "WLLLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Mozambique",
   "in_play": false,
   "kalshi": {
    "ask_c": 74,
    "ask_size": 11,
    "bid_c": 73,
    "bid_size": 1236,
    "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
    "flags": [
     "THIN"
    ],
    "spread_c": 1,
    "ticker": "KXAFCONGAME-26SEP25MOZSEN-SEN"
   },
   "kickoff": "2026-09-25T13:00Z",
   "league": "afcon",
   "national": {
    "competition": "afcon",
    "group": "Group J",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Mozambique",
       "away_score": 0,
       "completed": true,
       "date": "2021-07-09T13:00:00Z",
       "event_id": "613391",
       "home": "Senegal",
       "home_score": 1,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Senegal",
       "away_score": 1,
       "completed": true,
       "date": "2022-07-17T13:30:00Z",
       "event_id": "649360",
       "home": "Mozambique",
       "home_score": 1,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Mozambique",
       "away_score": 1,
       "completed": true,
       "date": "2023-03-24T19:00:00Z",
       "event_id": "634731",
       "home": "Senegal",
       "home_score": 5,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Senegal",
       "away_score": 1,
       "completed": true,
       "date": "2023-03-28T16:00:00Z",
       "event_id": "634745",
       "home": "Mozambique",
       "home_score": 0,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 3,
      "draw": 1,
      "home": 0
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Senegal"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Mozambique"
      }
     }
    },
    "market": {
     "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
     "legs": {
      "away": {
       "ask_c": 74,
       "ask_size": 11,
       "bid_c": 73,
       "bid_size": 1236,
       "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
       "flags": [
        "THIN"
       ],
       "name": "Senegal",
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25MOZSEN-SEN"
      },
      "home": {
       "ask_c": 10,
       "ask_size": 1278,
       "bid_c": 9,
       "bid_size": 237,
       "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
       "flags": [],
       "name": "Mozambique",
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25MOZSEN-MOZ"
      },
      "tie": {
       "ask_c": 19,
       "ask_size": 637,
       "bid_c": 18,
       "bid_size": 452,
       "event_ticker": "KXAFCONGAME-26SEP25MOZSEN",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25MOZSEN-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Mozambique vs Senegal"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 9:00 AM EDT",
    "teams": {
     "away": {
      "espn_id": "654",
      "form": {
       "available": true,
       "friendlies": 1,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-06-09T23:00Z",
         "event_id": "401871362",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Saudi Arabia",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-16T19:00Z",
         "event_id": "760432",
         "ga": 3,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "France",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-23T00:00Z",
         "event_id": "760454",
         "ga": 3,
         "gf": 2,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Norway",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-26T19:00Z",
         "event_id": "760474",
         "ga": 0,
         "gf": 5,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Iraq",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-07-01T20:00Z",
         "event_id": "760493",
         "ga": 3,
         "gf": 2,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Belgium",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "DLLWL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "senegal",
      "name": "Senegal",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.35712827511535206,
         "interval": [
          0.5173576942465525,
          1.2316142444772566
         ],
         "rank": 1,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "log_goals",
         "value": 0.8744859693619046
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.7169734093274278,
         "interval": [
          0.03970318149668395,
          1.4736500001515396
         ],
         "rank": 5,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          1,
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": 0.7566765908241118
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 56.400398941547046,
         "interval": [
          1739.7705261315182,
          1852.5713240146124
         ],
         "rank": 4,
         "straddles": true,
         "tier": 1,
         "tier_set": [
          1,
          2
         ],
         "unit": "elo",
         "value": 1796.1709250730653
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "8939",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "Africa Cup of Nations",
         "date": "2025-12-28T12:30Z",
         "event_id": "732156",
         "ga": 2,
         "gf": 3,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Gabon",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2025-12-31T19:00Z",
         "event_id": "732168",
         "ga": 2,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Cameroon",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2026-01-05T19:00Z",
         "event_id": "732174",
         "ga": 4,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Nigeria",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-07T13:00Z",
         "event_id": "401874917",
         "ga": 4,
         "gf": 1,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Oman",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-09T13:00Z",
         "event_id": "401873677",
         "ga": 1,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Indonesia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "WLLLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "mozambique",
      "name": "Mozambique",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4524523439017298,
         "interval": [
          -0.21471089549002578,
          0.6901937923134338
         ],
         "rank": 20,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3,
          4
         ],
         "unit": "log_goals",
         "value": 0.237741448411704
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.41081436056461007,
         "interval": [
          -0.7040725415456639,
          0.11755617958355624
         ],
         "rank": 36,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.29325818098105383
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 31.9114484984195,
         "interval": [
          1480.3040565598753,
          1544.1269535567144
         ],
         "rank": 28,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "unit": "elo",
         "value": 1512.2155050582949
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Mozambique"
   },
   "opponent": "Mozambique",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 4,
    "opp": 28
   },
   "rated_in": {
    "away": "afcon",
    "home": "afcon"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Mozambique": "espn_id",
    "Senegal": "espn_id"
   },
   "shape": "CLEAN",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 1,
    "def": 2,
    "ovr": 2
   },
   "tiers": {
    "atk": [
     1,
     2
    ],
    "def": [
     3,
     5
    ],
    "ovr": [
     1,
     3
    ]
   },
   "venue": {
    "city": "Maputo",
    "country": "Mozambique",
    "name": "Estádio do Zimpeto"
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
   "weights": null
  },
  {
   "away": "Guinea-Bissau",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "competition_id": "401920049",
   "cross_league": false,
   "current_only": null,
   "espn": "caf.nations_qual",
   "event_id": "401920049",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Tanzania",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.5692409054363342,
       "interval": [
        -0.8229623817900407,
        0.31551942908262776
       ],
       "rank": 33,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": -0.25372147635370645
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.6089944575957759,
       "interval": [
        -1.4214970902706046,
        -0.20350817507905283
       ],
       "rank": 47,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "value": -0.8125026326748287
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.3909090669207144,
       "interval": [
        -0.06346068864884352,
        0.7183574451925854
       ],
       "rank": 11,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "value": 0.3274483782718709
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.4536740060978313,
       "interval": [
        -0.6180875405249019,
        0.28926047167076074
       ],
       "rank": 34,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -0.16441353442707057
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 60.2939749938449,
       "interval": [
        1402.8922166335553,
        1523.480166621245
       ],
       "rank": 37,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "value": 1463.1861916274001
      },
      "field_size": 48,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 17.61484236000548,
       "interval": [
        1368.931444073039,
        1404.16112879305
       ],
       "rank": 44,
       "straddles": false,
       "tier": 4,
       "tier_set": [
        4
       ],
       "value": 1386.5462864330445
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Tanzania",
     "opp": "Guinea-Bissau"
    },
    "competition": "afconq",
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 48
   },
   "form": {
    "fav": "DDLLW",
    "opp": "LDWLL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Tanzania",
   "in_play": false,
   "kalshi": {
    "ask_c": 42,
    "ask_size": 488,
    "bid_c": 40,
    "bid_size": 1159,
    "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXAFCONGAME-26SEP25TANGBS-TAN"
   },
   "kickoff": "2026-09-25T13:00Z",
   "league": "afcon",
   "national": {
    "competition": "afcon",
    "group": "Group L",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Guinea-Bissau"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Tanzania"
      }
     }
    },
    "market": {
     "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
     "legs": {
      "away": {
       "ask_c": 27,
       "ask_size": 400,
       "bid_c": 26,
       "bid_size": 86,
       "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
       "flags": [],
       "name": "Guinea-Bissau",
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25TANGBS-GBS"
      },
      "home": {
       "ask_c": 42,
       "ask_size": 488,
       "bid_c": 40,
       "bid_size": 1159,
       "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
       "flags": [],
       "name": "Tanzania",
       "spread_c": 2,
       "ticker": "KXAFCONGAME-26SEP25TANGBS-TAN"
      },
      "tie": {
       "ask_c": 33,
       "ask_size": 322,
       "bid_c": 32,
       "bid_size": 2,
       "event_ticker": "KXAFCONGAME-26SEP25TANGBS",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25TANGBS-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Tanzania vs Guinea-Bissau"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 9:00 AM EDT",
    "teams": {
     "away": {
      "espn_id": "8602",
      "form": {
       "available": true,
       "friendlies": 1,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-06-09T19:00Z",
         "event_id": "736117",
         "ga": 2,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Gabon",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2025-09-04T16:00Z",
         "event_id": "687134",
         "ga": 1,
         "gf": 1,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Sierra Leone",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2025-09-08T16:00Z",
         "event_id": "687135",
         "ga": 0,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Djibouti",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2025-10-08T13:00Z",
         "event_id": "687136",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Ethiopia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2025-10-12T19:00Z",
         "event_id": "687122",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Egypt",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "LDWLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "guinea-bissau",
      "name": "Guinea-Bissau",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6089944575957759,
         "interval": [
          -1.4214970902706046,
          -0.20350817507905283
         ],
         "rank": 47,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.8125026326748287
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.4536740060978313,
         "interval": [
          -0.6180875405249019,
          0.28926047167076074
         ],
         "rank": 34,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.16441353442707057
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 17.61484236000548,
         "interval": [
          1368.931444073039,
          1404.16112879305
         ],
         "rank": 44,
         "straddles": false,
         "tier": 4,
         "tier_set": [
          4
         ],
         "unit": "elo",
         "value": 1386.5462864330445
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "5778",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "Africa Cup of Nations",
         "date": "2025-12-27T17:30Z",
         "event_id": "732151",
         "ga": 1,
         "gf": 1,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Uganda",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2025-12-30T16:00Z",
         "event_id": "732163",
         "ga": 1,
         "gf": 1,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Tunisia",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2026-01-04T16:00Z",
         "event_id": "732171",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Morocco",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-26T14:30Z",
         "event_id": "401862357",
         "ga": 1,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Liechtenstein",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-29T13:00Z",
         "event_id": "401866730",
         "ga": 0,
         "gf": 6,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Macau",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        }
       ],
       "letters": "DDLLW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "tanzania",
      "name": "Tanzania",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5692409054363342,
         "interval": [
          -0.8229623817900407,
          0.31551942908262776
         ],
         "rank": 33,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.25372147635370645
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.3909090669207144,
         "interval": [
          -0.06346068864884352,
          0.7183574451925854
         ],
         "rank": 11,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "unit": "log_goals",
         "value": 0.3274483782718709
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 60.2939749938449,
         "interval": [
          1402.8922166335553,
          1523.480166621245
         ],
         "rank": 37,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "unit": "elo",
         "value": 1463.1861916274001
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Tanzania"
   },
   "opponent": "Guinea-Bissau",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 37,
    "opp": 44
   },
   "rated_in": {
    "away": "afcon",
    "home": "afcon"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Guinea-Bissau": "espn_id",
    "Tanzania": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
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
     4,
     5
    ],
    "def": [
     3,
     4
    ],
    "ovr": [
     4,
     4
    ]
   },
   "venue": {
    "city": "Amaan Stadium",
    "country": "Tanzania",
    "name": "Amaan Stadium"
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
   "weights": null
  },
  {
   "away": "Lesotho",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "competition_id": "401920043",
   "cross_league": false,
   "current_only": null,
   "espn": "caf.nations_qual",
   "event_id": "401920043",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Niger",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.5340365306862761,
       "interval": [
        -0.11676212714453826,
        0.9513109342280139
       ],
       "rank": 12,
       "straddles": true,
       "tier": 2,
       "tier_set": [
        1,
        2,
        3
       ],
       "value": 0.41727440354173784
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.7800964218606496,
       "interval": [
        -1.406984201696671,
        0.15320864202462836
       ],
       "rank": 45,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -0.6268877798360213
      },
      "tier_gap": 3,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.45583645124797917,
       "interval": [
        -0.4655534089697857,
        0.44611949352617264
       ],
       "rank": 25,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4,
        5
       ],
       "value": -0.009716957721806516
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.5347527990848138,
       "interval": [
        -0.9408629208701323,
        0.1286426772994952
       ],
       "rank": 41,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "value": -0.4061101217853186
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 23.581045504702143,
       "interval": [
        1463.3015851774715,
        1510.4636761868758
       ],
       "rank": 33,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        3,
        4
       ],
       "value": 1486.8826306821736
      },
      "field_size": 48,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 20.493472112287304,
       "interval": [
        1376.4285393756168,
        1417.4154836001912
       ],
       "rank": 43,
       "straddles": false,
       "tier": 4,
       "tier_set": [
        4
       ],
       "value": 1396.922011487904
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Niger",
     "opp": "Lesotho"
    },
    "competition": "afconq",
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 48
   },
   "form": {
    "fav": "WLDDL",
    "opp": "LDWDL",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Niger",
   "in_play": false,
   "kalshi": {
    "ask_c": 58,
    "ask_size": 1739,
    "bid_c": 57,
    "bid_size": 1194,
    "event_ticker": "KXAFCONGAME-26SEP25NIGLES",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXAFCONGAME-26SEP25NIGLES-NIG"
   },
   "kickoff": "2026-09-25T15:00Z",
   "league": "afcon",
   "national": {
    "competition": "afcon",
    "group": "Group A",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Lesotho"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Niger"
      }
     }
    },
    "market": {
     "event_ticker": "KXAFCONGAME-26SEP25NIGLES",
     "legs": {
      "away": {
       "ask_c": 18,
       "ask_size": 779,
       "bid_c": 17,
       "bid_size": 208,
       "event_ticker": "KXAFCONGAME-26SEP25NIGLES",
       "flags": [],
       "name": "Lesotho",
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25NIGLES-LES"
      },
      "home": {
       "ask_c": 58,
       "ask_size": 1739,
       "bid_c": 57,
       "bid_size": 1194,
       "event_ticker": "KXAFCONGAME-26SEP25NIGLES",
       "flags": [],
       "name": "Niger",
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25NIGLES-NIG"
      },
      "tie": {
       "ask_c": 27,
       "ask_size": 806,
       "bid_c": 26,
       "bid_size": 486,
       "event_ticker": "KXAFCONGAME-26SEP25NIGLES",
       "flags": [],
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25NIGLES-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Niger vs Lesotho"
    },
    "neutral": true,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 11:00 AM EDT",
    "teams": {
     "away": {
      "espn_id": "6640",
      "form": {
       "available": true,
       "friendlies": 3,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-11-18T14:00Z",
         "event_id": "760898",
         "ga": 1,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Malawi",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-26T14:00Z",
         "event_id": "401850986",
         "ga": 0,
         "gf": 0,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Seychelles",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-29T15:00Z",
         "event_id": "401850992",
         "ga": 1,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Seychelles",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-04T13:00Z",
         "event_id": "401874168",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Kenya",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-07T13:00Z",
         "event_id": "401874169",
         "ga": 4,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Kenya",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "LDWDL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "lesotho",
      "name": "Lesotho",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.7800964218606496,
         "interval": [
          -1.406984201696671,
          0.15320864202462836
         ],
         "rank": 45,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.6268877798360213
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5347527990848138,
         "interval": [
          -0.9408629208701323,
          0.1286426772994952
         ],
         "rank": 41,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.4061101217853186
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 20.493472112287304,
         "interval": [
          1376.4285393756168,
          1417.4154836001912
         ],
         "rank": 43,
         "straddles": false,
         "tier": 4,
         "tier_set": [
          4
         ],
         "unit": "elo",
         "value": 1396.922011487904
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "8937",
      "form": {
       "available": true,
       "friendlies": 4,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2025-10-12T13:00Z",
         "event_id": "687250",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Zambia",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-14T19:00Z",
         "event_id": "760878",
         "ga": 3,
         "gf": 2,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Burkina Faso",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2025-11-18T15:30Z",
         "event_id": "760897",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Guinea",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T18:00Z",
         "event_id": "401866402",
         "ga": 0,
         "gf": 0,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Libya",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-31T16:00Z",
         "event_id": "401866403",
         "ga": 1,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Togo",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        }
       ],
       "letters": "WLDDL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "niger",
      "name": "Niger",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5340365306862761,
         "interval": [
          -0.11676212714453826,
          0.9513109342280139
         ],
         "rank": 12,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.41727440354173784
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.45583645124797917,
         "interval": [
          -0.4655534089697857,
          0.44611949352617264
         ],
         "rank": 25,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.009716957721806516
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 23.581045504702143,
         "interval": [
          1463.3015851774715,
          1510.4636761868758
         ],
         "rank": 33,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4
         ],
         "unit": "elo",
         "value": 1486.8826306821736
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Ghana"
   },
   "opponent": "Lesotho",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 33,
    "opp": 43
   },
   "rated_in": {
    "away": "afcon",
    "home": "afcon"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Lesotho": "espn_id",
    "Niger": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": 3,
    "def": 1,
    "ovr": 0
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
     4
    ]
   },
   "venue": {
    "city": "Accra",
    "country": "Ghana",
    "name": "Ohene Djan Stadium"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": null,
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "NEUTRAL"
   },
   "weights": null
  },
  {
   "away": "Ethiopia",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "competition_id": "401920041",
   "cross_league": false,
   "current_only": null,
   "espn": "caf.nations_qual",
   "event_id": "401920041",
   "fav_side": "home",
   "fav_source": "field",
   "favourite": "Sudan",
   "field": {
    "axes": {
     "atk": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.8098547189880808,
       "interval": [
        -1.333192618224135,
        0.2865168197520268
       ],
       "rank": 43,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": -0.523337899236054
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "attack",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.8790899827850123,
       "interval": [
        -1.221917615656019,
        0.5362623499140056
       ],
       "rank": 36,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": -0.34282763287100676
      },
      "tier_gap": -1,
      "unit": "log_goals"
     },
     "def": {
      "fav": {
       "below_floor": true,
       "half_width_95": 0.6606161526689599,
       "interval": [
        -0.4070865630474114,
        0.9141457422905084
       ],
       "rank": 15,
       "straddles": true,
       "tier": 4,
       "tier_set": [
        2,
        3,
        4,
        5
       ],
       "value": 0.2535295896215485
      },
      "field_size": 47,
      "floor": {
       "below_floor": true,
       "failing_condition": "G3"
      },
      "label": "defence",
      "opp": {
       "below_floor": true,
       "half_width_95": 0.499713705176615,
       "interval": [
        -0.879347034846703,
        0.12008037550652712
       ],
       "rank": 39,
       "straddles": true,
       "tier": 5,
       "tier_set": [
        4,
        5
       ],
       "value": -0.3796333296700879
      },
      "tier_gap": 1,
      "unit": "log_goals"
     },
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 25.477166188947276,
       "interval": [
        1477.3118793704484,
        1528.2662117483428
       ],
       "rank": 30,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "value": 1502.7890455593956
      },
      "field_size": 48,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 29.633439975606993,
       "interval": [
        1401.1467292734865,
        1460.4136092247004
       ],
       "rank": 39,
       "straddles": false,
       "tier": 4,
       "tier_set": [
        4
       ],
       "value": 1430.7801692490934
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
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Sudan",
     "opp": "Ethiopia"
    },
    "competition": "afconq",
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape": "SPLIT",
    "size": 48
   },
   "form": {
    "fav": "LLWLL",
    "opp": "LWWWD",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Sudan",
   "in_play": false,
   "kalshi": {
    "ask_c": 52,
    "ask_size": 411,
    "bid_c": 51,
    "bid_size": 645,
    "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
    "flags": [],
    "spread_c": 1,
    "ticker": "KXAFCONGAME-26SEP25SDNETH-SDN"
   },
   "kickoff": "2026-09-25T16:00Z",
   "league": "afcon",
   "national": {
    "competition": "afcon",
    "group": "Group J",
    "head_to_head": {
     "available": true,
     "meetings": [
      {
       "away": "Ethiopia",
       "away_score": 3,
       "completed": true,
       "date": "2021-12-30T14:30:00Z",
       "event_id": "625990",
       "home": "Sudan",
       "home_score": 2,
       "winner": "away",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Sudan",
       "away_score": 1,
       "completed": true,
       "date": "2022-09-23T13:00:00Z",
       "event_id": "654039",
       "home": "Ethiopia",
       "home_score": 1,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Sudan",
       "away_score": 2,
       "completed": true,
       "date": "2022-09-26T13:00:00Z",
       "event_id": "654048",
       "home": "Ethiopia",
       "home_score": 2,
       "winner": "draw",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Sudan",
       "away_score": 2,
       "completed": true,
       "date": "2024-12-22T14:00:00Z",
       "event_id": "723248",
       "home": "Ethiopia",
       "home_score": 0,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      },
      {
       "away": "Ethiopia",
       "away_score": 1,
       "completed": true,
       "date": "2024-12-25T14:00:00Z",
       "event_id": "723249",
       "home": "Sudan",
       "home_score": 2,
       "winner": "home",
       "winner_means": "this fixture's home/away sides"
      }
     ],
     "reason": null,
     "source": "seasonseries",
     "tally": {
      "away": 1,
      "draw": 2,
      "home": 2
     }
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Ethiopia"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Sudan"
      }
     }
    },
    "market": {
     "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
     "legs": {
      "away": {
       "ask_c": 20,
       "ask_size": 455,
       "bid_c": 19,
       "bid_size": 458,
       "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
       "flags": [],
       "name": "Ethiopia",
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25SDNETH-ETH"
      },
      "home": {
       "ask_c": 52,
       "ask_size": 411,
       "bid_c": 51,
       "bid_size": 645,
       "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
       "flags": [],
       "name": "Sudan",
       "spread_c": 1,
       "ticker": "KXAFCONGAME-26SEP25SDNETH-SDN"
      },
      "tie": {
       "ask_c": 30,
       "ask_size": 276,
       "bid_c": 28,
       "bid_size": 559,
       "event_ticker": "KXAFCONGAME-26SEP25SDNETH",
       "flags": [],
       "spread_c": 2,
       "ticker": "KXAFCONGAME-26SEP25SDNETH-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Sudan vs Ethiopia"
    },
    "neutral": true,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Fri, September 25th at 12:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "5777",
      "form": {
       "available": true,
       "friendlies": 2,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2025-10-12T19:00Z",
         "event_id": "687130",
         "ga": 3,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Burkina Faso",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-27T15:00Z",
         "event_id": "401850988",
         "ga": 0,
         "gf": 3,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Sao Tome and Principe",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-31T13:00Z",
         "event_id": "401850991",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Sao Tome and Principe",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-06T15:00Z",
         "event_id": "401873737",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Malawi",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-09T15:00Z",
         "event_id": "401873738",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Malawi",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "home"
        }
       ],
       "letters": "LWWWD",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "ethiopia",
      "name": "Ethiopia",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.8790899827850123,
         "interval": [
          -1.221917615656019,
          0.5362623499140056
         ],
         "rank": 36,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.34282763287100676
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.499713705176615,
         "interval": [
          -0.879347034846703,
          0.12008037550652712
         ],
         "rank": 39,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.3796333296700879
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 29.633439975606993,
         "interval": [
          1401.1467292734865,
          1460.4136092247004
         ],
         "rank": 39,
         "straddles": false,
         "tier": 4,
         "tier_set": [
          4
         ],
         "unit": "elo",
         "value": 1430.7801692490934
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "4319",
      "form": {
       "available": true,
       "friendlies": 1,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-11-14T15:00Z",
         "event_id": "760880",
         "ga": 2,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Oman",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2025-12-24T15:00Z",
         "event_id": "732143",
         "ga": 3,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Algeria",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2025-12-28T15:00Z",
         "event_id": "732154",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Equatorial Guinea",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2025-12-31T16:00Z",
         "event_id": "732166",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Burkina Faso",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "Africa Cup of Nations",
         "date": "2026-01-03T16:00Z",
         "event_id": "732170",
         "ga": 3,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Senegal",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        }
       ],
       "letters": "LLWLL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "sudan",
      "name": "Sudan",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.8098547189880808,
         "interval": [
          -1.333192618224135,
          0.2865168197520268
         ],
         "rank": 43,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.523337899236054
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.6606161526689599,
         "interval": [
          -0.4070865630474114,
          0.9141457422905084
         ],
         "rank": 15,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": 0.2535295896215485
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 25.477166188947276,
         "interval": [
          1477.3118793704484,
          1528.2662117483428
         ],
         "rank": 30,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "unit": "elo",
         "value": 1502.7890455593956
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "South Sudan"
   },
   "opponent": "Ethiopia",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 30,
    "opp": 39
   },
   "rated_in": {
    "away": "afcon",
    "home": "afcon"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Ethiopia": "espn_id",
    "Sudan": "espn_id"
   },
   "shape": "SPLIT",
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": -1,
    "def": 1,
    "ovr": 1
   },
   "tiers": {
    "atk": [
     5,
     4
    ],
    "def": [
     4,
     5
    ],
    "ovr": [
     3,
     4
    ]
   },
   "venue": {
    "city": "Juba National Stadium",
    "country": "South Sudan",
    "name": "Juba National Stadium"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": null,
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "NEUTRAL"
   },
   "weights": null
  },
  {
   "away": "Eritrea",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "competition_id": "401920035",
   "cross_league": false,
   "current_only": null,
   "espn": "caf.nations_qual",
   "event_id": "401920035",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "Eritrea",
   "field_partial": {
    "axes": {
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 4.31377247080896,
       "interval": [
        1611.3213117245011,
        1619.9488566661191
       ],
       "rank": 15,
       "straddles": false,
       "tier": 3,
       "tier_set": [
        3
       ],
       "value": 1615.6350841953101
      },
      "field_size": 48,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 33.91335070370768,
       "interval": [
        1481.547554157181,
        1549.3742555645963
       ],
       "rank": 27,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        3,
        4
       ],
       "value": 1515.4609048608886
      },
      "tier_gap": 0,
      "unit": "elo"
     }
    },
    "axes_measured": [
     "ovr"
    ],
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "Eritrea",
     "opp": "Kenya"
    },
    "competition": "afconq",
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape_absent": {
     "axes_absent": [
      "atk",
      "def"
     ],
     "why": "`shape` is CLEAN/HOLLOW/SPLIT read off all 3 of ['ovr', 'atk', 'def'] together, and one of these two teams has no measured atk or def. A label composed from fewer gaps would be a sentence about the fixture no measurement stands behind."
    },
    "size": 48,
    "why_not_field": "THE FIELD PLACED BOTH TEAMS ON FEWER AXES THAN `field` IS DEFINED ON: one of them has no measured attack or defence (the goals estimator's own refusal, named on its rating). This key is not `field` because `field` is a three-axis contract its readers walk unguarded. Nothing is padded: an axis a team was not measured on is absent, not a pair of nulls. `shape_absent` says which axes are missing and why."
   },
   "form": {
    "fav": "LLLWW",
    "opp": "LDWDW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Kenya",
   "in_play": false,
   "kalshi": {
    "ask_c": 11,
    "ask_size": 1388,
    "bid_c": 9,
    "bid_size": 201,
    "event_ticker": "KXAFCONGAME-26SEP26KENERI",
    "flags": [],
    "spread_c": 2,
    "ticker": "KXAFCONGAME-26SEP26KENERI-ERI"
   },
   "kickoff": "2026-09-26T13:00Z",
   "league": "afcon",
   "national": {
    "competition": "afcon",
    "group": "Group D",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Eritrea"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Kenya"
      }
     }
    },
    "market": {
     "event_ticker": "KXAFCONGAME-26SEP26KENERI",
     "legs": {
      "away": {
       "ask_c": 11,
       "ask_size": 1388,
       "bid_c": 9,
       "bid_size": 201,
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "flags": [],
       "name": "Eritrea",
       "spread_c": 2,
       "ticker": "KXAFCONGAME-26SEP26KENERI-ERI"
      },
      "home": {
       "ask_c": 69,
       "ask_size": 5,
       "bid_c": 65,
       "bid_size": 100,
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Kenya",
       "spread_c": 4,
       "ticker": "KXAFCONGAME-26SEP26KENERI-KEN"
      },
      "tie": {
       "ask_c": 22,
       "ask_size": 14,
       "bid_c": 19,
       "bid_size": 230,
       "event_ticker": "KXAFCONGAME-26SEP26KENERI",
       "flags": [
        "THIN"
       ],
       "spread_c": 3,
       "ticker": "KXAFCONGAME-26SEP26KENERI-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Kenya vs Eritrea"
    },
    "neutral": false,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Sat, September 26th at 9:00 AM EDT",
    "teams": {
     "away": {
      "espn_id": "5774",
      "form": {
       "available": true,
       "friendlies": 0,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2015-10-13T17:00Z",
         "event_id": "436345",
         "ga": 3,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Botswana",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2019-09-04T13:00Z",
         "event_id": "554680",
         "ga": 2,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Namibia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2019-09-10T17:00Z",
         "event_id": "554664",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Namibia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-25T16:00Z",
         "event_id": "401850985",
         "ga": 0,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Eswatini",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-31T14:00Z",
         "event_id": "401850990",
         "ga": 1,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Eswatini",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        }
       ],
       "letters": "LLLWW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "eritrea",
      "name": "Eritrea",
      "rating": {
       "available": true,
       "axes": {
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 4.31377247080896,
         "interval": [
          1611.3213117245011,
          1619.9488566661191
         ],
         "rank": 15,
         "straddles": false,
         "tier": 3,
         "tier_set": [
          3
         ],
         "unit": "elo",
         "value": 1615.6350841953101
        }
       },
       "axes_absent": [
        "atk",
        "def"
       ],
       "competition": "afconq",
       "not_measured_because": "in a fitted league but in no domestic block — no club deviation, refused rather than set to the league average",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "2848",
      "form": {
       "available": true,
       "friendlies": 5,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2025-11-18T15:00Z",
         "event_id": "760824",
         "ga": 8,
         "gf": 0,
         "kind": "friendly",
         "letter": "L",
         "opponent": "Senegal",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-27T16:00Z",
         "event_id": "401862401",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Estonia",
         "provider_agrees": false,
         "provider_letter": "L",
         "shootout": {
          "against": 5,
          "for": 4,
          "note": "level after play, decided on penalties; the letter is the scoreline's, D"
         },
         "venue": "home"
        },
        {
         "competition": "International Friendly",
         "date": "2026-03-30T14:00Z",
         "event_id": "401866741",
         "ga": 0,
         "gf": 3,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Grenada",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-04T13:00Z",
         "event_id": "401874168",
         "ga": 1,
         "gf": 1,
         "kind": "friendly",
         "letter": "D",
         "opponent": "Lesotho",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "International Friendly",
         "date": "2026-06-07T13:00Z",
         "event_id": "401874169",
         "ga": 0,
         "gf": 4,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Lesotho",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        }
       ],
       "letters": "LDWDW",
       "provider_disagreements": 1,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "kenya",
      "name": "Kenya",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5964643031716015,
         "interval": [
          -0.5702610705180562,
          0.6226675358251468
         ],
         "rank": 28,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          1,
          2,
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": 0.026203232653545298
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.575129259138015,
         "interval": [
          -0.9583823005187173,
          0.19187621775731273
         ],
         "rank": 40,
         "straddles": true,
         "tier": 5,
         "tier_set": [
          4,
          5
         ],
         "unit": "log_goals",
         "value": -0.3832530413807023
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 33.91335070370768,
         "interval": [
          1481.547554157181,
          1549.3742555645963
         ],
         "rank": 27,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          3,
          4
         ],
         "unit": "elo",
         "value": 1515.4609048608886
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Kenya"
   },
   "opponent": "Kenya",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 15,
    "opp": 27
   },
   "rated_in": {
    "away": "afcon",
    "home": "afcon"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Eritrea": "espn_id",
    "Kenya": "espn_id"
   },
   "shape": null,
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": null,
    "def": null,
    "ovr": 0
   },
   "tiers": {
    "atk": null,
    "def": null,
    "ovr": [
     3,
     3
    ]
   },
   "venue": {
    "city": "Nairobi",
    "country": "Kenya",
    "name": "Nyayo National Stadium"
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
   "weights": null
  },
  {
   "away": "South Africa",
   "column": "afcon",
   "columns": [
    "afcon"
   ],
   "competition_id": "401919991",
   "cross_league": false,
   "current_only": null,
   "espn": "caf.nations_qual",
   "event_id": "401919991",
   "fav_side": "away",
   "fav_source": "field",
   "favourite": "South Africa",
   "field_partial": {
    "axes": {
     "ovr": {
      "fav": {
       "below_floor": false,
       "half_width_95": 49.03056912744277,
       "interval": [
        1583.3189447820982,
        1681.3800830369837
       ],
       "rank": 14,
       "straddles": true,
       "tier": 3,
       "tier_set": [
        2,
        3
       ],
       "value": 1632.349513909541
      },
      "field_size": 48,
      "floor": {
       "below_floor": false,
       "failing_condition": null
      },
      "label": "overall",
      "opp": {
       "below_floor": false,
       "half_width_95": 4.31377247080896,
       "interval": [
        1611.3213117245011,
        1619.9488566661191
       ],
       "rank": 15,
       "straddles": false,
       "tier": 3,
       "tier_set": [
        3
       ],
       "value": 1615.6350841953101
      },
      "tier_gap": 0,
      "unit": "elo"
     }
    },
    "axes_measured": [
     "ovr"
    ],
    "basis": "rated on the competition's own FIELD — its whole entrant set on one scale, the national-team field the club estimators measured — and not on any table: a national team has none. `field_basis` beside this says which field and how deeply it was measured. `straddles` and `below_floor` travel with each side, and each axis carries its confederation's floor verdict and the condition that failed, because a band published without them reads as a measurement of the team rather than of the evidence.",
    "clubs": {
     "fav": "South Africa",
     "opp": "Eritrea"
    },
    "competition": "afconq",
    "field_basis": "the AFCON 2027 qualifying field: every entrant of the competition on the national-team field the club estimators measured (src.picker.national_team_axes; corpus b89af5d2210e, variant 'all', Elo pinned at 10 passes), banded on this competition's own spread. Overall is Elo; attack and defence are log-goals.",
    "shape_absent": {
     "axes_absent": [
      "atk",
      "def"
     ],
     "why": "`shape` is CLEAN/HOLLOW/SPLIT read off all 3 of ['ovr', 'atk', 'def'] together, and one of these two teams has no measured atk or def. A label composed from fewer gaps would be a sentence about the fixture no measurement stands behind."
    },
    "size": 48,
    "why_not_field": "THE FIELD PLACED BOTH TEAMS ON FEWER AXES THAN `field` IS DEFINED ON: one of them has no measured attack or defence (the goals estimator's own refusal, named on its rating). This key is not `field` because `field` is a three-axis contract its readers walk unguarded. Nothing is padded: an axis a team was not measured on is absent, not a pair of nulls. `shape_absent` says which axes are missing and why."
   },
   "form": {
    "fav": "WLDWL",
    "opp": "LLLWW",
    "scope": "all senior internationals, friendlies marked",
    "scope_is_cup": false
   },
   "gap_note": "NATIONAL-TEAM FIXTURE — ppg, GD/g and rank gaps withheld. A national team has no league table, so there is no table gap to measure. The two teams are compared on the competition's FIELD instead (`field`, or `field_partial` when one team lacks a goal axis): `ranks` are the two teams' OVERALL ranks in that field, and `tiers`, `tier_gaps` and `shape` are the field's own tiers — there is no within-league quintile for them to be. `rates` are each team's own record in this competition's current group, per game.",
   "gdg_gap": null,
   "gp_current": {
    "away": 0,
    "home": 0,
    "min": 0
   },
   "home": "Eritrea",
   "in_play": false,
   "kalshi": {
    "ask_c": 70,
    "ask_size": 21,
    "bid_c": 11,
    "bid_size": 5,
    "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
    "flags": [
     "WIDE",
     "THIN"
    ],
    "spread_c": 59,
    "ticker": "KXAFCONGAME-26SEP30ERIRSA-RSA"
   },
   "kickoff": "2026-09-30T16:00Z",
   "league": "afcon",
   "national": {
    "competition": "afcon",
    "group": "Group D",
    "head_to_head": {
     "available": false,
     "meetings": [],
     "reason": "ESPN's summary carries no head-to-head block for this pairing: it lists no previous meeting. That is the provider's record, not proof the two teams never met",
     "source": null
    },
    "leg": null,
    "lineups": {
     "announced": false,
     "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
     "sides": {
      "away": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "South Africa"
      },
      "home": {
       "announced": false,
       "bench": 0,
       "formation": null,
       "starters": [],
       "team": "Eritrea"
      }
     }
    },
    "market": {
     "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
     "legs": {
      "away": {
       "ask_c": 70,
       "ask_size": 21,
       "bid_c": 11,
       "bid_size": 5,
       "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "South Africa",
       "spread_c": 59,
       "ticker": "KXAFCONGAME-26SEP30ERIRSA-RSA"
      },
      "home": {
       "ask_c": 70,
       "ask_size": 54,
       "bid_c": 10,
       "bid_size": 1,
       "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
       "flags": [
        "WIDE",
        "THIN"
       ],
       "name": "Eritrea",
       "spread_c": 60,
       "ticker": "KXAFCONGAME-26SEP30ERIRSA-ERI"
      },
      "tie": {
       "ask_c": 69,
       "ask_size": 5,
       "bid_c": 6,
       "bid_size": 700,
       "event_ticker": "KXAFCONGAME-26SEP30ERIRSA",
       "flags": [
        "WIDE",
        "THIN"
       ],
       "spread_c": 63,
       "ticker": "KXAFCONGAME-26SEP30ERIRSA-TIE"
      }
     },
     "orientation": "same",
     "status": "mapped",
     "status_words": "one open Kalshi event names both teams on this date",
     "title": "Eritrea vs South Africa"
    },
    "neutral": true,
    "neutral_provider_flag": false,
    "stage": "group-stage",
    "stage_kind": "group",
    "status_detail": "Wed, September 30th at 12:00 PM EDT",
    "teams": {
     "away": {
      "espn_id": "467",
      "form": {
       "available": true,
       "friendlies": 1,
       "games": [
        {
         "competition": "International Friendly",
         "date": "2026-06-06T21:00Z",
         "event_id": "401875160",
         "ga": 0,
         "gf": 1,
         "kind": "friendly",
         "letter": "W",
         "opponent": "Jamaica",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-11T19:00Z",
         "event_id": "760415",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Mexico",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-18T16:00Z",
         "event_id": "760438",
         "ga": 1,
         "gf": 1,
         "kind": "competitive",
         "letter": "D",
         "opponent": "Czechia",
         "provider_agrees": true,
         "provider_letter": "D",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-25T01:00Z",
         "event_id": "760466",
         "ga": 0,
         "gf": 1,
         "kind": "competitive",
         "letter": "W",
         "opponent": "South Korea",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup",
         "date": "2026-06-28T19:00Z",
         "event_id": "760486",
         "ga": 1,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Canada",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        }
       ],
       "letters": "WLDWL",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "south-africa",
      "name": "South Africa",
      "rating": {
       "available": true,
       "axes": {
        "atk": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.39723401068539477,
         "interval": [
          0.06321226235300847,
          0.857680283723798
         ],
         "rank": 8,
         "straddles": true,
         "tier": 2,
         "tier_set": [
          1,
          2,
          3
         ],
         "unit": "log_goals",
         "value": 0.46044627303840324
        },
        "def": {
         "below_floor": true,
         "floor": {
          "below_floor": true,
          "failing_condition": "G3"
         },
         "half_width_95": 0.5080118902362225,
         "interval": [
          -0.4330655320348256,
          0.5829582484376195
         ],
         "rank": 20,
         "straddles": true,
         "tier": 4,
         "tier_set": [
          3,
          4,
          5
         ],
         "unit": "log_goals",
         "value": 0.07494635820139689
        },
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 49.03056912744277,
         "interval": [
          1583.3189447820982,
          1681.3800830369837
         ],
         "rank": 14,
         "straddles": true,
         "tier": 3,
         "tier_set": [
          2,
          3
         ],
         "unit": "elo",
         "value": 1632.349513909541
        }
       },
       "axes_absent": [],
       "competition": "afconq",
       "source": "src.picker.national_team_axes"
      }
     },
     "home": {
      "espn_id": "5774",
      "form": {
       "available": true,
       "friendlies": 0,
       "games": [
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2015-10-13T17:00Z",
         "event_id": "436345",
         "ga": 3,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Botswana",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2019-09-04T13:00Z",
         "event_id": "554680",
         "ga": 2,
         "gf": 1,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Namibia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "home"
        },
        {
         "competition": "FIFA World Cup Qualifying - CAF",
         "date": "2019-09-10T17:00Z",
         "event_id": "554664",
         "ga": 2,
         "gf": 0,
         "kind": "competitive",
         "letter": "L",
         "opponent": "Namibia",
         "provider_agrees": true,
         "provider_letter": "L",
         "venue": "away"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-25T16:00Z",
         "event_id": "401850985",
         "ga": 0,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Eswatini",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "home"
        },
        {
         "competition": "Africa Cup of Nations Qualifying",
         "date": "2026-03-31T14:00Z",
         "event_id": "401850990",
         "ga": 1,
         "gf": 2,
         "kind": "competitive",
         "letter": "W",
         "opponent": "Eswatini",
         "provider_agrees": true,
         "provider_letter": "W",
         "venue": "away"
        }
       ],
       "letters": "LLLWW",
       "provider_disagreements": 0,
       "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
      },
      "key": "eritrea",
      "name": "Eritrea",
      "rating": {
       "available": true,
       "axes": {
        "ovr": {
         "below_floor": false,
         "floor": {
          "below_floor": false,
          "failing_condition": null
         },
         "half_width_95": 4.31377247080896,
         "interval": [
          1611.3213117245011,
          1619.9488566661191
         ],
         "rank": 15,
         "straddles": false,
         "tier": 3,
         "tier_set": [
          3
         ],
         "unit": "elo",
         "value": 1615.6350841953101
        }
       },
       "axes_absent": [
        "atk",
        "def"
       ],
       "competition": "afconq",
       "not_measured_because": "in a fitted league but in no domestic block — no club deviation, refused rather than set to the league average",
       "source": "src.picker.national_team_axes"
      }
     }
    },
    "venue_country": "Egypt"
   },
   "opponent": "Eritrea",
   "own_gdg": {
    "basis": "each team's own goal difference per game in THIS competition's current group, differenced. Two groups of different strength are not one scale, and a handful of games is a handful of games; the field above is the comparison, this is a record.",
    "diff": null
   },
   "ppg_gap": null,
   "rank_gap": null,
   "ranks": {
    "fav": 14,
    "opp": 15
   },
   "rated_in": {
    "away": "afcon",
    "home": "afcon"
   },
   "rates": {
    "ga": [
     null,
     null
    ],
    "gdg": [
     null,
     null
    ],
    "gf": [
     null,
     null
    ],
    "ppg": [
     null,
     null
    ]
   },
   "refused": false,
   "reg_time_note": "KXAFCONGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
   "resolution": {
    "Eritrea": "espn_id",
    "South Africa": "espn_id"
   },
   "shape": null,
   "src": "current",
   "state": "pre",
   "table_notes": {
    "away": null,
    "home": null
   },
   "tier_gaps": {
    "atk": null,
    "def": null,
    "ovr": 0
   },
   "tiers": {
    "atk": null,
    "def": null,
    "ovr": [
     3,
     3
    ]
   },
   "venue": {
    "city": "Cairo",
    "country": "Egypt",
    "name": "Al Salam Stadium"
   },
   "venue_class": {
    "class": "NEUTRAL",
    "home_side": null
   },
   "venue_favourite": {
    "flipped": false,
    "home_side": null,
    "policy": "off",
    "reason": "no_gdg_gap",
    "refused": true,
    "venue_class": "NEUTRAL"
   },
   "weights": null
  }
 ],
 "source": "live"
} as const;

export const SAMPLE_REFUSAL = {
 "refused": true,
 "club": null,
 "reason": "no_national_rating",
 "home": "Georgia",
 "away": "Northern Ireland",
 "league": "unl",
 "column": "unl",
 "columns": [
  "unl"
 ],
 "reg_time_note": "KXUEFANLGAME: Important information: The following market is based on the outcome after 90 minutes plus stoppage time. This does not include extra time or penalties. In a knockout tie this is the price of the MATCH after 90 minutes, not of going through.",
 "this_season": null,
 "admission": null,
 "opponent_row": null,
 "sides": {
  "home": {
   "club": "Georgia",
   "table_club": "Georgia",
   "resolved_by": "espn_id",
   "rated": false,
   "rated_in": "unl",
   "key": "georgia",
   "table_note": "this team's own record in THIS competition's current group, per game. It is not a rating and not a table the other team is ranked in unless both are in the same group; `rank`/`of` are the derived group position (see standings.ordering_note). Group: Group B2.",
   "ppg": null,
   "gf": null,
   "ga": null,
   "gdg": null,
   "gp_current": 0,
   "rank": null,
   "of": 4,
   "weight": null,
   "basis": null,
   "totals": {
    "w": 0,
    "d": 0,
    "l": 0,
    "gf": 0,
    "ga": 0,
    "gd": 0,
    "pts": 0
   }
  },
  "away": {
   "club": "Northern Ireland",
   "table_club": "Northern Ireland",
   "resolved_by": "espn_id",
   "rated": false,
   "rated_in": "unl",
   "key": "northern-ireland",
   "table_note": "this team's own record in THIS competition's current group, per game. It is not a rating and not a table the other team is ranked in unless both are in the same group; `rank`/`of` are the derived group position (see standings.ordering_note). Group: Group B2.",
   "ppg": null,
   "gf": null,
   "ga": null,
   "gdg": null,
   "gp_current": 0,
   "rank": null,
   "of": 4,
   "weight": null,
   "basis": null,
   "totals": {
    "w": 0,
    "d": 0,
    "l": 0,
    "gf": 0,
    "ga": 0,
    "gd": 0,
    "pts": 0
   }
  }
 },
 "refusal": {
  "reason": "no_national_rating",
  "case": "no_national_rating",
  "why": "a national-team fixture that the national-team field cannot place: either no field is served on this build, or one of the two teams has no overall row in it. There is no ordering to place the two teams in and nothing to take a favourite from. Each team's OWN record in this competition is reported under `sides`; nothing compares them.",
  "carries": [
   "sides"
  ],
  "absent": {
   "this_season": "a national team has no season table; its own record in this competition is under `sides`",
   "admission": "there is no blend and no admission gate here",
   "opponent_row": "this refusal is of the pairing, not of one team; both teams are under `sides`"
  },
  "withheld": "every figure that compares the two clubs — the ppg, GD/g and rank gaps, the favourite, the tiers, the shape and the venue-aware annotation. The comparison is what was refused, and `case` beside this says which rule refused it: either this club has no row in the ordering the other club's rank and tier are positions in, or each club has a row in an ordering the other is not in and the two orderings have never been measured against one another.",
  "detail": {
   "no_national_rating": "the field has no overall row for Georgia or Northern Ireland"
  }
 },
 "event_id": "401861049",
 "competition_id": "401861049",
 "kickoff": "2026-09-25T16:00Z",
 "espn": "uefa.nations",
 "state": "pre",
 "in_play": false,
 "venue": {
  "city": "Tbilisi",
  "country": "Georgia",
  "name": "Boris Paichadze Dinamo Arena"
 },
 "venue_class": {
  "class": "TRUE_HOME",
  "home_side": "home"
 },
 "kalshi": {
  "ask_c": 53,
  "ask_size": 12601,
  "bid_c": 52,
  "bid_size": 1000,
  "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
  "flags": [],
  "spread_c": 1,
  "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO",
  "side": "Georgia"
 },
 "form": {
  "home": "LDWDW",
  "away": "WLDWL",
  "scope": "all senior internationals, friendlies marked",
  "scope_is_cup": false
 },
 "national": {
  "competition": "unl",
  "group": "Group B2",
  "head_to_head": {
   "available": true,
   "meetings": [
    {
     "away": "Georgia",
     "away_score": 1,
     "completed": true,
     "date": "2008-03-26T19:45:00Z",
     "event_id": "236855",
     "home": "Northern Ireland",
     "home_score": 4,
     "winner": "away",
     "winner_means": "this fixture's home/away sides"
    }
   ],
   "reason": null,
   "source": "seasonseries",
   "tally": {
    "away": 1,
    "draw": 0,
    "home": 0
   }
  },
  "leg": null,
  "lineups": {
   "announced": false,
   "reason": "ESPN's summary carries no starting XI for this fixture yet; XIs are published around kickoff",
   "sides": {
    "away": {
     "announced": false,
     "bench": 0,
     "formation": null,
     "starters": [],
     "team": "Northern Ireland"
    },
    "home": {
     "announced": false,
     "bench": 0,
     "formation": null,
     "starters": [],
     "team": "Georgia"
    }
   }
  },
  "market": {
   "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
   "legs": {
    "away": {
     "ask_c": 22,
     "ask_size": 13685,
     "bid_c": 20,
     "bid_size": 6388,
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "flags": [],
     "name": "Northern Ireland",
     "spread_c": 2,
     "ticker": "KXUEFANLGAME-26SEP25GEONIR-NIR"
    },
    "home": {
     "ask_c": 53,
     "ask_size": 12601,
     "bid_c": 52,
     "bid_size": 1000,
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "flags": [],
     "name": "Georgia",
     "spread_c": 1,
     "ticker": "KXUEFANLGAME-26SEP25GEONIR-GEO"
    },
    "tie": {
     "ask_c": 27,
     "ask_size": 88,
     "bid_c": 26,
     "bid_size": 7720,
     "event_ticker": "KXUEFANLGAME-26SEP25GEONIR",
     "flags": [
      "THIN"
     ],
     "spread_c": 1,
     "ticker": "KXUEFANLGAME-26SEP25GEONIR-TIE"
    }
   },
   "orientation": "same",
   "status": "mapped",
   "status_words": "one open Kalshi event names both teams on this date",
   "title": "Georgia vs Northern Ireland"
  },
  "neutral": false,
  "neutral_provider_flag": false,
  "stage": "group-stage",
  "stage_kind": "group",
  "status_detail": "Fri, September 25th at 12:00 PM EDT",
  "teams": {
   "home": {
    "espn_id": "584",
    "form": {
     "available": true,
     "friendlies": 4,
     "games": [
      {
       "competition": "FIFA World Cup Qualifying - UEFA",
       "date": "2025-11-18T19:45Z",
       "event_id": "724916",
       "ga": 2,
       "gf": 1,
       "kind": "competitive",
       "letter": "L",
       "opponent": "Bulgaria",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-26T17:00Z",
       "event_id": "763032",
       "ga": 2,
       "gf": 2,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Israel",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-29T13:00Z",
       "event_id": "763033",
       "ga": 0,
       "gf": 2,
       "kind": "friendly",
       "letter": "W",
       "opponent": "Lithuania",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-02T17:00Z",
       "event_id": "401865145",
       "ga": 1,
       "gf": 1,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Romania",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-05T16:00Z",
       "event_id": "401870001",
       "ga": 0,
       "gf": 2,
       "kind": "friendly",
       "letter": "W",
       "opponent": "Bahrain",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      }
     ],
     "letters": "LDWDW",
     "provider_disagreements": 0,
     "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
    },
    "key": "georgia",
    "name": "Georgia",
    "rating": {
     "available": false,
     "reason": "the field has no overall row for Georgia or Northern Ireland"
    }
   },
   "away": {
    "espn_id": "586",
    "form": {
     "available": true,
     "friendlies": 3,
     "games": [
      {
       "competition": "FIFA World Cup Qualifying - UEFA",
       "date": "2025-11-17T19:45Z",
       "event_id": "724910",
       "ga": 0,
       "gf": 1,
       "kind": "competitive",
       "letter": "W",
       "opponent": "Luxembourg",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      },
      {
       "competition": "FIFA World Cup Qualifying - UEFA",
       "date": "2026-03-26T19:45Z",
       "event_id": "761380",
       "ga": 2,
       "gf": 0,
       "kind": "competitive",
       "letter": "L",
       "opponent": "Italy",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-03-31T18:45Z",
       "event_id": "401866761",
       "ga": 1,
       "gf": 1,
       "kind": "friendly",
       "letter": "D",
       "opponent": "Wales",
       "provider_agrees": true,
       "provider_letter": "D",
       "venue": "away"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-04T16:00Z",
       "event_id": "401871360",
       "ga": 0,
       "gf": 1,
       "kind": "friendly",
       "letter": "W",
       "opponent": "Guinea",
       "provider_agrees": true,
       "provider_letter": "W",
       "venue": "home"
      },
      {
       "competition": "International Friendly",
       "date": "2026-06-08T19:10Z",
       "event_id": "401869804",
       "ga": 3,
       "gf": 1,
       "kind": "friendly",
       "letter": "L",
       "opponent": "France",
       "provider_agrees": true,
       "provider_letter": "L",
       "venue": "away"
      }
     ],
     "letters": "WLDWL",
     "provider_disagreements": 0,
     "source": "espn summary lastFiveGames (all senior internationals, friendlies marked)"
    },
    "key": "northern-ireland",
    "name": "Northern Ireland",
    "rating": {
     "available": false,
     "reason": "the field has no overall row for Georgia or Northern Ireland"
    }
   }
  },
  "venue_country": "Georgia"
 }
} as const;

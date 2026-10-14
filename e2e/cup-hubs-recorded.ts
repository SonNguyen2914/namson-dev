/* TWO CUP MATCH HUB PAYLOADS, RECORDED (2026-10-13) — the backend's own
 * route answer, not a brief. `GET /api/comp/ucl/match/401915417` (Arsenal v
 * Lille, a Champions League cross-league tie, before kickoff) and
 * `GET /api/comp/eflcup/match/401921835` (Fleetwood Town v Arsenal, an EFL
 * Cup cross-tier tie), served by TRIVELA branch cup-hubs through its
 * TestClient over the recordings in tests/fixtures/cup_hubs/ — every ESPN
 * and Kalshi answer read live on 2026-10-13, replayed strictly. Stored
 * byte for byte. The trader's model store is not reachable locally, so
 * `traders_model` reads `plane_not_ready` — a named absence. */
export const UCL_HUB_EVENT = "401915417";
export const EFL_HUB_EVENT = "401921835";

export const UCL_HUB_PAYLOAD = {
 "competition": "ucl",
 "display": "Champions League",
 "espn_league": "uefa.champions",
 "match": {
  "id": "401915417",
  "date": "2026-10-13T19:00Z",
  "state": "pre",
  "detail": "10/13 - 3:00 PM EDT",
  "minute": null,
  "venue": "Emirates Stadium",
  "home": {
   "name": "Arsenal",
   "abbrev": "ARS",
   "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
   "score": null,
   "color": "e20520",
   "alt_color": "003399"
  },
  "away": {
   "name": "Lille",
   "abbrev": "LILL",
   "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/166.png",
   "score": null,
   "color": "c2051b",
   "alt_color": "e2d3d7"
  },
  "stats": [],
  "events": [],
  "scouting": {
   "last_five": [
    {
     "team": "Arsenal",
     "abbrev": "ARS",
     "form": "W W W L W",
     "games": [
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 1,
       "opponent_score": 0,
       "score": "1-0",
       "at_vs": "@",
       "opponent": "NAP",
       "date": "2026-09-09T19:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 2,
       "opponent_score": 0,
       "score": "2-0",
       "at_vs": "@",
       "opponent": "SUN",
       "date": "2026-09-12T19:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 4,
       "opponent_score": 2,
       "score": "4-2",
       "at_vs": "@",
       "opponent": "IPS",
       "date": "2026-09-15T19:00Z"
      },
      {
       "result": "L",
       "provider_result": "L",
       "team_score": 0,
       "opponent_score": 3,
       "score": "3-0",
       "at_vs": "@",
       "opponent": "BHA",
       "date": "2026-09-19T14:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 2,
       "opponent_score": 1,
       "score": "2-1",
       "at_vs": "vs",
       "opponent": "LEE",
       "date": "2026-10-10T11:30Z"
      }
     ]
    },
    {
     "team": "Lille",
     "abbrev": "LILL",
     "form": "L W L W W",
     "games": [
      {
       "result": "L",
       "provider_result": "L",
       "team_score": 2,
       "opponent_score": 3,
       "score": "3-2",
       "at_vs": "vs",
       "opponent": "BET",
       "date": "2026-09-08T19:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 2,
       "opponent_score": 0,
       "score": "2-0",
       "at_vs": "vs",
       "opponent": "TRY",
       "date": "2026-09-13T13:00Z"
      },
      {
       "result": "L",
       "provider_result": "L",
       "team_score": 1,
       "opponent_score": 2,
       "score": "2-1",
       "at_vs": "@",
       "opponent": "NICE",
       "date": "2026-09-20T15:15Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 2,
       "opponent_score": 1,
       "score": "2-1",
       "at_vs": "vs",
       "opponent": "ZUL",
       "date": "2026-10-02T12:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 1,
       "opponent_score": 0,
       "score": "1-0",
       "at_vs": "vs",
       "opponent": "HAC",
       "date": "2026-10-10T15:15Z"
      }
     ]
    }
   ],
   "head_to_head": []
  },
  "round": "Group A",
  "shootout": null,
  "neutral_site": false
 },
 "book": {
  "key": "winner",
  "label": "Winner · 3-way",
  "event_ticker": "KXUCLGAME-26OCT13ARSLIL",
  "title": "Arsenal vs Lille",
  "markets": [
   {
    "ticker": "KXUCLGAME-26OCT13ARSLIL-ARS",
    "label": "Arsenal",
    "yes_ask": "0.8200",
    "yes_bid": "0.8100",
    "status": "active",
    "model_key": null
   },
   {
    "ticker": "KXUCLGAME-26OCT13ARSLIL-LIL",
    "label": "Lille",
    "yes_ask": "0.0600",
    "yes_bid": "0.0500",
    "status": "active",
    "model_key": null
   },
   {
    "ticker": "KXUCLGAME-26OCT13ARSLIL-TIE",
    "label": "Tie",
    "yes_ask": "0.1400",
    "yes_bid": "0.1300",
    "status": "active",
    "model_key": null
   }
  ]
 },
 "books": [
  {
   "key": "winner",
   "label": "Winner · 3-way",
   "event_ticker": "KXUCLGAME-26OCT13ARSLIL",
   "title": "Arsenal vs Lille",
   "markets": [
    {
     "ticker": "KXUCLGAME-26OCT13ARSLIL-ARS",
     "label": "Arsenal",
     "yes_ask": "0.8200",
     "yes_bid": "0.8100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLGAME-26OCT13ARSLIL-LIL",
     "label": "Lille",
     "yes_ask": "0.0600",
     "yes_bid": "0.0500",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLGAME-26OCT13ARSLIL-TIE",
     "label": "Tie",
     "yes_ask": "0.1400",
     "yes_bid": "0.1300",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "total",
   "label": "Total goals",
   "event_ticker": "KXUCLTOTAL-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Total Goals",
   "markets": [
    {
     "ticker": "KXUCLTOTAL-26OCT13ARSLIL-1",
     "label": "Over 0.5 goals scored",
     "yes_ask": "0.9700",
     "yes_bid": "0.9600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTOTAL-26OCT13ARSLIL-2",
     "label": "Over 1.5 goals scored",
     "yes_ask": "0.8600",
     "yes_bid": "0.8500",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTOTAL-26OCT13ARSLIL-3",
     "label": "Over 2.5 goals scored",
     "yes_ask": "0.6600",
     "yes_bid": "0.6500",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTOTAL-26OCT13ARSLIL-4",
     "label": "Over 3.5 goals scored",
     "yes_ask": "0.4300",
     "yes_bid": "0.4200",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTOTAL-26OCT13ARSLIL-5",
     "label": "Over 4.5 goals scored",
     "yes_ask": "0.2400",
     "yes_bid": "0.2300",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTOTAL-26OCT13ARSLIL-6",
     "label": "Over 5.5 goals scored",
     "yes_ask": "0.1100",
     "yes_bid": "0.1000",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "btts",
   "label": "Both teams to score",
   "event_ticker": "KXUCLBTTS-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: BTTS",
   "markets": [
    {
     "ticker": "KXUCLBTTS-26OCT13ARSLIL-BTTS",
     "label": "Both Teams To Score",
     "yes_ask": "0.4400",
     "yes_bid": "0.4300",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "spread",
   "label": "Spread",
   "event_ticker": "KXUCLSPREAD-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Spread",
   "markets": [
    {
     "ticker": "KXUCLSPREAD-26OCT13ARSLIL-ARS3",
     "label": "Arsenal wins by more than 2.5 goals",
     "yes_ask": "0.3800",
     "yes_bid": "0.3700",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSPREAD-26OCT13ARSLIL-ARS2",
     "label": "Arsenal wins by more than 1.5 goals",
     "yes_ask": "0.6200",
     "yes_bid": "0.6100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSPREAD-26OCT13ARSLIL-LIL2",
     "label": "Lille wins by more than 1.5 goals",
     "yes_ask": "0.0200",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSPREAD-26OCT13ARSLIL-LIL3",
     "label": "Lille wins by more than 2.5 goals",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "team_total",
   "label": "Team totals",
   "event_ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Team Total",
   "markets": [
    {
     "ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL-ARS1",
     "label": "Arsenal over 0.5 goals",
     "yes_ask": "0.9500",
     "yes_bid": "0.9400",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL-ARS2",
     "label": "Arsenal over 1.5 goals",
     "yes_ask": "0.7700",
     "yes_bid": "0.7600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL-ARS3",
     "label": "Arsenal over 2.5 goals",
     "yes_ask": "0.5100",
     "yes_bid": "0.5000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL-LIL1",
     "label": "Lille over 0.5 goals",
     "yes_ask": "0.4600",
     "yes_bid": "0.4500",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL-LIL2",
     "label": "Lille over 1.5 goals",
     "yes_ask": "0.1200",
     "yes_bid": "0.1100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL-LIL3",
     "label": "Lille over 2.5 goals",
     "yes_ask": "0.0300",
     "yes_bid": "0.0200",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "score",
   "label": "Correct score",
   "event_ticker": "KXUCLSCORE-26OCT13ARSLIL",
   "title": "Arsenal FC vs Lille OSC: Correct Score",
   "markets": [
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS0LIL0",
     "label": "Draw 0-0",
     "yes_ask": "0.0400",
     "yes_bid": "0.0300",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS0LIL1",
     "label": "Lille OSC wins 1-0",
     "yes_ask": "0.0300",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS0LIL2",
     "label": "Lille OSC wins 2-0",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS0LIL3",
     "label": "Lille OSC wins 3-0",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS1LIL0",
     "label": "Arsenal FC wins 1-0",
     "yes_ask": "0.1000",
     "yes_bid": "0.0800",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS1LIL1",
     "label": "Draw 1-1",
     "yes_ask": "0.0700",
     "yes_bid": "0.0600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS1LIL2",
     "label": "Lille OSC wins 2-1",
     "yes_ask": "0.0200",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS1LIL3",
     "label": "Lille OSC wins 3-1",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS2LIL0",
     "label": "Arsenal FC wins 2-0",
     "yes_ask": "0.1300",
     "yes_bid": "0.1200",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS2LIL1",
     "label": "Arsenal FC wins 2-1",
     "yes_ask": "0.0900",
     "yes_bid": "0.0800",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS2LIL2",
     "label": "Draw 2-2",
     "yes_ask": "0.0300",
     "yes_bid": "0.0200",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS2LIL3",
     "label": "Lille OSC wins 3-2",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS3LIL0",
     "label": "Arsenal FC wins 3-0",
     "yes_ask": "0.1200",
     "yes_bid": "0.1100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS3LIL1",
     "label": "Arsenal FC wins 3-1",
     "yes_ask": "0.0800",
     "yes_bid": "0.0700",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS3LIL2",
     "label": "Arsenal FC wins 3-2",
     "yes_ask": "0.0300",
     "yes_bid": "0.0200",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS3LIL3",
     "label": "Draw 3-3",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS4LIL0",
     "label": "Arsenal FC wins 4-0",
     "yes_ask": "0.0900",
     "yes_bid": "0.0600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS4LIL1",
     "label": "Arsenal FC wins 4-1",
     "yes_ask": "0.0500",
     "yes_bid": "0.0400",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS4LIL2",
     "label": "Arsenal FC wins 4-2",
     "yes_ask": "0.0200",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS4LIL3",
     "label": "Arsenal FC wins 4-3",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS5LIL0",
     "label": "Arsenal FC wins 5-0",
     "yes_ask": "0.0500",
     "yes_bid": "0.0300",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS5LIL1",
     "label": "Arsenal FC wins 5-1",
     "yes_ask": "0.0300",
     "yes_bid": "0.0200",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS5LIL2",
     "label": "Arsenal FC wins 5-2",
     "yes_ask": "0.0200",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS6LIL0",
     "label": "Arsenal FC wins 6-0",
     "yes_ask": "0.0200",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS6LIL1",
     "label": "Arsenal FC wins 6-1",
     "yes_ask": "0.0200",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS6LIL2",
     "label": "Arsenal FC wins 6-2",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS7LIL0",
     "label": "Arsenal FC wins 7-0",
     "yes_ask": "0.0200",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLSCORE-26OCT13ARSLIL-ARS7LIL1",
     "label": "Arsenal FC wins 7-1",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "ftts",
   "label": "First team to score",
   "event_ticker": "KXUCLFTTS-26OCT13ARSLIL",
   "title": "Arsenal FC vs Lille OSC: First Team to Score",
   "markets": [
    {
     "ticker": "KXUCLFTTS-26OCT13ARSLIL-ARS",
     "label": "Arsenal FC",
     "yes_ask": "0.8200",
     "yes_bid": "0.8100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLFTTS-26OCT13ARSLIL-LIL",
     "label": "Lille OSC",
     "yes_ask": "0.1500",
     "yes_bid": "0.1400",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLFTTS-26OCT13ARSLIL-NONE",
     "label": "No Goal",
     "yes_ask": "0.0300",
     "yes_bid": "0.0200",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h1",
   "label": "1st half · winner",
   "event_ticker": "KXUCL1H-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: First Half Winner",
   "markets": [
    {
     "ticker": "KXUCL1H-26OCT13ARSLIL-ARS",
     "label": "Arsenal wins 1st Half",
     "yes_ask": "0.6200",
     "yes_bid": "0.6100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1H-26OCT13ARSLIL-LIL",
     "label": "Lille wins 1st Half",
     "yes_ask": "0.0800",
     "yes_bid": "0.0700",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1H-26OCT13ARSLIL-TIE",
     "label": "Tie 1st Half",
     "yes_ask": "0.3100",
     "yes_bid": "0.3000",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h1_total",
   "label": "1st half · total",
   "event_ticker": "KXUCL1HTOTAL-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: First Half Total",
   "markets": [
    {
     "ticker": "KXUCL1HTOTAL-26OCT13ARSLIL-1",
     "label": "Over 0.5 1H goals scored",
     "yes_ask": "0.7900",
     "yes_bid": "0.7700",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HTOTAL-26OCT13ARSLIL-2",
     "label": "Over 1.5 1H goals scored",
     "yes_ask": "0.4400",
     "yes_bid": "0.4300",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HTOTAL-26OCT13ARSLIL-3",
     "label": "Over 2.5 1H goals scored",
     "yes_ask": "0.1900",
     "yes_bid": "0.1700",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h1_spread",
   "label": "1st half · spread",
   "event_ticker": "KXUCL1HSPREAD-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: First Half Spread",
   "markets": [
    {
     "ticker": "KXUCL1HSPREAD-26OCT13ARSLIL-ARS2",
     "label": "Arsenal wins the 1H by more than 1.5 goals",
     "yes_ask": "0.2900",
     "yes_bid": "0.2700",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSPREAD-26OCT13ARSLIL-LIL2",
     "label": "Lille wins the 1H by more than 1.5 goals",
     "yes_ask": "0.0200",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h1_btts",
   "label": "1st half · BTTS",
   "event_ticker": "KXUCL1HBTTS-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: First Half BTTS",
   "markets": [
    {
     "ticker": "KXUCL1HBTTS-26OCT13ARSLIL-BTTS",
     "label": "1st Half: Both Teams To Score",
     "yes_ask": "0.1600",
     "yes_bid": "0.1500",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h1_score",
   "label": "1st half · correct score",
   "event_ticker": "KXUCL1HSCORE-26OCT13ARSLIL",
   "title": "Arsenal FC vs Lille OSC: 1st Half Correct Score",
   "markets": [
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS0LIL0",
     "label": "Draw 1H 0-0",
     "yes_ask": "0.2300",
     "yes_bid": "0.2000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS0LIL1",
     "label": "Lille OSC wins 1H 1-0",
     "yes_ask": "0.0700",
     "yes_bid": "0.0400",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS0LIL2",
     "label": "Lille OSC wins 1H 2-0",
     "yes_ask": "0.0200",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS1LIL0",
     "label": "Arsenal FC wins 1H 1-0",
     "yes_ask": "0.2900",
     "yes_bid": "0.2600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS1LIL1",
     "label": "Draw 1H 1-1",
     "yes_ask": "0.0800",
     "yes_bid": "0.0600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS1LIL2",
     "label": "Lille OSC wins 1H 2-1",
     "yes_ask": "0.0200",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS2LIL0",
     "label": "Arsenal FC wins 1H 2-0",
     "yes_ask": "0.1700",
     "yes_bid": "0.1600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS2LIL1",
     "label": "Arsenal FC wins 1H 2-1",
     "yes_ask": "0.0500",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS2LIL2",
     "label": "Draw 1H 2-2",
     "yes_ask": "0.0200",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS3LIL0",
     "label": "Arsenal FC wins 1H 3-0",
     "yes_ask": "0.0700",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS3LIL1",
     "label": "Arsenal FC wins 1H 3-1",
     "yes_ask": "0.0200",
     "yes_bid": "0.0100",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL1HSCORE-26OCT13ARSLIL-ARS3LIL2",
     "label": "Arsenal FC wins 1H 3-2",
     "yes_ask": "0.0100",
     "yes_bid": "0.0000",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h2",
   "label": "2nd half · winner",
   "event_ticker": "KXUCL2H-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Second Half Winner",
   "markets": [
    {
     "ticker": "KXUCL2H-26OCT13ARSLIL-ARS",
     "label": "Arsenal wins 2nd Half",
     "yes_ask": "0.6800",
     "yes_bid": "0.6500",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL2H-26OCT13ARSLIL-LIL",
     "label": "Lille wins 2nd Half",
     "yes_ask": "0.0900",
     "yes_bid": "0.0600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL2H-26OCT13ARSLIL-TIE",
     "label": "Tie 2nd Half",
     "yes_ask": "0.2600",
     "yes_bid": "0.2100",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h2_total",
   "label": "2nd half · total",
   "event_ticker": "KXUCL2HTOTAL-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Second Half Total",
   "markets": [
    {
     "ticker": "KXUCL2HTOTAL-26OCT13ARSLIL-1",
     "label": "Over 0.5 2H goals scored",
     "yes_ask": "0.8800",
     "yes_bid": "0.8000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL2HTOTAL-26OCT13ARSLIL-2",
     "label": "Over 1.5 2H goals scored",
     "yes_ask": "0.5900",
     "yes_bid": "0.5000",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL2HTOTAL-26OCT13ARSLIL-3",
     "label": "Over 2.5 2H goals scored",
     "yes_ask": "0.3100",
     "yes_bid": "0.2400",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h2_spread",
   "label": "2nd half · spread",
   "event_ticker": "KXUCL2HSPREAD-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Second Half Spread",
   "markets": [
    {
     "ticker": "KXUCL2HSPREAD-26OCT13ARSLIL-ARS2",
     "label": "Arsenal wins the 2H by more than 1.5 goals",
     "yes_ask": "0.4100",
     "yes_bid": "0.0500",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCL2HSPREAD-26OCT13ARSLIL-LIL2",
     "label": "Lille wins the 2H by more than 1.5 goals",
     "yes_ask": "0.4600",
     "yes_bid": "0.0600",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "h2_btts",
   "label": "2nd half · BTTS",
   "event_ticker": "KXUCL2HBTTS-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Second Half BTTS",
   "markets": [
    {
     "ticker": "KXUCL2HBTTS-26OCT13ARSLIL-BTTS",
     "label": "2nd Half: Both Teams To Score",
     "yes_ask": "0.2100",
     "yes_bid": "0.2000",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "corners",
   "label": "Total corners",
   "event_ticker": "KXUCLCORNERS-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Total Corners",
   "markets": [
    {
     "ticker": "KXUCLCORNERS-26OCT13ARSLIL-7",
     "label": "7+ corners",
     "yes_ask": "0.8300",
     "yes_bid": "0.7600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLCORNERS-26OCT13ARSLIL-8",
     "label": "8+ corners",
     "yes_ask": "0.7200",
     "yes_bid": "0.6600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLCORNERS-26OCT13ARSLIL-9",
     "label": "9+ corners",
     "yes_ask": "0.5800",
     "yes_bid": "0.5700",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLCORNERS-26OCT13ARSLIL-10",
     "label": "10+ corners",
     "yes_ask": "0.4400",
     "yes_bid": "0.4300",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLCORNERS-26OCT13ARSLIL-11",
     "label": "11+ corners",
     "yes_ask": "0.3400",
     "yes_bid": "0.3100",
     "status": "active",
     "model_key": null
    }
   ]
  },
  {
   "key": "team_corners",
   "label": "Team corners",
   "event_ticker": "KXUCLTCORNERS-26OCT13ARSLIL",
   "title": "Arsenal vs Lille: Team Corners",
   "markets": [
    {
     "ticker": "KXUCLTCORNERS-26OCT13ARSLIL-ARS7",
     "label": "Arsenal: 7+",
     "yes_ask": "0.4700",
     "yes_bid": "0.4600",
     "status": "active",
     "model_key": null
    },
    {
     "ticker": "KXUCLTCORNERS-26OCT13ARSLIL-LIL3",
     "label": "Lille: 3+",
     "yes_ask": "0.5200",
     "yes_bid": "0.5100",
     "status": "active",
     "model_key": null
    }
   ]
  }
 ],
 "book_meta": {
  "series": "KXUCLGAME",
  "tradeable_events": 36,
  "max_age_seconds": 300.0,
  "observed_at": null,
  "age_means": "the viewer market cache publishes no store clock, so the exact age of these prices is UNKNOWN — bounded by max_age_seconds, never assumed to be zero",
  "status": "ok",
  "event_ticker": "KXUCLGAME-26OCT13ARSLIL",
  "families_read": 18,
  "settles_on": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
  "means": "the winner event was bridged by this page's own rule; each other family Kalshi lists for this competition was joined to it by the event's ticker suffix (17 of 21 asked families carry this match — see `families`). A display, not a claim.",
  "truncated": true,
  "families": {
   "total": {
    "series": "KXUCLTOTAL",
    "status": "ok",
    "event_ticker": "KXUCLTOTAL-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "btts": {
    "series": "KXUCLBTTS",
    "status": "ok",
    "event_ticker": "KXUCLBTTS-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "spread": {
    "series": "KXUCLSPREAD",
    "status": "ok",
    "event_ticker": "KXUCLSPREAD-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "team_total": {
    "series": "KXUCLTEAMTOTAL",
    "status": "ok",
    "event_ticker": "KXUCLTEAMTOTAL-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "score": {
    "series": "KXUCLSCORE",
    "status": "ok",
    "event_ticker": "KXUCLSCORE-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "ftts": {
    "series": "KXUCLFTTS",
    "status": "ok",
    "event_ticker": "KXUCLFTTS-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "mov": {
    "series": "KXUCLMOV",
    "status": "not_listed_for_fixture",
    "means": "the series' COMPLETE listing holds no tradeable event with this match's suffix — not yet listed, or settled and gone; NOT a claim it never priced"
   },
   "h1": {
    "series": "KXUCL1H",
    "status": "ok",
    "event_ticker": "KXUCL1H-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h1_total": {
    "series": "KXUCL1HTOTAL",
    "status": "ok",
    "event_ticker": "KXUCL1HTOTAL-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h1_spread": {
    "series": "KXUCL1HSPREAD",
    "status": "ok",
    "event_ticker": "KXUCL1HSPREAD-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h1_btts": {
    "series": "KXUCL1HBTTS",
    "status": "ok",
    "event_ticker": "KXUCL1HBTTS-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h1_score": {
    "series": "KXUCL1HSCORE",
    "status": "ok",
    "event_ticker": "KXUCL1HSCORE-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h2": {
    "series": "KXUCL2H",
    "status": "ok",
    "event_ticker": "KXUCL2H-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h2_total": {
    "series": "KXUCL2HTOTAL",
    "status": "ok",
    "event_ticker": "KXUCL2HTOTAL-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h2_spread": {
    "series": "KXUCL2HSPREAD",
    "status": "ok",
    "event_ticker": "KXUCL2HSPREAD-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "h2_btts": {
    "series": "KXUCL2HBTTS",
    "status": "ok",
    "event_ticker": "KXUCL2HBTTS-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "first_goal": {
    "series": "KXUCLFIRSTGOAL",
    "status": "not_listed_for_fixture",
    "means": "the series' COMPLETE listing holds no tradeable event with this match's suffix — not yet listed, or settled and gone; NOT a claim it never priced"
   },
   "goal": {
    "series": "KXUCLGOAL",
    "status": "not_listed_for_fixture",
    "means": "the series' COMPLETE listing holds no tradeable event with this match's suffix — not yet listed, or settled and gone; NOT a claim it never priced"
   },
   "corners": {
    "series": "KXUCLCORNERS",
    "status": "ok",
    "event_ticker": "KXUCLCORNERS-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "team_corners": {
    "series": "KXUCLTCORNERS",
    "status": "ok",
    "event_ticker": "KXUCLTCORNERS-26OCT13ARSLIL",
    "means": "one event on this family's series carries the winner's suffix"
   },
   "advance": {
    "series": "KXUCLADVANCE",
    "status": "not_listed_for_fixture",
    "means": "the series' COMPLETE listing holds no tradeable event with this match's suffix — not yet listed, or settled and gone; NOT a claim it never priced"
   }
  },
  "other_series": [],
  "winner_means": "one Kalshi event matched both clubs inside the settlement window. Only the configured GAME series is read on this surface — other families may exist on the exchange and are not consulted here"
 },
 "model": null,
 "model_refusal": {
  "state": "cup_model_paper_only",
  "why": "no shadow model is fitted for this competition. The trader's CUP model (unified-cups-nb-v1) passed its pre-registered test for the continental (Champions League, Europa League, Conference League, Club World Cup) pool (PASS_NOT_WORSE, research_archive/unified_cups_2026-10-12) and prices this tie ON PAPER ONLY: its read is the trader's model line (`traders_model`), experimental and unproven, and no real money rides on it. The board's own pre-kickoff read, when one was frozen, is under `board_read` — a read, not a signal.",
  "instead": "traders_model",
  "pool": "continental",
  "verdict": "PASS_NOT_WORSE",
  "paper_only": true,
  "note": null
 },
 "board_read": {
  "origin": "unavailable",
  "origin_label": "NOT AVAILABLE",
  "origin_note": "no pre-kickoff board read was frozen for this fixture. The board freezes a fixture only when its column is assembled while the fixture is upcoming; this page reads that record and never assembles a board or rebuilds a read itself",
  "unavailable_reason": "not_frozen",
  "store_read": "ok",
  "store_read_error": null,
  "source": "board_snapshot",
  "captured_at": null,
  "captured_seconds_before_kickoff": null,
  "captured_lead_band": null,
  "captured_lead_band_means": null,
  "superseded": [],
  "corrections": 0,
  "board_date": null,
  "reconstructed_from": null,
  "state": null,
  "archive_read": "archive_not_configured"
 },
 "lineups": {
  "home": {
   "formation": null,
   "confirmed": false,
   "released": false,
   "starters": [],
   "bench": [],
   "goalkeeper": null,
   "key_absences": null,
   "key_absences_reason": "no player-strength feed for ucl — absences are computed only for mls-2026"
  },
  "away": {
   "formation": null,
   "confirmed": false,
   "released": false,
   "starters": [],
   "bench": [],
   "goalkeeper": null,
   "key_absences": null,
   "key_absences_reason": "no player-strength feed for ucl — absences are computed only for mls-2026"
  },
  "strength_available": false
 },
 "venue_class": {
  "class": "UNKNOWN",
  "home_side": null,
  "basis": "unresolved",
  "venue": {
   "name": "Emirates Stadium",
   "city": "London",
   "country": "England"
  },
  "rule": null,
  "neutral_site_flag_read": false,
  "unresolved_why": "not_classified_here: a cup tie's ground is classified from each side's own league, which the match summary does not carry, so this page does not classify it — UNKNOWN, never a home ground. The board's frozen pre-kickoff read, when one exists, carries the class the board computed"
 },
 "framing": "Live match stats from ESPN and real Kalshi prices. No model runs for this competition. Shadow · not advice — a read, not a signal.",
 "generated_at": "2026-10-13T20:49:44.725583+00:00",
 "traders_model": {
  "title": "trader's model (untested)",
  "tested": false,
  "available": false,
  "means": "What the trading agent prices this cup tie from: the CUP model (unified-cups-nb-v1, src/trading/unified_cups.py), read through the same function the trader calls. EXPERIMENTAL, UNPROVEN and PAPER ONLY: its pool passed a pre-registered replay of history, which is not a forecast of profit, and no cup is in the money pass-set.",
  "label": "experimental, unproven — cups: paper only",
  "paper_only": true,
  "source": "unified_cups",
  "model": "unified-cups-nb-v1",
  "why": "plane_not_ready"
 },
 "cup": {
  "group": "continental",
  "one_match": false,
  "members": [
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
  "settles_on": "REGULATION TIME ONLY. Kalshi's KXUCLGAME settles on 90 minutes plus stoppage and explicitly excludes extra time and penalties (the series' own contract note, read 2026-09-08). In the LEAGUE PHASE that is the whole match — a level tie is a draw and the Tie leg is the real result — but a KNOCKOUT leg can carry on after the market has settled, so from February \"Tie 24c\" is the price of level after 90, NOT of the tie being unresolved and NOT of going out. UNVERIFIED FOR THE KNOCKOUT ROUNDS: every KXUCLGAME market listed on 2026-09-08 is a league-phase fixture (18 events, 26SEP08-26SEP10), so whether Kalshi lists knockout legs under this same series and this same rule has not been observed and is not claimed here.",
  "cross_note": "CROSS-LEAGUE FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different domestic leagues, and 1.9 ppg in the Eredivisie is not 1.9 ppg in the Premier League: subtracting them would invent a gap that was never measured. In this competition that is not the edge case, it is EVERY case — UEFA's league-phase draw forbids two clubs of the same association from meeting, and all 108 league-phase fixtures of 2026-27 pair two different leagues (counted 2026-09-08, zero same-league ties). The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a Serie A T1 and a Bundesliga T1 each mean \"best fifth of its own league\", which is the one comparison two tables built on different populations can actually support."
 }
} as const;

export const EFL_HUB_PAYLOAD = {
 "competition": "eflcup",
 "display": "EFL Cup",
 "espn_league": "eng.league_cup",
 "match": {
  "id": "401921835",
  "date": "2026-10-27T20:00Z",
  "state": "pre",
  "detail": "10/27 - 4:00 PM EDT",
  "minute": null,
  "venue": "Highbury Stadium",
  "home": {
   "name": "Fleetwood Town",
   "abbrev": "FLE",
   "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/3891.png",
   "score": null,
   "color": "C8142F",
   "alt_color": "ffff00"
  },
  "away": {
   "name": "Arsenal",
   "abbrev": "ARS",
   "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
   "score": null,
   "color": "e20520",
   "alt_color": "003399"
  },
  "stats": [],
  "events": [],
  "scouting": {
   "last_five": [
    {
     "team": "Fleetwood Town",
     "abbrev": "FLE",
     "form": "L L L W D",
     "games": [
      {
       "result": "L",
       "provider_result": "L",
       "team_score": 0,
       "opponent_score": 1,
       "score": "1-0",
       "at_vs": "@",
       "opponent": "OLD",
       "date": "2026-09-22T18:00Z"
      },
      {
       "result": "L",
       "provider_result": "L",
       "team_score": 1,
       "opponent_score": 2,
       "score": "2-1",
       "at_vs": "vs",
       "opponent": "RCH",
       "date": "2026-09-26T14:00Z"
      },
      {
       "result": "L",
       "provider_result": "L",
       "team_score": 0,
       "opponent_score": 1,
       "score": "1-0",
       "at_vs": "@",
       "opponent": "SAL",
       "date": "2026-10-03T14:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 4,
       "opponent_score": 1,
       "score": "4-1",
       "at_vs": "vs",
       "opponent": "BAR",
       "date": "2026-10-06T18:00Z"
      },
      {
       "result": "D",
       "provider_result": "D",
       "team_score": 1,
       "opponent_score": 1,
       "score": "1-1",
       "at_vs": "vs",
       "opponent": "WAL",
       "date": "2026-10-10T14:00Z"
      }
     ]
    },
    {
     "team": "Arsenal",
     "abbrev": "ARS",
     "form": "W W W L W",
     "games": [
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 1,
       "opponent_score": 0,
       "score": "1-0",
       "at_vs": "@",
       "opponent": "NAP",
       "date": "2026-09-09T19:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 2,
       "opponent_score": 0,
       "score": "2-0",
       "at_vs": "@",
       "opponent": "SUN",
       "date": "2026-09-12T19:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 4,
       "opponent_score": 2,
       "score": "4-2",
       "at_vs": "@",
       "opponent": "IPS",
       "date": "2026-09-15T19:00Z"
      },
      {
       "result": "L",
       "provider_result": "L",
       "team_score": 0,
       "opponent_score": 3,
       "score": "3-0",
       "at_vs": "@",
       "opponent": "BHA",
       "date": "2026-09-19T14:00Z"
      },
      {
       "result": "W",
       "provider_result": "W",
       "team_score": 2,
       "opponent_score": 1,
       "score": "2-1",
       "at_vs": "vs",
       "opponent": "LEE",
       "date": "2026-10-10T11:30Z"
      }
     ]
    }
   ],
   "head_to_head": []
  },
  "round": "CAPITAL ONE CUP - SEMIFINAL",
  "shootout": null,
  "neutral_site": false
 },
 "book": null,
 "books": [],
 "book_meta": {
  "series": "KXEFLCUPGAME",
  "tradeable_events": 0,
  "max_age_seconds": 300.0,
  "observed_at": null,
  "age_means": "the viewer market cache publishes no store clock, so the exact age of these prices is UNKNOWN — bounded by max_age_seconds, never assumed to be zero",
  "status": "unavailable",
  "means": "no tradeable event on this series names both clubs. A settled book LEAVES the board, so for a finished match this is expected and is NOT a claim that the fixture never priced",
  "truncated": false,
  "families": {},
  "other_series": [],
  "families_not_read_because": "the winner event was not bridged to this match, so there is no ticker suffix to join any other family by — every family is UNREAD here, which is not a finding that none is listed",
  "settles_on": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix — the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 — better than one in six — finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here."
 },
 "model": null,
 "model_refusal": {
  "state": "cup_not_pooled",
  "why": "no model. This competition is in none of the cup model's tested pools: most ties pair a rated club with a lower-division or amateur club that has no rating here, so too few rated-v-rated ties exist to test a model on; second-tier ratings come first (not built). No model prices this tie, on paper or otherwise. The board's own pre-kickoff read, when one was frozen, is under `board_read` — a read, not a signal.",
  "instead": "board_read",
  "pool": null,
  "verdict": null,
  "paper_only": true,
  "note": null
 },
 "board_read": {
  "origin": "unavailable",
  "origin_label": "NOT AVAILABLE",
  "origin_note": "no pre-kickoff board read was frozen for this fixture. The board freezes a fixture only when its column is assembled while the fixture is upcoming; this page reads that record and never assembles a board or rebuilds a read itself",
  "unavailable_reason": "not_frozen",
  "store_read": "ok",
  "store_read_error": null,
  "source": "board_snapshot",
  "captured_at": null,
  "captured_seconds_before_kickoff": null,
  "captured_lead_band": null,
  "captured_lead_band_means": null,
  "superseded": [],
  "corrections": 0,
  "board_date": null,
  "reconstructed_from": null,
  "state": null,
  "archive_read": "archive_not_configured"
 },
 "lineups": {
  "home": {
   "formation": null,
   "confirmed": false,
   "released": false,
   "starters": [],
   "bench": [],
   "goalkeeper": null,
   "key_absences": null,
   "key_absences_reason": "no player-strength feed for eflcup — absences are computed only for mls-2026"
  },
  "away": {
   "formation": null,
   "confirmed": false,
   "released": false,
   "starters": [],
   "bench": [],
   "goalkeeper": null,
   "key_absences": null,
   "key_absences_reason": "no player-strength feed for eflcup — absences are computed only for mls-2026"
  },
  "strength_available": false
 },
 "venue_class": {
  "class": "UNKNOWN",
  "home_side": null,
  "basis": "unresolved",
  "venue": {
   "name": "Highbury Stadium",
   "city": "Fleetwood",
   "country": "England"
  },
  "rule": null,
  "neutral_site_flag_read": false,
  "unresolved_why": "not_classified_here: a cup tie's ground is classified from each side's own league, which the match summary does not carry, so this page does not classify it — UNKNOWN, never a home ground. The board's frozen pre-kickoff read, when one exists, carries the class the board computed"
 },
 "framing": "Live match stats from ESPN and real Kalshi prices. No model runs for this competition. Shadow · not advice — a read, not a signal.",
 "generated_at": "2026-10-13T20:49:44.798752+00:00",
 "traders_model": {
  "title": "trader's model (untested)",
  "tested": false,
  "available": false,
  "means": "What the trading agent prices this cup tie from: the CUP model (unified-cups-nb-v1, src/trading/unified_cups.py), read through the same function the trader calls. EXPERIMENTAL, UNPROVEN and PAPER ONLY: its pool passed a pre-registered replay of history, which is not a forecast of profit, and no cup is in the money pass-set.",
  "label": "experimental, unproven",
  "paper_only": true,
  "source": "unified_cups",
  "model": null,
  "why": "cups_not_a_pooled_cup",
  "detail": "cup_not_pooled"
 },
 "cup": {
  "group": "domestic",
  "one_match": false,
  "members": [
   "epl",
   "championship",
   "leagueone",
   "leaguetwo"
  ],
  "settles_on": "REGULATION TIME ONLY, AND IN THIS COMPETITION THAT IS NOT A FOOTNOTE. Kalshi's KXEFLCUPGAME settles on 90 minutes plus stoppage: all fifteen of its open markets are titled \"Reg Time: <club> wins\" or \"Reg Time: Tie is the result\" (read 2026-09-15), and none of the 72 markets on the two EFL LEAGUE series carries that prefix — the two are different settlement objects and the provider says so in the label. THE EFL CUP IS A STRAIGHT KNOCKOUT WITH NO REPLAYS: a tie level after 90 goes to extra time and then to penalties, and one side is out the same night. So \"Reg Time: Tie\" resolving YES is a LEVEL SCORE AFTER NINETY and says nothing about who advanced, while \"Reg Time: Fleetwood wins\" resolving NO does not mean Fleetwood went out. That is the live case here and not a corner: of the 71 ties this competition had decided by 2026-09-15, 13 — better than one in six — finished on penalties. UNVERIFIED FOR THE LATER ROUNDS: every KXEFLCUPGAME market listed on 2026-09-15 is a third-round tie, so whether Kalshi lists the semi-final's two legs or the final under this same series and this same rule has not been observed and is not claimed here.",
  "cross_note": "CROSS-TIER FIXTURE — ppg, GD/g and rank gaps withheld. The two clubs are rated in different divisions of one pyramid, and 2.0 ppg in League Two is not 2.0 ppg in the Premier League: subtracting them would invent a gap that was never measured. Four rungs of the same ladder make that MORE of a problem than two foreign leagues and not less, because the tables look alike — same country, same calendar, same shape — while the fields they measure are graded by construction. In this competition it is very nearly every case: of the 76 fixtures played to 2026-09-15, 47 paired two different tiers and 29 did not. The tiers below survive because they are WITHIN-LEAGUE quintiles by construction — a League Two T1 and a Premier League T1 each mean \"best fifth of its own division\", which is the one comparison two tables built on different populations can actually support."
 }
} as const;

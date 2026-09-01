// EPL match hub — a thin config over the shared MatchHub (2026-09-01).
// epl-2026-v0 is DARK and the EPL has no per-player strength feed, so
// this config strips the strength machinery and words every model slot
// as unapproved. Every string is the page's exact pre-refactor copy.
import MatchHub, { HubCfg } from "../../../components/MatchHub";

const CFG: HubCfg = {
  boardQuery: "epl",
  api: "/api/epl",
  tag: "EPL",
  boardLabel: "epl board",
  accentVars: {
    "--accent": "#b18cff",
    "--accent-dim": "rgba(177,140,255,0.35)",
    "--accent-faint": "rgba(177,140,255,0.10)",
    "--accent-ambient": "rgba(177,140,255,0.07)",
  } as React.CSSProperties,
  accentHex: "#b18cff",
  version: "epl-2026-v0",
  chip: (_model, run) =>
    run ? "epl-2026-v0 · shadow · not advice"
      : "epl-2026-v0 · dark — unapproved, no model output",
  suggestion: "epl-2026",
  // the historical EPL page carried no temporal-basis panel; it gains
  // one the day its model lights up — flip this then
  temporal: false,
  marketFootnote:
    "epl-2026-v0 must earn shadow approval through the evaluation " +
    "ladder on real 2026-27 results before any probability appears " +
    "here · real-money signals stay disabled server-side",
  modelEmptyText: "model dark — no approved prediction run exists",
  likelihoodTooltip:
    "epl-2026-v0 shadow probability — empty while the model is dark",
  netEdgeTooltip:
    "MODEL probability minus the CURRENT ask minus Kalshi's entry fee " +
    "— empty while the model is dark",
  tableFootnote:
    "likelihood = a stored shadow run's probability where one exists — " +
    "while epl-2026-v0 is dark every model cell shows “—” " +
    "and only the exchange's own prices render · shadow, not advice",
  howTheyPlayNote:
    "fitted epl-2026-v0 goal rates, shrunk toward league average — " +
    "recency-weighted, goals only (no xG source exists for the epl)",
  lineups: {
    title: "lineups",
    rich: false,
    fetchedLine: "not the lineup frozen at T-10",
    darkRunText: "no model run frozen for this fixture yet",
    footnote: () =>
      "xi from espn · no per-player strength source exists for the epl " +
      "· context only — the model does not use lineups",
  },
  footer:
    "live data + real market prices · model dark until approved, then " +
    "shadow-only · not betting advice",
};

export default function EplMatchPage() {
  return <MatchHub cfg={CFG} />;
}

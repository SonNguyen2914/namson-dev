// Liga MX match hub — a thin config over the shared MatchHub
// (2026-09-01). Distinctives: the xG shown is the SIMULATOR's (no
// provider feed exists), the market section keeps its dark pill, and no
// card-v1 competition is wired yet — so no suggestion card and no Card
// nav chip. Every string is the page's exact pre-refactor copy.
import MatchHub, { HubCfg } from "../../../components/MatchHub";

const CFG: HubCfg = {
  boardQuery: "ligamx",
  api: "/api/ligamx",
  tag: "Liga MX",
  boardLabel: "liga mx board",
  accentVars: {
    "--accent": "#0fbe66",
    "--accent-dim": "rgba(15,190,102,0.35)",
    "--accent-faint": "rgba(15,190,102,0.10)",
    "--accent-ambient": "rgba(15,190,102,0.07)",
  } as React.CSSProperties,
  accentHex: "#0fbe66",
  version: "liga-mx-2026-v0",
  chip: (_model, run) =>
    run ? "liga-mx-2026-v0 · shadow · not advice"
      : "liga-mx-2026-v0 · dark — unapproved, no prediction exists",
  simXg: true,
  marketPill: (run) =>
    run ? "shadow · not advice" : "model dark · not advice",
  temporal: true,
  marketFootnote:
    "same scale, read vertically — where the boundaries disagree is " +
    "where model and market disagree · the model stays dark until it " +
    "earns approval through prospective evaluation · real-money " +
    "recommendations disabled",
  modelEmptyText:
    "liga-mx-2026-v0 is dark — unapproved, no prediction run exists",
  likelihoodTooltip:
    "liga-mx-2026-v0 shadow probability — empty while the model is dark",
  netEdgeTooltip:
    "Frozen/latest MODEL probability minus the CURRENT ask minus " +
    "Kalshi's entry fee — empty while the model is dark",
  tableFootnote:
    "likelihood = the stored shadow run's probability where the model " +
    "prices the market — every cell is “—” while " +
    "liga-mx-2026-v0 stays dark (no prediction exists) · never advice",
  howTheyPlayNote:
    "fitted liga-mx-2026-v0 goal rates, shrunk toward league average — " +
    "recency-weighted, goals only (no xG source exists for liga mx)",
  lineups: {
    title: "lineups + absentees",
    rich: true,
    fetchedLine: "not an input to any model",
    darkRunText:
      "no model run exists for this fixture — liga-mx-2026-v0 is dark",
    footnote: () =>
      "xi from espn · no player xg — no public per-player xg source " +
      "exists for liga mx · context only — the model does not use lineups",
  },
  footer:
    "live data + real market prices · model dark until approved, " +
    "observational only · not betting advice",
};

export default function LigamxMatchPage() {
  return <MatchHub cfg={CFG} />;
}

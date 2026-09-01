// La Liga match hub — a thin config over the shared MatchHub
// (2026-09-01). laliga-2026-v0 is approval-gated: the chip and every
// model slot state dark explicitly until a run exists. Every string is
// the page's exact pre-refactor copy.
import MatchHub, { HubCfg } from "../../../components/MatchHub";

const CFG: HubCfg = {
  boardQuery: "laliga",
  api: "/api/laliga",
  tag: "La Liga",
  boardLabel: "la liga board",
  accentVars: {
    "--accent": "#ff4b44",
    "--accent-dim": "rgba(255,75,68,0.35)",
    "--accent-faint": "rgba(255,75,68,0.10)",
    "--accent-ambient": "rgba(255,75,68,0.07)",
  } as React.CSSProperties,
  accentHex: "#ff4b44",
  version: "laliga-2026-v0",
  chip: (model) =>
    model ? `${model.model_version ?? "laliga-2026-v0"} · shadow · not advice`
      : "laliga-2026-v0 · dark — no approval, no prediction",
  suggestion: "la-liga-2026",
  temporal: true,
  marketFootnote:
    "same scale, read vertically — where the boundaries disagree is " +
    "where model and market disagree · shadow mode, real-money " +
    "recommendations disabled until prospective validation",
  modelEmptyText:
    "laliga-2026-v0 is dark — no approved model, so no prediction exists",
  likelihoodTooltip: "laliga-2026-v0 shadow probability",
  netEdgeTooltip:
    "Frozen/latest MODEL probability minus the CURRENT ask minus " +
    "Kalshi's entry fee — a frozen-model-vs-current-market gap across " +
    "two moments, not the T-10 frozen-book edge",
  tableFootnote:
    "likelihood = the stored shadow run's probability where the model " +
    "prices the market (“—” where it doesn't: method of " +
    "victory + 1st-half families are market-only for now) · shadow, " +
    "not advice",
  howTheyPlayNote:
    "fitted laliga-2026-v0 goal rates, shrunk toward league average — " +
    "recency-weighted, no hand-sourced narratives",
  lineups: {
    title: "lineups + absentees",
    rich: true,
    fetchedLine: "not the lineup frozen at T-10",
    darkRunText: "no model run frozen for this fixture yet",
    footnote: (strength) =>
      "xi from espn · xg/90 unavailable — no official la liga stats " +
      "feed ·" + (strength ? " " : " strength unavailable · ") +
      "context only — the model does not use lineups",
  },
  footer:
    "live data + real market prices · shadow model, observational " +
    "only · not betting advice",
};

export default function LaLigaMatchPage() {
  return <MatchHub cfg={CFG} />;
}

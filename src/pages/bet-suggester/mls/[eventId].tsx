// MLS match hub — a thin config over the shared MatchHub (2026-09-01).
// Son's Jul 23 layout lives in components/MatchHub.tsx now; this file
// carries only what makes MLS itself: the crest red, the live model's
// wording, the per-player strength feed (official MLS stats — the only
// league with one), and the card-v1 competition slug. Every string here
// is the page's exact pre-refactor copy.
import MatchHub, { HubCfg } from "../../../components/MatchHub";

const CFG: HubCfg = {
  boardQuery: "mls",
  api: "/api/mls",
  tag: "MLS",
  boardLabel: "mls board",
  accentVars: {
    "--accent": "#d50032",
    "--accent-dim": "rgba(213,0,50,0.35)",
    "--accent-faint": "rgba(213,0,50,0.10)",
    "--accent-ambient": "rgba(213,0,50,0.07)",
  } as React.CSSProperties,
  accentHex: "#d50032",
  version: "mls-2026-v0",
  // the chip is deliberately static: mls-2026-v0 is approved and running,
  // and the historical page never showed a dark variant
  chip: () => "mls-2026-v0 · shadow · not advice",
  suggestion: "mls-2026",
  temporal: true,
  marketFootnote:
    "same scale, read vertically — where the boundaries disagree is " +
    "where model and market disagree · shadow mode, real-money " +
    "recommendations disabled until prospective validation",
  modelEmptyText: "no completed prediction run yet",
  likelihoodTooltip: "mls-2026-v0 shadow probability",
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
    "fitted mls-2026-v0 goal rates, shrunk toward league average — " +
    "recency-weighted, no hand-sourced narratives",
  lineups: {
    title: "lineups + absentees",
    rich: true,
    fetchedLine: "not the lineup frozen at T-10",
    darkRunText: "no model run frozen for this fixture yet",
    footnote: (strength) =>
      "xi from espn · xg/90 from official mls stats ·" +
      (strength ? " " : " strength unavailable · ") +
      "context only — the model does not use lineups",
  },
  footer:
    "live data + real market prices · shadow model, observational " +
    "only · not betting advice",
};

export default function MlsMatchPage() {
  return <MatchHub cfg={CFG} />;
}

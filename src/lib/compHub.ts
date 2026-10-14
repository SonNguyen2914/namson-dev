// THE SEVEN HUBS WITH NO MODEL, AS ONE CONFIG (2026-10-01).
//
// Son's decision that day: "every competition needs match hubs". Four had
// one (MLS, EPL, La Liga, Liga MX), each a thin config over the shared
// components/MatchHub. The other seven competitions on the two boards —
// Bundesliga, Serie A, Ligue 1, Eredivisie on the Leagues board; the UEFA
// and Concacaf Nations Leagues and AFCON (qualifiers included, one key)
// on the Championships board — have NO fitted model, and the backend
// serves them through the generic per-match route
// `/api/comp/{key}/match/{event_id}` (src/comp_match.py), which mirrors
// the league routes key for key and sends `model: null` beside a NAMED
// `model_refusal`.
//
// So these are the same skeleton with every model slot worded as absent,
// keyed by the SAME slug the board's columns use: the build reads the
// page directory into the card-link table (next.config.ts ->
// lib/pickerApi.rowHref), so a page at bet-suggester/<slug>/[eventId] is
// what links a board card to it. No column is added or changed here.
//
// Words: a read, not a signal; shadow · not advice. No copy here calls
// anything an edge or a recommendation — there is no model to compare a
// price against.
import type { HubCfg } from "../components/MatchHub";
import { LEAGUE_LABEL } from "./pickerApi";
import { ALL_CUPS } from "./cupsTab";

/** Each slug's hue is the board's own (styles/globals.css `--lg-<slug>`),
 *  copied as hex because the hub derives rgba tints from it. */
export const NO_MODEL_HUBS = {
  bundesliga: { hex: "#35b9dd", board: "leagues" },
  seriea: { hex: "#7bd943", board: "leagues" },
  ligue1: { hex: "#c86ef5", board: "leagues" },
  eredivisie: { hex: "#ff7a2e", board: "leagues" },
  unl: { hex: "#8192fd", board: "nations" },
  cnl: { hex: "#ed5edf", board: "nations" },
  afcon: { hex: "#e699cc", board: "nations" },
} as const;

export type NoModelHub = keyof typeof NO_MODEL_HUBS;

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export function noModelHubCfg(slug: NoModelHub): HubCfg {
  const { hex, board } = NO_MODEL_HUBS[slug];
  const tag = LEAGUE_LABEL[slug] ?? slug;
  const empty =
    "no shadow model for this competition, and no trader's read of this match";
  return {
    boardQuery: slug,
    api: `/api/comp/${slug}`,
    tag,
    boardLabel: board === "nations" ? "nations board" : "board",
    back: { href: "/bet-suggester",
            label: board === "nations" ? "nations board" : "board" },
    accentVars: {
      "--accent": hex,
      "--accent-dim": rgba(hex, 0.35),
      "--accent-faint": rgba(hex, 0.10),
      "--accent-ambient": rgba(hex, 0.07),
    } as React.CSSProperties,
    accentHex: hex,
    version: "no model",
    chip: () => "no shadow model · shadow · not advice",
    temporal: false,
    marketFootnote:
      `raw exchange prices · no shadow model is fitted for ${tag}; the ` +
      `trader's model, where shown, is the trading agent's own ` +
      `experimental pre-match read · a read, not a signal · shadow · ` +
      `not advice`,
    modelEmptyText: empty,
    likelihoodTooltip: `empty — no model is fitted for ${tag}`,
    netEdgeTooltip:
      "empty — there is no model probability to set against a price",
    tableFootnote:
      `likelihood is “—” on every row: no model is fitted for ${tag}, ` +
      "so only the exchange's own prices render · a read, not a signal " +
      "· shadow · not advice",
    howTheyPlayNote: `no fitted ratings exist for ${tag}`,
    lineups: {
      title: "lineups",
      rich: false,
      fetchedLine: "not an input to any model",
      darkRunText: "no model exists for this competition",
      footnote: () =>
        "xi from espn · context only — no model reads lineups here",
    },
    // Form/H2H was measured non-predictive on the CLUB corpus only; a
    // national hub says so rather than borrowing the club finding.
    ...(board === "nations"
      ? { scoutingNote: "display only — never measured for national teams" }
      : {}),
    footer:
      "live data + real exchange prices · no shadow model · trader's " +
      "model where served · a read, not a signal · shadow · not advice",
  };
}

// ---------------------------------------------------------------- the cups
//
// EVERY CUP MATCH HAS A HUB (Son, 2026-10-13: "all matches should have a
// match hub, currently cups matches don't have it"). The 22 cups of the Cups
// tab (lib/cupsTab.ts, the backend's `tables.CUPS_TAB`) read the SAME
// generic per-match route as the seven above, keyed by the registry slug
// the card carries, and render through the SAME MatchHub — one hub
// template, as one card template (AGENTS.md §8). Only words and the hue
// differ; no section is added or removed for a cup.
//
// The backend names each cup's model position in `model_refusal`: the
// continental cups carry the trader's PAPER-ONLY cup model on the trader's
// model line (labelled untested, "cups: paper only"); the MLS–Liga MX cups'
// pool failed its test; the super cups and domestic cups have no model, and
// the refusal says why.
/** A cup's hue as hex, for the hub's rgba tints: the board's own
 *  `--lg-<slug>` where the cup has one (styles/globals.css), else
 *  `--lg-cup`, which is what `hueOf` answers for it. */
const CUP_HEX: Record<string, string> = {
  ucl: "#f174cc", uel: "#2eac1e", eflcup: "#0e9cfb",
};
const LG_CUP_HEX = "#f5c542";

export const CUP_HUB_KEYS: readonly string[] = ALL_CUPS.map((c) => c.key);

export function cupHubCfg(key: string): HubCfg {
  const cup = ALL_CUPS.find((c) => c.key === key);
  if (!cup) throw new Error(`no cup ${key}`);
  const hex = CUP_HEX[key] ?? LG_CUP_HEX;
  const tag = cup.name;
  return {
    ...noModelBase(tag, hex),
    boardQuery: key,
    api: `/api/comp/${key}`,
    tag,
    boardLabel: "cups board",
    back: { href: "/bet-suggester", label: "cups board" },
    version: "no shadow model",
    howTheyPlayNote:
      `no fitted ratings exist for ${tag} itself; each side is rated on ` +
      "its own league's table, and the board card's tiers say how",
  };
}

/** The shared no-model words, parameterised by the competition's name. */
function noModelBase(tag: string, hex: string) {
  const empty =
    "no shadow model for this competition, and no trader's read of this match";
  return {
    accentVars: {
      "--accent": hex,
      "--accent-dim": rgba(hex, 0.35),
      "--accent-faint": rgba(hex, 0.10),
      "--accent-ambient": rgba(hex, 0.07),
    } as React.CSSProperties,
    accentHex: hex,
    chip: () => "no shadow model · shadow · not advice",
    temporal: false,
    marketFootnote:
      `raw exchange prices · no shadow model is fitted for ${tag}; the ` +
      `trader's model, where shown, is the trading agent's own ` +
      `experimental pre-match read · a read, not a signal · shadow · ` +
      `not advice`,
    modelEmptyText: empty,
    likelihoodTooltip: `empty — no model is fitted for ${tag}`,
    netEdgeTooltip:
      "empty — there is no model probability to set against a price",
    tableFootnote:
      `likelihood is “—” on every row: no model is fitted for ${tag}, ` +
      "so only the exchange's own prices render · a read, not a signal " +
      "· shadow · not advice",
    lineups: {
      title: "lineups",
      rich: false,
      fetchedLine: "not an input to any model",
      darkRunText: "no model exists for this competition",
      footnote: () =>
        "xi from espn · context only — no model reads lineups here",
    },
    footer:
      "live data + real exchange prices · no shadow model · trader's " +
      "model where served · a read, not a signal · shadow · not advice",
  };
}

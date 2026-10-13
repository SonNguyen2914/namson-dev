// THE CUPS TAB'S LIST — 22 cups, mirroring the backend's `tables.CUPS_TAB`
// (Son, 2026-10-07/08: Leagues | Cups | Nations; cups become full
// competitions; super cups added — 33 competitions in all).
//
// The Cups tab is the landing page's own board, narrowed by the page to
// these cups and asked for BY NAME in one read. Which of them get a column
// is the season rule (lib/offSeason.isOffSeason): in season keeps a column
// (a rest-day card when nothing is in the window), off season folds into
// the tab's one "Off season · …" line, and the one-match competitions
// share the Finals & Super Cups column, drawn only when one is upcoming.
//
// NOT THE LEAGUES BOARD'S COLUMN SET. Nothing here adds a column to the
// Leagues tab, whose columns stay Son's declaration (memory
// `board-columns-are-declared`).

export type CupScope = "continental" | "finals" | "domestic";

export interface CupLink { href: string; label: string }

export interface CupEntry {
  /** the backend registry slug (`tables.CUPS` key, the board's key) */
  key: string;
  name: string;
  /** who plays in it, in a few words — never a number */
  region: string;
  /** the pages that already exist for it */
  links?: CupLink[];
  /** DECLARED FALLBACK ONLY: the last edition is known finished (the year
   *  it was played). Read by `isOffSeason` only when the payload sends no
   *  `season.state` for the cup; a fixture in the window, or the
   *  payload's own state, always wins. */
  over?: string;
}

/** THE 22 CUPS, mirroring the backend's `tables.CUPS_TAB` (Son,
 *  2026-10-07/08): continental, the Finals & Super Cups group, domestic.
 *  Every one is registered on the backend with a verified ESPN slug, so
 *  every one is askable by name. Names are the registry's `display`. */
export const CUPS: Record<CupScope, readonly CupEntry[]> = {
  continental: [
    { key: "ucl", name: "Champions League", region: "UEFA · Europe",
      links: [
        { href: "/bet-suggester/ucl", label: "board" },
        { href: "/bet-suggester/comp/ucl", label: "viewer" },
      ] },
    { key: "uel", name: "Europa League", region: "UEFA · Europe" },
    { key: "uecl", name: "Conference League", region: "UEFA · Europe" },
    { key: "concacafcc", name: "Concacaf Champions Cup",
      region: "Concacaf · North and Central America" },
    { key: "leaguescup", name: "Leagues Cup", region: "MLS v Liga MX",
      links: [
        { href: "/bet-suggester/comp/leagues-cup", label: "viewer" },
        { href: "/bet-suggester/leagues-cup", label: "brackets" },
      ], over: "2026" },
  ],
  finals: [
    { key: "campeones", name: "Campeones Cup", region: "MLS v Liga MX champions",
      links: [
        { href: "/bet-suggester/ratings?comp=campeones", label: "field" },
      ], over: "2026" },
    { key: "uefasuper", name: "UEFA Super Cup", region: "UEFA · Europe" },
    { key: "communityshield", name: "FA Community Shield", region: "England" },
    { key: "supercopa", name: "Supercopa de España", region: "Spain" },
    { key: "dflsupercup", name: "DFL-Supercup", region: "Germany" },
    { key: "supercoppa", name: "Supercoppa Italiana", region: "Italy" },
    { key: "tropheechampions", name: "Trophée des Champions", region: "France" },
    { key: "johancruijff", name: "Johan Cruijff Schaal", region: "Netherlands" },
    { key: "campeondecampeones", name: "Campeón de Campeones", region: "Mexico" },
  ],
  domestic: [
    { key: "facup", name: "FA Cup", region: "England" },
    { key: "eflcup", name: "EFL Cup", region: "England",
      links: [{ href: "/bet-suggester/efl-cup", label: "board" }] },
    { key: "copadelrey", name: "Copa del Rey", region: "Spain" },
    { key: "dfbpokal", name: "DFB-Pokal", region: "Germany" },
    { key: "coppaitalia", name: "Coppa Italia", region: "Italy" },
    { key: "coupedefrance", name: "Coupe de France", region: "France" },
    { key: "knvbbeker", name: "KNVB Beker", region: "Netherlands" },
    { key: "usopencup", name: "US Open Cup", region: "United States" },
  ],
};

/** EVERY CUP, in the tab's order — `tables.CUPS_TAB`. */
export const ALL_CUPS: readonly CupEntry[] = [
  ...CUPS.continental, ...CUPS.finals, ...CUPS.domestic,
];

/** THE CUPS THE CLUB BOARD BUILDS BY NAME — all 22 since the backend
 *  registered them (TRIVELA cups-rules, 2026-10-13). The Cups tab asks for
 *  all of them in ONE read (`?leagues=`, one backend cache key). */
export const CUP_BOARD_COLUMNS: readonly string[] = ALL_CUPS.map((c) => c.key);

/** The cups that already have a page, in tab order — the hero's lights. */
export const CUPS_WITH_PAGES: readonly string[] = ALL_CUPS
  .filter((c) => c.links?.length).map((c) => c.key);

/** THE FINALS & SUPER CUPS GROUP (Son, 2026-10-07): every ONE-MATCH
 *  competition shares one column, continental-agnostic, drawn ONLY when
 *  one of its matches is in the window; each card carries its own
 *  competition badge (the card's badge shows whenever the row's
 *  competition is not the column). A one-match competition never has a
 *  column of its own and is never "between rounds". */
export const FINALS = "finals";
export const FINALS_LABEL = "Finals & Super Cups";
export const FINALS_MEMBERS: readonly string[] = CUPS.finals.map((c) => c.key);

/** THE CUPS TAB'S COLUMNS, in Son's order: continental, then Finals &
 *  Super Cups, then domestic. One-match competitions are in the group. */
export const OWN_COLUMN_CUPS: readonly string[] = [
  ...CUPS.continental.map((c) => c.key),
  FINALS,
  ...CUPS.domestic.map((c) => c.key),
];

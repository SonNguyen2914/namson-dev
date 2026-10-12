// THE CUPS TAB'S LIST (cups plan Phase A, 2026-10-12).
//
// Son's naming decision of 2026-10-07 (roadmap 05b): the board's top tabs
// are Leagues | Cups | Nations, and Cups has a Continental | Domestic
// switch. Phase A is the FRAME only — the tab, its two halves and the
// cups in each — and it adds no server load: nothing here is fetched.
//
// TWO KINDS OF ENTRY, AND THE DIFFERENCE IS A FACT, NOT A STYLE:
//  - a cup WITH PAGES already has a viewer in this repo, and its entry
//    links to those pages. Its data is read there, by the page that has
//    always read it; this list repeats none of it.
//  - a cup that is COMING has no page, no fixtures and no data yet. It is
//    named, and that is all: no count, no date, no zero. A "0 fixtures"
//    beside a cup nobody is reading would be a measurement of nothing.
//
// WHY THE EFL CUP IS UNDER DOMESTIC. The Phase A brief listed the four
// cups with viewers together; the switch splits them by what they are.
// The EFL Cup is England's league cup, so it sits under Domestic beside
// the FA Cup and the other national cups, and the three continental ones
// (UCL, Leagues Cup, Campeones Cup) sit under Continental.
//
// NOT THE BOARD'S COLUMN SET. This list is a tab of its own; it adds no
// column to the Leagues board, whose columns stay Son's declaration
// (memory `board-columns-are-declared`).

export type CupScope = "continental" | "domestic";

export interface CupLink { href: string; label: string }

export interface CupEntry {
  /** the registry slug where one exists (the board's / CupSpec's key) */
  key: string;
  name: string;
  /** who plays in it, in a few words — never a number */
  region: string;
  /** the pages that already exist for it; absent = coming */
  links?: CupLink[];
}

export const CUPS: Record<CupScope, readonly CupEntry[]> = {
  continental: [
    { key: "ucl", name: "Champions League", region: "UEFA · Europe",
      links: [
        { href: "/bet-suggester/ucl", label: "board" },
        { href: "/bet-suggester/comp/ucl", label: "viewer" },
      ] },
    { key: "leaguescup", name: "Leagues Cup", region: "MLS v Liga MX",
      links: [
        { href: "/bet-suggester/comp/leagues-cup", label: "viewer" },
        { href: "/bet-suggester/leagues-cup", label: "brackets" },
      ] },
    { key: "campeones", name: "Campeones Cup", region: "MLS v Liga MX champions",
      links: [
        { href: "/bet-suggester/ratings?comp=campeones", label: "field" },
      ] },
    { key: "uel", name: "Europa League", region: "UEFA · Europe" },
    { key: "uecl", name: "Conference League", region: "UEFA · Europe" },
    { key: "concacafcc", name: "Concacaf Champions Cup",
      region: "Concacaf · North and Central America" },
  ],
  domestic: [
    { key: "eflcup", name: "EFL Cup", region: "England",
      links: [{ href: "/bet-suggester/efl-cup", label: "board" }] },
    { key: "facup", name: "FA Cup", region: "England" },
    { key: "copadelrey", name: "Copa del Rey", region: "Spain" },
    { key: "dfbpokal", name: "DFB-Pokal", region: "Germany" },
    { key: "coppaitalia", name: "Coppa Italia", region: "Italy" },
    { key: "coupedefrance", name: "Coupe de France", region: "France" },
    { key: "knvbbeker", name: "KNVB Beker", region: "Netherlands" },
    { key: "usopencup", name: "US Open Cup", region: "United States" },
  ],
};

/** The cups that already have a page, in tab order — the hero's lights. */
export const CUPS_WITH_PAGES: readonly string[] = [
  ...CUPS.continental, ...CUPS.domestic,
].filter((c) => c.links?.length).map((c) => c.key);

// THE ONE DOOR A LEAGUE SLUG BECOMES A COLOUR THROUGH.
//
// Moved verbatim out of components/PickerColumn.tsx (2026-10-02), which
// re-exports it and still carries the full reasoning for every hue (and
// globals.css carries each token's derivation). Kept in a module of its
// own, with no imports, so a surface that only needs the lookup does not
// pull the board's column component into its bundle.
//
// An unmapped slug answers --lg-cup — visibly wrong rather than an
// undeclared property that paints nothing. Building `var(--lg-…)` from a
// value anywhere else is a defect (e2e/one-hue-lookup.spec.ts).
const LEAGUE_HUE: Record<string, string> = {
  mls: "var(--lg-mls)", epl: "var(--lg-epl)", laliga: "var(--lg-laliga)",
  ligamx: "var(--lg-ligamx)", ucl: "var(--lg-ucl)",
  bundesliga: "var(--lg-bundesliga)", seriea: "var(--lg-seriea)",
  ligue1: "var(--lg-ligue1)", eredivisie: "var(--lg-eredivisie)",
  eflcup: "var(--lg-eflcup)",
  // the Championships board (globals.css, beside the tokens)
  unl: "var(--lg-unl)", cnl: "var(--lg-cnl)",
  afcon: "var(--lg-afcon)",
  // THE EUROPA LEAGUE (2026-09-25), the field page's fourth cup pill.
  // Not a board column: it is measured against the pills it can sit
  // beside on the Cups strip — ucl, eflcup and the Campeones pill, whose
  // ink is the brand gold — and clears gold by 67.1 dE. Derivation in
  // globals.css beside the token.
  uel: "var(--lg-uel)",
};
export const hueOf = (slug: string) => LEAGUE_HUE[slug] ?? "var(--lg-cup)";

// WHICH BOARD COLUMNS HAVE A PAGE OF THEIR OWN, reached by clicking the
// column's name in its header (Son, 2026-11-16).
//
// The top bar lost its "Leagues", "UCL" and "EFL Cup" chips that day. A
// league's own page — the carousel at /trivela/leagues (pages/trivela/
// leagues.tsx `LEAGUES`; board slugs and carousel ids are the same
// strings) — is reached from its name on the Leagues board. The two cups
// whose chips were removed keep a door the same way, from their names on
// the Cups tab, so removing a chip did not orphan a page. Every other
// column header stays plain text rather than linking to a page that
// would substitute a different competition.
export const LEAGUE_PAGE_SLUGS: readonly string[] = ["mls", "epl", "laliga", "ligamx"];

export const CUP_PAGES: Readonly<Record<string, string>> = {
  ucl: "/trivela/ucl",
  eflcup: "/trivela/efl-cup",
};

export const leaguePageHref = (slug: string): string | null =>
  LEAGUE_PAGE_SLUGS.includes(slug) ? `/trivela/leagues?league=${slug}`
  : CUP_PAGES[slug] ?? null;

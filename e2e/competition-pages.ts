// EVERY COMPETITION PAGE THIS APP HAS, DERIVED FROM THE TWO REGISTRIES
// THAT ALREADY DECLARE THEM — and never typed out a third time.
//
// ─── WHY THIS FILE EXISTS ────────────────────────────────────────────
// Four guards named a rule about "competitions" and then enumerated a
// hand-typed subset of slugs. On 2026-09-15 the EFL Cup shipped with a
// page, a chip, a hue and a column, and every one of those four stayed
// green while covering NONE of it:
//
//   no-raw-slug-reaches-the-reader   ucl only
//   off-board-is-not-vanished        ucl only
//   comp-chip-says-when              ucl only
//   layout-audit                     ucl + leagues-cup
//
// and the last of those had been missing the ASEAN viewer page since
// the day that page shipped, which nobody had noticed either.
//
// THIS PROJECT HAS ALREADY PAID FOR THIS EXACT FAILURE. La Liga
// disarmed itself on every boot for as long as a test called "both
// planes" listed two of three. The lesson written down that day is the
// whole of this file: DERIVE THE SET FROM THE REGISTRY AND ASSERT ITS
// LENGTH. Deriving alone is not enough — a derivation nobody counts can
// quietly return fewer rows than it used to, which is the same silence
// one indirection further out.
//
// ─── WHAT THE TWO REGISTRIES ARE ─────────────────────────────────────
// `LIVE_COMPETITIONS` (components/CompRail) is "this competition is
// being played and has a page": it is the chip rail in the top bar.
// `ARCHIVE` (components/ArchiveMenu) is "this competition is FINISHED
// and has a page": it is the dropdown at the top-left. A competition
// is in exactly one of them, and the test that decides which is
// recorded in ArchiveMenu's own header each time it is made.
//
// Between them they are the set of competitions a reader can reach from
// the chrome, which is the set every guard below was reaching for. They
// are NOT the picker board's column set and must never be confused with
// it — the operator's `BOARD_COLUMNS` is a different declaration
// answering a different question, and both the Champions League and the
// EFL Cup are on these rails with no column at all.
import { ARCHIVE } from "../src/components/ArchiveMenu";
import { LIVE_COMPETITIONS } from "../src/components/CompRail";

export type CompetitionPage = {
  /** the competition's own key, as its registry spells it */
  key: string;
  href: string;
  label: string;
  /** is this competition still being played */
  live: boolean;
};

/** THE LIVE COMPETITIONS, each with the page its chip opens.
 *
 *  Every one of these is a PICKER BOARD narrowed to one column
 *  (`PickerBoard only={[slug]}`) — the chip "names the page with the
 *  MATCHES on it", which CompRail's header records as a decision made
 *  twice in one day. That is a property rather than an assumption here:
 *  the guards below mock `/api/picker/board` and assert a
 *  `[data-testid="league-col"]` for the key, so a live competition
 *  whose chip pointed somewhere else would fail loudly rather than be
 *  skipped quietly. */
export const LIVE_PAGES: CompetitionPage[] = LIVE_COMPETITIONS.map((c) => ({
  key: c.key, href: c.href, label: c.label, live: true,
}));

/** THE FINISHED COMPETITIONS, each with the page its archive entry
 *  opens. These are NOT all the same kind of page — ASEAN opens its
 *  competition viewer, the Leagues Cup its bracket archive, the World
 *  Cup its own tournament page — which is exactly why the layout sweep
 *  wants them and the board-shaped guards do not. */
export const ARCHIVE_PAGES: CompetitionPage[] = ARCHIVE.map((a) => ({
  key: a.key, href: a.href, label: a.label, live: false,
}));

/** Every competition page in the app. */
export const COMPETITION_PAGES: CompetitionPage[] = [
  ...LIVE_PAGES, ...ARCHIVE_PAGES,
];

/** THE COUNTS, PINNED.
 *
 *  A derived set is only half the fix. `LIVE_PAGES.map(...)` over an
 *  array that has quietly lost an entry runs clean and asserts nothing,
 *  and a guard that iterates an empty list is the most cheerful test in
 *  any suite. So every spec that walks one of these sets asserts its
 *  length against the number here FIRST, and the number is a decision
 *  somebody has to make on purpose.
 *
 *  WHEN ONE OF THESE FAILS, the registry changed and a person should
 *  look at what the guards now cover, not at this line. Adding a
 *  competition to the rail is meant to add it to four guards; that is
 *  the whole point. Change the number, run the suite, and read what it
 *  says about the new competition. */
export const EXPECT_LIVE_PAGES = 2;      // ucl, eflcup
export const EXPECT_ARCHIVE_PAGES = 3;   // wc26, asean, leagues-cup
export const EXPECT_COMPETITION_PAGES =
  EXPECT_LIVE_PAGES + EXPECT_ARCHIVE_PAGES;

/** A competition is live or it is archived, never both and never
 *  neither. Exported so the specs can assert it beside their own
 *  subject rather than each re-deriving the union. */
export const keysOf = (pages: CompetitionPage[]) => pages.map((p) => p.key);

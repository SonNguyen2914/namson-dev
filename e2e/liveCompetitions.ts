// THE COMPETITION SET THE GUARDS WALK, AND IT IS THE APP'S OWN.
//
// ─── WHY THIS FILE EXISTS ────────────────────────────────────────────
// Four specs named a rule about "the competition chips", "a cup
// column", "the board", and then hand-typed `ucl` into it. On
// 2026-09-15 the EFL Cup joined the rail with a page, a column, a hue
// and a chip — and every one of those four guards went on being green
// while covering none of it. Counted the day it landed: mentions of
// ucl / eflcup were 4/0, 3/0, 9/0 and 1/0.
//
// THIS PROJECT HAS ALREADY PAID FOR THAT EXACT FAILURE. La Liga
// disarmed itself on every boot for as long as a test called "both
// planes" enumerated two of three. The written lesson is: DERIVE THE
// SET FROM THE REGISTRY AND ASSERT ITS LENGTH — the derivation is what
// makes a new competition arrive in the guard, and the length is what
// makes a registry that grows FAIL instead of quietly shrinking the
// guard's coverage.
//
// ─── WHERE THE SET COMES FROM ────────────────────────────────────────
// Until 2026-11-16 it was imported from `components/CompRail
// .LIVE_COMPETITIONS`, the top-bar chip rail. Son removed that rail
// ("UCL and EFL can be removed entirely because we have them in the
// cups"): the chips went, the PAGES stayed, and the Cups tab reaches
// them. The app no longer holds a list of "live competitions with a
// page" anywhere else, so the two pages are declared here, with the
// count below still pinning the size.
//
//   key   the column slug AND the key `/api/comp/{key}/fixtures` is
//         asked for
//   href  the competition's own page
//   label the competition's short name, for test titles
//   hue   the CSS custom property NAME of its light
import { ARCHIVE } from "../src/components/ArchiveMenu";

export type LiveCompetition = {
  key: string; href: string; label: string; hue: string;
};

export const COMPETITIONS: readonly LiveCompetition[] = [
  { key: "ucl", href: "/trivela/ucl", label: "UCL", hue: "--lg-ucl" },
  { key: "eflcup", href: "/trivela/efl-cup", label: "EFL Cup",
    hue: "--lg-eflcup" },
];

/** HOW MANY THERE ARE, IN ONE PLACE.
 *
 *  Every guard that walks the registry asserts `COMPETITIONS.length`
 *  against this. It is the whole mechanism: a competition added to the
 *  rail without this number moving turns four green suites red at once,
 *  and the fix is to look at each of them — which is exactly the review
 *  that did not happen when the EFL Cup landed.
 *
 *  It is a COUNT and deliberately not a list of keys. A list here would
 *  be the second copy of the registry this file exists to avoid; the
 *  keys come from `COMPETITIONS`, and only the size is pinned. */
export const LIVE_COMPETITION_COUNT = 2;

/** EVERY COMPETITION SURFACE IN THE TREE, live and archived.
 *
 *  Two registries, because a competition that finished did not stop
 *  having a page: `ARCHIVE` is the finished half and is the app's own
 *  declaration of it, the same way `LIVE_COMPETITIONS` is the live
 *  half. A sweep over one of them is a sweep over half the tree — which
 *  is how the ASEAN viewer, in the Archive menu since 2026-08-30, had
 *  never been walked by the layout audit. */
export const COMPETITION_PAGES: readonly string[] = [
  ...COMPETITIONS.map((c) => c.href),
  ...ARCHIVE.map((a) => a.href),
];

export const ARCHIVED_COUNT = 3;

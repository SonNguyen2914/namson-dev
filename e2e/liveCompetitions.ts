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
// `components/CompRail.LIVE_COMPETITIONS`, which is the app's own
// answer to "which competitions are live enough to put in front of the
// reader". It is not re-listed here; it is imported. Each entry already
// carries everything these guards need and nothing they would have to
// derive by string surgery:
//
//   key   the column slug AND the key `/api/comp/{key}/fixtures` is
//         asked for — so a spec mocks the right route without building
//         a URL out of guesses
//   href  the competition's own page
//   label the chip's visible text, for an accessible-name assertion
//   hue   the CSS custom property NAME of its light. Read through this
//         field, never spelled `--lg-` + slug: a concatenated token
//         shipped a colourless pill on 2026-09-15 and resolves to
//         nothing at all for a competition whose token is named
//         differently.
import { LIVE_COMPETITIONS } from "../src/components/CompRail";
import { ARCHIVE } from "../src/components/ArchiveMenu";

export const COMPETITIONS = LIVE_COMPETITIONS;

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

/** The competition pages, plus the two other surfaces that draw the
 *  rail. `index.tsx` renders it (so every `only=`-narrowed competition
 *  page does too), and `leagues.tsx` and `ratings.tsx` import it
 *  directly — the rail was the same literal typed into two pages once,
 *  and the day one of them gained the glow the other had a chip that
 *  could not. */
export const RAIL_PAGES: readonly string[] = [
  "/bet-suggester",
  "/bet-suggester/leagues",
  "/bet-suggester/ratings",
  ...COMPETITIONS.map((c) => c.href),
];

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

/** The chip for one competition, on whatever page is open. */
export const chipFor = (
  page: import("@playwright/test").Page,
  comp: { href: string },
) => page.locator(`a[href="${comp.href}"]`).first();

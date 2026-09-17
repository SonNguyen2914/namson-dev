// THE EFL CUP BOARD — namson.dev/bet-suggester/efl-cup
//
// The operator asked for the EFL Cup with "exactly every detail of what
// UCL having, the only difference is the theme color". The Champions
// League's page is the board with its column set narrowed to one, so
// this is that and nothing else: same `PickerBoard`, same matchday
// bands, same sort control, same rank dumbbells, same refusal blocks
// with their reasons. Not a page that looks like the board — the board.
// A copy would drift from it on the first change made to either.
//
// WHY /bet-suggester/efl-cup AND NOT /bet-suggester/eflcup. The slug is
// `eflcup` everywhere a registry speaks (it is the CupSpec key, the
// column key and the `leagues=` value), and the URL is the one place a
// human reads it. `/ucl` needed no hyphen because nobody writes "u-c-l".
// The `only` prop below carries the registry's spelling, so the two
// never have to agree by coincidence.
//
// WHAT THIS PAGE SHOWS THAT THE CHAMPIONS LEAGUE'S DOES NOT, and it is
// the honest shape of this competition rather than a gap: its ties cross
// four tiers of one pyramid, so a favourite here is a CROSS-TIER claim
// and the card has to say where it came from. It does — `fav_source`,
// and the field block beside it.
//
// THIS PARAGRAPH SAID THE OPPOSITE UNTIL 2026-09-16, and what it said
// had been measured false the day before. It read: most of its rows
// REFUSE, no measurement in this repository puts those tiers on one
// scale, a cross-tier tie is refused with `no_shared_scale` and the
// corpus numbers behind it — and it quoted a backend constant,
// `cross_league_axes.NO_FIELD["eflcup"]`, that no longer exists.
// Backend #151 harvested this cup's own cross-tier ties as the bridges
// the Championship lacked, all four tiers cleared the placeability floor
// at two passes, and `NO_FIELD` is now `{}`.
//
// SO THE NUMBERS ARE GONE FROM HERE RATHER THAN CORRECTED. A page
// comment restating another repository's corpus — how many fixtures pair
// two tiers, how many clubs the Elo corpus holds — is a second copy of a
// measurement, and the second copy is the one that rots: it was a day
// old when it went false, and nothing on this side could notice. What
// this page needs to say is what it DRAWS. The field, its axis, its
// pinned pass count, its corpus hash and what it refuses to separate all
// ride on the payload, per column and per row, and the card prints them;
// e2e/picker-efl-cup-column.spec.ts asserts they reach the reader and
// the backend's own suite asserts they are true.
import PickerBoard from "./index";

export default function EflCupBoard() {
  return (
    <PickerBoard
      only={["eflcup"]}
      pageTitle="EFL Cup"
      backTo={{ href: "/bet-suggester", label: "board" }}
    />
  );
}

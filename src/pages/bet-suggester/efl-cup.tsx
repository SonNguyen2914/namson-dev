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
// the honest shape of this competition rather than a gap: most of its
// rows REFUSE. The EFL Cup draws from four English tiers and no
// measurement in this repository puts those tiers on one scale, so a
// cross-tier tie is refused with `no_shared_scale` and the corpus
// numbers behind it (backend `cross_league_axes.NO_FIELD["eflcup"]`),
// while a same-tier tie is rated like any league row. Measured on the
// competition's own 76 fixtures to 2026-09-15: 47 pair two tiers and 29
// do not. The Champions League's field IS measured, so its cross-league
// rows name a favourite and these cannot. A page that hid that would be
// claiming an ordering nobody produced.
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

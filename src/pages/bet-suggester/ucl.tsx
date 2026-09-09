// THE CHAMPIONS LEAGUE BOARD — namson.dev/bet-suggester/ucl
//
// The operator asked for "the exact layout of the landing page, for
// UEFA Champions League matches only". So this is not a page that looks
// like the board: it IS the board, rendered with its column set narrowed
// to one. `PickerBoard` takes `only`, and everything the landing page
// draws — the matchday bands, the shared sort control, the rank
// dumbbells, the tier cells, the refusal blocks with their reasons, the
// live strip above it all — arrives here because it is the same
// component, not a copy that would drift from it on the first change
// made to either.
//
// WHY NOT /bet-suggester/comp/ucl. That route exists and is a different
// product: the competition VIEWER, which centres a market's prices and
// the model's share of them. It is the right page for "what does the
// book say about this tie" and the wrong one for "rank these ties by
// what the tables say", which is what the picker board is for. Both now
// exist and the chips name them apart.
import PickerBoard from "./index";

export default function UclBoard() {
  return (
    <PickerBoard
      only={["ucl"]}
      pageTitle="Champions League"
      backTo={{ href: "/bet-suggester", label: "board" }}
    />
  );
}

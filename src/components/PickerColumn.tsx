// One league's column on the picker board: the upcoming fixtures, and
// below them the FINISHED TAIL.
//
// The card and its chips moved here verbatim from
// pages/bet-suggester/index.tsx when the board went four-up (2026-08-31);
// the honesty rules travelled with them:
//
//  - RANKS, NEVER CUTS: every row this column is handed is drawn, under
//    every sort mode. Sorting is presentation (see lib/pickerSort.ts).
//  - ANNOTATE, NEVER VETO: tiers, shape and the Kalshi line decorate a
//    row; none of them can remove one.
//  - REFUSALS ARE LISTED at the column's foot with club and reason — a
//    fixture that vanishes silently is the defect this surface is built
//    against.
//  - No tip / edge / probability language anywhere.
//
// THE TAIL (2026-08-31). The board used to lose a fixture at kickoff:
// "once a match finished I have no way to access it to see where could I
// do better." The finished matches of the last few days now stack BELOW
// this column's upcoming ones, under a divider, because the league column
// is where the operator already looks and it keeps a league's story
// continuous. The tail sorts on its own keys and remembers its own choice
// — picking "ask price" above must not reorder the matches below.
// Its card lives in components/ReviewCard.tsx.
//
// The read primitives (gap chips, shape sentence, the Kalshi cell) moved
// to components/PickerRead.tsx so the tail renders THE SAME READ this
// column does, rather than a hand-copied one free to drift from it.
import Link from "next/link";
import { useId, useState } from "react";
import {
  AXIS_ORDER, Axis, FieldRead, Ratings, fieldFor,
} from "../lib/fieldApi";
import { dayLabel, fmtDate, localDay } from "../lib/matchday";
import {
  BoardRefusal, BoardRow, LeagueMeta, RatePair, RowField, SEASON_BLEND_K,
  homeBadge, leagueLabel, rowHref, seasonDisagreement, seasonSpan,
  seasonSpanLabel, venueDisagreement,
} from "../lib/pickerApi";
import {
  ReviewLeagueMeta, ReviewRefusal, ReviewRow,
} from "../lib/pickerReview";
import {
  COLUMN_DEFAULT_SORT, ColumnSort, DEFAULT_SORT, SortModeId, columnSort,
  isDefaultSort, modeById, sortRows,
} from "../lib/pickerSort";
import {
  GapNote, KalshiCell, RegTimeNote, TierGaps, WITHHELD,
  dec, sign,
} from "./PickerRead";
import { ReviewTail } from "./ReviewCard";
import { WatchToggle } from "./WatchDeclaration";
import { Eyebrow } from "./ui";

// ---------------------------------------------------------------------
// The Floodlit identity (2026-09-01). Each league column carries its own
// hue — WAYFINDING ONLY: rails, the favourite's pip, the dumbbell span.
// Data ink stays on the gray ladder; gold stays the brand and rank 01.
// ---------------------------------------------------------------------
//
// A COMPETITION WITH TWO NEIGHBOURS NEEDS ITS OWN LIGHT (2026-09-08).
// `--lg-cup` was the fallback for everything outside the four leagues,
// which held only while at most one such column was drawn. With the
// Champions League and the Leagues Cup side by side the fallback made
// them the SAME gold — the rail, the favourite pip and the dumbbell span
// all identical — so the one ink whose job is telling columns apart told
// the reader nothing. The UCL is named here now; the fallback stays for
// a competition nobody has picked a hue for yet, which is honest (an
// unassigned column looks unassigned) rather than a collision.
const LEAGUE_HUE: Record<string, string> = {
  mls: "var(--lg-mls)", epl: "var(--lg-epl)", laliga: "var(--lg-laliga)",
  ligamx: "var(--lg-ligamx)", ucl: "var(--lg-ucl)",
};
export const hueOf = (slug: string) => LEAGUE_HUE[slug] ?? "var(--lg-cup)";

/** The card's ANCHOR: the active sort metric, displayed signed the way
 *  the reader thinks about it — so a column scans as a ranked ladder of
 *  one number. Sorting by kickoff keeps GD/g (a time is not a
 *  magnitude); a missing quote says "no quote", a withheld gap says the
 *  board's own word for it. */
type AnchorId = Exclude<SortModeId, "kickoff" | "shape"> | "own_gdg";

function anchorFor(row: BoardRow, modeId: SortModeId):
  { v: string; k: string; k2?: string; basis?: string; id: AnchorId } {
  // a time is not a magnitude, and neither is a shape — the shape is
  // already on the card as its coloured chip, so both keys fall back to
  // a measured gap for the anchor number.
  //
  // WHICH GAP FOLLOWS THE ROW (operator, 2026-09-08). GD/g is the
  // board's anchor and it is WITHHELD on a cross-league row, because
  // 2.0 ppg in one league is not 2.0 ppg in another and the backend
  // refuses the subtraction. On the four league columns that null is
  // rare and informative. On the UCL column it would be EVERY CARD, and
  // a surface where every anchor is withheld reads as broken rather
  // than as honest. The tier gap is the comparison two different tables
  // genuinely support, so a cross-league row anchors on it — and a
  // same-league UCL fixture, two English clubs drawn together, keeps
  // GD/g like any other. Derived from `cross_league` per row rather
  // than from the competition, for the same reason the backend derives
  // the withholding that way.
  //
  // AND THE TIER GAP WAS NOT A NUMBER EITHER (operator, 2026-09-09, on a
  // screenshot of the Champions League column: "also calculate GD/g gap
  // between teams and replace that big number of tier ovr" — after "there
  // is no way Barcelona tiers are even to Rotterdam"). He is right, and
  // the tier gap is not wrong so much as EMPTY here: a tier is a
  // within-league quintile, both clubs are top-fifth at home, so the gap
  // is 0 — on ten of the twelve rows of that matchday. An anchor that
  // reads "+0" on ten cards ranks nothing.
  //
  // `own_gdg` IS THE NUMBER THAT REPLACES IT, and it is emphatically not
  // the withheld `gdg_gap` recomputed on the client: the backend refuses
  // that subtraction because the two clubs share no scale, and doing it
  // here would hide the decision from every guard that watches it. It is
  // the DIFFERENCE OF TWO OWN-LEAGUE MARGINS — Barcelona's +2.18 over La
  // Liga against Feyenoord's +0.91 over the Eredivisie — which is a true
  // sentence about two measured rates and a different claim from "1.27
  // goals a game better". The row carries `basis` saying so in the
  // backend's own words, and the label below says it in two lines.
  //
  // A ROW WITHOUT IT FALLS BACK EXACTLY AS BEFORE. `own_gdg` is optional
  // on the type because a board built before 2026-09-09 has no such key,
  // and this surface must never turn a missing field into a claim.
  const own = row.own_gdg?.diff;
  const fallback: AnchorId = !row.cross_league ? "gdg"
    : own != null ? "own_gdg" : "tier_ovr";
  const id = modeId === "kickoff" || modeId === "shape" ? fallback : modeId;
  return { ...anchorValue(row, id), id };
}

function anchorValue(row: BoardRow, id: AnchorId):
  { v: string; k: string; k2?: string; basis?: string } {
  switch (id) {
    case "gdg": return { v: dec(row.gdg_gap), k: "GD/g gap" };
    // TWO LINES, BOTH LOAD-BEARING. "own-league GD/g" is what each of
    // the two numbers is; "differenced" is the only thing done to them.
    // Neither line may be dropped to save a row of 8.5px type: "GD/g"
    // alone is the withheld gap's name, and this is not that number.
    case "own_gdg": return { v: dec(row.own_gdg?.diff), k: "own-league GD/g",
                             k2: "differenced", basis: row.own_gdg?.basis };
    case "ppg": return { v: dec(row.ppg_gap), k: "ppg gap" };
    case "rank": return { v: sign(row.rank_gap), k: "rank gap" };
    case "tier_ovr": return { v: sign(row.tier_gaps.ovr), k: "tier · ovr" };
    case "tier_atk": return { v: sign(row.tier_gaps.atk), k: "tier · atk" };
    case "tier_def": return { v: sign(row.tier_gaps.def), k: "tier · def" };
    case "ask": return row.kalshi?.ask_c == null
      ? { v: WITHHELD, k: "no quote" }
      : { v: `${row.kalshi.ask_c}¢`, k: "ask" };
    case "spread": return row.kalshi?.spread_c == null
      ? { v: WITHHELD, k: "no quote" }
      : { v: `${row.kalshi.spread_c}¢`, k: "spread" };
    case "depth": return row.kalshi?.ask_size == null
      ? { v: WITHHELD, k: "no quote" }
      : { v: row.kalshi.ask_size >= 1000
            ? `${(row.kalshi.ask_size / 1000).toFixed(1)}k`
            : String(row.kalshi.ask_size), k: "depth" };
  }
}

/** THE TWO CLUBS' OWN RATES, BESIDE A GAP THAT IS WITHHELD — favourite
 *  then opponent, the idiom the ranks pair beside it already uses.
 *
 *  WHAT THIS FIXES (operator, 2026-09-09). The Champions League card read
 *  "GD/g n/a  ppg n/a  rank n/a" while the payload it was drawn from
 *  carried Barcelona ppg 2.62 / GD/g 2.18 and Feyenoord 2.01 / 0.91.
 *  Three `n/a`s over data the row already had is not honesty, it is a
 *  blank — the refusal is of the SUBTRACTION, never of the measurements.
 *
 *  AND IT IS DRAWN BESIDE THE REFUSAL, NEVER OVER IT. The `n/a` stays
 *  exactly where it was and keeps saying what it says: this adds what is
 *  known, and a reader can still see that the gap itself was declined.
 *  Nothing is drawn at all unless BOTH sides are measured — one club's
 *  rate alone is half a pair, and half a pair invites the arithmetic
 *  that produced the missing half. */
function OwnRates({ gap, pair, metric }: {
  gap: number | null; pair?: RatePair; metric: string;
}) {
  if (gap != null || !pair) return null;
  const [f, o] = pair;
  if (f == null || o == null) return null;   // missing is never zero
  return (
    <span data-testid="own-rates" data-metric={metric} className="text-ink-mid">
      {" · "}{f.toFixed(2)} <span className="text-ink-faint">v</span>{" "}
      {o.toFixed(2)}
    </span>
  );
}

/** WHICH LADDER THIS CARD'S TWO RANKS ARE READ ON, and how many rungs
 *  it has. Derived once per card and handed to BOTH the ranks pair and
 *  the dumbbell, so the number a reader sees and the position the
 *  instrument draws can never come from different tables.
 *
 *  `n` IS NULL WHEN THERE IS NO SHARED LADDER — a cross-league tie with
 *  no field — and that null is the dumbbell's refusal, below. */
function rankPair(row: BoardRow, field: RowField | null | undefined,
                  clubCount: number): {
  fav: number; opp: number; n: number | null; basis: "field" | "league";
  title: string;
} {
  if (field) {
    const fav = field.axes.ovr.fav.rank, opp = field.axes.ovr.opp.rank;
    const n = Math.max(field.size, fav, opp, 2);
    return { fav, opp, n, basis: "field",
      title: `ranks in this competition's own field of ${n} — favourite `
        + `#${fav}, opponent #${opp}. One ladder both clubs stand on, `
        + "not two domestic tables read side by side." };
  }
  const fav = row.ranks.fav, opp = row.ranks.opp;
  return {
    fav, opp, basis: "league",
    /* A CROSS-LEAGUE ROW HAS NO N, and the difference is the whole
       point: these two numbers are positions in two different tables,
       so there is no axis to place them on and the dumbbell draws
       nothing. `rated_in` on the card already names the two tables. */
    n: row.cross_league ? null : Math.max(clubCount, fav, opp, 2),
    title: row.cross_league
      ? `league positions in two DIFFERENT tables — favourite #${fav} in `
        + "its own, opponent #" + opp + " in its own. They share no "
        + "ladder, so this pair is two facts and not a comparison."
      : `league ranks — favourite #${fav}, opponent #${opp}`,
  };
}

/** THE RANK DUMBBELL — both clubs on the real 1..N axis they are BOTH
 *  rated on: ● favourite (league hue), ○ opponent. Position says how
 *  good the favourite is, the lit span says how far apart the pair
 *  sits — the picker's premise in one 9px instrument.
 *
 *  THE REFUSAL, AND EXACTLY WHAT IT IS A REFUSAL OF (2026-09-09). This
 *  opened `if (row.cross_league) return null`, on the reasoning that a
 *  cross-league tie has no shared axis and so gets no instrument — the
 *  same honesty as its withheld gaps. That reasoning is unchanged and
 *  the refusal stays; what changed is that "cross-league" and "no
 *  shared axis" turned out to be two different facts.
 *
 *  A LEAGUE PAIR IS NOT AN AXIS. Roma's 2nd in Serie A and Fenerbahce's
 *  2nd in the Süper Lig are positions in two tables of different
 *  lengths, cut from different fixtures, against different opposition.
 *  Drawing both pips at the same spot would assert a level match nobody
 *  measured — and the span between them, which is what this instrument
 *  is FOR, would be the distance between two numbers that were never
 *  subtracted.
 *
 *  A FIELD IS. When the competition has been measured as one field, its
 *  1..N ordering is a single ladder built from one corpus, and both
 *  clubs have a real place on it — so `#7 v #33 of 36` is one sentence
 *  and the span between them is a measured distance. That is the ONLY
 *  thing that unlocks the instrument here; every UCL league-phase
 *  fixture is cross-league, so without it this drew nothing at all.
 *
 *  So the test is the shared ladder, asked as `ranks.n` — which
 *  `rankPair` returns null for on a cross-league row with no field, and
 *  which is therefore the old refusal stated in terms of the thing it
 *  was always about. */
function RankDumbbell({ ranks }: { ranks: ReturnType<typeof rankPair> }) {
  const n = ranks.n;
  if (n == null) return null;
  const pos = (k: number) => 2 + (96 * (k - 1)) / (n - 1);
  const a = pos(ranks.fav), b = pos(ranks.opp);
  const lo = Math.min(a, b), w = Math.abs(b - a);
  return (
    <span data-testid="rank-dumbbell" aria-hidden data-basis={ranks.basis}
      data-of={n}
      title={`${ranks.basis === "field" ? "field" : "league"} ranks on the `
        + `1–${n} axis: favourite #${ranks.fav}, opponent #${ranks.opp}`}
      className="relative mt-2 block h-[9px]">
      <span className="absolute left-0 right-0 top-[4px] h-px bg-line" />
      <span className="absolute top-[4px] h-px opacity-60 [background:var(--lg)]"
        style={{ left: `${lo}%`, width: `${w}%` }} />
      <span className="absolute top-[0.5px] h-2 w-2 -translate-x-1/2 rounded-full [background:var(--lg)]"
        style={{ left: `${a}%` }} />
      <span className="absolute top-[1px] h-[7px] w-[7px] -translate-x-1/2 rounded-full border border-ink-low bg-bs"
        style={{ left: `${b}%` }} />
    </span>
  );
}

/** Last-≤5 results as five tiny cells — the same traffic light as the
 *  rest of the board (W green, L red) with draws NEUTRAL, matching the
 *  match hubs' form chips: a draw is not a warning. Oldest→newest, so
 *  the rightmost cell is the latest result; the title spells it out. */
const FORM_SLOTS = 5;
function FormStrip({ form, name, scope, cupScope, className = "" }: {
  form?: string | null; name: string; scope?: string;
  cupScope?: boolean; className?: string;
}) {
  if (!form) return null;
  // FIXED WIDTH, right-aligned (2026-09-01): five slots always, empty
  // ones drawn as faint placeholders, real results filling from the
  // RIGHT so the newest result is the rightmost cell and every strip on
  // the board lines up to the same column edge no matter how many games
  // a club has played. The latest cell is ringed so "which is now" reads
  // without counting.
  const letters = form.slice(-FORM_SLOTS).split("");
  const pad = FORM_SLOTS - letters.length;
  const slots = [...Array(pad).fill(null), ...letters];
  return (
    // NOT aria-hidden. The strip was invisible to a screen reader
    // entirely, so its only description was a mouse-only tooltip. It has
    // a real accessible name now, and that name states the COMPETITION —
    // a cup row's WWWW is its cup run, and reading it as league form is
    // exactly what happened on the semi-final night.
    <span data-testid="form-strip" role="img"
      data-scope={scope}
      aria-label={`${name} — last ${form.length} in ${scope ?? "this competition"}`
        + `, oldest to newest: ${form.split("").join(" ")}`}
      title={`${name} — last ${form.length} in ${scope ?? "this competition"}`
        + `, oldest→newest: ${form} (rightmost is latest)`}
      className={`inline-flex flex-none items-center gap-[2px] ${className}`}>
      {slots.map((c, i) => {
        const latest = i === FORM_SLOTS - 1 && c != null;
        return (
          <i key={i} data-r={c ?? ""}
            className={`h-[7px] w-[7px] rounded-[1.5px] ${
              c == null ? "border border-line"
              : c === "W" ? "bg-up/85"
              : c === "L" ? "bg-neg/75"
              : "bg-line-strong"}${
              latest ? " ring-1 ring-ink-hi/70 ring-offset-1 ring-offset-bs" : ""}`} />
        );
      })}
      {/* Only a CUP scope gets a visible mark. A league row's form being
          league form is what every reader already assumes, so labelling
          it would cost every card pixels to say nothing. The surprising
          case is the one that has to speak. */}
      {cupScope && (
        <span data-testid="form-scope"
          className="ml-1 font-mono text-[7px] uppercase tracking-[0.1em] text-ink-faint">
          cup
        </span>
      )}
    </span>
  );
}

/** One match card. `rank` is the row's position under the column's
 *  CURRENT sort — the badge follows the reader's chosen order, it does
 *  not fossilise the default one. */
/** Does this row's season basis DEPART from its column's?
 *
 *  THE BASIS IS A LEAGUE FACT AND THE HEADER ALREADY STATES IT. Every
 *  club in a league is rated on the same table, so `this szn · min 22
 *  GP` (or `prior szn`) is true of the column, and a chip repeating it
 *  on all 29 cards says one sentence 29 times — which reads as though it
 *  varied between them, and buries the rows where it actually does.
 *
 *  It varies in exactly three ways, and each is a real fact about THIS
 *  fixture rather than its league:
 *    - a side with no prior-season row is rated on this season alone and
 *      reported at 100%, so the blend is not the column's blend;
 *    - a frozen-weight control row is not weighted by games played at
 *      all;
 *    - this season ALONE concludes something materially different from
 *      the blend the board ranks on (or flips its sign) — the one case
 *      where the reader needs to know which cut they are reading.
 *  A row whose `src` differs from its column's is the fourth: a cup tie
 *  folded into a league column can be rated on a different basis than
 *  the column it is drawn in.
 *
 *  NOTHING DRAWS ANY OF IT ANY MORE. The operator called it twice,
 *  after seeing both renderings on the real board: no season chip on a
 *  row, at all — the reasoning sits at the chip's old site in RowCard.
 *  The derivation outlives the ink: the reason is returned and carried
 *  as `data-season-departure`, so a guard reads it and an ordinary row
 *  carries no such attribute. */
export function seasonDeparture(
  row: BoardRow, colSrc?: string | null,
  alt?: { blended: number; current: number; delta: number } | null,
): string | null {
  const w = row.weights;
  if (!w) {
    return row.src && colSrc && row.src !== colSrc
      ? `rated on ${row.src === "prior" ? "last" : "this"} season, unlike this column`
      : null;
  }
  if (alt) return "this season alone concludes differently — see the title";
  if (w.constant != null) return "frozen-weight control, not weighted by games played";
  if (w.basis.home === "current_only" || w.basis.away === "current_only")
    return "a side has no prior-season row and is rated on this season alone";
  return null;
}

/** THE BOARD'S READ OF ONE FIXTURE — the matchup line and its anchor,
 *  the rank dumbbell, Stage 1 and Stage 2 — LIFTED OUT OF RowCard
 *  VERBATIM so a second surface can render THE SAME READ rather than a
 *  hand-copied lookalike.
 *
 *  WHY IT EXISTS. The live card's flip shows the prematch read on its
 *  back, and the first draft of that hand-rewrote this block in its own
 *  CSS. The operator rejected exactly that: two layouts for one read is
 *  how two surfaces begin disagreeing about one fixture, and the second
 *  one drifts silently because nothing renders them side by side.
 *
 *  NOTHING WAS RESTYLED IN THE MOVE. Every element, class, attribute and
 *  prop below is what RowCard held, in RowCard's order; the three values
 *  it derives (`badge`, `anchor`, `alt`) are the same pure calls off the
 *  same `row` and `modeId`. A component boundary adds no DOM, so
 *  RowCard's output is unchanged — which e2e/picker.spec.ts and
 *  e2e/picker-blend-cup.spec.ts prove, unedited, on every run. */
export function RowRead({ row, modeId, clubCount, dense = false, hoisted,
                         field }: {
  row: BoardRow; modeId: SortModeId; clubCount: number;
  /** WHERE THESE TWO CLUBS STAND IN THE COMPETITION'S OWN FIELD, when
   *  one has been measured — see pickerApi.RowField and fieldApi.fieldFor.
   *  It is a DATA substitution and adds one mark: the ranks pair, the
   *  dumbbell's axis, the tier trio and the shape chip read the field
   *  instead of two domestic tables, and an `i` beside the trio opens
   *  the field's three rank pairs. Absent everywhere else, and the read
   *  below is then what it has always been. */
  field?: RowField | null;
  /** what this row's COLUMN header already states — see columnNotes. A
   *  note whose text the header carries is not drawn again down here.
   *  Absent off the board (LiveCard), where there is no header. */
  hoisted?: ColumnNoteSet;
  /** THIS CARD IS IN A NARROW TRACK — see DENSE_GRID below.
   *
   *  A dense board lays up to four matches across the width one column
   *  used to have, so from `md` up the card is ~200px wide instead of the
   *  ~330px every element here was drawn against. Everything this flag
   *  switches is a REFLOW, never a cut: the anchor drops under the
   *  matchup instead of competing with it for the same line, club names
   *  WRAP instead of truncating to three letters, and the inter-item gaps
   *  tighten. Nothing is removed and no type shrinks — a narrow card says
   *  everything a wide one says, taller.
   *
   *  DEFAULT FALSE, AND THAT MATTERS. The multi-league board and the live
   *  card's flip (components/LiveCard.tsx) both render this component
   *  without the flag, so their output is what it was. */
  dense?: boolean;
}) {
  const badge = homeBadge(row);
  const anchor = anchorFor(row, modeId);
  const alt = seasonDisagreement(row);
  const ranks = rankPair(row, field, clubCount);
  /* THE VENUE RULE'S DISAGREEMENT, ON THE BADGE THAT IS ABOUT THE VENUE
     (2026-09-08). The backend has carried `venue_favourite` on every
     rated row since 2026-09-03 so the disagreement is countable before
     anyone acts on it; the frontend did not declare it, so it was
     invisible everywhere and countable nowhere.
     IT GETS NO INK OF ITS OWN, and that is the decision rather than an
     omission: on the live board a quarter of the rows disagree, a chip
     on a quarter of the cards would read as a second favourite, and
     this rule is OFF — nothing on this row moved. So it rides the H/A/N
     badge's own sentence, which is already the card's statement about
     who is at home, and `data-venue-disagrees` on the card carries it
     for a guard. The case that DOES change the row — the policy on, the
     favourite named by the venue — is drawn, in RowCard. */
  const vd = venueDisagreement(row);
  const badgeTitle = badge && vd
    ? `${badge.title}. A venue-aware rule the board does NOT act on would `
      + `name ${vd.favourite} here instead: the gap between these two is `
      + `${vd.gdg_gap_abs.toFixed(2)} GD/g, under its ${vd.threshold.toFixed(2)} `
      + `bar. It is annotation, it is switched off, and nothing on this `
      + `card is signed to it.`
    : badge?.title;
  return (
    <>
      {/* The fixture line is the way IN. A board of ranked matches you
          cannot open is a list of names — every dashboard already links
          this same id space. Wraps only the matchup, so the Stage-1/2
          numbers below stay plain text. */}
      {/* THE MATCHUP + THE ANCHOR. Two team lines with the ● / ○ pips
          that also mark the dumbbell's ends — the mapping teaches
          itself — and the active sort metric as a 20px right-anchored
          number, so the column scans as a ranked ladder without reading
          a word. The whole block stays the link in. */}
      <Link
        href={rowHref(row)}
        aria-label={`open ${row.favourite} versus ${row.opponent}`}
        className={`mt-2.5 flex items-start gap-3 rounded-md outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs${
          // THE ANCHOR STOPS COMPETING WITH THE NAMES FOR ONE LINE. Side
          // by side in a ~200px track the figure takes ~60px of it and
          // "Manchester City" is left with room for "Man…". Stacked, the
          // names get the whole width and the figure keeps its 20px.
          dense ? " md:flex-col md:items-stretch md:gap-1" : ""}`}>
        <span className="min-w-0 flex-1">
          {/* THE FORM STRIP DROPS TO ITS OWN LINE BEFORE THE NAME BREAKS.
              A cup strip is 5 cells plus the word "cup" — ~70px of a
              ~170px track — and beside a name it left "Manchester City"
              with room for "Manchest". Flex line-breaking measures each
              item at its max-content, so the strip wraps below exactly
              when the whole name will not sit next to it, and the name
              then gets the line to itself. `ml-auto` keeps it at the
              right edge on whichever line it lands on. */}
          <span className={`flex min-w-0 items-center gap-2${
            dense ? " md:flex-wrap" : ""}`}>
            <span aria-hidden
              className="h-2 w-2 flex-none rounded-full [background:var(--lg)]" />
            <span
              className={`text-[15.5px] font-semibold text-ink-hi [font-family:var(--font-archivo)] [font-stretch:95%] ${
                // A CLUB NAME WRAPS RATHER THAN TRUNCATING IN A NARROW
                // TRACK. `truncate` is the right answer at 330px, where
                // it fires on the two longest names in Europe; at 200px
                // it fires on most of them, and a board of "Bayer Le…"
                // is a board you cannot read. `anywhere` rather than
                // `break-word` so the span's min-content contribution is
                // zero and a long name can never push the row wider than
                // its track.
                dense ? "min-w-0 [overflow-wrap:anywhere]" : "truncate"}`}
              title={`${row.favourite} v ${row.opponent}`}>
              {row.favourite}
            </span>
            {badge && (
              <span data-testid="home-badge" data-venue={row.venue_class?.class}
                className={`flex-none rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
                  badge.text === "N"
                    ? "border-warn/40 text-warn" : "border-line text-ink-low"}`}
                title={badgeTitle}>
                {badge.text}
              </span>
            )}
            <FormStrip form={row.form?.fav} name={row.favourite}
              scope={row.form?.scope} cupScope={row.form?.scope_is_cup}
              className="ml-auto pl-2" />
          </span>
          <span className={`mt-0.5 flex min-w-0 items-center gap-2${
            dense ? " md:flex-wrap" : ""}`}>
            <span aria-hidden
              className="h-[7px] w-[7px] flex-none rounded-full border border-ink-low bg-bs" />
            <span className={`text-[12.5px] text-ink-low [font-family:var(--font-archivo)] [font-stretch:96%] ${
              dense ? "min-w-0 [overflow-wrap:anywhere]" : "truncate"}`}>
              <span className="text-ink-faint">vs </span>{row.opponent}
            </span>
            <FormStrip form={row.form?.opp} name={row.opponent}
              scope={row.form?.scope} cupScope={row.form?.scope_is_cup}
              className="ml-auto pl-2" />
          </span>
        </span>
        <span className={`flex-none text-right${
          // Stacked (dense, md+) the figure and its key sit on ONE line
          // at the matchup's right edge, rather than costing two. The
          // key is still directly beside the number it names.
          dense ? " md:flex md:items-baseline md:justify-end md:gap-2" : ""}`}>
          {/* THE COUNTERFACTUAL, CARRIED WITHOUT INK (2026-09-07). It used
              to ride on the season chip; when the chip went it moved to
              the figure it contradicts, as a warn-coloured asterisk. The
              operator has now called the asterisk too, and the reasoning
              for removing it is the same reasoning that removed the chip:
              a mark on the number reads as a QUALIFIER on the number, and
              this is not one — the board ranks on the blend and the blend
              is what the figure says. So the ink goes and the fact stays.
              It is an ATTRIBUTE on the anchor, which keeps three things:
              the hover sentence for a reader who wants it, a handle for
              the guard below, and an ordinary row that carries no such
              attribute at all rather than one asserting agreement. */}
          <span data-testid="row-anchor" data-anchor={anchor.id}
            {...(alt ? {
              "data-season-alt": dec(alt.current),
              "data-season-blend": dec(alt.blended),
              title: `ON THIS SEASON ALONE the ${anchor.k} is ${dec(alt.current)}, not ${dec(alt.blended)} — the board ranks on the blend, and this says what the other cut would have concluded`,
            } : {})}
            className={`block font-mono text-[20px] font-semibold leading-none tabular-nums ${
              anchor.v === WITHHELD ? "font-normal text-ink-faint" : "text-ink-hi"}`}>
            {anchor.v}
          </span>
          {/* THE KEY, AND WHERE A SECOND LINE COMES FROM. Most anchors
              name themselves in three words. `own_gdg` cannot: it is a
              difference of two numbers measured on two different scales,
              and a label reading "GD/g" would be the name of the gap the
              backend REFUSES. So it says what the two numbers are and
              what was done to them, on two lines, with the backend's own
              basis sentence on hover. */}
          <span data-testid="anchor-key"
            title={anchor.basis || undefined}
            className={`mt-1 block font-mono text-[8.5px] uppercase leading-[1.35] tracking-[0.12em] text-ink-low${
              dense ? " md:mt-0" : ""}`}>
            {anchor.k}
            {anchor.k2 && <span className="block">{anchor.k2}</span>}
          </span>
        </span>
      </Link>

      <RankDumbbell ranks={ranks} />

      {/* Stage 1 — the ranking inputs, favourite-signed. The metric the
          anchor already shows is not repeated down here; the ranks pair
          names what the dumbbell draws. */}
      {/* ALREADY flex-wrap, and that is what makes it survive: the five
          items reflow onto two or three lines in a narrow track rather
          than running off the edge. Only the gap tightens, so more of
          them fit per line. */}
      <div className={`mt-2.5 flex flex-wrap items-baseline gap-y-1 font-mono text-[10.5px] tabular-nums ${
        dense ? "gap-x-4 md:gap-x-2.5" : "gap-x-4"}`}>
        {/* THE RANKS PAIR, ON WHICHEVER LADDER IS REAL (operator,
            2026-09-09). "#7 v #33 = rank of 36." On a league column
            these are the two clubs' places in that league, which is one
            ladder and a true comparison. On a cross-league tie they
            were two places in two DIFFERENT tables — "AS Roma #2 v
            Fenerbahce #2", which reads as a level match and is not a
            comparison at all — so where the competition has a field of
            its own, that field's ladder is the one both clubs really
            stand on and its ranks are the ones drawn. Same element,
            same ink, same slot; only the ladder changed, and the title
            names which one it is. */}
        <span data-testid="rank-pair"
          data-basis={ranks.basis} data-of={ranks.n ?? undefined}
          title={ranks.title} className="text-ink-faint">
          #{ranks.fav} v #{ranks.opp}
        </span>
        {anchor.id !== "gdg" && (
          <span className="text-ink-low">
            GD/g <span className="text-ink-mid">{dec(row.gdg_gap)}</span>
            <OwnRates gap={row.gdg_gap} pair={row.rates?.gdg} metric="gdg" />
          </span>
        )}
        {modeId !== "ppg" && (
          <span className="text-ink-low">
            ppg <span className="text-ink-mid">{dec(row.ppg_gap)}</span>
            <OwnRates gap={row.ppg_gap} pair={row.rates?.ppg} metric="ppg" />
          </span>
        )}
        {modeId !== "rank" && (
          <span className="text-ink-low">
            rank <span className="text-ink-mid">{sign(row.rank_gap)}</span>
          </span>
        )}
        <span className="text-ink-faint">
          gp {row.gp_current.home ?? "—"}/{row.gp_current.away ?? "—"}
        </span>
      </div>

      {/* Stage 2 — the three tier gaps, each drawn on its own. Shared
          with the finished tail (components/PickerRead.tsx), so a read
          below the divider is THE SAME READ as one above it. */}
      <div className="mt-3">
        <TierGaps read={row} dense={dense} field={field} />
      </div>

      {/* A WITHHELD GAP SAYS WHY, in the backend's own words — HERE only
          when the column header is not already saying it (see
          columnNotes). On a UCL matchday every card carried the same
          ~90-word paragraph, which on a six-abreast board was most of
          the ink on the page; the column now says it once and this
          renders nothing. The `n/a` values above are untouched — what
          moved is the EXPLANATION, never the refusal.
          Off the board — LiveCard's prematch flip renders this component
          with no `hoisted` at all — there is no column header to hoist
          to, so the note stays exactly where it was. */}
      {row.gap_note && row.gap_note !== hoisted?.gap
        && <GapNote note={row.gap_note} />}
    </>
  );
}

function RowCard({ row, rank, modeId, clubCount, colSrc, dense = false,
                  hoisted, field }: {
  row: BoardRow; rank: number; modeId: SortModeId; clubCount: number;
  colSrc?: string | null;
  /** in a narrow dense-grid track — see RowRead's own `dense` note */
  dense?: boolean;
  /** the notes this column's header already states — see columnNotes */
  hoisted?: ColumnNoteSet;
  /** THE COLUMN'S CROSS-LEAGUE FIELD — one read for the whole column.
   *  The card does not draw it as a block of its own: it substitutes
   *  the DATA behind marks the card already has (see fieldFor and
   *  PickerRead.TierGaps). */
  field?: FieldRead;
}) {
  const cross = row.cross_league === true;
  /* THIS FIXTURE'S PLACE IN THAT FIELD, DERIVED ONCE PER CARD. Null for
     every league column, for a competition nobody has measured, for a
     read that failed, and for a fixture with a club the field does not
     hold — and in every one of those the card draws its league read
     whole, exactly as it did before this key existed. */
  const fld = fieldFor(row, field?.error ? null : field?.data);
  const alt = seasonDisagreement(row);
  const departure = seasonDeparture(row, colSrc, alt);
  /* WHICH RULE NAMED THE FAVOURITE THIS CARD IS SIGNED FROM. "rank" on
     every row the board serves today, and the card says nothing — that
     is the board's own rule and repeating it 108 times would be noise.
     "venue" means the policy is ON and this row's favourite is a side
     the table rates LOWER, which makes every signed number below —
     the three gaps, the tier pairs, the shape — read from that side.
     A card whose numbers all changed sign without a word for it would
     contradict itself, so THAT case is drawn.
     The disagreement while the policy is off is a different fact and
     stays as data (see `venueDisagreement` and the badge's sentence):
     nothing on this row moved, so nothing on it should say otherwise. */
  const vd = venueDisagreement(row);
  const flipped = row.fav_source === "venue";
  return (
    <article
      data-testid="picker-row"
      data-shape={row.shape}
      data-league={row.league}
      data-column={row.column ?? row.league}
      data-event={row.event_id}
      data-cross-league={cross ? "true" : "false"}
      data-season-departure={departure ?? undefined}
      data-fav-source={row.fav_source ?? undefined}
      data-venue-disagrees={vd ? vd.favourite : undefined}
      /* WHICH LADDER THIS CARD'S RANKS AND TIERS ARE READ ON. A guard
         reads it, and a card with no field carries no such attribute at
         all rather than one asserting a league basis it shares with
         every other card on the board. */
      data-field={fld ? (fld.competition ?? "field") : undefined}
      data-field-size={fld ? fld.size : undefined}
      className={`rounded-xl border transition-colors bg-gradient-to-b from-elev2/60 to-elev/40 ${
        dense ? "p-4 md:p-3" : "p-4"} ${
        rank === 1
          ? "border-accent/35 hover:border-accent/60"
          : "border-line hover:border-line-strong"}`}
    >
      <div className={`flex flex-wrap items-baseline gap-y-1 ${
        dense ? "gap-x-3 md:gap-x-2" : "gap-x-3"}`}>
        <span data-testid="row-rank"
          className={`font-mono text-[11px] tabular-nums ${
            rank === 1 ? "text-accent" : "text-ink-faint"}`}>
          {String(rank).padStart(2, "0")}
        </span>
        {/* NO SEASON CHIP ON A ROW, AT ALL. The basis belongs to the
            column header — `this szn · min 22 GP` — and to the fixture
            count beside it; every club in a league is rated on the same
            table, so a chip on a card repeats one sentence down the whole
            column. Drawing it only on the rows that DEPART was worse than
            either alternative: a chip appearing on some cards and not
            others reads as a fact that varies fixture by fixture, which
            is what it looked like on the board and is not what it means.
            The departure is still DERIVED and still carried, as data on
            the row rather than as ink on it (see data-season-departure),
            so nothing about it is lost and a guard can still read it. */}
        {/* THE COMPETITION, when it is not the column. A Leagues Cup tie
            between two Liga MX clubs is drawn in the Liga MX column
            because that table describes it completely — but it is still
            a cup tie, and a card that let the reader assume "Liga MX
            fixture" would be quietly wrong about what the price settles
            on. This badge is the whole reason the fold is safe. */}
        {row.column && row.column !== row.league && (
          <span data-testid="competition-badge"
            title={`${leagueLabel(row.league)} fixture, shown in the ${leagueLabel(row.column)} column because both clubs are rated on that table`}
            className="rounded border border-accent/40 bg-accent/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
            {leagueLabel(row.league)}
          </span>
        )}
        {/* WHICH TABLE EACH CLUB WAS RATED ON. Only worth saying when
            they differ — on a league column both sides are the column
            itself, and repeating it would be noise. */}
        {cross && row.rated_in && (
          <span data-testid="rated-in"
            title="each club is rated on its own domestic league's table — this cup has none of its own"
            className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
            {leagueLabel(row.rated_in.home)} v {leagueLabel(row.rated_in.away)}
          </span>
        )}
        {/* THE FAVOURITE ON THIS CARD IS NOT THE TABLE'S. Only with
            PICKER_VENUE_FAVOURITE on, which it is not on any board
            served today — and exactly because it is not, the card would
            otherwise ship a silent contradiction the first time it is:
            every signed number below is read from the side the venue
            named, so a rank_gap of −3 is the row stating that the
            favourite is three places WORSE, not a sign bug. */}
        {flipped && (
          <span data-testid="fav-source-venue"
            title={`The venue-aware rule named the favourite on this card, not the league table — ${row.favourite} is at home and the table gap between these two is under that rule's bar. Every signed figure below is read from ${row.favourite}'s side, so a negative gap here means the favourite is the lower-rated club. The rule is annotation the board has been switched to act on; it is not a measured edge.`}
            className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
            fav · venue rule
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-faint">
          {fmtDate(row.kickoff, "short")}
        </span>
      </div>

      <RowRead row={row} modeId={modeId} clubCount={clubCount}
        dense={dense} hoisted={hoisted} field={fld} />

      <div className="mt-3 border-t border-line pt-3">
        <KalshiCell quote={row.kalshi} />
        {/* WHAT THAT PRICE ACTUALLY SETTLES ON — the settlement rule of
            a whole competition, so on a cup column it is identical on
            every card and the header carries it instead (columnNotes).
            It survives HERE for the row the header cannot speak for: a
            cup tie FOLDED INTO A LEAGUE COLUMN, where the Liga MX
            header must not claim a regulation-time rule that is true of
            one of its ten cards. That row is exactly the case the
            operator's rule leaves on the card — a fact about THIS
            fixture, not about the column. */}
        {row.reg_time_note && row.reg_time_note !== hoisted?.regTime
          && <RegTimeNote note={row.reg_time_note} />}
        {/* B0c — DECLARING THIS MATCH WATCHED (docs/HOLD-EXIT-DESIGN.md).
            Under the price rather than beside the kickoff, because the
            control needs the card's full width to print the backend's
            own words when a declaration is refused — and a refused
            removal is the record working, not an error. It renders
            whether or not an operator token is present and says which it
            is; with none it opens the panel that asks for one, so it is
            never a silent no-op. Off the board it renders nothing at
            all: there is no provider, so there is no control. */}
        <WatchToggle eventId={row.event_id}
          label={`${row.favourite} v ${row.opponent}`} />
      </div>
    </article>
  );
}

/** A REFUSED FIXTURE, DRAWN WHERE IT KICKS OFF (operator, 2026-09-07).
 *
 *  These were collected into a block at the column's foot, under every
 *  ranked match and above the finished tail — so a fixture kicking off on
 *  Tuesday was drawn below one that finished last week, and a reader
 *  scanning a matchday saw a complete-looking day that was missing a
 *  match. A refusal is not an error and not a leftover: it is a fixture
 *  that will be played at a known time and that this board declined to
 *  RANK. It belongs on its own date.
 *
 *  IT IS NOT A ROW CARD AND MUST NOT PASS FOR ONE. No rank number, no
 *  anchor figure, no dumbbell, a dashed border and the warn tone — every
 *  cue that carries a ranking on this board is absent, because there is
 *  no ranking. What it does carry is the two clubs, the club that could
 *  not be rated, and the backend's own reason. */
function RefusalCard({ r, dated = true }: {
  r: BoardRefusal; dated?: boolean;
}) {
  return (
    <div data-testid="picker-refusal" data-club={r.club}
      data-dated={dated ? "1" : "0"}
      className="rounded-[10px] border border-dashed border-warn/30 bg-warn/5 px-3 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-warn">
          refused
        </span>
        {r.kickoff && (
          <span className="ml-auto font-mono text-[9.5px] tabular-nums text-ink-faint">
            {fmtDate(r.kickoff)}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-ink-hi">
        {r.home} <span className="text-ink-faint">vs</span> {r.away}
      </p>
      <p className="mt-1 font-mono text-[11px] leading-relaxed text-warn">
        {r.club} — {r.reason}
      </p>
    </div>
  );
}

/** THE MATCHES OF ONE MATCHDAY, LAID ACROSS THE BAND (operator,
 *  2026-09-08).
 *
 *  A board narrowed to ONE column — /bet-suggester/ucl — was drawing one
 *  tall stack of full-width cards: a Champions League matchday is ~18
 *  fixtures, so the reader got 18 screens of 1,400px-wide card holding
 *  200px of ink. The landing board's density comes from laying columns
 *  side by side; a single-column board has to find it inside the band.
 *
 *  DAY BANDS REMAIN THE VERTICAL STRUCTURE. This changes what happens
 *  INSIDE one band's content track and nothing else: the band is still a
 *  subgrid row, the date is still drawn once above it, and rank badges
 *  still restart at 01 per day. Grid flow is row-major and the DOM order
 *  is the sorted order, so 01 is still the top-left card and the ladder
 *  still reads left-to-right.
 *
 *  THE LADDER IS PICKED FROM WHAT A CARD NEEDS, NOT FROM A ROUND NUMBER.
 *  The board's `main` is `max-w-[96rem] px-5`, so at each step the track
 *  works out at:
 *
 *      <sm   1 col   350px at 390   — a phone gets the card whole
 *      sm    2 cols  294px at 640
 *      md    3 cols  235px at 768
 *      lg    4 cols  237px at 1024
 *      xl    6 cols  196px at 1280, 223px at 1440, 239px at 1536+
 *
 *  FOUR IS THE OPERATOR'S NUMBER (2026-09-10, revised from six). Six
 *  tracks over 190px fit at xl, but the card carries more ink than it
 *  did when six was chosen — a dumbbell, a tier trio, a rank panel and
 *  a market line — and at a sixth of the band the fixture names wrap
 *  before any of it is read. Four holds the same card the league
 *  columns hold. Two and three are NOT dense enough to need the narrow
 *  card, which is why the reflow in RowRead turns on at `md` — the same
 *  width where this grid first goes past two columns. Standard Tailwind
 *  breakpoints throughout, like every other grid in this app; no
 *  arbitrary widths. */
const DENSE_GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 "
  + "lg:grid-cols-4";

/** Said once per column, where a reader first meets a refused card. */
function RefusalWhy() {
  return (
    <p data-testid="refusal-why"
      className="text-[11px] leading-relaxed text-ink-low">
      A club with no row in the table in use — a promoted side, most
      often — cannot be ranked against one that has a row, and its
      lower-division numbers were measured as no help at all. The
      picker refuses it by name instead of imputing a number, and the
      fixture is listed here rather than quietly dropped.
    </p>
  );
}

/** WHAT A COLUMN'S NOTES ARE, AS OPPOSED TO A CARD'S (operator,
 *  2026-09-09 — the THIRD time this rule has been given).
 *
 *  THE RULE, in his words about the season share on 2026-09-08: "remove
 *  them from both the live card and prematch card, only mention it once
 *  with the league name". Generalised:
 *
 *      A fact about the whole COLUMN belongs in the column header,
 *      once. Only a fact about THIS FIXTURE belongs on the card.
 *
 *  THE TWO STRINGS THAT BREAK IT. Both are constants of a CUP SPEC in
 *  the backend (src/picker/tables.py, `CupSpec.cross_note` and
 *  `.reg_time_note`) — not derived from the fixture at all — so every
 *  card of that competition was redrawing the identical paragraph:
 *
 *    `gap_note`       ~90 words, on every cross-league row. UEFA's
 *                     league-phase draw forbids two clubs of one
 *                     association from meeting, so on the Champions
 *                     League board that is EVERY row; laid four abreast
 *                     it was most of the ink on the matchday.
 *    `reg_time_note`  the competition's settlement rule, on every row
 *                     of that competition.
 *
 *  WHAT MAKES A NOTE THE COLUMN'S. Two conditions, and the second is
 *  the one that keeps the header honest:
 *
 *   1. THE COLUMN'S OWN ROWS AGREE ON IT. One distinct string, or the
 *      header would state one competition's rule over another's.
 *   2. IT COMES FROM THIS COLUMN'S OWN COMPETITION. `row.league !==
 *      slug` is a fixture FOLDED IN from elsewhere — a Leagues Cup tie
 *      between two Liga MX clubs is drawn in the Liga MX column because
 *      that table describes it completely, and it still settles on 90
 *      minutes when nothing else in that column does. Hoisting that
 *      would put a false sentence over ten cards to save ink on one. A
 *      folded row's note is a fact about THAT FIXTURE and stays where
 *      the operator's rule says it belongs: on its card.
 *
 *  PARTIAL COVERAGE STILL HOISTS, and that is deliberate for the only
 *  case that produces it. `gap_note` rides the cross-league rows of a
 *  mixed cup column; the note is not about those fixtures, it is the
 *  column's RATING POLICY — why a comparison between two tables is
 *  refused. Which rows it bit is already unmistakable on the cards
 *  themselves: they are the ones reading `n/a` where a number goes,
 *  beside a `rated-in` chip naming two different leagues. The refusal
 *  stays on the card; only the explanation moves. */
export interface ColumnNoteSet {
  /** why Stage-1 gaps are withheld in this column, or null */
  gap: string | null;
  /** what this column's prices settle on, when not the match, or null */
  regTime: string | null;
  /** HOW TO READ THE FIELD ON EVERY CARD — what a tier SET is, which
   *  marks the field is behind, and what a dagger means. Null when this
   *  column has no field, so the affordance is never an empty promise. */
  field: string | null;
  /** THE FIELD READ FAILED, IN THE READ'S OWN WORDS. A separate key
   *  from `field` because they are opposite facts and must never be
   *  folded: one explains a read every card in the column performs, the
   *  other says why no card in it performs one. */
  fieldError: string | null;
}

/** WHAT A TIER SET IS AND WHAT THE DAGGER MEANS, SAID ONCE PER COLUMN.
 *
 *  The operator's rule, now given four separate times: a fact about the
 *  whole column goes in the column header, once — the season share
 *  (2026-09-08), the cross-league warning (2026-09-09), the fit-block
 *  method note, and this. Every card in a column with a field carries
 *  the same three conventions; repeating them per card is the ~90-word
 *  paragraph that was most of the ink on a six-abreast matchday.
 *
 *  THE COUNTS ARE THE PAYLOAD'S OWN, never typed here. "33 of 36
 *  straddle a cut" is a measurement that moves whenever the field is
 *  refitted, and a number frozen in this file would go on asserting the
 *  old fit forever — the exact shape of a hand-typed subset staying
 *  green while the thing it describes drifts. Both the count and the
 *  total are read off the axis the sentence is about. */
function fieldNoteFor(data: Ratings | null | undefined): string | null {
  const axes = data?.axes;
  if (!axes) return null;
  const parts: string[] = [
    "A TIER IS A SET, NOT A PLACE. Each club carries a 95% interval, and "
    + "the bands printed beside it are every band that interval touches — "
    + "“2·3” means the evidence does not separate the two. "
    + "A single band is a set of one, not a stronger claim.",
  ];
  const straddle = AXIS_ORDER
    .map((k) => axes[k])
    .filter((a): a is Axis => Boolean(a))
    .map((a) => `${a.label} ${a.straddling} of ${a.rows.length}`);
  if (straddle.length > 0) {
    parts.push(
      "How many clubs this field cannot place in one band, per axis: "
      + straddle.join(", ") + ". That is why the sets are drawn whole.");
  }
  /* WHAT THE CARD ACTUALLY DRAWS, WHICH IS WHAT THIS PARAGRAPH HAS TO
     DESCRIBE. It used to explain a block of crossed atk→def legs; that
     block is gone (2026-09-09 — "use the exact design, only with new
     ‘i’ added"), and instructions for ink that is not there read as
     though the ink were merely elsewhere on the page. It now names the
     three marks the field really does substitute, and the one
     affordance that was added. */
  parts.push(
    "WHERE THE FIELD SHOWS UP ON A CARD. The ranks pair and the dumbbell "
    + "are read on this field’s own 1–" + (axes.ovr?.rows.length ?? 0)
    + " ladder, not on two domestic tables; the ovr / atk / def trio "
    + "prints this field’s bands; and the shape chip reads them. Beside "
    + "the trio, the circled i opens the same three axes as RANKS.");
  if (data?.below_floor_note) {
    parts.push("† " + data.below_floor_note);
  }
  return parts.join("\n\n");
}

export function columnNotes(
  slug: string, rows: BoardRow[], field?: FieldRead,
): ColumnNoteSet {
  const agreed = (pick: (r: BoardRow) => string | null | undefined) => {
    let only: string | null = null;
    for (const r of rows) {
      if (r.league !== slug) continue;   // folded in — it speaks for itself
      const s = pick(r);
      if (!s) continue;
      if (only == null) only = s;
      else if (only !== s) return null;  // they disagree — leave it per row
    }
    return only;
  };
  return {
    gap: agreed((r) => r.gap_note),
    regTime: agreed((r) => r.reg_time_note),
    field: fieldNoteFor(field?.data),
    /* THE FAILURE IS THE COLUMN'S, because the request is. One fetch
       serves every card here, so one failure is one sentence — and it
       must be A SENTENCE. A field that could not be read leaves every
       card on its league ranks and league tiers, which is exactly what
       a competition with no field measured looks like. Naming it here
       is what keeps those two apart. */
    fieldError: field?.error ?? null,
  };
}

/** THE COLUMN'S NOTES, BEHIND ONE CIRCLE IN THE HEADER'S CHIP ROW.
 *
 *  ONE CIRCLE, NOT TWO, and the reason is what a second one would look
 *  like: two identical unlabelled `i` glyphs a few pixels apart, in a
 *  row that already carries up to four chips and is 196px wide at the
 *  board's narrowest track. A reader would have to open both to find
 *  out which is which, which costs more than reading two headed
 *  paragraphs in one panel. So the panel is sectioned instead — each
 *  note under its own heading, in the backend's own words — and a
 *  column carrying only one of them draws only that section. A column
 *  carrying NEITHER draws no circle at all, so the affordance is never
 *  an empty promise.
 *
 *  HOVER IS NOT ENOUGH ON ITS OWN. There is no hover on a phone and
 *  none from a keyboard, and this is the sentence that stops an `n/a`
 *  reading as missing data rather than as a refused comparison — the
 *  board's whole discipline rests on it, so hover-only would make it
 *  UNREACHABLE rather than tidy. It opens on hover, on focus and on
 *  tap; Escape closes it; the button carries a real accessible name
 *  naming what is inside. Same treatment `tier-read` already has, plus
 *  the two openings a pointer does not provide.
 *
 *  WHERE IT ANCHORS. The panel is positioned against THE CHIP ROW, not
 *  against the button — the same fix `TierGaps`'s `dense` mode carries,
 *  for the same two reasons. The chip row is exactly one column wide,
 *  so `left-0` + `w-[min(21rem,100%)]` starts at the column's left edge
 *  and is at most the column wide, at every track in the ladder; and
 *  `html { overflow-x: clip }` (globals.css) means an overhang would be
 *  CLIPPED, not scrollable, so "it fits" has to be structural rather
 *  than arithmetic on a breakpoint. Anchored to the 16px BUTTON instead,
 *  `100%` is 26px — measured, first try — and a fixed width would hang
 *  off whichever edge the wrapped trigger happened to land near. And the
 *  row does wrap: `top-full` is below the whole row, which the trigger
 *  cannot be inside, so it can never swallow the click that closes it
 *  (the 2026-09-07 bug in TierGaps).
 *
 *  AND IT LEADS THE ROW, rather than trailing it on `ml-auto`. Two
 *  widths have to work: this column full-width on /bet-suggester/ucl,
 *  and ~230px on the six-column landing board. Trailing, the trigger
 *  was pushed onto a line of its own and sat 500px from the chips it
 *  belongs to — and a left-anchored panel would then open nowhere near
 *  the thing that opened it. First in the row, the trigger is beside
 *  the season chip at every width (which is where the operator asked
 *  for it: "put it ontop with the 'prior szn' label") and the panel
 *  always drops directly beneath it.
 *
 *  IT IS AN AFFORDANCE, NOT AN ALERT. Neutral line and ink at rest,
 *  accent only on hover/focus/open — the same gold `tier-read` uses to
 *  mean "this opens", which is brand, never a verdict. The traffic
 *  light stays on the numbers. */
function ColumnNotes({ notes }: { notes: ColumnNoteSet }) {
  const panelId = useId();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  /* ONE LIST, AND EVERYTHING ABOUT THE PANEL IS ASKED OF IT: whether
     there is a circle at all, what the circle's accessible name says,
     and what the panel draws. Three answers that used to be three
     hand-maintained expressions over the same two booleans — which is
     exactly how a column ends up with an affordance that opens onto
     nothing, or an accessible name that does not mention the note a
     reader opened it for. */
  /* `says` NAMES THE COLUMN; `andSays` REFERS BACK TO IT. An accessible
     name listing several sections has ONE antecedent and should use it
     once — "why this column withholds gaps, and what ITS prices settle
     on", which is the phrasing this button has always had and which
     e2e/picker-blend-cup.spec.ts pins. A section read on its own still
     names the column, because on its own there is nothing to refer back
     to. Deriving the continuation by rewriting "this column's" to "its"
     would be a text substitution standing in for a decision; each
     section says both, in its own words. */
  const sections = ([
    { id: "gap-note", body: notes.gap, tone: "text-warn",
      head: "gaps withheld in this column",
      says: "why this column withholds gaps",
      andSays: null },
    { id: "reg-time-note", body: notes.regTime, tone: "text-skylive",
      head: "what the price settles on",
      says: "what this column's prices settle on",
      andSays: "what its prices settle on" },
    /* THE FAILURE ABOVE THE CONVENTION. If the field could not be read
       no card reads it, so "how to read the field on each card" would
       be instructions for a read nothing on the page performed. The
       two are mutually exclusive by construction — `fieldNoteFor`
       answers null without data, and `fieldError` is null with it — and
       the order here is what a reader meets first if that ever stops
       being true. */
    { id: "field-error-note", body: notes.fieldError, tone: "text-live",
      head: "the field could not be read",
      says: "why this column shows no field",
      andSays: "why it shows no field" },
    { id: "field-note", body: notes.field, tone: "text-accent",
      head: "how to read the field on each card",
      says: "how to read the field on each card",
      andSays: null },
  ] as const).filter(
    (s): s is typeof s & { body: string } => Boolean(s.body));
  if (sections.length === 0) return null;
  const open = pinned || hovered || focused;
  const shut = () => { setPinned(false); setHovered(false); setFocused(false); };
  const label = sections
    .map((s, i) => (i > 0 && s.andSays ? s.andSays : s.says))
    .join(", and ");
  return (
    // NOT `relative`, deliberately — the positioning context is THE CHIP
    // ROW, which is exactly one column wide, so the panel's `100%` is
    // the column and never this 16px button (measured at 26px wide the
    // first time, which is TierGaps's dense bug in a new place).
    <span className="inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === "Escape") shut(); }}>
      <button type="button" data-testid="col-notes-open"
        aria-expanded={open} aria-label={label}
        aria-describedby={open ? panelId : undefined}
        /* DERIVED FROM THE SAME LIST THE PANEL DRAWS, so this cannot
           name a section the panel omits or miss one it draws — the
           handle a guard reads and the ink a reader sees are one fact. */
        data-notes={sections.map((s) => s.id.replace(/-note$/, "")).join("+")}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => {
          e.preventDefault(); e.stopPropagation();
          // The click is authoritative: tapping a second time closes a
          // panel a hover is still holding open, which is the only way
          // out on a touch screen.
          setPinned((p) => !p); setHovered(false); setFocused(false);
        }}
        // NOT `font-mono`, and that is legibility rather than taste: the
        // mono lowercase i carries a serif at both ends, so at 10px in a
        // 16px circle it reads as a FIGURE ONE — checked on the rendered
        // board, beside a chip whose every glyph really is mono. The
        // sans i is a dot over a bare stem and cannot be misread. He
        // asked for "the letter i in the middle"; this is that letter.
        className={`inline-flex h-[16px] w-[16px] items-center justify-center self-center rounded-full border text-[11px] font-semibold leading-none transition-colors ${
          open ? "border-accent/60 text-accent"
            : "border-line-strong text-ink-low hover:border-accent/40 hover:text-accent"}`}>
        i
      </button>
      {open && (
        <div data-testid="col-notes" id={panelId} role="note"
          // A CAP AND A SCROLLBAR, because these are the backend's own
          // paragraphs and they are LONG — ~1,200 characters with both
          // sections, which in a 230px column is 900px of panel. Left
          // uncapped it runs off the bottom of the viewport, and the way
          // out would be to scroll the PAGE, which drags the sticky
          // header the panel is anchored to. The overflow lives inside
          // the panel instead; the pointer stays within the hover
          // container while scrolling it, so reading cannot close it.
          className="absolute left-0 top-[calc(100%+7px)] z-30 max-h-[min(70vh,40rem)] w-[min(30rem,100%)] overflow-y-auto rounded-lg border border-line-strong bg-elev2 p-3 text-left text-[11px] leading-relaxed text-ink-mid shadow-xl">
          {/* THE SECTIONS ARE DERIVED FROM THE NOTE SET, not written out
              with a divider between each hand-chosen pair. With two of
              them a `notes.gap && notes.regTime` rule for the rule
              worked; at four it is six such rules, and the one nobody
              writes is the one that ships a panel with a hairline above
              nothing. The list below is the ONLY place a note's heading
              and ink live, so a note added to `ColumnNoteSet` and left
              out of it draws nothing at all rather than drawing wrong. */}
          {sections.map((s, i) => (
            <div key={s.id}>
              {i > 0 && <hr className="my-2.5 border-line" />}
              <p className={`font-mono text-[9px] uppercase tracking-[0.14em] ${s.tone}`}>
                {s.head}
              </p>
              {/* THE SOURCE'S OWN WORDS, verbatim — not summarised and
                  not truncated. Each keeps the data-testid it carried at
                  its old address, because the claim under guard is
                  unchanged; only where it is said moved.
                  `whitespace-pre-line` so a multi-paragraph note keeps
                  its paragraphs: the field note is three of them, and run
                  together they are a wall. */}
              <p data-testid={s.id} className="mt-1 whitespace-pre-line">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}

/** WHAT THE NUMBER IN A COLUMN HEADER COUNTS (operator, 2026-09-08).
 *
 *  THE COMPLAINT. "LEAGUES CUP · 0 FIXTURES", with no chips beside it
 *  and four finished matches sitting under it. Every part of that is
 *  produced by the board and the review being two payloads: the board
 *  serves no Leagues Cup row and no Leagues Cup meta — the tournament is
 *  over — while the review still carries its four finished ties, so the
 *  column exists (deliberately: a league with finished matches and no
 *  upcoming ones must not lose its column) and the header spoke only for
 *  the half of the page that has nothing.
 *
 *  MISSING IS NEVER ZERO, and this is that rule on the surface. "0
 *  fixtures" as the ONLY thing a column says, over four matches, invites
 *  the one reading that is false — that there is nothing here.
 *
 *  SO THE COUNT COUNTS WHAT THE COLUMN HOLDS. With something upcoming it
 *  is the upcoming count, unchanged and in the same words as every other
 *  column. With NOTHING upcoming — no ranked row and no refused one —
 *  and a finished list that has landed and is not empty, it is the
 *  finished count, named as finished so the two can never be read alike.
 *
 *  AND IT NEVER SPEAKS FOR A READ THAT HAS NOT LANDED. The review is a
 *  second request on its own clock: while it is in flight or after it
 *  failed, the number of finished matches is UNKNOWN, and this says
 *  nothing about it rather than reporting the zero it is currently
 *  holding. That is the same rule one layer down.
 *
 *  WHAT IT DELIBERATELY DOES NOT SAY IS "nothing upcoming". That
 *  sentence belongs to `col-empty` directly below, which already says it
 *  in full words for whichever window is set, and which is what tells a
 *  finished-only column apart from a live league having a quiet week.
 *  Two elements, one fact each. */
export function columnCountLabel(
  upcoming: number,
  finished: { known: boolean; n: number },
  /** the board payload declared no column for this competition, so it
   *  ranked none of its fixtures and there is no count to print. Added
   *  2026-09-09: "0 FIXTURES" over a competition the board was never
   *  asked about is a measured zero invented out of a question nobody
   *  put — the same defect one layer up from "0 fixtures" over four
   *  finished ties, and the reason this function exists at all. */
  boardSilent = false,
): string {
  if (upcoming === 0 && finished.known && finished.n > 0) {
    return `${finished.n} finished`;
  }
  if (upcoming === 0 && boardSilent) return "not ranked";
  return `${upcoming} fixture${upcoming === 1 ? "" : "s"}`;
}

export function LeagueColumn({
  slug, meta, rows, refusals, days, dayKeys, sortFor, dayLabels, colIndex,
  review, dense = false, field,
}: {
  slug: string;
  /** absent when the payload never mentioned this league at all */
  meta?: LeagueMeta;
  rows: BoardRow[];
  refusals: BoardRefusal[];
  days: number;
  /** the BOARD's ordered matchday keys (union across every column).
   *  The page computes them once so all four columns share the same
   *  band tracks — the whole point of day-major alignment. */
  dayKeys: string[];
  /** each matchday's resolved sort — the board default or that day's
   *  override. Sorting lives on the PAGE since the C ship (2026-09-01),
   *  and this column applies what it is handed, per band — with ONE
   *  documented exception: a column in `COLUMN_DEFAULT_SORT` runs its
   *  own default WHILE what it is handed is still the board's untouched
   *  default, and says so in its header. The moment a sort is chosen,
   *  here or on a band, this column obeys it like every other. */
  sortFor: (dayKey: string) => ColumnSort;
  /** matchday labels, for the rest-day ghosts' "next" line */
  dayLabels: Record<string, string>;
  /** the column's EXPLICIT grid column at xl (1-based). Auto placement
   *  cannot be trusted here: the full-width band labels occupy rows
   *  2,4,6… across every explicit column, so an auto-placed section
   *  spanning rows 1..N fits nowhere and the grid silently creates
   *  IMPLICIT columns — four phantom 0px tracks that swallowed the band
   *  tints and unevenly sized the real ones (the glued-headers bug,
   *  2026-09-01). Explicitly placed items may overlap; that is the
   *  contract the whole band layout stands on. */
  colIndex: number;
  /** THIS COLUMN HAS THE BOARD TO ITSELF, so each matchday band lays its
   *  matches ACROSS the width instead of stacking them (see DENSE_GRID).
   *
   *  The page derives it from the same `columnSlugs.length === 1` that
   *  already decides the board's framing and its ranking key — NOT from
   *  `slug === "ucl"`. The Champions League is simply the first board
   *  narrowed to one column; the next one gets this for free, and a
   *  multi-league board can never acquire it by accident. */
  dense?: boolean;
  /** the finished tail's slice of this league. A SEPARATE payload on a
   *  separate fetch: the board is a 90s sweep of what is coming, the
   *  review is a long-cached read of matches that cannot change again.
   *  They render in one column, which is a rendering decision and does
   *  not make them one request. */
  review: {
    rows: ReviewRow[];
    refusals: ReviewRefusal[];
    meta?: ReviewLeagueMeta;
    back: number;
    loading: boolean;
    error: string;
    storeNote: string | null;
  };
  /** THE COMPETITION'S CROSS-LEAGUE FIELD — one read for the whole
   *  column, substituted into the ranks, tiers and shape of every card
   *  in it (see fieldApi.fieldFor) and, when it FAILED, named once in
   *  the header rather than eighteen times below it.
   *  Absent for a competition nobody has measured a field for, which is
   *  every league column today: the field exists to rate the entrants of
   *  a cup whose clubs come from tables that cannot be compared, and a
   *  league column's own table already does that job. */
  field?: FieldRead;
}) {
  /* THE SEASON BASIS, DERIVED ONCE FOR THE WHOLE COLUMN. Off the rows
     this column actually holds, not off `meta` — a league whose payload
     carries no weights gets no percentage rather than a manufactured
     one, and a cup gets none by construction (see seasonSpan). */
  const span = seasonSpan(rows, meta?.kind);

  /* THE COLUMN'S CAVEATS, DERIVED ONCE — see columnNotes. Off the rows,
     like the season basis above it: a note is this column's only when
     this column's own competition emits it and its rows agree. What
     comes back is handed BOTH to the header (which draws it, once) and
     to every card (which then draws nothing), so the two can never
     disagree about who is saying it.
     The FIELD's two notes come from the same call for the same reason:
     how to read a tier set is true of every card in this column, and a
     field that failed to load is true of the column rather than of any
     fixture in it. */
  const notes = columnNotes(slug, rows, field);

  // DAY-MAJOR (operator, 2026-09-01): the matchday is the board's
  // primary structure and each band's sort — the board default or that
  // day's override — ranks WITHIN the day. Rank badges restart per day,
  // so 01 always means "this day's best under its sort".
  const byDay = dayKeys.map((k) => {
    const sort = columnSort(slug, sortFor(k));
    return {
      key: k,
      sort,
      modeId: (modeById(sort.mode) ?? modeById(DEFAULT_SORT.mode)!).id,
      rows: sortRows(rows.filter((r) => localDay(r.kickoff) === k), sort),
      // the day's refused fixtures, drawn after its ranked ones: they
      // carry no rank, so they cannot be interleaved with numbers
      refused: refusals.filter((r) => r.kickoff && localDay(r.kickoff) === k),
    };
  });
  /* WHAT COULD NOT BE PLACED, AND WHY — never silently dropped. A
     refusal with no kickoff, or with one outside the board's window, has
     no band to sit in. It keeps a named block rather than disappearing,
     and that block says which of the two it is. */
  const placed = new Set(byDay.flatMap((d) => d.refused));
  const undated = refusals.filter((r) => !placed.has(r));
  // the first day that draws a refusal is where the reason is explained
  const firstRefusalDay = byDay.find((d) => d.refused.length > 0)?.key ?? null;
  /* IS THIS COLUMN ON ITS OWN SORT RIGHT NOW? `columnSort` substitutes
     exactly while the control it was handed is untouched, so the same
     test answers it here — one rule, asked twice, rather than two rules
     that can disagree. Said on the surface because a column ordered
     differently from its neighbours reads as a defect to anyone who
     does not know why. */
  const ownSort = COLUMN_DEFAULT_SORT[slug];
  const runsOwnSort = Boolean(ownSort)
    && dayKeys.some((k) => isDefaultSort(sortFor(k)));

  /* ── THE FINISHED-ONLY COLUMN (operator, 2026-09-08) ──────────────
     Three derivations, all off what this column was actually handed.

     `nothingAhead` — no ranked row AND no refused one. A refusal is a
     fixture too (2026-09-07), so a column holding one is not empty and
     must not be described as though it were; this is deliberately the
     same test `col-empty` below applies, so the header and the body can
     never disagree about whether anything is coming.

     `finishedKnown` — the review is a SECOND request with its own
     clock and its own failure. In flight, failed, or failed for this
     league alone, the finished count is unknown; `review.rows.length`
     is 0 in all three, and reporting that as "0 finished" would be a
     failed read rendered as a measured absence.

     `boardSilent` — the board payload carried no entry for this
     competition at all. That is why this column has no season chip and
     no "cup · rated on" chip: there is no meta to draw them from, and
     an unexplained gap where every neighbour has one is what made the
     column read as broken. It is NAMED in the header now. */
  const nothingAhead = rows.length === 0 && refusals.length === 0;
  const finishedKnown = !review.loading && !review.error && !review.meta?.error;
  const finished = { known: finishedKnown, n: review.rows.length };
  const boardSilent = !meta;

  /* ONE TAIL, PLACED IN ONE OF TWO TRACKS. Built here rather than twice
     below: a second copy of this call is how two renderings of one
     section begin disagreeing, and the placement is the only thing that
     differs between them. */
  const tail = (
    <ReviewTail slug={slug} back={review.back}
      rows={review.rows} refusals={review.refusals} meta={review.meta}
      loading={review.loading} error={review.error}
      storeNote={review.storeNote} />
  );

  // a cup member league that did not build. ABSENT, not empty, when
  // every member built — so this block cannot draw a reassuring "0".
  const memberErrors = Object.entries(meta?.member_errors ?? {});

  // the subgrid track plan, shared with the page: row 1 header, then
  // per day a label track + a content track, then refusals, then tail
  const trackCount = 2 * dayKeys.length + 3;

  return (
    <section data-testid="league-col" data-league={slug}
      id={`picker-col-${slug}`}
      aria-label={`${leagueLabel(slug)} column`}
      style={{ ["--lg" as string]: hueOf(slug),
        ["--tracks" as string]: String(trackCount),
        ["--col" as string]: String(colIndex) }}
      className="min-w-0 scroll-mt-16 xl:grid xl:content-start xl:[grid-template-rows:subgrid] xl:[grid-template-columns:minmax(0,1fr)] xl:[grid-row:1/span_var(--tracks)] xl:[grid-column:var(--col)]">
      {/* THE HEADER FOLLOWS THE COLUMN (2026-09-07). Opaque ground, not a
          translucent one: rows scrolling underneath a see-through header
          is the same defect as a label that contradicts the numbers
          beside it.

          IT PARKS UNDER THE TOP BAR, NOT BEHIND IT. `.topbar` is
          `sticky; top:0; z-index:50` and `h-12` (globals.css), so a
          league header at `top-0` slides beneath it and is hidden by the
          one element guaranteed to be there — which is what the first
          version of this did, on a comment claiming the page had no
          fixed bar. It has one; the bar is in components/chrome.tsx, not
          on the page. `--topbar-h` is that bar's own declared height —
          h-12 PLUS its 1px border, because `top-12` alone still left this
          a pixel underneath — and z-20 keeps this under the bar and over
          the rows. `scroll-mt-16` on the section still owns where a
          jump-nav landing comes to rest. */}
      <header data-testid="col-head"
        className="sticky top-[var(--topbar-h)] z-20 self-start border-b border-line bg-bs pb-3 pt-2 xl:[grid-row:1]">
        {/* the league's own light — a 2px rail, wayfinding only. It is
            addressable because it is where a hue COLLISION is visible:
            two columns whose rails resolve to one colour is the defect
            that made the UCL and the Leagues Cup indistinguishable, and
            a guard has to read the painted ink rather than the token
            name to catch a fallback landing twice. */}
        <div aria-hidden data-testid="col-rail"
          className="mb-2 h-[2px] rounded-full opacity-80 [background:var(--lg)]" />
        {/* TWO LINES, DECIDED HERE RATHER THAN BY THE WIDTH. One
            flex-wrap row put the name, the basis chip and the fixture
            count in a queue, so whether the count wrapped depended on how
            long the league's NAME was: MLS kept it on line one and
            PREMIER LEAGUE pushed it to line two, in adjacent columns of
            the same board. A layout that reads as a difference between
            two leagues, and is not one.

            So the name and the count are one row that cannot wrap — the
            name truncates instead — and the basis chips take the row
            below. Every column now has the same shape whatever it is
            called, which also survives the narrower tracks a fifth
            competition brings. */}
        <div className="flex items-baseline gap-x-2">
          <h3 className="min-w-0 flex-1 truncate text-base font-bold uppercase tracking-[0.03em] text-ink-hi [font-family:var(--font-archivo)] [font-stretch:106%]">
            {leagueLabel(slug)}
          </h3>
          {/* THE COUNT COUNTS WHAT THIS COLUMN HOLDS — see
              columnCountLabel. `data-counts` says WHICH of the three it
              is, so the header can never be read as one of the others
              by a guard or by a reader hovering it. */}
          <span data-testid="col-count"
            data-counts={nothingAhead && finished.known && finished.n > 0
              ? "finished"
              : nothingAhead && boardSilent ? "unasked" : "upcoming"}
            title={nothingAhead && finished.known && finished.n > 0
              ? `nothing upcoming in this column, and ${finished.n} match${finished.n === 1 ? "" : "es"} that already finished — they are under the dashed divider below`
              : nothingAhead && boardSilent
              ? "the board payload declared no column for this competition, so it ranked none of its fixtures — this is the absence of a ranking, not a count of zero matches"
              : undefined}
            className="flex-none font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-ink-faint">
            {columnCountLabel(rows.length, finished, boardSilent)}
          </span>
        </div>
        {/* `relative` so the column-notes panel below hangs off THE CHIP
            ROW — one column wide, whatever the board's track count — and
            not off its own 16px trigger. See ColumnNotes. */}
        <div className="relative mt-1.5 flex flex-wrap items-baseline gap-1 empty:mt-0">
          {/* THE COLUMN'S CAVEATS, ONCE, AT THE HEAD OF THE CHIP ROW —
              "put it ontop with the 'prior szn' label" (operator). It
              leads rather than trails so the trigger is beside the
              season chip at every track width and the panel opens
              directly under it; see ColumnNotes. */}
          <ColumnNotes notes={notes} />
          {/* WHY THIS COLUMN HAS NO CHIPS — said, rather than left as a
              gap (operator, 2026-09-08). Every other column carries a
              season chip and, for a cup, a "rated on" chip; this one
              carries none, because there is no `meta` to derive either
              from — the board payload never mentions this competition.
              An unexplained blank where four neighbours have chips is
              what a reader calls broken. This is that blank, named.

              WHEN IT CAN STILL HAPPEN, since 2026-09-09. The full board
              draws exactly the columns the payload DECLARES, so on that
              route this chip is unreachable by construction. It survives
              for the narrowed routes — /bet-suggester/ucl names its
              column itself — and it is the honest answer there: the
              competition left BOARD_COLUMNS, the board ranks none of its
              fixtures, and the page says so instead of printing a zero
              nobody measured. */}
          {boardSilent && (
            <span data-testid="col-no-board-entry"
              title="The board payload carried no entry for this competition at all — no season basis, no rating table, and so no ranking of its fixtures. That is the board saying NOTHING about it, which is not the same as the board measuring none."
              className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
              no board entry
            </span>
          )}
          {meta?.src === "prior" && (
            <span data-testid="col-season"
              {...(span ? {
                "data-season-lo": String(Math.round(span.lo * 100)),
                "data-season-hi": String(Math.round(span.hi * 100)),
                "data-season-clubs": String(span.clubs),
              } : {})}
              title={span
                ? `only ${seasonSpanLabel(span)} of this table is THIS season, across ${span.clubs} club ratings in this column — which is WHY it is rated on last season's final table. The floor is ${meta.min_current_gp ?? "?"} GP.`
                : `rated on last season's final table — min ${meta.min_current_gp ?? "?"} GP this season`}
              className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
              prior szn{span ? ` · ${seasonSpanLabel(span)} this szn` : ""}
            </span>
          )}
          {meta?.src === "current" && (
            <span data-testid="col-season"
              {...(span ? {
                "data-season-lo": String(Math.round(span.lo * 100)),
                "data-season-hi": String(Math.round(span.hi * 100)),
                "data-season-clubs": String(span.clubs),
              } : {})}
              title={span
                ? `${seasonSpanLabel(span)} of this table is THIS season, across ${span.clubs} club ratings in this column — the rest is last season's final table, blended on k=${meta.blend_k ?? SEASON_BLEND_K}. Every club here has at least ${meta.min_current_gp ?? "?"} games played.`
                : "rated on this season's table — every club has enough games played"}
              className="rounded border border-accent/40 bg-accent/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
              {span ? `${seasonSpanLabel(span)} ` : ""}this szn · min{" "}
              {meta.min_current_gp ?? "—"} GP
            </span>
          )}
          {meta?.kind === "cup" && (
            <span data-testid="col-cup"
              title="a knockout tournament with no table of its own — every club is rated on its domestic league's table instead"
              className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
              cup · rated on{" "}
              {(meta.rated_on ?? []).map(leagueLabel).join(" + ")}
            </span>
          )}
          {runsOwnSort && ownSort && (
            <span data-testid="col-own-sort" data-mode={ownSort.mode}
              title={`Nearly every fixture in this column pairs two different domestic leagues, and the board refuses to subtract one league's table from another's — 2.0 ppg in one league is not 2.0 ppg in another. What survives a change of scale is the tier, and ${ownSort.mode} is derived from the tier gaps. Choose any sort above and this column follows the board like the others.`}
              className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
              sorted on {ownSort.mode} · this column
            </span>
          )}
        </div>

        {meta?.error && (
          <div data-testid="col-error"
            className="mt-2 rounded-md border border-live/30 bg-live/5 px-2.5 py-2">
            <p className="font-mono text-[11px] leading-relaxed text-live">
              {meta.error}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-low">
              This league could not be rated and contributes no fixtures.
              The failure costs this column, not the board.
            </p>
          </div>
        )}
        {memberErrors.length > 0 && (
          <div data-testid="col-member-errors"
            className="mt-2 rounded-md border border-warn/30 bg-warn/5 px-2.5 py-2">
            <p className="font-mono text-[11px] leading-relaxed text-warn">
              {memberErrors.length} of {(meta?.rated_on ?? []).length} member
              tables did not load — rated on{" "}
              {(meta?.rated_on_built ?? []).map(leagueLabel).join(" + ")
                || "no member league"}
            </p>
            <ul className="mt-1 space-y-0.5">
              {memberErrors.map(([lg, err]) => (
                <li key={lg} className="font-mono text-[10.5px] text-ink-low">
                  {leagueLabel(lg)} — {err}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-low">
              Clubs rated in those leagues have no table to stand on, so
              their fixtures are refused by name below rather than rated on
              a guess. This costs those clubs, not the column.
            </p>
          </div>
        )}
        {meta?.kalshi_error && (
          <p data-testid="col-kalshi-error"
            className="mt-2 font-mono text-[11px] leading-relaxed text-warn">
            kalshi unavailable — {meta.kalshi_error}. Prices are annotation
            here, so every fixture below is still ranked and listed.
          </p>
        )}

        {/* Sorting moved to the PAGE with the C ship (2026-09-01): one
            board default in the command bar, a per-day override on each
            matchday band. This column applies what it is handed, except
            while the control is untouched and this column has a default
            of its own — the `col-own-sort` chip above names that case,
            and `columnSort` is where the rule lives. */}

      </header>

      {/* ── MATCHDAY BANDS. Each day owns a shared subgrid track, so a
          date's fixtures sit at the same height in every column — the
          alignment the operator asked for. The band's date is drawn
          once, full-width, by the page (xl); below xl each column keeps
          its own compact divider so a stacked layout still says the
          date. A day this league does not play leaves its track to the
          columns that do. */}
      {byDay.map(({ key, rows: dayRows, modeId, refused }, di) => {
        if (dayRows.length === 0 && refused.length === 0) {
          // A REST DAY IS SAID, NOT LEFT BLANK (draft C, shipped): the
          // empty track gets a quiet cell naming the league's next
          // fixture, so a hole reads as schedule, not absence of data.
          // Only when the league plays elsewhere in the window — a fully
          // empty column keeps its own louder empty-state below — and
          // only at xl, where the aligned matrix exists.
          if (rows.length === 0 && refusals.length === 0) return null;
          const next = byDay.slice(di + 1)
            .find((d) => d.rows.length > 0 || d.refused.length > 0);
          return (
            <div key={key} data-testid="rest-day" data-day={key}
              style={{ ["--r" as string]: String(3 + 2 * di) }}
              className="hidden min-h-[52px] flex-col justify-center gap-0.5 rounded-[10px] border border-dashed border-line px-3 py-2.5 xl:flex xl:self-start xl:[grid-row:var(--r)]">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint">
                {leagueLabel(slug)} — rest day
              </span>
              <span className="font-mono text-[9.5px] text-ink-low">
                {next
                  ? `next · ${(dayLabels[next.key] ?? next.key).toLowerCase()}`
                  : "no more fixtures in window"}
              </span>
            </div>
          );
        }
        // The day's cards, in the day's sorted order. RANK IS ASSIGNED
        // HERE, before the layout sees them, so it is the same number in
        // a stack and in a grid: 01 is this day's best under its sort,
        // and grid flow being row-major keeps it top-left.
        const cards = (
          <>
            {dayRows.map((r, i) => (
              <RowCard key={`${r.league}-${r.event_id}`} row={r} rank={i + 1}
                modeId={modeId} clubCount={meta?.clubs ?? 0}
                colSrc={meta?.src} dense={dense} hoisted={notes}
                field={field} />
            ))}
            {refused.map((r, i) => (
              <RefusalCard key={`ref-${r.club}-${i}`} r={r} />
            ))}
          </>
        );
        return (
          <div key={key} data-testid="day-track" data-day={key}
            style={{ ["--r" as string]: String(3 + 2 * di) }}
            className="mt-3 space-y-3 xl:mt-0 xl:self-start xl:pb-4 xl:[grid-row:var(--r)]">
            <div data-testid="day-divider"
              className="flex items-center gap-2 xl:hidden">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low">
                {dayLabel((dayRows[0] ?? refused[0]).kickoff!)}
              </span>
              <span aria-hidden className="h-px flex-1 bg-line" />
            </div>
            {/* The divider above and the reason below stay OUTSIDE the
                grid, full width: a date and a paragraph of explanation
                are not matches and must not take a match's track. */}
            {dense
              ? <div data-testid="day-grid" className={DENSE_GRID}>{cards}</div>
              : cards}
            {key === firstRefusalDay && <RefusalWhy />}
          </div>
        );
      })}
      {/* ── A COLUMN WITH NOTHING AHEAD OF IT (operator, 2026-09-08) ──
          The empty state AND the finished tail, together, in the FIRST
          content track.

          The tail's home is the last track, under every matchday and
          every refusal, so a league's forward story finishes before its
          backward one starts. With nothing ahead there is no forward
          story: the last track is then a thousand pixels of nothing
          below this box, and the tail was landing at the very foot of
          the whole board — a faint two-line toggle under a screen of
          void, which is exactly what "0 FIXTURES and an empty column"
          looked like. "Last in the column" and "row 3" are the same
          place when the rows above are empty, so the tail moves up to
          meet the sentence that names it rather than the sentence
          pointing a long way down.

          ONE grid item, not two at the same row: explicitly placed
          items may overlap, and `col-empty` and the tail would have
          been drawn on top of each other. */}
      {nothingAhead && (
        <div data-slot="tail-track" data-at="head"
          style={{ ["--r" as string]: "3" }}
          className="mt-3 xl:mt-0 xl:self-start xl:[grid-row:var(--r)]">
          {!meta?.error && (
            // an empty column SAYS SO — a failed league (above) is a
            // different fact and must not be dressed as a quiet weekend
            <div data-testid="col-empty"
              data-holds={finished.known && finished.n > 0
                ? "finished" : boardSilent ? "unasked" : "nothing"}
              className="rounded-xl border border-line p-4">
              {/* MISSING IS NEVER ZERO, AND THIS IS WHERE IT WOULD HAVE
                  BEEN (2026-09-09). "No X fixtures in the next 7 days"
                  is a MEASURED absence — the board looked over that
                  window and found none. When the board payload never
                  declared this competition, nothing was measured over
                  any window: there is no ranking, no rating table and
                  no fixture list here to be empty. Printing the
                  measured sentence anyway is how /bet-suggester/ucl
                  would have said "no Champions League fixtures in the
                  next 7 days" over a week holding eighteen of them, the
                  moment the competition left BOARD_COLUMNS. */}
              <p className="text-sm text-ink-mid">
                {boardSilent
                  ? `The board carries no column for ${leagueLabel(slug)},`
                    + " so it ranked none of its fixtures. This is not a"
                    + " count of them."
                  : `No ${leagueLabel(slug)} fixtures in the next ${days} `
                    + `day${days === 1 ? "" : "s"}.`}
              </p>
              {/* AND THEN WHAT THIS COLUMN DOES HAVE. Two states share
                  this box and they mean opposite things: a live league
                  having a quiet week, which is the sentence above and
                  nothing more, and a column whose entire content is the
                  finished list under it. Said here, at the top, where
                  the reader already is.
                  `finished.known` gates it: while the review is in
                  flight or after it failed there is no count to state,
                  and this box claims nothing about a read that has not
                  landed. */}
              {finished.known && finished.n > 0 && (
                <p data-testid="col-empty-finished"
                  className="mt-2 text-sm leading-relaxed text-ink-low">
                  <span className="text-ink-mid">
                    {finished.n} finished in the last {review.back}{" "}
                    day{review.back === 1 ? "" : "s"}
                  </span>
                  , directly below
                  {boardSilent
                    ? " — and that is the whole of what the board has to"
                      + " say here, because it carries no column for this"
                      + " competition at all."
                    : "."}
                </p>
              )}
            </div>
          )}
          {tail}
        </div>
      )}

      {undated.length > 0 && (
        <div data-testid="refusals"
          style={{ ["--r" as string]: String(2 + 2 * dayKeys.length) }}
          className="mt-4 self-start rounded-xl border border-warn/25 bg-warn/5 p-3 xl:mt-4 xl:[grid-row:var(--r)]">
          <Eyebrow tone="warn">
            refused · no date · {undated.length} fixture{undated.length === 1 ? "" : "s"}
          </Eyebrow>
          {/* THE ONLY REFUSALS LEFT DOWN HERE are the ones with nowhere
              else to go: the payload carried no kickoff for them, or one
              outside the board's window. Saying WHICH matters — a missing
              kickoff is a gap in the feed, and neither is "we hid it". */}
          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-ink-low">
            no kickoff on the payload, or a kickoff outside the next{" "}
            {days} day{days === 1 ? "" : "s"} — so there is no matchday
            band to draw these in. Every other refused fixture is on its
            own date above.
          </p>
          {/* Undated refusals lay across the same tracks the matchdays
              use when the board is dense — a block of them stacked full
              width under a six-up grid reads as a different surface. */}
          <div className={dense ? `mt-2 ${DENSE_GRID}` : "mt-2 space-y-2"}>
            {undated.map((r, i) => (
              <RefusalCard key={`${r.club}-${i}`} r={r} dated={false} />
            ))}
          </div>
          <div className="mt-2.5"><RefusalWhy /></div>
        </div>
      )}

      {/* ── the finished tail ──────────────────────────────────────────
          Last in the column, after the upcoming fixtures AND after the
          refusals that belong to them, so this league's forward story is
          complete before the backward one starts. A column with nothing
          ahead of it has already drawn this, up in the first track — see
          above; it is ONE element either way, never two. */}
      {!nothingAhead && (
        <div className="xl:self-start xl:[grid-row:var(--r)]"
          style={{ ["--r" as string]: String(3 + 2 * dayKeys.length) }}
          data-slot="tail-track" data-at="foot">
          {tail}
        </div>
      )}
    </section>
  );
}

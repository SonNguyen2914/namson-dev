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
import { dayLabel, fmtDate, localDay } from "../lib/matchday";
import {
  BoardRefusal, BoardRow, LeagueMeta, SEASON_BLEND_K, homeBadge, leagueLabel,
  rowHref, seasonDisagreement, seasonSpan, seasonSpanLabel,
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
const LEAGUE_HUE: Record<string, string> = {
  mls: "var(--lg-mls)", epl: "var(--lg-epl)", laliga: "var(--lg-laliga)",
  ligamx: "var(--lg-ligamx)",
};
export const hueOf = (slug: string) => LEAGUE_HUE[slug] ?? "var(--lg-cup)";

/** The card's ANCHOR: the active sort metric, displayed signed the way
 *  the reader thinks about it — so a column scans as a ranked ladder of
 *  one number. Sorting by kickoff keeps GD/g (a time is not a
 *  magnitude); a missing quote says "no quote", a withheld gap says the
 *  board's own word for it. */
type AnchorId = Exclude<SortModeId, "kickoff" | "shape">;

function anchorFor(row: BoardRow, modeId: SortModeId):
  { v: string; k: string; id: AnchorId } {
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
  const fallback: AnchorId = row.cross_league ? "tier_ovr" : "gdg";
  const id = modeId === "kickoff" || modeId === "shape" ? fallback : modeId;
  return { ...anchorValue(row, id), id };
}

function anchorValue(row: BoardRow, id: AnchorId): { v: string; k: string } {
  switch (id) {
    case "gdg": return { v: dec(row.gdg_gap), k: "GD/g gap" };
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

/** THE RANK DUMBBELL — both clubs on the real 1..N axis of the league
 *  they are rated in: ● favourite (league hue), ○ opponent. Position
 *  says how good the favourite is, the lit span says how far apart the
 *  pair sits — the picker's premise in one 9px instrument. A
 *  cross-league tie has no shared axis, so it gets no instrument, which
 *  is the same honesty as its withheld gaps. */
function RankDumbbell({ row, clubCount }: { row: BoardRow; clubCount: number }) {
  if (row.cross_league) return null;
  const n = Math.max(clubCount, row.ranks.fav, row.ranks.opp, 2);
  const pos = (k: number) => 2 + (96 * (k - 1)) / (n - 1);
  const a = pos(row.ranks.fav), b = pos(row.ranks.opp);
  const lo = Math.min(a, b), w = Math.abs(b - a);
  return (
    <span data-testid="rank-dumbbell" aria-hidden
      title={`league ranks on the 1–${n} axis: favourite #${row.ranks.fav}, opponent #${row.ranks.opp}`}
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
export function RowRead({ row, modeId, clubCount, dense = false }: {
  row: BoardRow; modeId: SortModeId; clubCount: number;
  /** THIS CARD IS IN A NARROW TRACK — see DENSE_GRID below.
   *
   *  A dense board lays up to six matches across the width one column
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
                title={badge.title}>
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
          <span className={`mt-1 block font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-low${
            dense ? " md:mt-0" : ""}`}>
            {anchor.k}
          </span>
        </span>
      </Link>

      <RankDumbbell row={row} clubCount={clubCount} />

      {/* Stage 1 — the ranking inputs, favourite-signed. The metric the
          anchor already shows is not repeated down here; the ranks pair
          names what the dumbbell draws. */}
      {/* ALREADY flex-wrap, and that is what makes it survive: the five
          items reflow onto two or three lines in a narrow track rather
          than running off the edge. Only the gap tightens, so more of
          them fit per line. */}
      <div className={`mt-2.5 flex flex-wrap items-baseline gap-y-1 font-mono text-[10.5px] tabular-nums ${
        dense ? "gap-x-4 md:gap-x-2.5" : "gap-x-4"}`}>
        <span className="text-ink-faint">
          #{row.ranks.fav} v #{row.ranks.opp}
        </span>
        {anchor.id !== "gdg" && (
          <span className="text-ink-low">
            GD/g <span className="text-ink-mid">{dec(row.gdg_gap)}</span>
          </span>
        )}
        {modeId !== "ppg" && (
          <span className="text-ink-low">
            ppg <span className="text-ink-mid">{dec(row.ppg_gap)}</span>
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
        <TierGaps read={row} dense={dense} />
      </div>

      {/* A WITHHELD GAP SAYS WHY, on the card, in the backend's own
          words. The tiers above it are the part that survives a
          cross-league comparison, so the explanation belongs between
          them and the price. */}
      {row.gap_note && <GapNote note={row.gap_note} />}
    </>
  );
}

function RowCard({ row, rank, modeId, clubCount, colSrc, dense = false }: {
  row: BoardRow; rank: number; modeId: SortModeId; clubCount: number;
  colSrc?: string | null;
  /** in a narrow dense-grid track — see RowRead's own `dense` note */
  dense?: boolean;
}) {
  const cross = row.cross_league === true;
  const alt = seasonDisagreement(row);
  const departure = seasonDeparture(row, colSrc, alt);
  return (
    <article
      data-testid="picker-row"
      data-shape={row.shape}
      data-league={row.league}
      data-column={row.column ?? row.league}
      data-event={row.event_id}
      data-cross-league={cross ? "true" : "false"}
      data-season-departure={departure ?? undefined}
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
        <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-faint">
          {fmtDate(row.kickoff, "short")}
        </span>
      </div>

      <RowRead row={row} modeId={modeId} clubCount={clubCount}
        dense={dense} />

      <div className="mt-3 border-t border-line pt-3">
        <KalshiCell quote={row.kalshi} />
        {/* WHAT THAT PRICE ACTUALLY SETTLES ON. Directly under the
            quote, because it is a fact about the quote: a Leagues Cup
            leg pays on 90 minutes, so "54¢" is not the price of going
            through. */}
        {row.reg_time_note && <RegTimeNote note={row.reg_time_note} />}
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
 *  Six is the operator's number and xl is the first breakpoint that can
 *  hold six tracks over 190px. Two and three are NOT dense enough to
 *  need the narrow card, which is why the reflow in RowRead turns on at
 *  `md` — the same width where this grid first goes past two columns.
 *  Standard Tailwind breakpoints throughout, like every other grid in
 *  this app; no arbitrary widths. */
const DENSE_GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 "
  + "lg:grid-cols-4 xl:grid-cols-6";

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

export function LeagueColumn({
  slug, meta, rows, refusals, days, dayKeys, sortFor, dayLabels, colIndex,
  review, dense = false,
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
}) {
  /* THE SEASON BASIS, DERIVED ONCE FOR THE WHOLE COLUMN. Off the rows
     this column actually holds, not off `meta` — a league whose payload
     carries no weights gets no percentage rather than a manufactured
     one, and a cup gets none by construction (see seasonSpan). */
  const span = seasonSpan(rows, meta?.kind);

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
        {/* the league's own light — a 2px rail, wayfinding only */}
        <div aria-hidden
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
          <span data-testid="col-count"
            className="flex-none font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-ink-faint">
            {rows.length} fixture{rows.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-1 empty:mt-0">
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
                colSrc={meta?.src} dense={dense} />
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
      {rows.length === 0 && refusals.length === 0 && !meta?.error && (
        // an empty column SAYS SO — a failed league (above) is a different
        // fact and must not be dressed as a quiet weekend
        <div data-testid="col-empty"
          style={{ ["--r" as string]: "3" }}
          className="mt-3 self-start rounded-xl border border-line p-4 xl:mt-0 xl:[grid-row:var(--r)]">
          <p className="text-sm text-ink-mid">
            No {leagueLabel(slug)} fixtures in the next {days} day{days === 1 ? "" : "s"}.
          </p>
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
          complete before the backward one starts. */}
      <div className="xl:self-start xl:[grid-row:var(--r)]"
        style={{ ["--r" as string]: String(3 + 2 * dayKeys.length) }}
        data-slot="tail-track">
        <ReviewTail slug={slug} back={review.back}
          rows={review.rows} refusals={review.refusals} meta={review.meta}
          loading={review.loading} error={review.error}
          storeNote={review.storeNote} />
      </div>
    </section>
  );
}

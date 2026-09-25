// The picker's READ, drawn — the pieces shared by an upcoming card and a
// finished one.
//
// These moved out of PickerColumn.tsx when the finished tail arrived
// (2026-08-31). The reason is not tidiness: the review's whole claim is
// that it shows WHAT THE PICKER SAID, and a second, hand-copied set of
// gap chips would be free to drift from the first. A read rendered below
// the divider has to be the same read rendered above it, so there is one
// implementation and both callers import it.
//
// The honesty rules travelled with the code:
//
//  - ZERO RENDERS SIGNED. A bare "0" beside "+3" and "−1" reads as an
//    absence of data rather than as a measured level, and LEVEL is the
//    finding that matters most (it is the hollow read).
//  - A SHAPE IS A WORD, NOT A CODE. Every shape chip is accompanied by a
//    plain-English sentence naming where the gap actually is.
//  - A MISSING PRICE IS A FACT WITH A NAME. "no kalshi event" and
//    "listed · no quote" are different failures and never collapse into
//    one blank.
import { useEffect, useId, useRef, useState } from "react";
import {
  BlendWeights, BoardRowLive, FieldAxis, FieldAxisKey, FieldBlockLike,
  KalshiQuote, RowField, RowFieldPartial, Shape, THIN_ASK_SIZE,
  WIDE_SPREAD_C, pctThisSeason, weightIsCurrent,
} from "../lib/pickerApi";
import {
  AXIS_ORDER, axesPresent, axisDecimals, measurementOf, tierSet,
  unitLabel, writeMeasurement,
} from "../lib/fieldApi";
import { fmtDate } from "../lib/matchday";
import { readMatchClock } from "../lib/suggesterApi";

/** The word for a gap that was never measured. It is NOT "0", NOT "—"
 *  and NOT blank: a cross-league cup fixture has no ppg/GD-g/rank gap
 *  because the two clubs' rates were never on one scale, and a dash
 *  beside "+1.63" reads as a rendering failure rather than as a
 *  deliberate refusal. */
export const WITHHELD = "n/a";

/** A signed integer gap. ZERO RENDERS AS "+0", deliberately. */
export const sign = (n: number | null | undefined) =>
  (n == null ? WITHHELD : n < 0 ? `−${Math.abs(n)}` : `+${n}`);

/** Same rule as `sign`: ZERO RENDERS SIGNED. This is the number the board
 *  is ORDERED by, and a bare "0.00" beside "+1.63" reads as missing data
 *  on the one row that exists to prove the picker never cuts. */
export const dec = (n: number | null | undefined, places = 2) =>
  (n == null ? WITHHELD
   : (n < 0 ? "−" : "+") + Math.abs(n).toFixed(places));

/** WHAT ONE AXIS'S TWO TIERS SAY, side by side. A member may be a
 *  NUMBER (a league quintile) or the STRING form of a band set drawn
 *  from the field — "2·3" — because those are the two things a tier is
 *  on this board and both go in the same slot. `TierPair` satisfies it
 *  unchanged, so nothing that renders a league read moved. */
export type TierText = readonly [string | number, string | number];

export const pair = (p: TierText) => `T${p[0]} v T${p[1]}`;

/** The word for a signed tier gap, from the favourite's side. A gap of
 *  zero is LEVEL, not "small" — the distinction is the whole point of
 *  the hollow read. */
export const gapWord = (v: number) =>
  (v > 0 ? "ahead" : v === 0 ? "level" : "behind");

/** The shape-bearing part of a picker row. Structural, not nominal: an
 *  upcoming BoardRow and a frozen or rebuilt pre-kickoff row both satisfy
 *  it, and neither has to know about the other. */
export interface ReadLike {
  shape: Shape;
  tiers: { ovr: TierText; atk: TierText; def: TierText };
  tier_gaps: { ovr: number; atk: number; def: number };
}

/** One sentence a human can read without the legend. */
export function shapeRead(r: ReadLike): string {
  const g = r.tier_gaps, t = r.tiers;
  if (r.shape === "CLEAN") {
    return "Clean — the favourite is a better tier overall, in attack and in defence.";
  }
  const flat: string[] = [];
  if (g.atk <= 0) flat.push(`${gapWord(g.atk)} in attack (${pair(t.atk)})`);
  if (g.def <= 0) flat.push(`${gapWord(g.def)} in defence (${pair(t.def)})`);
  if (g.ovr <= 0) flat.push(`${gapWord(g.ovr)} overall (${pair(t.ovr)})`);
  const strong: string[] = [];
  if (g.atk > 0) strong.push(`attack ${sign(g.atk)}`);
  if (g.def > 0) strong.push(`defence ${sign(g.def)}`);
  if (g.ovr > 0) strong.push(`overall ${sign(g.ovr)}`);
  if (r.shape === "HOLLOW") {
    // 2026-09-03: this opened "high on the table gap, but …" and the
    // board underneath it said the opposite. HOLLOW is defined in the
    // backend (src/picker/stages.py, shape()) as atk <= 0 AND def <= 0
    // — there is NO table-gap condition in it at all — and measured
    // over 3,216 rated fixtures HOLLOW has the LOWEST median |GD/g| of
    // the three shapes: CLEAN 1.02 (53.4% of rows clear a 1.0 gap),
    // SPLIT 0.36 (7.0%), HOLLOW 0.18 (1.1%). So the old clause told a
    // reader the reverse of the data on 98.9% of the rows it appeared
    // on. The sentence now states what the shape IS — both units
    // failing to back the pick — and claims nothing about the table.
    // Do not restore the table clause from intuition.
    return `Hollow — neither unit backs the pick: ${flat.join(" and ")}.`;
  }
  return `Split — the tier gap is ${strong.join(" and ")}; ${flat.join(" and ")}.`;
}

/** One tier dimension as a CELL (2026-09-01 convergence to the
 *  approved mockup): fill and colour say the same thing twice — green
 *  filled = ahead, amber half = level, red empty = behind — so a level
 *  defence cannot pass for a small positive at a glance, with or
 *  without the hues. data-dim/data-gap stay machine-readable. */
export function TierCell({ label, gap }: { label: string; gap: number }) {
  const cls =
    gap > 0 ? "bg-up border-up"
    : gap === 0
      ? "border-warn [background:linear-gradient(90deg,var(--warn)_50%,transparent_50%)]"
      : "border-neg bg-transparent";
  return (
    <i data-testid="tier-cell" data-dim={label} data-gap={gap}
      title={`${label}: ${gapWord(gap)}`}
      className={`inline-block h-[8px] w-[8px] rounded-[2px] border ${cls}`} />
  );
}

/** HOW MUCH OF THIS RATING IS THIS SEASON — the number that replaced a
 *  binary badge.
 *
 *  The board blends both seasons per club by games played, so "prior
 *  szn" was never a fact about a row, only about which side of a
 *  threshold it fell. This chip says the weight: "38% this season".
 *  Amber below half (last season still carries the rating), accent at
 *  or above it. A side rated with NO prior row at all is called out,
 *  because 100% is not the top of the same scale — it is a different
 *  basis. */
export function SeasonWeight({ w, alt, departure }: {
  w: BlendWeights;
  /** Why this chip is drawn at all. The board states the season basis
   *  once per league in the column header; a chip on a row means the row
   *  DEPARTS from it, and the reason belongs in the same title as the
   *  weights rather than in a second chip beside them. */
  departure?: string | null;
  /** What this season ALONE concludes, when it differs materially. The
   *  chip already answers "how much of this rating is this season"; the
   *  natural place to answer "and what would this season alone say" is
   *  the same chip, not a new one. */
  alt?: { blended: number; current: number; delta: number } | null;
}) {
  const current = weightIsCurrent(w.min);
  const soloSide = w.basis.home === "current_only"
    || w.basis.away === "current_only";
  const title =
    `home ${pctThisSeason(w.home)} · away ${pctThisSeason(w.away)}`
    + ` — each club weighted by its own games played, w = GP/(GP+${w.k})`
    + (w.constant != null
        ? ` · FROZEN-WEIGHT CONTROL w=${w.constant}` : "")
    + (soloSide
        ? " · a side with no prior-season row is rated on this season"
          + " alone and reported at 100%" : "")
    + (departure ? ` · ${departure}` : "")
    + (alt
        ? ` · ON THIS SEASON ALONE the GD/g gap is ${dec(alt.current)},`
          + ` not ${dec(alt.blended)} — the board ranks on the blend, and`
          + ` this says what the other cut would have concluded`
        : "");
  return (
    <span data-testid="season-weight" data-w={w.min ?? ""}
      data-alt={alt ? dec(alt.current) : undefined} title={title}
      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
        current
          ? "border-accent/40 bg-accent/5 text-accent"
          : "border-warn/40 bg-warn/5 text-warn"}`}>
      {pctThisSeason(w.min)} this szn
      {alt && (
        <span data-testid="season-alt" aria-hidden
          className="ml-1 opacity-70">*</span>
      )}
    </span>
  );
}

/** WHY A NUMBER IS NOT THERE, in the backend's own words. Rendered
 *  wherever a gap is withheld — the refusal is part of the read, not an
 *  omission from it. */
/* ─── THE CARD'S DATE CELL, WHICH IS A CLOCK ONCE THE MATCH STARTS ───
 *
 * THE OPERATOR, 2026-09-14: "when a match is inplay: 1. if not chosen to
 * watch live: still show it in its match card spot and instead of
 * showing the kickoff date and time, shows live with minute just like
 * the live cards. 2. If chosen to watch live: live both in the match
 * cards spot and the live match section, and says live with minute just
 * like the live cards."
 *
 * "JUST LIKE THE LIVE CARDS" IS LOAD-BEARING AND IS NOT A STYLE NOTE.
 * The strip and the card printed 45' and 45'+5' for one match on one
 * screen on 2026-09-11, because each had its own clock reader with the
 * opposite precedence. `lib/suggesterApi.readMatchClock` is now the ONE
 * place either learns what a clock says, and this cell reads it too —
 * the third surface, joining rather than forking. `data-source` is the
 * field the text came off, so a guard reads the SOURCE rather than the
 * sentence.
 *
 * WHETHER THE MATCH IS UNDER WAY IS NOT READ HERE. `row.in_play` is the
 * backend's own derivation off `board.IN_PLAY_STATES`, made in the
 * module that owns the provider's vocabulary. This cell never compares
 * a state against a string, and never infers liveness from having a
 * clock: a collector that went quiet is a fact about our coverage, and
 * treating it as "the match is not on" would put a kickoff time back on
 * a match that started — the exact defect this whole change fixes.
 *
 * SO AN IN-PLAY ROW WITH NO CLOCK SAYS SO. Never a stale kickoff time,
 * never a blank, and never minute 0. */

/** The words for an in-play row whose clock could not be read. A
 *  statement about THIS PAYLOAD, not about the provider — the reason it
 *  is absent is the backend's to state, and rides in the title. */
export const BOARD_CLOCK_ABSENT = "clock unavailable";

export function KickoffCell({ kickoff, inPlay, live, className = "" }: {
  kickoff: string | null | undefined;
  inPlay: boolean;
  live?: BoardRowLive | null;
  className?: string;
}) {
  if (!inPlay) {
    return (
      <span data-testid="row-kickoff" data-in-play="false"
        className={className}>
        {kickoff ? fmtDate(kickoff, "short") : "no kickoff"}
      </span>
    );
  }
  const clock = readMatchClock(live?.clock);
  const unread = clock.source === "unstated";
  // The backend's OWN sentence for the absence, never a second voice on
  // it. `absent.why` when it named one; the block's `basis` otherwise;
  // and when the whole block is missing — a tape read that raised, named
  // one level up as the column's `live_error` — this cell says only what
  // it can see.
  const why = live?.absent?.why ?? live?.basis
    ?? ("this board carried no live block for a match its own provider "
        + "status says is under way");
  return (
    <span data-testid="row-kickoff" data-in-play="true"
      title={unread ? why : undefined}
      className={`inline-flex items-center gap-1 ${className}`}>
      <i aria-hidden
        className="h-[5px] w-[5px] flex-none rounded-full bg-live" />
      <span className="text-live">LIVE</span>
      <span data-testid="row-clock" data-source={clock.source}
        className={unread ? "text-warn" : "text-live"}>
        {unread ? BOARD_CLOCK_ABSENT : clock.text}
      </span>
      <span className="sr-only">
        {" — this match is under way. Every figure on this card is a "}
        {"pre-kickoff read and was not recomputed when it kicked off."}
      </span>
    </span>
  );
}

export function GapNote({ note }: { note: string }) {
  return (
    <p data-testid="gap-note"
      className="mt-2 rounded-md border border-dashed border-warn/40 bg-warn/5 px-2.5 py-2 text-[11px] leading-relaxed text-warn">
      {note}
    </p>
  );
}

/** WHAT THE MARKET ACTUALLY SETTLES ON, when that is not the match.
 *  The Leagues Cup legs are regulation time only, so a price beside a
 *  knockout fixture is not the price of going through. */
export function RegTimeNote({ note }: { note: string }) {
  // Collapsed to its headline (2026-09-01): 340 characters repeated on
  // every cup card had become wallpaper. The summary line keeps the
  // load-bearing fact — REGULATION TIME ONLY — permanently visible; the
  // backend's full wording is one click away, not gone.
  return (
    <details data-testid="reg-time-note"
      className="mt-2 rounded-md border border-skylive/30 bg-skylive/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-skylive">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] marker:text-skylive/60">
        regulation time only — the price is 90 minutes, not the tie
      </summary>
      <p className="mt-1.5">{note}</p>
    </details>
  );
}

/** A dimension DISSENTS when its gap is not positive. This is the same
 *  partition shapeRead() builds `flat` from, so the chip's cut, the lit
 *  tier label and the popover's sentence all derive from ONE predicate
 *  and cannot drift apart. */
export const dissents = (gap: number) => gap <= 0;

/** WHICH CUT THE CHIP TAKES — or none at all.
 *
 *  Inside SPLIT at most one UNIT can dissent; the backend calls it HOLLOW
 *  when both do. So there are exactly three SPLIT cases, and only two of
 *  them are a cut:
 *
 *    attack gave way   (atk <= 0)  ->  horizontal
 *    defence gave way  (def <= 0)  ->  vertical
 *    neither did, the table lags   ->  NO CUT
 *
 *  That third case has no unit to sever — both units back the pick and it
 *  is the overall tier that does not — so it wears the old amber box
 *  instead, which is now a statement rather than a class label: the units
 *  are fine, the table is not. (2026-09-02: this replaced a compound
 *  vertical-plus-horizontal mark. It was the most complex geometry in the
 *  set, spent on the rarest case, and every alignment bug lived in it.) */
export function cutOf(read: ReadLike): { axis: "h" | "v"; level: boolean } | null {
  if (read.shape !== "SPLIT") return null;
  const g = read.tier_gaps;
  if (dissents(g.atk)) return { axis: "h", level: g.atk === 0 };
  if (dissents(g.def)) return { axis: "v", level: g.def === 0 };
  return null;
}

/** THE PLATE'S OWN CHANNEL: does the table back the pick?
 *
 *  Separate from the cut on purpose. A row can be cut for attack while the
 *  overall gap is level underneath it, and one mark cannot say both. So
 *  the CUT names the unit and the BOX names the table — tinted edge and
 *  wash when ovr does not back the pick, exactly the old SPLIT chip. The
 *  word itself stays --ink-hi so the two channels never fight for ink.
 *  CLEAN and HOLLOW take their own hue through the same two variables. */
function plateClass(read: ReadLike): string {
  if (read.shape === "CLEAN") return "sc-clean";
  if (read.shape === "HOLLOW") return "sc-hollow";
  const ovr = read.tier_gaps.ovr;
  if (ovr > 0) return "";
  return ovr === 0 ? "sc-ovr-level" : "sc-ovr-behind";
}

/** THE SHAPE, AS A WORD THE BOARD SHOT THROUGH (2026-09-01).
 *
 *  SPLIT was the plurality label — 27 of 54 live rows, 14 of the 27
 *  sign-patterns against CLEAN's one — and it said only that the read was
 *  mixed, so the chip on the most cards carried the least information. It
 *  is now CUT, and the axis of the cut is the answer: horizontal when
 *  attack gave way, vertical when defence did, both when the units lead
 *  and the table does not. The word is still a word and never a code; the
 *  geometry around it carries the rest.
 *
 *  SPLIT also loses the amber it never earned. On a card where amber
 *  already means level, ripeness and cross-league caveat, a taxonomy
 *  label was wearing a verdict hue — the only warm colour left here is a
 *  tear that genuinely means "level". CLEAN and HOLLOW are real verdicts,
 *  keep green and red, and are never cut.
 *
 *  A cut chip renders the word twice over: once as the real, TRANSPARENT
 *  text node — which keeps the accessible name and satisfies an
 *  exact-text assertion, because toBeVisible() is geometry and not colour
 *  — and once inside each piece through `data-w` + `::after`, which never
 *  enters textContent and so can never be matched a second time. The
 *  geometry lives in globals.css under THE SHAPE CHIP. */
export function ShapeChip({ read }: { read: ReadLike }) {
  const shape = read.shape;
  const cut = cutOf(read);
  const plate = plateClass(read);
  const ink =
    shape === "CLEAN" ? "text-up"
      : shape === "HOLLOW" ? "text-neg" : "text-ink-hi";

  if (!cut) {
    return (
      <span data-testid="shape-chip" data-cut="none"
        className={`sc sc-intact ${plate} ${ink} font-mono text-[10px] uppercase tracking-[0.16em]`}>
        <span className="sc-w">{shape}</span>
      </span>
    );
  }

  const piece = (k: string) => (
    <i key={k} className={`sc-half sc-${k}`} data-w={shape} aria-hidden />
  );
  return (
    <span data-testid="shape-chip" data-cut={cut.axis}
      data-cut-tone={cut.level ? "level" : "behind"}
      className={`sc sc-cut sc-${cut.axis} ${cut.level ? "sc-level" : ""} ${plate} text-ink-hi font-mono text-[10px] uppercase tracking-[0.16em]`}>
      {piece("a")}{piece("b")}
      <i className="sc-tear sc-t1" aria-hidden />
      <span className="sc-w">{shape}</span>
    </span>
  );
}

/** THE READ THE CARD ACTUALLY DRAWS, once the field has had its say.
 *
 *  THE OPERATOR'S RULE (2026-09-09): the Champions League card is the
 *  landing page's card, with the DATA BEHIND IT substituted — never a
 *  second design. So the substitution happens HERE, in one object, and
 *  every mark below reads that object: the three cells, the shape chip,
 *  the tier trio and the popover's sentence cannot disagree about one
 *  fixture because there is only one read for them to disagree about.
 *
 *  WHAT COMES FROM THE FIELD. The tier TEXT — every band the club's 95%
 *  interval touches, drawn whole, because "ovr 1v1" over Bayern and
 *  Bodo/Glimt was the defect that started this: a within-league
 *  quintile puts nearly every UCL entrant in its own league's top
 *  fifth, so ten of twelve cards said the two clubs were level.
 *
 *  WHAT DOES NOT. The GAP and the SHAPE are the backend's, always:
 *  `field.tier_gap` and the block's own `shape` when they are carried,
 *  and the row's own backend values when they are not. Differencing two
 *  band sets here to colour a cell would be this surface deciding a
 *  verdict, and the whole board is built the other way round — it shows.
 *
 *  AND THE BLOCK MAY NOT CARRY ALL THREE AXES (backend #141,
 *  2026-09-15). `field.axes[k][side]` was indexed three times with no
 *  guard, which is precisely why the MLS + Liga MX reading — measured
 *  on Elo alone — rides under `field_partial` and not under `field`: a
 *  one-axis block here did not degrade the card, it threw inside it. So
 *  this walks `FieldBlockLike`, whose `axes` is PARTIAL, and an axis
 *  the block does not carry keeps the ROW's own text and gap.
 *
 *  KEEPING IT IS NOT DRAWING IT. What the card renders for a missing
 *  axis is NOTHING — see `drawn` in TierGaps — and the value kept here
 *  is what the marks that read three gaps together need: the shape
 *  chip's word is the row's, computed by the backend from the row's own
 *  three gaps, and the chip's plate and cut must be able to read those
 *  same three rather than two of three and a hole. */
function effectiveRead(read: ReadLike, block?: FieldBlockLike | null,
                       shape?: Shape | null): ReadLike {
  if (!block) return read;
  const text = (side: "fav" | "opp", k: FieldAxisKey) => {
    const axis = block.axes[k];
    /* AN AXIS NOBODY MEASURED IS NOT A CLUB WITH NO BAND. The first is
       a fact about the evidence and the second about this club in it;
       a field that carries no attack axis cannot say "no band" on
       attack, because there is no axis for the club to be missing
       from. So the row's own reading is kept, and the trio draws the
       axis nowhere. */
    /* …AND A ROW MAY CARRY NO READING FOR THAT AXIS EITHER (2026-09-24,
       the Championships board): a national team measured on Elo alone
       rides under `field_partial` with `tiers.atk: null`, and indexing
       that null threw inside the card. The axis is not drawn either
       way; what is kept is the named absence, never a number. */
    if (!axis) return read.tiers[k]?.[side === "fav" ? 0 : 1] ?? "no band";
    /* NO FALLBACK NUMBER. An empty set is a club the payload placed in
       no band at all; printing its `tier` would invent exactly the
       placement the set exists to refuse. */
    return tierSet(axis[side]) ?? "no band";
  };
  const gap = (k: FieldAxisKey) =>
    block.axes[k]?.tier_gap ?? read.tier_gaps[k];
  return {
    shape: shape ?? read.shape,
    tiers: {
      ovr: [text("fav", "ovr"), text("opp", "ovr")],
      atk: [text("fav", "atk"), text("opp", "atk")],
      def: [text("fav", "def"), text("opp", "def")],
    },
    tier_gaps: { ovr: gap("ovr"), atk: gap("atk"), def: gap("def") },
  };
}

/** THE THREE AXES' READING NAMES, keyed by the axis rather than listed
 *  beside it. The trio and the popover both spell the dimensions out in
 *  words, and a trio that draws FEWER than three now walks the axes the
 *  block carries — so a parallel list would go out of step with it the
 *  first time an axis was missing from the middle. */
const DIM_LABEL: Record<FieldAxisKey, string> = {
  ovr: "overall", atk: "attack", def: "defence",
};

/** THE DAGGER ON A CLUB THE PLACEABILITY FLOOR REFUSED, carrying the
 *  backend's own reason on hover.
 *
 *  "make sure to mark those 11 somehow for me to know their data were
 *  refused at first. Subtlely." — the operator, 2026-09-09. Same mark,
 *  same size and same hover sentence the field page uses, so one
 *  convention covers both surfaces. It rides the tier trio because that
 *  is where the band it qualifies is printed; the ranks panel therefore
 *  carries none, which is not an omission — a second copy of a mark
 *  eight pixels away says nothing the first did not.
 *
 *  A MARK THAT CANNOT SPEAK IS WORSE THAN NO MARK (fixed 2026-09-17).
 *  The below-floor branch used to read `side.fav.floor_note`, a key the
 *  BOARD has never sent — only the ratings payload did — so every
 *  dagger on a board-fed card rendered `title=""`. It said "something
 *  is off about this number" and then refused to say what, directly
 *  beside the rating the card had just started showing, which is the
 *  one number on the card the dagger exists to qualify.
 *
 *  THE SENTENCE IS THE RESPONSE'S, SAID ONCE. It rides the envelope
 *  (`Board.field_floor_note`, `Ratings.below_floor_note`) rather than
 *  each side, because it is a 500-byte constant and the backend freezes
 *  whole rows onto its volume on every production GET. See
 *  fieldApi.floorNoteFor, which is where the two producers are joined,
 *  and pickerApi.FieldSide, which says why the key is not there.
 *
 *  THE STRADDLE BRANCH IS UNCHANGED and still composes its sentence
 *  here: that one is ABOUT this club's own bands, so it is a different
 *  sentence per side and there is nothing to hoist. */
function FloorMark({ note }: { note?: string | null }) {
  return (
    <sup data-testid="field-floor-mark" title={note || ""}
      className="ml-0.5 cursor-help text-[8px] font-normal text-ink-faint">
      †
    </sup>
  );
}

/** THE FIELD'S RANKS, PER AXIS, BEHIND ONE `i` (operator, 2026-09-09).
 *
 *  THE ONLY NEW THING ON THIS CARD. "make sure to use the exact design,
 *  only with new 'i' added. Consistency is key." Everything else the
 *  Champions League card draws is the board's own card drawing the
 *  field's numbers instead of a league's; this is the single addition,
 *  and it exists because three ranks cannot go on a card that already
 *  says everything it says in one line each.
 *
 *  WHAT IS INSIDE IT, AND NOTHING ELSE. Three axis labels over three
 *  rank pairs. No club names — the two names are the largest type on
 *  the card, six lines above. No heading, because the panel is opened
 *  from an `i` beside the trio it belongs to and a title would repeat
 *  the trio's own labels. No daggers: the trio carries those, beside
 *  the bands they qualify.
 *
 *  IT IS SHAPED LIKE THE TRIO, DELIBERATELY. The same cell — a 7.5px
 *  label over a 10px mono value — in the same order, so the panel reads
 *  as the trio's second row rather than as a new object, and its label
 *  row lines up with the trio's label row exactly. That alignment is
 *  structural, not arithmetic: the panel is pulled up by exactly its
 *  own padding, so its first row starts at the top of the block the
 *  trio's label row also starts at.
 *
 *  IT OPENS THREE WAYS AND CLOSES THREE WAYS, which is the treatment
 *  `ColumnNotes` already carries: hover, keyboard focus, and a click
 *  that PINS — there is no hover on a phone and none from a keyboard —
 *  and Escape, a second click, or a click anywhere outside closes it.
 *  Neutral line and ink at rest, accent only when it is open: it is an
 *  affordance, not an alert, and the traffic light stays on the
 *  numbers. */
function FieldRanks({ block, drawn, absent }: {
  block: FieldBlockLike;
  /** the axes this block CARRIES, in reading order — never AXIS_ORDER,
   *  which is the set a three-axis field happens to fill */
  drawn: readonly FieldAxisKey[];
  /** WHICH AXES THE FIELD DOES NOT HOLD AND WHY, in the backend's own
   *  words (`field_partial.shape_absent`). Null on a whole field, which
   *  has none — and the panel is then byte for byte what it was. */
  absent: { axes_absent: string[]; why: string } | null;
}) {
  const panelId = useId();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const open = pinned || hovered || focused;
  const shut = () => { setPinned(false); setHovered(false); setFocused(false); };

  /* CLICK-OUTSIDE, AND ONLY WHILE IT IS PINNED. A hovered panel closes
     itself when the pointer leaves, so a listener for that state would
     be a document-wide handler on every card of a six-abreast board
     doing nothing. `pointerdown` rather than `click` so the panel is
     gone before the card's own link takes the press. */
  useEffect(() => {
    if (!pinned) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) shut();
    };
    document.addEventListener("pointerdown", away, true);
    return () => document.removeEventListener("pointerdown", away, true);
  }, [pinned]);

  /* THE AXES THE BLOCK HAS, NOT THE THREE A FIELD MAY HAVE. A panel
     that walked AXIS_ORDER would print `ovr #1v#2` beside two labels
     with nothing under them, which is the empty band this whole key
     exists to avoid — one cell wide instead of one card wide. */
  const axes = drawn.flatMap((k) => {
    const a = block.axes[k];
    return a ? [{ k, a }] : [];
  });
  const label = "the field's ranks on each axis — "
    + axes.map(({ k, a }) => `${k} #${a.fav.rank} v #${a.opp.rank}`).join(", ")
    + `, of ${block.size}`
    /* AND THE AXES IT HAS NONE FOR, NAMED IN THE NAME. A reader who
       cannot see that the trio is one cell short is exactly the reader
       this affordance is for. The account is inside; the name says
       there is one. */
    + (absent && absent.axes_absent.length > 0
        ? `, and no ${absent.axes_absent.join(" or ")} axis — nobody has`
          + " measured one for these leagues, and the panel says why"
        : "");

  return (
    /* STILL NOT `relative`, and that is the property being preserved
       rather than a leftover: this 15px circle must never be the box the
       panel hangs off. A 136px panel hung off it in a ~211px card would
       start near that card's right edge and finish well past it, and
       `html { overflow-x: clip }` means the overhang would be CLIPPED
       rather than scrollable. What changed on 2026-09-10 is WHICH wider
       box it hangs off — the trio was, the tier block now is; see the
       panel below. */
    <span ref={box} className="inline-flex self-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === "Escape") shut(); }}>
      <button type="button" data-testid="field-ranks-open"
        aria-expanded={open} aria-label={label}
        aria-describedby={open ? panelId : undefined}
        data-size={block.size}
        data-axes={axes.map(({ k }) => k).join(",")}
        data-axes-absent={absent && absent.axes_absent.length > 0
          ? absent.axes_absent.join(",") : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => {
          e.preventDefault(); e.stopPropagation();
          // the click is authoritative: a second tap closes a panel a
          // hover is still holding open, which is the only way out on a
          // touch screen
          setPinned((v) => !v); setHovered(false); setFocused(false);
        }}
        /* `#`, NOT `i` (2026-09-10). The row already carries an `i`
           — `tier-read`, six pixels away on a full row, whose panel
           EXPLAINS the shape in prose. This one only prints numbers.
           Two identical circles side by side is the thing ColumnNotes
           argues against in its own header, and the operator asked for
           "only with new 'i' added" before either of us knew the first
           one was there. Same circle, same size, same states; the glyph
           is what says which is the explainer and which is the data,
           and `#` is the card's own idiom for a rank. NOT `font-mono`,
           for the reason ColumnNotes gives: at this size the mono glyph
           reads as part of the row of mono digits beside it rather than
           as a control. */
        /* `relative z-30` KEEPS THE TRIGGER ABOVE ITS OWN PANEL. The
           panel is anchored to the TRIO and is wider than it, so at a
           narrow track it reaches past this circle — and a panel over
           its own trigger swallows the click that closes it, which is
           the 2026-09-07 bug in the popover beside this one, found here
           at 820px before it shipped. Above it, the circle stays lit,
           stays clickable, and reads as the control that is holding the
           panel open. */
        className={`relative z-30 inline-flex h-[15px] w-[15px] items-center justify-center rounded-full border text-[10px] font-semibold leading-none transition-colors ${
          // OPAQUE WHILE OPEN, and only then. The panel reaches past
          // this circle in a narrow track (see z-30 above); on the
          // panel's own ground the circle reads as the control holding
          // it open rather than as a ring drawn over a digit.
          open ? "border-accent/60 bg-elev2 text-accent"
            : "border-line-strong text-ink-low hover:border-accent/40 hover:text-accent"}`}>
        #
      </button>
      {open && (
        <span data-testid="field-ranks" id={panelId} role="note"
          /* ON THE CARD'S RIGHT-HAND SIDE, BELOW THE ROW IT READS
             (operator, 2026-09-10: "the hover ranking must display on
             the right hand").
             It opened `left-0 top-0` on the TRIO — over the three tier
             cells, and, measured at every step of the ladder, over its
             own trigger as well: at 390px the panel spanned 143→279
             with the circle at 245→260 underneath it. `z-30` on the
             circle kept the CLICK working, which is why that shipped;
             it does not make a panel drawn across the numbers it is a
             second reading of a good place to put one.
             `right-0` IS THE CARD'S OWN RIGHT EDGE, not the trio's:
             the positioning context is TierGaps's block, which is one
             card-content wide. So the panel can never leave the card on
             the right, and `w-max max-w-full` keeps it from leaving on
             the left — the 136px it measures against a 211px content
             box has room to spare, and the cap holds even if a field of
             three-digit ranks ever widens it.
             `top-[calc(100%+7px)]` IS BELOW THE WHOLE BLOCK, and that is
             the 2026-09-07 property kept in a stronger form. This row is
             `flex-wrap`; a panel anchored inside it can be reached by a
             wrapped trigger, which is exactly how the shape popover next
             door came to swallow the click that closed it. Nothing that
             is IN the block can be inside a box that starts below it, at
             any width — the same reasoning, and the same offset, its
             dense mode already uses. The trio's label row and the
             panel's therefore no longer align, which was a real virtue
             and is the price of opening on the right-hand side. (The
             anchor's corner, asked for the same day, went back beside
             the club names on 2026-09-11; this placement did not move
             with it — the operator asked for it and has not disputed
             it.) */
          /* `w-max` FITS THE RANK PAIRS; PROSE NEEDS A COLUMN TO WRAP
             IN. A sentence under `w-max` asks for one enormous line and
             is then capped by `max-w-full` at whatever the card happens
             to be, which at the board's widest track is a paragraph
             three words deep. `w-64` when there is prose, still capped
             by the card, so the panel is a readable column at every
             width and unchanged where there is none. */
          className={`absolute right-0 top-[calc(100%+7px)] z-20 max-w-full rounded-lg border border-line-strong bg-elev2 p-3 shadow-xl ${
            absent ? "w-64" : "w-max"}`}>
          {/* `flex`, NOT `inline-flex`. An inline-flex is an atomic
              inline and sits on its parent's baseline, so the strut's
              descender pushed this row 12px below the trio's — the
              alignment quietly off by exactly one line's leading. A
              block-level flex has no baseline to sit on. */}
          <span className="flex items-end gap-2.5 font-mono text-[10px] tabular-nums text-ink-low">
            {axes.map(({ k, a }) => (
              <span key={k} data-rank-axis={k}
                className="inline-flex flex-col items-center gap-[2px] leading-none">
                <span className="text-[7.5px] uppercase tracking-[0.12em] text-ink-faint">
                  {k}
                </span>
                {/* `#33v#7`, SET THE WAY THE TRIO SETS ITS OWN PAIR —
                    `2·3v3·4`, no spaces around the v. The panel is the
                    trio's second reading and sits directly on it, so a
                    second idiom eight pixels away would read as a
                    different kind of fact. It is also what makes the
                    thing FIT: with spaces the panel is ~196px against a
                    ~171px card six abreast, and it both left the card
                    and covered its own trigger. */}
                <span className="whitespace-nowrap">
                  #{a.fav.rank}v#{a.opp.rank}
                </span>
              </span>
            ))}
          </span>
          {/* AND WHAT THIS FIELD DOES NOT MEASURE, IN THE BACKEND'S OWN
              WORDS (backend #141, 2026-09-15).
              THE TRIO CANNOT SAY IT, WHICH IS WHY IT IS HERE. An axis
              nobody measured is drawn NOWHERE on this card — no cell,
              no label, no band — because a cell for it would be a
              claim about evidence that does not exist, and a blank one
              would read as a club the field failed to place. But an
              absence drawn nowhere is also an absence a reader cannot
              ask about, so the account rides the one affordance that is
              already the field's own detail on this card: the `#` the
              trio it belongs to opens.
              `shape_absent.why` VERBATIM, never summarised. It names
              which axes are missing, says why no `shape` can be read
              off what is left, and carries the registry's own account
              of what this field IS — composed by the backend off the
              reading, so a field that gains an axis tomorrow moves the
              sentence with it. A sentence restated here would be this
              surface asserting a measurement it did not make.
              A WHOLE FIELD DRAWS NONE OF THIS: `absent` is null, and
              the panel above is byte for byte what it was. */}
          {absent && (
            <span data-testid="field-axes-absent"
              data-axes-absent={absent.axes_absent.join(",")}
              className="mt-2.5 block border-t border-line pt-2 text-[10px] leading-relaxed text-ink-low">
              {absent.why}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** The Stage-2 read, compact (2026-09-01): three cells + the shape
 *  word + the exact tier pairs on one line, with the plain-English
 *  sentence and the per-dimension detail one click away. Everything the
 *  old three-chip block said is still said — the sentence in the
 *  popover is the same shapeRead(), word for word — it just stops
 *  costing 70px on every card. Shared by the board card and the
 *  finished tail, so both surfaces converge together. */
/** ONE CLUB'S MEASUREMENT, PRESENT — the type `measurementOf` hands
 *  back when it has both halves. */
type Measured = NonNullable<ReturnType<typeof measurementOf>>;

/** BOTH SIDES' MEASUREMENTS, OR NEITHER — never one of the two.
 *
 *  The trio's whole job is to put two clubs beside each other, and half
 *  a comparison is worse than none: a lone `1964` under a `1v3` reads
 *  as a fact about the pair when it is a fact about one club. The
 *  backend emits the two together or refuses, so a payload with one is
 *  one this frontend does not understand — and it degrades to the card
 *  that has no numbers rather than to a card with half of them.
 *
 *  `measurementOf` is where the value-and-half-width check itself
 *  lives; this only says that a PAIR is needed. */
function bothMeasured(side: FieldAxis | undefined) {
  if (!side) return null;
  const fav = measurementOf(side.fav), opp = measurementOf(side.opp);
  return fav && opp ? { fav, opp } : null;
}

/** THE WHOLE READING OF ONE AXIS, FOR THE HOVER — the two figures, the
 *  scale they are on, and each one's 95% interval in full.
 *
 *  WHY THE INTERVAL IS SPELLED OUT HERE AND NOT ON THE FACE. The face
 *  carries `value±half_width`, which is the same fact written shorter;
 *  this is where there is room to write the bounds the backend actually
 *  sent, and to NAME the scale, which is the one thing the digits
 *  cannot say for themselves. `1964` and `1.14` sit six pixels apart on
 *  one card and are not comparable quantities.
 *
 *  IT SHOWS; IT DOES NOT DECIDE. No sentence here tells anybody what to
 *  do about the numbers. */
function measureTitle(
  axis: string,
  side: FieldAxis | undefined,
  m: { fav: Measured; opp: Measured },
): string {
  const unit = unitLabel(side?.unit);
  /* THE SAME ROUNDING AS THE FACE AND AS THE FIELD'S OWN PAGE. Written
     out longhand here it would be a third copy of a rule that exists
     precisely because there were two. */
  const d = axisDecimals(side?.unit);
  const line = (which: "fav" | "opp", mm: Measured) =>
    `${which === "fav" ? "favourite" : "opponent"} `
    + `${mm.value.toFixed(d)} ±${mm.half_width_95.toFixed(d)} `
    + `(95%: ${mm.interval[0].toFixed(d)} to ${mm.interval[1].toFixed(d)})`;
  const head = side?.label ?? axis;
  return [
    unit ? `${head}, in ${unit}` : head,
    line("fav", m.fav),
    line("opp", m.opp),
    "the tier above is where the estimate falls; the width is what the"
    + " evidence will not narrow",
  ].filter(Boolean).join(" · ");
}

export function TierGaps({ read, dense = false, field, partial,
                          floorNote }: {
  read: ReadLike;
  /** WHERE THESE TWO CLUBS STAND IN THE COMPETITION'S OWN FIELD, when
   *  somebody has measured one (pickerApi.RowField). It substitutes the
   *  DATA and adds exactly one mark: the tier trio prints the field's
   *  band sets instead of two league quintiles, the cells and the chip
   *  take the field's gap and shape when the block carries them, and an
   *  `i` beside the trio opens the field's three rank pairs.
   *  Absent — every league column, and the finished tail — and this
   *  component draws precisely what it drew before. */
  field?: RowField | null;
  /** THE SAME STANDING WHERE THE FIELD IS MEASURED ON FEWER AXES —
   *  `row.field_partial` (pickerApi.RowFieldPartial), which is a
   *  SEPARATE KEY and stays one: the axes it carries are drawn exactly
   *  as `field`'s are, the axes it does not carry are drawn nowhere at
   *  all, and its `shape_absent` sentence says which and why. Never
   *  passed beside `field` — the backend emits one or the other. */
  partial?: RowFieldPartial | null;
  /** WHAT A BELOW-FLOOR DAGGER IN THIS BLOCK SAYS ON HOVER — the
   *  response's own sentence, resolved once per card by
   *  fieldApi.floorNoteFor and passed down rather than looked up here.
   *
   *  ON THE CARD AND NOT ON THE SIDE. It is one constant for every
   *  refused club on every axis, so the payload says it once per
   *  response; a copy per side would be six inside one Champions League
   *  block and the backend freezes rows onto a volume. See
   *  pickerApi.FieldSide.
   *
   *  Absent is not empty: a board that predates the key leaves the
   *  dagger exactly as it was rather than promising a tooltip that has
   *  nothing in it. */
  floorNote?: string | null;
  /** the card sits in a narrow dense-grid track (PickerColumn.DENSE_GRID)
   *  — the shape popover anchors to the tier block there rather than to
   *  its trigger, so it spans the card's content width and cannot reach
   *  past a narrow column's edge. Only reachable on a card with no
   *  field; a field-rated card draws no popover at all. */
  dense?: boolean;
}) {
  const [open, setOpen] = useState(false);
  /* THE BLOCK THIS CARD IS READING — ONE OF THE TWO KEYS, CHOSEN, NEVER
     THE TWO COMBINED. `field` is the three-axis contract and `partial`
     is the reading that carries fewer; a row has one or the other, and
     what is drawn below comes from whichever it was given. Nothing is
     padded to the other's shape and nothing is read off both.
     THE TYPE IS THE WEAKER ONE ON PURPOSE. `FieldBlockLike.axes` is
     PARTIAL, so every mark below has to ask whether an axis is there —
     which is the ask whose absence made `field_partial` a separate key
     in the first place (backend #141). */
  const block: FieldBlockLike | null = field ?? partial ?? null;
  /* WHICH AXES ARE DRAWN AT ALL. A whole field answers all three and
     every mark renders exactly what it rendered before; a partial one
     answers fewer, and the axes it does not carry get no cell, no
     label and no band — an axis nobody measured is not a club the
     field failed to place, and a blank cell is how those two become
     one thing on a screen. With no block the trio keeps its three
     league quintiles, unchanged. */
  const drawn: readonly FieldAxisKey[] =
    block ? axesPresent(block) : AXIS_ORDER;
  /* ONE READ, DERIVED ONCE, AND EVERY MARK BELOW ASKS IT. Without a
     block this IS `read`, by identity — see effectiveRead — so the four
     league columns and the finished tail render byte for byte what they
     rendered before.
     THE SHAPE COMES OFF THE BLOCK THAT HAS ONE. `field.shape` is the
     backend's reading on the field's own tiers; a PARTIAL block carries
     no `shape` key at all, because CLEAN/CUT/HOLLOW is read off three
     gaps together and this field has one — so the row's own backend
     shape stands, which is still the backend's word and not a label
     composed here out of one gap and two absences. */
  const r = effectiveRead(read, block, field?.shape ?? null);
  /* WHY AN AXIS IS NOT DRAWN, in the backend's own words. Only a
     partial block has any: a whole field is missing nothing. */
  const absent = partial?.shape_absent ?? null;
  const dims = drawn.map((k) =>
    [DIM_LABEL[k], r.tier_gaps[k], r.tiers[k]] as const);
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="inline-flex items-center gap-[3px]">
          {dims.map(([label, gap]) => (
            <TierCell key={label} label={label} gap={gap} />
          ))}
        </span>
        {/* A SHAPE THE BACKEND WITHHELD IS SAID, NOT DRAWN EMPTY. A partial
            block carries no shape and — on a national row measured on
            Elo alone — neither does the row: CLEAN/HOLLOW/SPLIT is read
            off three gaps and this fixture has one. The chip's plate
            with nothing in it would read as a shape that failed to
            load; the backend's own sentence says why there is none. */}
        {r.shape ? <ShapeChip read={r} /> : (
          <span data-testid="shape-absent" title={absent?.why ?? undefined}
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            no shape
          </span>
        )}
        {/* THE TRIO AND ITS `#`, AS ONE FLEX ITEM (2026-09-09). This row
            is `flex-wrap`, so as separate items the circle wrapped onto
            the line BELOW the trio in a narrow track and sat adrift in
            the row; grouped, they wrap together. And the affordance
            means "the same three axes, as ranks" — it belongs against
            the thing it is about.
            NO LONGER `relative` (2026-09-10). The group was the panel's
            positioning context while the panel opened ON the trio;
            it now opens on the CARD's right-hand edge, below this whole
            block, so the context it needs is TierGaps's own `relative`
            above. Dropping the class is layout-neutral — `relative` with
            no offsets moves nothing — and leaving it would silently keep
            the panel hanging off a box one trio wide.
            WITHOUT A FIELD THIS WRAPS THE TRIO ALONE, which is a flex
            item of the same size holding the same child: the four
            league columns and the finished tail lay out exactly as
            before. */}
        <span className="inline-flex items-end gap-2">
        <span
          className="inline-flex items-end gap-2.5 font-mono text-[10px] tabular-nums text-ink-low"
          title={block
            ? "tier bands in this competition's own field, favourite v"
              + " opponent — every band the club's 95% interval touches,"
              + " so a set of two is a placement the evidence refuses to"
              + " narrow. A name in its own colour is a unit that does"
              + " not back the pick."
              /* AND WHY THERE ARE FEWER THAN THREE OF THEM. The hover
                 on the numbers is where a reader asks what the numbers
                 are; an axis missing from the row they are hovering is
                 part of that answer. The account itself is the `#`'s,
                 in the backend's own words — this says there is one. */
              + (absent && absent.axes_absent.length > 0
                  ? ` This field has no ${absent.axes_absent.join(" or ")}`
                    + " axis: nobody has measured one for these leagues,"
                    + " so neither is drawn. The # beside these numbers"
                    + " says why, in the backend's own words."
                  : "")
            : "tier pairs, favourite v opponent — a name in its own colour is a unit that does not back the pick"}>
          {/* A dissenting dimension's NAME lights in its own verdict tone.
              Same dissents() predicate the chip's cut uses, so the lit
              label always names what the shot severed and the two can
              never disagree. Weight carries it a second way, so the read
              survives for anyone the hues fail.
              NOTE data-tier, NOT data-dim: picker-blend-cup.spec.ts locates
              '[data-dim="overall"]' UNQUALIFIED by tier-cell, so a second
              data-dim on a wrapper would resolve to two elements and fail
              Playwright's strict mode. */}
          {/* `drawn`, NOT AXIS_ORDER (backend #141, 2026-09-15). The
              order is the three axes a field MAY have; this is the
              axes this block HAS. On a whole field they are the same
              list and this trio is unchanged. */}
          {drawn.map((lbl) => {
            const gap = r.tier_gaps[lbl], pr = r.tiers[lbl];
            /* OFF THE BLOCK THIS CARD IS READING, NOT OFF `field`
               (resolving #81 against backend #141). #81 put the value
               and its half-width on `FieldSide`, which is the type
               BOTH keys' axes are built from — so an axis carried by
               `field_partial` arrives holding the same two numbers,
               and reading them off `field` alone would have drawn the
               one-axis block's tier with no figure beside it for
               exactly the leagues this key exists to serve. */
            const side = block?.axes[lbl];
            const m = bothMeasured(side);
            return (
            <span key={lbl} data-tier={lbl} data-dissent={dissents(gap)}
              data-fav-set={side ? side.fav.tier_set.join(",") : undefined}
              data-opp-set={side ? side.opp.tier_set.join(",") : undefined}
              className="inline-flex flex-col items-center gap-[2px] leading-none">
              <span className={`text-[7.5px] uppercase tracking-[0.12em] ${
                gap > 0 ? "text-ink-faint"
                  : gap === 0 ? "font-semibold text-warn"
                    : "font-semibold text-neg"}`}>
                {lbl}
              </span>
              {/* THE DAGGERS RIDE THE BANDS THEY QUALIFY. A club the
                  placeability floor refused on the first reading is
                  marked here and nowhere else on the card — same mark,
                  same hover sentence, as the field's own page. */}
              {/* THE MARK FIRES ON A WIDE INTERVAL, NOT ONLY ON A
                  REFUSED LEAGUE (2026-09-10). The trio prints the POINT
                  tier now, so the mark is the only thing left saying
                  when that point is not a placement the evidence will
                  stand behind — "if the +- is too big, put a subtle
                  mark there and I will know", the operator.
                  IT MATTERS MOST ON def AND atk, AND MORE SO SINCE THE
                  RECUT (2026-09-10). All three axes are cut into 5
                  bands now — a DECLARATION, the operator's, taken with
                  the measurement in front of him and not a fit to it.
                  What the measurement licenses is 3 on attack and 3 on
                  defence (2.41 and 2.33 distinguishable levels) against
                  7 on overall, so two of the three axes are drawn finer
                  than their own evidence supports. That is the trade
                  and it lands here: the point tiers spread out, and on
                  the same intervals almost nothing stays placed.
                  Placed cleanly after the recut: 10 of 36 on ovr, 2 on
                  atk, 0 on def — every one of the 36 defensive
                  intervals now crosses a cut. So a bare number on def
                  would assert, 36 times out of 36, exactly the
                  placement the set exists to refuse, and the mark below
                  fires on 36 of 36 there and 35 of 36 on atk.
                  Below-floor keeps its own sentence; a straddle gets
                  the plain one. */}
              {/* `data-tier-pair` MARKS THE PAIR ITSELF (2026-09-16).
                  The cell used to hold one line, so a test could read
                  the whole cell's text and get the pair; the
                  measurement below is inside the same cell, and a
                  whole-cell read now returns the pair AND the figures
                  run together. The pair is what "one number per side"
                  is a claim about, so it is addressable rather than
                  inferred from everything the cell happens to contain. */}
              <span data-tier-pair={lbl} className="whitespace-nowrap">
                {pr[0]}{side && (side.fav.below_floor || side.fav.straddles)
                  && <FloorMark note={side.fav.below_floor
                    ? floorNote
                    : `the 95% interval touches bands ${side.fav.tier_set.join("·")} — ${side.fav.tier} is where the estimate falls, not a band the evidence will narrow to`} />}v{pr[1]}
                {side && (side.opp.below_floor || side.opp.straddles)
                  && <FloorMark note={side.opp.below_floor
                    ? floorNote
                    : `the 95% interval touches bands ${side.opp.tier_set.join("·")} — ${side.opp.tier} is where the estimate falls, not a band the evidence will narrow to`} />}
              </span>
              {/* THE NUMBER THE TIER ABOVE WAS READ OFF (2026-09-16).
                  "they all have ovr, atk, def tiers but dont have the
                  actual number to rank is not consistent and doesnt
                  make sense" — the operator, comparing this card with
                  the field's own page, which has always drawn the value
                  and its half-width for these same clubs off this same
                  fit. Two surfaces, one measurement, and only one of
                  them showing it.
                  STACKED, NOT PAIRED ACROSS. The tier line pairs with
                  `v` because "1v3" is four characters; "1964±34v1727±93"
                  is fifteen, and three of those side by side do not fit
                  a card six abreast. Read down instead — favourite over
                  opponent, the same order the line above reads across.
                  THE HALF-WIDTH IS NOT OPTIONAL AND IT IS NOT A SECOND
                  ELEMENT. `writeMeasurement` returns the pair as ONE
                  string so no layout can wrap a value away from its
                  band and leave a bare number on a line: that number
                  would assert exactly the precision `tier_set` and the
                  dagger above exist to refuse. On the two goals axes
                  almost every interval crosses a cut, so the width IS
                  the reading.
                  ABSENT, NOT ZERO. A board from a backend that predates
                  the change carries no measurement, `measurementOf`
                  returns null for both sides, and these lines are
                  simply not drawn — the card is the one it was before.
                  Never a 0, never a dash where a rating goes; the
                  absence is NAMED in the `#` panel, which is where
                  there is room for a sentence. */}
              {m && (
                <span data-measure={lbl} data-unit={side?.unit ?? ""}
                  title={measureTitle(lbl, side, m)}
                  className="mt-[1px] flex flex-col items-center gap-[1px] text-[8.5px] leading-[1.25] text-ink-faint">
                  <span data-measure-side="fav" className="whitespace-nowrap">
                    {writeMeasurement(m.fav, side?.unit)}
                  </span>
                  <span data-measure-side="opp" className="whitespace-nowrap">
                    {writeMeasurement(m.opp, side?.unit)}
                  </span>
                </span>
              )}
            </span>
            );
          })}
        </span>
        {/* THE ONE ADDITION — the field's ranks, per axis. Immediately
            after the trio it belongs to, inside its group, and only
            when there is a field to open: an `i` over a competition
            nobody has measured would be an empty promise. */}
        {block && <FieldRanks block={block} drawn={drawn} absent={absent} />}
        </span>
        {/* THE SHAPE POPOVER — ON A LEAGUE COLUMN ONLY (2026-09-10).
            The operator: "keep the #, remove the i since it is
            repetitive and outdated data formatting". Both halves of
            that are true WHERE A FIELD IS READ: the `#` is already
            there, six pixels away, so the `i` is a second identical
            circle; and this panel prints the WITHIN-LEAGUE gaps, which
            on a field-rated card is the reading the field replaced.
            NEITHER IS TRUE ON A LEAGUE COLUMN. There is no `#` on those
            cards — FieldRanks draws only when a field exists — so
            nothing is repeated, and the tiers really ARE within-league
            quintiles, so nothing is stale. Removing it there would take
            the shape explainer off the landing board, which is the one
            surface he protected outright: "only with new 'i' added.
            Consistency is key."
            So the condition is the field, not the page.
            AND A PARTIAL FIELD IS A FIELD HERE (backend #141). Both
            halves hold on one: the `#` is drawn, so the `i` would be
            the second identical circle; and this panel's sentence
            reads THREE gaps together — `shapeRead` names attack and
            defence outright — which on a card whose field measures one
            axis would put two within-league quintiles into a sentence
            about a cross-league fixture. That is the two-ladders defect
            the field exists to end, in prose. */}
        {!block && (<>
        {/* THE POPOVER HANGS OFF THE BUTTON, NOT OFF THE ROW (2026-09-07).
            It was `absolute top-6` on the whole TierGaps block, which is
            24px below the block's top — fine while the row above it fits
            on one line. The row is `flex-wrap`, so in a narrow column it
            does not: the `i` button drops to a second line, lands INSIDE
            the popover's own box, and the popover then intercepts the
            click that would close it. Open, and no way out but another
            row. It never showed up because the only narrow-column board
            in the suite had its columns collapsed to 0px, so nothing was
            ever laid out at a width that wrapped this row.
            Anchored to the trigger, the panel is always directly under
            the thing that opened it, whatever the row does. */}
        {/* NOT `relative` when dense: dropping the positioning context
            here hands it to the tier block above, which is exactly one
            card wide. The button still owns the vertical anchor in the
            wide case (2026-09-07 — a wrapped button used to land inside
            its own popover); dense, `top-full` is BELOW the whole block,
            which the button cannot be inside either. */}
        <span className={`ml-auto inline-flex${dense ? "" : " relative"}`}>
          <button data-testid="tier-read" aria-expanded={open}
            aria-label="how to read this shape"
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation(); setOpen((o) => !o);
            }}
            className={`inline-flex h-[15px] w-[15px] items-center justify-center rounded-full border font-mono text-[9px] transition-colors ${
              open ? "border-accent/60 text-accent"
                : "border-line-strong text-ink-low hover:border-accent/40 hover:text-accent"}`}>
            i
          </button>
          {open && (
        <div data-testid="shape-read"
          className={`absolute top-[calc(100%+7px)] z-10 rounded-lg border border-line-strong bg-elev2 p-3 text-[11px] leading-relaxed text-ink-mid shadow-xl ${
            dense ? "inset-x-0" : "right-0 w-64"}`}>
          <p>{shapeRead(r)}</p>
          <div className="mt-2 space-y-0.5 border-t border-line pt-2 font-mono text-[10px]">
            {dims.map(([label, gap, tiers]) => (
              <p key={label} className="flex justify-between gap-3">
                <span className="uppercase tracking-[0.1em] text-ink-low">
                  {label}
                </span>
                <span className={
                  gap > 0 ? "text-up" : gap === 0 ? "text-warn" : "text-neg"}>
                  {pair(tiers)} {sign(gap)} · {gapWord(gap)}
                </span>
              </p>
            ))}
          </div>
          {/* WHAT A TIER IS HERE — and it is not one sentence for both
              boards. On a league column a tier is a within-league
              quintile; on a column reading a FIELD it is a band of that
              field, shared by every entrant, and a club's read is every
              band its 95% interval touches. Saying "within-league
              quintiles" over the field's bands would be this line
              describing the read it replaced. Annotation either way. */}
          <p className="mt-2 border-t border-line pt-2 text-[10px] text-ink-low">
            {block
              ? "Tiers are bands of this competition's own field, and a"
                + " club's read is every band its 95% interval touches;"
                + " annotation, never a veto."
              : "Tiers are within-league quintiles; annotation, never a veto."}
          </p>
        </div>
          )}
        </span>
        </>)}
      </div>
    </div>
  );
}

/** The favourite's Kalshi quote — annotation only. A row with no event,
 *  or an event with no live quote, STAYS on the board and says which of
 *  the two it is: "no kalshi event" and "listed · no quote" are different
 *  facts, and collapsing them into one blank hides a mapping failure. */
export function KalshiCell({ quote }: { quote: KalshiQuote | null | undefined }) {
  const k = quote;
  if (!k) {
    return (
      <span className="font-mono text-[11px] text-ink-faint"
        title="no Kalshi event matched this fixture's date and both club names">
        no kalshi event
      </span>
    );
  }
  if (k.ask_c == null) {
    return (
      // A ticker is one unbroken 22-character token and the only string
      // on this card with no space in it to wrap at, so it is the one
      // that can outgrow a narrow track. `anywhere` lets it break rather
      // than run off the card's edge — everywhere, since a ticker
      // reaching past its box was never right on any board.
      <span className="font-mono text-[11px] text-ink-faint">
        listed · no quote ·{" "}
        <span className="text-ink-faint/70 [overflow-wrap:anywhere]">
          {k.event_ticker}
        </span>
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums text-ink-mid">
      <span className="text-ink-hi">ask {k.ask_c}¢</span>
      <span>bid {k.bid_c == null ? "—" : `${k.bid_c}¢`}</span>
      <span>spread {k.spread_c == null ? "—" : `${k.spread_c}¢`}</span>
      <span>size {k.ask_size == null ? "—" : k.ask_size}</span>
      {k.flags.map((f) => (
        <span key={f}
          title={f === "WIDE"
            ? `spread wider than ${WIDE_SPREAD_C}c`
            : f === "THIN" ? `ask size under ${THIN_ASK_SIZE}` : undefined}
          className="rounded border border-warn/50 bg-warn/5 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-warn">
          {f}
        </span>
      ))}
    </span>
  );
}

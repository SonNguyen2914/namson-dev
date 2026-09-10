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
  BlendWeights, KalshiQuote, RowField, Shape, THIN_ASK_SIZE,
  WIDE_SPREAD_C, pctThisSeason, weightIsCurrent,
} from "../lib/pickerApi";
import { AXIS_ORDER, tierSet } from "../lib/fieldApi";

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
 *  `field.tier_gap` and `field.shape` when the block carries them, and
 *  the row's own backend values when it does not. Differencing two band
 *  sets here to colour a cell would be this surface deciding a verdict,
 *  and the whole board is built the other way round — it shows. */
function effectiveRead(read: ReadLike, field?: RowField | null): ReadLike {
  if (!field) return read;
  const text = (side: "fav" | "opp", k: typeof AXIS_ORDER[number]) => {
    /* NO FALLBACK NUMBER. An empty set is a club the payload placed in
       no band at all; printing its `tier` would invent exactly the
       placement the set exists to refuse. */
    const t = tierSet(field.axes[k][side]);
    return t ?? "no band";
  };
  const gap = (k: typeof AXIS_ORDER[number]) =>
    field.axes[k].tier_gap ?? read.tier_gaps[k];
  return {
    shape: field.shape ?? read.shape,
    tiers: {
      ovr: [text("fav", "ovr"), text("opp", "ovr")],
      atk: [text("fav", "atk"), text("opp", "atk")],
      def: [text("fav", "def"), text("opp", "def")],
    },
    tier_gaps: { ovr: gap("ovr"), atk: gap("atk"), def: gap("def") },
  };
}

/** THE DAGGER ON A CLUB THE PLACEABILITY FLOOR REFUSED, carrying the
 *  backend's own reason on hover.
 *
 *  "make sure to mark those 11 somehow for me to know their data were
 *  refused at first. Subtlely." — the operator, 2026-09-09. Same mark,
 *  same size and same hover sentence the field page uses, so one
 *  convention covers both surfaces. It rides the tier trio because that
 *  is where the band it qualifies is printed; the ranks panel therefore
 *  carries none, which is not an omission — a second copy of a mark
 *  eight pixels away says nothing the first did not. */
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
function FieldRanks({ field }: { field: RowField }) {
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

  const axes = AXIS_ORDER.map((k) => ({ k, a: field.axes[k] }));
  const label = "the field's ranks on each axis — "
    + axes.map(({ k, a }) => `${k} #${a.fav.rank} v #${a.opp.rank}`).join(", ")
    + `, of ${field.size}`;

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
        data-size={field.size}
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
             and is the price of the corner the operator asked for. */
          className="absolute right-0 top-[calc(100%+7px)] z-20 w-max max-w-full rounded-lg border border-line-strong bg-elev2 p-3 shadow-xl">
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
export function TierGaps({ read, dense = false, field }: {
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
  /** the card sits in a narrow dense-grid track (PickerColumn.DENSE_GRID)
   *  — the shape popover anchors to the tier block there rather than to
   *  its trigger, so it spans the card's content width and cannot reach
   *  past a narrow column's edge. Only reachable on a card with no
   *  field; a field-rated card draws no popover at all. */
  dense?: boolean;
}) {
  /* ONE READ, DERIVED ONCE, AND EVERY MARK BELOW ASKS IT. Without a
     field this IS `read`, by identity — see effectiveRead — so the four
     league columns and the finished tail render byte for byte what they
     rendered before. */
  const [open, setOpen] = useState(false);
  const r = effectiveRead(read, field);
  const dims = [
    ["overall", r.tier_gaps.ovr, r.tiers.ovr],
    ["attack", r.tier_gaps.atk, r.tiers.atk],
    ["defence", r.tier_gaps.def, r.tiers.def],
  ] as const;
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="inline-flex items-center gap-[3px]">
          {dims.map(([label, gap]) => (
            <TierCell key={label} label={label} gap={gap} />
          ))}
        </span>
        <ShapeChip read={r} />
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
          title={field
            ? "tier bands in this competition's own field, favourite v"
              + " opponent — every band the club's 95% interval touches,"
              + " so a set of two is a placement the evidence refuses to"
              + " narrow. A name in its own colour is a unit that does"
              + " not back the pick."
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
          {AXIS_ORDER.map((lbl) => {
            const gap = r.tier_gaps[lbl], pr = r.tiers[lbl];
            const side = field?.axes[lbl];
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
                  IT MATTERS MOST ON def AND atk. The field publishes 3
                  bands there against 5 on overall, because those axes
                  resolve ~2.4 distinguishable levels; the payload's own
                  note for def reads "every one of the 36 straddles a
                  cut, so the set is the read". Placed cleanly: 10 of 36
                  on ovr, 3 on atk, 2 on def. A bare number on def would
                  therefore assert, 34 times out of 36, exactly the
                  placement the set exists to refuse. Below-floor keeps
                  its own sentence; a straddle gets the plain one. */}
              <span className="whitespace-nowrap">
                {pr[0]}{side && (side.fav.below_floor || side.fav.straddles)
                  && <FloorMark note={side.fav.below_floor
                    ? side.fav.floor_note
                    : `the 95% interval touches bands ${side.fav.tier_set.join("·")} — ${side.fav.tier} is where the estimate falls, not a band the evidence will narrow to`} />}v{pr[1]}
                {side && (side.opp.below_floor || side.opp.straddles)
                  && <FloorMark note={side.opp.below_floor
                    ? side.opp.floor_note
                    : `the 95% interval touches bands ${side.opp.tier_set.join("·")} — ${side.opp.tier} is where the estimate falls, not a band the evidence will narrow to`} />}
              </span>
            </span>
            );
          })}
        </span>
        {/* THE ONE ADDITION — the field's ranks, per axis. Immediately
            after the trio it belongs to, inside its group, and only
            when there is a field to open: an `i` over a competition
            nobody has measured would be an empty promise. */}
        {field && <FieldRanks field={field} />}
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
            So the condition is the field, not the page. */}
        {!field && (<>
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
            {field
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

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
import {
  BlendWeights, KalshiQuote, Shape, TierPair, THIN_ASK_SIZE, WIDE_SPREAD_C,
  pctThisSeason, weightIsCurrent,
} from "../lib/pickerApi";

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

export const pair = (p: TierPair) => `T${p[0]} v T${p[1]}`;

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
  tiers: { ovr: TierPair; atk: TierPair; def: TierPair };
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
    return `Hollow — high on the table gap, but ${flat.join(" and ")}.`;
  }
  return `Split — the tier gap is ${strong.join(" and ")}; ${flat.join(" and ")}.`;
}

/** A signed tier gap, drawn so a zero cannot be mistaken for a small
 *  positive. Positive is the accent; LEVEL is amber and dashed; behind
 *  is the negative ink. */
export function GapChip({ label, gap, tiers }: {
  label: string; gap: number; tiers: TierPair;
}) {
  // ONE TRAFFIC LIGHT, PLATFORM-WIDE (operator call, 2026-09-01):
  // green = ahead, amber = level, red = behind. Gold stopped meaning
  // "good" the day it became the brand; a verdict and a brand sharing a
  // hue made both weaker.
  const tone =
    gap > 0 ? "border-up/40 bg-up/5 text-up"
    : gap === 0 ? "border-dashed border-warn/50 bg-warn/5 text-warn"
    : "border-neg/40 bg-neg/5 text-neg";
  return (
    <span data-testid="gap-chip" data-dim={label} data-gap={gap}
      className={`inline-flex min-w-[6.5rem] flex-col rounded-md border px-2 py-1 ${tone}`}>
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-[11px] tabular-nums">
        {pair(tiers)} <span className="font-semibold">{sign(gap)}</span>
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">
        {gapWord(gap)}
      </span>
    </span>
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
export function SeasonWeight({ w }: { w: BlendWeights }) {
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
          + " alone and reported at 100%" : "");
  return (
    <span data-testid="season-weight" data-w={w.min ?? ""} title={title}
      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
        current
          ? "border-accent/40 bg-accent/5 text-accent"
          : "border-warn/40 bg-warn/5 text-warn"}`}>
      {pctThisSeason(w.min)} this szn
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
  return (
    <p data-testid="reg-time-note"
      className="mt-2 rounded-md border border-skylive/30 bg-skylive/5 px-2.5 py-2 text-[11px] leading-relaxed text-skylive">
      {note}
    </p>
  );
}

export function ShapeChip({ shape }: { shape: Shape }) {
  // the same traffic light as the gap chips: a CLEAN shape is three
  // greens by definition, so its chip is green; HOLLOW is the red read
  const tone =
    shape === "CLEAN" ? "border-up/50 bg-up/10 text-up"
    : shape === "HOLLOW" ? "border-neg/50 bg-neg/10 text-neg"
    : "border-warn/50 bg-warn/10 text-warn";
  return (
    <span className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}>
      {shape}
    </span>
  );
}

/** The three tier gaps and the shape, with the sentence beside them. */
export function TierGaps({ read }: { read: ReadLike }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <GapChip label="overall" gap={read.tier_gaps.ovr} tiers={read.tiers.ovr} />
        <GapChip label="attack" gap={read.tier_gaps.atk} tiers={read.tiers.atk} />
        <GapChip label="defence" gap={read.tier_gaps.def} tiers={read.tiers.def} />
        <ShapeChip shape={read.shape} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-low">
        {shapeRead(read)}
      </p>
    </>
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
      <span className="font-mono text-[11px] text-ink-faint">
        listed · no quote ·{" "}
        <span className="text-ink-faint/70">{k.event_ticker}</span>
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

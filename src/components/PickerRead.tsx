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
import { useState } from "react";
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
export function SeasonWeight({ w, alt }: {
  w: BlendWeights;
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

/** The Stage-2 read, compact (2026-09-01): three cells + the shape
 *  word + the exact tier pairs on one line, with the plain-English
 *  sentence and the per-dimension detail one click away. Everything the
 *  old three-chip block said is still said — the sentence in the
 *  popover is the same shapeRead(), word for word — it just stops
 *  costing 70px on every card. Shared by the board card and the
 *  finished tail, so both surfaces converge together. */
export function TierGaps({ read }: { read: ReadLike }) {
  const [open, setOpen] = useState(false);
  const dims = [
    ["overall", read.tier_gaps.ovr, read.tiers.ovr],
    ["attack", read.tier_gaps.atk, read.tiers.atk],
    ["defence", read.tier_gaps.def, read.tiers.def],
  ] as const;
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="inline-flex items-center gap-[3px]">
          {dims.map(([label, gap]) => (
            <TierCell key={label} label={label} gap={gap} />
          ))}
        </span>
        <ShapeChip read={read} />
        <span
          className="inline-flex items-end gap-2.5 font-mono text-[10px] tabular-nums text-ink-low"
          title="tier pairs, favourite v opponent — a name in its own colour is a unit that does not back the pick">
          {/* A dissenting dimension's NAME lights in its own verdict tone.
              Same dissents() predicate the chip's cut uses, so the lit
              label always names what the shot severed and the two can
              never disagree. Weight carries it a second way, so the read
              survives for anyone the hues fail.
              NOTE data-tier, NOT data-dim: picker-blend-cup.spec.ts locates
              '[data-dim="overall"]' UNQUALIFIED by tier-cell, so a second
              data-dim on a wrapper would resolve to two elements and fail
              Playwright's strict mode. */}
          {([["ovr", read.tier_gaps.ovr, read.tiers.ovr],
             ["atk", read.tier_gaps.atk, read.tiers.atk],
             ["def", read.tier_gaps.def, read.tiers.def]] as const)
            .map(([lbl, gap, pr]) => (
            <span key={lbl} data-tier={lbl} data-dissent={dissents(gap)}
              className="inline-flex flex-col items-center gap-[2px] leading-none">
              <span className={`text-[7.5px] uppercase tracking-[0.12em] ${
                gap > 0 ? "text-ink-faint"
                  : gap === 0 ? "font-semibold text-warn"
                    : "font-semibold text-neg"}`}>
                {lbl}
              </span>
              <span>{pr[0]}v{pr[1]}</span>
            </span>
          ))}
        </span>
        <button data-testid="tier-read" aria-expanded={open}
          aria-label="how to read this shape"
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation(); setOpen((o) => !o);
          }}
          className={`ml-auto inline-flex h-[15px] w-[15px] items-center justify-center rounded-full border font-mono text-[9px] transition-colors ${
            open ? "border-accent/60 text-accent"
              : "border-line-strong text-ink-low hover:border-accent/40 hover:text-accent"}`}>
          i
        </button>
      </div>
      {open && (
        <div data-testid="shape-read"
          className="absolute right-0 top-6 z-10 w-64 rounded-lg border border-line-strong bg-elev2 p-3 text-[11px] leading-relaxed text-ink-mid shadow-xl">
          <p>{shapeRead(read)}</p>
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
          <p className="mt-2 border-t border-line pt-2 text-[10px] text-ink-low">
            Tiers are within-league quintiles; annotation, never a veto.
          </p>
        </div>
      )}
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

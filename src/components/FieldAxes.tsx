// THE COMPETITION'S FIELD ON THREE AXES, drawn as intervals rather than
// as labels.
//
// WHY BARS AND NOT A TIER COLUMN ALONE. Every rating here carries a 95%
// interval, and on two of the three axes almost every club's interval
// crosses a tier cut. A bare "ATK 2" would state a placement the
// evidence does not support — the same failure the operator objected to
// on the board, where `OVR 1v1` asserted that Barcelona and Feyenoord
// were level. So the bar IS the claim and the tier set beside it names
// every band the bar touches. A reader can see the overlap instead of
// being told a number.
//
// THE ELEVEN BELOW THE FLOOR ARE DRAWN WITH EVERYONE ELSE, on his
// instruction ("just get their elo ... to compute their rank and tier"),
// marked with a dagger and a hairline and nothing louder ("mark those 11
// somehow ... Subtlely"). Their bars are simply wider, which is the
// honest form of the refusal: the row says the evidence did not place
// this club, and says it in the same units as every other row.
//
// HOW MANY BANDS IS A DECLARATION, NOT A FINDING (2026-09-10). All
// three axes are cut into five on the operator's instruction, and on
// attack and defence that is finer than the measurement licenses. The
// count and the licence are therefore drawn as two labelled figures
// rather than as one line of small type — see `BandCount`, which is
// where that whole argument lives.
//
// NOTHING HERE IS A RECOMMENDATION. The ordering says where to look.

import { useState } from "react";
import { AXIS_ORDER, Axis, Ratings } from "../lib/fieldApi";

/* THE SHAPE OF A FIELD IS NOT THIS COMPONENT'S PROPERTY. It moved to
   lib/fieldApi.ts on 2026-09-09, when a board card began reading the
   same payload: two surfaces sharing one shape must not have one of them
   importing it from the other's renderer. Re-exported so every existing
   importer keeps working unchanged. */
export type { Axis, AxisRow, Ratings } from "../lib/fieldApi";

const ORDER: readonly string[] = AXIS_ORDER;

const LEAGUE_LABEL: Record<string, string> = {
  epl: "Premier League", "la-liga": "La Liga", bundesliga: "Bundesliga",
  "serie-a": "Serie A", "ligue-1": "Ligue 1", eredivisie: "Eredivisie",
  "primeira-liga": "Primeira Liga", "super-lig": "Süper Lig",
  eliteserien: "Eliteserien", "czech-liga": "Czech Liga",
  "ukrainian-premier-league": "Ukrainian Premier",
  "slovak-super-liga": "Slovak Super Liga",
  "azerbaijan-premyer-liqa": "Azerbaijan Premyer",
};
const lg = (s: string | null) => (s ? LEAGUE_LABEL[s] || s : "no league");

/** The rate column's heading — a per-game figure on the goal axes and
 *  nothing on Elo, which has no per-game reading. Saying "—" there is
 *  the point: an Elo is not a rate and must not be printed as one. */
const RATE_LABEL: Record<string, string> = {
  atk: "scores/g", def: "concedes/g", ovr: "",
};

/** THE DECLARATION AND THE LICENCE, DRAWN AS THE TWO DIFFERENT THINGS
 *  THEY ARE.
 *
 *  WHAT THIS REPLACED, AND WHY IT HAD TO GO. The line here used to read
 *  `{bands} bands · {distinguishable_levels} distinguishable levels` —
 *  one run of small type with a middot between two numbers, which puts
 *  the measurement forward as though it were the reason for the count.
 *  After the recut that sentence is not merely thin, it is false in the
 *  reader's head: it renders as "5 bands · 2.41 distinguishable", and
 *  attack is cut into five because the operator said so with the
 *  measurement in front of him, while the measurement licenses three.
 *  `band_count_note` exists on the payload precisely to refuse that
 *  reading, and a page drawing the two numbers adjacent and unlabelled
 *  would go on making it directly above the note denying it.
 *
 *  SO THEY ARE LABELLED AND KEPT APART: what was DECLARED, what the
 *  measurement LICENSES, and — where the first is finer than the second
 *  — the backend's own paragraph saying the gap is a decision. That note
 *  is PRINTED, never paraphrased and never softened. The operator chose
 *  this with the measurement in view; a shorter, gentler version written
 *  here would be a component editorialising a decision it did not make,
 *  and a component that trimmed the words would be deciding how much of
 *  his reasoning the reader gets.
 *
 *  DIFFERING IS NOT OVERREACHING, and the two must not draw alike. `ovr`
 *  declares five against a licence of SEVEN: the numbers differ, and
 *  nothing on that axis may hint the cut outran its evidence. Only
 *  `declared_above_licence` tints the licence warn and only the
 *  backend's note appears — both of which are false on `ovr`, so the
 *  axis that is finer than its evidence and the axis that is coarser
 *  than its evidence are told apart at a glance.
 *
 *  A PAYLOAD FROM BEFORE THE RECUT ASSERTS NOTHING. With no declaration
 *  keys there is no licence figure, no note, no flag on the DOM and not
 *  even the word "declared": the count is drawn as the plain count it
 *  was, because labelling a derivation "the operator's number" would be
 *  inventing a decision nobody took. Missing is never false. */
function BandCount({ a }: { a: Axis }) {
  /* `bands` and `bands_declared` are the SAME number wherever both are
     served; the fallback is for the older payload, where the count was
     real but was not a declaration — hence `isDeclaration` gating the
     word rather than the presence of a number gating it. */
  const declared = a.bands_declared ?? a.bands;
  const licensed = a.bands_licensed_by_the_measurement;
  const isDeclaration = a.band_count_is_declared_not_derived === true;
  const above = a.declared_above_licence;
  const note = a.band_count_note;

  const CAP = "font-mono text-[8.5px] uppercase tracking-[0.14em] "
    + "text-ink-faint";
  const NUM = "mt-1 font-mono text-[15px] leading-none tabular-nums";
  const SUB = "mt-1.5 font-mono text-[9.5px] leading-relaxed text-ink-faint";
  /* THE SPACE BETWEEN A NUMBER AND ITS UNIT IS A CHARACTER, NOT A
     MARGIN. `ml-1` alone separates them on screen and nowhere
     else — innerText, a copy-paste and a screen reader all read
     "5bands" — so every use below writes a real space and this
     class only sets the size. */
  const UNIT = "text-[10px] text-ink-low";

  return (
    <div data-testid="band-count"
      /* THE FLAG REACHES THE DOM ONLY IF THE PAYLOAD CARRIED IT. An
         `undefined` renders no attribute at all, so a guard reading
         this can never be handed "false" by a payload that never said
         so — absent stays absent, and absent is not agreement. */
      data-declared-above-licence={
        above === undefined ? undefined : above ? "true" : "false"}
      className="mb-3.5">
      <div className="flex flex-wrap items-start gap-x-7 gap-y-3">
        <div data-testid="band-declared" data-bands={declared}>
          <p className={CAP}>{isDeclaration ? "declared" : "bands"}</p>
          <p className={`${NUM} text-ink-hi`}>
            {declared}{" "}<span className={UNIT}>bands</span>
          </p>
          {isDeclaration && (
            <p className={SUB}>the operator&rsquo;s number, not a derivation</p>
          )}
        </div>

        {/* THE MEASUREMENT, WHEREVER IT IS. On a payload that carries a
            licence the levels belong under it, because the licence is
            what those levels buy; on one that does not, they stand
            alone rather than vanishing — dropping a figure the page
            used to show would be its own quiet edit. */}
        {licensed === undefined ? (
          <div data-testid="band-levels">
            <p className={CAP}>distinguishable levels</p>
            <p className={`${NUM} text-ink-mid`}>
              {a.distinguishable_levels.toFixed(2)}
            </p>
          </div>
        ) : (
          <div data-testid="band-licence" data-bands-licensed={licensed}
            className={`border-l pl-3.5 ${
              above ? "border-warn/45" : "border-line-strong"}`}>
            <p className={CAP}>licensed by the measurement</p>
            <p className={`${NUM} ${above ? "text-warn" : "text-ink-hi"}`}>
              {licensed}{" "}<span className={UNIT}>bands</span>
            </p>
            <p className={SUB}>
              {a.distinguishable_levels.toFixed(2)} distinguishable levels
            </p>
          </div>
        )}

        <div className="border-l border-line-strong pl-3.5">
          <p className={CAP}>straddle a cut</p>
          <p className={`${NUM} text-warn`}>
            {a.straddling}{" "}
            <span className={UNIT}>of {a.rows.length}</span>
          </p>
        </div>
      </div>

      {/* THE BACKEND'S WORDS, WHOLE. Rendered only when it sent them,
          which is exactly when the declaration is above the licence. */}
      {note && (
        <p data-testid="band-count-note"
          className="mt-3.5 max-w-3xl border-l-2 border-warn/50 bg-warn/5 py-2 pl-3.5 pr-3 text-[12px] leading-relaxed text-ink-mid">
          {note}
        </p>
      )}
    </div>
  );
}

function AxisTable({ a }: { a: Axis }) {
  // pad the track so an interval reaching the extreme still draws inside
  const [lo0, hi0] = a.span;
  const pad = (hi0 - lo0) * 0.08;
  const LO = Math.min(lo0 - pad, ...a.rows.map((r) => r.interval[0]));
  const HI = Math.max(hi0 + pad, ...a.rows.map((r) => r.interval[1]));
  const pc = (v: number) => ((v - LO) / (HI - LO)) * 100;
  const dec = a.unit === "elo" ? 0 : 2;

  return (
    <div data-testid="axis-table" data-axis={a.axis}>
      <BandCount a={a} />
      <p className="mb-4 max-w-2xl text-[12.5px] leading-relaxed text-ink-low">
        {a.why_this_many_bands}
      </p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[620px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-elev2">
              {["#", "club", "", a.unit === "elo" ? "elo" : "log-goals",
                RATE_LABEL[a.axis], "tier"].map((h, i) => (
                <th key={i}
                  className="border-b border-line px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[0.12em] font-medium text-ink-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.club} data-testid="axis-row" data-club={r.club}
                data-below-floor={r.below_floor ? "true" : "false"}
                data-straddles={r.straddles ? "true" : "false"}
                className="border-b border-line last:border-b-0">
                <td className="px-3 py-1.5 font-mono text-[11px] tabular-nums text-ink-faint">
                  {r.rank}
                </td>
                <td className={`px-3 py-1.5 ${r.below_floor ? "shadow-[inset_2px_0_0_-1px_var(--warn)]" : ""}`}>
                  <span className={`block text-[13.5px] font-semibold tracking-tight ${r.below_floor ? "text-ink-mid" : "text-ink-hi"}`}>
                    {r.club}
                    {r.below_floor && (
                      <sup data-testid="floor-mark" title={r.floor_note || ""}
                        className="ml-1 cursor-help text-[9px] font-normal text-ink-faint">
                        †
                      </sup>
                    )}
                  </span>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                    {lg(r.league)}
                  </span>
                </td>
                <td className="w-[40%] min-w-[200px] py-1.5 pr-4">
                  {/* the track: cuts behind, the interval over them */}
                  <div className="relative h-[15px]"
                    aria-label={`${r.club}: ${r.value.toFixed(dec)}, 95% interval ${r.interval[0].toFixed(dec)} to ${r.interval[1].toFixed(dec)}`}>
                    <span className="absolute inset-x-0 top-[7px] h-px bg-line" />
                    {a.cuts.map((c) => (
                      <span key={c} aria-hidden
                        className="absolute inset-y-0 w-px bg-line-strong opacity-60"
                        style={{ left: `${pc(c)}%` }} />
                    ))}
                    <span aria-hidden
                      className={`absolute top-[5px] h-[5px] rounded-full ${r.straddles ? "bg-warn/45" : "bg-accent/50"}`}
                      style={{
                        left: `${pc(r.interval[0])}%`,
                        width: `${Math.max(pc(r.interval[1]) - pc(r.interval[0]), 0.6)}%`,
                      }} />
                    <span aria-hidden
                      className="absolute top-[2px] h-[11px] w-[2px] rounded-sm bg-ink-hi"
                      style={{ left: `${pc(r.value)}%` }} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[12px] tabular-nums text-ink-mid">
                  {r.value.toFixed(dec)}
                  <em className="ml-1 not-italic text-[10px] text-ink-faint">
                    ±{r.half_width_95.toFixed(dec)}
                  </em>
                </td>
                <td className="px-3 py-1.5 font-mono text-[12px] tabular-nums text-accent">
                  {r.rate === null ? "—" : r.rate.toFixed(2)}
                </td>
                <td className="px-3 py-1.5">
                  {r.tier_set.map((t) => (
                    <i key={t}
                      className={`mr-0.5 inline-block min-w-[17px] rounded-sm border px-0 text-center font-mono text-[10.5px] not-italic ${
                        t === r.tier_set[0]
                          ? "border-accent/45 text-accent"
                          : "border-line-strong text-ink-low"}`}>
                      {t}
                    </i>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p data-testid="floor-footnote"
        className="mt-2.5 font-mono text-[10.5px] leading-relaxed text-ink-faint">
        <span className="text-ink-low">†</span> refused by the placeability
        floor on the first reading — the rating stands, the band was too wide
        to place.
      </p>
    </div>
  );
}

export default function FieldAxes(
  { data, error }: { data: Ratings | null; error?: string | null },
) {
  const [tab, setTab] = useState("ovr");

  // A FAILED READ IS NAMED, NEVER DRAWN AS AN ABSENT FIELD. Three states
  // and they are three different facts: the request failed; the request
  // succeeded and no field has been measured; the request has not
  // answered yet. Only the last renders nothing, because "not yet" is
  // the one state a blank space actually describes.
  if (error) {
    return (
      <section data-testid="field-axes-error"
        className="mt-8 rounded-2xl border border-live/30 bg-live/5 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-live">
          the field could not be read
        </p>
        <p className="mt-2 max-w-2xl font-mono text-[12px] leading-relaxed text-live">
          {error}
        </p>
        <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-ink-low">
          This says the request failed, not that this competition has no
          cross-league rating. Nothing below is missing; it was not fetched.
        </p>
      </section>
    );
  }
  if (!data) return null;

  // NOT MEASURED IS NOT EMPTY. A competition nobody has measured says so;
  // it does not render a table with no rows, which would read as "this
  // field has no clubs in it".
  if (!data.axes) {
    return (
      <section data-testid="field-axes-absent"
        className="mt-8 rounded-2xl border border-line bg-elev p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          no cross-league field
        </p>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-low">
          {data.why_not}
        </p>
      </section>
    );
  }

  const axes = ORDER.filter((k) => data.axes![k]).map((k) => data.axes![k]);
  const active = data.axes[tab] || axes[0];

  return (
    <section data-testid="field-axes" className="mt-10">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium text-ink-hi">The field, ranked</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          {active.rows.length} clubs · 95% intervals · tier is a set
        </p>
      </div>
      <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-ink-low">
        {data.axes_disagree_note}
      </p>

      <div role="tablist" aria-label="rating axis"
        className="mb-4 flex flex-wrap gap-1.5">
        {axes.map((a) => (
          <button key={a.axis} type="button" role="tab"
            data-testid="axis-tab" data-axis={a.axis}
            aria-selected={a.axis === active.axis}
            onClick={() => setTab(a.axis)}
            className={`rounded-sm border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              a.axis === active.axis
                ? "border-accent/40 bg-bs text-accent"
                : "border-line-strong text-ink-low hover:border-ink-faint hover:text-ink-mid"}`}>
            {a.label}
          </button>
        ))}
      </div>

      <AxisTable a={active} />

      <p className="mt-4 max-w-3xl border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
        The ordering says where to look. A bar crossing a cut is a club the
        evidence does not place in one band — read the bar before the rank.
      </p>
    </section>
  );
}

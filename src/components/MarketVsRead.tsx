// The Kalshi price stacked above our read, and what the pair supports.
//
// ONE component, used by the friendlies detail page and all six viewer
// competitions. The three league match pages in this repo are the standing
// argument against copying it: hand-copied per league, they drifted apart
// on fee arithmetic and only one is correct.
//
// WHY THE TWO NUMBERS CAN BE SUBTRACTED HERE, when the match page refuses
// to: the backend converts the three-way book into the SAME quantity as
// the read — expected points share, draws counted as half, vig removed —
// so the difference has a referent. Raw price minus points share does not.
//
// The colour says WHICH WAY the two differ. It does NOT say one is a good
// bet: our read beats a coin flip only narrowly, the market's own accuracy
// here is unmeasured, and priors favour the exchange with money on it. The
// label under the bar says exactly that, in the UI, not just in a comment.
type Pick = {
  has_pick?: boolean; side?: string; confidence?: string;
  agreement?: string; reasoning?: string; not_advice?: string;
  reason?: string; means?: string; our_side?: string;
  market_side?: string; draw_probability?: number | null;
  draw_note?: string;
  disagreement?: number; what_would_change_this?: string;
};
type Leg = { club?: string; label?: string; p?: number | null };
export type MarketVsReadData = {
  market_three_way?: { home?: Leg; tie?: Leg; away?: Leg };
  market_share_by_side?: { home?: number; away?: number; means?: string };
  read_is_two_way?: { has_draw?: boolean; why?: string;
                      comparable_on?: string };
  available?: boolean;
  our_points_share?: number; our_basis?: string;
  market_points_share?: number; market_vig?: number;
  market_legs?: Record<string, number>;
  disagreement?: number; direction?: string;
  market_unavailable_reason?: string;
  note?: string; pick?: Pick;
};

const pct = (v?: number) => (v == null ? "—" : `${(v * 100).toFixed(0)}%`);

/** Green when our read sits above the market, red below, grey inside the
 *  measured agreement band. */
function tone(d?: string) {
  if (d === "read_higher_on_home") return "text-emerald-400";
  if (d === "read_lower_on_home") return "text-rose-400";
  return "text-ink-faint";
}

/** The most DISTINCTIVE word of a club name, so the three legs fit on one
 *  row without collapsing onto a shared prefix. */
function shortClub(name?: string) {
  if (!name) return "";
  const drop = new Set(["fc", "cf", "afc", "sc", "ac", "as", "ss", "ssc",
    "club", "cd", "sd", "ca", "fk", "sk", "bk", "if", "ks", "de", "the"]);
  const words = name.split(/[\s.]+/).filter((w) => w
    && !drop.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  return (words.sort((a, b) => b.length - a.length)[0] || name)
    .slice(0, 8).toUpperCase();
}

/** The compact form for a fixture row.
 *
 *  Kalshi gets all THREE legs, each with its side named — that is real
 *  data the exchange publishes. Our read gets two, because two is all it
 *  has: both ratings providers publish an expected points share with the
 *  draw already folded in at half weight, and neither publishes a usable
 *  1X2 split. The two lines are therefore NOT the same quantity, and the
 *  only number compared across them is the points share on the last line.
 */
const CELL = "text-right tabular-nums";

/** One row of the aligned grid. Declared at module scope: defined inside
 *  the render it would be a new component type on every paint, resetting
 *  its state each time. */
function GridRow({ label, home, tie, away, cls = "text-ink-low", delta }: {
  label: string; home?: number | null; tie?: number | null;
  away?: number | null; cls?: string; delta?: number | null;
}) {
  return (
    <>
      <span className="pr-1.5 text-left text-ink-faint">{label}</span>
      <span className={`${CELL} ${cls}`}>{pct(home ?? undefined)}</span>
      <span className={`${CELL} ${tie == null ? "text-ink-faint" : cls}`}>
        {tie == null ? "\u00b7" : pct(tie)}
      </span>
      <span className={`${CELL} ${cls}`}>{pct(away ?? undefined)}</span>
      <span className={`${CELL} pl-1 ${cls}`}>
        {delta == null ? "" : `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(0)}`}
      </span>
    </>
  );
}

export function MarketVsReadInline({ d }: { d?: MarketVsReadData | null }) {
  if (!d?.available) return null;
  const tw = d.market_three_way;
  const ms = d.market_share_by_side;
  if (!tw) return null;

  // Aligned by team, one column each, draw in the middle. The two rows
  // that may be SUBTRACTED are adjacent and both labelled "share"; the
  // win legs sit above them and are a different quantity.
  //
  // The rows are deliberately not interchangeable. Kalshi's 57% is
  // Elche's chance of winning; our 61% is a points share with the draw
  // already counted as half. Stacking those two directly would invite
  // reading a -4 that does not exist — the real difference is 69 vs 61.
  return (
    <span className="ml-2 grid shrink-0 grid-cols-[auto_3.1rem_3.1rem_3.1rem_1.7rem] font-mono text-[10px] leading-[1.35]"
      title={d.note}>
      <span />
      <span className="text-right text-accent">{shortClub(tw.home?.club)}</span>
      <span className="text-right text-ink-faint">TIE</span>
      <span className="text-right text-sky-400">{shortClub(tw.away?.club)}</span>
      <span />
      <GridRow label="win" home={tw.home?.p} tie={tw.tie?.p} away={tw.away?.p} />
      <GridRow label="share" home={ms?.home} away={ms?.away} />
      <GridRow label="read" home={d.our_points_share}
        away={d.our_points_share == null ? null : 1 - d.our_points_share}
        cls={tone(d.direction)} delta={d.disagreement} />
    </span>
  );
}

/** The full block for a detail page: both numbers, then the pick. */
export default function MarketVsRead({ d }: { d?: MarketVsReadData | null }) {
  if (!d) return null;
  const p = d.pick;

  if (!d.available) {
    return (
      <section className="mt-8 rounded-2xl border border-line bg-elev p-5">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          market beside the read
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-low">
          {p?.reason || d.market_unavailable_reason
            || "not enough to compare"}
        </p>
        {p?.means && (
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
            {p.means}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-elev p-5">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        market beside the read · home side, expected points share
      </h3>

      {/* Every leg the exchange prices, as ONE bar — same visual language
          as the strength read's bar directly above it, so the difference
          between two segments and three is the thing that stands out. The
          draw gets its own segment rather than being split across the two
          sides, because on this exchange a draw is its own contract. */}
      {d.market_three_way && (() => {
        const tw = d.market_three_way!;
        const seg = [
          { ...tw.home, cls: "bg-accent/70" },
          { ...tw.tie, cls: "bg-ink-faint/50" },
          { ...tw.away, cls: "bg-sky-400/60" },
        ];
        return (
          <div className="mt-4">
            <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-wide">
              <span className="truncate text-accent">{tw.home?.club}</span>
              <span className="px-2 text-ink-faint">draw</span>
              <span className="truncate text-sky-400">{tw.away?.club}</span>
            </div>
            <div className="mt-1.5 flex h-2 overflow-hidden rounded-full border border-line">
              {seg.map((x, i) => (
                <div key={i} className={x.cls}
                  style={{ width: `${(x.p ?? 0) * 100}%` }} />
              ))}
            </div>
            <div className="mt-1 flex items-baseline justify-between font-mono text-[11px]">
              <span className="text-accent">{pct(tw.home?.p ?? undefined)}</span>
              <span className="text-ink-faint">
                {pct(tw.tie?.p ?? undefined)}
              </span>
              <span className="text-sky-400">{pct(tw.away?.p ?? undefined)}</span>
            </div>
          </div>
        );
      })()}
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
        three segments, vig removed — win, draw, win. The read&apos;s bar
        above has only two, and that is not an omission:{" "}
        {d.read_is_two_way?.why}
      </p>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            kalshi
          </span>
          <span className="font-mono text-2xl text-ink-hi">
            {pct(d.market_points_share)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            our read{d.our_basis === "calibrated" ? " · calibrated" : ""}
          </span>
          <span className={`font-mono text-2xl ${tone(d.direction)}`}>
            {pct(d.our_points_share)}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            difference
          </span>
          <span className={`font-mono text-sm ${tone(d.direction)}`}>
            {d.disagreement != null && d.disagreement > 0 ? "+" : ""}
            {d.disagreement != null
              ? (d.disagreement * 100).toFixed(1) : "—"} pts
          </span>
        </div>
      </div>

      {/* The caveat sits WITH the number, not in a collapsed panel. A
          coloured gap with the explanation hidden reads as a tip. */}
      <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-faint">
        {d.note}
      </p>

      <div className="mt-5 rounded-xl border border-line px-4 py-3">
        <h4 className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          {p?.has_pick ? `pick · ${p.side}` : "no pick"}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-ink-mid">
          {p?.reasoning}
        </p>
        {p?.has_pick && p.draw_note && (
          <p className="mt-2 rounded-lg border border-line px-3 py-2 font-mono text-[10px] leading-relaxed text-ink-low">
            {p.draw_note}
          </p>
        )}
        {p?.has_pick && (
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
            confidence {p.confidence} · {p.agreement} — {p.not_advice}
          </p>
        )}
        {!p?.has_pick && p?.what_would_change_this && (
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
            what would change this: {p.what_would_change_this}
          </p>
        )}
      </div>

      {d.market_legs && (
        <details className="mt-4">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            the book, vig removed
          </summary>
          <div className="mt-2 space-y-1">
            {Object.entries(d.market_legs).map(([k, v]) => (
              <div key={k}
                className="flex justify-between font-mono text-[11px] text-ink-low">
                <span className="truncate pr-3">{k}</span>
                <span>{pct(v)}</span>
              </div>
            ))}
            <p className="pt-1 font-mono text-[10px] text-ink-faint">
              vig {((d.market_vig ?? 0) * 100).toFixed(1)}pts, removed
              proportionally — an assumption about how the exchange spreads
              it, not a measurement
            </p>
          </div>
        </details>
      )}
    </section>
  );
}

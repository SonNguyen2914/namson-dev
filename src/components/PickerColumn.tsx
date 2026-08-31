// One league's column on the picker board, and the match card it stacks.
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
import Link from "next/link";
import { useState } from "react";
import { fmtDate } from "../lib/matchday";
import {
  BoardRefusal, BoardRow, LeagueMeta, TierPair,
  THIN_ASK_SIZE, WIDE_SPREAD_C, leagueLabel,
} from "../lib/pickerApi";
import {
  ColumnSort, DEFAULT_SORT, SORT_MODES, isDefaultSort, loadColumnSort,
  modeById, saveColumnSort, sortRows,
} from "../lib/pickerSort";
import { Eyebrow } from "./ui";

// A signed integer gap. ZERO RENDERS AS "+0", deliberately: a bare "0"
// beside "+3" and "−1" reads as an absence of data rather than as a
// measured level, and level is the finding that matters most here.
const sign = (n: number) => (n < 0 ? `−${Math.abs(n)}` : `+${n}`);
// Same rule as `sign`: ZERO RENDERS SIGNED. This is the number the board
// is ORDERED by, and a bare "0.00" beside "+1.63" reads as missing data
// on the one row that exists to prove the picker never cuts.
const dec = (n: number, places = 2) =>
  (n < 0 ? "−" : "+") + Math.abs(n).toFixed(places);
const pair = (p: TierPair) => `T${p[0]} v T${p[1]}`;

/** The word for a signed tier gap, from the favourite's side. A gap of
 *  zero is LEVEL, not "small" — the distinction is the whole point of
 *  the hollow read. */
const gapWord = (v: number) => (v > 0 ? "ahead" : v === 0 ? "level" : "behind");

/** One sentence a human can read without the legend. */
function shapeRead(r: BoardRow): string {
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
function GapChip({ label, gap, tiers }: {
  label: string; gap: number; tiers: TierPair;
}) {
  const tone =
    gap > 0 ? "border-accent/40 bg-accent/5 text-accent"
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

function ShapeChip({ shape }: { shape: BoardRow["shape"] }) {
  const tone =
    shape === "CLEAN" ? "border-accent/50 bg-accent/10 text-accent"
    : shape === "HOLLOW" ? "border-neg/50 bg-neg/10 text-neg"
    : "border-warn/50 bg-warn/10 text-warn";
  return (
    <span className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}>
      {shape}
    </span>
  );
}

/** The favourite's Kalshi quote — annotation only. A row with no event,
 *  or an event with no live quote, STAYS on the board and says which of
 *  the two it is: "no kalshi event" and "listed · no quote" are different
 *  facts, and collapsing them into one blank hides a mapping failure. */
function KalshiCell({ row }: { row: BoardRow }) {
  const k = row.kalshi;
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

/** One match card. `rank` is the row's position under the column's
 *  CURRENT sort — the badge follows the reader's chosen order, it does
 *  not fossilise the default one. */
function RowCard({ row, rank }: { row: BoardRow; rank: number }) {
  const favHome = row.fav_side === "home";
  return (
    <article
      data-testid="picker-row"
      data-shape={row.shape}
      data-league={row.league}
      data-event={row.event_id}
      className="rounded-xl border border-line bg-elev/40 p-4 transition-colors hover:border-line-strong"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span data-testid="row-rank"
          className="font-mono text-[11px] tabular-nums text-ink-faint">
          {String(rank).padStart(2, "0")}
        </span>
        {row.src === "prior" && (
          <span
            title="rated on last season's final table — this season has too few games played"
            className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
            prior szn
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-faint">
          {fmtDate(row.kickoff, "short")}
        </span>
      </div>

      {/* The fixture line is the way IN. A board of ranked matches you
          cannot open is a list of names — every dashboard already links
          this same id space. Wraps only the matchup, so the Stage-1/2
          numbers below stay plain text. */}
      <Link
        href={`/bet-suggester/${row.league}/${row.event_id}`}
        aria-label={`open ${row.favourite} versus ${row.opponent}`}
        className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs">
        <span className="text-lg font-medium text-ink-hi">{row.favourite}</span>
        <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low"
          title={favHome ? "the favourite is at home" : "the favourite is away"}>
          {favHome ? "H" : "A"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          fav · rank {row.ranks.fav}
        </span>
        <span className="px-1 text-ink-faint">vs</span>
        <span className="text-base text-ink-mid">{row.opponent}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          rank {row.ranks.opp}
        </span>
        <span aria-hidden className="text-ink-faint transition-transform">→</span>
      </Link>

      {/* Stage 1 — the ranking inputs, favourite-signed */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[11px] tabular-nums">
        <span className="text-ink-low">
          GD/g gap{" "}
          <span className="text-base font-semibold text-ink-hi">
            {dec(row.gdg_gap)}
          </span>
        </span>
        <span className="text-ink-low">
          ppg gap <span className="text-ink-hi">{dec(row.ppg_gap)}</span>
        </span>
        <span className="text-ink-low">
          rank gap <span className="text-ink-hi">{sign(row.rank_gap)}</span>
        </span>
        <span className="text-ink-faint">
          gp {row.gp_current.home ?? "—"}/{row.gp_current.away ?? "—"}
        </span>
      </div>

      {/* Stage 2 — the three tier gaps, each drawn on its own */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <GapChip label="overall" gap={row.tier_gaps.ovr} tiers={row.tiers.ovr} />
        <GapChip label="attack" gap={row.tier_gaps.atk} tiers={row.tiers.atk} />
        <GapChip label="defence" gap={row.tier_gaps.def} tiers={row.tiers.def} />
        <ShapeChip shape={row.shape} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-low">
        {shapeRead(row)}
      </p>

      <div className="mt-3 border-t border-line pt-3">
        <KalshiCell row={row} />
      </div>
    </article>
  );
}

function RefusalRow({ r }: { r: BoardRefusal }) {
  return (
    <li data-testid="picker-refusal"
      className="rounded-lg border border-line bg-elev/30 px-3 py-2.5">
      <p className="text-sm text-ink-hi">
        {r.home} <span className="text-ink-faint">vs</span> {r.away}
      </p>
      <p className="mt-1 font-mono text-[11px] text-warn">
        {r.club} — {r.reason}
      </p>
    </li>
  );
}

export function LeagueColumn({ slug, meta, rows, refusals, days }: {
  slug: string;
  /** absent when the payload never mentioned this league at all */
  meta?: LeagueMeta;
  rows: BoardRow[];
  refusals: BoardRefusal[];
  days: number;
}) {
  // Lazy init is safe here: columns only mount client-side (the board
  // renders after its fetch resolves), so the stored choice is read once
  // on the client and never during SSR. loadColumnSort itself absorbs a
  // missing or throwing localStorage and answers the default.
  const [sort, setSort] = useState<ColumnSort>(() => loadColumnSort(slug));
  const mode = modeById(sort.mode) ?? modeById(DEFAULT_SORT.mode)!;
  const sorted = sortRows(rows, sort);

  const apply = (next: ColumnSort) => {
    setSort(next);
    saveColumnSort(slug, next);
  };

  return (
    <section data-testid="league-col" data-league={slug}
      id={`picker-col-${slug}`}
      aria-label={`${leagueLabel(slug)} column`}
      className="min-w-0 scroll-mt-16">
      <header className="border-b border-line pb-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="text-base font-medium text-ink-hi">
            {leagueLabel(slug)}
          </h3>
          {meta?.src === "prior" && (
            <span
              title={`rated on last season's final table — min ${meta.min_current_gp ?? "?"} GP this season`}
              className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
              prior szn
            </span>
          )}
          {meta?.src === "current" && (
            <span
              title="rated on this season's table — every club has enough games played"
              className="rounded border border-accent/40 bg-accent/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
              this szn · min {meta.min_current_gp ?? "—"} GP
            </span>
          )}
          <span data-testid="col-count"
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-ink-faint">
            {rows.length} fixture{rows.length === 1 ? "" : "s"}
          </span>
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
        {meta?.kalshi_error && (
          <p data-testid="col-kalshi-error"
            className="mt-2 font-mono text-[11px] leading-relaxed text-warn">
            kalshi unavailable — {meta.kalshi_error}. Prices are annotation
            here, so every fixture below is still ranked and listed.
          </p>
        )}

        {/* The sort control — this column's alone. The choice is kept per
            league in localStorage as a convenience; a browser without
            storage still sorts, it just forgets on reload. */}
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide">
          <label htmlFor={`col-sort-${slug}`} className="text-ink-faint">
            sort
          </label>
          <select id={`col-sort-${slug}`} data-testid="col-sort"
            value={sort.mode}
            onChange={(e) => {
              const m = modeById(e.target.value) ?? modeById(DEFAULT_SORT.mode)!;
              // a fresh mode opens in ITS default direction — carrying the
              // previous mode's flip across keys reads as random order
              apply({ mode: m.id, dir: m.defaultDir });
            }}
            className="min-w-0 flex-1 rounded-md border border-line bg-bs px-1.5 py-1 uppercase text-ink-mid outline-none transition-colors hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent">
            {SORT_MODES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <button data-testid="col-dir" data-dir={sort.dir}
            onClick={() => apply({ ...sort, dir: sort.dir === "asc" ? "desc" : "asc" })}
            aria-label={`sort direction ${sort.dir === "asc" ? "ascending" : "descending"} — press to flip`}
            className="shrink-0 rounded-md border border-line px-2 py-1 text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
            {sort.dir === "asc" ? "↑ asc" : "↓ desc"}
          </button>
          {!isDefaultSort(sort) && (
            <button data-testid="col-reset"
              onClick={() => apply(DEFAULT_SORT)}
              title="back to the board's default order — |GD/g gap| descending"
              className="shrink-0 rounded-md border border-line px-2 py-1 text-ink-faint transition-colors hover:border-line-strong hover:text-ink-mid">
              reset
            </button>
          )}
        </div>
        {mode.nullNote && (
          <p data-testid="col-null-note"
            className="mt-1.5 font-mono text-[10px] tracking-wide text-ink-faint">
            {mode.nullNote}
          </p>
        )}
      </header>

      {sorted.length > 0 ? (
        <div className="mt-3 space-y-3">
          {sorted.map((r, i) => (
            <RowCard key={`${r.league}-${r.event_id}`} row={r} rank={i + 1} />
          ))}
        </div>
      ) : meta?.error ? null : (
        // an empty column SAYS SO — a failed league (above) is a different
        // fact and must not be dressed as a quiet weekend
        <div data-testid="col-empty" className="mt-3 rounded-xl border border-line p-4">
          <p className="text-sm text-ink-mid">
            No {leagueLabel(slug)} fixtures in the next {days} day{days === 1 ? "" : "s"}.
          </p>
        </div>
      )}

      {refusals.length > 0 && (
        <div data-testid="refusals"
          className="mt-4 rounded-xl border border-warn/25 bg-warn/5 p-3">
          <Eyebrow tone="warn">
            refused · {refusals.length} fixture{refusals.length === 1 ? "" : "s"}
          </Eyebrow>
          <ul className="mt-2 space-y-2">
            {refusals.map((r, i) => (
              <RefusalRow key={`${r.club}-${i}`} r={r} />
            ))}
          </ul>
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-low">
            A club with no row in the table in use — a promoted side, most
            often — cannot be ranked against one that has a row, and its
            lower-division numbers were measured as no help at all. The
            picker refuses it by name instead of imputing a number, and the
            fixture is listed here rather than quietly dropped.
          </p>
        </div>
      )}
    </section>
  );
}

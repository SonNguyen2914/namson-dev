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
import { useState } from "react";
import { TZ, fmtDate } from "../lib/matchday";
import {
  BoardRefusal, BoardRow, LeagueMeta, leagueLabel,
} from "../lib/pickerApi";
import {
  ReviewLeagueMeta, ReviewRefusal, ReviewRow,
} from "../lib/pickerReview";
import {
  ColumnSort, DEFAULT_SORT, SORT_MODES, SortModeId, isDefaultSort,
  loadColumnSort, modeById, nullNoteFor, saveColumnSort, sortRows,
} from "../lib/pickerSort";
import {
  GapNote, KalshiCell, RegTimeNote, SeasonWeight, TierGaps, WITHHELD,
  dec, sign,
} from "./PickerRead";
import { ReviewTail } from "./ReviewCard";
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
function anchorFor(row: BoardRow, modeId: SortModeId): { v: string; k: string } {
  const id = modeId === "kickoff" ? "gdg" : modeId;
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

/** The fixture's DAY in the board's one fixed zone — the grouping key
 *  and the divider label for kickoff-sorted columns. */
function dayOf(iso: string): { key: string; label: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { key: "?", label: "date unknown" };
  const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
  const label = d.toLocaleDateString("en-US", {
    timeZone: TZ, weekday: "long", month: "short", day: "numeric" });
  return { key, label };
}

/** One match card. `rank` is the row's position under the column's
 *  CURRENT sort — the badge follows the reader's chosen order, it does
 *  not fossilise the default one. */
function RowCard({ row, rank, modeId, clubCount }: {
  row: BoardRow; rank: number; modeId: SortModeId; clubCount: number;
}) {
  const favHome = row.fav_side === "home";
  const w = row.weights;
  const cross = row.cross_league === true;
  const anchor = anchorFor(row, modeId);
  return (
    <article
      data-testid="picker-row"
      data-shape={row.shape}
      data-league={row.league}
      data-column={row.column ?? row.league}
      data-event={row.event_id}
      data-cross-league={cross ? "true" : "false"}
      className={`rounded-xl border p-4 transition-colors bg-gradient-to-b from-elev2/60 to-elev/40 ${
        rank === 1
          ? "border-accent/35 hover:border-accent/60"
          : "border-line hover:border-line-strong"}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span data-testid="row-rank"
          className={`font-mono text-[11px] tabular-nums ${
            rank === 1 ? "text-accent" : "text-ink-faint"}`}>
          {String(rank).padStart(2, "0")}
        </span>
        {/* THE WEIGHT, NOT A BADGE. The board blends both seasons per
            club, so "which season" is a percentage. The old binary badge
            is the FALLBACK for a row that carries no weight — a read
            reconstructed through the legacy switch — and never a second
            claim standing beside the number. */}
        {w ? <SeasonWeight w={w} /> : row.src === "prior" && (
          <span
            title="rated on last season's final table — this season has too few games played"
            className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
            prior szn
          </span>
        )}
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
        href={`/bet-suggester/${row.league}/${row.event_id}`}
        aria-label={`open ${row.favourite} versus ${row.opponent}`}
        className="mt-2.5 flex items-start gap-3 rounded-md outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs">
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden
              className="h-2 w-2 flex-none rounded-full [background:var(--lg)]" />
            <span
              className="truncate text-[15.5px] font-semibold text-ink-hi [font-family:var(--font-archivo)] [font-stretch:95%]"
              title={`${row.favourite} v ${row.opponent}`}>
              {row.favourite}
            </span>
            <span className="flex-none rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low"
              title={favHome ? "the favourite is at home" : "the favourite is away"}>
              {favHome ? "H" : "A"}
            </span>
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-2">
            <span aria-hidden
              className="h-[7px] w-[7px] flex-none rounded-full border border-ink-low bg-bs" />
            <span className="truncate text-[12.5px] text-ink-low [font-family:var(--font-archivo)] [font-stretch:96%]">
              <span className="text-ink-faint">vs </span>{row.opponent}
            </span>
          </span>
        </span>
        <span className="flex-none text-right">
          <span data-testid="row-anchor"
            className={`block font-mono text-[20px] font-semibold leading-none tabular-nums ${
              anchor.v === WITHHELD ? "font-normal text-ink-faint" : "text-ink-hi"}`}>
            {anchor.v}
          </span>
          <span className="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-low">
            {anchor.k}
          </span>
        </span>
      </Link>

      <RankDumbbell row={row} clubCount={clubCount} />

      {/* Stage 1 — the ranking inputs, favourite-signed. The metric the
          anchor already shows is not repeated down here; the ranks pair
          names what the dumbbell draws. */}
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10.5px] tabular-nums">
        <span className="text-ink-faint">
          #{row.ranks.fav} v #{row.ranks.opp}
        </span>
        {modeId !== "gdg" && modeId !== "kickoff" && (
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
        <TierGaps read={row} />
      </div>

      {/* A WITHHELD GAP SAYS WHY, on the card, in the backend's own
          words. The tiers above it are the part that survives a
          cross-league comparison, so the explanation belongs between
          them and the price. */}
      {row.gap_note && <GapNote note={row.gap_note} />}

      <div className="mt-3 border-t border-line pt-3">
        <KalshiCell quote={row.kalshi} />
        {/* WHAT THAT PRICE ACTUALLY SETTLES ON. Directly under the
            quote, because it is a fact about the quote: a Leagues Cup
            leg pays on 90 minutes, so "54¢" is not the price of going
            through. */}
        {row.reg_time_note && <RegTimeNote note={row.reg_time_note} />}
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

export function LeagueColumn({
  slug, meta, rows, refusals, days, review,
}: {
  slug: string;
  /** absent when the payload never mentioned this league at all */
  meta?: LeagueMeta;
  rows: BoardRow[];
  refusals: BoardRefusal[];
  days: number;
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
  // Lazy init is safe here: columns only mount client-side (the board
  // renders after its fetch resolves), so the stored choice is read once
  // on the client and never during SSR. loadColumnSort itself absorbs a
  // missing or throwing localStorage and answers the default.
  const [sort, setSort] = useState<ColumnSort>(() => loadColumnSort(slug));
  const mode = modeById(sort.mode) ?? modeById(DEFAULT_SORT.mode)!;
  const sorted = sortRows(rows, sort);
  const nullNote = nullNoteFor(mode, rows);

  const apply = (next: ColumnSort) => {
    setSort(next);
    saveColumnSort(slug, next);
  };

  return (
    <section data-testid="league-col" data-league={slug}
      id={`picker-col-${slug}`}
      aria-label={`${leagueLabel(slug)} column`}
      style={{ ["--lg" as string]: hueOf(slug) }}
      className="min-w-0 scroll-mt-16">
      <header className="border-b border-line pb-3">
        {/* the league's own light — a 2px rail, wayfinding only */}
        <div aria-hidden
          className="mb-2 h-[2px] rounded-full opacity-80 [background:var(--lg)]" />
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="text-base font-bold uppercase tracking-[0.03em] text-ink-hi [font-family:var(--font-archivo)] [font-stretch:106%]">
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
          {meta?.kind === "cup" && (
            <span data-testid="col-cup"
              title="a knockout tournament with no table of its own — every club is rated on its domestic league's table instead"
              className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
              cup · rated on{" "}
              {(meta.rated_on ?? []).map(leagueLabel).join(" + ")}
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
        {nullNote && (
          <p data-testid="col-null-note"
            className="mt-1.5 font-mono text-[10px] tracking-wide text-ink-faint">
            {nullNote}
          </p>
        )}
      </header>

      {sorted.length > 0 ? (
        <div className="mt-3 space-y-3">
          {/* DAY DIVIDERS, kickoff sort only (operator ask, 2026-09-01).
              Under kickoff the column is a schedule and the dividers are
              true; under any ranking sort it is a ladder, and slicing a
              ladder by date would misstate the order the page claims. */}
          {sorted.map((r, i) => {
            const divider = mode.id === "kickoff"
              && (i === 0
                || dayOf(r.kickoff).key !== dayOf(sorted[i - 1].kickoff).key);
            return (
              <div key={`${r.league}-${r.event_id}`} className="space-y-3">
                {divider && (
                  <div data-testid="day-divider"
                    className="flex items-center gap-2 pt-1 first:pt-0">
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low">
                      {dayOf(r.kickoff).label}
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-line" />
                  </div>
                )}
                <RowCard row={r} rank={i + 1}
                  modeId={mode.id} clubCount={meta?.clubs ?? 0} />
              </div>
            );
          })}
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

      {/* ── the finished tail ──────────────────────────────────────────
          Last in the column, after the upcoming fixtures AND after the
          refusals that belong to them, so this league's forward story is
          complete before the backward one starts. */}
      <ReviewTail slug={slug} back={review.back}
        rows={review.rows} refusals={review.refusals} meta={review.meta}
        loading={review.loading} error={review.error}
        storeNote={review.storeNote} />
    </section>
  );
}

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
import { dayLabel, fmtDate, localDay } from "../lib/matchday";
import {
  BoardRefusal, BoardRow, LeagueMeta, leagueLabel,
} from "../lib/pickerApi";
import {
  ReviewLeagueMeta, ReviewRefusal, ReviewRow,
} from "../lib/pickerReview";
import {
  ColumnSort, DEFAULT_SORT, SortModeId, modeById, sortRows,
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
  // a time is not a magnitude, and neither is a shape — the shape is
  // already on the card as its coloured chip, so both keys keep GD/g as
  // the anchor number
  const id = modeId === "kickoff" || modeId === "shape" ? "gdg" : modeId;
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
function FormStrip({ form, name }: { form?: string | null; name: string }) {
  if (!form) return null;
  return (
    <span data-testid="form-strip" aria-hidden
      title={`${name} — last ${form.length}, oldest→newest: ${form}`}
      className="ml-1.5 inline-flex flex-none items-center gap-[2px]">
      {form.split("").map((c, i) => (
        <i key={i} data-r={c}
          className={`h-[6px] w-[6px] rounded-[1.5px] ${
            c === "W" ? "bg-up/80"
            : c === "L" ? "bg-neg/70"
            : "bg-line-strong"}`} />
      ))}
    </span>
  );
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
            <FormStrip form={row.form?.fav} name={row.favourite} />
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-2">
            <span aria-hidden
              className="h-[7px] w-[7px] flex-none rounded-full border border-ink-low bg-bs" />
            <span className="truncate text-[12.5px] text-ink-low [font-family:var(--font-archivo)] [font-stretch:96%]">
              <span className="text-ink-faint">vs </span>{row.opponent}
            </span>
            <FormStrip form={row.form?.opp} name={row.opponent} />
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
  slug, meta, rows, refusals, days, dayKeys, sortFor, dayLabels, review,
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
   *  override. Sorting lives on the PAGE since the C ship (2026-09-01);
   *  this column just applies what it is handed, per band. */
  sortFor: (dayKey: string) => ColumnSort;
  /** matchday labels, for the rest-day ghosts' "next" line */
  dayLabels: Record<string, string>;
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
  // DAY-MAJOR (operator, 2026-09-01): the matchday is the board's
  // primary structure and each band's sort — the board default or that
  // day's override — ranks WITHIN the day. Rank badges restart per day,
  // so 01 always means "this day's best under its sort".
  const byDay = dayKeys.map((k) => {
    const sort = sortFor(k);
    return {
      key: k,
      sort,
      modeId: (modeById(sort.mode) ?? modeById(DEFAULT_SORT.mode)!).id,
      rows: sortRows(rows.filter((r) => localDay(r.kickoff) === k), sort),
    };
  });
  // the subgrid track plan, shared with the page: row 1 header, then
  // per day a label track + a content track, then refusals, then tail
  const trackCount = 2 * dayKeys.length + 3;

  return (
    <section data-testid="league-col" data-league={slug}
      id={`picker-col-${slug}`}
      aria-label={`${leagueLabel(slug)} column`}
      style={{ ["--lg" as string]: hueOf(slug),
        ["--tracks" as string]: String(trackCount) }}
      className="min-w-0 scroll-mt-16 xl:grid xl:content-start xl:[grid-template-rows:subgrid] xl:[grid-row:1/span_var(--tracks)]">
      <header className="self-start border-b border-line pb-3 xl:[grid-row:1]">
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

        {/* Sorting moved to the PAGE with the C ship (2026-09-01): one
            board default in the command bar, a per-day override on each
            matchday band. This column applies what it is handed. */}

      </header>

      {/* ── MATCHDAY BANDS. Each day owns a shared subgrid track, so a
          date's fixtures sit at the same height in every column — the
          alignment the operator asked for. The band's date is drawn
          once, full-width, by the page (xl); below xl each column keeps
          its own compact divider so a stacked layout still says the
          date. A day this league does not play leaves its track to the
          columns that do. */}
      {byDay.map(({ key, rows: dayRows, modeId }, di) => {
        if (dayRows.length === 0) {
          // A REST DAY IS SAID, NOT LEFT BLANK (draft C, shipped): the
          // empty track gets a quiet cell naming the league's next
          // fixture, so a hole reads as schedule, not absence of data.
          // Only when the league plays elsewhere in the window — a fully
          // empty column keeps its own louder empty-state below — and
          // only at xl, where the aligned matrix exists.
          if (rows.length === 0) return null;
          const next = byDay.slice(di + 1).find((d) => d.rows.length > 0);
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
        return (
          <div key={key}
            style={{ ["--r" as string]: String(3 + 2 * di) }}
            className="mt-3 space-y-3 xl:mt-0 xl:self-start xl:pb-4 xl:[grid-row:var(--r)]">
            <div data-testid="day-divider"
              className="flex items-center gap-2 xl:hidden">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low">
                {dayLabel(dayRows[0].kickoff)}
              </span>
              <span aria-hidden className="h-px flex-1 bg-line" />
            </div>
            {dayRows.map((r, i) => (
              <RowCard key={`${r.league}-${r.event_id}`} row={r} rank={i + 1}
                modeId={modeId} clubCount={meta?.clubs ?? 0} />
            ))}
          </div>
        );
      })}
      {rows.length === 0 && !meta?.error && (
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

      {refusals.length > 0 && (
        <div data-testid="refusals"
          style={{ ["--r" as string]: String(2 + 2 * dayKeys.length) }}
          className="mt-4 self-start rounded-xl border border-warn/25 bg-warn/5 p-3 xl:mt-4 xl:[grid-row:var(--r)]">
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

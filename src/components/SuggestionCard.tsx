// The per-fixture SUGGESTION CARD (card-v1, Phase B charter): one panel,
// every layer present or refusing BY NAME. Refusals are first-class
// content — their words render verbatim and a refused block is never
// hidden, because "books: []" once spent an hour meaning three different
// absences at once. Layout follows the charter order: the headline (the
// one number that orders action — the fee-inclusive edge, or REFUSED
// with its reason) first and dominant, then market, pick, FTTS, splits,
// precedents, style notes, in-play plan, and the evidence line.
//
// Decision safety (frontend invariant): everything here is shadow /
// observational. The λ number is display-only and carries its
// "unproven vs constant baseline" label verbatim; the style axes carry
// their measured-non-predictive label verbatim — that label is a
// measured finding, not decoration.
//
// The in-play section leads with LIVE NOW: while (and only while) the
// fixture is in play the backend attaches layers.inplay_plan.live_now,
// and the card broadcasts it — re-fetching itself on an interval so the
// minute, the score and the three probabilities on screen track the
// tape. Pre and post the key is absent and this file renders exactly
// what it rendered before the block existed.
//
// Beneath the match-state readout sits THE LADDER, in two halves.
//
// EXPOSURE (layers.inplay_plan.exposure) is public and renders for any
// in-play fixture: how exposed the lead ON THE PITCH is over grids-v1's
// next measured window, with its Wilson band and its n, and the "a lead
// never gets safer per minute, and there is no safe window" line
// verbatim beside it — on the refusals too. It is a property of the
// match, so a reader holding nothing still sees it.
//
// POSITION (the response's `positions` sibling, never inside `card`) is
// operator-only: what the holding is worth exiting into the bid, what
// it is worth held to settlement at the current read, and which way the
// two differ. Size and position value are staking, so the public card
// never carries them and this file renders nothing when the key is
// absent. Every figure is the backend's, net of the exact per-order
// fee, displayed unchanged — nothing here computes money.
//
// Neither half instructs. MORE and LESS are statements about two dollar
// figures and get no accent colour; the no-bid, thin-bid, stale-quote
// and red-card refusals render their own words.
//
// Beneath that bar sits live_now.state: the counts the collector SAW
// (possession, shots, on target, corners, cards, the favourite's share
// of the threat, an exploratory tilt label). Observation, not model
// output, and labelled so on screen. Every field of it is optional — a
// stat that is not on the payload renders "—", never 0, and no bar is
// drawn from a number that is missing. A live_now with no state renders
// exactly what it rendered before this readout existed.
import { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow, Reveal } from "./ui";

/* ---------- payload types (mirrors backend src/live/card.py) ---------- */

type Refusable<T> = T | { refused?: string; unavailable?: string };

type Headline = { value: number | string; reason?: string;
  meaning?: string; warning?: string; disagreement_tvd?: number;
  ledger_row?: number | string };

type Identity = { home?: string; away?: string; kickoff_utc?: string;
  venue?: string; venue_class?: string; status?: string;
  espn_event_id?: string };

// Every money figure below is an exact decimal STRING from the backend
// (src/live/execution_view.py). Nothing here parses one to do
// arithmetic on it — the backend owns the Decimal, this file owns the
// layout, and a float round-trip through JS is how a displayed cost
// stops matching the cost that was computed.
type ExecLeg = { price?: string; contracts?: string;
  gross_dollars?: string; fee_dollars?: string; all_in_dollars?: string;
  all_in_cents?: number; fee_cents?: number;
  fee_cents_per_contract?: string; break_even?: string;
  headline_rate?: string; effective_rate?: string;
  rounding_multiple?: string; refused?: string };

type ExecDiff = { direction?: string; dollars?: string; cents?: number;
  per_contract_dollars?: string; per_contract_cents?: string;
  of_which_fee_dollars?: string; of_which_spread_dollars?: string;
  says?: string; refused?: string };

type ExecOutcome = { clip_contracts?: string;
  book?: { ask?: string | null; bid?: string | null;
    spread_cents?: string | null };
  cross?: ExecLeg; rest?: ExecLeg; difference?: ExecDiff;
  refused?: string };

type ExecutionLayer = { clip_contracts?: number; clip_basis?: string;
  scope?: string; book_basis?: string; fill_risk?: string;
  not_an_edge?: string; break_even_basis?: string;
  effective_rate_basis?: string; rounding_granularity?: string;
  maker_rounding_reimbursement?: string; fee_helpers?: string;
  routes?: { cross?: string; rest?: string };
  outcomes?: Record<string, ExecOutcome> };

type MarketLayer = { source?: string; asks?: Record<string, number>;
  devig?: Record<string, number>;
  break_even_fee_inclusive?: Record<string, number>; fee_basis?: string;
  execution?: Refusable<ExecutionLayer> };

type Gate = { ask?: number; all_in_cost?: number;
  edge_fee_inclusive?: number; fee_floor?: number; verdict?: string;
  reason?: string; refused?: string };

type PickLayer = { model_outcomes?: Record<string, number>; run_id?: string;
  run_type?: string; canonical_t10_lock?: boolean; captured_at?: string;
  lead?: { outcome: string; p: number }; gate?: Gate };

type BaseRates = { n?: number; home_first_pct?: number;
  away_first_pct?: number; no_goal_pct?: number; label?: string };

type Lambda = { p_home_first_lambda?: number; basis?: string;
  label?: string; unavailable?: string };

type FttsLayer = { backtest?: string; band?: string; band_basis?: string;
  base_rates?: BaseRates; standing_pick?: string; lambda_ratio?: Lambda;
  refused?: string; unavailable?: string; overall_context?: BaseRates };

type SplitCond = { n?: number; w?: number; d?: number; l?: number;
  w_pct?: number; d_pct?: number; l_pct?: number; wdl?: string;
  wilson95_w?: [number, number]; wilson95_d?: [number, number];
  wilson95_l?: [number, number] };

type SplitSide = { team?: string; n_total?: number;
  conditions?: Record<string, SplitCond>;
  unrated?: { n?: number; note?: string };
  refused?: string; unavailable?: string; partial_n?: number };

type SplitsLayer = { source?: string; home?: SplitSide; away?: SplitSide;
  refused?: string; unavailable?: string };

type Example = { home?: string; away?: string; date?: string;
  score?: string; source?: string };

type Cell = { role?: string; grid?: string; variant?: string;
  source_cell?: string; n?: number; definition?: string;
  wdl?: Record<string, number>; wilson_low?: Record<string, number>;
  wilson_high?: Record<string, number>;
  equalized?: { p?: number; n?: number; wilson_low?: number;
    wilson_high?: number };
  overturned?: { p?: number; n?: number; wilson_low?: number;
    wilson_high?: number };
  examples?: Example[]; examples_note?: string;
  refused?: string; fallback?: Cell | null };

type PrecedentsLayer = { band?: string; band_basis?: string;
  cells?: Cell[]; refused?: string; unavailable?: string };

type StyleAxis = { league_mean?: number; n?: number; raw?: number;
  reason?: string | null; refused?: boolean; shrunk?: number };

type StyleSide = { team?: string; matches?: number;
  axes?: Record<string, StyleAxis>; refused?: string;
  unavailable?: string };

type StyleLayer = { label?: string; axes?: string[]; home?: StyleSide;
  away?: StyleSide; refused?: string; unavailable?: string };

type HazardPeak = { bin?: string; p?: number; n?: number;
  wilson_low?: number; wilson_high?: number; meaning?: string };

// Present ONLY while the fixture is in play (backend _live_now): the
// live triple read off the newest state-tape row, or that row's own
// refusal in its own words. Absent pre and post — never synthesized
// here, and never a zero bar standing in for a missing forecast.
type LiveTriple = { home?: number; draw?: number; away?: number };

// The OBSERVED state off the same tape row as the triple: what the
// collector saw, never what the engine believes. Every field is optional
// and every side may be null, so the readout renders what is there and
// says "—" for what is not — a missing count is NEVER drawn as 0. The
// two are different facts: "0 corners" is a measurement, "no corner
// count on this row" is an absence, and giving them one face is the
// same error as a zero bar standing in for a missing forecast.
type LivePair = { home?: number | null; away?: number | null };

type LiveState = {
  possession?: LivePair | null; shots?: LivePair | null;
  on_target?: LivePair | null; corners?: LivePair | null;
  cards?: { yellow?: LivePair | null; red?: LivePair | null } | null;
  // ALWAYS AN OBJECT from the backend (card.py `_live_state`):
  // `{tilt, fav, basis}` or `{refused}` — never a bare index. This file
  // typed it as a NUMBER until 2026-08-24 and asked `isNum` before
  // printing it, so the object never matched and every computed tilt
  // rendered "—": an em-dash sitting beside a confident SIEGE chip,
  // which reads as a broken card rather than as the number it is.
  //
  // Nothing accepts a bare number here, because nothing ever sent one —
  // `threat` has carried the object since the block shipped (backend
  // cfeb25a). That is what separates it from the `tilt_label` string
  // below, which stays accepted because older payloads really do have
  // it.
  //
  // Same disease as that string, caught the same way one incident
  // later: the canned e2e payload had been hand-written as `0.72`, so
  // the suite went green on a shape the backend does not emit and
  // proved only that the frontend agreed with itself. A recorded
  // payload has to be recorded.
  threat?: Threat | null;
  // An EXPLORATORY split of the state, not a measured pattern — it
  // renders with its note, never as a settled finding.
  //
  // ALWAYS AN OBJECT from the backend (card.py `_tilt`): `{label, note}`
  // or `{refused}` — never a bare string, and there is no `tilt_note`
  // sibling. This file typed it as a string until 2026-08-21 and
  // rendered it straight into JSX, so React threw #31 ("objects are not
  // valid as a React child") and the WHOLE CARD blanked to a
  // client-side exception on EVERY in-play fixture — `_tilt` has no
  // string-returning branch at all. The canned e2e payloads had been
  // hand-written in the string shape, so a green suite proved nothing
  // about the shape the backend actually sends. That is the lesson, not
  // the typo: a recorded payload has to be recorded.
  //
  // The bare string stays accepted below only so an older recorded
  // payload still renders. Nothing emits it.
  tilt_label?: TiltLabel | "SIEGE" | "STERILE_POSSESSION" | "CONTEST"
    | null;
  tilt_note?: string;
  // WHY these counts can be read as one minute of one match (backend
  // LIVE_STATE_BASIS), including the rule the dashes above depend on:
  // a null is the provider's silence, and missing is never zero. It is
  // rendered from the payload rather than restated in copy here, so
  // the two can never drift into saying different things.
  basis?: string };

type TiltLabel = { label?: "SIEGE" | "STERILE_POSSESSION" | "CONTEST";
  note?: string; refused?: string; unavailable?: string };

// The favourite's SHARE of shots + on-target + corners on this row, so
// the number belongs to a SIDE and `fav` is printed beside it — a bare
// 0.76 says nothing about whose 0.76 it is. `basis` is the pattern
// library's own definition, carried on the payload and rendered, never
// retyped here (backend THREAT_DEFINITION).
type Threat = { tilt?: number; fav?: "home" | "away"; basis?: string;
  refused?: string; unavailable?: string };

type LiveNow = { minute?: string | null; captured_at?: string | null;
  score?: string | null; p?: LiveTriple;
  lambdas?: { home?: number; away?: number } | null; basis?: string;
  state?: LiveState | null;
  refused?: string; unavailable?: string };

// THE DANGER READ, for anyone. Present on the PUBLIC card whenever the
// fixture is in play, because it is a property of the MATCH and not of
// a holding: a one-goal lead at 71' carries the hazard grids-v1
// measured whether or not the reader owns a contract on it. `next_15.p`
// is P(the lead is equalized inside the measured window) and `survives`
// is its complement with the band reflected. Neither renders as a
// verdict — the honesty line rides beside both and says why.
type ExposureCell = { p?: number; n?: number; wilson_low?: number;
  wilson_high?: number; source_cell?: string; definition?: string;
  refused?: string; fallback?: Cell | null; fallback_note?: string };

type Survives = { p?: number; wilson_low?: number; wilson_high?: number;
  units?: string; meaning?: string; refused?: string };

type CellWindow = { bin?: string; start_minute?: number;
  end_minute?: number; read_at_minute?: number;
  offset_from_cell_start?: number; note?: string };

type Exposure = {
  applies?: boolean; subject?: string; minute?: number; score?: string;
  lead_held_by?: string;
  next_15?: ExposureCell; survives?: Survives; cell_window?: CellWindow;
  to_full_time?: Cell & { cell_band?: string; opener_side?: string;
    band_basis?: string };
  band_note?: string; variant?: string; variant_basis?: string;
  honesty?: string; not_a_plan?: string;
  refused?: string; unavailable?: string };

type InplayLayer = {
  live_now?: LiveNow;
  exposure?: Refusable<Exposure>;
  danger_windows?: { equalizer_hazard_peak?: Refusable<HazardPeak>;
    late_opener?: Refusable<Cell> };
  red_card_rule?: string; cash_out_ladder?: string;
  refused?: string; unavailable?: string };

/* ---- the operator's own position (backend src/live/position.py) ----
 *
 * These keys ride BESIDE `card`, never inside it, and only on the
 * operator route: size and position value are staking, and the public
 * card takes no credential. This file renders them when a payload
 * carries them and renders nothing at all when it does not. It never
 * synthesizes a position and it never computes one of these numbers
 * itself — every figure below was made server-side, net of the exact
 * per-order fee, and is displayed as it arrived.
 */
type ExitArith = { contracts?: string; bid?: string;
  gross_dollars?: string; fee_dollars?: string; net_dollars?: string;
  cents?: number; fee_cents?: number;
  fee_cents_per_contract?: number; fee_helper?: string };

type HoldVsExit = { difference_cents?: number;
  difference_cents_per_contract?: number;
  direction?: "MORE" | "LESS" | "LEVEL"; says?: string;
  certainty_vs_mean?: string; not_a_recommendation?: string;
  refused?: string };

type JournalEntry = { bet_id?: number; market_ticker?: string;
  outcome_key?: string; stated_price_dollars?: string;
  stated_size?: string; price_basis?: string; recorded_at?: string;
  size_basis?: string; size_disagreement?: string;
  executions?: { rows?: number; filled_contracts?: string;
    contracts_sold_early?: string; open_contracts?: string;
    not_filled?: number; closed_early?: number; note?: string } };

type HeldPosition = {
  journal_entry?: JournalEntry;
  position?: { outcome_key?: string; side?: string; size?: string;
    entry_price?: number | null; entry_cost_dollars?: string | null;
    entry_note?: string };
  fair_now?: { p?: number | null; basis?: string; refused?: string;
    source?: string };
  value_now_cents?: number | null;
  value_at_settlement_cents?: number | null;
  hold_vs_exit?: HoldVsExit;
  // each of these is a FINDING when present, never a missing number
  no_bid?: { finding?: string; ask?: number | null;
    common_case?: string } | null;
  thin_bid?: { finding?: string; top_of_book_size?: string | null;
    position_size?: string; executable_now?: ExitArith;
    clip_fee_warning?: string; common_case?: string } | null;
  stale_quote?: { finding?: string; age_seconds?: number | null;
    ceiling_seconds?: number } | null;
  exposure?: Refusable<Exposure>;
  red_card_void?: { void?: boolean; witness?: string[] | null;
    tape_note?: string | null; rule?: string; survives?: string | null };
  arithmetic?: { exit?: ExitArith | null;
    settlement?: { cents?: number; fee_note?: string } | null;
    maker_exit?: string };
  policy?: Record<string, string>;
  refused?: string; unavailable?: string };

type PositionsBlock = { held?: HeldPosition[]; definition?: string;
  competition_scope?: string | null; book_basis?: string;
  tape_row?: string; refused?: string; unavailable?: string };

// How old the arithmetic is, on the SERVER's clock at assembly. It
// rides outside `card` because content_hash covers `card`, and a clock
// inside the hashed payload would make every re-render a new claim.
type LiveTick = { captured_at?: string | null;
  age_seconds?: number | null; interval_seconds?: number;
  basis?: string; note?: string };

type Artifact = { artifact?: string; version?: string; built?: string };

type EvidenceLayer = { artifacts?: Record<string, Artifact>;
  card_version?: string; content_hash_basis?: string;
  refused?: string; unavailable?: string };

type Card = { card_version?: string; competition?: string;
  fixture_id?: number; headline?: Headline;
  layers?: { identity?: Refusable<Identity>;
    market?: Refusable<MarketLayer>; pick?: Refusable<PickLayer>;
    ftts?: FttsLayer; splits?: SplitsLayer;
    precedents?: PrecedentsLayer; style_notes?: StyleLayer;
    inplay_plan?: InplayLayer; evidence?: EvidenceLayer } };

type CardResponse = { generated_at?: string; content_hash?: string;
  emission?: string; prediction_run_id?: string | null; card?: Card;
  live_tick?: LiveTick; positions?: PositionsBlock };

/* ---------- small helpers ---------- */

const signed4 = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(4)}`;
const pct1 = (v?: number) => (v == null ? "—" : `${v.toFixed(1)}%`);
const band = (lo?: number, hi?: number) =>
  lo == null || hi == null ? "" : `${lo.toFixed(1)}–${hi.toFixed(1)}`;
const cents = (v?: number) =>
  v == null || !Number.isFinite(v) ? "—" : `${Math.round(v * 100)}¢`;
// the position payload speaks in CENTS already — never re-scale it, and
// never fill a null with a zero: a value that could not be computed is
// a refusal with its own words somewhere on the block.
const usd = (c?: number | null) =>
  c == null || !Number.isFinite(c) ? "—" : `$${(c / 100).toFixed(2)}`;

// A block with nothing to say says so in words. Returns the block's own
// refusal text when it carries one, else null (= render the content).
function refusalOf(b: unknown): string | null {
  if (b == null) return "absent from the card payload";
  if (typeof b === "string") return b;   // e.g. a bare refusal string
  if (typeof b !== "object") return null;
  const o = b as { refused?: unknown; unavailable?: unknown };
  if (typeof o.refused === "string") return o.refused;
  if (typeof o.unavailable === "string") return o.unavailable;
  return null;
}

function RefusalNote({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-line px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-low">
      {text}
    </p>
  );
}

function CardSection({ eyebrow, children }: {
  eyebrow: string; children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-4">
      <Eyebrow className="mb-2.5">{eyebrow}</Eyebrow>
      {children}
    </div>
  );
}

/* ---------- headline: the one number that orders action ---------- */

function HeadlineBlock({ h }: { h?: Headline }) {
  if (!h) return <RefusalNote text="headline absent from the card payload" />;
  if (h.value === "REFUSED" || typeof h.value !== "number") {
    return (
      <div>
        <p className="font-mono text-4xl tracking-tight text-warn">
          {String(h.value)}
        </p>
        {h.reason && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-mid">
            {h.reason}
          </p>
        )}
      </div>
    );
  }
  // A WARNED number is never painted as an opportunity. The rail exists
  // because a large model-market disagreement measured WORSE, not
  // better (ledger row 8) — so the accent colour, which the eye reads
  // as "take this", is withheld and the warning outranks the meaning.
  const warned = typeof h.warning === "string" && h.warning.length > 0;
  return (
    <div>
      <p className={`font-mono text-4xl tabular-nums tracking-tight ${
        warned ? "text-warn" : h.value >= 0 ? "text-accent" : "text-ink-hi"}`}>
        {signed4(h.value)}
      </p>
      {warned && (
        <p
          data-testid="headline-warning"
          className="mt-2 max-w-xl rounded-lg border border-warn/40 px-3 py-2 font-mono text-[11px] leading-relaxed text-warn"
        >
          {h.warning}
          {h.disagreement_tvd != null && (
            <span className="ml-1 text-ink-low">
              (model−market {h.disagreement_tvd.toFixed(3)}
              {h.ledger_row != null && `, ledger row ${h.ledger_row}`})
            </span>
          )}
        </p>
      )}
      {h.meaning && (
        <p className="mt-2 max-w-xl font-mono text-[11px] leading-relaxed text-ink-low">
          {h.meaning}
        </p>
      )}
    </div>
  );
}

/* ---------- market: asks + de-vig + fee-inclusive break-evens ---------- */

const SIDES = ["home", "draw", "away"] as const;

function MarketBlock({ m }: { m?: Refusable<MarketLayer> }) {
  const r = refusalOf(m);
  if (r) return <RefusalNote text={r} />;
  const mk = m as MarketLayer;
  return (
    <div>
      <table className="w-full text-left font-mono text-[11px] tabular-nums">
        <thead>
          <tr className="text-[10px] uppercase text-ink-faint">
            <th className="py-1 pr-2 font-normal">outcome</th>
            <th className="py-1 pr-2 font-normal">ask</th>
            <th className="py-1 pr-2 font-normal">de-vig</th>
            <th className="py-1 font-normal">break-even (fee-incl)</th>
          </tr>
        </thead>
        <tbody>
          {SIDES.map((k) => (
            <tr key={k} className="border-t border-line/60">
              <td className="py-1 pr-2 uppercase text-ink-low">{k}</td>
              <td className="py-1 pr-2 text-ink-hi">{cents(mk.asks?.[k])}</td>
              <td className="py-1 pr-2 text-ink-mid">
                {mk.devig?.[k] != null ? pct1(mk.devig[k] * 100) : "—"}
              </td>
              <td className="py-1 text-ink-hi">
                {mk.break_even_fee_inclusive?.[k] != null
                  ? pct1(mk.break_even_fee_inclusive[k] * 100) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {mk.fee_basis && (
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-ink-faint">
          {mk.fee_basis}
        </p>
      )}
      <ExecutionBlock x={mk.execution} />
      {mk.source && (
        <p className="mt-1 font-mono text-[9px] text-ink-faint">{mk.source}</p>
      )}
    </div>
  );
}

/* ---------- what entering costs, by each of the two routes ---------- */

// WHY THIS IS ON THE CARD. The market block has always quoted a
// fee-inclusive break-even and never said what entering costs — on
// series where a maker pays a QUARTER of a taker's fee and where the
// one execution quantity this project measured and did NOT kill is
// that resting beat crossing by $12-18/leg. Two costs per outcome, the
// difference, and the effective rate each route actually pays.
//
// IT IS NOT AN EDGE AND IT IS NOT ADVICE, and both sentences saying so
// come from the backend and render verbatim. The fill-risk line is
// styled as a warning and sits ABOVE the numbers, because a saving
// read without it is the wrong number: a resting order that does not
// fill is no position, not a cheaper one. Nothing here is coloured to
// read as a recommendation — CROSSING COSTS MORE is a comparison
// between two dollar figures, exactly as the position ladder's MORE
// and LESS are, and gets no accent.
//
// Every figure is the backend's exact decimal string, rendered
// unchanged. This file computes no money.

function money(s?: string) {
  return s == null ? "—" : `$${s}`;
}

// A route's cost, or its refusal in the backend's own words. The
// refusal is TESTABLE ON ITS OWN (`exec-<side>-<route>`) because the
// same sentence also reaches the difference note below, and a test
// that could not tell them apart passed while this cell rendered a
// dash — which is precisely the blank-instead-of-a-reason failure the
// whole card exists to prevent.
function ExecLegCell({ leg, label, side, note }: {
  leg?: ExecLeg; label: string; side: string; note?: string;
}) {
  if (!leg || leg.refused) {
    return (
      <div data-testid={`exec-${side}-${label}`}
        className="rounded-lg border border-dashed border-line px-2.5 py-2">
        <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
          {label}
        </p>
        <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-low">
          {leg?.refused ?? "not priced"}
        </p>
      </div>
    );
  }
  return (
    <div data-testid={`exec-${side}-${label}`}
      className="rounded-lg border border-line px-2.5 py-2" title={note}>
      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
        {label}
        {leg.price != null && (
          <span className="ml-1.5 normal-case tracking-normal">
            @ ${leg.price}
          </span>
        )}
      </p>
      <p className="font-mono text-base tabular-nums text-ink-hi">
        {money(leg.all_in_dollars)}
      </p>
      <p className="font-mono text-[9px] tabular-nums text-ink-faint">
        fee {money(leg.fee_dollars)} · rate {leg.effective_rate ?? "—"}
        {leg.rounding_multiple != null
          && leg.rounding_multiple !== "1.0000" && (
          <span className="text-warn"> ({leg.rounding_multiple}× headline)</span>
        )}
      </p>
      <p className="font-mono text-[9px] tabular-nums text-ink-faint">
        break-even {leg.break_even ?? "—"}
      </p>
    </div>
  );
}

function ExecutionOutcomeRow({ side, o, routes }: {
  side: string; o?: ExecOutcome;
  routes?: { cross?: string; rest?: string };
}) {
  const r = refusalOf(o);
  return (
    <div data-testid={`exec-${side}`} className="space-y-1.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        {side}
        {o?.book?.spread_cents != null && (
          <span className="ml-2 normal-case tracking-normal">
            spread {o.book.spread_cents}¢
          </span>
        )}
      </p>
      {r ? <RefusalNote text={r} /> : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <ExecLegCell leg={o?.cross} label="cross" side={side}
              note={routes?.cross} />
            <ExecLegCell leg={o?.rest} label="rest" side={side}
              note={routes?.rest} />
          </div>
          {/* the comparison. Two dollar figures — no accent colour is
              spent on making either read as an instruction.

              A refusal that already rendered in one of the two cells
              above is NOT repeated here: the backend sets the leg's
              reason and the comparison's to the same sentence (there
              is one reason — no bid, or a spread too wide), and
              printing sixty words twice in a row buries the thing it
              is trying to say. A comparison refused for its OWN
              reason still renders in full. */}
          {o?.difference?.refused ? (
            o.difference.refused !== o?.rest?.refused
              && o.difference.refused !== o?.cross?.refused
              ? <RefusalNote text={o.difference.refused} /> : null
          ) : o?.difference?.says && (
            <p data-testid={`exec-diff-${side}`}
              className="rounded-lg border border-line px-2.5 py-2 font-mono text-[10px] leading-relaxed text-ink-hi">
              <span className="mr-1.5 text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                {o.difference.direction ?? ""}
              </span>
              {money(o.difference.dollars)}
              <span className="ml-1.5 text-ink-mid">
                ({o.difference.per_contract_cents}¢/contract ·{" "}
                {money(o.difference.of_which_fee_dollars)} fee,{" "}
                {money(o.difference.of_which_spread_dollars)} spread)
              </span>
              <span className="mt-1 block text-ink-mid">
                {o.difference.says}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ExecutionBlock({ x }: { x?: Refusable<ExecutionLayer> }) {
  if (x == null) return null;          // a card that predates the block
  const r = refusalOf(x);
  if (r) {
    return (
      <div data-testid="execution-refused" className="mt-3">
        <Eyebrow className="mb-1.5">entry cost</Eyebrow>
        <RefusalNote text={r} />
      </div>
    );
  }
  const ex = x as ExecutionLayer;
  return (
    <div data-testid="execution" className="mt-3 space-y-2">
      <Eyebrow className="mb-1.5">
        entry cost
        {ex.clip_contracts != null && (
          <span className="ml-2 normal-case tracking-normal text-ink-mid">
            at {ex.clip_contracts} contracts
          </span>
        )}
      </Eyebrow>

      {/* THE LINE THAT MAY NEVER BE DROPPED, and it goes ABOVE the
          numbers rather than under them: a saving read without it is
          the wrong number. Styled as a warning, like the ladder's
          no-safe-window line, because it is the same kind of sentence. */}
      {ex.fill_risk && (
        <p data-testid="fill-risk"
          className="rounded-lg border border-warn/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-warn">
          {ex.fill_risk}
        </p>
      )}

      {SIDES.map((k) => (
        <ExecutionOutcomeRow key={k} side={k} o={ex.outcomes?.[k]}
          routes={ex.routes} />
      ))}

      {/* not an edge, and the clip it was all computed at */}
      {ex.not_an_edge && (
        <p data-testid="not-an-edge"
          className="font-mono text-[9px] leading-relaxed text-ink-low">
          {ex.not_an_edge}
        </p>
      )}
      {/* maker_rounding_reimbursement goes IMMEDIATELY after the
          rounding note it qualifies. The backend charges the round-up
          and the venue may refund part of it monthly, above a $10
          threshold a small clip can miss every month — a worst-case
          multiple rendered without that clause reads as a settled cost
          rather than a charge. Same rule as the fill-risk line: the
          qualifier does not get to drift away from its number. */}
      {[ex.scope, ex.clip_basis, ex.rounding_granularity,
        ex.maker_rounding_reimbursement,
        ex.effective_rate_basis, ex.break_even_basis, ex.book_basis,
        ex.fee_helpers].map((t) => t && (
        <p key={t.slice(0, 40)}
          className="font-mono text-[9px] leading-relaxed text-ink-faint">
          {t}
        </p>
      ))}
    </div>
  );
}

/* ---------- pick: model outcomes + the fee gate ---------- */

const OUTCOME_LABEL: Record<string, string> = {
  home_win: "home", draw: "draw", away_win: "away" };

function PickBlock({ p }: { p?: Refusable<PickLayer> }) {
  const r = refusalOf(p);
  if (r) return <RefusalNote text={r} />;
  const pk = p as PickLayer;
  const gate = pk.gate;
  const gateRefusal = gate ? refusalOf(gate) ?? (gate.verdict === "REFUSED"
    ? gate.reason ?? "REFUSED (no reason carried)" : null) : null;
  return (
    <div className="space-y-3">
      {pk.model_outcomes && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(pk.model_outcomes).map(([k, v]) => (
            <span key={k}
              className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] tabular-nums ${
                pk.lead?.outcome === k
                  ? "border-accent/40 bg-accent/5 text-ink-hi"
                  : "border-line text-ink-mid"}`}>
              {OUTCOME_LABEL[k] ?? k}{" "}
              <span className="text-ink-hi">{pct1(v * 100)}</span>
              {pk.lead?.outcome === k && (
                <span className="ml-1.5 text-[9px] uppercase tracking-wide text-accent">
                  lead
                </span>
              )}
            </span>
          ))}
        </div>
      )}
      {gate && !refusalOf(gate) && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] tabular-nums sm:grid-cols-4">
          <GateStat label="ask" value={cents(gate.ask)} />
          <GateStat label="all-in cost" value={cents(gate.all_in_cost)} />
          <GateStat label="edge (fee-incl)"
            value={gate.edge_fee_inclusive != null
              ? signed4(gate.edge_fee_inclusive) : "—"} />
          <GateStat label="fee floor"
            value={gate.fee_floor != null ? `+${gate.fee_floor}` : "—"} />
        </div>
      )}
      {gate?.verdict && (
        <p className="font-mono text-[11px]">
          <span className={`uppercase tracking-wide ${
            gate.verdict === "REFUSED" ? "text-warn" : "text-accent"}`}>
            {gate.verdict}
          </span>
          {gate.verdict !== "REFUSED" && (
            <span className="ml-2 text-[9px] uppercase tracking-[0.14em] text-ink-faint">
              shadow · not advice
            </span>
          )}
        </p>
      )}
      {gateRefusal && <RefusalNote text={gateRefusal} />}
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
        {pk.run_type ?? "run"} ·{" "}
        {pk.canonical_t10_lock ? "canonical t-10 lock" : "not the t-10 lock"}
        {pk.captured_at ? ` · captured ${pk.captured_at}` : ""}
        {pk.run_id ? ` · ${pk.run_id}` : ""}
      </p>
    </div>
  );
}

function GateStat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-[9px] uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <span className="text-ink-hi">{value}</span>
    </span>
  );
}

/* ---------- FTTS: base rates prominent, λ display-only ---------- */

function RatesRow({ b, pick }: { b: BaseRates; pick?: string }) {
  const cells: Array<[string, number | undefined]> = [
    ["home first", b.home_first_pct],
    ["away first", b.away_first_pct],
    ["no goal", b.no_goal_pct],
  ];
  // standing_pick arrives as home_first / away_first / no_goal
  const pickLabel = pick?.replace(/_/g, " ");
  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map(([label, v]) => {
        const isPick = pickLabel != null && label === pickLabel;
        return (
          <div key={label}
            className={`rounded-xl border p-3 text-center ${
              isPick ? "border-accent/40 bg-accent/5" : "border-line"}`}>
            <p className="font-mono text-xl tabular-nums text-ink-hi">
              {pct1(v)}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
              {label}{isPick ? " · standing pick" : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function FttsBlock({ f }: { f?: FttsLayer }) {
  if (!f) return <RefusalNote text="ftts absent from the card payload" />;
  const r = refusalOf(f);
  const lr = f.lambda_ratio;
  return (
    <div className="space-y-3">
      {r ? (
        <>
          <RefusalNote text={r} />
          {f.overall_context && (
            <div>
              <RatesRow b={f.overall_context} />
              {f.overall_context.label && (
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                  {f.overall_context.label} · n={f.overall_context.n}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        f.base_rates && (
          <div>
            <RatesRow b={f.base_rates} pick={f.standing_pick} />
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
              n={f.base_rates.n}
              {f.band ? ` · band ${f.band}` : ""}
            </p>
            {f.band_basis && (
              <p className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
                {f.band_basis}
              </p>
            )}
          </div>
        )
      )}
      {f.backtest && (
        <p className="font-mono text-[10px] leading-relaxed text-ink-low">
          {f.backtest}
        </p>
      )}
      {lr && (
        // deliberately de-emphasized: λ is display-only and carries its
        // unproven-vs-baseline label verbatim — nothing prices off it
        <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
          {lr.p_home_first_lambda != null
            ? `λ p(home first) ${lr.p_home_first_lambda.toFixed(4)}`
            : `λ ${lr.unavailable ?? "unavailable"}`}
          {lr.label ? ` — ${lr.label}` : ""}
        </p>
      )}
    </div>
  );
}

/* ---------- splits: both teams × four conditions ---------- */

const CONDITIONS = ["home", "away", "favourite", "underdog"] as const;

function SplitsSide({ s }: { s?: SplitSide }) {
  const r = refusalOf(s);
  return (
    <div className="min-w-0">
      <p className="mb-1.5 truncate font-mono text-[10px] uppercase tracking-wide text-ink-low">
        {s?.team ?? "—"}
        {s?.n_total != null && (
          <span className="ml-1.5 text-ink-faint">n={s.n_total}</span>
        )}
      </p>
      {r ? <RefusalNote text={r} /> : (
        <table className="w-full text-left font-mono text-[10px] tabular-nums">
          <thead>
            <tr className="text-[9px] uppercase text-ink-faint">
              <th className="py-0.5 pr-1 font-normal">as</th>
              <th className="py-0.5 pr-1 font-normal">n</th>
              <th className="py-0.5 pr-1 font-normal">w</th>
              <th className="py-0.5 pr-1 font-normal">d</th>
              <th className="py-0.5 font-normal">l</th>
            </tr>
          </thead>
          <tbody>
            {CONDITIONS.map((c) => {
              const row = s?.conditions?.[c];
              if (!row) {
                return (
                  <tr key={c} className="border-t border-line/60">
                    <td className="py-1 pr-1 uppercase text-ink-low">{c}</td>
                    <td colSpan={4} className="py-1 text-ink-faint">
                      no row in the artifact
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={c} className="border-t border-line/60 align-top">
                  <td className="py-1 pr-1 uppercase text-ink-low">{c}</td>
                  <td className="py-1 pr-1 text-ink-mid">{row.n}</td>
                  <SplitCell p={row.w_pct} b={row.wilson95_w} />
                  <SplitCell p={row.d_pct} b={row.wilson95_d} />
                  <SplitCell p={row.l_pct} b={row.wilson95_l} last />
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {s?.unrated && (s.unrated.n ?? 0) > 0 && (
        <p className="mt-1 font-mono text-[9px] text-ink-faint">
          unrated n={s.unrated.n} — {s.unrated.note}
        </p>
      )}
    </div>
  );
}

function SplitCell({ p, b, last }: {
  p?: number; b?: [number, number]; last?: boolean;
}) {
  return (
    <td className={`py-1 ${last ? "" : "pr-1"}`}>
      <span className="text-ink-hi">{pct1(p)}</span>
      {b && (
        <span className="block text-[8px] text-ink-faint">
          {band(b[0], b[1])}
        </span>
      )}
    </td>
  );
}

function SplitsBlock({ s }: { s?: SplitsLayer }) {
  const r = refusalOf(s);
  if (r) return <RefusalNote text={r} />;
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SplitsSide s={s?.home} />
        <SplitsSide s={s?.away} />
      </div>
      {s?.source && (
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-ink-faint">
          {s.source} · 95% Wilson bands beneath each percentage
        </p>
      )}
    </div>
  );
}

/* ---------- precedents: stats first, named examples smaller ---------- */

function CellStats({ c }: { c: Cell }) {
  const rows: Array<[string, number | undefined, string]> = [];
  if (c.equalized) {
    rows.push(["equalized", c.equalized.p,
      band(c.equalized.wilson_low, c.equalized.wilson_high)]);
  }
  if (c.overturned) {
    rows.push(["overturned at FT", c.overturned.p,
      band(c.overturned.wilson_low, c.overturned.wilson_high)]);
  }
  if (c.wdl) {
    for (const [k, v] of Object.entries(c.wdl)) {
      rows.push([k.replace(/_/g, " "), v,
        band(c.wilson_low?.[k], c.wilson_high?.[k])]);
    }
  }
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] tabular-nums">
      {rows.map(([label, v, w]) => (
        <span key={label}>
          <span className="text-ink-low">{label} </span>
          <span className="text-ink-hi">{pct1(v)}</span>
          {w && <span className="text-ink-faint"> [{w}]</span>}
        </span>
      ))}
    </div>
  );
}

function PrecedentCell({ c }: { c: Cell }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-low">
        {(c.role ?? "cell").replace(/_/g, " ")}
        {c.n != null && <span className="ml-2 text-ink-hi">n={c.n}</span>}
        {c.source_cell && (
          <span className="ml-2 normal-case tracking-normal text-ink-faint">
            {c.source_cell}
          </span>
        )}
      </p>
      {c.refused ? (
        <>
          <RefusalNote text={c.refused} />
          {c.fallback && (
            <div className="mt-2">
              <p className="mb-1 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                fallback cell
              </p>
              <CellStats c={c.fallback} />
            </div>
          )}
        </>
      ) : (
        <>
          <CellStats c={c} />
          {c.definition && (
            <p className="mt-1.5 font-mono text-[9px] leading-relaxed text-ink-faint">
              {c.definition}
            </p>
          )}
          {c.examples && c.examples.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {c.examples.map((e, i) => (
                <p key={i} className="font-mono text-[9px] text-ink-faint">
                  {e.home} {e.score} {e.away} · {e.date} · {e.source}
                </p>
              ))}
            </div>
          )}
          {c.examples_note && (
            <p className="mt-1.5 font-mono text-[9px] text-ink-faint">
              {c.examples_note}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function PrecedentsBlock({ p }: { p?: PrecedentsLayer }) {
  const r = refusalOf(p);
  if (r) return <RefusalNote text={r} />;
  return (
    <div className="space-y-2.5">
      {p?.band_basis && (
        <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
          band {p.band} · {p.band_basis}
        </p>
      )}
      {(p?.cells ?? []).map((c, i) => <PrecedentCell key={i} c={c} />)}
    </div>
  );
}

/* ---------- style notes: context, measured non-predictive ---------- */

function StyleSideTable({ s }: { s?: StyleSide }) {
  const r = refusalOf(s);
  return (
    <div className="min-w-0">
      <p className="mb-1.5 truncate font-mono text-[10px] uppercase tracking-wide text-ink-low">
        {s?.team ?? "—"}
        {s?.matches != null && (
          <span className="ml-1.5 text-ink-faint">matches={s.matches}</span>
        )}
      </p>
      {r ? <RefusalNote text={r} /> : (
        <table className="w-full text-left font-mono text-[10px] tabular-nums">
          <thead>
            <tr className="text-[9px] uppercase text-ink-faint">
              <th className="py-0.5 pr-1 font-normal">axis</th>
              <th className="py-0.5 pr-1 font-normal">shrunk</th>
              <th className="py-0.5 pr-1 font-normal">raw</th>
              <th className="py-0.5 pr-1 font-normal">n</th>
              <th className="py-0.5 font-normal">league</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(s?.axes ?? {}).map(([axis, a]) => (
              <tr key={axis} className="border-t border-line/60">
                <td className="py-1 pr-1 text-ink-low">
                  {axis.replace(/_/g, " ")}
                </td>
                {a.refused ? (
                  <td colSpan={4} className="py-1 text-ink-faint">
                    {a.reason ?? "refused (no reason carried)"}
                  </td>
                ) : (
                  <>
                    <td className="py-1 pr-1 text-ink-hi">
                      {a.shrunk?.toFixed(3) ?? "—"}
                    </td>
                    <td className="py-1 pr-1 text-ink-mid">
                      {a.raw?.toFixed(3) ?? "—"}
                    </td>
                    <td className="py-1 pr-1 text-ink-mid">{a.n ?? "—"}</td>
                    <td className="py-1 text-ink-faint">
                      {a.league_mean?.toFixed(3) ?? "—"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StyleBlock({ s }: { s?: StyleLayer }) {
  if (!s) {
    return <RefusalNote text="style_notes absent from the card payload" />;
  }
  const r = refusalOf(s);
  return (
    <div className="space-y-3">
      {/* the measured finding travels with the numbers, verbatim —
          non-predictive to date is a result, not decoration */}
      {s.label && (
        <p className="rounded-lg border border-warn/40 px-3 py-1.5 font-mono text-[10px] leading-relaxed text-warn">
          {s.label}
        </p>
      )}
      {r ? <RefusalNote text={r} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StyleSideTable s={s.home} />
          <StyleSideTable s={s.away} />
        </div>
      )}
    </div>
  );
}

/* ---------- live now: the in-play broadcast ---------- */

// The three outcomes wear the card's existing home/draw/away language —
// accent home, faint draw, sky away, one hairline bar with the exact
// percentages beneath it (the same segments MarketVsRead draws for a
// three-way price). No new palette; the only addition is the live red,
// which this system already reserves for in-play.
const LIVE_SIDES = [
  { key: "home" as const, bar: "bg-accent/70", ink: "text-accent",
    num: "text-accent" },
  // the draw's segment stays quiet, but its number is read at a glance
  // like the other two — this readout is the point of the block
  { key: "draw" as const, bar: "bg-ink-faint/50", ink: "text-ink-faint",
    num: "text-ink-mid" },
  { key: "away" as const, bar: "bg-sky-400/60", ink: "text-sky-400",
    num: "text-sky-400" },
];

const LIVE_MEANING =
  "computed from the frozen T-10 lock and the current minute and score:"
  + " the collector's engine anchors on the belief the T-10 lock froze"
  + " before kickoff and advances it to the state on the tape. The card"
  + " quotes the number that tick wrote — it never re-solves one here.";

/* ---------- live state: the counts the collector SAW ---------- */

// The readout under the bar is observation, not model output, and it is
// labelled as such on screen. Its one rule: an absent number renders
// "—". Nothing here fills a gap with 0, and no bar is drawn from a
// number that is not on the payload.
const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const hasKey = (o: object, k: string) =>
  Object.prototype.hasOwnProperty.call(o, k);

// a count prints as it arrived — 0 included, because 0 is a reading
const liveCount = (v?: number) => (v == null ? "—" : String(v));

// an index of unknown scale prints at its own precision rather than
// being dressed in a unit this card cannot vouch for
const liveIndex = (v?: number) =>
  v == null ? "—" : Number.isInteger(v) ? String(v) : v.toFixed(2);

const STAT_ROWS = [
  { key: "shots" as const, label: "shots", id: "shots" },
  { key: "on_target" as const, label: "on target", id: "on-target" },
  { key: "corners" as const, label: "corners", id: "corners" },
];

// home in the accent, away in the sky — the same two colours the
// probability bar directly above gives the same two teams
function StatPair({ label, pair, fmt = liveCount, swatch, id }: {
  label: string; pair?: LivePair | null; fmt?: (v?: number) => string;
  swatch?: string; id: string;
}) {
  const hv = pair?.home;
  const av = pair?.away;
  const h = isNum(hv) ? hv : undefined;
  const a = isNum(av) ? av : undefined;
  return (
    <div data-testid={`live-stat-${id}`}
      className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        {swatch && (
          <span className={`mr-1.5 inline-block h-2.5 w-1.5 rounded-[2px] align-middle ${swatch}`} />
        )}
        {label}
      </span>
      <span className="font-mono text-[11px] tabular-nums">
        <span className="text-accent">{fmt(h)}</span>
        <span className="mx-1.5 text-ink-faint">–</span>
        <span className="text-sky-400">{fmt(a)}</span>
      </span>
    </div>
  );
}

function LiveStateBlock({ st }: { st: LiveState }) {
  const cards = st.cards;
  const pos = st.possession;
  const ph = pos?.home;
  const pa = pos?.away;
  // The two shares are DERIVED from the same pair printed beside them,
  // so the bar and the numbers can never tell different stories
  // (AGENTS.md §3) — and it makes the block indifferent to whether the
  // tape counts possession 0-100 or 0-1. Half a split is not a split:
  // with one side missing there is no share to draw, and completing it
  // from 100 minus the other would be inventing the missing half.
  const total = isNum(ph) && isNum(pa) ? ph + pa : null;
  const share = total != null && total > 0 && isNum(ph) && isNum(pa)
    ? { home: (ph / total) * 100, away: (pa / total) * 100 }
    : null;
  // the threat arrives as `{tilt, fav, basis}` or `{refused}`; the
  // number, the side it is a share OF, and the definition are pulled
  // OUT of it, and the object itself never reaches JSX as a child
  const threat = st.threat;
  const threatRefusal = threat ? refusalOf(threat) : null;
  const threatTilt = threat && isNum(threat.tilt) ? threat.tilt : undefined;
  // the tilt arrives as `{label, note}` or `{refused}`; the label and
  // the note are pulled OUT of it, and neither the object nor a bare
  // string ever reaches JSX as a child
  const tilt = st.tilt_label;
  const tiltObj = tilt != null && typeof tilt === "object" ? tilt : null;
  const tiltRefusal = tiltObj ? refusalOf(tiltObj) : null;
  const tiltLabel = tiltObj
    ? tiltObj.label : (typeof tilt === "string" ? tilt : undefined);
  const tiltNote = tiltObj?.note ?? st.tilt_note;

  const rows = [
    hasKey(st, "possession"), ...STAT_ROWS.map((r) => hasKey(st, r.key)),
    cards != null, hasKey(st, "threat"),
    st.tilt_label != null, st.tilt_note != null,
  ];
  // nothing on the sub-block = nothing rendered; the live block stays
  // exactly what it was before this readout existed
  if (!rows.some(Boolean)) return null;

  return (
    <div data-testid="live-state"
      className="mt-3 space-y-1.5 border-t border-line pt-3">
      {/* the backend's own sentence about what these counts are and
          what a null among them means, reachable on the header rather
          than dropped — the payload carries it and the dashes below
          are only honest if it is readable somewhere */}
      <p title={st.basis}
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        match state · observed on the tape, not modelled
      </p>

      {hasKey(st, "possession") && (
        <div>
          {/* with both sides present the printed pair IS the bar's two
              shares. One side alone cannot form a share, so it prints
              as it arrived, read as the percentage possession always
              is — and the missing half stays a dash rather than being
              completed. */}
          <StatPair id="possession" label="possession"
            pair={share ?? pos}
            fmt={(v) => (v == null ? "—" : `${v.toFixed(1)}%`)} />
          {share && (
            <div data-testid="possession-bar"
              className="mt-1 flex h-1.5 overflow-hidden rounded-full border border-line">
              <div className="bg-accent/70"
                style={{ width: `${share.home}%` }} />
              <div className="bg-sky-400/60"
                style={{ width: `${share.away}%` }} />
            </div>
          )}
        </div>
      )}

      {STAT_ROWS.map((r) => hasKey(st, r.key) && (
        <StatPair key={r.key} id={r.id} label={r.label} pair={st[r.key]} />
      ))}

      {cards && hasKey(cards, "yellow") && (
        <StatPair id="yellow" label="yellow" pair={cards.yellow}
          swatch="bg-warn" />
      )}
      {cards && hasKey(cards, "red") && (
        <StatPair id="red" label="red" pair={cards.red}
          swatch="bg-live" />
      )}

      {hasKey(st, "threat") && (threatRefusal ? (
        <div data-testid="live-stat-threat">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            threat
          </span>
          <div className="mt-1"><RefusalNote text={threatRefusal} /></div>
        </div>
      ) : (
        <div data-testid="live-stat-threat" title={threat?.basis}
          className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            threat
          </span>
          <span className="font-mono text-[11px] tabular-nums text-ink-hi">
            {liveIndex(threatTilt)}
            {/* the tilt is a SHARE, so it belongs to a side. The side
                is printed WITH the number rather than left to the
                tooltip: an unattributed 0.76 beside a SIEGE chip is
                the same ambiguity as a result letter that does not
                come off the numbers next to it (AGENTS.md §3). */}
            {threatTilt != null && threat?.fav && (
              <span data-testid="threat-fav"
                className="ml-1.5 text-[9px] uppercase tracking-wide text-ink-faint">
                {threat.fav}
              </span>
            )}
          </span>
        </div>
      ))}

      {(st.tilt_label != null || st.tilt_note != null) && (
        <div data-testid="live-tilt" className="pt-0.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              tilt · exploratory
            </span>
            {/* the LABEL only — never the object that carries it. A raw
                object here is React #31 and a blank card. */}
            {tiltLabel && (
              <span data-testid="tilt-chip" title={tiltNote}
                className="rounded-md border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-mid">
                {tiltLabel}
              </span>
            )}
          </div>
          {/* a refused tilt renders the collector's own sentence, in the
              same note every other refused block uses — no chip, and no
              invented label standing in for one that was declined */}
          {tiltRefusal ? <div className="mt-1">
            <RefusalNote text={tiltRefusal} />
          </div> : (
            /* the note sits WITH the label, not only in a tooltip: a
               chip whose caveat is hidden reads as a settled split, and
               this one is not measured */
            <p className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
              {tiltNote ?? "no note travelled with this label on the "
                + "payload — nothing is measured behind it here"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- how old the arithmetic is ---------- */

// Son asked for "every set minute". Nothing here picks a cadence: the
// collector's period is the backend's (config.LIVE_STATE_INTERVAL_
// SECONDS) and arrives on the payload, and this line says how far past
// it the state on screen already is.
//
// The age advances on ELAPSED CLIENT TIME added to the SERVER's age at
// fetch — never on the viewer's wall clock against a server timestamp,
// which a skewed laptop clock would turn into a confident lie.
function TickAge({ tick, fetchedAt }: {
  tick?: LiveTick; fetchedAt: number | null;
}) {
  // MOUNTED PER FETCH (the caller keys this component by `fetchedAt`),
  // so the anchor is set once at mount and the effect only subscribes
  // to the tick — no setState in an effect body, and no stale anchor.
  const [now, setNow] = useState<number | null>(fetchedAt);
  useEffect(() => {
    if (fetchedAt == null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [fetchedAt]);
  if (!tick) return null;
  if (tick.age_seconds == null || fetchedAt == null || now == null) {
    // UNKNOWN is not fresh, and it says so in the backend's words
    return (
      <span data-testid="tick-age" className="text-warn">
        {tick.note ?? "state age unknown"}
      </span>
    );
  }
  const age = tick.age_seconds + Math.max(0, (now - fetchedAt) / 1000);
  const late = tick.interval_seconds != null && age > tick.interval_seconds;
  return (
    <span data-testid="tick-age" title={tick.basis}
      className={late ? "text-warn" : undefined}>
      state captured {Math.round(age)}s ago
      {tick.interval_seconds != null
        && ` · collector interval ${tick.interval_seconds}s`}
      {late && " · a tick has not landed"}
    </span>
  );
}

/* ---------- the danger read (grids-v1, measured) ---------- */

function CellFigure({ label, p, lo, hi, n, testid }: {
  label: string; p?: number; lo?: number; hi?: number; n?: number;
  testid: string;
}) {
  return (
    <div data-testid={testid} className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <span className="font-mono text-[11px] tabular-nums">
        <span className="text-ink-hi">{pct1(p)}</span>
        {/* the band NEVER travels separately from the number */}
        <span className="ml-1.5 text-ink-faint">
          [{band(lo, hi) || "band unavailable"}]
        </span>
        {n != null && <span className="ml-1.5 text-ink-low">n={n}</span>}
      </span>
    </div>
  );
}

function ExposureBlock({ e }: { e?: Refusable<Exposure> }) {
  // THE BLOCK NEVER VANISHES. A refused exposure renders its words in
  // the panel the numbers would have occupied, and the honesty line
  // renders WITH it — that sentence is not a garnish on the success
  // case. A dismissal voids the cells and changes nothing about the
  // fact that a lead never gets safer per minute.
  const r = refusalOf(e);
  const x = (e ?? {}) as Exposure;
  const cellRefusal = !r && x.next_15 ? refusalOf(x.next_15) : null;
  const ft = r ? null : x.to_full_time;
  const ftRefusal = ft ? refusalOf(ft) : null;
  return (
    <div data-testid="exposure" className="space-y-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        exposure · measured, not modelled
        {x.score && (
          <span className="ml-2 normal-case tracking-normal text-ink-low">
            {x.lead_held_by} lead {x.score} at {x.minute}&apos;
          </span>
        )}
      </p>

      {r ? <RefusalNote text={r} />
        : cellRefusal ? <RefusalNote text={cellRefusal} /> : (
        <>
          <CellFigure testid="exposure-equalized"
            label="equalized in window"
            p={x.next_15?.p} lo={x.next_15?.wilson_low}
            hi={x.next_15?.wilson_high} n={x.next_15?.n} />
          <CellFigure testid="exposure-survives" label="lead survives it"
            p={x.survives?.p} lo={x.survives?.wilson_low}
            hi={x.survives?.wilson_high} />
        </>
      )}
      {!r && x.next_15?.fallback_note && (
        <RefusalNote text={x.next_15.fallback_note} />
      )}

      {!r && x.cell_window?.note && (
        <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
          {x.cell_window.note}
        </p>
      )}

      {ft && (ftRefusal ? <RefusalNote text={ftRefusal} /> : (
        <div data-testid="exposure-full-time"
          className="border-t border-line/60 pt-2">
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            to full time
            {ft.cell_band && (
              <span className="ml-2 normal-case text-ink-low">
                band {ft.cell_band} · {ft.opener_side}
              </span>
            )}
          </p>
          <CellFigure testid="exposure-eventually" label="equalized eventually"
            p={ft.equalized?.p} lo={ft.equalized?.wilson_low}
            hi={ft.equalized?.wilson_high} n={ft.equalized?.n} />
          <CellFigure testid="exposure-overturned" label="overturned at ft"
            p={ft.overturned?.p} lo={ft.overturned?.wilson_low}
            hi={ft.overturned?.wilson_high} n={ft.overturned?.n} />
        </div>
      ))}

      {!r && x.band_note && (
        <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
          {x.band_note}
        </p>
      )}
      {/* THE LINE THAT MAY NEVER BE DROPPED. A lead never gets safer per
          minute and there is no safe window — it renders verbatim, on
          the successes and on the refusals alike, and it is styled as a
          warning rather than as a footnote. */}
      {x.honesty && (
        <p data-testid="no-safe-window"
          className="rounded-lg border border-warn/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-warn">
          {x.honesty}
        </p>
      )}
      {x.not_a_plan && (
        <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
          {x.not_a_plan}
        </p>
      )}
    </div>
  );
}

/* ---------- the position, when the payload carries one ---------- */

// One held position. Nothing here decides anything: the two figures are
// stated, the backend's own sentence about the difference is rendered
// verbatim, and every refusal (no bid, thin bid, stale quote, voided
// grids) renders in the collector's words rather than as a blank.
function HeldPositionBlock({ h }: { h: HeldPosition }) {
  const r = refusalOf(h);
  if (r) return <RefusalNote text={r} />;
  const je = h.journal_entry;
  const hve = h.hold_vs_exit;
  const hveRefusal = hve ? refusalOf(hve) : null;
  const dir = hve?.direction;
  return (
    <div data-testid="held-position"
      className="rounded-xl border border-line bg-elev/40 p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        position
        <span className="ml-2 normal-case tracking-normal text-ink-hi">
          {h.position?.size ?? "—"} ×{" "}
          {OUTCOME_LABEL[h.position?.outcome_key ?? ""]
            ?? h.position?.outcome_key ?? "—"}
        </span>
        {je?.market_ticker && (
          <span className="ml-2 normal-case tracking-normal text-ink-faint">
            {je.market_ticker}
          </span>
        )}
        {je?.bet_id != null && (
          <span className="ml-2 normal-case tracking-normal text-ink-faint">
            journal #{je.bet_id}
          </span>
        )}
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div data-testid="value-now"
          className="rounded-lg border border-line px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            value now (exit into the bid)
          </p>
          <p className="font-mono text-xl tabular-nums text-ink-hi">
            {usd(h.value_now_cents)}
          </p>
          <p className="font-mono text-[9px] text-ink-faint">
            net of the exact per-order fee
          </p>
        </div>
        <div data-testid="value-settlement"
          className="rounded-lg border border-line px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            value at settlement (at the read)
          </p>
          <p className="font-mono text-xl tabular-nums text-ink-hi">
            {usd(h.value_at_settlement_cents)}
          </p>
          <p className="font-mono text-[9px] text-ink-faint">
            expected value, not a payout
          </p>
        </div>
      </div>

      {/* the comparison, in the backend's own words. MORE and LESS are
          statements about two dollar figures — no colour is spent on
          making either read as an instruction. */}
      {hveRefusal ? (
        <div className="mt-2"><RefusalNote text={hveRefusal} /></div>
      ) : hve?.says && (
        <p data-testid="hold-vs-exit"
          className="mt-2 rounded-lg border border-line px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-hi">
          <span className="mr-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {dir ?? ""}
          </span>
          {hve.says}
        </p>
      )}
      {hve?.certainty_vs_mean && (
        <p className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
          {hve.certainty_vs_mean}
        </p>
      )}
      {hve?.not_a_recommendation && (
        <p className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
          {hve.not_a_recommendation}
        </p>
      )}

      {/* THE COMMON CASE IS THAT THE EXIT IS NOT THERE. Each of these is
          a finding with its own sentence; none is a missing number. */}
      {h.no_bid?.finding && (
        <div data-testid="no-bid" className="mt-2">
          <RefusalNote text={h.no_bid.finding} />
        </div>
      )}
      {h.thin_bid?.finding && (
        <div data-testid="thin-bid" className="mt-2 space-y-1">
          <RefusalNote text={h.thin_bid.finding} />
          {h.thin_bid.clip_fee_warning && (
            <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
              {h.thin_bid.clip_fee_warning}
            </p>
          )}
        </div>
      )}
      {h.stale_quote?.finding && (
        <div data-testid="stale-quote" className="mt-2">
          <RefusalNote text={h.stale_quote.finding} />
        </div>
      )}
      {h.red_card_void?.void && h.red_card_void.rule && (
        <p data-testid="red-card-void"
          className="mt-2 rounded-lg border border-warn/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-warn">
          {h.red_card_void.rule}
          {h.red_card_void.survives && ` ${h.red_card_void.survives}`}
        </p>
      )}

      {/* the entry price is on the record and is NOT an input — the
          sentence saying so renders with it, not instead of it */}
      {h.position?.entry_note && (
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-ink-faint">
          entry {h.position.entry_price ?? "—"} · {h.position.entry_note}
        </p>
      )}
      {je?.size_disagreement && (
        <div className="mt-2"><RefusalNote text={je.size_disagreement} /></div>
      )}
      {h.policy?.not_a_signal && (
        <p data-testid="not-a-signal"
          className="mt-2 font-mono text-[9px] leading-relaxed text-ink-faint">
          {h.policy.not_a_signal}
        </p>
      )}
    </div>
  );
}

function PositionsPanel({ p }: { p?: PositionsBlock }) {
  // absent from the payload = absent from the DOM. The public card
  // never carries this key, and nothing is invented in its place.
  if (!p) return null;
  const r = refusalOf(p);
  const held = p.held ?? [];
  return (
    <div data-testid="positions" className="space-y-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        your position · operator view
      </p>
      {r && <RefusalNote text={r} />}
      {held.map((h, i) => (
        <HeldPositionBlock key={h.journal_entry?.bet_id ?? i} h={h} />
      ))}
      {p.definition && (
        <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
          {p.definition}
        </p>
      )}
    </div>
  );
}

function LiveNowBlock({ l, updatedAt, stale, tick, fetchedAt, exposure,
                       positions }: {
  l: LiveNow; updatedAt: string | null; stale: boolean;
  tick?: LiveTick; fetchedAt: number | null;
  exposure?: Refusable<Exposure>; positions?: PositionsBlock;
}) {
  // a refusal is the collector's own sentence, rendered verbatim in the
  // same note every other refused block on this card uses
  const r = refusalOf(l);
  const p = l.p;
  return (
    <div data-testid="live-now"
      className="rounded-xl border border-live/40 bg-live/5 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-live">
          <span className="pulse-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-live align-middle" />
          live now
          <span className="ml-2 text-base tracking-normal text-ink-hi">
            {l.minute ?? "minute unavailable"}
          </span>
          <span className="ml-2 text-base tabular-nums tracking-normal text-ink-hi">
            {l.score ?? "score unavailable"}
          </span>
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
          {updatedAt ? `updated ${updatedAt}` : "updating…"}
          {stale ? " · stale — last refresh failed, retrying" : ""}
          {/* how old the STATE is, which is not the same fact as how
              long ago we last fetched it: a fetch can succeed and hand
              back a tick the collector took four minutes ago. */}
          {tick && <span className="ml-2 normal-case tracking-normal">
            · <TickAge key={fetchedAt ?? "unfetched"} tick={tick}
                fetchedAt={fetchedAt} />
          </span>}
          <span className="ml-2 tracking-[0.14em]">· shadow · not advice</span>
        </p>
      </div>

      {r ? <div className="mt-2.5"><RefusalNote text={r} /></div> : (
        <div className="mt-3">
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-wide">
            {LIVE_SIDES.map((s) => (
              <span key={s.key} className={s.ink}>{s.key}</span>
            ))}
          </div>
          <div data-testid="live-prob-bar"
            className="mt-1.5 flex h-2 overflow-hidden rounded-full border border-line">
            {LIVE_SIDES.map((s) => (
              <div key={s.key} className={s.bar}
                style={{ width: `${(p?.[s.key] ?? 0) * 100}%` }} />
            ))}
          </div>
          <div className="mt-1.5 flex items-baseline justify-between font-mono text-lg tabular-nums">
            {LIVE_SIDES.map((s) => (
              <span key={s.key} className={s.num}>
                {p?.[s.key] != null ? pct1(p[s.key]! * 100) : "—"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* where the number came from — said only when there IS one */}
      {!r && (
        <p className="mt-3 font-mono text-[9px] leading-relaxed text-ink-faint">
          {LIVE_MEANING}
        </p>
      )}

      {/* the observed state, beneath the bar. It renders under a
          REFUSED triple too: the tape's counts are things the collector
          saw, and they do not stop existing because the engine declined
          to write a belief. Absent from the payload — and so from the
          DOM — exactly as before. */}
      {l.state && <LiveStateBlock st={l.state} />}

      {/* THE LADDER, beneath the match-state readout. Exposure first —
          it is a property of the match and renders for any in-play
          fixture, holder or not — then the position, which is present
          only on an operator payload. Absent keys render nothing at
          all; a refusal renders its words. */}
      {exposure != null && (
        <div className="mt-3 border-t border-line pt-3">
          <ExposureBlock e={exposure} />
        </div>
      )}
      {positions != null && (
        <div className="mt-3 border-t border-line pt-3">
          <PositionsPanel p={positions} />
        </div>
      )}

      <p className="mt-3 font-mono text-[9px] leading-relaxed text-ink-faint">
        captured {l.captured_at ?? "— (the tape row carried no capture time)"}
        {l.lambdas?.home != null && l.lambdas?.away != null
          ? ` · λ ${l.lambdas.home.toFixed(4)} / ${l.lambdas.away.toFixed(4)}`
          : ""}
      </p>
      {l.basis && (
        <p className="mt-1 break-words font-mono text-[9px] leading-relaxed text-ink-faint">
          {l.basis}
        </p>
      )}
    </div>
  );
}

/* ---------- in-play plan ---------- */

function InplayBlock({ p, updatedAt, stale, tick, fetchedAt, positions }: {
  p?: InplayLayer; updatedAt: string | null; stale: boolean;
  tick?: LiveTick; fetchedAt: number | null; positions?: PositionsBlock;
}) {
  const r = refusalOf(p);
  if (r) return <RefusalNote text={r} />;
  const peak = p?.danger_windows?.equalizer_hazard_peak;
  const peakRefusal = peak ? refusalOf(peak) : null;
  const late = p?.danger_windows?.late_opener;
  const lateRefusal = late ? refusalOf(late) : null;
  return (
    <div className="space-y-3">
      {/* first and dominant while the fixture is in play; absent from
          the payload — and so from the DOM — pre and post */}
      {p?.live_now && (
        <LiveNowBlock l={p.live_now} updatedAt={updatedAt} stale={stale}
          tick={tick} fetchedAt={fetchedAt} exposure={p.exposure}
          positions={positions} />
      )}
      {peak && (peakRefusal ? <RefusalNote text={peakRefusal} /> : (
        <div className="rounded-xl border border-line p-3">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ink-low">
            equalizer hazard peak
            <span className="ml-2 text-ink-hi">
              {(peak as HazardPeak).bin}&apos;{" "}
              {pct1((peak as HazardPeak).p)}
            </span>
            <span className="ml-1.5 normal-case text-ink-faint">
              [{band((peak as HazardPeak).wilson_low,
                     (peak as HazardPeak).wilson_high)}]
              {" "}n={(peak as HazardPeak).n}
            </span>
          </p>
          {(peak as HazardPeak).meaning && (
            <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
              {(peak as HazardPeak).meaning}
            </p>
          )}
        </div>
      ))}
      {late && (lateRefusal ? <RefusalNote text={lateRefusal} /> : (
        <PrecedentCell c={late as Cell} />
      ))}
      {p?.red_card_rule && (
        <p className="rounded-lg border border-warn/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-warn">
          {p.red_card_rule}
        </p>
      )}
      {p?.cash_out_ladder && (
        <p className="font-mono text-[10px] leading-relaxed text-ink-faint">
          cash-out ladder: {p.cash_out_ladder}
        </p>
      )}
    </div>
  );
}

/* ---------- evidence line ---------- */

function EvidenceLine({ e, resp }: { e?: EvidenceLayer; resp: CardResponse }) {
  const r = refusalOf(e);
  const arts = e?.artifacts
    ? Object.values(e.artifacts)
        .map((a) => `${a.artifact} ${a.version}`)
        .join(" · ")
    : null;
  return (
    <div className="font-mono text-[9px] leading-relaxed text-ink-faint">
      {r ? <RefusalNote text={r} /> : (
        <p>
          {e?.card_version ?? "card"} · {arts ?? "artifacts unlisted"}
        </p>
      )}
      {resp.content_hash && (
        <p className="mt-0.5 break-all" title={e?.content_hash_basis}>
          hash {resp.content_hash}
        </p>
      )}
      <p className="mt-0.5">
        {resp.emission ?? "emission state unknown"}
        {resp.prediction_run_id ? ` · run ${resp.prediction_run_id}` : ""}
        {resp.generated_at ? ` · ${resp.generated_at}` : ""}
      </p>
    </div>
  );
}

/* ---------- the card ---------- */

// The collector ticks every 120s, so a 60s re-fetch never sits on a
// stale tick for a whole cycle. Polling runs ONLY while live_now is on
// the payload, and only while the tab is visible.
const LIVE_REFRESH_MS = 60_000;

const stampUtc = () => `${new Date().toISOString().slice(11, 19)}Z`;

export default function SuggestionCard({ competition, eventId }: {
  competition: "mls-2026" | "epl-2026" | "la-liga-2026";
  eventId: string;
}) {
  const [resp, setResp] = useState<CardResponse | null>(null);
  // null = in flight; a number = HTTP status; 0 = network failure
  const [err, setErr] = useState<number | null>(null);
  // a refresh that fails keeps the last good numbers on screen and says
  // so — blanking a live card would read as "the match stopped"
  const [stale, setStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  // the client-elapsed anchor the tick age advances from — never the
  // viewer's wall clock against a server timestamp
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const alive = useRef(true);
  const held = useRef<CardResponse | null>(null);

  const load = useCallback(() =>
    fetch(`/api/card/${competition}/${eventId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: CardResponse) => {
        if (!alive.current) return;
        held.current = d;
        setResp(d); setErr(null); setStale(false);
        setUpdatedAt(stampUtc()); setFetchedAt(Date.now());
      })
      .catch((e) => {
        if (!alive.current) return;
        // only a FIRST fetch with nothing to hold becomes the error
        // panel; a failed refresh marks the held card stale instead
        if (held.current) setStale(true);
        else setErr(typeof e === "number" ? e : 0);
      }), [competition, eventId]);

  // No synchronous reset here: the mount sites key this component by
  // eventId, so a different fixture remounts it with fresh state.
  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  const card = resp?.card;
  // the broadcast switch: present only while the fixture is in play
  const broadcasting = card?.layers?.inplay_plan?.live_now != null;

  useEffect(() => {
    if (!broadcasting) return;            // pre/post: no timer at all
    let timer: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (timer !== null) { clearInterval(timer); timer = null; }
    };
    const start = () => {
      if (timer === null) timer = setInterval(() => { load(); },
                                              LIVE_REFRESH_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") { load(); start(); }
      else stop();                        // hidden tab polls nothing
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    // unmount, or live_now disappearing at full time, clears the timer
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [broadcasting, load]);

  const layers = card?.layers;
  const id = layers?.identity;
  const idRefusal = refusalOf(id);

  return (
    <Reveal>
      <section id="card" className="mt-8 rounded-3xl border border-line bg-elev p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Eyebrow tone="accent">
            suggestion card · {card?.card_version ?? "card-v1"}
          </Eyebrow>
          <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            shadow · not advice
          </span>
        </div>

        {err !== null ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            card unavailable — {err === 0 ? "backend unreachable"
              : `http ${err}`}
          </p>
        ) : resp === null ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            assembling card…
          </p>
        ) : !card ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            card unavailable — the response carried no card payload
          </p>
        ) : (
          <div className="space-y-4">
            <HeadlineBlock h={card.headline} />

            {idRefusal ? <RefusalNote text={idRefusal} /> : id && (
              <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
                {(id as Identity).home} vs {(id as Identity).away} ·{" "}
                {(id as Identity).kickoff_utc} · {(id as Identity).venue} ·{" "}
                {(id as Identity).status} · venue class:{" "}
                {(id as Identity).venue_class}
              </p>
            )}

            <CardSection eyebrow="market">
              <MarketBlock m={layers?.market} />
            </CardSection>

            <CardSection eyebrow="pick · fee gate">
              <PickBlock p={layers?.pick} />
            </CardSection>

            <CardSection eyebrow="first team to score · base rates">
              <FttsBlock f={layers?.ftts} />
            </CardSection>

            <CardSection eyebrow="pick-helper splits">
              <SplitsBlock s={layers?.splits} />
            </CardSection>

            <CardSection eyebrow="precedents">
              <PrecedentsBlock p={layers?.precedents} />
            </CardSection>

            <CardSection eyebrow="style notes">
              <StyleBlock s={layers?.style_notes} />
            </CardSection>

            <CardSection eyebrow="in-play plan">
              <InplayBlock p={layers?.inplay_plan} updatedAt={updatedAt}
                stale={stale} tick={resp.live_tick}
                fetchedAt={fetchedAt} positions={resp.positions} />
            </CardSection>

            <CardSection eyebrow="evidence">
              <EvidenceLine e={layers?.evidence} resp={resp} />
            </CardSection>
          </div>
        )}
      </section>
    </Reveal>
  );
}

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
// their display-only label verbatim, and that label now states the
// MEASURED answer and names the artifact that measured it (style-axes-m2:
// no axis beats plain hazard out of sample, on the powered full corpus or
// on styles-v1's own three leagues) — a measured finding, not decoration.
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
  // THE WINDOWED READ, DECLARED AND NOT DRAWN. Typed opaquely on
  // purpose: this file has no recorded shape for it, and drawing a
  // block against a shape nobody recorded is how a surface certifies a
  // reader that cannot read the real payload. It is REGISTERED instead
  // — UNRENDERED_PAYLOAD_FIELDS.window carries the finding and the
  // condition that closes it — so it is named rather than dropped.
  window?: Record<string, unknown>;
  // WHY these counts can be read as one minute of one match (backend
  // LIVE_STATE_BASIS), including the rule the dashes above depend on:
  // a null is the provider's silence, and missing is never zero. It is
  // rendered from the payload rather than restated in copy here, so
  // the two can never drift into saying different things.
  basis?: string };

/** The keys of `live_now.state` this file DECLARES. Anything else the
 *  backend attaches is NAMED on screen by the namer below rather than
 *  dropped — the same closure `INPLAY_DECLARED_KEYS` gives the layer
 *  above, at the level where `window` was found hiding. */
export const LIVE_STATE_DECLARED_KEYS: readonly string[] = [
  "possession", "shots", "on_target", "corners", "cards", "threat",
  "tilt_label", "tilt_note", "window", "basis",
];

type TiltLabel = { label?: "SIEGE" | "STERILE_POSSESSION" | "CONTEST";
  note?: string; refused?: string; unavailable?: string };

// The favourite's SHARE of shots + on-target + corners on this row, so
// the number belongs to a SIDE and `fav` is printed beside it — a bare
// 0.76 says nothing about whose 0.76 it is. `basis` is the pattern
// library's own definition, carried on the payload and rendered, never
// retyped here (backend THREAT_DEFINITION).
type Threat = { tilt?: number; fav?: "home" | "away"; basis?: string;
  refused?: string; unavailable?: string };

// The triple rides under the WIN column's key, `p_win`, and the block
// declares it under `quantity_key` (backend position.WinProbability
// .FIELD). It was `p` until 2026-09-05 -- the grids' own hazard column
// name on this same payload (exposure, precedents, danger windows) --
// so a reader lining numbers up by key could set a win probability
// beside an equaliser hazard. This file was the reader that held the
// backend's rename open; it moved with the source in one change.
type LiveNow = { minute?: string | null; captured_at?: string | null;
  score?: string | null; p_win?: LiveTriple; quantity_key?: string;
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

// A FAILED READ, IN THE READER'S OWN WORDS. Present on `inplay_plan`
// ONLY when the whole-tape history read FAILED (backend card.py
// `history_failed`) and absent on every card whose read worked — so the
// key's PRESENCE is the finding. `consequence` is
// card.TAPE_HISTORY_UNREADABLE_WORDS, which names what the failure
// fails closed on: the fixture is treated as started, the band comes
// from the pre-kickoff anchor or refuses thin_book, no fee-inclusive
// edge is quoted, and every number the dismissal witness governs is
// WITHDRAWN under `tape_unreadable` rather than quoted.
//
// IT WAS NOT ON THIS TYPE until 2026-09-07 and nothing here read it.
// The per-block `tape_unreadable` refusals did render, so the card was
// not silent — but the one sentence saying the cause was a READ THAT
// FAILED, rather than a tape with nothing on it, was dropped on the
// floor. That is this repo's oldest bug shape and the exact reason the
// backend emits the sentence at all: its own text ends "See
// inplay_plan.tape_history for the read's own failure", pointing at a
// key this surface did not have.
type TapeHistory = { unavailable?: boolean; consequence?: string };

type InplayLayer = {
  live_now?: LiveNow;
  exposure?: Refusable<Exposure>;
  tape_history?: TapeHistory;
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
  // `withdraws` is the QUESTION and `void` is the FACT, and they are not
  // the same key. An unreadable tape sets withdraws TRUE and void FALSE by
  // design: nothing is imputed (no dismissal is invented) and nothing is
  // ruled out (none can be), so every grid number, the exposure and the
  // engine read are withdrawn while no dismissal is asserted. A reader
  // gating on `void` renders NOTHING in that state — a card with its
  // numbers gone and no sentence saying why, which is the fail-open the
  // backend spent two rounds closing. `withdrawal` carries the words.
  red_card_void?: { void?: boolean; withdraws?: boolean;
    withdrawal?: { code?: string; because?: string; rule?: string } | null;
    witness?: string[] | null;
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

/* Named so the state banner can walk the layers generically — it counts
   refusals across all of them rather than hand-listing, which is what
   keeps a new layer from silently escaping the count. */
type CardLayers = { identity?: Refusable<Identity>;
  market?: Refusable<MarketLayer>; pick?: Refusable<PickLayer>;
  ftts?: FttsLayer; splits?: SplitsLayer;
  precedents?: PrecedentsLayer; style_notes?: StyleLayer;
  inplay_plan?: InplayLayer; evidence?: EvidenceLayer };

type Card = { card_version?: string; competition?: string;
  fixture_id?: number; headline?: Headline; layers?: CardLayers };

type CardResponse = { generated_at?: string; content_hash?: string;
  emission?: string; prediction_run_id?: string | null; card?: Card;
  live_tick?: LiveTick; positions?: PositionsBlock };

/* ---------- THE OPEN REGISTER FOR THIS SURFACE (2026-09-07) ----------
 *
 * WHY IT EXISTS. This file declares 258 payload fields and draws 208 of
 * them. The other fifty were invisible: not refused, not dashed, not
 * named — absent, with nothing anywhere saying they had arrived and
 * been dropped. Two of them are the reason this register was written.
 * `fair_now` is the probability `value at settlement` is computed FROM,
 * and it carries its own `refused`, so a settlement value could render
 * beside a refusal nobody could see. `executions` is what actually
 * filled, and a position block quoting "value now" for a hundred
 * contracts while forty of them never filled is not a rounding error,
 * it is the wrong number.
 *
 * THE RULE THIS ROUND SET. Either make a thing impossible by absence or
 * by construction, or REGISTER it — with the condition that closes it
 * written into the code, and a guard that fails BOTH if a new hole
 * appears unregistered AND if a registered one is closed without
 * retiring its record. The pattern is `WatchedStrip`'s
 * UNRENDERED_ENVELOPE_KEYS and it is honest, finite and convergent.
 *
 * THE THREE SETS ARE DISJOINT AND THEY COVER WHAT IS NOT DRAWN. Every
 * declared field this file does not read is REDUNDANT (a second face of
 * a field that IS drawn — the guard names which), BOOKKEEPING (it
 * identifies the payload and says nothing about a match), or REGISTERED
 * (it carries a finding this surface does not draw). A field in none of
 * them, or in two of them, fails the guard in
 * e2e/suggestion-card.spec.ts — which is what makes a record retire
 * when the block that replaces it ships, instead of standing as prose
 * after it stops being true.
 *
 * WHAT THIS REGISTER CANNOT SEE, said plainly rather than left for the
 * next round to find. It is derived from the TYPES IN THIS FILE against
 * the code in this file, so it catches a field this file declares and
 * drops. It cannot catch a key the backend sends that this file never
 * declared at all — which is exactly how `inplay_plan.tape_history`,
 * the sentence saying a tape read FAILED, hid until 2026-09-07. That
 * hole is closed for `inplay_plan` by the runtime namer below and is
 * open everywhere else; `INPLAY_DECLARED_KEYS` carries the condition.
 */

/** Not drawn because a field that IS drawn carries the same fact. The
 *  value names it, so the claim is checkable rather than asserted. */
export const REDUNDANT_PAYLOAD_FIELDS: Record<string, string> = {
  all_in_cents: "all_in_dollars — the same money, and the dollar string "
    + "is the backend's exact Decimal rather than a re-scaled integer",
  ceiling_seconds: "stale_quote.finding — the collector's sentence states "
    + "the ceiling it breached",
  difference_cents: "hold_vs_exit.says — the backend's own sentence about "
    + "the difference, rendered verbatim, carries the figure",
  difference_cents_per_contract: "hold_vs_exit.says",
  end_minute: "cell_window.note",
  entry_cost_dollars: "position.entry_price beside position.entry_note",
  fee_cents: "fee_dollars",
  fee_cents_per_contract: "fee_dollars",
  fee_helper: "the execution layer's fee_helpers line, which names both "
    + "helpers and their rounding",
  fee_note: "the execution layer's fee_helpers line",
  gross_dollars: "all_in_dollars and fee_dollars, which sum to it",
  headline_rate: "effective_rate beside rounding_multiple — the charged "
    + "rate and its multiple over the headline",
  net_dollars: "value_now_cents, rendered through usd()",
  offset_from_cell_start: "cell_window.note",
  per_contract_dollars: "per_contract_cents",
  position_size: "position.size",
  read_at_minute: "cell_window.note",
  start_minute: "cell_window.note",
  stated_price_dollars: "position.entry_price",
  stated_size: "position.size",
  top_of_book_size: "thin_bid.finding — the sentence states the depth it "
    + "found",
};

/** Not drawn because they identify the payload rather than describe a
 *  match. Nothing about a fixture is lost by leaving them out. */
export const BOOKKEEPING_PAYLOAD_FIELDS: readonly string[] = [
  "built", "code", "competition_scope", "espn_event_id", "fixture_id",
  "price_basis", "recorded_at", "size_basis", "tape_row",
];

/** CARRIES A FINDING THIS SURFACE DOES NOT DRAW. Each entry is a live
 *  record: what is missing from the screen, and what closes it. */
export const UNRENDERED_PAYLOAD_FIELDS: Record<string, {
  finding: string; closes_when: string;
  /** Set when this surface READS the field solely in order to NAME it
   *  on screen. Naming is not drawing, so the record still stands —
   *  but the guard must not mistake the naming for the record having
   *  been closed. The guard requires the naming to actually exist, so
   *  deleting it fails just as loudly as leaving a stale record. */
  named_on_surface?: boolean;
}> = {
  fair_now: {
    finding: "THE PROBABILITY THE SETTLEMENT VALUE IS COMPUTED FROM. "
      + "`value at settlement (at the read)` renders as a dollar figure "
      + "with no p beside it, while position.py carries p, its basis, "
      + "its source and its own `refused` on this key. So a card can "
      + "show a settlement value whose probability was REFUSED, with "
      + "the refusal nowhere on screen — a number standing where a "
      + "named absence should be, which is the shape this whole card "
      + "exists to prevent.",
    closes_when: "the settlement figure is drawn with fair_now.p, its "
      + "band and its basis beside it, and fair_now.refused renders as "
      + "a RefusalNote IN PLACE OF the dollar figure rather than under "
      + "it; then this record retires.",
  },
  executions: {
    finding: "WHAT ACTUALLY FILLED. The block quotes value-now and "
      + "value-at-settlement for the journal's STATED size, and the "
      + "journal separately carries rows, filled contracts, contracts "
      + "sold early, open contracts, orders not filled and closes. A "
      + "hundred-contract position of which forty filled is worth what "
      + "forty are worth; quoting the stated size is not conservative, "
      + "it is wrong, and nothing on this surface says which size the "
      + "money figures used.",
    closes_when: "the position header states the OPEN contract count "
      + "beside the stated size whenever they differ, and the money "
      + "figures name which of the two they were computed on; then this "
      + "record and its five children retire together.",
  },
  filled_contracts: { finding: "a child of `executions` — see that "
    + "record; the count that fills the gap between stated and open.",
    closes_when: "the `executions` record closes — the open count "
    + "reaches the position header and the money figures name the "
    + "size they were computed on; these five children retire with "
    + "it, together, because none of them is a separate hole." },
  contracts_sold_early: { finding: "a child of `executions` — see that "
    + "record; contracts already exited, which the value figures do not "
    + "know about.", closes_when: "the `executions` record closes — the open count "
    + "reaches the position header and the money figures name the "
    + "size they were computed on; these five children retire with "
    + "it, together, because none of them is a separate hole." },
  open_contracts: { finding: "a child of `executions` — see that record; "
    + "this is the size the money figures SHOULD be computed on.",
    closes_when: "the `executions` record closes — the open count "
    + "reaches the position header and the money figures name the "
    + "size they were computed on; these five children retire with "
    + "it, together, because none of them is a separate hole." },
  not_filled: { finding: "a child of `executions` — see that record; "
    + "orders that never became a position at all.",
    closes_when: "the `executions` record closes — the open count "
    + "reaches the position header and the money figures name the "
    + "size they were computed on; these five children retire with "
    + "it, together, because none of them is a separate hole." },
  closed_early: { finding: "a child of `executions` — see that record.",
    closes_when: "the `executions` record closes — the open count "
    + "reaches the position header and the money figures name the "
    + "size they were computed on; these five children retire with "
    + "it, together, because none of them is a separate hole." },
  arithmetic: {
    finding: "THE WORKING BEHIND THE TWO MONEY FIGURES. `arithmetic."
      + "exit` is contracts × bid, gross, fee and net as exact decimal "
      + "strings, and `arithmetic.settlement` carries the fee note. The "
      + "card prints the two totals and none of the steps, so a reader "
      + "cannot check a figure against the fee that produced it — on a "
      + "surface whose largest standing caveat is that the fee rounding "
      + "granularity is an OPEN QUESTION worth 2.27x to 50.00x on small "
      + "clips.",
    closes_when: "the exit figure expands to its four terms on demand, "
      + "as the entry-cost block already does for cross and rest; then "
      + "this record and `maker_exit` retire.",
  },
  maker_exit: { finding: "the sentence about exiting as a MAKER rather "
    + "than crossing to the bid — the one execution quantity this "
    + "project measured and did not kill (resting beat crossing by "
    + "$12-18/leg). The entry side of that comparison is drawn in full "
    + "by the entry-cost block; the exit side is on the payload and is "
    + "not drawn at all, so the card is asymmetric about the one thing "
    + "it has evidence for.",
    closes_when: "the `arithmetic` record closes AND the exit figure "
    + "carries the maker route beside the taker one, so the exit side "
    + "of the rest-versus-cross comparison is drawn as fully as the "
    + "entry side already is; then this retires with it." },
  executable_now: {
    finding: "WHAT THE THIN BID CAN ACTUALLY PAY. `thin_bid` renders "
      + "its finding — that the top of the book cannot take the whole "
      + "position — and drops the arithmetic for the part it CAN take. "
      + "The reader is told the exit is not there and not told how much "
      + "of it is.",
    closes_when: "the thin-bid note carries executable_now's contracts "
      + "and net beside the finding, held to the one ladder the backend "
      + "already withdraws unpayable claims against; then it retires.",
  },
  common_case: {
    finding: "THE BASE RATE FOR THE REFUSAL BESIDE IT. `no_bid` and "
      + "`thin_bid` each carry a sentence saying how usual this state "
      + "is — the measured median in-play bid size is 0-1 contracts, so "
      + "no exit is the COMMON case, not an anomaly. Without it a "
      + "refusal reads as this fixture being unlucky rather than as the "
      + "regime the stage operates in, which is the misreading the "
      + "sentence was written to prevent.",
    closes_when: "the no-bid and thin-bid notes render common_case "
      + "beneath their finding, as the exposure block already renders "
      + "its honesty line; then it retires.",
  },
  witness: {
    finding: "WHICH WITNESS SAW THE DISMISSAL. `red_card_void` draws "
      + "`because` and `rule` and drops the witness list, so a "
      + "withdrawal corroborated by two witnesses and one resting on a "
      + "single uncorroborated sighting render identically — and the "
      + "backend distinguishes them by name (card.py: 'corroborated by "
      + "the state tape's last snapshot', 'uncorroborated (single "
      + "witness)', 'UNVERIFIED - the two witnesses disagree').",
    closes_when: "the withdrawal note names its witnesses; then this "
      + "record and `tape_note` retire.",
  },
  tape_note: { finding: "the tape read's own note on the withdrawal — a "
    + "child of the `witness` finding, and the place a read FAILURE "
    + "rather than an absent sighting would be said.",
    closes_when: "the `witness` record closes — the withdrawal note "
    + "names its witnesses and says whether they corroborate, disagree "
    + "or stand alone; this note retires with it, being the same "
    + "finding at one more level of detail." },
  quantity_key: {
    finding: "WHICH QUANTITY THE TRIPLE IS. The backend declares it "
      + "(position.WinProbability.FIELD) precisely because this payload "
      + "carries BOTH win probabilities and equaliser hazards, and B7 "
      + "made confusing the two impossible in the backend by "
      + "construction. On screen the three numbers are labelled home / "
      + "draw / away and nothing says they are p(win) rather than a "
      + "hazard — the discriminator the backend went to the trouble of "
      + "shipping is dropped by the reader it was shipped for. This "
      + "file was the reader that held the p -> p_win rename open.",
    closes_when: "the live triple is labelled with quantity_key on "
      + "screen, and a quantity_key this surface does not recognise "
      + "REFUSES the triple rather than drawing it under the win "
      + "label; then it retires.",
  },
  units: {
    finding: "THE UNIT OF `survives`. CellFigure renders it through "
      + "pct1(), which glues a percent sign on whatever arrives, while "
      + "the payload states the unit separately and this surface never "
      + "reads it. The sign is asserted, not derived — the same shape "
      + "as the possession pair that used to wear a `%` it had not "
      + "earned, closed one block over on 2026-09-07.",
    closes_when: "CellFigure takes the unit from the payload and "
      + "refuses to format a figure whose unit it does not recognise; "
      + "then it retires.",
  },
  grid: {
    finding: "WHICH GRID ARTIFACT THE CELL CAME FROM. Every precedent "
      + "cell, every map branch and the exposure cell carry `grid` — "
      + "comeback_by_strength, late_opener, scoreless_fav_decay, "
      + "equalizer_hazard — and this surface draws `role` and "
      + "`source_cell` and never the grid. Two cells from two different "
      + "measurements, with different definitions, different corpora "
      + "and different n, render under headers that look alike, and it "
      + "is on the recorded payload this suite already serves. It is "
      + "the same family as `variant` one field over: the provenance a "
      + "band is only interpretable against.",
    closes_when: "each cell header names its grid beside its role, so "
      + "two cells drawn one above the other can be told apart by the "
      + "measurement behind them; then this record retires with "
      + "`variant`.",
  },
  variant: {
    finding: "WHICH GRID THE EXPOSURE CAME FROM. clean_11v11 excludes "
      + "every match with a sending-off; the pooled variant does not. "
      + "The card glosses clean_11v11 by name in its GLOSSARY and then "
      + "never tells the reader which variant the number in front of "
      + "them is, so two materially different measurements render "
      + "identically.",
    closes_when: "the exposure header names the variant and renders "
      + "variant_basis beside it; then this record and `variant_basis` "
      + "retire.",
  },
  variant_basis: { finding: "the sentence defining the variant — a "
    + "child of the `variant` finding.", closes_when: "the `variant` record closes — the exposure header "
    + "names which grid the cell came from; this sentence is drawn "
    + "beside it and retires with it." },
  applies: {
    finding: "WHETHER THE EXPOSURE APPLIES AT ALL. The block draws its "
      + "cells whenever they are present and never consults the "
      + "backend's own statement that this fixture is or is not a case "
      + "the measurement covers, so `applies: false` with cells "
      + "attached would render as a live reading.",
    closes_when: "the block gates on applies and renders `subject` when "
      + "it is false; then this record and `subject` retire.",
  },
  subject: { finding: "what the exposure is a statement ABOUT — a child "
    + "of the `applies` finding, and the sentence that would explain a "
    + "false one.", closes_when: "the `applies` record closes — the block gates on "
    + "applies and renders this sentence whenever it is false; this "
    + "retires with it, being the words that gate's refusal needs." },
  window: {
    finding: "THE WINDOWED READ, WHICH THE CUMULATIVE SHARE IS NOT A "
      + "SUBSTITUTE FOR. card.py `_live_state` attaches `window` on "
      + "EVERY state it emits — a share of what accrued in the last few "
      + "match-minutes and how much accrued per minute, with their own "
      + "refusal vocabulary (patterns.WINDOW_REFUSALS, itself a "
      + "registered hole for being a SECOND vocabulary) and their own "
      + "registered absence, WINDOW_AXES_UNMEASURED. The emitter's "
      + "docstring says they ride 'BESIDE the cumulative one and NEVER "
      + "IN ITS PLACE' — and this surface drew the cumulative one "
      + "alone, which puts it exactly in their place: 76% of the "
      + "threat across ninety minutes and 76% of it since the 80th are "
      + "different facts and rendered as one number. It was not on this "
      + "type at all until 2026-09-07, so nothing declared it, nothing "
      + "drew it, and nothing said it had arrived.",
    closes_when: "the window block's shape is RECORDED off card.py's "
      + "own emitter (never hand-written — two incidents on this same "
      + "sub-block came from hand-written fixtures agreeing with the "
      + "frontend instead of with the backend) and drawn BESIDE the "
      + "cumulative counts with each labelled as to its span, its "
      + "refusals named, and WINDOW_AXES_UNMEASURED rendered verbatim; "
      + "then this record retires.",
    named_on_surface: true,
  },
  partial_n: {
    finding: "A SPLIT COMPUTED ON FEWER MATCHES THAN ITS HEADER CLAIMS. "
      + "SplitsSide prints n_total in the header and every condition's "
      + "own n in its row; partial_n says the side's rows rest on a "
      + "subset, and it is dropped. A percentage whose denominator is "
      + "overstated is the noise-floor error this project measures "
      + "everything against.",
    closes_when: "the splits header states partial_n beside n_total "
      + "whenever it is present; then it retires.",
  },
};

/** The keys of `inplay_plan` this file DECLARES. The runtime namer
 *  below reports any other key the backend attaches, so the next
 *  `tape_history` announces itself on screen instead of being dropped
 *  for a round. Pinned to the type by the guard, so it cannot drift. */
export const INPLAY_DECLARED_KEYS: readonly string[] = [
  "live_now", "exposure", "tape_history", "danger_windows",
  "red_card_rule", "cash_out_ladder", "refused", "unavailable",
];

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

/* A refusal renders VERBATIM — the charter's rule. The only thing added
   is a dotted underline under any glossary term the sentence happens to
   contain, which changes no words and hides nothing. */
function glossed(text: string): React.ReactNode {
  const terms = Object.keys(GLOSSARY)
    .sort((a, b) => b.length - a.length)
    .filter((t) => text.toLowerCase().includes(t.toLowerCase()));
  if (terms.length === 0) return text;
  const re = new RegExp(`(${terms.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return text.split(re).map((part, i) => {
    const hit = terms.find((t) => t.toLowerCase() === part.toLowerCase());
    return hit
      ? <Gloss key={i} term={hit}>{part}</Gloss>
      : <span key={i}>{part}</span>;
  });
}

function RefusalNote({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-line px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-low">
      {glossed(text)}
    </p>
  );
}

/* ---------- C: WHAT KIND OF CARD IS THIS ------------------------------
 *
 *  A refused card refuses in several places at once, and on a no-book
 *  fixture EVERY one of those refusals has the same cause. Read top to
 *  bottom that is five separate disappointments; said once at the top it
 *  is one understood fact, and the reader learns immediately that the
 *  card is informational rather than broken.
 *
 *  Nothing here replaces a refusal. Every block still renders its own
 *  words verbatim below — the charter's rule, because "books: []" once
 *  meant three different absences at once. This only names the pattern
 *  and says what SURVIVES it, which the card has never done.
 *
 *  Derived, never hand-written: the count, the shared cause and the
 *  surviving list all come from the payload, so a fixture that refuses
 *  for some other reason gets an honest banner rather than this one. */

const LAYER_NAMES: Record<string, string> = {
  market: "market", pick: "fee gate", ftts: "first-scorer band",
  precedents: "precedents", splits: "splits", style_notes: "style",
  inplay_plan: "in-play",
};

/** Every refusal on the card, including the ones nested inside a layer
 *  that is otherwise present — the fee gate and the late-opener window
 *  both refuse without their parent refusing. */
function collectRefusals(layers: CardLayers | undefined):
    { key: string; text: string }[] {
  if (!layers) return [];
  const out: { key: string; text: string }[] = [];
  const push = (key: string, v: unknown) => {
    const r = refusalOf(v);
    if (r && r !== "absent from the card payload") out.push({ key, text: r });
  };
  for (const k of ["market", "ftts", "precedents", "splits", "style_notes"]) {
    push(k, (layers as Record<string, unknown>)[k]);
  }
  const pick = layers.pick as { gate?: unknown } | undefined;
  if (pick && !refusalOf(pick)) push("pick", pick.gate);
  else push("pick", layers.pick);
  const ip = layers.inplay_plan as
    { danger_windows?: { late_opener?: unknown } } | undefined;
  if (ip && !refusalOf(ip)) push("inplay_plan", ip.danger_windows?.late_opener);
  else push("inplay_plan", layers.inplay_plan);
  return out;
}

function CardState({ layers, headline }: {
  layers?: CardLayers; headline?: Headline;
}) {
  const refusals = collectRefusals(layers);
  if (refusals.length < 2) return null;   // one refusal explains itself

  // the shared cause, only claimed when EVERY refusal actually shares it
  const noBook = refusals.every((r) => /\bbook\b/i.test(r.text));
  const refusedKeys = new Set(refusals.map((r) => r.key));
  const surviving = Object.entries(LAYER_NAMES)
    .filter(([k]) => !refusedKeys.has(k)
      && layers?.[k as keyof CardLayers] !== undefined)
    .map(([, name]) => name);

  const refusedNames = refusals
    .map((r) => LAYER_NAMES[r.key] ?? r.key).join(", ");

  return (
    <div data-testid="card-state"
      className="rounded-xl border border-skylive/30 bg-skylive/5 px-4 py-3.5">
      <p className="text-[13px] font-semibold leading-snug text-ink-hi">
        {noBook
          ? "This card has no market to price against — so it prices nothing."
          : `${refusals.length} of this card's layers are refusing.`}
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-mid">
        {noBook ? (
          <>
            <b className="text-ink-hi">
              {refusals.length} blocks below refuse, and they all refuse for
              the same reason:
            </b>{" "}
            no stored book for this fixture. That single absence is what turns
            the headline into {String(headline?.value ?? "REFUSED")}, and it is
            why the {refusedNames} blocks each say “no book” in their own words.
          </>
        ) : (
          <>The {refusedNames} blocks each name their own reason below.</>
        )}
      </p>
      {surviving.length > 0 && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-mid">
          Everything measured from{" "}
          <b className="text-ink-hi">football rather than price</b> is still
          here and still valid: {surviving.join(", ")}. Read this card for what
          the teams do, not for what to back.
        </p>
      )}
    </div>
  );
}

/* ---------- A: a definition behind each piece of jargon ---------------
 *  The same idiom as the board's tier-read popover, so it is not a new
 *  thing to learn. Definitions only — never a per-fixture reading, which
 *  could not be derived and would have to be written per card. */
const GLOSSARY: Record<string, string> = {
  "fee-inclusive edge":
    "The edge left AFTER the exchange fee is subtracted, using the exact "
    + "per-order rounding — not the headline edge. It is the only number "
    + "this project acts on, which is why a card with no ask cannot "
    + "produce one.",
  "T-10 lock":
    "A snapshot taken 10 minutes before kickoff. It is the canonical "
    + "frozen book: once taken, later price moves cannot rewrite what the "
    + "card claimed beforehand.",
  "price-native":
    "The live model reads strength from the market price itself. With no "
    + "book there is no price, so it has nothing to read — which is why it "
    + "refuses rather than falling back to a guess.",
  "de-vigged":
    "A book with the bookmaker's margin removed, so the three prices sum "
    + "to 100%. Only then can they be read as probabilities.",
  "Wilson band":
    "The range the true rate plausibly sits in given how few matches were "
    + "observed. A wide band means few matches — do not lean on the "
    + "headline number.",
  "shrunk":
    "Raw is what actually happened. Shrunk pulls that toward the league "
    + "average in proportion to how few matches it rests on, so a rate "
    + "from 25 matches moves a lot and one from 228 barely moves.",
  "clean_11v11":
    "Measured only on matches with eleven players a side throughout. A "
    + "sending-off changes the game so completely that those matches are "
    + "excluded rather than averaged in.",
};

function Gloss({ term, children }: { term: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const def = GLOSSARY[term];
  if (!def) return <>{children ?? term}</>;
  return (
    <span className="relative inline-block">
      <button type="button" data-testid="gloss" data-term={term}
        aria-expanded={open}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className="cursor-help border-b border-dotted border-skylive/70 bg-transparent p-0 text-inherit">
        {children ?? term}
      </button>
      {open && (
        <span data-testid="gloss-def"
          className="absolute left-0 top-[calc(100%+6px)] z-20 block w-64 rounded-lg border border-line-strong bg-elev2 p-3 text-[11px] font-normal normal-case leading-relaxed tracking-normal text-ink-mid shadow-xl">
          {def}
        </span>
      )}
    </span>
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
function ExecLegCell({ leg, label, side }: {
  leg?: ExecLeg; label: string; side: string;
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
      className="rounded-lg border border-line px-2.5 py-2">
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

function ExecutionOutcomeRow({ side, o }: {
  side: string; o?: ExecOutcome;
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
            <ExecLegCell leg={o?.cross} label="cross" side={side} />
            <ExecLegCell leg={o?.rest} label="rest" side={side} />
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

      {/* WHAT "CROSS" AND "REST" MEAN, once, as text — not six times as
          a tooltip. These are the backend's own route definitions
          (execution_view `routes`), and each is a paragraph: that a
          cross LIFTS THE ASK AND FILLS NOW at the full taker rate, and
          that a rest JOINS THE BEST BID AND WAITS at a quarter of it —
          and, in the rest's own last sentence, that IMPROVING on the
          bid costs more and is a different figure, not quoted here.

          They rode on a `title` attribute on each of the six cost
          cells until 2026-09-07. A tooltip is not in the accessible
          tree, does not exist on touch, and never reaches a copy of
          the page, so the two words this whole block compares were
          undefined for most readers while their definitions sat unread
          on the payload. Once, under the heading that governs all six
          cells, is where they belong. */}
      {(ex.routes?.cross || ex.routes?.rest) && (
        <div data-testid="exec-routes" className="space-y-1">
          {(["cross", "rest"] as const).map((k) => ex.routes?.[k] && (
            <p key={k} data-testid={`exec-route-${k}`}
              className="font-mono text-[9px] leading-relaxed text-ink-faint">
              {ex.routes[k]}
            </p>
          ))}
        </div>
      )}

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
        <ExecutionOutcomeRow key={k} side={k} o={ex.outcomes?.[k]} />
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

/* THE GATE'S VERDICT IS NOT A TWO-VALUED THING, and painting it as one
 * put GOLD on the words "WARNED — not an invitation".
 *
 * Floodlit's rule is that the accent is BRAND and never a verdict, and
 * HeadlineBlock a thousand lines up already knows it: it withholds the
 * accent from a WARNED number because "the accent colour, which the eye
 * reads as 'take this', is withheld and the warning outranks the
 * meaning". The fix held at the headline and the identical shape stood
 * one block over — `verdict === "REFUSED" ? warn : accent` gilded
 * EVERYTHING that was not the literal string "REFUSED", and the backend
 * emits exactly three (card.py: "REFUSED", "PLAYABLE", and
 * WARNED_VERDICT = "WARNED — not an invitation"). So on a warned card
 * the headline rendered amber and the fee gate rendered the same
 * finding in gold, on one payload, with "shadow · not advice" beside it
 * only because the string was not "REFUSED".
 *
 * THE GATE IS CLOSED BY CONSTRUCTION RATHER THAN BY LISTING WHAT IS
 * BAD. Exactly one token earns the accent; every other verdict — the
 * warned one, and any verdict this vocabulary gains after today —
 * lands in the refusal family, which is the safe direction to be wrong
 * in. An unrecognised value never folds into the GO class.
 */
const ACCENT_VERDICT = "PLAYABLE";

function verdictInk(verdict: string): "accent" | "warn" {
  return verdict.trim().toUpperCase() === ACCENT_VERDICT ? "accent" : "warn";
}

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
          <span data-testid="gate-verdict" data-ink={verdictInk(gate.verdict)}
            className={`uppercase tracking-wide ${
              verdictInk(gate.verdict) === "accent"
                ? "text-accent" : "text-warn"}`}>
            {gate.verdict}
          </span>
          <span className="ml-2 text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            shadow · not advice
          </span>
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
          what a null among them means. It is the rule the dashes below
          depend on — card.LIVE_STATE_BASIS ends "A NULL is the
          provider's silence and renders as unknown: MISSING IS NEVER
          ZERO" — so it renders as TEXT.

          It rode on a `title` attribute until 2026-09-07, under a
          comment saying the dashes "are only honest if it is readable
          somewhere". A title attribute is not somewhere: it is absent
          from the accessible tree, unreachable on touch, and gone from
          any copy of the page. The caveat that makes every dash in
          this block mean something cannot be the one thing a reader
          cannot get at. Same rule the tilt note four blocks down
          already follows — its note sits WITH its chip, not only in
          the tooltip — and the same rule the exposure honesty line
          follows. */}
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        match state · observed on the tape, not modelled
      </p>
      {/* the same closure one level down, at the level `window` was
          found hiding: a state key nobody declared is NAMED. */}
      <UnaccountedKeys o={st} declared={LIVE_STATE_DECLARED_KEYS}
        where="the live state" testid="live-state-unaccounted" />
      {/* THE WINDOWED READ IS REGISTERED, NOT DRAWN AND NOT DROPPED.
          card.py attaches it to every state; this surface has no
          recorded shape for it, and the cumulative counts above are
          the numbers it exists to keep from being read as the whole
          story. Named here, with its record, rather than quietly
          absent. */}
      {st.window !== undefined && (
        <p data-testid="live-window-registered"
          className="rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 font-mono text-[9px] leading-relaxed text-warn">
          this row carries a WINDOWED read — what accrued in the last
          few match-minutes — and this surface does not draw it. The
          counts above are cumulative over the whole match, which is a
          different fact. {UNRENDERED_PAYLOAD_FIELDS.window.closes_when}
        </p>
      )}
      {st.basis && (
        <p data-testid="live-state-basis"
          className="font-mono text-[9px] normal-case leading-relaxed tracking-normal text-ink-faint">
          {st.basis}
        </p>
      )}

      {hasKey(st, "possession") && (
        <div>
          {/* With both sides present the printed pair IS the bar's two
              shares, so it is a percentage by construction and wears
              the sign.

              WITH ONE SIDE MISSING IT IS NOT. The share is what makes
              this block "indifferent to whether the tape counts
              possession 0-100 or 0-1" (the comment above); the raw
              pair is not, and printing it with a `%` glued on decided
              the scale question this block deliberately declines to
              decide. A tape counting 0-1 renders 0.62 as "0.6%" — a
              wrong number in a unit this card cannot vouch for, next
              to a dash for the half that would have revealed the
              scale. So the unit goes on the DERIVED share only; the
              raw value prints at its own precision, exactly as the
              threat index one block down already does. */}
          <StatPair id="possession" label="possession"
            pair={share ?? pos}
            fmt={share
              ? (v) => (v == null ? "—" : `${v.toFixed(1)}%`)
              : liveIndex} />
          {!share && pos && (isNum(pos.home) !== isNum(pos.away)) && (
            <p data-testid="possession-unscaled"
              className="font-mono text-[9px] leading-relaxed text-ink-faint">
              one side only — with no second number there is no share to
              draw and no way to tell whether the tape counted this
              0-100 or 0-1, so it prints as it arrived and carries no
              unit. The missing half is not completed from 100 minus
              this one.
            </p>
          )}
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
        <div data-testid="live-stat-threat"
          className="flex flex-wrap items-baseline justify-between gap-x-3">
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

      {/* WHAT THE SHARE IS A SHARE OF, as text, immediately beneath the
          number it defines. `basis` is card.THREAT_DEFINITION — "the
          favourite's share of shots + on-target + corners", plus the
          fact that the favourite side is price-native off the de-vigged
          game book. The type's own comment says this definition is
          "carried on the payload and rendered, never retyped here"; it
          was carried and put in a `title`, which renders it to nobody.

          It sits OUTSIDE the `live-stat-threat` node on purpose. That
          subtree carries two standing pins from the em-dash incident —
          that it contains no em-dash, and no <p> — and both are about
          a REFUSAL or a dash standing where the number should be. This
          definition is neither, and quietly widening those pins to let
          prose in would blunt the guard that caught that bug. */}
      {hasKey(st, "threat") && !threatRefusal && threat?.basis && (
        <p data-testid="threat-basis"
          className="font-mono text-[9px] leading-relaxed text-ink-faint">
          {threat.basis}
        </p>
      )}

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
  // `basis` says what the age is measured FROM — it was a tooltip, and
  // a tooltip is not in the accessible tree. It reads as text beside
  // the number it qualifies, in the same normal-case ink the other
  // basis lines on this card use.
  return (
    <>
      <span data-testid="tick-age" className={late ? "text-warn" : undefined}>
        state captured {Math.round(age)}s ago
        {tick.interval_seconds != null
          && ` · collector interval ${tick.interval_seconds}s`}
        {late && " · a tick has not landed"}
      </span>
      {tick.basis && (
        <span data-testid="tick-basis"
          className="ml-1.5 normal-case tracking-normal text-ink-faint">
          {tick.basis}
        </span>
      )}
    </>
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
      {/* gate on the QUESTION, not the FACT — see the type above */}
      {(h.red_card_void?.withdraws || h.red_card_void?.void)
        && (h.red_card_void.withdrawal?.rule || h.red_card_void.rule) && (
        <p data-testid="red-card-void"
          className="mt-2 rounded-lg border border-warn/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-warn">
          {/* the withdrawal's own words when it has them: `because` says
              which witness, or which failure to consult one, withdrew
              these numbers. Neither is restated here. */}
          {h.red_card_void.withdrawal?.because
            ? `${h.red_card_void.withdrawal.because} `
            : ""}
          {h.red_card_void.withdrawal?.rule ?? h.red_card_void.rule}
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
  const p = l.p_win;
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
          {/* A MISSING MEMBER DRAWS NO SEGMENT. This read `?? 0`, which
              is the zero bar this file's own header forbids in so many
              words ("never a zero bar standing in for a missing
              forecast") and which the possession bar forty lines up
              already refuses to do — half a split is not a split. A
              drawn 0%-wide segment says "this outcome has no chance"
              while the number directly beneath it says "—", so the bar
              and the numbers told different stories about the same
              key.

              Not reachable from today's emitter: card.py builds the
              triple from row.p_home/p_draw/p_away in one dict and
              refuses the whole block when p_home is null, so it emits
              three or none. The TYPE permits a partial one, this
              render zero-filled it, and no test covered the case — so
              it is closed by construction rather than left resting on
              the emitter continuing to agree with us. */}
          <div data-testid="live-prob-bar"
            className="mt-1.5 flex h-2 overflow-hidden rounded-full border border-line">
            {LIVE_SIDES.filter((s) => isNum(p?.[s.key])).map((s) => (
              <div key={s.key} data-side={s.key} className={s.bar}
                style={{ width: `${p![s.key]! * 100}%` }} />
            ))}
          </div>
          {LIVE_SIDES.some((s) => !isNum(p?.[s.key])) && (
            <p data-testid="live-prob-incomplete"
              className="mt-1 font-mono text-[9px] leading-relaxed text-warn">
              the bar draws only the outcomes the tape row carried a
              number for — {LIVE_SIDES.filter((s) => !isNum(p?.[s.key]))
                .map((s) => s.key).join(", ")} carried none, so no
              segment stands in for it and the widths below do not sum
              to the whole.
            </p>
          )}
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

/* A KEY THE BACKEND SENDS THAT THIS FILE NEVER DECLARED.
 *
 * The register above is derived from this file's types against this
 * file's code, so it catches a field declared and dropped. It is blind
 * to the other direction, and that blindness has a name: `tape_history`
 * — the sentence saying a state-tape read FAILED — rode on
 * `inplay_plan` while this type had no such key, so nothing declared
 * it, nothing drew it, and nothing said it had arrived.
 *
 * This closes that direction for the in-play layer, which is the one
 * the hold/exit stage lives on. An unaccounted key is NAMED on the
 * surface rather than drawn (drawing a shape nobody recorded is how a
 * surface certifies a reader that cannot read the real payload) or
 * dropped (which is the bug this exists to end).
 */
function UnaccountedKeys({ o, declared, where, testid }: {
  o?: object | null; declared: readonly string[]; where: string;
  testid: string;
}) {
  if (o == null || typeof o !== "object") return null;
  const extra = Object.keys(o).filter((k) => !declared.includes(k));
  if (extra.length === 0) return null;
  return (
    <div data-testid={testid}>
      {extra.map((k) => (
        <p key={k} data-testid={`${testid}-key`} data-key={k}
          className="rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 font-mono text-[10px] leading-relaxed text-warn">
          {where} carries <span className="font-mono">{k}</span>, and this
          surface has no recorded shape for it — so it is named rather
          than drawn or dropped. Whatever finding it holds is NOT on this
          card.
        </p>
      ))}
    </div>
  );
}


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
      {/* A KEY NOBODY DECLARED IS NAMED, NOT DROPPED — see the
          component: the register above compares this file to itself and
          cannot see a key the backend adds. This compares the payload
          to the type, which is how `tape_history` should have been
          caught. */}
      <UnaccountedKeys o={p} declared={INPLAY_DECLARED_KEYS}
        where="the in-play layer" testid="inplay-unaccounted" />
      {/* THE READ FAILED, AND THAT IS NOT THE SAME FACT AS AN EMPTY
          TAPE. It goes FIRST and it is styled as a warning, because it
          governs every block beneath it: the withdrawals below say
          `tape_unreadable` in their own words, and this is the sentence
          that says why there was nothing to consult. A card whose read
          worked carries no such key and renders exactly as before. */}
      {p?.tape_history && (
        <p data-testid="tape-history-unreadable"
          className="rounded-lg border border-warn/40 px-3 py-2 font-mono text-[10px] leading-relaxed text-warn">
          {p.tape_history.consequence
            ?? "the state-tape history read FAILED and the payload "
              + "carried no sentence saying what that fails closed on — "
              + "this is a failed read, not an empty tape"}
        </p>
      )}
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
        <p className="mt-0.5 break-all">hash {resp.content_hash}</p>
      )}
      {/* WHAT THE HASH COVERS, as text. It was a tooltip; a hash whose
          scope is only in a tooltip is a number nobody can check,
          because "this card is hashed" and "this card is hashed EXCEPT
          the clock and the position that ride outside it" are
          different claims and only the second one is true. */}
      {e?.content_hash_basis && (
        <p data-testid="content-hash-basis" className="mt-0.5">
          {e.content_hash_basis}
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

            <CardState layers={layers} headline={card.headline} />

            {idRefusal ? <RefusalNote text={idRefusal} /> : id && (
              /* EVERY FIELD GETS A DASH WHEN IT IS ABSENT. This
                 interpolated six values raw between separators, so a
                 missing one closed up into "· ·" and the line ended
                 "venue class:" with nothing after the colon. That last
                 one is not hypothetical: venue_class is a REGISTERED
                 absence in the backend (card.CARD_ABSENCES, "the
                 venue-class read is not built on the live plane yet"),
                 so a label followed by white space is the normal
                 render — a named absence drawn as a blank, which is
                 the one thing this card is for. */
              <p data-testid="identity"
                className="font-mono text-[9px] leading-relaxed text-ink-faint">
                {[
                  `${(id as Identity).home ?? "—"} vs ${(id as Identity).away ?? "—"}`,
                  (id as Identity).kickoff_utc ?? "kickoff —",
                  (id as Identity).venue ?? "venue —",
                  (id as Identity).status ?? "status —",
                  `venue class: ${(id as Identity).venue_class
                    ?? "— (not on the payload)"}`,
                ].join(" · ")}
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

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
// Beneath that bar sits live_now.state: the counts the collector SAW
// (possession, shots, on target, corners, cards, a threat index, an
// exploratory tilt label). Observation, not model output, and labelled
// so on screen. Every field of it is optional — a stat that is not on
// the payload renders "—", never 0, and no bar is drawn from a number
// that is missing. A live_now with no state renders exactly what it
// rendered before this readout existed.
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

type MarketLayer = { source?: string; asks?: Record<string, number>;
  devig?: Record<string, number>;
  break_even_fee_inclusive?: Record<string, number>; fee_basis?: string };

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
  // a single index, or the collector's refusal in its own words
  threat?: number | { refused?: string; unavailable?: string } | null;
  // an EXPLORATORY split of the state, not a measured pattern — it
  // renders with its note, never as a settled finding
  tilt_label?: "SIEGE" | "STERILE_POSSESSION" | "CONTEST" | null;
  tilt_note?: string };

type LiveNow = { minute?: string | null; captured_at?: string | null;
  score?: string | null; p?: LiveTriple;
  lambdas?: { home?: number; away?: number } | null; basis?: string;
  state?: LiveState | null;
  refused?: string; unavailable?: string };

type InplayLayer = {
  live_now?: LiveNow;
  danger_windows?: { equalizer_hazard_peak?: Refusable<HazardPeak>;
    late_opener?: Refusable<Cell> };
  red_card_rule?: string; cash_out_ladder?: string;
  refused?: string; unavailable?: string };

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
  emission?: string; prediction_run_id?: string | null; card?: Card };

/* ---------- small helpers ---------- */

const signed4 = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(4)}`;
const pct1 = (v?: number) => (v == null ? "—" : `${v.toFixed(1)}%`);
const band = (lo?: number, hi?: number) =>
  lo == null || hi == null ? "" : `${lo.toFixed(1)}–${hi.toFixed(1)}`;
const cents = (v?: number) =>
  v == null || !Number.isFinite(v) ? "—" : `${Math.round(v * 100)}¢`;

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
      {mk.source && (
        <p className="mt-1 font-mono text-[9px] text-ink-faint">{mk.source}</p>
      )}
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
  const threat = st.threat;
  const threatRefusal = threat != null && typeof threat === "object"
    ? refusalOf(threat) : null;

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
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
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
        <div data-testid="live-stat-threat"
          className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            threat
          </span>
          <span className="font-mono text-[11px] tabular-nums text-ink-hi">
            {liveIndex(isNum(threat) ? threat : undefined)}
          </span>
        </div>
      ))}

      {(st.tilt_label != null || st.tilt_note != null) && (
        <div data-testid="live-tilt" className="pt-0.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              tilt · exploratory
            </span>
            {st.tilt_label && (
              <span data-testid="tilt-chip" title={st.tilt_note}
                className="rounded-md border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-mid">
                {st.tilt_label}
              </span>
            )}
          </div>
          {/* the note sits WITH the label, not only in a tooltip: a
              chip whose caveat is hidden reads as a settled split, and
              this one is not measured */}
          <p className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
            {st.tilt_note ?? "no note travelled with this label on the "
              + "payload — nothing is measured behind it here"}
          </p>
        </div>
      )}
    </div>
  );
}

function LiveNowBlock({ l, updatedAt, stale }: {
  l: LiveNow; updatedAt: string | null; stale: boolean;
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
      <p className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
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

function InplayBlock({ p, updatedAt, stale }: {
  p?: InplayLayer; updatedAt: string | null; stale: boolean;
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
        <LiveNowBlock l={p.live_now} updatedAt={updatedAt} stale={stale} />
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
  const alive = useRef(true);
  const held = useRef<CardResponse | null>(null);

  const load = useCallback(() =>
    fetch(`/api/card/${competition}/${eventId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: CardResponse) => {
        if (!alive.current) return;
        held.current = d;
        setResp(d); setErr(null); setStale(false);
        setUpdatedAt(stampUtc());
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
                stale={stale} />
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

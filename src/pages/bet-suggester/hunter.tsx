// Market Hunter panel — the read surface for the always-on OBSERVATIONAL
// scanner over Kalshi's soccer per-match books (backend branch
// feat-market-hunter, GET /api/hunter/findings). The panel presents
// observations with their full arithmetic and their denominators; it
// never recommends. Decision-safety invariants (tested in
// e2e/hunter-panel.spec.ts): no imperative order language anywhere,
// context findings labelled "context — not a win", MODEL_EDGE rows carry
// the API's qualifier verbatim (never synthesized), IN_PLAY_OVERREACTION
// carries its conditionality sentence, and a dead or degraded scanner
// reads as exactly that — the API's own heartbeat doc: age far above the
// poll cadence means the scanner is DEAD, not that the market is quiet.
//
// Two more, from the Codex review:
//   1. MODEL_EDGE is a MODEL DIAGNOSTIC, not a structural finding. The
//      structural three (SUM_BELOW_ONE / CROSSED_BOOK / POST_CERTAINTY)
//      are mechanically-true states net of exact fees; a model readout
//      whose standing result is not significant must never sit in that
//      list and inherit its authority. It gets its own class, its own
//      colour, and its qualifier is always attached.
//   2. The served page is NOT the record. findings_per_type is the API's
//      global total; it is rendered beside the list, and whenever fewer
//      rows were served than exist an explicit "showing N of M" line
//      says so. Completeness is never implied.
import Head from "next/head";
import { useEffect, useState } from "react";
import { Eyebrow } from "../../components/ui";
import {
  NavChip, RouteProgress, SkeletonRows, TopBar, useScrollSpy,
} from "../../components/chrome";

/* ---------- API contract (origin/feat-market-hunter) ---------- */

type Liquidity = {
  status?: string; reasons?: string[];
  sizes?: Record<string, string | null>;
  limiting_quantity?: string; note?: string; no_bid_size_basis?: string;
};
type SumLeg = { ticker?: string; yes_ask_dollars?: string | null;
  yes_ask_size?: string | null; fee_dollars?: string | null };
type CapturePoint = { captured_at?: string; yes_bid_dollars?: string;
  yes_ask_dollars?: string; mid_dollars?: string; spread_dollars?: string };
type Legs = {
  rule?: string; captured_at?: string;
  // SUM_BELOW_ONE
  legs?: SumLeg[]; sum_asks_dollars?: string; sum_fees_dollars?: string;
  payout_dollars?: string;
  // CROSSED_BOOK
  yes_bid_dollars?: string; no_bid_dollars?: string;
  fee_leg_yes_dollars?: string; fee_leg_no_dollars?: string;
  // POST_CERTAINTY
  kalshi_captured_at?: string; espn_captured_at?: string;
  espn_event_id?: string | number;
  final_score_home?: number | null; final_score_away?: number | null;
  certain_outcome?: string; yes_ask_dollars?: string; fee_dollars?: string;
  // WIDE_SPREAD / THIN_BOOK
  spread_dollars?: string; reasons?: string[];
  yes_bid_size?: string | null; yes_ask_size?: string | null;
  // IN_PLAY_OVERREACTION
  capture_pair?: { prev?: CapturePoint; now?: CapturePoint };
  mid_move_dollars?: string; in_play_basis?: string; conditionality?: string;
  // MODEL_EDGE
  outcome_key?: string; model_probability?: number;
  prediction_run_id?: number; model_approval_decision_id?: number | string;
  net_edge_dollars?: string;
  // shared
  net_margin_dollars?: string; liquidity?: Liquidity; fee_policy?: string;
};
type Qualifier = {
  edge_vs_baseline?: number | null; ci_low?: number | null;
  ci_high?: number | null; n_scored?: number | null; significant?: boolean;
  decision_id?: number | string | null; decision_content_hash?: string | null;
  note?: string;
};
type Finding = {
  id: number; competition_slug?: string | null; series: string;
  event_ticker?: string | null; market_ticker?: string | null;
  finding_type: string; is_context: boolean; context_note?: string | null;
  net_margin_dollars?: string | null; fee_policy_version?: string | null;
  legs?: Legs | null; model_qualifier?: Qualifier | null;
  first_captured_at?: string | null; last_seen_at?: string | null;
  observed_cycles?: number | null; detected_at?: string | null;
  persisted_at?: string | null; espn_captured_at?: string | null;
  status: string; expired_at?: string | null; alerted_at?: string | null;
  alert_results?: unknown;
};
type LastCycle = {
  status?: string; completed_at?: string | null; age_seconds?: number | null;
  series_scanned?: number | null; series_failed?: number | null;
  incomplete_series?: Record<string, { outcome?: string; detail?: string }> | null;
  markets_scanned?: number | null; roster_size?: number | null;
  active_series?: number | null; discovery_at?: string | null;
  discovery_error?: string | null; error?: string | null;
};
type Denoms = {
  cycles_run?: number;
  cycles_by_status?: { complete?: number; degraded?: number; failed?: number };
  markets_scanned_total?: number; last_cycle?: LastCycle | null;
  heartbeat_note?: string; roster_note?: string;
};
type Report = {
  ready: boolean; reason?: string; framing?: string; capture_clock?: string;
  fee_policy?: string; denominators?: Denoms;
  findings_per_type?: Record<string, { open?: number; expired?: number }>;
  findings_per_type_scope?: string;
  model_status?: Record<string, Qualifier | string>;
  findings?: Finding[];
};

/* ---------- constants ---------- */

// The API serves the last cycle's age but NOT the configured cadence.
// HUNTER_POLL_MINUTES defaults to 10 on the backend branch; that default
// is ASSUMED here and said out loud in the UI. If the backend ever
// serves the cadence, read it from the report instead.
const ASSUMED_CADENCE_S = 10 * 60;
const OVERDUE_FACTOR = 1.5;
const DEAD_FACTOR = 3;

const HUNTER_VARS = {
  "--accent": "#2fbf9b",
  "--accent-dim": "rgba(47,191,155,0.35)",
  "--accent-faint": "rgba(47,191,155,0.10)",
  "--accent-ambient": "rgba(47,191,155,0.07)",
} as React.CSSProperties;

const TYPE_ORDER = [
  "SUM_BELOW_ONE", "CROSSED_BOOK", "POST_CERTAINTY", "MODEL_EDGE",
  "WIDE_SPREAD", "THIN_BOOK", "IN_PLAY_OVERREACTION",
];

// The rows the API serves are ONE PAGE, not the record. Kept as a
// constant so the request and the copy that describes it cannot drift.
const FINDINGS_LIMIT = 200;

/* ---------- finding classes ---------- */

// Three different kinds of claim, and they must never share a visual
// class. STRUCTURAL is the backend's ALERTABLE set
// (origin/feat-market-hunter: ALERTABLE) — mechanically-true states net
// of exact fees. CONTEXT is the backend's CONTEXT_TYPES — observational
// flags, never wins. MODEL_EDGE is NEITHER: it is a readout of the
// shadow model, whose standing result is not statistically significant,
// so it gets its own class and never borrows structural authority by
// sitting in the same list.
const STRUCTURAL_TYPES = new Set([
  "SUM_BELOW_ONE", "CROSSED_BOOK", "POST_CERTAINTY",
]);
const CONTEXT_TYPES = new Set([
  "WIDE_SPREAD", "THIN_BOOK", "IN_PLAY_OVERREACTION",
]);
const MODEL_TYPES = new Set(["MODEL_EDGE"]);

type FindingClass = "structural" | "model" | "context" | "unclassified";

const CLASS_ORDER: FindingClass[] =
  ["structural", "model", "context", "unclassified"];

const CLASS_LABEL: Record<FindingClass, string> = {
  structural: "structural",
  model: "model diagnostic",
  context: "context — not a win",
  unclassified: "unclassified",
};

// compact form for tables and count strips
const CLASS_SHORT: Record<FindingClass, string> = {
  structural: "structural",
  model: "model readout",
  context: "context",
  unclassified: "unclassified",
};

function classOfType(t: string): FindingClass {
  if (MODEL_TYPES.has(t)) return "model";
  if (STRUCTURAL_TYPES.has(t)) return "structural";
  if (CONTEXT_TYPES.has(t)) return "context";
  // a type this panel does not know is never granted structural
  // standing — fail closed
  return "unclassified";
}

// The API's is_context flag may DEMOTE a row but can never promote one,
// and a model readout is a model readout whatever else is set on it.
function classOf(f: Finding): FindingClass {
  const byType = classOfType(f.finding_type);
  if (byType === "model") return "model";
  if (f.is_context) return "context";
  return byType;
}

/* ---------- served totals ---------- */

type PerType = NonNullable<Report["findings_per_type"]>;
type Totals = { open: number; expired: number; total: number };

// findings_per_type is the API's GLOBAL count (findings_per_type_scope
// says so). It is the only denominator we have for "how much is on
// record" versus the one page of rows we were served.
function totalsOf(perType: PerType | null | undefined,
                  keep?: (t: string) => boolean): Totals | null {
  if (!perType) return null;
  let open = 0;
  let expired = 0;
  for (const [t, v] of Object.entries(perType)) {
    if (keep && !keep(t)) continue;
    open += v?.open ?? 0;
    expired += v?.expired ?? 0;
  }
  return { open, expired, total: open + expired };
}

/* ---------- tiny formatters ---------- */

const usd = (v?: string | null) => (v == null ? "—" : `$${v}`);
const numOrDash = (v?: number | string | null) =>
  v == null ? "—" : String(v);

function fmtT(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function fmtAge(s: number): string {
  if (s < 0) s = 0;
  if (s < 90) return `${Math.floor(s)}s`;
  const m = Math.floor(s / 60);
  if (m < 90) return `${m}m ${Math.floor(s % 60)}s`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

function ageOf(iso: string | null | undefined, nowMs: number): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  return `${fmtAge((nowMs - t) / 1000)} ago`;
}

/* ---------- page ---------- */

type Phase = "loading" | "ok" | "not_deployed" | "unreachable" | "dormant";

export default function HunterPanel() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [report, setReport] = useState<Report | null>(null);
  const [dormantReason, setDormantReason] = useState<string>("");
  const [fetchedAt, setFetchedAt] = useState(0);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/hunter/findings?limit=${FINDINGS_LIMIT}`)
        .then(async (r) => {
          if (!alive) return;
          if (r.status === 404) { setPhase("not_deployed"); return; }
          if (!r.ok) { setPhase("unreachable"); return; }
          const d: Report = await r.json();
          if (!alive) return;
          if (d.ready === false) {
            setDormantReason(d.reason || "");
            setPhase("dormant");
            return;
          }
          setReport(d);
          setFetchedAt(Date.now());
          setPhase("ok");
        })
        .catch(() => alive && setPhase("unreachable"));
    load();
    const poll = setInterval(load, 60_000);
    const tick = setInterval(() => setNowMs(Date.now()), 1000);
    // Seed the clock on the next frame rather than synchronously in the
    // effect body (react-hooks/set-state-in-effect) — the same idiom
    // ui.tsx already uses. SSR must not depend on the viewer's clock
    // (AGENTS §5), so nowMs stays 0 until the client has painted once;
    // the heartbeat falls back to the API's own age_seconds until then.
    const seed = requestAnimationFrame(() => setNowMs(Date.now()));
    return () => {
      alive = false;
      cancelAnimationFrame(seed);
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  const activeSection = useScrollSpy(
    ["heartbeat", "denominators", "findings"], [phase]);

  const den = report?.denominators;
  const lc = den?.last_cycle ?? null;
  // server-reported age, advanced by the time elapsed since we fetched it
  const ageNow = lc?.age_seconds != null && fetchedAt > 0 && nowMs > 0
    ? lc.age_seconds + Math.max(0, (nowMs - fetchedAt) / 1000)
    : lc?.age_seconds ?? null;

  const findings = [...(report?.findings ?? [])].sort((a, b) => b.id - a.id);
  const grouped: Record<FindingClass, Finding[]> = {
    structural: [], model: [], context: [], unclassified: [],
  };
  for (const f of findings) grouped[classOf(f)].push(f);

  // what the API says is on record, versus the page of rows it served
  const perType = report?.findings_per_type ?? null;
  const served = totalsOf(perType);
  const shown = findings.length;

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid"
      style={HUNTER_VARS}>
      <Head><title>Market Hunter · namson.dev</title></Head>
      <RouteProgress />
      <TopBar back={{ href: "/bet-suggester", label: "board" }}
        title="TRIVELA · market hunter">
        <NavChip href="#heartbeat" active={activeSection === "heartbeat"}>
          Heartbeat</NavChip>
        <NavChip href="#denominators" active={activeSection === "denominators"}>
          Denominators</NavChip>
        <NavChip href="#findings" active={activeSection === "findings"}>
          Findings</NavChip>
      </TopBar>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-10">
        <header className="mb-10">
          <Eyebrow tone="accent" className="mb-3">
            kalshi soccer · observational scanner
          </Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-hi">
            Market Hunter
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-low">
            An always-on scan of Kalshi&apos;s soccer per-match books for
            structurally mispriced states. Every row is an observation with
            its full arithmetic attached — nothing here is advice, and no
            order path exists.
          </p>
        </header>

        {phase === "loading" && <SkeletonRows rows={6} />}

        {phase === "not_deployed" && (
          <EmptyShell tone="line" eyebrow="backend · 404">
            <p className="text-lg text-ink-hi">hunter not deployed</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-low">
              The backend answered 404 for <Mono>/api/hunter/findings</Mono>.
              The scanner ships on a separate backend branch; until that
              branch deploys there is nothing to show. This page re-checks
              every 60 seconds.
            </p>
          </EmptyShell>
        )}

        {phase === "unreachable" && (
          <EmptyShell tone="live" eyebrow="backend · unreachable">
            <p className="text-lg text-live">backend unreachable</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-low">
              The hunter API could not be reached. Whether the scanner is
              alive is UNKNOWN from here — this page re-checks every 60
              seconds.
            </p>
          </EmptyShell>
        )}

        {phase === "dormant" && (
          <EmptyShell tone="warn" eyebrow="live plane · dormant">
            <p className="text-lg text-warn">live plane dormant</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-low">
              The API answered but reports the live data plane is not
              running{dormantReason ? <> — <Mono>{dormantReason}</Mono></> : null}.
              No scan is happening.
            </p>
          </EmptyShell>
        )}

        {phase === "ok" && report && (
          <>
            <section id="heartbeat" className="mb-12">
              <Heartbeat den={den} lc={lc} ageNow={ageNow} />
            </section>

            <section id="denominators" className="mb-12">
              <Denominators report={report} lc={lc} />
            </section>

            <section id="findings" className="mb-12">
              <div className="mb-5 border-b border-line pb-3">
                <Eyebrow tone="accent" className="mb-2">
                  findings · episode history
                </Eyebrow>
                <h2 className="text-lg font-medium text-ink-hi">
                  {shown} finding{shown === 1 ? "" : "s"} shown
                  <span className="ml-2 text-sm font-normal text-ink-low">
                    · over {numOrDash(den?.cycles_run)} cycles
                    · {numOrDash(den?.markets_scanned_total)} markets scanned
                  </span>
                </h2>
              </div>

              <ServedTotals perType={perType} served={served} shown={shown} />

              {findings.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
                  {served != null && served.total > 0
                    ? <>no findings in this page — {served.total} on record, </>
                    : <>no findings on record — </>}
                  {numOrDash(den?.cycles_run)} cycles run,{" "}
                  {numOrDash(den?.markets_scanned_total)} markets scanned
                </p>
              ) : (
                <div className="mt-5 space-y-10">
                  <FindingGroup
                    cls="structural"
                    sub="mechanically defined, net of exact fees"
                    list={grouped.structural} perType={perType} nowMs={nowMs} />
                  <FindingGroup
                    cls="model"
                    sub="a readout of the shadow model — NOT a structural mispricing and not mechanically true. Every row carries the API's own qualifier verbatim; read the edge, its interval and its n before reading anything into it."
                    list={grouped.model} perType={perType} nowMs={nowMs} />
                  <FindingGroup
                    cls="context"
                    sub="liquidity and repricing context; observational flags, never wins"
                    list={grouped.context} perType={perType} nowMs={nowMs} />
                  {grouped.unclassified.length > 0 && (
                    <FindingGroup
                      cls="unclassified"
                      sub="a finding type this panel does not know — shown with its raw payload, never counted as structural"
                      list={grouped.unclassified} perType={perType} nowMs={nowMs} />
                  )}
                </div>
              )}
            </section>

            <footer className="border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
              {report.framing && <p>{report.framing}</p>}
              {report.capture_clock && <p className="mt-2">{report.capture_clock}</p>}
              {report.fee_policy && (
                <p className="mt-2">fee policy: {report.fee_policy}</p>
              )}
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------- shells + primitives ---------- */

function EmptyShell({ tone, eyebrow, children }: {
  tone: "line" | "live" | "warn"; eyebrow: string;
  children: React.ReactNode;
}) {
  const border = tone === "live" ? "border-live/40"
    : tone === "warn" ? "border-warn/40" : "border-line";
  return (
    <section className={`mx-auto max-w-2xl rounded-3xl border ${border} bg-elev px-6 py-14 text-center`}>
      <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
      {children}
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[0.92em]">{children}</span>;
}

function Row({ k, v, tone }: {
  k: string; v: React.ReactNode; tone?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 font-mono text-[11px]">
      <span className="shrink-0 text-ink-low">{k}</span>
      <span className={`min-w-0 break-all text-right tabular-nums ${tone ?? "text-ink-hi"}`}>
        {v}
      </span>
    </div>
  );
}

function Stat({ label, value, tone }: {
  label: string; value: React.ReactNode; tone?: string;
}) {
  return (
    <div className="rounded-xl border border-line px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
      <p className={`mt-1 font-mono text-lg tabular-nums ${tone ?? "text-ink-hi"}`}>
        {value}
      </p>
    </div>
  );
}

/* ---------- heartbeat ---------- */

type Pulse = "dead" | "overdue" | "alive" | "unknown";

function pulseOf(lc: LastCycle | null, ageNow: number | null): Pulse {
  if (!lc) return "dead";               // never completed a cycle
  if (ageNow == null) return "unknown"; // cycle row without a completion clock
  if (ageNow > DEAD_FACTOR * ASSUMED_CADENCE_S) return "dead";
  if (ageNow > OVERDUE_FACTOR * ASSUMED_CADENCE_S) return "overdue";
  return "alive";
}

function Heartbeat({ den, lc, ageNow }: {
  den?: Denoms; lc: LastCycle | null; ageNow: number | null;
}) {
  const pulse = pulseOf(lc, ageNow);
  const by = den?.cycles_by_status;
  const cadenceMin = ASSUMED_CADENCE_S / 60;
  return (
    <div>
      <Eyebrow tone="accent" className="mb-2">heartbeat</Eyebrow>
      <h2 className="mb-5 text-lg font-medium text-ink-hi">
        Scanner state
        <span className="ml-2 text-sm font-normal text-ink-low">
          · assumed cadence {cadenceMin}m (backend default; not served by the API)
        </span>
      </h2>

      {pulse === "dead" && (
        <div className="mb-5 rounded-xl border border-live/40 bg-live/5 p-4">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-live">
            scanner presumed dead
          </p>
          <p className="mt-2 text-sm text-ink-mid">
            {lc
              ? <>Last completed cycle {ageNow != null ? fmtAge(ageNow) : "an unknown time"} ago
                  — far above the assumed {cadenceMin}-minute cadence.</>
              : <>No hunter cycle is on record at all — the scanner has never
                  completed a pass.</>}
          </p>
          {den?.heartbeat_note && (
            <p className="mt-2 font-mono text-[11px] text-ink-low">
              API: {den.heartbeat_note}
            </p>
          )}
        </div>
      )}
      {pulse === "overdue" && (
        <div className="mb-5 rounded-xl border border-warn/40 bg-warn/5 p-4">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-warn">
            cycle overdue
          </p>
          <p className="mt-2 text-sm text-ink-mid">
            Last cycle {ageNow != null ? fmtAge(ageNow) : "—"} ago, beyond the
            assumed {cadenceMin}-minute cadence. If the age keeps climbing the
            scanner is dead, not the market quiet.
          </p>
        </div>
      )}
      {pulse === "unknown" && (
        <div className="mb-5 rounded-xl border border-warn/40 bg-warn/5 p-4">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-warn">
            heartbeat age unknown
          </p>
          <p className="mt-2 text-sm text-ink-mid">
            The last cycle row carries no completion clock — the scanner
            cannot be assumed alive.
          </p>
        </div>
      )}

      {lc && (lc.status === "degraded" || lc.status === "failed") && (
        <div className={`mb-5 rounded-xl border p-4 ${
          lc.status === "failed"
            ? "border-live/40 bg-live/5" : "border-warn/40 bg-warn/5"}`}>
          <p className={`font-mono text-sm uppercase tracking-[0.2em] ${
            lc.status === "failed" ? "text-live" : "text-warn"}`}>
            last cycle {lc.status}
          </p>
          <p className="mt-2 text-sm text-ink-mid">
            {lc.status === "failed"
              ? "The most recent pass failed — its scope must not be read as scanned."
              : "The most recent pass did not fully cover its scope — series it did not finish cannot be declared anomaly-free."}
          </p>
          {lc.error && (
            <p className="mt-2 break-all font-mono text-[11px] text-ink-low">
              error: {lc.error}
            </p>
          )}
          {lc.discovery_error && (
            <p className="mt-2 break-all font-mono text-[11px] text-ink-low">
              discovery: {lc.discovery_error}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="last cycle age"
          value={ageNow != null ? fmtAge(ageNow) : "—"}
          tone={pulse === "dead" ? "text-live"
            : pulse === "overdue" || pulse === "unknown" ? "text-warn"
            : "text-accent"} />
        <Stat label="last cycle status" value={lc?.status ?? "none"}
          tone={lc?.status === "complete" ? "text-accent"
            : lc?.status === "degraded" ? "text-warn"
            : "text-live"} />
        <Stat label="cycles complete" value={numOrDash(by?.complete)} />
        <Stat label="cycles degraded / failed"
          value={`${numOrDash(by?.degraded)} / ${numOrDash(by?.failed)}`}
          tone={(by?.failed ?? 0) > 0 ? "text-warn" : undefined} />
      </div>

      {lc && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="series scanned (last)"
            value={numOrDash(lc.series_scanned)} />
          <Stat label="series failed (last)"
            value={numOrDash(lc.series_failed)}
            tone={(lc.series_failed ?? 0) > 0 ? "text-warn" : undefined} />
          <Stat label="markets scanned (last)"
            value={numOrDash(lc.markets_scanned)} />
          <Stat label="roster · active"
            value={`${numOrDash(lc.roster_size)} · ${numOrDash(lc.active_series)}`} />
        </div>
      )}

      {pulse !== "dead" && den?.heartbeat_note && (
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-faint">
          API: {den.heartbeat_note}
        </p>
      )}
      {den?.roster_note && (
        <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-ink-faint">
          API: {den.roster_note}
        </p>
      )}
    </div>
  );
}

/* ---------- denominators ---------- */

function Denominators({ report, lc }: { report: Report; lc: LastCycle | null }) {
  const den = report.denominators;
  const perType = report.findings_per_type ?? {};
  const keys = [
    ...TYPE_ORDER.filter((k) => k in perType),
    ...Object.keys(perType).filter((k) => !TYPE_ORDER.includes(k)).sort(),
  ];
  const incomplete = lc?.incomplete_series ?? null;
  const incompleteKeys = incomplete ? Object.keys(incomplete).sort() : [];
  return (
    <div>
      <Eyebrow tone="accent" className="mb-2">denominators</Eyebrow>
      <h2 className="mb-5 text-lg font-medium text-ink-hi">
        What was looked at
        <span className="ml-2 text-sm font-normal text-ink-low">
          · a findings count means nothing without these
        </span>
      </h2>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="cycles run" value={numOrDash(den?.cycles_run)} />
        <Stat label="markets scanned (total)"
          value={numOrDash(den?.markets_scanned_total)} />
        <Stat label="last discovery" value={fmtT(lc?.discovery_at)} />
        <Stat label="last cycle completed" value={fmtT(lc?.completed_at)} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <p className="border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
          findings per type
          {report.findings_per_type_scope && (
            <span className="ml-2 normal-case tracking-normal text-ink-faint">
              · {report.findings_per_type_scope}
            </span>
          )}
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="font-mono text-[10px] uppercase text-ink-faint">
              <th className="px-3 py-1.5 text-left">type</th>
              <th className="px-2 py-1.5 text-left">class</th>
              <th className="px-2 py-1.5 text-right">open</th>
              <th className="px-3 py-1.5 text-right">expired</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k} className="border-t border-line/60"
                data-finding-class={classOfType(k)}>
                <td className="px-3 py-1.5 font-mono text-[11px] text-ink-hi">{k}</td>
                <td className={`px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${CLASS_HEAD[classOfType(k)]}`}>
                  {CLASS_SHORT[classOfType(k)]}
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-[11px] tabular-nums text-accent">
                  {perType[k]?.open ?? 0}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-[11px] tabular-nums text-ink-low">
                  {perType[k]?.expired ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {incompleteKeys.length > 0 && (
        <div className="mt-5 rounded-xl border border-warn/40 bg-warn/5 p-4">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-warn">
            incomplete series — last cycle
          </p>
          <p className="mt-2 text-sm text-ink-mid">
            These series were NOT fully scanned last cycle. &quot;Didn&apos;t
            look&quot; is never &quot;no anomaly&quot;.
          </p>
          <div className="mt-3 space-y-1.5">
            {incompleteKeys.map((t) => (
              <div key={t} className="font-mono text-[11px]">
                <span className="text-ink-hi">{t}</span>
                <span className="ml-2 text-warn">
                  {incomplete?.[t]?.outcome ?? "UNKNOWN"}
                </span>
                {incomplete?.[t]?.detail && (
                  <span className="ml-2 break-all text-ink-low">
                    — {incomplete[t].detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {report.model_status && (
        <div className="mt-5 rounded-xl border border-line p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
            per-competition model status
          </p>
          <div className="mt-3 space-y-3">
            {Object.entries(report.model_status).map(([comp, v]) => (
              <div key={comp}>
                <p className="font-mono text-[11px] text-ink-hi">{comp}</p>
                {typeof v === "string" ? (
                  <p className="mt-0.5 font-mono text-[11px] text-ink-low">{v}</p>
                ) : (
                  <div className="mt-1.5"><QualifierBlock q={v} /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- findings ---------- */

// The served totals strip: what the API says is on record, next to the
// rows it actually served. The panel must never present one page as the
// whole record (Codex review finding 2).
function ServedTotals({ perType, served, shown }: {
  perType: PerType | null; served: Totals | null; shown: number;
}) {
  const truncated = served != null && served.total > shown;
  const inconsistent = served != null && served.total < shown;
  return (
    <div data-testid="served-totals"
      className="rounded-2xl border border-line px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
        served totals · what is on record
      </p>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px]">
        <span className="text-ink-low">
          rows served{" "}
          <span className="tabular-nums text-ink-hi">{shown}</span>
        </span>
        <span className="text-ink-low">
          on record{" "}
          <span className="tabular-nums text-ink-hi">
            {served != null ? served.total : "unknown"}
          </span>
          {served != null && (
            <span className="ml-1">
              (open {served.open} · expired {served.expired})
            </span>
          )}
        </span>
        {perType != null && CLASS_ORDER.map((c) => {
          const t = totalsOf(perType, (k) => classOfType(k) === c);
          if (t == null || (t.total === 0 && c === "unclassified")) return null;
          return (
            <span key={c} className="text-ink-low">
              {CLASS_SHORT[c]}{" "}
              <span className="tabular-nums text-ink-hi">{t.total}</span>
              <span className="ml-1">
                (open {t.open} · expired {t.expired})
              </span>
            </span>
          );
        })}
      </div>

      {truncated && served != null && (
        <p className="mt-2.5 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-warn">
          showing {shown} of {served.total} findings on record — this list is
          the most recent page (limit {FINDINGS_LIMIT}) and is NOT the
          complete record.
        </p>
      )}
      {inconsistent && served != null && (
        <p className="mt-2.5 rounded-lg border border-live/40 bg-live/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-live">
          the served totals ({served.total}) are below the {shown} rows
          served — the totals disagree with the rows and cannot be read as a
          denominator.
        </p>
      )}
      {served == null && (
        <p className="mt-2.5 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-warn">
          the API served no per-type totals — how much is on record is
          UNKNOWN from here, and this list must not be read as the complete
          record.
        </p>
      )}
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
        totals are the API&apos;s global per-type counts; their scope
        sentence is quoted under denominators.
      </p>
    </div>
  );
}

const CLASS_HEAD: Record<FindingClass, string> = {
  structural: "text-ink-hi", model: "text-skylive",
  context: "text-ink-hi", unclassified: "text-warn",
};

const CLASS_WRAP: Record<FindingClass, string> = {
  structural: "",
  model: "rounded-2xl border border-skylive/40 bg-skylive/5 p-4",
  context: "",
  unclassified: "rounded-2xl border border-warn/40 bg-warn/5 p-4",
};

function FindingGroup({ cls, sub, list, perType, nowMs }: {
  cls: FindingClass; sub: string; list: Finding[];
  perType: PerType | null; nowMs: number;
}) {
  const t = totalsOf(perType, (k) => classOfType(k) === cls);
  return (
    <div data-finding-class={cls} className={CLASS_WRAP[cls]}>
      {cls === "model" && (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-skylive">
          model readout · not a structural finding
        </p>
      )}
      <h3 className={`mb-1 font-mono text-[12px] uppercase tracking-[0.2em] ${CLASS_HEAD[cls]}`}>
        {CLASS_LABEL[cls]}
        <span className="ml-2 font-sans text-[11px] normal-case tracking-normal text-ink-faint">
          · {list.length} shown
          {t != null && (
            <> · {t.total} on record (open {t.open} · expired {t.expired})</>
          )}
        </span>
      </h3>
      <p className="mb-4 text-xs text-ink-low">{sub}</p>
      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
          {t != null && t.total === 0 ? "none on record" : "none in this page"}
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((f) => (
            <FindingCard key={f.id} f={f} cls={cls} nowMs={nowMs} />
          ))}
        </div>
      )}
    </div>
  );
}

function liquidityUnknown(f: Finding): boolean {
  if (f.legs?.liquidity?.status === "liquidity_unknown") return true;
  return !!f.legs?.reasons?.some((r) => r.includes("liquidity_unknown"));
}

function Badge({ children, tone }: {
  children: React.ReactNode; tone: "accent" | "warn" | "low" | "live" | "sky";
}) {
  const cls = tone === "accent"
    ? "border-accent/50 bg-accent/10 text-accent"
    : tone === "warn" ? "border-warn/50 bg-warn/5 text-warn"
    : tone === "live" ? "border-live/50 bg-live/5 text-live"
    : tone === "sky" ? "border-skylive/50 bg-skylive/10 text-skylive"
    : "border-line text-ink-low";
  return (
    <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${cls}`}>
      {children}
    </span>
  );
}

const CLASS_BADGE: Record<FindingClass, "accent" | "sky" | "low" | "warn"> = {
  structural: "accent", model: "sky", context: "low", unclassified: "warn",
};

function FindingCard({ f, cls, nowMs }: {
  f: Finding; cls: FindingClass; nowMs: number;
}) {
  const expired = f.status !== "open";
  return (
    <article data-status={f.status} data-type={f.finding_type}
      data-finding-class={cls}
      className={`rounded-xl border p-4 transition-opacity ${
        expired ? "border-line/70 opacity-55" : "border-line"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={CLASS_BADGE[cls]}>{f.finding_type}</Badge>
        {cls === "model" && (
          <Badge tone="sky">model readout — not structural</Badge>
        )}
        {f.is_context && <Badge tone="low">context — not a win</Badge>}
        {liquidityUnknown(f) && <Badge tone="warn">liquidity_unknown</Badge>}
        <Badge tone={expired ? "low" : "accent"}>
          {expired ? "expired" : "open"}
        </Badge>
        <span className="ml-auto font-mono text-[11px] text-ink-faint">
          #{f.id}
        </span>
      </div>

      <p className="mt-2.5 font-mono text-[11px] text-ink-low">
        <span className="text-ink-hi">
          {f.competition_slug ?? f.series}
        </span>
        {f.competition_slug && <span className="ml-2">{f.series}</span>}
        {f.event_ticker && <span className="ml-2">{f.event_ticker}</span>}
        {f.market_ticker && (
          <span className="ml-2 text-ink-mid">{f.market_ticker}</span>
        )}
      </p>

      {f.context_note && (
        <p className="mt-1.5 font-mono text-[11px] text-warn">
          {f.context_note}
        </p>
      )}

      <div className="mt-3"><Arith f={f} /></div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line/60 pt-2.5 font-mono text-[10px] text-ink-faint">
        <span>
          captured {fmtT(f.first_captured_at)} · {ageOf(f.first_captured_at, nowMs)}
        </span>
        {f.observed_cycles != null && (
          <span>seen {f.observed_cycles}× · last {fmtT(f.last_seen_at)}</span>
        )}
        {f.detected_at && <span>detected {fmtT(f.detected_at)}</span>}
        {expired && f.expired_at && (
          <span>expired {fmtT(f.expired_at)}</span>
        )}
        {f.alerted_at && (
          <span className="text-warn">alert delivered {fmtT(f.alerted_at)}</span>
        )}
      </div>
    </article>
  );
}

/* ---------- per-type arithmetic ---------- */

function LiquidityBlock({ liq }: { liq?: Liquidity }) {
  if (!liq) return null;
  const sized = liq.status === "sized";
  return (
    <div className="mt-2 rounded-lg border border-line/70 bg-elev px-3 py-2">
      <Row k="liquidity" v={liq.status ?? "—"}
        tone={sized ? "text-accent" : "text-warn"} />
      {liq.limiting_quantity != null && (
        <Row k="limiting executable quantity"
          v={`${liq.limiting_quantity} contracts`} />
      )}
      {liq.sizes && Object.entries(liq.sizes).map(([k, v]) => (
        <Row key={k} k={k} v={v ?? "— (unknown)"}
          tone={v == null ? "text-warn" : undefined} />
      ))}
      {liq.reasons && liq.reasons.length > 0 && (
        <Row k="reasons" v={liq.reasons.join(", ")} tone="text-warn" />
      )}
      {liq.no_bid_size_basis && (
        <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
          no-side size basis: {liq.no_bid_size_basis}
        </p>
      )}
      {liq.note && (
        <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
          {liq.note}
        </p>
      )}
    </div>
  );
}

function QualifierBlock({ q }: { q?: Qualifier | null }) {
  if (!q) {
    return (
      <p className="rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 font-mono text-[11px] text-warn">
        model qualifier missing from the payload — this readout is not
        interpretable and no qualifier is synthesized here
      </p>
    );
  }
  return (
    <div className="rounded-lg border border-line/70 bg-elev px-3 py-2">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        model qualifier · served by the API, rendered verbatim
      </p>
      <Row k="edge_vs_baseline" v={numOrDash(q.edge_vs_baseline)} />
      <Row k="ci" v={`[${numOrDash(q.ci_low)}, ${numOrDash(q.ci_high)}]`} />
      <Row k="n_scored" v={numOrDash(q.n_scored)} />
      <Row k="significant"
        v={q.significant == null ? "— (not served)"
          : q.significant ? "true" : "false"}
        tone={q.significant === true ? undefined : "text-warn"} />
      <Row k="decision"
        v={`${numOrDash(q.decision_id)} · ${q.decision_content_hash ?? "—"}`} />
      {q.note && (
        <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-low">
          {q.note}
        </p>
      )}
    </div>
  );
}

// The significance sentence is DERIVED from the qualifier rendered
// immediately above it — never asserted from copy, and the
// interval-spans-zero clause only appears when those two numbers say so.
function SignificanceLine({ q }: { q?: Qualifier | null }) {
  if (!q) return null;   // QualifierBlock already states it is missing
  const spansZero = q.ci_low != null && q.ci_high != null
    && q.ci_low <= 0 && q.ci_high >= 0;
  if (q.significant === true) {
    return (
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-low">
        The served qualifier marks this model result significant. It is
        still a model readout, not a mechanically-true state.
      </p>
    );
  }
  if (q.significant === false) {
    return (
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-warn">
        The served qualifier marks this model result NOT statistically
        significant
        {spansZero && <> — the interval shown above spans zero</>}. A point
        estimate, never an established edge.
      </p>
    );
  }
  return (
    <p className="mt-2 font-mono text-[10px] leading-relaxed text-warn">
      The served qualifier carries no significance flag — significance is
      UNKNOWN here and is not assumed.
    </p>
  );
}

function Rule({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="mb-2 break-words font-mono text-[10px] leading-relaxed text-ink-faint">
      rule: {text}
    </p>
  );
}

function Arith({ f }: { f: Finding }) {
  const l = f.legs;
  if (!l) {
    return (
      <p className="font-mono text-[11px] text-warn">
        arithmetic missing from the payload — nothing is reconstructed here
      </p>
    );
  }
  switch (f.finding_type) {
    case "SUM_BELOW_ONE":
      return (
        <div>
          <Rule text={l.rule} />
          <div className="space-y-1">
            {(l.legs ?? []).map((leg, i) => (
              <div key={leg.ticker ?? i}
                className="flex flex-wrap items-baseline justify-between gap-x-4 font-mono text-[11px]">
                <span className="min-w-0 break-all text-ink-hi">{leg.ticker}</span>
                <span className="tabular-nums text-ink-mid">
                  yes_ask {usd(leg.yes_ask_dollars)} · fee {usd(leg.fee_dollars)} ·
                  size {leg.yes_ask_size ?? "— (unknown)"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 border-t border-line/60 pt-2">
            <Row k="sum(yes_ask)" v={usd(l.sum_asks_dollars)} />
            <Row k="sum(fees)" v={usd(l.sum_fees_dollars)} />
            <Row k="payout" v={usd(l.payout_dollars)} />
            <Row k="net margin / contract" v={usd(l.net_margin_dollars)}
              tone="text-accent" />
          </div>
          <LiquidityBlock liq={l.liquidity} />
        </div>
      );
    case "CROSSED_BOOK":
      return (
        <div>
          <Rule text={l.rule} />
          <Row k="yes_bid" v={usd(l.yes_bid_dollars)} />
          <Row k="no_bid" v={usd(l.no_bid_dollars)} />
          <Row k="fee — yes-side leg" v={usd(l.fee_leg_yes_dollars)} />
          <Row k="fee — no-side leg" v={usd(l.fee_leg_no_dollars)} />
          <Row k="net margin / contract" v={usd(l.net_margin_dollars)}
            tone="text-accent" />
          <LiquidityBlock liq={l.liquidity} />
        </div>
      );
    case "POST_CERTAINTY": {
      const hg = l.final_score_home, ag = l.final_score_away;
      // the outcome label must agree with the numbers beside it — derived
      // here from the same two numbers, never trusted as a composite
      const derived = hg != null && ag != null
        ? (hg > ag ? "home_win" : ag > hg ? "away_win" : "draw") : null;
      const mismatch = derived != null && l.certain_outcome != null
        && derived !== l.certain_outcome;
      return (
        <div>
          <Rule text={l.rule} />
          <Row k="ESPN final (home–away)"
            v={`${numOrDash(hg)}–${numOrDash(ag)}`} />
          {mismatch ? (
            <p className="my-1 rounded-md border border-live/40 bg-live/5 px-2 py-1 font-mono text-[10px] text-live">
              outcome field &quot;{l.certain_outcome}&quot; does not match the
              score numbers beside it — not rendered as fact
            </p>
          ) : (
            <Row k="certain outcome" v={l.certain_outcome ?? "—"} />
          )}
          <Row k="yes_ask (certain outcome)" v={usd(l.yes_ask_dollars)} />
          <Row k="fee" v={usd(l.fee_dollars)} />
          <Row k="net margin / contract" v={usd(l.net_margin_dollars)}
            tone="text-accent" />
          <Row k="kalshi captured" v={fmtT(l.kalshi_captured_at)} />
          <Row k="espn re-read" v={fmtT(l.espn_captured_at)} />
          <LiquidityBlock liq={l.liquidity} />
        </div>
      );
    }
    case "WIDE_SPREAD":
      return (
        <div>
          <Rule text={l.rule} />
          <Row k="yes_bid" v={usd(l.yes_bid_dollars)} />
          <Row k="yes_ask" v={usd(l.yes_ask_dollars)} />
          <Row k="spread" v={usd(l.spread_dollars)} tone="text-warn" />
        </div>
      );
    case "THIN_BOOK":
      return (
        <div>
          <Rule text={l.rule} />
          <Row k="yes_bid" v={usd(l.yes_bid_dollars)} />
          <Row k="yes_ask" v={usd(l.yes_ask_dollars)} />
          <Row k="yes_bid_size" v={l.yes_bid_size ?? "— (unknown)"}
            tone={l.yes_bid_size == null ? "text-warn" : undefined} />
          <Row k="yes_ask_size" v={l.yes_ask_size ?? "— (unknown)"}
            tone={l.yes_ask_size == null ? "text-warn" : undefined} />
          {l.reasons && (
            <Row k="reasons" v={l.reasons.join(", ")} tone="text-warn" />
          )}
        </div>
      );
    case "IN_PLAY_OVERREACTION": {
      const pair = l.capture_pair;
      return (
        <div>
          <Rule text={l.rule} />
          {pair && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(["prev", "now"] as const).map((k) => {
                const c = pair[k];
                if (!c) return null;
                return (
                  <div key={k} className="rounded-lg border border-line/70 px-3 py-2">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                      capture · {k}
                    </p>
                    <Row k="at (our clock)" v={fmtT(c.captured_at)} />
                    <Row k="yes_bid" v={usd(c.yes_bid_dollars)} />
                    <Row k="yes_ask" v={usd(c.yes_ask_dollars)} />
                    <Row k="mid" v={usd(c.mid_dollars)} />
                    <Row k="spread" v={usd(c.spread_dollars)} />
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-2">
            <Row k="mid move" v={usd(l.mid_move_dollars)} tone="text-warn" />
          </div>
          {l.in_play_basis && (
            <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-ink-faint">
              in-play basis: {l.in_play_basis}
            </p>
          )}
          {l.conditionality ? (
            <p className="mt-2 rounded-lg border border-line/70 bg-elev px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-low">
              {l.conditionality}
            </p>
          ) : (
            <p className="mt-2 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 font-mono text-[11px] text-warn">
              conditionality note missing from the payload — the conditioning
              match event must be treated as unobserved
            </p>
          )}
        </div>
      );
    }
    case "MODEL_EDGE":
      return (
        <div>
          <Rule text={l.rule} />
          <p className="mb-2 font-mono text-[10px] leading-relaxed text-skylive">
            model diagnostic — a readout of the shadow model against the
            book, not a mechanically-true structural state. The qualifier
            below is the API&apos;s own, and it is what this row means.
          </p>
          <Row k="outcome" v={l.outcome_key ?? "—"} />
          <Row k="model probability" v={numOrDash(l.model_probability)} />
          <Row k="yes_ask" v={usd(l.yes_ask_dollars)} />
          <Row k="fee" v={usd(l.fee_dollars)} />
          <Row k="net readout vs ask" v={usd(l.net_edge_dollars)}
            tone="text-skylive" />
          <Row k="prediction run" v={numOrDash(l.prediction_run_id)} />
          <Row k="approval decision"
            v={numOrDash(l.model_approval_decision_id)} />
          <div className="mt-2"><QualifierBlock q={f.model_qualifier} /></div>
          <SignificanceLine q={f.model_qualifier} />
        </div>
      );
    default:
      // an unknown type still shows its full arithmetic payload rather
      // than silently rendering nothing
      return (
        <div>
          <Rule text={l.rule} />
          <pre className="overflow-x-auto rounded-lg border border-line/70 bg-elev px-3 py-2 font-mono text-[10px] leading-relaxed text-ink-low">
            {JSON.stringify(l, null, 2)}
          </pre>
        </div>
      );
  }
}

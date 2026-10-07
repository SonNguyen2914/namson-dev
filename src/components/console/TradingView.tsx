// TRADING (redesign, 2026-10-07): what the trader considered on its newest
// tick and what it decided — a data grid with filters, search and sort, an
// inspector drawer for one market, the reasons nothing was placed (grouped,
// ranked, clickable), every competition as a row, and the in-play tab.
//
// THE CONTRACT IS UNCHANGED (lib/tradingConsole.ts reads it): a missing
// number is "—", never 0; an empty snapshot is explained by `emptyWhy`; a
// failed read is named. Our model's probability is UNVALIDATED and a
// placement is the trader's rule at work — not advice, not evidence of an
// edge.
//
// REFRESH NEVER MOVES THE OPERATOR: the filters, the search, the sort and
// the open inspector live above this view (ConsoleApp) and survive every
// read; a user sort holds its row order across refreshes (new rows append
// below) until "Re-sort" is pressed, so rows never jump under the cursor.
import { type KeyboardEvent, memo, useMemo, useRef, useState } from "react";
import {
  BADGES, BADGE_MEANING, BADGE_ORDER, type ReasonBar,
  decisionBadge, rankReasons, reasonsOfKinds, rowReasonWords, rowReasons, rowTag,
} from "../../lib/consoleModel";
import {
  BOUND_REASONS, type Candidate, type Candidates, type Pair,
  anchorWords, cents, compLabel, coverage, decisionWords, emptyWhy, isObj, pct,
  scopeSource, signedCents,
} from "../../lib/tradingConsole";
import { familyWords } from "../../lib/tradingLedger";
import { InPlayPanel } from "./InPlayPanel";
import {
  CTRL, DASH, DecisionBadge, Drawer, DrawerSection, EmptyNote, ErrorNote,
  FilterButton, Freshness, Info, InfoNote, KV, Panel, TH, Tech, ago, when, whenShort,
} from "./primitives";
import type { Source } from "./useConsoleData";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);

// ------------------------------------------------------------- filters

export interface CandFilters {
  comp: string; decision: string; reason: string; family: string;
  phase: string; kickoff: string; edgeMin: string; q: string;
  sort: string; dir: "asc" | "desc";
}
export const NO_CAND_FILTERS: CandFilters = {
  comp: "", decision: "", reason: "", family: "", phase: "", kickoff: "",
  edgeMin: "", q: "", sort: "", dir: "desc",
};
const FILTER_KEYS = ["comp", "decision", "reason", "family", "phase", "kickoff", "edgeMin", "q"] as const;

export function candFiltersFrom(p: Record<string, string>): CandFilters {
  return { ...NO_CAND_FILTERS, comp: p.comp ?? "", decision: p.decision ?? "",
    reason: p.reason ?? "", family: p.family ?? "", phase: p.phase ?? "",
    kickoff: p.kickoff ?? "", edgeMin: p.edge ?? "", q: p.q ?? "",
    sort: p.sort ?? "", dir: p.dir === "asc" ? "asc" : "desc" };
}
export function candParams(f: CandFilters): Record<string, string> {
  const o: Record<string, string> = {};
  if (f.comp) o.comp = f.comp;
  if (f.decision) o.decision = f.decision;
  if (f.reason) o.reason = f.reason;
  if (f.family) o.family = f.family;
  if (f.phase) o.phase = f.phase;
  if (f.kickoff) o.kickoff = f.kickoff;
  if (f.edgeMin) o.edge = f.edgeMin;
  if (f.q) o.q = f.q;
  if (f.sort) { o.sort = f.sort; o.dir = f.dir; }
  return o;
}

const isInPlay = (r: Candidate) => r.minute !== null || r.inplay !== null || r.phase === "in_play";
/** the side the trader looked at, else the side with the larger edge */
function bestEdge(r: Candidate): { side: "yes" | "no" | null; edge: number | null } {
  if (r.side_considered === "yes") return { side: "yes", edge: r.edge_yes };
  if (r.side_considered === "no") return { side: "no", edge: r.edge_no };
  if (r.edge_yes === null && r.edge_no === null) return { side: null, edge: null };
  if (r.edge_no === null || (r.edge_yes !== null && r.edge_yes >= r.edge_no)) return { side: "yes", edge: r.edge_yes };
  return { side: "no", edge: r.edge_no };
}
const minutesTo = (r: Candidate, now: number) => {
  if (!r.kickoff_utc) return null;
  const t = Date.parse(r.kickoff_utc);
  return Number.isFinite(t) ? (t - now) / 60_000 : null;
};

function applyFilters(rows: Candidate[], f: CandFilters, now: number, ignore?: keyof CandFilters): Candidate[] {
  const q = f.q.trim().toLowerCase();
  const em = f.edgeMin.trim() === "" ? null : Number(f.edgeMin);
  return rows.filter((r) => {
    if (ignore !== "comp" && f.comp && (r.competition ?? "") !== f.comp) return false;
    if (ignore !== "decision" && f.decision && decisionBadge(r.decision).key !== f.decision) return false;
    if (ignore !== "reason" && f.reason && (r.decision.reason ?? "") !== f.reason) return false;
    if (f.family && (r.family ?? "") !== f.family) return false;
    if (f.phase === "pre" && isInPlay(r)) return false;
    if (f.phase === "in" && !isInPlay(r)) return false;
    if (f.kickoff) {
      const m = minutesTo(r, now);
      if (f.kickoff === "inplay" && !isInPlay(r)) return false;
      if (f.kickoff !== "inplay" && (m === null || m < 0 || m > Number(f.kickoff))) return false;
    }
    if (em !== null && Number.isFinite(em)) {
      const e = bestEdge(r).edge;
      if (e === null || e < em) return false;
    }
    if (q) {
      const hay = `${r.title} ${r.ticker} ${r.competition ?? ""} ${compLabel(r.competition)} ${r.decision.reason ?? ""} ${r.family ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// --------------------------------------------------------------- sort

type SortKey = "kickoff" | "model" | "consensus" | "fair" | "edge" | "decision" | "market";
const sortVal = (r: Candidate, k: string, now: number): number | string | null => {
  switch (k) {
    case "kickoff": return r.minute !== null ? -1000 + r.minute : minutesTo(r, now);
    case "model": return r.p_model;
    case "consensus": return r.p_consensus;
    case "fair": return r.fair;
    case "edge": return bestEdge(r).edge;
    case "decision": return BADGE_ORDER.indexOf(decisionBadge(r.decision).key);
    case "market": return r.title.toLowerCase();
    default: return null;
  }
};
function sortRows(rows: Candidate[], k: string, dir: "asc" | "desc", now: number): Candidate[] {
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = sortVal(a, k, now), y = sortVal(b, k, now);
    if (x === null && y === null) return a.ticker.localeCompare(b.ticker);
    if (x === null) return 1;
    if (y === null) return -1;
    if (x < y) return -1 * m;
    if (x > y) return 1 * m;
    return a.ticker.localeCompare(b.ticker);
  });
}

// ------------------------------------------------------------ cells

/** one dense grid cell: never wraps, top-aligned */
const CELL = "whitespace-nowrap border-b border-tc-line px-2.5 py-1 align-top";

const fixed = (n: number | null, d = 2) => (n === null ? DASH : n.toFixed(d));
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}`;
function pair(p: Pair): string {
  if (p === null) return DASH;
  return "one" in p ? signed(p.one) : `home ${signed(p.home)} · away ${signed(p.away)}`;
}

function Kickoff({ r }: { r: Candidate }) {
  if (r.minute !== null) return <span className="text-live">in play {r.minute}&prime;</span>;
  if (isInPlay(r)) return <span className="text-live">in play</span>;
  return <span className="text-ink-mid" title={when(r.kickoff_utc)}>{whenShort(r.kickoff_utc)}</span>;
}

const CandRow = memo(function CandRow({ r, selected, onOpen, onKey }: {
  r: Candidate; selected: boolean; onOpen: (t: string) => void;
  onKey: (e: KeyboardEvent<HTMLTableRowElement>, t: string) => void;
}) {
  const b = decisionBadge(r.decision);
  const be = bestEdge(r);
  const clears = be.edge !== null && r.threshold !== null && be.edge >= r.threshold;
  const SIDE = r.side_considered ? r.side_considered.toUpperCase() : null;
  const d = r.decision;
  const w = decisionWords(d);
  return (
    <tr data-testid="cand-row" data-ticker={r.ticker} data-decision={d.action} data-badge={b.key}
      data-competition={r.competition ?? ""} data-selected={selected || undefined}
      tabIndex={0} aria-selected={selected}
      onClick={() => onOpen(r.ticker)} onKeyDown={(e) => onKey(e, r.ticker)}
      className={`cursor-pointer outline-none transition-colors hover:bg-tc-hover focus-visible:bg-tc-hover focus-visible:shadow-[inset_2px_0_0_var(--accent)] ${
        selected ? "bg-tc-raised shadow-[inset_2px_0_0_var(--accent)]" : ""}`}>
      <td className={`${CELL} max-w-[340px] pl-4`}>
        <span className="block truncate text-[12.5px] leading-snug text-ink-hi" title={`${r.title} · ${r.family ? familyWords(r.family) : "type not stated"}`}>{r.title}</span>
        <Tech className="block truncate" title={r.ticker}>{r.ticker}</Tech>
      </td>
      <td className={CELL}>
        <span className="flex flex-col items-start gap-0.5">
          <DecisionBadge badge={b} side={SIDE} />
          {d.action === "placed" && (
            <span data-testid="cand-placed-chip" className="tc-num whitespace-nowrap text-[11px] text-ink-hi">
              {SIDE ?? "side not stated"} · {d.count === null ? DASH : d.count} @ {cents(d.price_cents)}
            </span>
          )}
        </span>
      </td>
      <td className={`${CELL} max-w-[200px]`}>
        <span data-testid="cand-reason-tag" data-code={d.reason ?? ""}
          title={`${d.action === "placed" ? (d.words ?? "placed") : w.text}${d.reason ? ` (${d.reason})` : ""}`}
          className="block truncate text-[12px] text-ink-mid">
          {d.action === "placed" ? DASH : rowTag(d)}
        </span>
      </td>
      <td className={`${CELL} max-w-[150px] truncate text-[12.5px] text-ink-mid`} title={compLabel(r.competition)}>{compLabel(r.competition)}</td>
      <td className={`${CELL} tc-num text-[12.5px]`}><Kickoff r={r} /></td>
      <td className={`${CELL} tc-num text-right text-[12.5px] text-ink-mid`}>{pct(r.p_model)}</td>
      <td className={`${CELL} tc-num text-right text-[12.5px] text-ink-mid`}>{pct(r.p_consensus)}</td>
      <td className={`${CELL} tc-num text-right text-[12.5px] text-ink-hi`}>{pct(r.fair)}</td>
      <td className={`${CELL} tc-num text-right text-[12.5px] text-ink-mid`}>
        {cents(r.yes_bid)}<span className="text-ink-faint"> / </span>{cents(r.yes_ask)}
      </td>
      <td className={`${CELL} tc-num pr-4 text-right text-[12.5px]`}>
        <span data-testid="cand-best-edge" data-clears={clears || undefined}
          className={clears ? "font-semibold text-ink-hi" : "text-ink-low"}>
          {signedCents(be.edge)}
        </span>
        <span className="block text-[11px] text-ink-low" title="the side considered (else the larger) · the minimum edge (bar)">
          {be.side ? be.side.toUpperCase() : DASH} · ≥{cents(r.threshold)}
        </span>
      </td>
    </tr>
  );
});

// ------------------------------------------------------------ inspector

function InPlayDetail({ r }: { r: Candidate }) {
  const ip = r.inplay;
  if (!ip) return <KV k="in play">pre-match — no in-play reads on this row</KV>;
  const hot: string[] = [];
  if (ip.hot === true) hot.push("HOT");
  if (ip.hot_yes === true) hot.push("HOT against YES");
  if (ip.hot_no === true) hot.push("HOT against NO");
  const danger = ip.danger_yes !== null || ip.danger_no !== null
    ? `YES ${pct(ip.danger_yes)} · NO ${pct(ip.danger_no)}` : pct(ip.danger);
  return (
    <>
      <KV k="minute · period">{ip.minute ?? DASH}′ · {ip.period ?? DASH}</KV>
      {hot.length > 0 && (
        <KV k="hot">
          {hot.map((h) => (
            <span key={h} data-testid="cand-hot" className="mr-1 inline-block rounded-[4px] border border-warn/50 px-1.5 text-[11px] font-medium text-warn">{h}</span>
          ))}
        </KV>
      )}
      {ip.mode && <KV k="mode">mode {ip.mode}</KV>}
      <KV k="momentum">momentum {pair(ip.momentum)}</KV>
      <KV k="last-15 xG">xG15 {pair(ip.xg15)}</KV>
      <KV k="danger">danger {danger}</KV>
      {(ip.p_engine !== null || ip.p_informed !== null) && (
        <KV k="engine · live-stat">engine {pct(ip.p_engine)} · live-stat {pct(ip.p_informed)}</KV>
      )}
      {ip.anchor && (
        <KV k="anchor"><span data-testid="cand-anchor">{anchorWords(ip.anchor)}{ip.anchor.why ? ` (${ip.anchor.why})` : ""}</span>
          {" "}<Info label="the anchor">What the in-play engine number started from: w on our pre-match forecast, the rest the market&apos;s T-10 price (unvalidated).</Info></KV>
      )}
    </>
  );
}

function CandidateInspector({ r, c, gone, actionsMeaning }: {
  r: Candidate; c: Candidates; gone: boolean; actionsMeaning: Record<string, string>;
}) {
  const b = decisionBadge(r.decision);
  const d = r.decision;
  const w = decisionWords(d);
  const clearsYes = r.edge_yes !== null && r.threshold !== null && r.edge_yes >= r.threshold;
  const clearsNo = r.edge_no !== null && r.threshold !== null && r.edge_no >= r.threshold;
  return (
    <div data-testid="cand-inspector" data-ticker={r.ticker}>
      {gone && (
        <p className="mb-4 rounded-md border border-warn/40 px-3 py-2 text-[12.5px] text-warn">
          ◆ This market is not in the newest snapshot — what you see is the last read that held it.
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DecisionBadge testid="insp-badge" badge={b} side={r.side_considered?.toUpperCase()} />
        <span className="text-[12.5px] text-ink-mid">{d.action === "placed" ? (d.words ?? "placed") : w.text}</span>
      </div>
      <DrawerSection title="Decision">
        <KV k="decision">{b.label}{d.side ? ` · ${d.side.toUpperCase()}` : ""}</KV>
        {d.action === "placed" && <KV k="order">{(r.side_considered ?? d.side ?? "side not stated").toUpperCase()} · {d.count ?? DASH} @ {cents(d.price_cents)}</KV>}
        <KV k="reason" testid="insp-reason">{w.text}{d.reason ? <Tech className="block" tone="text-ink-mid">{d.reason}</Tech> : null}{!w.sentWords && d.reason ? <span className="block text-[11px] text-ink-low">words from the console&apos;s mirror of the backend registry</span> : null}</KV>
        {d.detail && <KV k="detail">{d.detail}</KV>}
        <KV k="what the action means">{actionsMeaning[d.action] ?? BADGE_MEANING[b.key] ?? DASH}</KV>
      </DrawerSection>
      <DrawerSection title="Market">
        <KV k="market">{r.title}</KV>
        <KV k="competition">{compLabel(r.competition)}</KV>
        <KV k="family">{r.family ? `${familyWords(r.family)} (${r.family})` : "not stated"}</KV>
        <KV k="phase">{isInPlay(r) ? "in play" : "pre-match"}{r.minute !== null ? ` · ${r.minute}′` : ""}</KV>
        <KV k="kickoff">{when(r.kickoff_utc)}</KV>
        <KV k="side considered">{r.side_considered ? r.side_considered.toUpperCase() : "not stated"}</KV>
      </DrawerSection>
      <DrawerSection title="Probabilities (YES side)">
        <KV k="our model (unvalidated)">{pct(r.p_model)}</KV>
        <KV k="bookmaker consensus">{pct(r.p_consensus)}</KV>
        <KV k="blend weight w">{fixed(r.w)} <span className="text-[11px] text-ink-low">on our model</span></KV>
        <KV k="fair">{pct(r.fair)}{r.fair_method ? ` · ${r.fair_method}` : ""}</KV>
      </DrawerSection>
      <DrawerSection title="Kalshi book (cents)">
        <KV k="YES bid / ask">{cents(r.yes_bid)} / {cents(r.yes_ask)} <span className="text-ink-low">· maker {cents(r.maker_yes)}</span></KV>
        <KV k="NO bid / ask">{cents(r.no_bid)} / {cents(r.no_ask)} <span className="text-ink-low">· maker {cents(r.maker_no)}</span></KV>
      </DrawerSection>
      <DrawerSection title="Edge after maker fee (estimate)">
        <KV k="edge YES"><span data-testid="cand-edge-yes" data-clears={clearsYes || undefined} className={clearsYes ? "font-semibold" : ""}>{signedCents(r.edge_yes)}</span>{r.edge_basis === "ask" && r.edge_yes !== null ? " at the ask" : ""}</KV>
        <KV k="edge NO"><span data-testid="cand-edge-no" data-clears={clearsNo || undefined} className={clearsNo ? "font-semibold" : ""}>{signedCents(r.edge_no)}</span>{r.edge_basis === "ask" && r.edge_no !== null ? " at the ask" : ""}</KV>
        <KV k="minimum edge (bar)">{cents(r.threshold)}</KV>
        <KV k="clears the bar">{clearsYes || clearsNo ? `yes — ${[clearsYes ? "YES" : null, clearsNo ? "NO" : null].filter(Boolean).join(" and ")}` : r.threshold === null ? "bar not sent" : "no"}</KV>
      </DrawerSection>
      <DrawerSection title="In play">
        <InPlayDetail r={r} />
      </DrawerSection>
      <DrawerSection title="Careful strategy">
        {r.careful ? (
          <div data-testid="cand-careful">
            <KV k="confidence score">{r.careful.score === null ? DASH : `${r.careful.score}/5`}</KV>
            <KV k="size">{r.careful.size === null ? DASH : r.careful.size > 0 ? `$${r.careful.size} (worst case)` : "paper"}</KV>
            <KV k="ground">{r.careful.ground ?? DASH}</KV>
            {r.careful.data_error && <KV k="data check"><span className="text-warn">◆ edge above the ceiling: probable data error, never bet</span></KV>}
          </div>
        ) : <KV k="careful">not judged by the careful strategy on this row</KV>}
      </DrawerSection>
      <DrawerSection title="Technical details">
        <KV k="ticker"><Tech>{r.ticker}</Tech></KV>
        <KV k="action"><Tech>{d.action}</Tech></KV>
        <KV k="reason code"><Tech>{d.reason ?? "none sent"}</Tech></KV>
        <KV k="edge basis"><Tech>{r.edge_basis ?? "not sent"}</Tech></KV>
        <KV k="fair method"><Tech>{r.fair_method ?? "not sent"}</Tech></KV>
        <KV k="snapshot"><Tech>{c.version ?? "version not stated"} · tick {c.tick_at ?? DASH}</Tech></KV>
      </DrawerSection>
    </div>
  );
}

// --------------------------------------------------------- why not placed

function WhyNotPlaced({ rows, today, compLabelText, onReason, activeReason }: {
  rows: Candidate[]; today: Record<string, number> | null; compLabelText: string | null;
  onReason: (code: string) => void; activeReason: string;
}) {
  const [src, setSrc] = useState<"tick" | "today">("tick");
  const bars: ReasonBar[] = src === "tick" ? rankReasons([rowReasons(rows)], rowReasonWords(rows))
    : rankReasons([today]);
  const total = bars.reduce((s, b) => s + b.n, 0);
  const max = Math.max(1, bars[0]?.n ?? 1);
  return (
    <Panel testid="ops-why" title="Why not placed"
      info={<>
        {src === "tick" ? "The newest tick's not-placed markets, ranked by reason. Click a reason to filter the candidates to it."
          : "Today's journaled skips and refusals, ranked by reason."}
        {bars.map((b) => (
          <span key={b.code} className="mt-1 block"><span className="text-ink-hi">{b.tag}</span> — {b.words} <span className="font-mono text-[10.5px]">{b.code}</span> · {Math.round(b.share * 100)}%</span>
        ))}
      </>}
      meta={<span className="tc-num">{src === "tick" ? `${total} markets${compLabelText ? ` · ${compLabelText}` : ""}` : `${total.toLocaleString("en-US")} rows today`}</span>}
      actions={
        <div className="flex gap-1" role="group" aria-label="reason source">
          <FilterButton pressed={src === "tick"} onClick={() => setSrc("tick")}>Tick</FilterButton>
          <FilterButton pressed={src === "today"} onClick={() => setSrc("today")}>Today</FilterButton>
        </div>}>
      {bars.length === 0 ? (
        <InfoNote>{src === "tick" ? "Nothing unplaced" : today === null ? "Not served" : "None today"}</InfoNote>
      ) : (
        <ol data-testid="cand-why" className="-mx-1">
          {bars.map((b) => {
            const inner = (
              <>
                <span className={`min-w-0 truncate text-left text-[12.5px] ${activeReason === b.code ? "text-accent" : "text-ink-hi"}`}>{b.tag}</span>
                <span aria-hidden className="relative h-1.5 rounded-full bg-tc-raised">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-ink-mid/60" style={{ width: `${(b.n / max) * 100}%` }} />
                </span>
                <span className="tc-num text-right text-[12.5px] text-ink-hi">{b.n.toLocaleString("en-US")}</span>
              </>
            );
            const cls = "grid w-full grid-cols-[minmax(0,11rem)_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md px-1 py-[3px]";
            const title = `${b.words} (${b.code}) · ${Math.round(b.share * 100)}%`;
            return (
              <li key={b.code} data-testid="why-bar" data-code={b.code} title={title}>
                {src === "tick" ? (
                  <button type="button" onClick={() => onReason(b.code)} aria-label={`${b.tag}: ${b.n} — filter the candidates to it`}
                    className={`${cls} outline-none transition-colors hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent`}>{inner}</button>
                ) : <div className={cls}>{inner}</div>}
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

// -------------------------------------------------------------- view

export function TradingView({ d, now, source, filters, setFilters, selected, setSelected, tab, setTab }: {
  d: Obj; now: number; source: Source<Candidates>;
  filters: CandFilters; setFilters: (f: CandFilters | ((f: CandFilters) => CandFilters)) => void;
  selected: string | null; setSelected: (t: string | null) => void;
  tab: "candidates" | "inplay"; setTab: (t: "candidates" | "inplay") => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-1" role="tablist" aria-label="trading views">
        {(["candidates", "inplay"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} data-testid={`trading-tab-${t}`}
            onClick={() => setTab(t)}
            className={`h-8 rounded-md px-3 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              tab === t ? "bg-tc-raised font-medium text-ink-hi" : "text-ink-mid hover:text-ink-hi"}`}>
            {t === "candidates" ? "Candidates" : "In play"}
          </button>
        ))}
      </div>
      {tab === "candidates"
        ? <CandidatesSection d={d} now={now} source={source} filters={filters} setFilters={setFilters}
            selected={selected} setSelected={setSelected} />
        : <InPlayPanel d={d} now={now} candidates={source.last?.data ?? null} />}
    </div>
  );
}

function CandidatesSection({ d, now, source, filters: f, setFilters, selected, setSelected }: {
  d: Obj; now: number; source: Source<Candidates>;
  filters: CandFilters; setFilters: (f: CandFilters | ((f: CandFilters) => CandFilters)) => void;
  selected: string | null; setSelected: (t: string | null) => void;
}) {
  const read = source.read;
  const c = source.last?.data ?? null;
  const at = source.last?.at ?? null;
  const stale = at !== null && (read.kind !== "ok" || now - at > 3 * source.cadenceMs);
  const set = (k: keyof CandFilters, v: string) => setFilters((x) => ({ ...x, [k]: v }));
  // the minute grain is enough for kickoff windows; keeps the memo stable
  const minute = Math.floor(now / 60_000) * 60_000;

  const cov = useMemo(() => (c ? coverage(c) : []), [c]);
  const filtered = useMemo(() => (c ? applyFilters(c.rows, f, minute) : []), [c, f, minute]);
  const inComp = useMemo(() => (c ? c.rows.filter((r) => !f.comp || (r.competition ?? "") === f.comp) : []), [c, f.comp]);
  const forDecisionCounts = useMemo(() => (c ? applyFilters(c.rows, f, minute, "decision") : []), [c, f, minute]);
  const families = useMemo(() => [...new Set((c?.rows ?? []).map((r) => r.family).filter((x): x is string => !!x))].sort(), [c]);

  // LIVE SORT, HELD: a user sort snapshots the order; refreshes keep it
  const [held, setHeld] = useState<string[] | null>(null);
  const [heldFor, setHeldFor] = useState("");
  const liveSorted = useMemo(() => (f.sort ? sortRows(filtered, f.sort, f.dir, minute) : filtered), [filtered, f.sort, f.dir, minute]);
  // re-snapshot only when the sort itself changes, never on a refresh
  const sortKey = f.sort ? `${f.sort}|${f.dir}` : "";
  if (sortKey !== heldFor) {
    setHeldFor(sortKey);
    setHeld(f.sort ? liveSorted.map((r) => r.ticker) : null);
  }
  const shown = useMemo(() => {
    if (!f.sort || !held) return liveSorted;
    const pos = new Map(held.map((t, i) => [t, i]));
    return [...filtered].sort((a, b) => (pos.get(a.ticker) ?? 1e9) - (pos.get(b.ticker) ?? 1e9));
  }, [f.sort, held, liveSorted, filtered]);
  const drift = !!f.sort && held !== null && shown.some((r, i) => liveSorted[i]?.ticker !== r.ticker);

  const tbody = useRef<HTMLTableSectionElement | null>(null);
  const onKey = (e: KeyboardEvent<HTMLTableRowElement>, t: string) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(t); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const rows = [...(tbody.current?.querySelectorAll<HTMLTableRowElement>("tr[data-ticker]") ?? [])];
      const i = rows.findIndex((x) => x.dataset.ticker === t);
      const n = rows[i + (e.key === "ArrowDown" ? 1 : -1)];
      n?.focus();
    }
  };

  const active = FILTER_KEYS.filter((k) => f[k] !== "").length;
  const sel = selected && c ? c.rows.find((r) => r.ticker === selected) ?? null : null;
  // a market that left the snapshot keeps its last read in the inspector
  const [kept, setKept] = useState<Candidate | null>(null);
  if (sel && sel !== kept) setKept(sel);
  const inspected = sel ?? (selected && kept?.ticker === selected ? kept : null);

  const tickMs = c?.tick_at ? Date.parse(c.tick_at) : NaN;
  const bound = new Set<string>(BOUND_REASONS);
  const byDesign = c ? Object.entries(c.omitted).filter(([k]) => !bound.has(k))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) : [];
  const byDesignN = byDesign.reduce((s, [, n]) => s + n, 0);
  const cutReasons = c ? Object.entries(c.omitted).filter(([k]) => bound.has(k)) : [];
  const src = c ? scopeSource(c) : "focus";
  const empty = c && c.rows.length === 0 ? emptyWhy(c) : null;
  const placedN = c ? c.rows.filter((r) => r.decision.action === "placed").length : 0;
  const decisions = BADGE_ORDER.filter((k) => k === "placed" || k === "skipped"
    || (c?.rows ?? []).some((r) => decisionBadge(r.decision).key === k));
  const today = reasonsOfKinds(obj(d.today)?.by_reason, ["skipped", "refused"]);

  const sortTh = (k: SortKey, children: string, right?: boolean) => {
    const on = f.sort === k;
    return (
      <th key={k} scope="col" aria-sort={on ? (f.dir === "asc" ? "ascending" : "descending") : undefined}
        className={`${TH} ${right ? "text-right" : "text-left"}`}>
        <button type="button" data-testid={`cand-sort-${k}`}
          onClick={() => setFilters((x) => ({ ...x, sort: k, dir: x.sort === k && x.dir === "desc" ? "asc" : "desc" }))}
          className={`inline-flex items-center gap-1 uppercase outline-none hover:text-ink-hi focus-visible:text-ink-hi ${on ? "text-ink-hi" : ""}`}>
          {children}<span aria-hidden className="text-[9px]">{on ? (f.dir === "asc" ? "▲" : "▼") : "↕"}</span>
        </button>
      </th>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12">
        <Panel testid="ops-candidates" title="Candidates"
          info={<>Prices in cents; edges after the maker fee; our model&apos;s probability is unvalidated; a placement
            is the trader&apos;s rule at work. Row order is the backend&apos;s priority order until a column is sorted.
            Click a row or press Enter for the inspector; ↑ ↓ move between rows. Edge: the side considered (else the
            larger), after the maker fee, against the bar (≥).</>}
          meta={c ? <Freshness at={at} now={now} cadenceMs={source.cadenceMs} failed={read.kind === "error"} /> : null}
          bodyClass="py-0">
          {read.kind === "unavailable" && (
            <div className="px-4 py-3"><p data-testid="cand-unavailable" className="text-[12.5px] text-ink-low">
              Candidates not available yet
            </p></div>
          )}
          {read.kind === "refused" && (
            <div className="px-4 py-3"><ErrorNote testid="cand-error">token rejected — the backend refused it ({read.detail})</ErrorNote></div>
          )}
          {read.kind === "error" && (
            <div className="px-4 py-3"><ErrorNote testid="cand-error" tone="warn">the candidates read failed (HTTP {read.status}) — {read.detail}</ErrorNote></div>
          )}
          {read.kind === "idle" && !c && <div className="px-4 py-3"><InfoNote>reading…</InfoNote></div>}

          {c && (
            <div data-testid="cand-body" data-stale={stale || undefined}>
              <p data-testid="cand-summary" className="tc-num flex flex-wrap items-center gap-x-1 border-b border-tc-line px-4 py-1.5 text-[12px] text-ink-low">
                <span className="text-ink-hi">{c.rows.length} shown · {placedN} placed ·{" "}
                  {c.rows.length - placedN} not placed
                  {c.considered !== null ? ` · ${c.considered.toLocaleString("en-US")} considered` : ""}</span>
                {" "}· tick {Number.isFinite(tickMs) ? `${ago(now - tickMs)} ago` : when(c.tick_at)}
                {c.truncated && (
                  <span data-testid="cand-truncated" className="text-warn">
                    {" "}· snapshot cut to its bound
                    {c.cut > 0 ? ` — ${c.cut} left out (${cutReasons.map(([k, n]) => `${k} ${n}`).join(", ")})`
                      : c.considered !== null ? ` — ${c.rows.length} of ${c.considered} shown` : ""}
                  </span>
                )}
                {byDesignN > 0 && (
                  <span data-testid="cand-not-shown" className="inline-flex items-center gap-1">
                    {" "}· {byDesignN.toLocaleString("en-US")} hidden
                    <Info label="markets not shown by design">
                      {byDesignN.toLocaleString("en-US")} not shown by design ({byDesign
                        .map(([k, n]) => `${k} ${n}`).join(", ")}). Tick {when(c.tick_at)}.
                    </Info>
                  </span>
                )}
                {(c.not_served ?? 0) > 0 && (
                  <span data-testid="cand-not-served" title={c.stale === true
                    ? "the snapshot is too old to serve" : "market no longer trading"}>
                    {" "}· {c.not_served} withheld ({c.stale === true ? "too old" : "not trading"})
                  </span>
                )}
                {c.unreadable > 0 && (
                  <span data-testid="cand-unreadable" className="text-warn">
                    {" "}· {c.unreadable} row{c.unreadable === 1 ? "" : "s"} unreadable (no ticker), not drawn
                  </span>
                )}
                {stale && <span className="text-warn"> · stale, {ago(now - at!)} old</span>}
              </p>

              {/* ---- the toolbar ---- */}
              <div className="space-y-1.5 border-b border-tc-line px-4 py-2">
                <div className="flex flex-wrap items-end gap-2">
                  <label className="flex min-w-[220px] flex-1 flex-col gap-1 sm:max-w-[320px]">
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">search</span>
                    <input type="search" data-testid="cand-search" value={f.q} placeholder="market, ticker, code"
                      onChange={(e) => set("q", e.target.value)} className={`${CTRL} w-full`} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">market type</span>
                    <select data-testid="cand-family" value={f.family} onChange={(e) => set("family", e.target.value)} className={CTRL}>
                      <option value="">all</option>
                      {families.map((x) => <option key={x} value={x}>{familyWords(x)}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">phase</span>
                    <select data-testid="cand-phase" value={f.phase} onChange={(e) => set("phase", e.target.value)} className={CTRL}>
                      <option value="">all</option><option value="pre">pre-match</option><option value="in">in play</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">kickoff</span>
                    <select data-testid="cand-kickoff" value={f.kickoff} onChange={(e) => set("kickoff", e.target.value)} className={CTRL}>
                      <option value="">any time</option><option value="60">within 1 h</option>
                      <option value="180">within 3 h</option><option value="inplay">in play now</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">edge ≥ (¢)</span>
                    <input type="number" step="0.5" inputMode="decimal" data-testid="cand-edge-min" value={f.edgeMin}
                      onChange={(e) => set("edgeMin", e.target.value)} className={`${CTRL} w-24`} placeholder="any" />
                  </label>
                  <div className="ml-auto flex items-center gap-2 self-end">
                    {f.reason && (
                      <button type="button" data-testid="cand-reason-chip" onClick={() => set("reason", "")}
                        className="flex h-7 items-center gap-1.5 rounded-md border border-accent/50 bg-accent/[0.06] px-2 text-[12px] text-ink-hi outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        reason <span className="font-mono text-[11px]">{f.reason}</span><span aria-hidden className="text-ink-low">×</span>
                        <span className="sr-only">remove the reason filter</span>
                      </button>
                    )}
                    <span data-testid="cand-filter-count" className="tc-num text-[12px] text-ink-low">
                      {active === 0 ? "" : `${active} filter${active === 1 ? "" : "s"} · ${filtered.length} of ${c.rows.length}`}
                    </span>
                    {active > 0 && (
                      <button type="button" data-testid="cand-clear"
                        onClick={() => setFilters((x) => ({ ...NO_CAND_FILTERS, sort: x.sort, dir: x.dir }))}
                        className="h-7 rounded-md border border-tc-line-strong px-2 text-[12px] text-ink-mid outline-none hover:text-ink-hi focus-visible:ring-2 focus-visible:ring-accent">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div data-testid="cand-decisions" role="group" aria-label="filter by decision" className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 inline-flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">
                    decision
                    {f.decision && (
                      <Info label="this decision" testid="cand-action-means">
                        {f.decision === "placed" && c.actions.placed ? c.actions.placed : BADGE_MEANING[f.decision]}
                      </Info>
                    )}
                  </span>
                  <FilterButton testid="cand-decision" data={{ "data-decision": "all" }}
                    pressed={f.decision === ""} onClick={() => set("decision", "")}>
                    All · {forDecisionCounts.length}
                  </FilterButton>
                  {decisions.map((k) => (
                    <FilterButton key={k} testid="cand-decision" data={{ "data-decision": k }} title={BADGE_MEANING[k]}
                      pressed={f.decision === k} onClick={() => set("decision", k)}>
                      {BADGES[k].label} · {forDecisionCounts.filter((r) => decisionBadge(r.decision).key === k).length}
                    </FilterButton>
                  ))}
                </div>
                <div data-testid="cand-comps" role="group" aria-label="filter by competition" className="flex flex-wrap items-center gap-1.5">
                  <span data-testid="cand-scope-label" className="mr-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low"
                    title={src === "focus" ? "the eleven focus competitions" : "the trader's scope"}>
                    {src === "focus" ? "focus" : "scope"}
                  </span>
                  <FilterButton testid="cand-comp" data={{ "data-comp": "__all__" }}
                    pressed={f.comp === ""} onClick={() => set("comp", "")}>
                    All · {c.rows.length}
                  </FilterButton>
                  {cov.map((k) => (
                    <FilterButton key={k.competition || "none"} testid="cand-comp"
                      data={{ "data-comp": k.competition, "data-considered": String(k.considered) }}
                      title={`${k.label}: ${k.considered === 0 ? "none in this snapshot"
                        : `${k.considered} in this snapshot${k.placed ? `, ${k.placed} placed` : ""}`}${!k.declared && k.considered > 0 ? " (not in scope list)" : ""}`}
                      pressed={f.comp === k.competition} onClick={() => set("comp", k.competition)}>
                      {k.label} · {k.considered === 0 ? "none" : `${k.considered}${k.placed ? `, ${k.placed} placed` : ""}`}
                      {!k.declared && k.considered > 0 ? " (not in scope list)" : ""}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* ---- the grid ---- */}
              {empty ? (
                <div className="px-4 py-4">
                  <p data-testid="cand-none" data-why={empty.code}
                    className={`rounded-md border border-dashed px-3 py-3 text-[12.5px] ${empty.code === "none" ? "border-tc-line text-ink-low" : "border-warn/40 text-warn"}`}>
                    {empty.text}
                  </p>
                </div>
              ) : shown.length === 0 ? (
                <div className="px-4 py-4">
                  <EmptyNote testid="cand-filtered-empty">
                    {f.comp && inComp.length === 0
                      ? `No candidate from ${compLabel(f.comp)} in this snapshot.`
                      : "No candidates match these filters."}
                  </EmptyNote>
                </div>
              ) : (
                <>
                  {drift && (
                    <div className="flex items-center justify-between gap-3 border-b border-tc-line bg-tc-raised px-4 py-1 text-[12px] text-ink-mid">
                      <span className="inline-flex items-center gap-1.5">Order held
                        <Info label="the held order">Held since you sorted — newer values would reorder the rows.</Info></span>
                      <button type="button" data-testid="cand-resort" onClick={() => setHeld(liveSorted.map((r) => r.ticker))}
                        className="rounded-md border border-tc-line-strong px-2 py-0.5 text-[12px] text-ink-hi outline-none hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent">Re-sort</button>
                    </div>
                  )}
                  <div className="tc-scroll max-h-[70vh] overflow-auto">
                    <table data-testid="cand-table" className="tc-table w-full min-w-[1100px] border-collapse">
                      <thead>
                        <tr>
                          <th scope="col" className={`${TH} pl-4 text-left`}>
                            <button type="button" data-testid="cand-sort-market"
                              onClick={() => setFilters((x) => ({ ...x, sort: "market", dir: x.sort === "market" && x.dir === "asc" ? "desc" : "asc" }))}
                              className="uppercase outline-none hover:text-ink-hi focus-visible:text-ink-hi">market{f.sort === "market" ? (f.dir === "asc" ? " ▲" : " ▼") : ""}</button>
                          </th>
                          {sortTh("decision", "decision")}
                          <th scope="col" className={`${TH} text-left`}>reason</th>
                          <th scope="col" className={`${TH} text-left`}>competition</th>
                          {sortTh("kickoff", "kickoff / min")}
                          {sortTh("model", "model", true)}
                          {sortTh("consensus", "consensus", true)}
                          {sortTh("fair", "fair", true)}
                          <th scope="col" className={`${TH} text-right`}>yes bid / ask</th>
                          {sortTh("edge", "edge", true)}
                        </tr>
                      </thead>
                      <tbody ref={tbody}>
                        {shown.map((r) => (
                          <CandRow key={r.key.split("|")[0]} r={r} selected={selected === r.ticker}
                            onOpen={setSelected} onKey={onKey} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <p className="border-t border-tc-line px-4 py-1.5 font-mono text-[10.5px] text-ink-faint" title={`generated ${when(c.generated_at)}`}>
                {c.version ?? "version not stated"}
              </p>
            </div>
          )}
        </Panel>
      </div>

      {c && (
        <>
          <div className="col-span-12 xl:col-span-5">
            <WhyNotPlaced rows={inComp} today={obj(d.today) ? today : null}
              compLabelText={f.comp ? compLabel(f.comp) : null}
              onReason={(code) => setFilters((x) => ({ ...x, reason: x.reason === code ? "" : code, decision: "" }))}
              activeReason={f.reason} />
          </div>
          <div className="col-span-12 xl:col-span-7">
            <Panel title="By competition" info={`Every competition, this tick — ${src === "focus" ? "the eleven focus competitions" : "the trader's scope"}.`}>
              {c.by_competition ? (
                <div className="tc-scroll overflow-x-auto">
                  <table data-testid="cand-by-comp" className="w-full min-w-[600px] border-collapse text-[12.5px]">
                    <thead>
                      <tr>
                        {["competition", "scope", "assessed", "eligible", "in play",
                          "decided", "model", "placed", "shown"].map((h, i) => (
                          <th key={h} scope="col" className={`${TH} first:pl-0 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cov.map((k) => (
                        <tr key={k.competition || "none"} data-testid="cand-by-comp-row" data-comp={k.competition}
                          className="hover:bg-tc-hover">
                          <td className="whitespace-nowrap border-b border-tc-line py-1 pr-3 text-ink-hi">{k.label}</td>
                          <td data-testid="cand-by-comp-in-scope" className="tc-num border-b border-tc-line px-2.5 py-1 text-right text-ink-mid">
                            {k.counts?.in_scope === true ? "yes" : k.counts?.in_scope === false ? "no" : DASH}
                          </td>
                          {[k.counts?.assessed, k.counts?.eligible, k.counts?.in_play_markets,
                            k.counts?.decided, k.counts?.model_priced, k.counts?.placed].map((n, i) => (
                            <td key={i} className={`tc-num border-b border-tc-line px-2.5 py-1 text-right ${n ? "text-ink-hi" : "text-ink-low"}`}>
                              {n === null || n === undefined ? DASH : n.toLocaleString("en-US")}
                            </td>
                          ))}
                          <td className="tc-num border-b border-tc-line py-1 pl-2.5 text-right text-ink-mid">{k.considered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <InfoNote>Not sent by this backend</InfoNote>}
            </Panel>
          </div>
        </>
      )}

      <Drawer open={inspected !== null} onClose={() => setSelected(null)} testid="cand-drawer"
        title={inspected?.title ?? ""}
        subtitle={inspected ? <>{compLabel(inspected.competition)} · {isInPlay(inspected) ? "in play" : `kickoff ${when(inspected.kickoff_utc)}`} · <Tech>{inspected.ticker}</Tech></> : undefined}>
        {inspected && c && <CandidateInspector r={inspected} c={c} gone={!sel} actionsMeaning={c.actions} />}
      </Drawer>
    </div>
  );
}


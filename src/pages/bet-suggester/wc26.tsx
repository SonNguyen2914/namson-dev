// World Cup 26 — namson.dev/bet-suggester/wc26
//
// The tournament finished on 2026-07-19 (Spain, 1-0 AET). Until
// 2026-08-30 this view was index 0 of the league carousel, which meant
// the DEFAULT thing anyone landing on the site saw was a competition
// that no longer plays. It now lives at its own route, reached from the
// Archive dropdown at the top-left, and the carousel carries only the
// four leagues that are actually in season.
//
// The view itself is unchanged and moved verbatim: the same title
// lockup and entrance effect, the same live scoreboard, next-match
// hero, bracket, ranking board, watchlist and alert panels, reading the
// same endpoints. Nothing here was re-derived — this is an archive, and
// an archive that quietly recomputes itself is not one.
//
// 2026-09-06 — THE ONE THING THAT DID CHANGE, AND WHY.
// The watched-markets panel below was the last un-walled "bet now"
// surface on the site. It printed "alert fires at 75/100", ranked
// markets by a 0-100 composite score, filled a progress bar with it,
// and at 75 turned the row's border, its bar and its number `warn` and
// prefixed it with a clock emoji — a GO colour, on the ink family
// WatchedStrip reserves for REFUSALS, beside a moment named to act.
//
// Not one of the eight numbers behind that composite was ever measured
// (weights 35/25/20/10/10, a 0.7 damping, a 10-reading "learned" gate,
// slope*25, a 12-hour urgency ramp). The backend withdrew it: see
// `src/timing.py`'s WITHDRAWN registry, which rides on the payload this
// page renders, so a reader who never opens the repo still meets what
// was taken away and what would license bringing it back. The panel
// still shows every observation the composite was built out of — the
// information was never the problem, the verdict was.
//
// The charter this now keeps is `src/live/position.py`'s: IT SHOWS; IT
// DOES NOT DECIDE. No ranking, no threshold, no GO colour, no moment
// named to act, and every unmeasured constant labelled where a reader
// meets it.
import Head from "next/head";
import { Anton } from "next/font/google";
import Link from "next/link";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { TZ } from "../../lib/matchday";
import {
  api, countdown, flag, pct, signedPct, kickoffLocal,
  RipenessAlert, SuggestionRow, UpcomingMatch,
} from "../../lib/suggesterApi";
import LiveScoreboard from "../../components/LiveScoreboard";
import BracketView from "../../components/BracketView";
import { Eyebrow, Flash, Reveal } from "../../components/ui";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import {
  NavChip, RouteProgress, SkeletonRows, Toaster, TopBar, useScrollSpy,
} from "../../components/chrome";

const POLL_MS = 60 * 1000; // the odds tape is written every 30s; re-read often

// Shared column template so the sortable header bar and every match group's
// rows line up: Market (flex) | Likelihood | Edge | Multiplier | Alert.
const BOARD_COLS =
  "grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5rem_4.5rem] items-center gap-x-3";

type SortKey = "likelihood" | "edge" | "multiplier";

// The schedule's `group` field is a group letter ("A"–"L") through the group
// stage but a round code from the knockouts on — label each accordingly
// ("group 3P" read like a fourth group stage).
function stageLabel(group: string): string {
  const rounds: Record<string, string> = {
    R16: "round of 16", QF: "quarter-final", SF: "semi-final",
    "3P": "third place", F: "final",
  };
  return rounds[group] ?? `group ${group}`;
}

// ---------------------------------------------------------------------------
// The bet-timing board's payload, as `src/timing.py` now emits it.
//
// REGISTERED, because it is a hole and not a fix: `src/lib/suggesterApi.ts`
// still declares `TimingScore { score: number; status: "no_data" |
// "provisional" | "learned" | "match_over"; components; reasons }` and
// `api.watchlist()` still declares an `alert_threshold`. None of those five
// fields exists on the wire any more. That file belongs to another owner
// this round, so the types below are declared here and the payload is
// narrowed once, at the single point it enters this page.
//   closes_when: suggesterApi.ts replaces TimingScore with TapeRead and
//   drops `alert_threshold` from api.watchlist()'s return type; then these
//   local declarations and the narrowing cast retire together, and the
//   e2e spec that pins this record retires with them.
// ---------------------------------------------------------------------------
interface TapeObservation {
  name: string;
  describes: string;
  unit: string | null;
  value: number | null;
  n: number | null;
  predictive_status: "unmeasured";
  refusal_code: string | null;
  refused: string | null;
  caveat?: string;
  direction?: string;
  kickoff_passed?: boolean;
  elapsed_minutes?: number | null;
}
interface TapeRead {
  market_id: string;
  readings: number;
  window_hours: number;
  observations: Record<string, TapeObservation>;
  refusal_counts: Record<string, number>;
  refusal_codes: Record<string, string>;
  charter: Record<string, string>;
  withdrawn: Record<string, { was: string; why: string; licensed_by: string }>;
  unmeasured_constants: Record<string, {
    value: number; unit: string; what_it_does: string;
    measured: boolean; note: string;
  }>;
}
interface WatchedMarket {
  match_id: string;
  market_id: string;
  market_title: string;
  watched_since: string;
  timing: TapeRead;
}
interface WatchlistPayload {
  watchlist: WatchedMarket[];
  order: { key: string; direction: string; is_a_ranking: boolean; note: string };
  charter: Record<string, string>;
}

// The order the five observations are drawn in. Fixed, and deliberately NOT
// the payload's own key order sorted by anything: an ordering that moved
// with the numbers would be a ranking wearing a different name. Any
// observation the backend adds and this list does not know is drawn after
// these, so a new one cannot go silently undrawn.
const OBSERVATION_ORDER = ["edge_deviate", "price_percentile", "edge_change",
                           "clock", "volume_24h"];

function orderedObservations(t: TapeRead): [string, TapeObservation][] {
  const keys = Object.keys(t.observations);
  const known = OBSERVATION_ORDER.filter((k) => keys.includes(k));
  const rest = keys.filter((k) => !OBSERVATION_ORDER.includes(k)).sort();
  return [...known, ...rest].map((k) => [k, t.observations[k]]);
}

const OBSERVATION_LABEL: Record<string, string> = {
  edge_deviate: "edge vs this window",
  price_percentile: "price vs prior readings",
  edge_change: "edge change",
  clock: "clock",
  volume_24h: "24h volume",
};

/** One observation's number in its OWN unit — never mapped onto 0-1, never
 *  coloured. Plain ink for a figure; `warn` only ever for a refusal. */
function observationValue(key: string, o: TapeObservation): string {
  if (o.value === null) return "—";
  switch (key) {
    case "edge_deviate":   return `${o.value >= 0 ? "+" : ""}${o.value.toFixed(2)}σ`;
    case "price_percentile": return `${(o.value * 100).toFixed(0)}% of ${o.n}`;
    case "edge_change":    return signedPct(o.value);
    case "clock":          return o.value < 0
      ? `${Math.abs(o.value).toFixed(1)}h after kickoff`
      : `${o.value.toFixed(1)}h to kickoff`;
    case "volume_24h":     return `$${o.value.toLocaleString("en-US")}`;
    default:               return String(o.value);
  }
}

/** The five observations of one market, plus every refusal by name. */
function TapeReadRows({ t }: { t: TapeRead }) {
  return (
    <dl className="mt-3 space-y-1.5">
      {orderedObservations(t).map(([key, o]) => (
        <div key={key} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <dt className="w-44 shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
            {OBSERVATION_LABEL[key] ?? key}
          </dt>
          <dd className="min-w-0 flex-1">
            {o.refusal_code ? (
              <span className="text-[13px] text-warn" data-testid={`refusal-${key}`}>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em]">
                  {o.refusal_code}
                </span>
                {" — "}
                {(o.refused ?? "").replace(`${o.refusal_code}: `, "")}
              </span>
            ) : (
              <>
                <span className="font-mono text-[13px] tabular-nums text-ink-hi">
                  {observationValue(key, o)}
                </span>
                <span className="ml-2 text-[12px] text-ink-low">{o.describes}</span>
                {o.caveat && (
                  <span className="ml-2 text-[11px] text-ink-faint">{o.caveat}</span>
                )}
                {o.direction && (
                  <span className="ml-2 text-[11px] text-ink-faint">{o.direction}</span>
                )}
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Anton for the WC26 emblem's condensed weight.
const wcFont = Anton({ weight: "400", subsets: ["latin"] });

// The competition's own palette, kept beside the view it drives (it used
// to be entry 0 of the carousel's LEAGUES array).
const WC26 = {
  id: "wc26", name: "World Cup 26", top: "WC26 · Bet Suggester",
  eyebrow: "live model · kalshi markets",
  accent: "#f5c542", dim: "rgba(245,197,66,0.35)", faint: "rgba(245,197,66,0.10)",
  ambient: "rgba(245,197,66,0.07)", modeMs: 3200,
  logo: "/leagues/wc26-official.png",
  tracking: "0.025em",
};

// The full-viewport entrance effect: spotlight beams sweeping with the
// wipe edge, confetti, crests, chants.
function WC26FX() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const g = document.querySelector(".league-glyph");
    if (!el || !g) return;
    const r = g.getBoundingClientRect();
    el.style.setProperty("--fx-x", `${r.left + r.width / 2}px`);
    el.style.setProperty("--fx-y", `${r.top + r.height / 2}px`);
  }, []);
  return (
    <div ref={ref} className="fxx fxx-wc26">
      <i className="bloom" /><i className="burst" />
      {Array.from({ length: 24 }, (_, i) => <span key={i} className="c" />)}
      {Array.from({ length: 6 }, (_, i) => <b key={`r${i}`} className="r" />)}
      {Array.from({ length: 6 }, (_, i) => <u key={`f${i}`} className="f" />)}
      {Array.from({ length: 3 }, (_, i) => (
        <svg key={`e${i}`} className="crest" viewBox="0 0 24 30" aria-hidden>
          <path d="M4 7 h16 v11 c0 6 -5 9 -8 10 c-3 -1 -8 -4 -8 -10 z" fill="#c60b1e" />
          <path d="M12 7 h8 v11 c0 6 -5 9 -8 10 z" fill="#ffc400" />
          <path d="M4 7 h16 v11 c0 6 -5 9 -8 10 c-3 -1 -8 -4 -8 -10 z"
            fill="none" stroke="#f5c542" strokeWidth="1.4" />
          <path d="M6 6 l2 -3.4 2 2.2 2 -3.4 2 3.4 2 -2.2 2 3.4 z" fill="#f5c542" />
        </svg>
      ))}
      <em className="chant">¡CAMPEONES!</em>
      <em className="chant">¡VIVA ESPAÑA!</em>
      <em className="chant">OÉ OÉ OÉ</em>
      <em className="chant">¡A POR ELLOS!</em>
    </div>
  );
}

// Watermark behind the title: the real emblem file, falling back to a
// built-in one-color trophy if it ever fails to load.
function WC26Mark() {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={WC26.logo} alt="" aria-hidden
        onError={() => setFailed(true)}
        className="league-glyph object-contain glyph-rich" />
    );
  }
  return (
    <svg className="league-glyph" viewBox="0 0 100 100" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden>
      {/* the trophy, and the year it was lifted */}
      <path d="M34 12 h32 v12 a16 16 0 0 1 -32 0 z" />
      <path d="M34 16 h-9 a9 11 0 0 0 9 13" />
      <path d="M66 16 h9 a9 11 0 0 1 -9 13" />
      <path d="M50 40 v10 M42 56 h16 M38 63 h24" />
      <text x="50" y="88" textAnchor="middle" fontSize="26" fontWeight="700"
        fill="currentColor" stroke="none" fontFamily="inherit">26</text>
    </svg>
  );
}

export default function WC26Archive() {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [tierUsed, setTierUsed] = useState<number | null>(null);
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [watchlist, setWatchlist] = useState<WatchedMarket[]>([]);
  const [watchOrder, setWatchOrder] = useState<WatchlistPayload["order"] | null>(null);
  // Historical rows written by the RETIRED trigger. Kept because those
  // notifications really were sent and an archive of a thing that happened
  // is worth keeping; relabelled because the composite in their `score`
  // column is withdrawn (src/timing.py REGISTERED_HOLES
  // ["timing_alerts_table_holds_retired_rows"], whose closing condition
  // names this surface: every renderer of these rows must date them and say
  // the trigger that wrote them is gone).
  const [retiredTriggerRows, setRetiredTriggerRows] = useState<RipenessAlert[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [secsToRefresh, setSecsToRefresh] = useState(POLL_MS / 1000);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Ranking-board sort (columns) + which match groups are collapsed.
  const [sortKey, setSortKey] = useState<SortKey>("likelihood");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  // Curtain-up: play the entrance once on load, then get out of the way.
  // Started in the INITIAL state rather than from an effect, so the
  // reveal is on the very first paint (it used to arrive a frame late,
  // after the carousel's mode switch set it) and nothing calls setState
  // synchronously inside an effect body. Only the teardown is a timer.
  const [swapClass, setSwapClass] = useState("mode-reveal-wc26");
  const [fxOn, setFxOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setSwapClass(""); setFxOn(false); },
                         WC26.modeMs);
    return () => clearTimeout(t);
  }, []);

  const load = useCallback(async () => {
    try {
      const [s, m, wl, al] = await Promise.all([
        api.suggestions(), api.upcoming(72), api.watchlist(), api.alerts(),
      ]);
      setSuggestions(s.suggestions);
      setTierUsed(s.tier_used);
      setMatches(m.matches);
      // narrowed once, here — see the registered record above TapeRead
      const board = wl as unknown as WatchlistPayload;
      setWatchlist(board.watchlist ?? []);
      setWatchOrder(board.order ?? null);
      setRetiredTriggerRows(al.alerts);
      setUpdatedAt(new Date());
      setSecsToRefresh(POLL_MS / 1000);
      setError("");
    } catch {
      setError("Backend unreachable. Is the Python service running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Scheduled (not called sync in the effect body) so the setState calls
    // inside load() happen in async callbacks — keeps react-hooks happy and
    // avoids cascading sync renders.
    const t = setTimeout(load, 0);
    const id = setInterval(load, POLL_MS);
    return () => { clearTimeout(t); clearInterval(id); };
  }, [load]);

  // 1s tick for the "next auto-refresh in Ns" countdown; also keeps the
  // "in play" kickoff comparison fresh without impure reads during render.
  useEffect(() => {
    const t = setInterval(() => {
      setSecsToRefresh((s) => Math.max(0, s - 1));
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  async function handleRefreshAll() {
    setRefreshingAll(true);
    setRefreshMsg("Refreshing all matches with fresh simulations + live Kalshi prices… this can take up to 90 seconds.");
    try {
      const r = await api.refreshAll();
      const total = r.refreshed.length + r.failed.length;
      setRefreshMsg(
        r.failed.length === 0
          ? `✓ Refreshed ${r.refreshed.length}/${total} matches just now`
          : `✓ Refreshed ${r.refreshed.length}/${total} — ${r.failed.join(", ")} didn't update, showing last known data`
      );
      await load();
    } catch {
      setRefreshMsg("✗ Refresh failed — backend unreachable. Showing last known data.");
    } finally {
      setRefreshingAll(false);
    }
  }

  const watchedIds = new Set(watchlist.map((w) => w.market_id));

  async function toggleWatch(s: SuggestionRow) {
    try {
      if (watchedIds.has(s.market_id)) await api.unwatch(s.market_id);
      else await api.watch(s.match_id, s.market_id, s.market_title);
      const board = await api.watchlist() as unknown as WatchlistPayload;
      setWatchlist(board.watchlist ?? []);
      setWatchOrder(board.order ?? null);
    } catch { /* non-fatal; next poll resyncs */ }
  }

  const next = matches[0];

  // Group best-bets by match, ordered by kickoff (schedule). Columns sort
  // within every group by the shared sort state; groups collapse independently.
  const groupsMap = new Map<string, {
    match_id: string; home: string; away: string;
    kickoff: string; is_final: boolean; rows: SuggestionRow[];
  }>();
  for (const s of suggestions) {
    let g = groupsMap.get(s.match_id);
    if (!g) {
      g = { match_id: s.match_id, home: s.home, away: s.away,
            kickoff: s.kickoff, is_final: s.is_final, rows: [] };
      groupsMap.set(s.match_id, g);
    }
    g.rows.push(s);
  }
  const groups = [...groupsMap.values()].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );
  const sortVal = (s: SuggestionRow) =>
    sortKey === "likelihood" ? s.model_probability
    : sortKey === "edge" ? s.edge : s.kalshi_odds;
  const sortRows = (rows: SuggestionRow[]) => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (sortVal(a) - sortVal(b)) * dir);
  };
  const onSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };
  const arrow = (k: SortKey) =>
    sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";
  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  // active chip follows the section in view
  const activeSection = useScrollSpy(["bracket", "board"], [loading]);

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid"
      style={{ "--accent": WC26.accent, "--accent-dim": WC26.dim,
               "--accent-faint": WC26.faint,
               "--accent-ambient": WC26.ambient } as CSSProperties}>
      {/* one expression — next/head drops multi-child <title> at SSR */}
      <Head><title>{`${WC26.name} Bet Suggester · namson.dev`}</title></Head>

      <RouteProgress />
      <Toaster />
      <TopBar left={<ArchiveMenu current="wc26" />}
        back={{ href: "/bet-suggester", label: "board" }}
        title={WC26.top}>
        <NavChip href="#bracket" active={activeSection === "bracket"}>Bracket</NavChip>
        <NavChip href="#board" active={activeSection === "board"}>Best bets</NavChip>
        <NavChip href="/bet-suggester/bots" active={false}>Bots</NavChip>
      </TopBar>

      {fxOn && <WC26FX />}
      <div className={`mode-stage ${swapClass}`}>
      {/* ===================== SHOWCASE ZONE ===================== */}
      <div className="hero-ambient">
        <div className="mx-auto max-w-5xl px-5 pt-20 sm:pt-24">
          {/* Title lockup */}
          <header className="relative mb-16 select-none text-center sm:mb-20">
            <div className="relative">
              <div className="relative">
                <WC26Mark />
                <Eyebrow tone="accent" className="mb-5">{`bet suggester · ${WC26.eyebrow}`}</Eyebrow>
                <h1 className="text-5xl font-semibold leading-[1.02] tracking-tighter sm:text-7xl lg:text-8xl">
                  <span className={`league-title block text-accent ${wcFont.className}`}
                    style={{ letterSpacing: WC26.tracking }}>{WC26.name}</span>
                </h1>
                <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-low">
                  Monte Carlo match simulation vs. live market prices.
                  {updatedAt && ` Updated ${updatedAt.toLocaleTimeString("en-US", { timeZone: TZ })}.`}
                  {" "}For research — not financial advice.
                </p>
                <p className="mt-5 flex justify-center">
                  <span className="champ-badge font-mono text-xs uppercase">
                    <span className="flag" aria-hidden />
                    ★ ★ campeones · españa
                    <span className="flag" aria-hidden />
                  </span>
                </p>
              </div>
            </div>
          </header>

          {error && (
            <div className="mb-10 rounded-xl border border-live/30 bg-live/5 p-4 text-center text-sm text-live">
              {error}
            </div>
          )}

          {/* Live scoreboard — real feed-backed score cards, at the top */}
          <LiveScoreboard />

          {/* Next match hero — under the live board */}
          {next && (
            <Reveal>
              <Link href={`/bet-suggester/market/${next.match_id}`} className="block">
                <section className="glow glow-accent cursor-pointer rounded-3xl border border-line bg-elev px-6 py-12 text-center transition-colors duration-300 hover:border-accent/40 sm:py-14">
                  <Eyebrow tone="accent">
                    next match · {stageLabel(next.group)}
                  </Eyebrow>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink-hi sm:text-5xl">
                    <span className="mr-3">{flag(next.home)}</span>
                    {next.home}
                    <span className="mx-3 text-xl font-normal text-ink-faint sm:mx-4 sm:text-2xl">vs</span>
                    {next.away}
                    <span className="ml-3">{flag(next.away)}</span>
                  </h2>
                  <p className="mt-3 text-xs text-ink-low">{next.venue}</p>
                  <p className="mt-1 font-mono text-[11px] tracking-wide text-ink-faint">
                    {kickoffLocal(next.kickoff)} · local time
                  </p>
                  <p className="mt-8 text-6xl font-semibold tracking-tight tabular-nums text-accent sm:text-7xl">
                    {countdown(next.seconds_to_kickoff)}
                  </p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
                    {next.is_final ? "🔒 final decision locked" : "to kickoff · final lock at T-10min"}
                  </p>
                </section>
              </Link>
            </Reveal>
          )}
        </div>
      </div>

      {/* ===================== TOOL ZONE (Linear-style) ===================== */}
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-20 sm:pt-24">

        {/* Knockout bracket — reversed pyramid, model win probabilities */}
        <div id="bracket" className="mb-20 border-t border-line pt-10">
          <BracketView />
        </div>

        {/* Ranking board — likelihood-first, all matches pooled */}
        <Reveal>
        <section id="board" className="mb-20 border-t border-line pt-10">
          <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow className="mb-2">ranking board · by match</Eyebrow>
              <h3 className="text-lg font-medium text-ink-hi">
                Best bets — grouped by match, in kickoff order
              </h3>
              <p className="mt-1 text-xs text-ink-low">
                Click a column to sort · click a match to collapse
              </p>
            </div>
            <button
              onClick={handleRefreshAll}
              disabled={refreshingAll}
              className={`rounded-lg border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                refreshingAll
                  ? "cursor-not-allowed border-line text-ink-faint"
                  : "border-accent/40 text-accent hover:border-accent hover:bg-accent/5"
              }`}
            >
              {refreshingAll ? "⟳ Refreshing…" : "↻ Refresh all"}
            </button>
          </div>
          <p className="mb-4 font-mono text-[11px] tracking-wide text-ink-faint">
            Auto-updates every 60s
            {updatedAt && ` · Last updated ${updatedAt.toLocaleTimeString("en-US", { timeZone: TZ })}`}
            {` · next auto-refresh in ${secsToRefresh}s`}
          </p>
          {refreshMsg && (
            <p className={`mb-4 text-xs ${
              refreshMsg.startsWith("✗") ? "text-live" : "text-accent"
            }`}>
              {refreshMsg}
            </p>
          )}
          {tierUsed === 40 && suggestions.length > 0 && (
            <p className="mb-4 rounded-lg border border-warn/25 bg-warn/5 px-3 py-2 text-xs text-warn">
              Expanded to 40%+ likely — nothing cleared 49%+ right now.
            </p>
          )}
          {loading ? (
            <SkeletonRows rows={7} />
          ) : groups.length === 0 ? (
            <p className="rounded-xl border border-line p-6 text-sm text-ink-low">
              No statistically likely value across any match right now — the
              markets are efficiently priced.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <div className="min-w-[600px]">
                {/* sortable column header bar (aligns with every group's rows) */}
                <div className={`${BOARD_COLS} border-b border-line bg-elev px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low`}>
                  <span>Market</span>
                  <button onClick={() => onSort("likelihood")} className="text-right transition-colors hover:text-ink-hi">
                    Likelihood{arrow("likelihood")}
                  </button>
                  <button onClick={() => onSort("edge")}
                    title="Model probability minus the market's implied probability — positive means the model sees value"
                    className="text-right transition-colors hover:text-ink-hi">
                    Edge{arrow("edge")}
                  </button>
                  <button onClick={() => onSort("multiplier")}
                    title="Payout multiple at the buyable ask price (not the midpoint)"
                    className="text-right transition-colors hover:text-ink-hi">
                    Mult{arrow("multiplier")}
                  </button>
                  <span className="text-right">Watch</span>
                </div>

                {groups.map((g) => {
                  const isCollapsed = collapsed.has(g.match_id);
                  const inPlay = new Date(g.kickoff).getTime() <= nowMs;
                  return (
                    <div key={g.match_id}>
                      {/* collapsible match header */}
                      <button
                        onClick={() => toggleCollapse(g.match_id)}
                        className="flex w-full items-center gap-2.5 border-b border-line bg-elev/40 px-4 py-2.5 text-left transition-colors hover:bg-elev"
                      >
                        <span className={`text-ink-faint transition-transform ${isCollapsed ? "" : "rotate-90"}`}>▸</span>
                        <span className="truncate text-sm text-ink-hi">
                          {flag(g.home)} {g.home} <span className="text-ink-faint">vs</span> {g.away} {flag(g.away)}
                        </span>
                        {inPlay && (
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-live">
                            <span className="pulse-dot mr-1 inline-block h-1 w-1 rounded-full bg-live align-middle" />
                            in play
                          </span>
                        )}
                        {g.is_final && (
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-live">🔒 final</span>
                        )}
                        <span className="ml-auto shrink-0 whitespace-nowrap pl-3 font-mono text-[11px] tracking-wide text-ink-faint">
                          {!inPlay && (
                            <span className="mr-2 text-accent">
                              in {countdown(Math.max(0, Math.floor((new Date(g.kickoff).getTime() - nowMs) / 1000)))}
                            </span>
                          )}
                          {kickoffLocal(g.kickoff)} · {g.rows.length} bet{g.rows.length === 1 ? "" : "s"}
                        </span>
                      </button>

                      {/* rows (sorted by the active column) */}
                      {!isCollapsed && sortRows(g.rows).map((s) => (
                        <div
                          key={s.market_id}
                          className={`${BOARD_COLS} border-b border-line px-4 py-3 text-sm transition-colors hover:bg-elev`}
                        >
                          <div className="min-w-0 pr-2">
                            <Link
                              href={`/bet-suggester/market/${s.match_id}`}
                              className="font-medium text-ink-hi transition-colors hover:text-accent"
                            >
                              {s.market_title}
                            </Link>
                          </div>
                          <div className="text-right font-mono tabular-nums text-ink-hi">
                            <Flash value={pct(s.model_probability)} />
                          </div>
                          <div className={`text-right font-mono tabular-nums ${
                            s.edge >= 0 ? "text-accent" : "text-neg"
                          }`}>
                            {signedPct(s.edge)}
                          </div>
                          <div className="text-right font-mono tabular-nums text-ink-mid">
                            {s.kalshi_odds.toFixed(2)}x
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => toggleWatch(s)}
                              className={`rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                                watchedIds.has(s.market_id)
                                  ? "border-line-strong text-ink-mid hover:text-ink-hi"
                                  : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"
                              }`}
                            >
                              {watchedIds.has(s.market_id) ? "Watching" : "Watch"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
        </Reveal>

        {/* Watched markets — the tape read. Not a score, not a ranking,
            not a trigger. Every figure in its own unit, every absence
            named, and the charter the backend sends printed above them so
            a reader meets it before the numbers rather than after. */}
        {watchlist.length > 0 && (
          <Reveal>
          <section className="mb-20" data-testid="tape-read-section">
            <Eyebrow className="mb-2">watched markets</Eyebrow>
            <h3 className="mb-1 text-lg font-medium text-ink-hi">
              What the odds tape says
            </h3>
            <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-ink-low"
               data-testid="tape-read-charter">
              Five observations per market, each in its own unit and each with
              its n. There is no combined figure, no threshold and no
              notification: nothing on this panel says when to do anything.{" "}
              <span className="text-ink-faint">
                {watchlist[0]?.timing?.charter?.predictive_status_unmeasured}
              </span>
            </p>
            {watchOrder && (
              <p className="mb-4 max-w-3xl font-mono text-[11px] leading-relaxed text-ink-faint"
                 data-testid="tape-read-order">
                order: {watchOrder.key} {watchOrder.direction} ·
                is_a_ranking: {String(watchOrder.is_a_ranking)} — {watchOrder.note}
              </p>
            )}
            <div className="space-y-3">
              {watchlist.map((w) => {
                const t = w.timing;
                const refused = Object.values(t.refusal_counts ?? {})
                  .reduce((a, b) => a + b, 0);
                return (
                  <div key={w.market_id}
                       className="rounded-xl border border-line p-4"
                       data-testid="tape-read-row">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <Link href={`/bet-suggester/market/${w.match_id}`}
                            className="text-sm text-ink-hi transition-colors hover:text-accent">
                        {w.market_title}
                      </Link>
                      <span className="font-mono text-[11px] text-ink-faint">
                        {t.readings} reading{t.readings === 1 ? "" : "s"} in the
                        last {t.window_hours}h
                        {refused > 0 && ` · ${refused} of 5 refused`}
                      </span>
                    </div>
                    <TapeReadRows t={t} />
                  </div>
                );
              })}
            </div>
            {watchlist[0]?.timing?.withdrawn && (
              <details className="mt-4 rounded-xl border border-line p-4"
                       data-testid="tape-read-withdrawn">
                <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid">
                  what this panel used to show, and why it does not
                </summary>
                <dl className="mt-3 space-y-3">
                  {Object.entries(watchlist[0].timing.withdrawn).map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">{k}</dt>
                      <dd className="text-[12px] leading-relaxed text-ink-low">
                        <span className="text-ink-mid">was</span> {v.was}.{" "}
                        <span className="text-ink-mid">why</span> {v.why}.{" "}
                        <span className="text-ink-mid">what would bring it back</span>{" "}
                        {v.licensed_by}.
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            {watchlist[0]?.timing?.unmeasured_constants && (
              <p className="mt-3 max-w-3xl font-mono text-[11px] leading-relaxed text-ink-faint"
                 data-testid="tape-read-constants">
                {Object.entries(watchlist[0].timing.unmeasured_constants).map(
                  ([k, v]) => `${k} = ${v.value} ${v.unit} (unmeasured: ${v.note})`
                ).join(" · ")}
              </p>
            )}
          </section>
          </Reveal>
        )}

        {/* Notifications the RETIRED trigger sent. History, drawn as
            history: full dates rather than a bare clock time (these rows
            are months old and read as "just now" without one), plain ink
            rather than `warn`, no clock emoji, and the withdrawal stated
            above them. Nothing new is ever added here — should_alert()
            returns False by construction and save_alert() raises. */}
        {retiredTriggerRows.length > 0 && (
          <Reveal>
          <section className="mb-20" data-testid="retired-trigger-section">
            <Eyebrow className="mb-2">archive</Eyebrow>
            <h3 className="mb-1 text-lg font-medium text-ink-hi">
              Notifications the retired trigger sent
            </h3>
            <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-ink-low"
               data-testid="retired-trigger-note">
              These were really sent, so they are kept. The figure each one
              was fired on is a 0-100 composite that no longer exists: none
              of its weights was ever measured, and the one rule of this
              family anybody did test is recorded NOT ADOPTED
              (research_archive/cashout_ripeness_2026-08-13.md — supported by
              two slates, both of which were lost). The trigger is withdrawn
              and this list cannot grow.
            </p>
            <div className="space-y-2">
              {retiredTriggerRows.slice(0, 6).map((a, i) => (
                <div key={i} className="rounded-xl border border-line px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-ink-mid">
                      {a.market_title}
                      <span className="ml-2 font-mono tabular-nums text-ink-low">@ {a.decimal_odds?.toFixed(2)}</span>
                      <span className="ml-2 font-mono text-xs tabular-nums text-ink-faint">
                        edge {signedPct(a.edge)} · withdrawn composite at the
                        time {a.score.toFixed(0)}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {new Date(a.fired_at).toLocaleString("en-US", {
                        timeZone: TZ, year: "numeric", month: "short",
                        day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          </Reveal>
        )}

        <footer className="mt-24 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
          Educational project. Simulated probabilities, not betting advice.
          Predictions refresh hourly; final decisions lock 10 minutes before kickoff.
        </footer>
      </div>
      </div>
    </div>
  );
}

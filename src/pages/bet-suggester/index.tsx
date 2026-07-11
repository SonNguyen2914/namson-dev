// Dashboard — namson.dev/bet-suggester
// Showcase at the top (live scoreboard + next-match hero, Apple-grade type
// and glow), then a deliberate transition into a denser Linear-style tool
// zone for the ranking board. One accent, gray hierarchy, mono for data.
// Scoped to this route so it doesn't fight the rest of the portfolio.
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  api, countdown, flag, pct, signedPct, kickoffLocal,
  RipenessAlert, SuggestionRow, UpcomingMatch, WatchlistEntry,
} from "../../lib/suggesterApi";
import LiveScoreboard from "../../components/LiveScoreboard";
import BracketView from "../../components/BracketView";
import { Eyebrow, Flash, Reveal } from "../../components/ui";
import { NavChip, RouteProgress, SkeletonRows, Toaster, TopBar, useScrollSpy } from "../../components/chrome";

const POLL_MS = 60 * 1000; // watchlist scores move every 30s poll; refresh often

// Shared column template so the sortable header bar and every match group's
// rows line up: Market (flex) | Likelihood | Edge | Multiplier | Alert.
const BOARD_COLS =
  "grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5rem_4.5rem] items-center gap-x-3";

type SortKey = "likelihood" | "edge" | "multiplier";

export default function BetSuggesterDashboard() {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [tierUsed, setTierUsed] = useState<number | null>(null);
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [ripeAlerts, setRipeAlerts] = useState<RipenessAlert[]>([]);
  const [alertThreshold, setAlertThreshold] = useState(75);
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

  const load = useCallback(async () => {
    try {
      const [s, m, wl, al] = await Promise.all([
        api.suggestions(), api.upcoming(72), api.watchlist(), api.alerts(),
      ]);
      setSuggestions(s.suggestions);
      setTierUsed(s.tier_used);
      setMatches(m.matches);
      setWatchlist(wl.watchlist);
      setAlertThreshold(wl.alert_threshold);
      setRipeAlerts(al.alerts);
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

  // In-play: on the board (kickoff+4h tracking window) but past kickoff,
  // so absent from the pre-kickoff-only "upcoming" list. Derived from
  // suggestions since the upcoming endpoint intentionally drops them.
  // nowMs (state, ticked above) powers the "in play" tag on board rows.

  async function toggleWatch(s: SuggestionRow) {
    try {
      if (watchedIds.has(s.market_id)) await api.unwatch(s.market_id);
      else await api.watch(s.match_id, s.market_id, s.market_title);
      const wl = await api.watchlist();
      setWatchlist(wl.watchlist);
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
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>WC26 Bet Suggester · namson.dev</title></Head>

      <RouteProgress />
      <Toaster />
      <TopBar title="WC26 · Bet Suggester">
        <NavChip href="#bracket" active={activeSection === "bracket"}>Bracket</NavChip>
        <NavChip href="#board" active={activeSection === "board"}>Best bets</NavChip>
      </TopBar>

      {/* ===================== SHOWCASE ZONE ===================== */}
      <div className="hero-ambient">
        <div className="mx-auto max-w-5xl px-5 pt-20 sm:pt-24">
          {/* Title lockup */}
          <header className="mb-16 text-center sm:mb-20">
            <Eyebrow tone="accent" className="mb-5">
              live model · kalshi markets
            </Eyebrow>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tighter sm:text-7xl">
              <span className="block text-ink-hi">World Cup 26</span>
              <span className="block text-ink-low">Bet Suggester</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-low">
              Monte Carlo match simulation vs. live market prices.
              {updatedAt && ` Updated ${updatedAt.toLocaleTimeString()}.`}
              {" "}For research — not financial advice.
            </p>
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
                    next match · group {next.group}
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
            {updatedAt && ` · Last updated ${updatedAt.toLocaleTimeString()}`}
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
                  <span className="text-right">Alert</span>
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
                                  ? "border-warn/50 text-warn hover:border-warn"
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

        {/* Watched bets — ripeness scores */}
        {watchlist.length > 0 && (
          <Reveal>
          <section className="mb-20">
            <Eyebrow className="mb-2">bet timing</Eyebrow>
            <h3 className="mb-4 text-lg font-medium text-ink-hi">
              Watched bets <span className="text-sm font-normal text-ink-low">· alert fires at {alertThreshold.toFixed(0)}/100</span>
            </h3>
            <div className="space-y-3">
              {watchlist.map((w) => {
                const t = w.timing;
                const ripe = t.score >= alertThreshold;
                return (
                  <Link key={w.market_id} href={`/bet-suggester/market/${w.match_id}`} className="block">
                    <div className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                      ripe ? "border-warn/50 bg-warn/5"
                           : "border-line hover:border-line-strong"
                    }`}>
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-sm text-ink-hi">
                          {ripe && <span className="mr-2">⏰</span>}
                          {w.market_title}
                          <span className="ml-2 font-mono text-[11px] text-ink-faint">
                            {t.readings} readings · {t.status}
                          </span>
                        </p>
                        <p className={`font-mono text-lg tabular-nums ${
                          ripe ? "text-warn" : "text-ink-mid"
                        }`}>
                          {t.score.toFixed(0)}<span className="text-xs text-ink-faint">/100</span>
                        </p>
                      </div>
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-elev2">
                        <div
                          className={`h-full rounded-full ${ripe ? "bg-warn" : "bg-accent/60"}`}
                          style={{ width: `${Math.min(t.score, 100)}%` }}
                        />
                      </div>
                      {t.reasons[0] && (
                        <p className="mt-2.5 text-xs text-ink-low">{t.reasons[0]}
                          {t.reasons[1] && ` · ${t.reasons[1]}`}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
          </Reveal>
        )}

        {/* Recent ripeness alerts */}
        {ripeAlerts.length > 0 && (
          <Reveal>
          <section className="mb-20">
            <Eyebrow className="mb-2">alerts</Eyebrow>
            <h3 className="mb-4 text-lg font-medium text-ink-hi">
              Recent bet-window alerts
            </h3>
            <div className="space-y-2">
              {ripeAlerts.slice(0, 6).map((a, i) => (
                <div key={i} className="rounded-xl border border-line px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-warn">
                      ⏰ {a.market_title}
                      <span className="ml-2 font-mono tabular-nums">@ {a.decimal_odds?.toFixed(2)}</span>
                      <span className="ml-2 font-mono text-xs tabular-nums text-ink-mid">
                        edge {signedPct(a.edge)} · score {a.score.toFixed(0)}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {new Date(a.fired_at).toLocaleTimeString()}
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
  );
}

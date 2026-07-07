// Dashboard — namson.dev/bet-suggester
// Dark trading-desk look, scoped to this route so it doesn't fight the rest
// of the portfolio. Tabular numerals everywhere numbers matter.
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  api, countdown, pct, signedPct,
  RipenessAlert, SuggestionRow, UpcomingMatch, WatchlistEntry,
} from "../../lib/suggesterApi";
import LiveScoreboard from "../../components/LiveScoreboard";

const POLL_MS = 60 * 1000; // watchlist scores move every 30s poll; refresh often

export default function BetSuggesterDashboard() {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [tierUsed, setTierUsed] = useState<number | null>(null);
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [ripeAlerts, setRipeAlerts] = useState<RipenessAlert[]>([]);
  const [alertThreshold, setAlertThreshold] = useState(75);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [secsToRefresh, setSecsToRefresh] = useState(POLL_MS / 1000);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      setError("Backend unreachable. Is the Python service running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  // 1s tick for the "next auto-refresh in Ns" countdown
  useEffect(() => {
    const t = setInterval(
      () => setSecsToRefresh((s) => Math.max(0, s - 1)), 1000);
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
  const nowMs = Date.now();
  const inPlayMap = new Map<
    string, { home: string; away: string; kickoff: string; count: number }
  >();
  for (const s of suggestions) {
    if (new Date(s.kickoff).getTime() <= nowMs) {
      const e = inPlayMap.get(s.match_id);
      if (e) e.count += 1;
      else inPlayMap.set(s.match_id, {
        home: s.home, away: s.away, kickoff: s.kickoff, count: 1,
      });
    }
  }
  const inPlay = Array.from(inPlayMap, ([match_id, v]) => ({ match_id, ...v }));

  function kickedOffAgo(kickoff: string): string {
    const mins = Math.max(0,
      Math.floor((nowMs - new Date(kickoff).getTime()) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m ago` : `${m}m ago`;
  }

  async function toggleWatch(s: SuggestionRow) {
    try {
      if (watchedIds.has(s.market_id)) await api.unwatch(s.market_id);
      else await api.watch(s.match_id, s.market_id, s.market_title);
      const wl = await api.watchlist();
      setWatchlist(wl.watchlist);
    } catch { /* non-fatal; next poll resyncs */ }
  }

  const next = matches[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono">
      <Head><title>WC26 Bet Suggester · namson.dev</title></Head>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <header className="mb-10 border-b border-neutral-800 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
            live model · kalshi markets
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            World Cup 26 Bet Suggester
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Monte Carlo match simulation vs. live market prices.
            {updatedAt && ` Updated ${updatedAt.toLocaleTimeString()}.`}
            {" "}For research — not financial advice.
          </p>
        </header>

        {error && (
          <div className="mb-8 rounded border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Next match hero */}
        {next && (
          <Link href={`/bet-suggester/market/${next.match_id}`}>
            <section className="mb-10 cursor-pointer rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-6 transition hover:border-emerald-700">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-500">
                    next match · group {next.group}
                  </p>
                  <h2 className="mt-1 text-2xl text-white">
                    {next.home} <span className="text-neutral-500">vs</span> {next.away}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500">{next.venue}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl tabular-nums text-emerald-400">
                    {countdown(next.seconds_to_kickoff)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {next.is_final ? "🔒 final decision locked" : "to kickoff · final lock at T-10min"}
                  </p>
                </div>
              </div>
            </section>
          </Link>
        )}

        {/* Live scoreboard — real feed-backed score cards (Apple-style) */}
        <LiveScoreboard />

        {/* In-play matches — kicked off, odds still moving */}
        {inPlay.length > 0 && (
          <section className="mb-10">
            {inPlay.map((m) => (
              <Link key={m.match_id} href={`/bet-suggester/market/${m.match_id}`}>
                <div className="mb-3 cursor-pointer rounded-lg border border-red-900/60 bg-red-950/20 p-4 transition hover:border-red-700">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-neutral-100">
                      <span className="mr-2 animate-pulse text-red-500">●</span>
                      <span className="text-xs uppercase tracking-widest text-red-400">
                        in play
                      </span>
                      <span className="ml-3">
                        {m.home} <span className="text-neutral-500">vs</span> {m.away}
                      </span>
                    </p>
                    <p className="text-xs tabular-nums text-neutral-400">
                      kicked off {kickedOffAgo(m.kickoff)} · {m.count} live bet
                      {m.count === 1 ? "" : "s"} on the board · odds still moving
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Ranking board — likelihood-first, all matches pooled */}
        <section className="mb-12">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm uppercase tracking-widest text-neutral-400">
              Best bets — all matches · ranked by likelihood
            </h3>
            <button
              onClick={handleRefreshAll}
              disabled={refreshingAll}
              className={`rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition ${
                refreshingAll
                  ? "cursor-not-allowed border-neutral-800 text-neutral-600"
                  : "border-emerald-800 text-emerald-400 hover:border-emerald-500 hover:text-emerald-300"
              }`}
            >
              {refreshingAll ? "⟳ Refreshing…" : "↻ Refresh All"}
            </button>
          </div>
          <p className="mb-3 text-xs text-neutral-600">
            Auto-updates every 60s
            {updatedAt && ` · Last updated ${updatedAt.toLocaleTimeString()}`}
            {` · next auto-refresh in ${secsToRefresh}s`}
          </p>
          {refreshMsg && (
            <p className={`mb-3 text-xs ${
              refreshMsg.startsWith("✗") ? "text-red-400" : "text-emerald-400"
            }`}>
              {refreshMsg}
            </p>
          )}
          {tierUsed === 40 && suggestions.length > 0 && (
            <p className="mb-3 rounded border border-amber-900/60 bg-amber-950/20 px-3 py-2 text-xs text-amber-400">
              Expanded to 40%+ likely — nothing cleared 49%+ right now.
            </p>
          )}
          {loading ? (
            <p className="text-neutral-500">Loading…</p>
          ) : suggestions.length === 0 ? (
            <p className="rounded border border-neutral-800 p-6 text-sm text-neutral-500">
              No statistically likely value across any match right now — the
              markets are efficiently priced.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-sm tabular-nums">
                <thead className="bg-neutral-900 text-left text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Market</th>
                    <th className="px-3 py-3 text-right">Likelihood</th>
                    <th className="px-3 py-3 text-right">Edge</th>
                    <th className="px-3 py-3 text-right">Multiplier</th>
                    <th className="px-4 py-3 text-right">Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70">
                  {suggestions.map((s) => (
                    <tr key={s.market_id} className="hover:bg-neutral-900/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/bet-suggester/market/${s.match_id}`}
                          className="text-neutral-100 hover:text-emerald-400"
                        >
                          {s.market_title}
                        </Link>
                        {s.is_final && (
                          <span className="ml-2 text-xs text-red-400">🔒 final</span>
                        )}
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {s.home} vs {s.away}
                          {new Date(s.kickoff).getTime() <= nowMs && (
                            <span className="ml-2 text-red-400">● in play</span>
                          )}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right text-neutral-100">
                        {pct(s.model_probability)}
                      </td>
                      <td className={`px-3 py-3 text-right ${s.edge >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {signedPct(s.edge)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {s.kalshi_odds.toFixed(2)}x
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleWatch(s)}
                          className={`rounded border px-2 py-1 text-xs transition ${
                            watchedIds.has(s.market_id)
                              ? "border-amber-700 text-amber-400 hover:border-amber-500"
                              : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                          }`}
                        >
                          {watchedIds.has(s.market_id) ? "👁 watching" : "🔔 watch"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Watched bets — ripeness scores */}
        {watchlist.length > 0 && (
          <section className="mb-12">
            <h3 className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
              Watched bets · alert fires at {alertThreshold.toFixed(0)}/100
            </h3>
            <div className="space-y-3">
              {watchlist.map((w) => {
                const t = w.timing;
                const ripe = t.score >= alertThreshold;
                return (
                  <Link key={w.market_id} href={`/bet-suggester/market/${w.match_id}`}>
                    <div className={`cursor-pointer rounded-lg border p-4 transition ${
                      ripe ? "border-amber-600 bg-amber-950/20"
                           : "border-neutral-800 hover:border-neutral-600"
                    }`}>
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-neutral-100">
                          {ripe && <span className="mr-2">⏰</span>}
                          {w.market_title}
                          <span className="ml-2 text-xs text-neutral-600">
                            {t.readings} readings · {t.status}
                          </span>
                        </p>
                        <p className={`tabular-nums text-lg ${
                          ripe ? "text-amber-400" : "text-neutral-300"
                        }`}>
                          {t.score.toFixed(0)}<span className="text-xs text-neutral-600">/100</span>
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-900">
                        <div
                          className={`h-full ${ripe ? "bg-amber-500" : "bg-emerald-700"}`}
                          style={{ width: `${Math.min(t.score, 100)}%` }}
                        />
                      </div>
                      {t.reasons[0] && (
                        <p className="mt-2 text-xs text-neutral-500">{t.reasons[0]}
                          {t.reasons[1] && ` · ${t.reasons[1]}`}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent ripeness alerts */}
        {ripeAlerts.length > 0 && (
          <section className="mb-12">
            <h3 className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
              Recent bet-window alerts
            </h3>
            <div className="space-y-2">
              {ripeAlerts.slice(0, 6).map((a, i) => (
                <div key={i} className="rounded border border-neutral-800 px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-amber-400">
                      ⏰ {a.market_title} @ {a.decimal_odds?.toFixed(2)}
                      <span className="ml-2 text-neutral-400">
                        edge {signedPct(a.edge)} · score {a.score.toFixed(0)}
                      </span>
                    </span>
                    <span className="text-xs text-neutral-600">
                      {new Date(a.fired_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming matches */}
        <section>
          <h3 className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
            Upcoming matches (next 72h)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {matches.map((m) => (
              <Link key={m.match_id} href={`/bet-suggester/market/${m.match_id}`}>
                <div className="cursor-pointer rounded-lg border border-neutral-800 p-4 transition hover:border-neutral-600">
                  <div className="flex items-baseline justify-between">
                    <p className="text-neutral-100">
                      {m.home} <span className="text-neutral-600">vs</span> {m.away}
                    </p>
                    <p className="tabular-nums text-sm text-emerald-500">
                      {countdown(m.seconds_to_kickoff)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Group {m.group} · {m.venue}
                    {m.has_prediction && m.confidence !== null &&
                      ` · model confidence ${pct(m.confidence)}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-14 border-t border-neutral-800 pt-6 text-xs text-neutral-600">
          Educational project. Simulated probabilities, not betting advice.
          Predictions refresh hourly; final decisions lock 10 minutes before kickoff.
        </footer>
      </div>
    </div>
  );
}

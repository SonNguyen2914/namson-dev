// Dashboard — namson.dev/bet-suggester
// Dark trading-desk look, scoped to this route so it doesn't fight the rest
// of the portfolio. Tabular numerals everywhere numbers matter.
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  api, countdown, money, pct, signedPct,
  RipenessAlert, SuggestionRow, UpcomingMatch, WatchlistEntry,
} from "../../lib/suggesterApi";

const POLL_MS = 60 * 1000; // watchlist scores move every 30s poll; refresh often

export default function BetSuggesterDashboard() {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [ripeAlerts, setRipeAlerts] = useState<RipenessAlert[]>([]);
  const [alertThreshold, setAlertThreshold] = useState(75);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, m, wl, al] = await Promise.all([
        api.suggestions(), api.upcoming(72), api.watchlist(), api.alerts(),
      ]);
      setSuggestions(s.suggestions);
      setMatches(m.matches);
      setWatchlist(wl.watchlist);
      setAlertThreshold(wl.alert_threshold);
      setRipeAlerts(al.alerts);
      setUpdatedAt(new Date());
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

        {/* Suggestions table */}
        <section className="mb-12">
          <h3 className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
            Value bets the model would take
          </h3>
          {loading ? (
            <p className="text-neutral-500">Loading…</p>
          ) : suggestions.length === 0 ? (
            <p className="rounded border border-neutral-800 p-6 text-sm text-neutral-500">
              Nothing clears the edge/confidence bar right now. The model would
              rather sit out than force a bet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-sm tabular-nums">
                <thead className="bg-neutral-900 text-left text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Market</th>
                    <th className="px-3 py-3 text-right">Odds</th>
                    <th className="px-3 py-3 text-right">Model</th>
                    <th className="px-3 py-3 text-right">Market</th>
                    <th className="px-3 py-3 text-right">Edge</th>
                    <th className="px-3 py-3 text-right">EV / $1</th>
                    <th className="px-4 py-3 text-right">Conf</th>
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
                      </td>
                      <td className="px-3 py-3 text-right">{s.kalshi_odds.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right">{pct(s.model_probability)}</td>
                      <td className="px-3 py-3 text-right text-neutral-500">
                        {pct(s.implied_probability)}
                      </td>
                      <td className={`px-3 py-3 text-right ${s.edge >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {signedPct(s.edge)}
                      </td>
                      <td className={`px-3 py-3 text-right ${s.expected_value >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {money(s.expected_value)}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-400">
                        {pct(s.confidence)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

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

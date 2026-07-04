// Match detail — namson.dev/bet-suggester/market/BRA_SRB
// On-demand predictions: cached by default, "Refresh" forces a fresh
// Monte Carlo run against live odds. Shows xG, scoreline distribution,
// every market priced, and how the prediction evolved over the day.
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  api, money, pct, signedPct,
  PredictionResponse, TimelinePoint,
} from "../../../lib/suggesterApi";

export default function MatchDetail() {
  const router = useRouter();
  const matchId = router.query.matchId as string | undefined;

  const [pred, setPred] = useState<PredictionResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (force: boolean) => {
    if (!matchId) return;
    setLoading(true);
    try {
      const p = await api.prediction(matchId, force);
      setPred(p);
      const [t, wl] = await Promise.all([api.timeline(matchId), api.watchlist()]);
      setTimeline(t.points);
      setWatched(new Set(wl.watchlist.map((w) => w.market_id)));
      setError("");
    } catch {
      setError("Could not reach the prediction backend.");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  async function toggleWatch(marketId: string, marketTitle: string) {
    if (!matchId) return;
    if (watched.has(marketId)) {
      await api.unwatch(marketId);
      setWatched((prev) => { const n = new Set(prev); n.delete(marketId); return n; });
    } else {
      await api.watch(matchId, marketId, marketTitle);
      setWatched((prev) => new Set(prev).add(marketId));
    }
  }

  useEffect(() => { load(false); }, [load]);

  const freshnessBadge = pred && (
    <span className={`rounded px-2 py-1 text-xs ${
      pred.freshness === "fresh"
        ? "bg-emerald-950 text-emerald-400"
        : pred.is_stale
        ? "bg-amber-950 text-amber-400"
        : "bg-neutral-800 text-neutral-400"
    }`}>
      {pred.freshness === "fresh"
        ? `fresh · ${pred.inference_time_ms ?? "?"}ms inference`
        : pred.is_stale
        ? `stale · ${Math.round(pred.age_seconds / 60)}min old`
        : `cached · ${pred.age_seconds}s old`}
    </span>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono">
      <Head><title>{matchId ?? "Match"} · Bet Suggester</title></Head>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/bet-suggester" className="text-xs text-neutral-500 hover:text-emerald-400">
          ← all suggestions
        </Link>

        <header className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl text-white">{matchId?.replace("_", " vs ")}</h1>
            <div className="mt-2 flex items-center gap-3">
              {freshnessBadge}
              {pred?.is_final && (
                <span className="rounded bg-red-950 px-2 py-1 text-xs text-red-400">
                  🔒 final decision locked
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="rounded border border-emerald-800 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-400 transition hover:bg-emerald-900/40 disabled:opacity-50"
          >
            {loading ? "Simulating…" : "↻ Refresh (fresh simulation)"}
          </button>
        </header>

        {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

        {pred && (
          <>
            {/* xG + confidence */}
            <section className="mb-8 grid grid-cols-3 gap-3">
              <Stat label="home xG" value={pred.xg.home.toFixed(2)} />
              <Stat label="away xG" value={pred.xg.away.toFixed(2)} />
              <Stat label="model confidence" value={pct(pred.confidence)} />
            </section>

            {/* Scoreline distribution */}
            <section className="mb-10">
              <h3 className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
                Most likely scorelines ({">"}10,000 simulations)
              </h3>
              <div className="space-y-1.5">
                {pred.scorelines.slice(0, 8).map((s) => (
                  <div key={s.score} className="flex items-center gap-3 text-sm tabular-nums">
                    <span className="w-10 text-neutral-300">{s.score}</span>
                    <div className="h-4 flex-1 overflow-hidden rounded-sm bg-neutral-900">
                      <div
                        className="h-full bg-emerald-600/70"
                        style={{ width: `${Math.min(s.prob * 400, 100)}%` }}
                      />
                    </div>
                    <span className="w-14 text-right text-neutral-400">{pct(s.prob)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Every market priced */}
            <section className="mb-10">
              <h3 className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
                Every Kalshi market on this match
              </h3>
              <div className="overflow-x-auto rounded-lg border border-neutral-800">
                <table className="w-full text-sm tabular-nums">
                  <thead className="bg-neutral-900 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">Market</th>
                      <th className="px-3 py-3 text-right">Odds</th>
                      <th className="px-3 py-3 text-right">Model</th>
                      <th className="px-3 py-3 text-right">Edge</th>
                      <th className="px-3 py-3 text-right">EV / $1</th>
                      <th className="px-4 py-3 text-center">Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/70">
                    {pred.markets.map((m) => (
                      <tr key={m.market_id} className="hover:bg-neutral-900/60">
                        <td className="px-4 py-3 text-neutral-100">{m.market_title}</td>
                        <td className="px-3 py-3 text-right">{m.kalshi_odds?.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right">{pct(m.model_probability)}</td>
                        <td className={`px-3 py-3 text-right ${m.edge >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {signedPct(m.edge)}
                        </td>
                        <td className={`px-3 py-3 text-right ${m.expected_value >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {money(m.expected_value)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleWatch(m.market_id, m.market_title)}
                            title={watched.has(m.market_id)
                              ? "Watching — you'll be pinged when the price is ripe. Click to stop."
                              : "Notify me when this bet's timing is ripe"}
                            className={`rounded px-2 py-1 text-xs transition ${
                              watched.has(m.market_id)
                                ? "bg-amber-950 text-amber-400 hover:bg-amber-900"
                                : "bg-neutral-800 text-neutral-500 hover:text-amber-400"
                            }`}
                          >
                            {watched.has(m.market_id) ? "🔔 watching" : "🔕 watch"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-neutral-600">
                Watched bets are polled every 30s. You get a Discord ping + feed entry
                the moment the ripeness score crosses the alert threshold with positive edge.
              </p>
            </section>

            {/* Prediction timeline */}
            {timeline.length > 1 && (
              <section>
                <h3 className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
                  How the home-win prediction evolved today
                </h3>
                <div className="overflow-x-auto rounded-lg border border-neutral-800">
                  <table className="w-full text-sm tabular-nums">
                    <thead className="bg-neutral-900 text-left text-xs uppercase tracking-wider text-neutral-500">
                      <tr>
                        <th className="px-4 py-2">Time</th>
                        <th className="px-3 py-2 text-right">Model</th>
                        <th className="px-3 py-2 text-right">Market</th>
                        <th className="px-3 py-2 text-right">Edge</th>
                        <th className="px-3 py-2 text-right">Conf</th>
                        <th className="px-4 py-2">Run</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/70">
                      {timeline.map((p, i) => (
                        <tr key={i} className={p.is_final ? "bg-red-950/20" : ""}>
                          <td className="px-4 py-2 text-neutral-400">
                            {new Date(p.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-2 text-right">{pct(p.model_probability)}</td>
                          <td className="px-3 py-2 text-right text-neutral-500">
                            {pct(p.implied_probability)}
                          </td>
                          <td className={`px-3 py-2 text-right ${p.edge >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {signedPct(p.edge)}
                          </td>
                          <td className="px-3 py-2 text-right text-neutral-400">{pct(p.confidence)}</td>
                          <td className="px-4 py-2 text-xs text-neutral-500">
                            {p.is_final ? "🔒 FINAL" : p.source.replace("_", " ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <p className="text-xs uppercase tracking-widest text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl tabular-nums text-white">{value}</p>
    </div>
  );
}

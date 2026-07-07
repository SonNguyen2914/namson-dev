// Dashboard — namson.dev/bet-suggester
// Showcase at the top (live scoreboard + next-match hero, Apple-grade type
// and glow), then a deliberate transition into a denser Linear-style tool
// zone for the ranking board. One accent, gray hierarchy, mono for data.
// Scoped to this route so it doesn't fight the rest of the portfolio.
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  api, countdown, flag, pct, signedPct,
  RipenessAlert, SuggestionRow, UpcomingMatch, WatchlistEntry,
} from "../../lib/suggesterApi";
import LiveScoreboard from "../../components/LiveScoreboard";
import { Eyebrow, Flash, Reveal, RevealRow } from "../../components/ui";

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
  const [nowMs, setNowMs] = useState(() => Date.now());
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

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>WC26 Bet Suggester · namson.dev</title></Head>

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

        {/* Ranking board — likelihood-first, all matches pooled */}
        <Reveal>
        <section className="mb-20 border-t border-line pt-10">
          <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow className="mb-2">ranking board · likelihood-first</Eyebrow>
              <h3 className="text-lg font-medium text-ink-hi">
                Best bets — all matches, ranked by likelihood
              </h3>
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
            <p className="text-sm text-ink-low">Loading…</p>
          ) : suggestions.length === 0 ? (
            <p className="rounded-xl border border-line p-6 text-sm text-ink-low">
              No statistically likely value across any match right now — the
              markets are efficiently priced.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-elev text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
                  <tr>
                    <th className="px-4 py-3 font-normal">Market</th>
                    <th className="px-3 py-3 text-right font-normal">Likelihood</th>
                    <th className="px-3 py-3 text-right font-normal">Edge</th>
                    <th className="px-3 py-3 text-right font-normal">Multiplier</th>
                    <th className="px-4 py-3 text-right font-normal">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map((s, i) => (
                    <RevealRow
                      key={s.market_id}
                      delay={(i % 12) * 35}
                      className="border-t border-line transition-colors hover:bg-elev"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/bet-suggester/market/${s.match_id}`}
                          className="font-medium text-ink-hi transition-colors hover:text-accent"
                        >
                          {s.market_title}
                        </Link>
                        {s.is_final && (
                          <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-live">
                            🔒 final
                          </span>
                        )}
                        <p className="mt-0.5 text-xs text-ink-low">
                          {s.home} vs {s.away}
                          {new Date(s.kickoff).getTime() <= nowMs && (
                            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-live">
                              <span className="pulse-dot mr-1 inline-block h-1 w-1 rounded-full bg-live align-middle" />
                              in play
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-ink-hi">
                        <Flash value={pct(s.model_probability)} />
                      </td>
                      <td className={`px-3 py-3 text-right font-mono tabular-nums ${
                        s.edge >= 0 ? "text-accent" : "text-neg"
                      }`}>
                        {signedPct(s.edge)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-ink-mid">
                        {s.kalshi_odds.toFixed(2)}x
                      </td>
                      <td className="px-4 py-3 text-right">
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
                      </td>
                    </RevealRow>
                  ))}
                </tbody>
              </table>
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

        {/* Upcoming matches */}
        <Reveal>
        <section>
          <Eyebrow className="mb-2">schedule</Eyebrow>
          <h3 className="mb-4 text-lg font-medium text-ink-hi">
            Upcoming matches <span className="text-sm font-normal text-ink-low">· next 72h</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {matches.map((m) => <MatchCard key={m.match_id} m={m} />)}
          </div>
        </section>
        </Reveal>

        <footer className="mt-24 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
          Educational project. Simulated probabilities, not betting advice.
          Predictions refresh hourly; final decisions lock 10 minutes before kickoff.
        </footer>
      </div>
    </div>
  );
}

// One upcoming-match card. A resolved match links to its detail page and
// shows flags + model confidence. A placeholder QF slot (a side still
// "X/Y winner") is shown as a non-clickable TBD card — there's no team to
// predict yet — and resolves automatically once the bracket fills in.
// Teams running on provisional (unsourced) stats get a small honest badge.
function MatchCard({ m }: { m: UpcomingMatch }) {
  const hasProv = m.provisional_stats.length > 0;

  const inner = (
    <div className={`rounded-xl border p-4 transition-colors ${
      m.tbd
        ? "border-dashed border-line"
        : "cursor-pointer border-line hover:border-line-strong hover:bg-elev"
    }`}>
      <div className="flex items-baseline justify-between gap-3">
        {m.tbd ? (
          <p className="text-sm text-ink-low">
            {m.home_resolved ? `${flag(m.home)} ${m.home}` : m.home}
            <span className="mx-1.5 text-ink-faint">vs</span>
            {m.away_resolved ? `${flag(m.away)} ${m.away}` : m.away}
          </p>
        ) : (
          <p className="text-sm text-ink-hi">
            {flag(m.home)} {m.home} <span className="text-ink-faint">vs</span> {m.away} {flag(m.away)}
          </p>
        )}
        <p className="font-mono text-sm tabular-nums text-accent">
          {countdown(m.seconds_to_kickoff)}
        </p>
      </div>
      <p className="mt-1.5 text-xs text-ink-low">
        {m.group === "QF" ? "Quarter-final" : `Group ${m.group}`} · {m.venue}
        {!m.tbd && m.has_prediction && m.confidence !== null &&
          ` · model confidence ${pct(m.confidence)}`}
      </p>
      {(m.tbd || hasProv) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {m.tbd && (
            <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-low">
              awaiting bracket
            </span>
          )}
          {hasProv && (
            <span
              title={`Running on provisional stats (no sourced data yet): ${m.provisional_stats.join(", ")}`}
              className="rounded-md border border-warn/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-warn"
            >
              provisional stats
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Placeholder slots aren't clickable — no prediction exists to open.
  return m.tbd
    ? inner
    : <Link href={`/bet-suggester/market/${m.match_id}`} className="block">{inner}</Link>;
}

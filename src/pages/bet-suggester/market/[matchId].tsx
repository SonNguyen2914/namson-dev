// Match detail — namson.dev/bet-suggester/market/BRA_SRB
// Apple-Sports treatment: the matchup is the hero, outcome probabilities as
// thin horizontal stat bars, everything else glanceable and subordinate.
// On-demand predictions: cached by default, "Refresh" forces a fresh
// Monte Carlo run against live odds. Shows xG, scoreline distribution,
// every market priced, and how the prediction evolved over the day.
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  api, flag, pct, signedPct,
  PredictionResponse, PredictionSummary, HalfDist,
  TimelinePoint, TeamInfoResponse, TeamBlurb,
} from "../../../lib/suggesterApi";
import LivePanel from "../../../components/LivePanel";
import { Eyebrow, Reveal } from "../../../components/ui";

// Same floors as the backend board — the pick is just row #1 of this
// match's slice of the same likelihood-first ranking.
const PRIMARY_FLOOR = 0.49;
const FALLBACK_FLOOR = 0.40;

export default function MatchDetail() {
  const router = useRouter();
  const matchId = router.query.matchId as string | undefined;

  const [pred, setPred] = useState<PredictionResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [teams, setTeams] = useState<{ home: string; away: string } | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (force: boolean) => {
    if (!matchId) return;
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

  // Resolve full team names for the hero (best-effort — the id codes are
  // the honest fallback). Pre-kickoff matches come from /upcoming; in-play
  // ones from /live-scores (served from the backend's shared 20s cache).
  useEffect(() => {
    if (!matchId) return;
    let alive = true;
    (async () => {
      try {
        const u = await api.upcoming(72);
        const m = u.matches.find((x) => x.match_id === matchId);
        if (m && alive) { setTeams({ home: m.home, away: m.away }); }
        else {
          const ls = await api.liveScores();
          const l = ls.live.find((x) => x.match_id === matchId);
          if (l && alive) setTeams({ home: l.home, away: l.away });
        }
      } catch { /* fall back to the id codes */ }
      // Scouting blurbs — independent of the name resolution above.
      try {
        const ti = await api.teamInfo(matchId);
        if (alive) setTeamInfo(ti);
      } catch { /* no blurbs — card just won't render */ }
    })();
    return () => { alive = false; };
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

  useEffect(() => {
    // Scheduled so load()'s setState runs in an async callback, not sync
    // inside the effect body (react-hooks/set-state-in-effect).
    const t = setTimeout(() => load(false), 0);
    return () => clearTimeout(t);
  }, [load]);

  const [codeH, codeA] = (matchId ?? "_").split("_");
  const home = teams?.home ?? codeH ?? "Home";
  const away = teams?.away ?? codeA ?? "Away";

  // Likelihood ↓ then edge ↓ — same ordering as the landing board
  const sortedMarkets = pred
    ? [...pred.markets].sort(
        (a, b) => b.model_probability - a.model_probability || b.edge - a.edge)
    : [];
  let pick = sortedMarkets.find((m) => m.model_probability >= PRIMARY_FLOOR) ?? null;
  let pickTier: 49 | 40 | null = pick ? 49 : null;
  if (!pick) {
    pick = sortedMarkets.find((m) => m.model_probability >= FALLBACK_FLOOR) ?? null;
    pickTier = pick ? 40 : null;
  }

  // Outcome probabilities for the stat bars — read straight off the priced
  // markets (post-anchoring), so the bars and the table can never disagree.
  // Three separate bars, NOT one segmented bar: these are independent
  // market-anchored numbers and don't necessarily sum to 100%.
  const outcomeProb = (key: string) =>
    sortedMarkets.find((m) => m.outcome_key === key)?.model_probability;
  const pHome = outcomeProb("home_win");
  const pDraw = outcomeProb("draw");
  const pAway = outcomeProb("away_win");
  const hasOutcomes = [pHome, pDraw, pAway].some((v) => v != null);

  const freshnessBadge = pred && (
    <span className={`rounded-md border px-2.5 py-1 font-mono text-[11px] tracking-wide ${
      pred.freshness === "fresh"
        ? "border-accent/40 text-accent"
        : pred.is_stale
        ? "border-warn/40 text-warn"
        : "border-line text-ink-low"
    }`}>
      {pred.freshness === "fresh"
        ? `fresh · ${pred.inference_time_ms ?? "?"}ms inference`
        : pred.is_stale
        ? `stale · ${Math.round(pred.age_seconds / 60)}min old`
        : `cached · ${pred.age_seconds}s old`}
    </span>
  );

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>{matchId ?? "Match"} · Bet Suggester</title></Head>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <Link
          href="/bet-suggester"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low transition-colors hover:text-accent"
        >
          ← all suggestions
        </Link>

        {/* ============ HERO — the matchup ============ */}
        <header className="hero-ambient mt-8 mb-12 rounded-3xl pb-2 text-center">
          <Eyebrow className="mb-4">{matchId}</Eyebrow>
          <h1 className="text-4xl font-semibold tracking-tight text-ink-hi sm:text-5xl">
            {teams && <span className="mr-3">{flag(home)}</span>}
            {home}
            <span className="mx-3 text-xl font-normal text-ink-faint sm:text-2xl">vs</span>
            {away}
            {teams && <span className="ml-3">{flag(away)}</span>}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {freshnessBadge}
            {pred?.is_final && (
              <span className="rounded-md border border-live/40 px-2.5 py-1 font-mono text-[11px] tracking-wide text-live">
                🔒 final decision locked
              </span>
            )}
            <button
              onClick={() => { setLoading(true); load(true); }}
              disabled={loading}
              className={`rounded-lg border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                loading
                  ? "cursor-not-allowed border-line text-ink-faint"
                  : "border-accent/40 text-accent hover:border-accent hover:bg-accent/5"
              }`}
            >
              {loading ? "Simulating…" : "↻ Refresh (fresh simulation)"}
            </button>
          </div>
        </header>

        {error && <p className="mb-8 text-center text-sm text-live">{error}</p>}

        {/* How they play — scouting blurbs, a read aid (not a model input) */}
        {teamInfo && (teamInfo.home.scouting || teamInfo.away.scouting) && (
          <Reveal>
            <section className="mb-10">
              <Eyebrow className="mb-4">how they play · scouting</Eyebrow>
              <div className="grid gap-3 sm:grid-cols-2">
                <ScoutCard blurb={teamInfo.home} fallbackName={home} />
                <ScoutCard blurb={teamInfo.away} fallbackName={away} />
              </div>
            </section>
          </Reveal>
        )}

        {pred && (
          <>
            {/* Model prediction — halves, full time, ET/pens, top scores */}
            {pred.summary && (
              <Reveal>
                <ModelPrediction
                  summary={pred.summary}
                  scorelines={pred.scorelines}
                  home={home}
                  away={away}
                />
              </Reveal>
            )}

            {/* Outcome probabilities — thin stat bars, Apple-Sports style */}
            {hasOutcomes && (
              <Reveal>
              <section className="mb-10 rounded-2xl border border-line bg-elev p-5 sm:p-6">
                <Eyebrow className="mb-4">
                  model outcome probabilities · market-anchored
                </Eyebrow>
                <div className="space-y-3">
                  {pHome != null && <OutcomeBar label={`${home} win`} value={pHome} />}
                  {pDraw != null && <OutcomeBar label="Draw" value={pDraw} />}
                  {pAway != null && <OutcomeBar label={`${away} win`} value={pAway} />}
                </div>
                <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
                  Read straight off the priced markets below — independent numbers,
                  so they won&apos;t sum to exactly 100%.
                </p>
              </section>
              </Reveal>
            )}

            {/* xG + confidence */}
            <Reveal>
            <section className="mb-10 grid grid-cols-3 gap-3">
              <Stat label={`${home} xG`} value={pred.xg.home.toFixed(2)} />
              <Stat label={`${away} xG`} value={pred.xg.away.toFixed(2)} />
              <Stat label="model confidence" value={pct(pred.confidence)} />
            </section>
            </Reveal>

            {/* Live in-play read (Layer 3) */}
            <LivePanel matchId={matchId as string} />

            {/* Model's Pick — row #1 of this match's likelihood board */}
            <Reveal>
            <section className={`glow mb-14 rounded-2xl border p-6 ${
              pick ? "glow-accent border-accent/25 bg-elev"
                   : "border-line"
            }`}>
              <Eyebrow>
                Model&apos;s pick — most likely bet on this match
              </Eyebrow>
              {pick ? (
                <>
                  <p className="mt-3 text-xl font-medium text-ink-hi sm:text-2xl">{pick.market_title}</p>
                  <p className="mt-2 font-mono text-sm tabular-nums text-ink-mid">
                    {pct(pick.model_probability)} likely ·{" "}
                    <span className={pick.edge >= 0 ? "text-accent" : "text-neg"}>
                      {signedPct(pick.edge)} edge
                    </span>{" "}
                    · {pick.kalshi_odds?.toFixed(2)}x payout
                  </p>
                  {pickTier === 40 && (
                    <p className="mt-3 text-xs text-warn">
                      Expanded to 40%+ likely — nothing on this match cleared 49%+.
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-ink-low">
                  Nothing on this match is 40%+ likely right now — no honest
                  pick to make.
                </p>
              )}
            </section>
            </Reveal>

            {/* Scoreline distribution */}
            <Reveal>
            <section className="mb-14">
              <Eyebrow className="mb-2">simulation</Eyebrow>
              <h3 className="mb-4 text-lg font-medium text-ink-hi">
                Most likely scorelines <span className="text-sm font-normal text-ink-low">· {">"}10,000 simulations</span>
              </h3>
              <div className="space-y-2.5">
                {pred.scorelines.slice(0, 8).map((s) => (
                  <div key={s.score} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 font-mono text-sm tabular-nums text-ink-mid">{s.score}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elev2">
                      <div
                        className="h-full rounded-full bg-accent/70"
                        style={{ width: `${Math.min(s.prob * 400, 100)}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-ink-low">{pct(s.prob)}</span>
                  </div>
                ))}
              </div>
            </section>
            </Reveal>

            {/* Every market priced */}
            <Reveal>
            <section className="mb-14">
              <Eyebrow className="mb-2">markets</Eyebrow>
              <h3 className="mb-4 text-lg font-medium text-ink-hi">
                Every Kalshi market on this match
              </h3>
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-elev text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
                    <tr>
                      <th className="px-4 py-3 font-normal">Market</th>
                      <th className="px-3 py-3 text-right font-normal">Likelihood</th>
                      <th className="px-3 py-3 text-right font-normal">Edge</th>
                      <th className="px-3 py-3 text-right font-normal">Multiplier</th>
                      <th className="px-4 py-3 text-center font-normal">Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMarkets.map((m) => (
                      <tr key={m.market_id} className="border-t border-line transition-colors hover:bg-elev">
                        <td className="px-4 py-3 text-ink-hi">{m.market_title}</td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums text-ink-hi">
                          {pct(m.model_probability)}
                        </td>
                        <td className={`px-3 py-3 text-right font-mono tabular-nums ${
                          m.edge >= 0 ? "text-accent" : "text-neg"
                        }`}>
                          {signedPct(m.edge)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums text-ink-mid">
                          {m.kalshi_odds?.toFixed(2)}x
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleWatch(m.market_id, m.market_title)}
                            title={watched.has(m.market_id)
                              ? "Watching — you'll be pinged when the price is ripe. Click to stop."
                              : "Notify me when this bet's timing is ripe"}
                            className={`rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                              watched.has(m.market_id)
                                ? "border-warn/50 text-warn hover:border-warn"
                                : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"
                            }`}
                          >
                            {watched.has(m.market_id) ? "Watching" : "Watch"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                Watched bets are polled every 30s. You get a Discord ping + feed entry
                the moment the ripeness score crosses the alert threshold with positive edge.
              </p>
            </section>
            </Reveal>

            {/* Prediction timeline */}
            {timeline.length > 1 && (
              <Reveal>
              <section>
                <Eyebrow className="mb-2">history</Eyebrow>
                <h3 className="mb-4 text-lg font-medium text-ink-hi">
                  How the home-win prediction evolved today
                </h3>
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full text-sm">
                    <thead className="bg-elev text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
                      <tr>
                        <th className="px-4 py-2.5 font-normal">Time</th>
                        <th className="px-3 py-2.5 text-right font-normal">Model</th>
                        <th className="px-3 py-2.5 text-right font-normal">Market</th>
                        <th className="px-3 py-2.5 text-right font-normal">Edge</th>
                        <th className="px-3 py-2.5 text-right font-normal">Conf</th>
                        <th className="px-4 py-2.5 font-normal">Run</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.map((p, i) => (
                        <tr key={i} className={`border-t border-line ${p.is_final ? "bg-live/5" : ""}`}>
                          <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-ink-low">
                            {new Date(p.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-hi">{pct(p.model_probability)}</td>
                          <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-low">
                            {pct(p.implied_probability)}
                          </td>
                          <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                            p.edge >= 0 ? "text-accent" : "text-neg"
                          }`}>
                            {signedPct(p.edge)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-low">{pct(p.confidence)}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-ink-low">
                            {p.is_final ? "🔒 FINAL" : p.source.replace("_", " ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              </Reveal>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ScoutCard({ blurb, fallbackName }: {
  blurb: TeamBlurb;
  fallbackName: string;
}) {
  const name = blurb.team || fallbackName;
  if (!blurb.scouting) {
    return (
      <div className="rounded-2xl border border-line bg-elev p-5">
        <p className="text-sm font-medium text-ink-hi">{flag(name)} {name}</p>
        <p className="mt-2 text-xs text-ink-low">No scouting note yet.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-line bg-elev p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-hi">{flag(name)} {name}</p>
        {blurb.provisional && (
          <span
            title="Running on provisional (unsourced) stats"
            className="rounded-md border border-warn/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-warn"
          >
            provisional
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed text-ink-mid">{blurb.scouting}</p>
      {(blurb.attack != null && blurb.defence != null) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
          <span>atk {blurb.attack.toFixed(2)}</span>
          <span>def {blurb.defence.toFixed(2)}</span>
          {blurb.form != null && <span>form {(blurb.form * 100).toFixed(0)}%</span>}
          {blurb.fatigue != null && blurb.fatigue >= 0.3 && (
            <span className="text-warn">tired {(blurb.fatigue * 100).toFixed(0)}%</span>
          )}
        </div>
      )}
    </div>
  );
}

function OutcomeBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span title={label} className="w-28 shrink-0 truncate text-xs text-ink-mid sm:w-32 sm:text-sm">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elev2">
        <div
          className="h-full rounded-full bg-accent/70"
          style={{ width: `${Math.min(value * 100, 100)}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums text-ink-hi">
        {pct(value)}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low sm:text-[11px]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-ink-hi sm:text-3xl">{value}</p>
    </div>
  );
}

// Model prediction panel — the Monte Carlo forecast in plain terms: each half,
// full time, whether it goes to ET/penalties (knockout), and the most likely
// final scores. All derived from the same simulation as the priced markets.
function ModelPrediction({ summary, scorelines, home, away }: {
  summary: PredictionSummary;
  scorelines: { score: string; prob: number }[];
  home: string;
  away: string;
}) {
  const ft = summary.full_time;
  const adv = summary.advance;
  const isKO = adv?.method === "simulated_et_pens";
  const halves = summary.halves;
  const topScores = scorelines.slice(0, 4);

  // "home-away" score string -> "🇲🇦 0–0 🇫🇷"
  const scoreLabel = (s: string) => {
    const [h, a] = s.split("-");
    return `${flag(home)} ${h}–${a} ${flag(away)}`;
  };

  return (
    <section className="mb-10 rounded-2xl border border-line bg-elev p-5 sm:p-6">
      <Eyebrow className="mb-1">model prediction · based on team data</Eyebrow>
      <p className="mb-5 text-[11px] leading-relaxed text-ink-faint">
        Monte Carlo forecast from each side&apos;s attack, defence, form, fatigue and Elo.
      </p>

      {halves && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <HalfCard title="First half" d={halves.first_half} home={home} away={away} />
          <HalfCard title="Second half" d={halves.second_half} home={home} away={away} />
        </div>
      )}

      <div className="mb-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
          Full time · 90 min
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <FtCell label={home} value={ft.home_win} lead={ft.home_win >= ft.draw && ft.home_win >= ft.away_win} />
          <FtCell label="Draw" value={ft.draw} lead={ft.draw > ft.home_win && ft.draw >= ft.away_win} />
          <FtCell label={away} value={ft.away_win} lead={ft.away_win > ft.home_win && ft.away_win > ft.draw} />
        </div>
      </div>

      {isKO && adv && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <ChanceChip label="Goes to extra time?" p={adv.p_reach_et} />
          <ChanceChip label="Goes to penalties?" p={adv.p_reach_pens ?? 0} />
        </div>
      )}

      <div>
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
          Most likely final score · 90 min
        </p>
        <div className="space-y-2.5">
          {topScores.map((s) => (
            <div key={s.score} className="flex items-center gap-3">
              <span className="w-32 shrink-0 font-mono text-sm tabular-nums text-ink-hi">{scoreLabel(s.score)}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elev2">
                <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.min(s.prob * 400, 100)}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-ink-low">{pct(s.prob)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-ink-faint">
        Results are the 90-minute score.{isKO && " Extra time and penalties only apply if level at full time."}{" "}
        Each half is modelled at half the match rate.
      </p>
    </section>
  );
}

function HalfCard({ title, d, home, away }: {
  title: string;
  d: HalfDist;
  home: string;
  away: string;
}) {
  // The lean: which side is more likely ahead at the break (usually level —
  // most halves are tight). Reported alongside expected goals + goal chance,
  // which are what actually differ between matchups and between the two halves.
  const opts: [string, number][] = [
    [`${home} ahead`, d.home_win], ["Level", d.draw], [`${away} ahead`, d.away_win],
  ];
  opts.sort((a, b) => b[1] - a[1]);
  const [label, prob] = opts[0];
  return (
    <div className="rounded-xl border border-line bg-bs p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">{title}</p>
      <p className="mt-2 text-sm text-ink-hi">
        {label} <span className="font-mono text-xs tabular-nums text-ink-low">{pct(prob)}</span>
      </p>
      <p className="mt-1.5 font-mono text-xs tabular-nums text-ink-mid">
        ~{d.exp_goals.toFixed(1)} goals <span className="text-ink-faint">· {pct(d.goal_pct)} chance of a goal</span>
      </p>
    </div>
  );
}

function FtCell({ label, value, lead }: { label: string; value: number; lead: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${lead ? "border-accent/40 bg-accent/5" : "border-line"}`}>
      <p className="truncate text-xs text-ink-mid" title={label}>{label}</p>
      <p className={`mt-1 font-mono text-lg tabular-nums ${lead ? "text-accent" : "text-ink-hi"}`}>{pct(value)}</p>
    </div>
  );
}

function ChanceChip({ label, p }: { label: string; p: number }) {
  return (
    <div className="rounded-xl border border-line bg-bs p-4">
      <p className="text-xs text-ink-mid">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-2xl tabular-nums text-ink-hi">{pct(p)}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">chance</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-elev2">
        <div className="h-full rounded-full bg-accent/60" style={{ width: `${Math.min(p * 100, 100)}%` }} />
      </div>
    </div>
  );
}

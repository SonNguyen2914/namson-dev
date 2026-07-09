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
  PredictionResponse, PredictionSummary, HalfDist, MarketPrediction,
  PlayerPropsResponse,
  TimelinePoint, TeamInfoResponse, TeamBlurb,
} from "../../../lib/suggesterApi";
import LivePanel from "../../../components/LivePanel";
import { Eyebrow, Reveal } from "../../../components/ui";

// Same floors as the backend board — the pick is just row #1 of this
// match's slice of the same likelihood-first ranking.
const PRIMARY_FLOOR = 0.49;
const FALLBACK_FLOOR = 0.40;

// Market families for the grouped table, in display order. A market that
// matches no test lands in "Other" (visible, never silently dropped).
const MARKET_GROUPS: { id: string; label: string; test: (k: string | null | undefined) => boolean }[] = [
  { id: "winner", label: "Winner · 90 min", test: (k) => k === "home_win" || k === "away_win" || k === "draw" },
  { id: "advance", label: "To advance", test: (k) => k === "home_advance" || k === "away_advance" },
  { id: "goals", label: "Goals · totals + both teams to score", test: (k) => !!k && (/^over_|^under_/.test(k) || k === "btts") },
  { id: "margin", label: "Margin of victory", test: (k) => !!k && /margin/.test(k) },
  { id: "etpens", label: "Extra time / penalties", test: (k) => !!k && /_win_(et|pens)$/.test(k) },
  { id: "score", label: "Exact score", test: (k) => !!k && /^score_/.test(k) },
];

type MktSortKey = "likelihood" | "edge" | "multiplier";

// Risk tiers for the strategy tabs: LOW = high-likelihood bets, HIGH = longshots.
const RISK_TIERS = [
  { id: "low", label: "Low risk", test: (p: number) => p >= 0.65, blurb: "High-likelihood bets — small multipliers, most likely to land." },
  { id: "med", label: "Medium risk", test: (p: number) => p >= 0.40 && p < 0.65, blurb: "Coin-flip territory — moderate multipliers." },
  { id: "high", label: "High risk", test: (p: number) => p < 0.40, blurb: "Longshots — big multipliers, usually lose." },
] as const;

export default function MatchDetail() {
  const router = useRouter();
  const matchId = router.query.matchId as string | undefined;

  const [pred, setPred] = useState<PredictionResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [teams, setTeams] = useState<{ home: string; away: string } | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfoResponse | null>(null);
  const [pProps, setPProps] = useState<PlayerPropsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // grouped markets table: sort + collapsed groups
  const [mktSortKey, setMktSortKey] = useState<MktSortKey>("likelihood");
  const [mktSortDir, setMktSortDir] = useState<"asc" | "desc">("desc");
  const [mktCollapsed, setMktCollapsed] = useState<Set<string>>(new Set());
  const [mktTab, setMktTab] = useState<"lines" | "players">("lines");

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
      // Player props — model estimates; section hides itself if unavailable.
      try {
        const pp = await api.playerProps(matchId);
        if (alive && pp.available) setPProps(pp);
      } catch { /* no player data — section won't render */ }
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

  // --- grouped markets table helpers -----------------------------------
  const marketGroups = (() => {
    const used = new Set<string>();
    const out: { group: { id: string; label: string }; rows: MarketPrediction[] }[] = [];
    for (const g of MARKET_GROUPS) {
      const rows = sortedMarkets.filter((m) => g.test(m.outcome_key));
      rows.forEach((m) => used.add(m.market_id));
      if (rows.length) out.push({ group: g, rows });
    }
    const rest = sortedMarkets.filter((m) => !used.has(m.market_id));
    if (rest.length) out.push({ group: { id: "other", label: "Other" }, rows: rest });
    return out;
  })();
  const mktVal = (m: MarketPrediction) =>
    mktSortKey === "likelihood" ? m.model_probability
    : mktSortKey === "edge" ? m.edge : m.kalshi_odds;
  const sortMkts = (rows: MarketPrediction[]) => {
    const dir = mktSortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (mktVal(a) - mktVal(b)) * dir);
  };
  const onMktSort = (k: MktSortKey) => {
    if (k === mktSortKey) setMktSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setMktSortKey(k); setMktSortDir("desc"); }
  };
  const mktArrow = (k: MktSortKey) =>
    mktSortKey === k ? (mktSortDir === "asc" ? " ↑" : " ↓") : "";
  const toggleMktGroup = (id: string) =>
    setMktCollapsed((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

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

        {/* Headline stats — xG + confidence, right under the hero */}
        {pred && (
          <Reveal>
            <section className="mb-10 grid grid-cols-3 gap-3">
              <Stat label={`${home} xG`} value={pred.xg.home.toFixed(2)} />
              <Stat label={`${away} xG`} value={pred.xg.away.toFixed(2)} />
              <Stat label="model confidence" value={pct(pred.confidence)} />
            </section>
          </Reveal>
        )}

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
                  xg={pred.xg}
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
                  The pure-model numbers above, shrunk 40% toward Kalshi&apos;s live
                  price (60% model + 40% market) — liquid markets are usually
                  right, so this is the humbler number the board runs on. That
                  blend is why it differs from Full time above. Read straight
                  off the priced markets below — independent numbers, so they
                  won&apos;t sum to exactly 100%.
                </p>
              </section>
              </Reveal>
            )}

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

            {/* Betting strategy + fund divider */}
            <Reveal>
              <StrategySection markets={sortedMarkets} />
            </Reveal>

            {/* Every market priced — grouped by type, sortable, collapsible */}
            <Reveal>
            <section className="mb-14">
              <Eyebrow className="mb-2">markets</Eyebrow>
              <h3 className="mb-3 text-lg font-medium text-ink-hi">
                Every Kalshi market on this match
              </h3>
              <div className="mb-4 flex gap-1.5">
                {([["lines", "Game lines"], ["players", "Player props"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setMktTab(id)}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                      mktTab === id
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {mktTab === "players" ? (
                pProps ? <PlayerPropsTab pp={pProps} onWatch={toggleWatch} watched={watched} />
                       : <p className="rounded-xl border border-line p-4 text-sm text-ink-low">Player data unavailable for this match.</p>
              ) : (<>
              <p className="mb-4 text-xs text-ink-low">
                Click a column to sort · click a group to collapse
              </p>
              <div className="overflow-x-auto rounded-xl border border-line">
                <div className="min-w-[560px]">
                  {/* sortable header */}
                  <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5.5rem_4.5rem] items-center gap-x-3 border-b border-line bg-elev px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
                    <span>Market</span>
                    <button onClick={() => onMktSort("likelihood")} className="text-right transition-colors hover:text-ink-hi">
                      Likelihood{mktArrow("likelihood")}
                    </button>
                    <button onClick={() => onMktSort("edge")} className="text-right transition-colors hover:text-ink-hi">
                      Edge{mktArrow("edge")}
                    </button>
                    <button onClick={() => onMktSort("multiplier")} className="text-right transition-colors hover:text-ink-hi">
                      Mult{mktArrow("multiplier")}
                    </button>
                    <span className="text-right">Alert</span>
                  </div>

                  {marketGroups.map(({ group, rows }) => {
                    const closed = mktCollapsed.has(group.id);
                    return (
                      <div key={group.id}>
                        <button
                          onClick={() => toggleMktGroup(group.id)}
                          className="flex w-full items-center gap-2.5 border-b border-line bg-elev/40 px-4 py-2.5 text-left transition-colors hover:bg-elev"
                        >
                          <span className={`text-ink-faint transition-transform ${closed ? "" : "rotate-90"}`}>▸</span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid">{group.label}</span>
                          <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
                            {rows.length} market{rows.length === 1 ? "" : "s"}
                          </span>
                        </button>
                        {!closed && sortMkts(rows).map((m) => (
                          <div
                            key={m.market_id}
                            className="grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5.5rem_4.5rem] items-center gap-x-3 border-b border-line px-4 py-3 text-sm transition-colors hover:bg-elev"
                          >
                            <span className="min-w-0 truncate pr-2 text-ink-hi" title={m.market_title}>{m.market_title}</span>
                            <span className="text-right font-mono tabular-nums text-ink-hi">{pct(m.model_probability)}</span>
                            <span className={`text-right font-mono tabular-nums ${m.edge >= 0 ? "text-accent" : "text-neg"}`}>
                              {signedPct(m.edge)}
                            </span>
                            <span className="text-right font-mono tabular-nums text-ink-mid">{m.kalshi_odds?.toFixed(2)}x</span>
                            <span className="text-right">
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
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                Watched bets are polled every 30s. You get a Discord ping + feed entry
                the moment the ripeness score crosses the alert threshold with positive edge.
                Multipliers are the buyable ask price, not the midpoint.
              </p>
              </>)}
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
function ModelPrediction({ summary, scorelines, xg, home, away }: {
  summary: PredictionSummary;
  scorelines: { score: string; prob: number }[];
  xg: { home: number; away: number };
  home: string;
  away: string;
}) {
  const ft = summary.full_time;
  const adv = summary.advance;
  const isKO = adv?.method === "simulated_et_pens";
  const halves = summary.halves;
  const topScores = scorelines.slice(0, 8);

  // --- Plain-language "why" notes, derived from the model's own numbers ---
  // Halves: 45 minutes rarely separates two sides, and goals skew after the
  // break. If the second half's lean tips to a team, name it.
  const sh = halves?.second_half;
  const shLean =
    sh == null ? null
    : sh.home_win > sh.draw && sh.home_win > sh.away_win ? home
    : sh.away_win > sh.draw && sh.away_win > sh.home_win ? away
    : null;
  const halfNote = halves && (
    `Why: 45 minutes is rarely enough to separate two sides, so "level" ` +
    `leads most halves. Goals skew after the break — tiring legs, ` +
    `substitutions, stoppage time — which is why the second half carries ` +
    `more expected goals` +
    (shLean ? ` and tilts toward ${shLean}` : "") + `.`
  );

  // ET/pens: reaching ET *is* the 90-min draw; pens follow when ET stays
  // level too. The xG gap says whether a level 90 is likely in this matchup.
  const xgFav = xg.home >= xg.away ? home : away;
  const xgHi = Math.max(xg.home, xg.away).toFixed(2);
  const xgLo = Math.min(xg.home, xg.away).toFixed(2);
  const gap = Math.abs(xg.home - xg.away);
  const gapRead =
    gap >= 0.4
      ? `${xgFav}'s edge (${xgHi} vs ${xgLo} expected goals) usually settles it inside 90 minutes — that's what keeps these chances from climbing higher.`
      : gap < 0.15
      ? `The sides are nearly even (${xgHi} vs ${xgLo} expected goals), so a level 90 minutes is a real possibility — that's what pushes these chances up.`
      : `The gap between the sides is modest (${xgHi} vs ${xgLo} expected goals), so a level 90 minutes stays live.`;
  const etNote =
    `Why: extra time happens only if the 90 minutes end level, so it equals ` +
    `the draw chance above; penalties follow when 30 more minutes still ` +
    `can't split them (roughly half the time). ${gapRead}`;

  // "home-away" score string -> "🇲🇦 0–0 🇫🇷"
  const scoreLabel = (s: string) => {
    const [h, a] = s.split("-");
    return `${flag(home)} ${h}–${a} ${flag(away)}`;
  };

  return (
    <section className="mb-10 rounded-2xl border border-line bg-elev p-5 sm:p-6">
      <Eyebrow className="mb-1">model prediction · pure model</Eyebrow>
      <p className="mb-5 text-[11px] leading-relaxed text-ink-faint">
        Monte Carlo forecast from each side&apos;s attack, defence, form, fatigue
        and Elo — the model&apos;s own view, before any market anchoring.
      </p>

      {halves && (
        <div className="mb-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <HalfCard title="First half" d={halves.first_half} home={home} away={away} />
            <HalfCard title="Second half" d={halves.second_half} home={home} away={away} />
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-faint">
            {halfNote}
          </p>
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
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <ChanceChip label="Goes to extra time?" p={adv.p_reach_et} />
            <ChanceChip label="Goes to penalties?" p={adv.p_reach_pens ?? 0} />
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-faint">
            {etNote}
          </p>
        </div>
      )}

      <div>
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
          Most likely final score · 90 min · {">"}10,000 simulations
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

// ---------------------------------------------------------------------------
// Betting strategy — max return per risk tier, plus a fund divider.
// Tabs (LOW/MED/HIGH) save vertical space. Within a tier, bets are ranked by
// expected value per $1 (model_p x payout - 1) using the market-anchored
// probabilities and the buyable ask multiplier. The fund divider allocates a
// user-entered bankroll across the tier's positive-EV bets by quarter-Kelly —
// deliberately conservative, and always leaving the un-allocated remainder in
// reserve. Honest framing: this is model output, not advice.
function StrategySection({ markets }: { markets: MarketPrediction[] }) {
  const [tier, setTier] = useState<(typeof RISK_TIERS)[number]["id"]>("low");
  const [fund, setFund] = useState(100);

  const active = RISK_TIERS.find((t) => t.id === tier)!;
  // Kalshi's trading fee is 0.07·P·(1−P) per contract, charged on the price —
  // the true buy cost is P + fee, so the NET payout multiplier is 1/(P+fee).
  // All EV/stake math below is net of fees (the raw table above is gross).
  const netOdds = (impliedP: number) => {
    const cost = impliedP + 0.07 * impliedP * (1 - impliedP);
    return cost > 0 ? 1 / cost : 0;
  };
  const rows = markets
    .filter((m) => active.test(m.model_probability) && m.kalshi_odds > 1)
    .map((m) => {
      const odds = netOdds(m.implied_probability);
      return { ...m, netOdds: odds, ev: m.model_probability * odds - 1 };
    })
    .sort((a, b) => b.ev - a.ev)
    .slice(0, 6);

  // Quarter-Kelly stake fraction per bet (clamped at 0 for negative edges):
  // f* = (p·b − q) / b with b = NET payout−1; we bet f*/4 for humility.
  const withKelly = rows.map((m) => {
    const b = m.netOdds - 1;
    const f = b > 0 ? Math.max(0, (m.model_probability * b - (1 - m.model_probability)) / b) : 0;
    return { ...m, kelly: f * 0.25 };
  });
  const totalFrac = withKelly.reduce((s, m) => s + m.kelly, 0);
  const scale = totalFrac > 1 ? 1 / totalFrac : 1; // never allocate >100%
  const allocated = withKelly.map((m) => ({
    ...m,
    stake: m.kelly * scale * fund,
  }));
  const reserve = fund - allocated.reduce((s, m) => s + m.stake, 0);

  return (
    <section className="mb-14 rounded-2xl border border-line bg-elev p-5 sm:p-6">
      <Eyebrow className="mb-1">betting strategy · by risk</Eyebrow>
      <p className="mb-4 text-[11px] leading-relaxed text-ink-faint">
        Ranked by expected value per $1 — anchored likelihood × buyable payout,
        net of Kalshi&apos;s 0.07·P·(1−P) trading fee. Model output, not financial advice.
      </p>

      {/* risk tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {RISK_TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTier(t.id)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              tier === t.id
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mb-4 text-xs text-ink-low">{active.blurb}</p>

      {/* fund divider input */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-ink-mid">Fund to divide</span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-sm text-ink-low">$</span>
          <input
            type="number" min={1} max={1000000} value={fund}
            onChange={(e) => setFund(Math.max(1, Number(e.target.value) || 1))}
            className="w-24 rounded-lg border border-line bg-bs px-2.5 py-1.5 font-mono text-sm tabular-nums text-ink-hi outline-none focus:border-accent/60"
          />
        </div>
        <span className="font-mono text-[11px] text-ink-faint">
          quarter-Kelly split · reserve stays unbet
        </span>
      </div>

      {allocated.length === 0 ? (
        <p className="rounded-xl border border-line p-4 text-sm text-ink-low">
          No markets in this risk band right now.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[minmax(0,1fr)_5rem_4.5rem_5.5rem_6rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
              <span>Market</span>
              <span className="text-right">Likely</span>
              <span className="text-right">Net mult</span>
              <span className="text-right">Stake</span>
              <span className="text-right">If it hits</span>
            </div>
            {allocated.map((m) => (
              <div
                key={m.market_id}
                className="grid grid-cols-[minmax(0,1fr)_5rem_4.5rem_5.5rem_6rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0"
              >
                <span className="min-w-0 truncate pr-2 text-ink-hi" title={m.market_title}>{m.market_title}</span>
                <span className="text-right font-mono tabular-nums text-ink-mid">{pct(m.model_probability)}</span>
                <span className="text-right font-mono tabular-nums text-ink-mid">{m.netOdds.toFixed(2)}x</span>
                <span className={`text-right font-mono tabular-nums ${m.stake >= 0.5 ? "text-accent" : "text-ink-faint"}`}>
                  ${m.stake.toFixed(2)}
                </span>
                <span className="text-right font-mono tabular-nums text-ink-mid">
                  ${(m.stake * m.netOdds).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        Reserve (unbet): <span className="font-mono tabular-nums text-ink-mid">${reserve.toFixed(2)}</span> of ${fund.toFixed(0)}.
        Stakes are quarter-Kelly on the anchored model probability — bets with no
        positive expected value get $0 by design. Kelly assumes the model is right;
        it is an anchored estimate, so treat sizes as a ceiling, not a target.
      </p>
    </section>
  );
}


// ---------------------------------------------------------------------------
// Player props tab. TOP: Kalshi's real tournament-anytime scorer markets
// ("Will X score a goal in the 2026 World Cup?") priced like every other
// market — anchored likelihood, edge vs the buyable ask, multiplier; players
// who already scored settle Yes and are labelled, not priced. BOTTOM: this
// match's model estimates (1+/2+/3+ goals, first goal) — Kalshi lists no
// per-match scorer or assist markets, and FIFA publishes no assist data, so
// those cannot be priced without inventing numbers.
function PlayerPropsTab({ pp, onWatch, watched }: {
  pp: PlayerPropsResponse;
  onWatch: (marketId: string, title: string) => void;
  watched: Set<string>;
}) {
  const [tab, setTab] = useState<"home" | "away">("home");
  const rows = (tab === "home" ? pp.home : pp.away) ?? [];
  const priced = rows.filter((r) => r.market_id && !r.already_scored && r.likelihood != null);
  const settled = rows.filter((r) => r.already_scored);
  return (
    <div>
      <div className="mb-4 flex gap-1.5">
        {(["home", "away"] as const).map((side) => (
          <button key={side} onClick={() => setTab(side)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              tab === side ? "border-accent/60 bg-accent/10 text-accent"
                           : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"}`}>
            {flag((side === "home" ? pp.home_team : pp.away_team) ?? "")}{" "}
            {side === "home" ? pp.home_team : pp.away_team}
          </button>
        ))}
      </div>

      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
        Kalshi market · scores a goal in the tournament
      </p>
      {priced.length === 0 && settled.length === 0 ? (
        <p className="mb-5 rounded-xl border border-line p-4 text-sm text-ink-low">
          No open Kalshi player markets matched for this team right now.
        </p>
      ) : (
        <div className="mb-2 overflow-x-auto rounded-xl border border-line">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[minmax(0,1fr)_6rem_5rem_5.5rem_4.5rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
              <span>Player</span><span className="text-right">Likelihood</span>
              <span className="text-right">Edge</span><span className="text-right">Multiplier</span>
              <span className="text-right">Alert</span>
            </div>
            {priced.map((r) => (
              <div key={r.shirt} className="grid grid-cols-[minmax(0,1fr)_6rem_5rem_5.5rem_4.5rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate pr-2 text-ink-hi">{r.player}</span>
                <span className="text-right font-mono tabular-nums text-ink-hi">{pct(r.likelihood!)}</span>
                <span className={`text-right font-mono tabular-nums ${r.edge! >= 0 ? "text-accent" : "text-neg"}`}>{signedPct(r.edge!)}</span>
                <span className="text-right font-mono tabular-nums text-ink-mid">{r.multiplier != null ? `${r.multiplier.toFixed(2)}x` : "—"}</span>
                <span className="text-right">
                  <button onClick={() => onWatch(r.market_id!, `${r.player} to score (tournament)`)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                      watched.has(r.market_id!) ? "border-warn/50 text-warn hover:border-warn"
                        : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"}`}>
                    {watched.has(r.market_id!) ? "Watching" : "Watch"}
                  </button>
                </span>
              </div>
            ))}
            {settled.map((r) => (
              <div key={r.shirt} className="grid grid-cols-[minmax(0,1fr)_6rem_5rem_5.5rem_4.5rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0 opacity-70">
                <span className="min-w-0 truncate pr-2 text-ink-mid">{r.player}</span>
                <span className="col-span-4 text-right font-mono text-[11px] uppercase tracking-wider text-accent">✓ already scored — settles yes</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mb-6 text-[11px] leading-relaxed text-ink-faint">
        Likelihood is anchored (60% model · 40% market); the model is
        P(scores in the team&apos;s remaining tournament run) from bracket-path
        enumeration. Thin books make some asks extreme — edge is honest, not
        an endorsement.
      </p>

      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
        This match · model estimates (no Kalshi market exists)
      </p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[minmax(0,1fr)_5rem_5rem_5rem_5.5rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
            <span>Player</span><span className="text-right">1+ goal</span>
            <span className="text-right">2+ goals</span><span className="text-right">3+ goals</span>
            <span className="text-right">First goal</span>
          </div>
          {rows.map((r) => (
            <div key={r.shirt} className="grid grid-cols-[minmax(0,1fr)_5rem_5rem_5rem_5.5rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0">
              <span className="min-w-0 truncate pr-2 text-ink-hi">
                <span className="mr-2 font-mono text-[11px] text-ink-faint">#{r.shirt}</span>{r.player}
                {r.starts < r.matches && <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-ink-faint">rotation</span>}
              </span>
              <span className="text-right font-mono tabular-nums text-ink-hi">{pct(r.anytime)}</span>
              <span className="text-right font-mono tabular-nums text-ink-mid">{r.p2 != null ? pct(r.p2) : "—"}</span>
              <span className="text-right font-mono tabular-nums text-ink-mid">{r.p3 != null ? pct(r.p3) : "—"}</span>
              <span className="text-right font-mono tabular-nums text-ink-mid">{pct(r.first_goal)}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        {pp.disclaimer} Assists: Kalshi lists no assist markets and FIFA&apos;s
        match reports publish no assist data — not priced rather than invented.
      </p>
    </div>
  );
}

// Match detail — namson.dev/bet-suggester/market/BRA_SRB
// Apple-Sports treatment: the matchup is the hero, outcome probabilities as
// thin horizontal stat bars, everything else glanceable and subordinate.
// On-demand predictions: cached by default, "Refresh" forces a fresh
// Monte Carlo run against live odds. Shows xG, scoreline distribution,
// every market priced, and how the prediction evolved over the day.
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import {
  api, flag, pct, signedPct, countdown, kickoffLocal,
  PredictionResponse, PredictionSummary, HalfDist, MarketPrediction,
  PlayerPropsResponse, TeamNewsResponse, LiveScoreEntry,
  ReferenceOddsResponse, ResearchResponse,
  TimelinePoint, TeamInfoResponse, TeamBlurb,
} from "../../../lib/suggesterApi";
import { Eyebrow, Reveal } from "../../../components/ui";
import { Collapse, NavChip, RouteProgress, SkeletonRows, Toaster, TopBar, toast, useScrollSpy } from "../../../components/chrome";

// Same floors as the backend board — the pick is just row #1 of this
// match's slice of the same likelihood-first ranking.
const PRIMARY_FLOOR = 0.49;
const FALLBACK_FLOOR = 0.40;

// Market families for the grouped table, in display order. A market that
// matches no test lands in "Other" (visible, never silently dropped).
const MARKET_GROUPS: { id: string; label: string; test: (k: string | null | undefined) => boolean }[] = [
  { id: "winner", label: "Winner · 90 min", test: (k) => k === "home_win" || k === "away_win" || k === "draw" },
  { id: "advance", label: "To advance", test: (k) => k === "home_advance" || k === "away_advance" },
  { id: "goals", label: "Goals · totals, BTTS, first goal", test: (k) => !!k && (/^over_|^under_/.test(k) || k === "btts" || /_first_goal$|^no_goal$/.test(k)) },
  { id: "margin", label: "Margin of victory", test: (k) => !!k && /margin/.test(k) },
  { id: "etpens", label: "Extra time / penalties", test: (k) => !!k && /_win_(et|pens)$/.test(k) },
  { id: "score", label: "Exact score", test: (k) => !!k && /^score_/.test(k) },
];

type MktSortKey = "likelihood" | "edge" | "multiplier";

// ET/pens contracts are a REFINEMENT of a draw-first thesis, never a side
// bet: "France wins in extra time" is only a sane leg once you've already
// decided the 90 minutes end level. The strategy engine therefore allows
// them only in candidates made ENTIRELY of ET/pens legs (main bet = the
// draw, next step = who wins it), never mixed with 90-minute winners.
const ET_REFINEMENT_KEYS = new Set([
  "home_win_et", "away_win_et", "home_win_pens", "away_win_pens",
]);


export default function MatchDetail() {
  const router = useRouter();
  const matchId = router.query.matchId as string | undefined;

  const [pred, setPred] = useState<PredictionResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [teams, setTeams] = useState<{ home: string; away: string } | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfoResponse | null>(null);
  const [pProps, setPProps] = useState<PlayerPropsResponse | null>(null);
  const [news, setNews] = useState<TeamNewsResponse | null>(null);
  const [research, setResearch] = useState<ResearchResponse | null>(null);
  const [, setClock] = useState(0); // 1s tick — drives the hero countdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // grouped markets table: sort + collapsed groups
  const [mktSortKey, setMktSortKey] = useState<MktSortKey>("likelihood");
  const [mktSortDir, setMktSortDir] = useState<"asc" | "desc">("desc");
  const [mktCollapsed, setMktCollapsed] = useState<Set<string>>(new Set());
  const [mktTab, setMktTab] = useState<"lines" | "players" | "reference">("lines");
  const [refOdds, setRefOdds] = useState<ReferenceOddsResponse | null>(null);

  const load = useCallback(async (force: boolean) => {
    if (!matchId) return;
    try {
      const [p, t, wl] = await Promise.all([
        api.prediction(matchId, force),
        api.timeline(matchId),
        api.watchlist(),
      ]);
      setPred(p);
      setTimeline(t.points);
      setWatched(new Set(wl.watchlist.map((w) => w.market_id)));
      setError("");
      if (force) toast("Fresh simulation done — board repriced.");
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
      // Post-match research record (result + settlement); renders only
      // once the match is over and a closing snapshot exists.
      try {
        const rs = await api.research(matchId);
        if (alive && rs.result && rs.closing.length) setResearch(rs);
      } catch { /* no settlement view */ }
    })();
    // Team news: kickoff/venue for the hero + official lineups once posted
    // (~1h before kickoff). Polled so a viewer parked on the page catches the
    // lineup drop; ESPN is keyless and the backend caches it for 60s.
    const loadNews = async () => {
      try {
        const tn = await api.teamNews(matchId);
        if (!alive) return;
        setNews(tn);
        setTeams((t) => t ?? { home: tn.home_team, away: tn.away_team });
      } catch { /* hero just won't show venue/countdown */ }
    };
    loadNews();
    const newsPoll = setInterval(loadNews, 120000);
    const tick = setInterval(() => setClock((c) => c + 1), 1000);
    return () => { alive = false; clearInterval(newsPoll); clearInterval(tick); };
  }, [matchId]);

  async function toggleWatch(marketId: string, marketTitle: string) {
    if (!matchId) return;
    if (watched.has(marketId)) {
      await api.unwatch(marketId);
      setWatched((prev) => { const n = new Set(prev); n.delete(marketId); return n; });
      toast(`Stopped watching: ${marketTitle}`);
    } else {
      await api.watch(matchId, marketId, marketTitle);
      setWatched((prev) => new Set(prev).add(marketId));
      toast(`Watching: ${marketTitle} — you'll be pinged when the timing is ripe.`);
    }
  }

  useEffect(() => {
    // Scheduled so load()'s setState runs in an async callback, not sync
    // inside the effect body (react-hooks/set-state-in-effect).
    const t = setTimeout(() => load(false), 0);
    return () => clearTimeout(t);
  }, [load]);

  // Sportsbook reference odds — fetched ONLY when the tab is first opened
  // (each uncached fetch spends the shared API-Football budget).
  useEffect(() => {
    if (mktTab !== "reference" || refOdds || !matchId) return;
    let alive = true;
    api.referenceOdds(matchId)
      .then((r) => { if (alive) setRefOdds(r); })
      .catch(() => {
        if (alive) setRefOdds({
          match_id: matchId, source: "api-football", home_team: "",
          away_team: "", available: false, reason: "backend unreachable",
        });
      });
    return () => { alive = false; };
  }, [mktTab, refOdds, matchId]);

  const [codeH, codeA] = (matchId ?? "_").split("_");
  const home = teams?.home ?? codeH ?? "Home";
  const away = teams?.away ?? codeA ?? "Away";
  const secsToKick = news
    ? Math.floor((new Date(news.kickoff).getTime() - Date.now()) / 1000)
    : null;

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
      pred.freshness === "locked"
        ? "border-live/40 text-live"
        : pred.freshness === "fresh"
        ? "border-accent/40 text-accent"
        : pred.is_stale
        ? "border-warn/40 text-warn"
        : "border-line text-ink-low"
    }`}>
      {pred.freshness === "locked"
        ? "🔒 T-10 locked view · settled"
        : pred.freshness === "fresh"
        ? `fresh · ${pred.inference_time_ms ?? "?"}ms inference`
        : pred.is_stale
        ? `stale · ${Math.round(pred.age_seconds / 60)}min old`
        : `cached · ${pred.age_seconds}s old`}
    </span>
  );

  // Post-settlement review: which side each market actually settled,
  // matched into the Markets table by ticker (replaces the Alert column).
  const settledMap = research?.result
    ? new Map(research.closing.map((c) => [c.market_id, c.result]))
    : null;

  // Site-wide live awareness: a small score chip in the top bar whenever
  // ANY match is in play (links home to the live box).
  const [liveNow, setLiveNow] = useState<LiveScoreEntry | null>(null);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const r = await api.liveScores();
        if (alive) setLiveNow(r.live.find((l) => !l.is_finished) ?? null);
      } catch { /* chip just stays hidden */ }
    };
    check();
    const id = setInterval(check, 45000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // the chip for the section you're reading lights up
  const activeSection = useScrollSpy(
    ["prediction", "strategy", "markets"], [pred != null]);

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>{matchId ?? "Match"} · Bet Suggester</title></Head>

      <RouteProgress />
      <Toaster />
      <TopBar back={{ href: "/bet-suggester", label: "board" }}
        title={`${home} vs ${away}`}>
        {liveNow && (
          <NavChip href="/bet-suggester">
            <span className="pulse-dot mr-1 inline-block h-1 w-1 rounded-full bg-live align-middle" />
            <span className="text-live">
              {liveNow.home.slice(0, 3)} {liveNow.home_goals}–{liveNow.away_goals} {liveNow.away.slice(0, 3)}
            </span>
          </NavChip>
        )}
        <NavChip href="#prediction" active={activeSection === "prediction"}>Prediction</NavChip>
        <NavChip href="#strategy" active={activeSection === "strategy"}>Strategy</NavChip>
        <NavChip onClick={() => {
          setMktTab("players");
          document.getElementById("markets")?.scrollIntoView();
        }}>Players</NavChip>
        <NavChip href="#markets" active={activeSection === "markets"}>Markets</NavChip>
      </TopBar>

      <div className="mx-auto max-w-4xl px-5 py-10">

        {/* ============ HERO — the matchup ============ */}
        <header className="hero-ambient mt-8 mb-12 rounded-3xl pb-2 text-center">
          <Eyebrow className="mb-4">{matchId}</Eyebrow>
          {/* each flag+name is an unbreakable unit, so a narrow screen wraps
              between teams — never orphaning a flag onto its own line */}
          <h1 className="text-4xl font-semibold tracking-tight text-ink-hi sm:text-5xl">
            <span className="whitespace-nowrap">
              {teams && <span className="mr-3">{flag(home)}</span>}
              {home}
            </span>
            <span className="mx-3 text-xl font-normal text-ink-faint sm:text-2xl">vs</span>
            <span className="whitespace-nowrap">
              {away}
              {teams && <span className="ml-3">{flag(away)}</span>}
            </span>
          </h1>

          {/* Match details — local kickoff, stadium, ticking countdown */}
          {news && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-xs tracking-wide text-ink-low">
              <span>{kickoffLocal(news.kickoff)}</span>
              {news.venue && (
                <>
                  <span className="text-ink-faint">·</span>
                  <span>{news.venue}</span>
                </>
              )}
              {secsToKick != null && secsToKick > 0 ? (
                <>
                  <span className="text-ink-faint">·</span>
                  <span className="tabular-nums text-accent">
                    kickoff in {countdown(secsToKick)}
                  </span>
                </>
              ) : secsToKick != null && secsToKick > -3 * 3600 ? (
                <>
                  <span className="text-ink-faint">·</span>
                  <span className="text-live">kicked off</span>
                </>
              ) : null}
            </div>
          )}

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

        {loading && !pred && !error && (
          <div className="mb-10 space-y-6">
            <SkeletonRows rows={1} height="h-24" />
            <div className="grid grid-cols-3 gap-3">
              <SkeletonRows rows={1} height="h-20" />
              <SkeletonRows rows={1} height="h-20" />
              <SkeletonRows rows={1} height="h-20" />
            </div>
            <SkeletonRows rows={4} />
          </div>
        )}

        {/* Headline stats — xG + confidence, right under the hero */}
        {pred && (
          <Reveal>
            <section className="mb-10">
              <div className="grid grid-cols-3 gap-3">
                <Stat label={`${home} xG`} value={pred.xg.home.toFixed(2)} />
                <Stat label={`${away} xG`} value={pred.xg.away.toFixed(2)} />
                <Stat label="model confidence" value={pct(pred.confidence)}
                  bar={pred.confidence} />
              </div>
              {/* the xG duel at a glance — one bar, two shares */}
              {pred.xg.home + pred.xg.away > 0 && (
                <div className="mt-3">
                  <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                    <div className="rounded-full bg-accent/75"
                      style={{ width: `${(pred.xg.home / (pred.xg.home + pred.xg.away)) * 100}%` }} />
                    <div className="flex-1 rounded-full bg-elev2" />
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    <span>{home} {pct(pred.xg.home / (pred.xg.home + pred.xg.away))} of expected goals</span>
                    <span>{away}</span>
                  </div>
                </div>
              )}
            </section>
          </Reveal>
        )}

        {/* How they play — scouting blurbs, a read aid (not a model input).
            Collapsed by default: read-once background, not match-day signal. */}
        {teamInfo && (teamInfo.home.scouting || teamInfo.away.scouting) && (
          <Reveal>
            <Collapse eyebrow="scouting" title="How they play" defaultOpen={false}>
              <div className="grid gap-3 sm:grid-cols-2">
                <ScoutCard blurb={teamInfo.home} fallbackName={home} />
                <ScoutCard blurb={teamInfo.away} fallbackName={away} />
              </div>
            </Collapse>
          </Reveal>
        )}

        {/* Team news moved to the landing page's live match box. The
            team-news fetch stays: the hero reads venue/kickoff/countdown
            from it, and Player props keep their squad tags. */}

        {pred && (
          <>
            {/* Model prediction — halves, full time, ET/pens, top scores */}
            {pred.summary && (
              <Reveal>
                <Collapse id="prediction" eyebrow="pure model" title="Model prediction">
                  <ModelPrediction
                    summary={pred.summary}
                    scorelines={pred.scorelines}
                    xg={pred.xg}
                    home={home}
                    away={away}
                  />
                </Collapse>
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

            {/* Live read moved to the landing page — it lives beside the
                live score card now, where an in-progress match is watched */}

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

            {/* Betting strategy — scenario engine + fund divider */}
            <Reveal>
              <Collapse id="strategy" eyebrow="scenario engine" title="Betting strategy">
                <StrategySection markets={sortedMarkets} summary={pred.summary ?? null}
                  scorelines={pred.scorelines} home={home} away={away} />
              </Collapse>
            </Reveal>

            {/* Every market priced — grouped by type, sortable, collapsible */}
            <Reveal>
            <section id="markets" className="mb-14">
              <Eyebrow className="mb-2">markets</Eyebrow>
              <h3 className="mb-3 text-lg font-medium text-ink-hi">
                Every Kalshi market on this match
              </h3>
              <div className="mb-4 flex gap-1.5">
                {([["lines", "Game lines"], ["players", "Player props"], ["reference", "Sportsbook ref"]] as const).map(([id, label]) => (
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
              {mktTab === "reference" ? (
                <ReferenceOddsTab ro={refOdds} />
              ) : mktTab === "players" ? (
                pProps ? <PlayerPropsTab pp={pProps} onWatch={toggleWatch} watched={watched} />
                       : <p className="rounded-xl border border-line p-4 text-sm text-ink-low">Player data unavailable for this match.</p>
              ) : (<>
              <p className="mb-4 text-xs text-ink-low">
                Click a column to sort · click a group to collapse
              </p>
              {settledMap && research && research.final_lock.length > 0 && sortedMarkets.length > 0 && (() => {
                const rows = research.final_lock
                  .map((l) => ({ l, res: settledMap.get(l.market_id) }))
                  .filter((x) => x.res === "yes" || x.res === "no");
                if (!rows.length) return null;
                const modelRight = rows.filter(
                  (x) => (x.l.model_probability >= 0.5) === (x.res === "yes")).length;
                const mktRight = rows.filter(
                  (x) => ((x.l.implied_probability ?? 0.5) >= 0.5) === (x.res === "yes")).length;
                const brier = rows.reduce((s2, x) =>
                  s2 + Math.pow(x.l.model_probability - (x.res === "yes" ? 1 : 0), 2), 0) / rows.length;
                return (
                  <div className="mb-4 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">T-10 scorecard</p>
                    <p className="mt-1 text-sm text-ink-mid">
                      The locked model called <span className="font-mono text-ink-hi">{modelRight}/{rows.length}</span> settled
                      markets right (market favourite: <span className="font-mono">{mktRight}/{rows.length}</span>) ·
                      Brier <span className="font-mono text-ink-hi">{brier.toFixed(3)}</span>
                      <span className="text-ink-faint"> (lower is better; 0.25 = coin flips)</span>
                    </p>
                  </div>
                );
              })()}
              {settledMap && sortedMarkets.length === 0 && (
                <p className="mb-4 rounded-xl border border-line p-4 text-sm text-ink-low">
                  The pre-match model view for this match was lost in a
                  deploy before persistent storage existed — nothing honest
                  to review here. Matches from here on keep their T-10
                  locked numbers for exactly this table.
                </p>
              )}
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
                    <span className="text-right">{settledMap ? "Settled" : "Alert"}</span>
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
                              {settledMap ? (
                                (() => {
                                  const res = settledMap.get(m.market_id);
                                  return (
                                    <span className={`font-mono text-[11px] uppercase tracking-wider ${
                                      res === "yes" ? "text-accent"
                                        : res === "no" ? "text-ink-faint" : "text-warn"}`}>
                                      {res === "yes" ? "✓ yes" : res === "no" ? "✗ no" : "—"}
                                    </span>
                                  );
                                })()
                              ) : (
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
                              )}
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

            {/* Prediction timeline — collapsed: audit trail, not match-day
                signal */}
            {timeline.length > 1 && (
              <Reveal>
              <Collapse eyebrow="history" title="How the home-win prediction evolved today" defaultOpen={false}>
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
              </Collapse>
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

// Sportsbook reference tab — what the wider betting market prices, via
// API-Football's bookmaker aggregation (median odd across quoting books).
// DISPLAY-ONLY: none of these are Kalshi contracts; they never touch the
// board, the pick, or the strategy engine. Exists because Kalshi lists
// some families (notably exact score) only 1-2 days before kickoff.
function ReferenceOddsTab({ ro }: { ro: ReferenceOddsResponse | null }) {
  if (!ro) {
    return <SkeletonRows rows={5} />;
  }
  if (!ro.available) {
    return (
      <p className="rounded-xl border border-line p-4 text-sm text-ink-low">
        No sportsbook reference odds right now — {ro.reason ?? "unavailable"}.
      </p>
    );
  }
  return (
    <div>
      <p className="mb-4 rounded-lg border border-warn/25 bg-warn/5 px-3 py-2 text-xs leading-relaxed text-warn">
        Reference only — these are sportsbook odds, not Kalshi contracts.
        Nothing here is buyable through this app, and none of it feeds the
        board or the strategy engine.
      </p>
      {ro.note && (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          fallback source: {ro.source} · {ro.note}
        </p>
      )}
      {ro.groups?.map((g) => (
        <div key={g.name} className="mb-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
            {g.name}
          </p>
          <div className="overflow-x-auto rounded-xl border border-line">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_7.5rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                <span>Outcome</span>
                <span className="text-right">Odds</span>
                <span className="text-right">Implied</span>
                <span className="text-right">Model</span>
              </div>
              {g.rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_7.5rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0">
                  <span className="min-w-0 truncate pr-2 text-ink-hi">
                    {r.label}
                    <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                      {r.books} book{r.books === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="text-right font-mono tabular-nums text-ink-mid">{r.odd.toFixed(2)}x</span>
                  <span className="text-right font-mono tabular-nums text-ink-hi">{pct(r.implied)}</span>
                  <span className="text-right font-mono tabular-nums">
                    {r.model != null ? (
                      <>
                        <span className="text-ink-hi">{pct(r.model)}</span>
                        <span className={`ml-1.5 text-[10px] ${r.model - r.implied >= 0 ? "text-accent" : "text-neg"}`}>
                          {signedPct(r.model - r.implied)}
                        </span>
                      </>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <p className="text-[11px] leading-relaxed text-ink-faint">
        {ro.disclaimer} Aggregated from {ro.bookmaker_count} bookmaker
        {(ro.bookmaker_count ?? 0) === 1 ? "" : "s"}. The model column joins
        only where the simulation states that exact number (win/draw/win,
        exact scorelines) — the difference includes the books&apos; vig, so it
        is not a tradeable edge.
      </p>
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

function Stat({ label, value, bar }: {
  label: string; value: string; bar?: number;
}) {
  return (
    <div className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low sm:text-[11px]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-ink-hi sm:text-3xl">{value}</p>
      {bar != null && (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-elev2">
          <div className="h-full rounded-full bg-accent/70"
            style={{ width: `${Math.min(bar * 100, 100)}%` }} />
        </div>
      )}
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
    <section className="rounded-2xl border border-line bg-elev p-5 sm:p-6">
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
// Betting strategy — a real SCENARIO engine, not a bet-picker.
//
// The match's result space is split into exhaustive, mutually exclusive
// scenarios ("atoms") from the SAME simulation everything else runs on:
//   home wins in 90' · away wins in 90' · draw then {home|away} wins in
//   ET · draw then {home|away} wins on penalties.
// Result-space contracts (winner / draw / advance / win-in-ET / win-on-pens)
// each pay out on an exact set of atoms. A STRATEGY is a set of contracts
// covering disjoint atom sets, dutched so every covered atom returns the
// same profit: you WIN if any covered scenario happens and LOSE your stake
// if and only if an uncovered scenario happens — those are listed, with
// probabilities. Risk tiers = the strategy's total win probability: LOW
// 60-100%, MEDIUM 40-60%, HIGH <40% (max return). Higher risk covers fewer
// atoms, so the loss-scenario list grows. Goal-dependent markets (totals,
// BTTS, exact scores) are excluded: their payoff isn't determined by the
// result scenario, so they can't give an "I lose only if X" guarantee.
function StrategySection({ markets, summary, scorelines, home, away }: {
  markets: MarketPrediction[];
  summary: PredictionSummary | null;
  scorelines: { score: string; prob: number }[];
  home: string;
  away: string;
}) {
  const [tier, setTier] = useState<"low" | "med" | "high" | "diy">("low");
  // The fund input holds a STRING so the field can be fully cleared while
  // typing a new amount; the math uses the clamped numeric view.
  const [fundStr, setFundStr] = useState("100");
  const fund = Math.max(1, Math.min(1000000, Number(fundStr) || 0));
  // sizing: dutch the WHOLE fund, or stake the Kelly fraction of it.
  // Kelly for a strategy winning with prob p at net profit b per $1:
  // f* = p - (1-p)/b — the growth-optimal stake; 0 when the EV is negative.
  const [sizing, setSizing] = useState<"full" | "kelly">("full");
  // build-it-yourself: the user's own contract selection, same math
  const [sel, setSel] = useState<Set<string>>(new Set());

  const kellyF = (p: number, b: number) =>
    b > 0 ? Math.max(0, p - (1 - p) / b) : 0;

  // Canonical picker order — reads like a bet menu, not a price dump:
  // home / draw / away, then advance, then the draw's method legs (ET
  // before pens, home before away); totals ascending, overs before
  // unders; margins home-then-away ascending; exact scores as home wins
  // (1-0, 2-0, 2-1, 3-0…), draws (0-0, 1-1…), then away wins (0-1, 0-2…).
  const diyRank = (k: string): number => {
    const fixed: Record<string, number> = {
      home_win: 0, draw: 1, away_win: 2,
      home_advance: 3, away_advance: 4,
      home_win_et: 5, home_win_pens: 6,
      away_win_et: 7, away_win_pens: 8,
      btts: 40, no_goal: 41,
    };
    if (k in fixed) return fixed[k];
    let m = k.match(/^over_(\d+)_5$/);
    if (m) return 10 + Number(m[1]);
    m = k.match(/^under_(\d+)_5$/);
    if (m) return 20 + Number(m[1]);
    m = k.match(/^home_margin_(\d+)$/);
    if (m) return 50 + Number(m[1]);
    m = k.match(/^away_margin_(\d+)$/);
    if (m) return 60 + Number(m[1]);
    m = k.match(/^score_(\d+)_(\d+)$/);
    if (m) {
      const h = Number(m[1]), a = Number(m[2]);
      if (h > a) return 100 + h * 10 + a;
      if (h === a) return 300 + h;
      return 400 + a * 10 + h;
    }
    return 999;
  };


  const netOdds = (impliedP: number) => {
    const cost = impliedP + 0.07 * impliedP * (1 - impliedP); // Kalshi fee
    return cost > 0 ? 1 / cost : 0;
  };

  // ---- scenario atoms from the sim ----
  const ft = summary?.full_time;
  const adv = summary?.advance;
  const fine = adv?.home_win_et != null; // ET/pens breakdown available
  type AtomT = { id: string; label: string; p: number };
  const atoms: AtomT[] = !ft ? [] : fine ? [
    { id: "H90", label: `${home} wins in 90′`, p: ft.home_win },
    { id: "A90", label: `${away} wins in 90′`, p: ft.away_win },
    { id: "DHet", label: `draw, then ${home} wins in extra time`, p: adv!.home_win_et! },
    { id: "DAet", label: `draw, then ${away} wins in extra time`, p: adv!.away_win_et! },
    { id: "DHp", label: `draw, then ${home} wins on penalties`, p: adv!.home_win_pens! },
    { id: "DAp", label: `draw, then ${away} wins on penalties`, p: adv!.away_win_pens! },
  ] : [
    { id: "H90", label: `${home} wins in 90′`, p: ft.home_win },
    { id: "D", label: "draw after 90′", p: ft.draw },
    { id: "A90", label: `${away} wins in 90′`, p: ft.away_win },
  ];
  const atomIdx = new Map(atoms.map((a, i) => [a.id, i]));
  const covers: Record<string, string[]> = fine ? {
    home_win: ["H90"], away_win: ["A90"],
    draw: ["DHet", "DAet", "DHp", "DAp"],
    home_advance: ["H90", "DHet", "DHp"], away_advance: ["A90", "DAet", "DAp"],
    home_win_et: ["DHet"], away_win_et: ["DAet"],
    home_win_pens: ["DHp"], away_win_pens: ["DAp"],
  } : { home_win: ["H90"], draw: ["D"], away_win: ["A90"] };

  // ---- contracts: one per outcome_key, with fee-netted odds ----
  // Dedupe to the best (highest net) odds per outcome_key: two tickers for
  // the same real bet should never appear as separate strategy legs.
  const contracts = (() => {
    const raw = markets
      .filter((m) => m.outcome_key && covers[m.outcome_key] && m.implied_probability > 0.005)
      .map((m) => {
        let mask = 0;
        for (const id of covers[m.outcome_key!]) mask |= 1 << atomIdx.get(id)!;
        return { key: m.outcome_key!, title: m.market_title, mask,
                 odds: netOdds(m.implied_probability), implied: m.implied_probability };
      })
      .filter((c) => c.odds > 1);
    const best = new Map<string, (typeof raw)[number]>();
    for (const c of raw) {
      const cur = best.get(c.key);
      if (!cur || c.odds > cur.odds) best.set(c.key, c);
    }
    return [...best.values()];
  })();

  // ---- enumerate every disjoint cover; dutch it ----
  type Cand = { legs: typeof contracts; mask: number; p: number; profit: number };
  const cands: Cand[] = [];
  const n = contracts.length;
  for (let sset = 1; sset < 1 << n; sset++) {
    let mask = 0, invSum = 0, ok = true;
    const legs: typeof contracts = [];
    for (let i = 0; i < n; i++) {
      if (!(sset & (1 << i))) continue;
      const c = contracts[i];
      if (mask & c.mask) { ok = false; break; }   // overlap → not a clean cover
      mask |= c.mask; invSum += 1 / c.odds; legs.push(c);
    }
    if (!ok || legs.length === 0) continue;
    // Draw-first rule, strict form: ET/pens legs are only valid when the
    // candidate's ET/pens legs TOGETHER hold the entire draw region — the
    // draw is literally the main bet, bought via its method split. A lone
    // "Belgium wins in ET" is not a thesis: your "main bet" (the draw) can
    // land and you still lose to penalties.
    const etMask = legs.reduce(
      (mm, c) => (ET_REFINEMENT_KEYS.has(c.key) ? mm | c.mask : mm), 0);
    if (etMask !== 0) {
      let drawMask = 0;
      for (const id of ["DHet", "DAet", "DHp", "DAp"]) {
        const idx = atomIdx.get(id);
        if (idx != null) drawMask |= 1 << idx;
      }
      if (etMask !== drawMask) continue;
    }
    let p = 0;
    atoms.forEach((a, i) => { if (mask & (1 << i)) p += a.p; });
    cands.push({ legs, mask, p, profit: 1 / invSum - 1 });
  }

  const bands = { low: [0.60, 1.001], med: [0.40, 0.60], high: [0, 0.40] } as const;
  const [lo, hi] = bands[tier === "diy" ? "low" : tier];
  const inBand = cands.filter((c) => c.p >= lo && c.p < hi);
  inBand.sort((a, b) => b.profit - a.profit || b.p - a.p);
  const best = inBand[0];

  const invSum = best ? best.legs.reduce((s2, c) => s2 + 1 / c.odds, 0) : 1;
  const autoF = best ? (sizing === "kelly" ? kellyF(best.p, best.profit) : 1) : 1;
  const staked = fund * autoF;
  const rows = best ? best.legs.map((c) => ({
    ...c, stake: (staked * (1 / c.odds)) / invSum,
  })) : [];
  const payoutIfWin = best ? staked * (1 + best.profit) : 0;
  // Merge near-identical loss rows: the four "draw, then X in ET/pens"
  // lines collapse to one when the whole draw region is lost, or to a
  // per-side line when that side's ET+pens pair is lost together — the
  // same outcome either way, with far less noise.
  const lossAtoms = (() => {
    if (!best) return [] as { id: string; label: string; p: number }[];
    const lost = atoms
      .map((a, i) => ({ ...a, i }))
      .filter((a) => !(best.mask & (1 << a.i)));
    const ids = new Set(lost.map((a) => a.id));
    const merged: { id: string; label: string; p: number }[] = [];
    const used = new Set<string>();
    const take = (group: string[], label: string) => {
      if (group.every((g) => ids.has(g) && !used.has(g))) {
        merged.push({
          id: group.join("+"), label,
          p: lost.filter((a) => group.includes(a.id))
            .reduce((s2, a) => s2 + a.p, 0),
        });
        group.forEach((g) => used.add(g));
      }
    };
    take(["DHet", "DAet", "DHp", "DAp"],
         "draw after 90′ — however it gets decided");
    take(["DHet", "DHp"], `draw, then ${home} wins it (ET or pens)`);
    take(["DAet", "DAp"], `draw, then ${away} wins it (ET or pens)`);
    for (const a of lost) if (!used.has(a.id)) merged.push(a);
    return merged.sort((a, b) => b.p - a.p);
  })();
  const ev = best ? best.p * best.profit * staked - (1 - best.p) * staked : 0;

  const tierMeta = {
    low: "Wins 60-100% of the time — covers most scenarios, small profit.",
    med: "Wins 40-60% of the time — fewer scenarios covered, bigger profit.",
    high: "Wins <40% of the time — few scenarios, maximum return.",
    diy: "Pick your own legs across (almost) every market — the engine prices your thesis with the same math.",
  } as const;

  // ---- build-it-yourself: a FINER scenario space so (almost) every market
  // can join. Atoms are exact 90-minute scorelines from the simulation;
  // drawn scores additionally split by method (ET/pens, each side) using
  // the advance breakdown. Winner/advance/ET/totals/BTTS/exact-score/margin
  // settlement is a pure function of these atoms. Whatever probability the
  // top-scoreline list doesn't carry becomes an explicit "any other
  // scoreline" atom that every leg LOSES on — conservative, and always
  // listed as a loss scenario, so the guarantee stays honest. First-goal
  // markets stay out: their payoff depends on the path, not the score.
  type FineAtom = { id: string; label: string; p: number;
                    h: number; a: number; method: string; other?: boolean };
  const fineAtoms: FineAtom[] = (() => {
    if (!ft) return [];
    const out: FineAtom[] = [];
    let listed = 0;
    const drawTot = (adv?.home_win_et ?? 0) + (adv?.away_win_et ?? 0)
      + (adv?.home_win_pens ?? 0) + (adv?.away_win_pens ?? 0);
    for (const s of scorelines) {
      const [h, a] = s.score.split("-").map(Number);
      if (Number.isNaN(h) || Number.isNaN(a) || s.prob <= 0) continue;
      listed += s.prob;
      if (h !== a) {
        out.push({ id: `S${h}_${a}`, p: s.prob, h, a,
                   method: h > a ? "H90" : "A90",
                   label: `${h > a ? home : away} wins ${h}-${a}` });
      } else if (fine && drawTot > 0) {
        const parts: [string, string, number][] = [
          ["DHet", `then ${home} wins in extra time`, adv!.home_win_et!],
          ["DAet", `then ${away} wins in extra time`, adv!.away_win_et!],
          ["DHp", `then ${home} wins on penalties`, adv!.home_win_pens!],
          ["DAp", `then ${away} wins on penalties`, adv!.away_win_pens!],
        ];
        for (const [mth, lbl, w] of parts) {
          if (w <= 0) continue;
          out.push({ id: `S${h}_${a}_${mth}`, p: s.prob * (w / drawTot),
                     h, a, method: mth, label: `${h}-${a}, ${lbl}` });
        }
      } else {
        out.push({ id: `S${h}_${a}_D`, p: s.prob, h, a, method: "D",
                   label: `${h}-${a} draw after 90′` });
      }
    }
    const rest = Math.max(0, 1 - listed);
    if (rest > 0.0005) {
      out.push({ id: "OTHER", p: rest, h: -1, a: -1, method: "OTHER",
                 other: true,
                 label: "any other scoreline (unlisted — treated as a loss)" });
    }
    return out;
  })();

  // Does outcome_key k pay on atom `at`? null = not scenario-determined.
  const coverFine = (k: string, at: FineAtom): boolean | null => {
    if (at.other) return false;
    const d = at.h - at.a;
    if (k === "home_win") return at.method === "H90";
    if (k === "away_win") return at.method === "A90";
    if (k === "draw") return at.method.startsWith("D");
    if (k === "home_advance")
      return at.method === "H90" || at.method === "DHet" || at.method === "DHp";
    if (k === "away_advance")
      return at.method === "A90" || at.method === "DAet" || at.method === "DAp";
    if (ET_REFINEMENT_KEYS.has(k)) {
      if (at.method === "D") return null;   // no method split available
      const map: Record<string, string> = {
        home_win_et: "DHet", away_win_et: "DAet",
        home_win_pens: "DHp", away_win_pens: "DAp",
      };
      return at.method === map[k];
    }
    let m = k.match(/^over_(\d+)_5$/);
    if (m) return at.h + at.a > Number(m[1]) + 0.5;
    m = k.match(/^under_(\d+)_5$/);
    if (m) return at.h + at.a < Number(m[1]) + 0.5;
    if (k === "btts") return at.h > 0 && at.a > 0;
    if (k === "no_goal") return at.h === 0 && at.a === 0;
    m = k.match(/^score_(\d+)_(\d+)$/);
    if (m) return at.h === Number(m[1]) && at.a === Number(m[2]);
    m = k.match(/^home_margin_(\d+)$/);
    if (m) return d >= Number(m[1]);
    m = k.match(/^away_margin_(\d+)$/);
    if (m) return -d >= Number(m[1]);
    return null;
  };

  const diyContracts = (() => {
    type Diy = { key: string; title: string; mask: bigint; odds: number };
    const raw: Diy[] = [];
    for (const mm of markets) {
      const k = mm.outcome_key;
      if (!k || mm.implied_probability <= 0.005) continue;
      let mask = 0n;
      let decidable = true;
      fineAtoms.forEach((at, i) => {
        const c = coverFine(k, at);
        if (c === null) decidable = false;
        else if (c) mask |= 1n << BigInt(i);
      });
      const odds = netOdds(mm.implied_probability);
      if (decidable && mask !== 0n && odds > 1) {
        raw.push({ key: k, title: mm.market_title, mask, odds });
      }
    }
    const best = new Map<string, Diy>();
    for (const c of raw) {
      const cur = best.get(c.key);
      if (!cur || c.odds > cur.odds) best.set(c.key, c);
    }
    return [...best.values()];
  })();

  // Overlapping legs are ALLOWED — that's real betting ("Spain to win" plus
  // "exact 2-0" boosts the 2-0 scenario, paying both). The engine just
  // refuses to pretend the payout is flat: it computes each scenario's NET
  // (every leg that pays, minus the whole stake) and presents the honest
  // PAYOUT LADDER. Stakes auto-split ∝ 1/odds across your legs; when the
  // legs happen to be disjoint the ladder collapses to the classic flat
  // dutch with a single win rung.
  const selLegs = diyContracts.filter((c) => sel.has(c.key));
  const selInv = selLegs.reduce((s2, c) => s2 + 1 / c.odds, 0);
  // full-stake ($fund) net PnL per scenario
  const atomPnlFull = fineAtoms.map((at, i) => {
    let ret = 0;
    for (const c of selLegs) {
      if ((c.mask & (1n << BigInt(i))) !== 0n) {
        ret += (fund * (1 / c.odds) / selInv) * c.odds;
      }
    }
    return ret - fund;
  });
  // Kelly over the ladder: maximize E[ln(1 + f·r)] numerically (the closed
  // formula only covers flat two-outcome payoffs). Golden-ish ternary search
  // is plenty at this scale.
  const kellyLadder = (): number => {
    const r = atomPnlFull.map((v) => v / fund);
    const growth = (f: number) => fineAtoms.reduce(
      (s2, at, i) => s2 + at.p * Math.log(Math.max(1e-9, 1 + f * r[i])), 0);
    let lo = 0, hi = 0.999;
    for (let it = 0; it < 80; it++) {
      const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3;
      if (growth(a) < growth(b)) lo = a; else hi = b;
    }
    const f = (lo + hi) / 2;
    return growth(f) > growth(0) + 1e-12 ? f : 0;
  };
  const selF = selLegs.length === 0 ? 1
    : sizing === "kelly" ? kellyLadder() : 1;
  const selStaked = fund * selF;
  const selRows = [...selLegs]
    .sort((x, y) => diyRank(x.key) - diyRank(y.key))
    .map((c) => ({ ...c, stake: (selStaked * (1 / c.odds)) / selInv }));
  // Display atoms: a drawn score's four decider variants merge back into
  // ONE row whenever they all land the same net — "1-1 then home in ET /
  // 1-1 then home on pens / …" is near-identical noise unless an ET/pens
  // leg actually makes the decider matter.
  type Disp = { id: string; label: string; p: number; pnl: number };
  const dispAtoms: Disp[] = (() => {
    if (!selLegs.length) return [];
    const out: Disp[] = [];
    const byScore = new Map<string, Disp[]>();
    fineAtoms.forEach((at, i) => {
      const row: Disp = {
        id: at.id, label: at.label, p: at.p,
        pnl: Math.round(selF * atomPnlFull[i] * 100) / 100,
      };
      if (at.h === at.a && !at.other) {
        const k = `${at.h}_${at.a}`;
        byScore.set(k, [...(byScore.get(k) ?? []), row]);
      } else {
        out.push(row);
      }
    });
    for (const [k, group] of byScore) {
      if (group.length > 1 && group.every((g) => g.pnl === group[0].pnl)) {
        const score = k.replace("_", "-");
        out.push({ id: `D${k}`,
                   label: `${score} draw — however it gets decided`,
                   p: group.reduce((s2, g) => s2 + g.p, 0),
                   pnl: group[0].pnl });
      } else {
        out.push(...group);
      }
    }
    return out;
  })();

  // the ladder at the chosen sizing: distinct net outcomes, grouped
  type Rung = { pnl: number; p: number; labels: string[] };
  const rungMap = new Map<number, Rung>();
  for (const at of dispAtoms) {
    const r = rungMap.get(at.pnl) ?? { pnl: at.pnl, p: 0, labels: [] };
    r.p += at.p;
    if (r.labels.length < 3) r.labels.push(at.label);
    else if (r.labels.length === 3) r.labels.push("…");
    rungMap.set(at.pnl, r);
  }
  const rungs = selLegs.length
    ? [...rungMap.values()].sort((a, b) => b.pnl - a.pnl) : [];
  const selP = rungs.filter((r) => r.pnl > 1e-9)
    .reduce((s2, r) => s2 + r.p, 0);
  const selEv = rungs.reduce((s2, r) => s2 + r.p * r.pnl, 0);
  const selBest = rungs.length ? rungs[0] : null;
  // losing scenarios, individually (existing style): amount + probability
  const selLossAll = dispAtoms
    .filter((at) => at.pnl < -0.005)
    .sort((x, y) => y.p - x.p);
  const selLoss = selLossAll.slice(0, 8);
  const selLossRest = selLossAll.slice(8);
  const selLossRestP = selLossRest.reduce((s2, at) => s2 + at.p, 0);
  const selMaxLoss = selLossAll.length
    ? Math.min(...selLossAll.map((a) => a.pnl)) : 0;
  const toggleSel = (k: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  // picker groups (exact scores collapsed by default — 25 rows)
  const DIY_GROUPS: { label: string; test: (k: string) => boolean; startOpen: boolean }[] = [
    { label: "Winner · advance · ET/pens", startOpen: true,
      test: (k) => ["home_win", "draw", "away_win", "home_advance", "away_advance"].includes(k) || ET_REFINEMENT_KEYS.has(k) },
    { label: "Goals · totals, BTTS", startOpen: true,
      test: (k) => /^over_|^under_/.test(k) || k === "btts" || k === "no_goal" },
    { label: "Margins", startOpen: true, test: (k) => /_margin_/.test(k) },
    { label: "Exact score", startOpen: false, test: (k) => /^score_/.test(k) },
  ];
  const [diyOpen, setDiyOpen] = useState<Set<string>>(
    new Set(DIY_GROUPS.filter((g) => g.startOpen).map((g) => g.label)));
  const toggleDiyGroup = (label: string) =>
    setDiyOpen((prev) => {
      const n = new Set(prev);
      if (n.has(label)) n.delete(label); else n.add(label);
      return n;
    });

  return (
    <section className="rounded-2xl border border-line bg-elev p-5 sm:p-6">
      <p className="mb-4 text-[11px] leading-relaxed text-ink-faint">
        Your whole fund is split across result-space contracts so every covered
        scenario returns the same profit. You lose only if a listed uncovered
        scenario happens. Odds are net of Kalshi&apos;s fee; probabilities are the
        model&apos;s. Not financial advice.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["low", "med", "high", "diy"] as const).map((t) => (
          <button key={t} onClick={() => setTier(t)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              tier === t ? "border-accent/60 bg-accent/10 text-accent"
                         : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"}`}>
            {t === "low" ? "Low risk" : t === "med" ? "Medium risk"
              : t === "high" ? "High risk" : "Build your own"}
          </button>
        ))}
      </div>
      <p className="mb-4 text-xs text-ink-low">{tierMeta[tier]}</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-ink-mid">Fund to divide</span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-sm text-ink-low">$</span>
          <input type="number" min={1} max={1000000} value={fundStr}
            onChange={(e) => setFundStr(e.target.value)}
            onBlur={() => setFundStr(String(fund))}
            className="w-24 rounded-lg border border-line bg-bs px-2.5 py-1.5 font-mono text-sm tabular-nums text-ink-hi outline-none focus:border-accent/60" />
        </div>
        <div className="flex gap-1.5">
          {([["full", "Stake it all"], ["kelly", "Kelly sizing"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setSizing(id)}
              title={id === "kelly"
                ? "Stake the growth-optimal fraction: f* = p − (1−p)/profit. $0 when the strategy is negative-EV."
                : "Dutch the entire fund across the legs"}
              className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                sizing === id ? "border-accent/60 bg-accent/10 text-accent"
                              : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"}`}>
              {label}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-ink-faint">
          {sizing === "full" ? "entire fund is staked"
            : "stake only the Kelly fraction — the rest stays in your pocket"}
        </span>
      </div>

      {tier === "diy" ? (
        !ft || fineAtoms.length === 0 || diyContracts.length === 0 ? (
          <p className="rounded-xl border border-line p-4 text-sm text-ink-low">
            Nothing to build from yet — refresh the prediction first.
          </p>
        ) : (
          <>
            <p className="mb-4 text-[11px] leading-relaxed text-ink-faint">
              Pick any legs — overlapping ones included: &quot;Spain to
              win&quot; plus &quot;exact 2-0&quot; boosts the 2-0 scenario and
              the payout ladder below shows each distinct outcome honestly.
              Stakes auto-split across legs ∝ 1/odds. Scenarios are exact
              90-minute scorelines (drawn ones split by how the tie is
              decided), so totals, BTTS, exact scores and margins all join.
              First-goal markets can&apos;t — their payoff depends on the
              path, not the score — and rare unlisted scorelines count
              AGAINST you, always listed as losses.
            </p>
            {DIY_GROUPS.map((g) => {
              const items = diyContracts.filter((c) => g.test(c.key))
                .sort((x, y) => diyRank(x.key) - diyRank(y.key));
              if (!items.length) return null;
              const open = diyOpen.has(g.label);
              return (
                <div key={g.label} className="mb-3">
                  <button onClick={() => toggleDiyGroup(g.label)}
                    className="mb-1.5 flex w-full items-center gap-2 text-left">
                    <span className={`text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low">{g.label}</span>
                    <span className="font-mono text-[10px] text-ink-faint">{items.length}</span>
                    {(() => {
                      const n = items.filter((c) => sel.has(c.key)).length;
                      return n > 0 ? (
                        <span className="rounded border border-accent/40 bg-accent/10 px-1.5 font-mono text-[10px] text-accent">
                          {n} picked
                        </span>
                      ) : null;
                    })()}
                  </button>
                  {open && (
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {items.map((c) => {
                        const picked = sel.has(c.key);
                        return (
                          <button key={c.key} onClick={() => toggleSel(c.key)}
                            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                              picked ? "border-accent/60 bg-accent/10 text-ink-hi"
                                : "border-line text-ink-mid hover:border-line-strong hover:text-ink-hi"}`}>
                            <span className={`inline-block h-3.5 w-3.5 shrink-0 rounded border ${
                              picked ? "border-accent bg-accent/70" : "border-line-strong"}`} />
                            <span className="min-w-0 flex-1 truncate">{c.title}</span>
                            <span className="shrink-0 font-mono text-xs tabular-nums text-ink-low">
                              {c.odds.toFixed(2)}x
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {selLegs.length === 0 ? (
              <p className="mt-4 rounded-xl border border-line p-4 text-sm text-ink-low">
                Pick one or more contracts above to price your strategy.
              </p>
            ) : (
              <div className="mt-5">
                {sizing === "kelly" && (
                  selF > 0 ? (
                    <p className="mb-4 rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 font-mono text-xs text-accent">
                      Kelly stakes {pct(selF)} of your fund → ${selStaked.toFixed(2)} in
                      play, ${(fund - selStaked).toFixed(2)} stays in your pocket.
                    </p>
                  ) : (
                    <p className="mb-4 rounded-lg border border-warn/25 bg-warn/5 px-3 py-2 text-xs text-warn">
                      Kelly stakes $0 — this build is negative-EV at current
                      prices, so the growth-optimal bet is no bet.
                    </p>
                  )
                )}
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-line bg-bs p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">Strategy wins</p>
                    <p className={`mt-1 font-mono text-xl tabular-nums ${selP >= 0.6 ? "text-accent" : "text-ink-hi"}`}>{pct(selP)}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-bs p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">Best case</p>
                    <p className={`mt-1 font-mono text-xl tabular-nums ${(selBest?.pnl ?? 0) >= 0 ? "text-accent" : "text-neg"}`}>
                      {(selBest?.pnl ?? 0) >= 0 ? "+" : "−"}${Math.abs(selBest?.pnl ?? 0).toFixed(2)}
                    </p>
                    <p className="font-mono text-[10px] tabular-nums text-ink-faint">
                      {selBest ? `${pct(selBest.p)} chance` : ""}
                    </p>
                  </div>
                  <div className="rounded-xl border border-line bg-bs p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">Expected value</p>
                    <p className={`mt-1 font-mono text-xl tabular-nums ${selEv >= 0 ? "text-accent" : "text-neg"}`}>
                      {selEv >= 0 ? "+" : "−"}${Math.abs(selEv).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* the payout ladder — every distinct net outcome this build
                    can produce; one flat rung when the legs are disjoint,
                    boosted rungs when they overlap */}
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
                  Payout ladder
                </p>
                <div className="mb-4 overflow-x-auto rounded-xl border border-line">
                  <div className="min-w-[480px]">
                    <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                      <span>Outcome</span>
                      <span className="text-right">Chance</span>
                      <span className="text-right">Net</span>
                    </div>
                    {rungs.map((r, ri) => (
                      <div key={r.pnl} className={`grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0 ${
                        ri === 0 && r.pnl > 0 ? "bg-accent/5" : ""}`}>
                        <span className="min-w-0 truncate pr-2 text-ink-mid" title={r.labels.join(" · ")}>
                          {r.labels.join(" · ")}
                        </span>
                        <span className="text-right font-mono tabular-nums text-ink-low">{pct(r.p)}</span>
                        <span className={`text-right font-mono tabular-nums ${r.pnl >= 0 ? "text-accent" : "text-neg"}`}>
                          {r.pnl >= 0 ? "+" : "−"}${Math.abs(r.pnl).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4 overflow-x-auto rounded-xl border border-line">
                  <div className="min-w-[520px]">
                    <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_6rem_6rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                      <span>Buy</span><span className="text-right">Net mult</span>
                      <span className="text-right">Stake</span><span className="text-right">Returns</span>
                    </div>
                    {selRows.map((r) => (
                      <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_5.5rem_6rem_6rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0">
                        <span className="min-w-0 truncate pr-2 text-ink-hi" title={r.title}>{r.title}</span>
                        <span className="text-right font-mono tabular-nums text-ink-mid">{r.odds.toFixed(2)}x</span>
                        <span className="text-right font-mono tabular-nums text-accent">${r.stake.toFixed(2)}</span>
                        <span className="text-right font-mono tabular-nums text-ink-mid">${(r.stake * r.odds).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neg">
                  You lose money only if ({selLossAll.length} scenario{selLossAll.length === 1 ? "" : "s"}, worst −${Math.abs(selMaxLoss).toFixed(2)}):
                </p>
                <ul className="space-y-1.5">
                  {selLoss.map((a) => (
                    <li key={a.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink-mid">✗ {a.label}</span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-ink-low">
                        {pct(a.p)} · <span className="text-neg">−${Math.abs(a.pnl).toFixed(2)}</span>
                      </span>
                    </li>
                  ))}
                  {selLossRest.length > 0 && (
                    <li className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink-low">✗ …{selLossRest.length} more rare scoreline scenarios</span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-ink-low">{pct(selLossRestP)}</span>
                    </li>
                  )}
                  {selLossAll.length === 0 && (
                    <li className="text-sm text-ink-mid">✓ nothing — every scenario nets positive (profit is the vig-adjusted spread)</li>
                  )}
                </ul>
                <button onClick={() => setSel(new Set())}
                  className="mt-4 rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-mid">
                  Clear picks
                </button>
              </div>
            )}
          </>
        )
      ) : !ft ? (
        <p className="rounded-xl border border-line p-4 text-sm text-ink-low">
          Prediction summary unavailable — refresh the prediction first.
        </p>
      ) : !best ? (
        <p className="rounded-xl border border-line p-4 text-sm text-ink-low">
          No contract combination lands in this risk band on this match right
          now — the required markets aren&apos;t all open.
        </p>
      ) : (
        <>
          {sizing === "kelly" && (
            autoF > 0 ? (
              <p className="mb-4 rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 font-mono text-xs text-accent">
                Kelly stakes {pct(autoF)} of your fund → ${staked.toFixed(2)} in
                play, ${(fund - staked).toFixed(2)} stays in your pocket.
              </p>
            ) : (
              <p className="mb-4 rounded-lg border border-warn/25 bg-warn/5 px-3 py-2 text-xs text-warn">
                Kelly stakes $0 — this strategy is negative-EV at current
                prices, so the growth-optimal bet is no bet.
              </p>
            )
          )}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-line bg-bs p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">Strategy wins</p>
              <p className={`mt-1 font-mono text-xl tabular-nums ${best.p >= 0.6 ? "text-accent" : "text-ink-hi"}`}>{pct(best.p)}</p>
            </div>
            <div className="rounded-xl border border-line bg-bs p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">Profit if it wins</p>
              <p className={`mt-1 font-mono text-xl tabular-nums ${best.profit >= 0 ? "text-accent" : "text-neg"}`}>
                {signedPct(best.profit)}
              </p>
              <p className="font-mono text-[10px] tabular-nums text-ink-faint">${staked.toFixed(2)} → ${payoutIfWin.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-line bg-bs p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">Expected value</p>
              <p className={`mt-1 font-mono text-xl tabular-nums ${ev >= 0 ? "text-accent" : "text-neg"}`}>
                {ev >= 0 ? "+" : "−"}${Math.abs(ev).toFixed(2)}
              </p>
            </div>
          </div>
          {best.profit < 0 && (
            <p className="mb-4 rounded-lg border border-warn/25 bg-warn/5 px-3 py-2 text-xs text-warn">
              Best available cover in this band is a guaranteed loss (the
              market&apos;s vig) — there is no honest low-variance profit here.
            </p>
          )}

          <div className="mb-4 overflow-x-auto rounded-xl border border-line">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_6rem_6rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                <span>Buy</span><span className="text-right">Net mult</span>
                <span className="text-right">Stake</span><span className="text-right">Returns</span>
              </div>
              {rows.map((r) => (
                <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_5.5rem_6rem_6rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0">
                  <span className="min-w-0 truncate pr-2 text-ink-hi" title={r.title}>{r.title}</span>
                  <span className="text-right font-mono tabular-nums text-ink-mid">{r.odds.toFixed(2)}x</span>
                  <span className="text-right font-mono tabular-nums text-accent">${r.stake.toFixed(2)}</span>
                  <span className="text-right font-mono tabular-nums text-ink-mid">${(r.stake * r.odds).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neg">
            You lose your ${staked.toFixed(staked % 1 ? 2 : 0)} only if ({lossAtoms.length} scenario{lossAtoms.length === 1 ? "" : "s"}):
          </p>
          <ul className="space-y-1.5">
            {lossAtoms.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink-mid">✗ {a.label}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-ink-low">{pct(a.p)}</span>
              </li>
            ))}
            {lossAtoms.length === 0 && (
              <li className="text-sm text-ink-mid">✓ nothing — every scenario is covered (profit is the vig-adjusted spread)</li>
            )}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            Scenario probabilities come from the pure-model simulation; stakes
            are dutched so any covered outcome pays the same. Goal-based
            markets stay out of the AUTO tiers (use Build your own to combine
            them). Extra-time / penalty legs appear only when together they
            hold the entire draw region — the draw is the main bet, bought
            via its method split — never as a lone side bet.
          </p>
        </>
      )}

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
  const dead = rows.filter((r) => r.market_id && !r.already_scored && r.tradeable === false);
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
      {priced.length === 0 && settled.length === 0 && dead.length === 0 ? (
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
                <span className="text-right">
                  <span className="font-mono tabular-nums text-ink-hi">{pct(r.likelihood!)}</span>
                  {r.tournament_anytime != null && (
                    <span className="block font-mono text-[10px] tabular-nums text-ink-faint">
                      model {pct(r.tournament_anytime)}
                    </span>
                  )}
                </span>
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
            {dead.map((r) => (
              <div key={"d" + r.shirt} className="grid grid-cols-[minmax(0,1fr)_6rem_5rem_5.5rem_4.5rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm opacity-70">
                <span className="min-w-0 truncate pr-2 text-ink-mid">{r.player}</span>
                <span className="text-right">
                  <span className="font-mono tabular-nums text-ink-mid">
                    {r.tournament_anytime != null ? pct(r.tournament_anytime) : "—"}
                  </span>
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-faint">model</span>
                </span>
                <span className="col-span-3 text-right font-mono text-[11px] text-ink-faint">
                  no real market — book {r.bid != null ? Math.round(r.bid * 100) + "¢" : "—"} / {r.implied != null ? Math.round(r.implied * 100) + "¢" : "—"}
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
        enumeration. Books with a giant bid/ask spread are DEAD — nobody is
        really offering that price — so they show the model and the raw book
        instead of a fictional likelihood and edge.
      </p>

      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
        This match · goals 1+/2+/3+ (model, priced when Kalshi lists it) · assists (market only)
      </p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[minmax(0,1fr)_6rem_6rem_6rem_5rem_5.5rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
            <span>Player</span><span className="text-right">1+ goal</span>
            <span className="text-right">2+ goals</span><span className="text-right">3+ goals</span>
            <span className="text-right">First goal</span><span className="text-right">Assist 1+</span>
          </div>
          {rows.map((r) => {
            const gm = (n: number) => r.match_goal_markets?.find((g) => g.n === n);
            const cell = (model: number | undefined, n: number) => {
              const m = gm(n);
              return (
                <span className="text-right">
                  <span className="font-mono tabular-nums text-ink-hi">{model != null ? pct(model) : "—"}</span>
                  {m && m.multiplier != null && (
                    <span className={`block font-mono text-[10px] tabular-nums ${
                      (m.edge ?? -1) >= 0 ? "text-accent" : "text-neg"}`}>
                      @{m.multiplier.toFixed(2)}x{m.edge != null ? ` ${signedPct(m.edge)}` : ""}
                    </span>
                  )}
                </span>
              );
            };
            const ast = r.assist_markets?.find((a) => a.n === 1);
            return (
              <div key={r.shirt} className={`grid grid-cols-[minmax(0,1fr)_6rem_6rem_6rem_5rem_5.5rem] items-center gap-x-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0 ${
                r.squad === "out" ? "opacity-50" : ""}`}>
                <span className="min-w-0 truncate pr-2 text-ink-hi">
                  <span className="mr-2 font-mono text-[11px] text-ink-faint">#{r.shirt}</span>{r.player}
                  {r.squad === "starter" && <span className="ml-2 rounded border border-accent/40 px-1 font-mono text-[9px] uppercase tracking-wider text-accent">XI</span>}
                  {r.squad === "bench" && <span className="ml-2 rounded border border-line px-1 font-mono text-[9px] uppercase tracking-wider text-ink-low">bench</span>}
                  {r.squad === "out" && <span className="ml-2 rounded border border-neg/40 px-1 font-mono text-[9px] uppercase tracking-wider text-neg">out</span>}
                  {r.squad == null && r.starts < r.matches && <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-ink-faint">rotation</span>}
                </span>
                {cell(r.anytime, 1)}
                {cell(r.p2, 2)}
                {cell(r.p3, 3)}
                <span className="text-right">
                  <span className="font-mono tabular-nums text-ink-mid">{pct(r.first_goal)}</span>
                  {r.first_goal_market?.multiplier != null && (
                    <span className={`block font-mono text-[10px] tabular-nums ${
                      (r.first_goal_market.edge ?? -1) >= 0 ? "text-accent" : "text-neg"}`}>
                      @{r.first_goal_market.multiplier.toFixed(2)}x
                      {r.first_goal_market.edge != null ? ` ${signedPct(r.first_goal_market.edge)}` : ""}
                    </span>
                  )}
                </span>
                <span className="text-right font-mono tabular-nums text-ink-mid">
                  {ast && ast.multiplier != null ? `@${ast.multiplier.toFixed(2)}x` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        {pp.disclaimer} Goal thresholds and First goal show the Kalshi price
        + anchored edge when a market is listed (First goal prices Kalshi&apos;s
        First Goalscorer books against the model&apos;s first-goal race).
        Assists show the market price only — FIFA publishes no assist data,
        so there is no honest assist model. Once
        official lineups post (~1h before kickoff), XI / bench / out tags
        appear; out-of-squad players&apos; per-match chances drop to zero.
      </p>
    </div>
  );
}

// Dashboard — namson.dev/bet-suggester
// Showcase at the top (live scoreboard + next-match hero, Apple-grade type
// and glow), then a deliberate transition into a denser Linear-style tool
// zone for the ranking board. One accent, gray hierarchy, mono for data.
// Scoped to this route so it doesn't fight the rest of the portfolio.
import Head from "next/head";
import { Anton, Baloo_2, Exo_2, Poppins } from "next/font/google";
import Link from "next/link";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
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

// Wordmark-adjacent faces: Anton for the WC26 emblem's condensed weight,
// Exo 2 heavy italic for MLS's slanted crest letters, Poppins for the
// Premier League's rounded geometric, Baloo 2 for LaLiga's rounded quirk.
const wcFont = Anton({ weight: "400", subsets: ["latin"] });
const mlsFont = Exo_2({ weight: "800", style: "italic", subsets: ["latin"] });
const eplFont = Poppins({ weight: "600", subsets: ["latin"] });
const laligaFont = Baloo_2({ weight: "700", subsets: ["latin"] });

// League "drive modes": each carries the primary color of its competition's
// logo (tuned where needed so the accent reads on the near-black canvas).
const LEAGUES = [
  { id: "wc26", name: "World Cup 26", top: "WC26 · Bet Suggester",
    eyebrow: "live model · kalshi markets",
    accent: "#34d399", dim: "rgba(52,211,153,0.35)", faint: "rgba(52,211,153,0.10)",
    ambient: "rgba(52,211,153,0.07)", modeMs: 3200,
    logo: "/leagues/wc26-trophy.png", glyph: "rich",
    font: wcFont,
    tracking: "0.025em",
    tagline: "" },
  { id: "mls", name: "MLS", top: "MLS · Bet Suggester",
    eyebrow: "engine adaptation · in season",
    accent: "#d50032", dim: "rgba(213,0,50,0.35)", faint: "rgba(213,0,50,0.10)",
    ambient: "rgba(213,0,50,0.07)", modeMs: 600,
    logo: "/leagues/mls.svg", glyph: "soft",
    font: mlsFont,
    tracking: "0.05em",
    tagline: "Crest red. The same engine, rewired for MLS — fixtures, books and twelve fresh bot ledgers." },
  { id: "epl", name: "Premier League", top: "EPL · Bet Suggester",
    eyebrow: "engine adaptation · season 26/27",
    accent: "#b18cff", dim: "rgba(177,140,255,0.35)", faint: "rgba(177,140,255,0.10)",
    ambient: "rgba(177,140,255,0.07)", modeMs: 1450,
    logo: "/leagues/epl.png", glyph: "invert",
    font: eplFont,
    tagline: "Lion purple, lifted for the dark. Thirty-eight matches of honest calibration sample." },
  { id: "laliga", name: "La Liga", top: "La Liga · Bet Suggester",
    eyebrow: "engine adaptation · season 26/27",
    accent: "#ff4b44", dim: "rgba(255,75,68,0.35)", faint: "rgba(255,75,68,0.10)",
    ambient: "rgba(255,75,68,0.07)", modeMs: 1000,
    logo: "/leagues/laliga.png", glyph: "soft",
    font: laligaFont,
    tagline: "Crest coral. The world champions’ home league is the obvious next room." },
];

function LeagueComingSoon({ league }: { league: (typeof LEAGUES)[number] }) {
  return (
    <Reveal>
      <section className="glow glow-accent mx-auto max-w-2xl rounded-3xl border border-line bg-elev px-6 py-14 text-center">
        <Eyebrow tone="accent">mode · scaffolded</Eyebrow>
        <p className="mt-5 text-lg text-ink-hi">
          The engine that priced World Cup 26 is being adapted for {league.name}.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-low">
          Fixtures pipeline · Kalshi market mapping · per-match xG sourcing
          · twelve fresh bot ledgers.
        </p>
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          arriving pre-season
        </p>
      </section>
    </Reveal>
  );
}

// Bespoke entrance effect per league (rendered only during a mode change).
// Full-viewport transition effects. Each rides its league's reveal:
// WC26 spotlight beams sweep with the wipe edge; the MLS slash band is
// the wipe edge; EPL glass droplets refract the page as they expand;
// the La Liga arm rotates at the boundary of the radial reveal.
function LeagueFX({ id }: { id: string }) {
  // anchor rotation/origin effects on the league logo's real position
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const g = document.querySelector(".league-glyph");
    if (!el || !g) return;
    const r = g.getBoundingClientRect();
    el.style.setProperty("--fx-x", `${r.left + r.width / 2}px`);
    el.style.setProperty("--fx-y", `${r.top + r.height / 2}px`);
  }, [id]);
  if (id === "mls") return <div className="fxx fxx-mls"><span className="curtain" /></div>;
  if (id === "epl") return <div className="fxx fxx-epl"><i /><i /><i /></div>;
  if (id === "laliga") return <div ref={ref} className="fxx fxx-laliga"><i /></div>;
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

// Watermark behind the league title. Prefers a real logo file dropped at
// public/leagues/{id}.svg (or .png via rename); until one exists, falls
// back to a built-in one-color recreation of the mark.
function LeagueMark({ league }: { league: (typeof LEAGUES)[number] }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [league.id]);
  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={league.logo} alt="" aria-hidden
        onError={() => setFailed(true)}
        className={`league-glyph object-contain glyph-${league.glyph}`} />
    );
  }
  return <LeagueGlyph id={league.id} />;
}

// Built-in one-color recreations (single-stroke, watermark duty).
function LeagueGlyph({ id }: { id: string }) {
  const common = { className: "league-glyph", viewBox: "0 0 100 100",
    fill: "none", stroke: "currentColor", strokeWidth: 2.2,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true };
  if (id === "mls") {
    return (
      <svg {...common}>
        {/* the crest: shield, diagonal slash, three stars in the field */}
        <path d="M22 12 h56 v42 c0 18 -14 28 -28 34 c-14 -6 -28 -16 -28 -34 z" />
        <path d="M64 12 L36 86" strokeWidth="4.5" />
        <path d="M31 24 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z" strokeWidth="1.6" />
        <path d="M40 38 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z" strokeWidth="1.6" />
        <path d="M33 54 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z" strokeWidth="1.6" />
      </svg>
    );
  }
  if (id === "epl") {
    return (
      <svg {...common}>
        {/* the crowned lion, reduced to its geometry */}
        <path d="M30 30 v-12 l8 7 12 -11 12 11 8 -7 v12 z" />
        <path d="M30 34 c-6 8 -8 18 -4 27 c4 10 14 17 24 17 c6 0 11 -2 15 -5 l-6 -8 c5 -2 9 -6 11 -11 l-9 -3 c1 -6 0 -12 -3 -17 z" />
        <path d="M44 48 a2.5 2.5 0 1 0 0.1 0 z" fill="currentColor" stroke="none" />
        <path d="M58 62 l10 3" />
      </svg>
    );
  }
  if (id === "laliga") {
    return (
      <svg {...common}>
        {/* the segmented pelota */}
        <circle cx="50" cy="50" r="36" />
        <path d="M50 14 c-14 10 -20 24 -16 40 c3 12 12 20 16 32" />
        <path d="M50 14 c14 10 20 24 16 40 c-3 12 -12 20 -16 32" />
        <path d="M16 42 c12 -6 30 -8 46 -4 c8 2 16 6 22 10" />
        <path d="M18 64 c14 2 32 0 46 -8 c6 -3 12 -8 16 -13" />
      </svg>
    );
  }
  return (
    <svg {...common}>
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
  // League drive-mode switcher: out-wipe, accent snap under the light
  // sweep, in-slide from the direction of travel.
  const [leagueIdx, setLeagueIdx] = useState(0);
  const [swapClass, setSwapClass] = useState("");
  const [fxOn, setFxOn] = useState(false);
  const [fxKey, setFxKey] = useState(0);
  const switching = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const league = LEAGUES[leagueIdx];
  const isWC = league.id === "wc26";
  // curtain-up: play the current league's transition once on page load
  const didIntro = useRef(false);
  useEffect(() => {
    if (didIntro.current) return;
    didIntro.current = true;
    switching.current = true;
    const l = LEAGUES[0];
    setSwapClass(`mode-reveal-${l.id}`);
    setFxOn(true);
    setFxKey((k) => k + 1);
    const t = setTimeout(() => {
      setSwapClass("");
      setFxOn(false);
      switching.current = false;
    }, l.modeMs);
    return () => clearTimeout(t);
  }, []);

  const goLeague = (target: number, _dirName: "next" | "prev") => {
    if (switching.current || target === leagueIdx) return;
    switching.current = true;
    const to = LEAGUES[target];
    // the new league mounts immediately; its reveal animation and the
    // matching full-screen effect uncover it together
    setLeagueIdx(target);
    setSwapClass(`mode-reveal-${to.id}`);
    setFxOn(true);
    setFxKey((k) => k + 1);
    setTimeout(() => {
      setSwapClass("");
      setFxOn(false);
      switching.current = false;
    }, to.modeMs);
  };
  const switchLeague = (delta: number) =>
    goLeague((leagueIdx + delta + LEAGUES.length) % LEAGUES.length,
             delta > 0 ? "next" : "prev");

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
    <div className="min-h-screen bg-bs font-sans text-ink-mid"
      style={{ "--accent": league.accent, "--accent-dim": league.dim,
               "--accent-faint": league.faint,
               "--accent-ambient": league.ambient } as CSSProperties}>
      <Head><title>{league.name} Bet Suggester · namson.dev</title></Head>

      <RouteProgress />
      <Toaster />
      <TopBar title={league.top}>
        {isWC && (
          <>
            <NavChip href="#bracket" active={activeSection === "bracket"}>Bracket</NavChip>
            <NavChip href="#board" active={activeSection === "board"}>Best bets</NavChip>
            <NavChip href="/bet-suggester/bots" active={false}>Bots</NavChip>
          </>
        )}
      </TopBar>

      {fxOn && <LeagueFX key={fxKey} id={league.id} />}
      {/* ============ MODE STAGE: the whole page is the cluster ============ */}
      <div className={`mode-stage ${swapClass}`}
        onTouchStart={(e) => {
          touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          const t = touchStart.current;
          touchStart.current = null;
          if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          // horizontal-dominant swipes only — vertical scroll stays free
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            switchLeague(dx < 0 ? 1 : -1);
          }
        }}>
      {/* ===================== SHOWCASE ZONE ===================== */}
      <div className="hero-ambient">
        <div className="mx-auto max-w-5xl px-5 pt-20 sm:pt-24">
          {/* Title lockup */}
          <header className="relative mb-16 select-none text-center sm:mb-20">
            <button aria-label="previous league" onClick={() => switchLeague(-1)}
              className="group absolute left-0 top-1/2 z-10 -translate-y-1/2 p-3 text-ink-low transition-all duration-300 hover:text-accent hover:drop-shadow-[0_0_10px_var(--accent-dim)] sm:left-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:-translate-x-0.5">
                <polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button aria-label="next league" onClick={() => switchLeague(1)}
              className="group absolute right-0 top-1/2 z-10 -translate-y-1/2 p-3 text-ink-low transition-all duration-300 hover:text-accent hover:drop-shadow-[0_0_10px_var(--accent-dim)] sm:right-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-0.5">
                <polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <div className="relative">
              <div className="relative">
                <LeagueMark league={league} />
                <Eyebrow tone="accent" className="mb-5">{`bet suggester · ${league.eyebrow}`}</Eyebrow>
                <h1 className="text-5xl font-semibold leading-[1.02] tracking-tighter sm:text-7xl lg:text-8xl">
                  <span className={`league-title block text-accent ${league.font.className}`}
                    style={"tracking" in league ? { letterSpacing: (league as { tracking?: string }).tracking } : undefined}>{league.name}</span>
                </h1>
                <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-low">
                  {isWC ? (
                    <>Monte Carlo match simulation vs. live market prices.
                    {updatedAt && ` Updated ${updatedAt.toLocaleTimeString()}.`}
                    {" "}For research — not financial advice.</>
                  ) : league.tagline}
                </p>
                {isWC && (
                  <p className="mt-5 flex justify-center">
                    <span className="champ-badge font-mono text-xs uppercase">
                      <span className="flag" aria-hidden />
                      ★ ★ campeones · españa
                      <span className="flag" aria-hidden />
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="mt-7 flex items-center justify-center gap-2">
              {LEAGUES.map((l, i) => (
                <button key={l.id} aria-label={`switch to ${l.name}`}
                  onClick={() => goLeague(i, i > leagueIdx ? "next" : "prev")}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === leagueIdx ? "w-9 bg-accent shadow-[0_0_12px_var(--accent-dim)]"
                    : "w-2.5 bg-[color:var(--line-strong)] hover:bg-ink-faint"}`} />
              ))}
            </div>
          </header>

          {!isWC && <LeagueComingSoon league={league} />}
          <div className={isWC ? undefined : "hidden"}>
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
      </div>

      {/* ===================== TOOL ZONE (Linear-style) ===================== */}
      <div className={`mx-auto max-w-5xl px-5 pb-16 pt-20 sm:pt-24${isWC ? "" : " hidden"}`}>

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
    </div>
  );
}

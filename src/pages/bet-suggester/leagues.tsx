// League carousel — namson.dev/bet-suggester/leagues
//
// The four leagues that are actually in season, each with its own drive
// mode: crest colour, wordmark face, entrance effect, dashboard.
//
// MOVED HERE 2026-08-30, from /bet-suggester. Two things changed with the
// address, and they are separate decisions:
//
//  1. /bet-suggester is now the PICKER BOARD. This carousel is a place
//     you choose, not the thing you land on.
//  2. WC26 IS NO LONGER IN THE CAROUSEL. It was index 0, which made a
//     finished tournament the default view of the whole site. It lives at
//     /bet-suggester/wc26 now, reached from the Archive dropdown, and
//     every piece of index arithmetic below counts FOUR leagues.
//
// Old deep links keep working: /bet-suggester?league=<id> is redirected
// here by next.config.ts (and ?league=wc26 to the archive page), and the
// guard below catches the client-side navigations a config redirect does
// not see.
import Head from "next/head";
import { Archivo, Baloo_2, Exo_2, Poppins } from "next/font/google";
import { useRouter } from "next/router";
import { CSSProperties, useEffect, useRef, useState } from "react";
import MlsDashboard from "../../components/MlsDashboard";
import EplDashboard from "../../components/EplDashboard";
import LaligaDashboard from "../../components/LaligaDashboard";
import LigamxDashboard from "../../components/LigamxDashboard";
import { Eyebrow, Reveal } from "../../components/ui";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import { NavChip, RouteProgress, Toaster, TopBar } from "../../components/chrome";

// Wordmark-adjacent faces: Exo 2 heavy italic for MLS's slanted crest
// letters, Poppins for the Premier League's rounded geometric, Baloo 2
// for LaLiga's rounded quirk, Archivo 800 for Liga MX's heavy geometric.
const mlsFont = Exo_2({ weight: "800", style: "italic", subsets: ["latin"] });
const eplFont = Poppins({ weight: "600", subsets: ["latin"] });
const laligaFont = Baloo_2({ weight: "700", subsets: ["latin"] });
const ligamxFont = Archivo({ weight: "800", subsets: ["latin"] });

// League "drive modes": each carries the primary color of its competition's
// logo (tuned where needed so the accent reads on the near-black canvas).
//
// FOUR ENTRIES, ALL IN SEASON. Anything finished belongs in the Archive
// dropdown, not here — a carousel of live leagues with a dead one wedged
// in it is how the site spent six weeks opening on a July tournament.
const LEAGUES = [
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
    tagline: "Crest coral. Fixtures, books and the table are live — the model stays dark until it earns approval." },
  { id: "ligamx", name: "Liga MX", top: "Liga MX · Bet Suggester",
    eyebrow: "engine adaptation · apertura 2026 · in season",
    accent: "#0fbe66", dim: "rgba(15,190,102,0.35)", faint: "rgba(15,190,102,0.10)",
    ambient: "rgba(15,190,102,0.07)", modeMs: 900,
    logo: "/leagues/ligamx.svg", glyph: "soft",
    font: ligamxFont,
    tagline: "Eagle green. Two tournaments a year, open Kalshi books tonight — the model stays dark until it earns approval." },
];

// Every league id with a real dashboard below. Kept beside the dispatch so
// the two cannot drift. Every entry qualifies today; the set stays because
// the failure it prevents (a built hub rendering behind a "coming soon"
// card) is silent, and the next league added is exactly when it bites.
const BUILT_LEAGUES = new Set(["mls", "epl", "ligamx", "laliga"]);

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
// Full-viewport transition effects. Each rides its league's reveal: the
// MLS slash band is the wipe edge; EPL glass droplets refract the page as
// they expand; the La Liga arm rotates at the boundary of the radial
// reveal.
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
  if (id === "ligamx") return <div className="fxx fxx-ligamx"><span className="curtain" /></div>;
  if (id === "epl") return <div className="fxx fxx-epl"><i /><i /><i /></div>;
  if (id === "laliga") return <div ref={ref} className="fxx fxx-laliga"><i /></div>;
  return <div className="fxx fxx-mls"><span className="curtain" /></div>;
}

// Watermark behind the league title. Prefers a real logo file dropped at
// public/leagues/{id}.svg (or .png via rename); until one exists, falls
// back to a built-in one-color recreation of the mark.
// Inner holds the img-failed state; the wrapper re-keys it per league so
// the state resets on league change WITHOUT a setState-in-effect.
function LeagueMark({ league }: { league: (typeof LEAGUES)[number] }) {
  return <LeagueMarkInner key={league.id} league={league} />;
}

function LeagueMarkInner({ league }: { league: (typeof LEAGUES)[number] }) {
  const [failed, setFailed] = useState(false);
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
  if (id === "ligamx") {
    return (
      <svg {...common}>
        {/* the eagle over the ball, reduced to strokes */}
        <circle cx="50" cy="62" r="24" />
        <path d="M50 38 c-3 8 -8 14 -14 18 M50 38 c3 8 8 14 14 18" />
        {/* wing sweeps */}
        <path d="M18 34 c10 -2 20 -6 26 -14 c2 6 0 12 -4 16 c-7 6 -15 6 -22 -2 z" />
        <path d="M82 34 c-10 -2 -20 -6 -26 -14 c-2 6 0 12 4 16 c7 6 15 6 22 -2 z" />
        {/* head */}
        <path d="M46 16 c2 -4 6 -6 10 -5 c3 1 5 4 5 7 l-7 2 z" />
        <path d="M50 58 l6 8 -6 8 -6 -8 z" strokeWidth="1.6" />
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
      {/* the crest: shield, diagonal slash, three stars in the field */}
      <path d="M22 12 h56 v42 c0 18 -14 28 -28 34 c-14 -6 -28 -16 -28 -34 z" />
      <path d="M64 12 L36 86" strokeWidth="4.5" />
      <path d="M31 24 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z" strokeWidth="1.6" />
      <path d="M40 38 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z" strokeWidth="1.6" />
      <path d="M33 54 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z" strokeWidth="1.6" />
    </svg>
  );
}

export default function LeagueCarousel() {
  // League drive-mode switcher: out-wipe, accent snap under the light
  // sweep, in-slide from the direction of travel.
  const [leagueIdx, setLeagueIdx] = useState(0);
  const [swapClass, setSwapClass] = useState("");
  const [fxOn, setFxOn] = useState(false);
  const [fxKey, setFxKey] = useState(0);
  const switching = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const league = LEAGUES[leagueIdx];
  // curtain-up: play the landing league's transition once on page load.
  // ?league=<id> deep-links a mode (the match hubs' "back to board" links
  // return to THEIR league, not the first one) — wait for the router so
  // the query param is actually readable on this auto-static route.
  const router = useRouter();
  const didIntro = useRef(false);
  useEffect(() => {
    if (!router.isReady || didIntro.current) return;
    // WC26 left the carousel; an old ?league=wc26 link means the archive
    // page, not "the first league in the list". findIndex would have
    // returned -1 and Math.max clamped it to MLS, silently showing a
    // different competition than the one asked for — the exact off-by-one
    // this move had to be checked for.
    // Lowercased: bookmarks arrive in any case, and "?league=WC26" or
    // "?league=EPL" clamped to MLS was the same silent-substitution bug
    // with a shift key held down.
    const qLeague = typeof router.query.league === "string"
      ? router.query.league.toLowerCase() : null;
    if (qLeague === "wc26") {
      router.replace("/bet-suggester/wc26");
      return;
    }
    didIntro.current = true;
    switching.current = true;
    const wanted = qLeague || LEAGUES[0].id;
    const found = LEAGUES.findIndex((l) => l.id === wanted);
    const idx = found >= 0 ? found : 0;
    const l = LEAGUES[idx];
    // The external system here is the ROUTER: on this auto-static route
    // the query is unreadable until router.isReady flips, and that flip
    // is the event this effect subscribes to. Deferring the setState to a
    // timer instead would paint the first league for a frame and mount
    // ITS dashboard (and its fetches) before swapping — a visible flash
    // on every deep link, to satisfy a lint rule that cannot see the
    // router.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeagueIdx(idx);
    setSwapClass(`mode-reveal-${l.id}`);
    setFxOn(true);
    setFxKey((k) => k + 1);
    const t = setTimeout(() => {
      setSwapClass("");
      setFxOn(false);
      switching.current = false;
    }, l.modeMs);
    return () => clearTimeout(t);
    // `router` is deliberately NOT a dependency. next/router hands back a
    // fresh public instance on every render, so listing it would re-run
    // this effect mid-animation — and the cleanup would clear the intro
    // timeout, stranding switching.current at true and the full-screen
    // effect on top of the page forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.league]);

  const goLeague = (target: number) => {
    if (switching.current || target === leagueIdx) return;
    switching.current = true;
    const to = LEAGUES[target];
    // Keep the mode in the URL (shallow — no data reload) so refresh,
    // share, and the match hubs' back links all land in this league.
    // ALWAYS written, for every league. The old page omitted it for the
    // league at index 0, which made "no query" mean "the default mode" —
    // and when the default changed, every bare link changed competition
    // with it.
    router.replace({ query: { league: to.id } }, undefined, { shallow: true });
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
    goLeague((leagueIdx + delta + LEAGUES.length) % LEAGUES.length);

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid"
      style={{ "--accent": league.accent, "--accent-dim": league.dim,
               "--accent-faint": league.faint,
               "--accent-ambient": league.ambient } as CSSProperties}>
      {/* one expression — next/head drops multi-child <title> at SSR */}
      <Head><title>{`${league.name} Bet Suggester · namson.dev`}</title></Head>

      <RouteProgress />
      <Toaster />
      <TopBar left={<ArchiveMenu />}
        back={{ href: "/bet-suggester", label: "board" }}
        title={league.top}>
        {/* Not a league mode: friendlies are a viewer-only surface (no
            model, ever), so they get a chip off the board rather than a
            place in the league carousel. */}
        <NavChip href="/bet-suggester/friendlies" active={false}>Friendlies</NavChip>
        {/* Viewer competitions: fixtures + Kalshi + strength read, no
            model. One shared page at /bet-suggester/comp/[key].
            ASEAN left this rail on 2026-08-30 — it FINISHED (0 upcoming,
            28 played), and it is in the Archive dropdown at the top-left
            with WC26. Leagues Cup (semi-finals on 2026-09-03) and UCL
            (league phase opens 2026-09-08) are live and stay here.
            RETIRED 2026-08-24 by operator decision, and dropped from
            this rail entirely: Conference (ecl), Europa (uel),
            Brasileirão, Argentina, USL. The backend stopped collecting
            them the same day; nothing recorded was deleted. The BACKEND
            still serves GET /api/comp/{key}/journal, but this app's comp
            proxy deliberately exposes only fixtures/markets/status/
            tournament — whether to open journal to readers is an
            operator call, not a comment's. */}
        {[["leagues-cup", "Leagues Cup"], ["ucl", "UCL"]].map(([k, label]) => (
          <NavChip key={k} href={`/bet-suggester/comp/${k}`} active={false}>
            {label}
          </NavChip>
        ))}
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
      <div className="hero-ambient">
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-20 sm:pt-24">
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
                  {league.tagline}
                </p>
              </div>
            </div>
            <div className="mt-7 flex items-center justify-center gap-2">
              {LEAGUES.map((l, i) => (
                <button key={l.id} aria-label={`switch to ${l.name}`}
                  onClick={() => goLeague(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === leagueIdx ? "w-9 bg-accent shadow-[0_0_12px_var(--accent-dim)]"
                    : "w-2.5 bg-[color:var(--line-strong)] hover:bg-ink-faint"}`} />
              ))}
            </div>
          </header>

          {league.id === "mls" && <MlsDashboard />}
          {league.id === "epl" && <EplDashboard />}
          {league.id === "ligamx" && <LigamxDashboard />}
          {league.id === "laliga" && <LaligaDashboard />}
          {/* The fallback must exclude EVERY league with a real
              dashboard, or a built hub renders behind a "coming soon"
              card. La Liga was exactly that: its backend served all
              five routes while this list still hid it. Derived from
              BUILT_LEAGUES now, so adding a dashboard cannot leave the
              fallback stale — the failure mode is silent. */}
          {!BUILT_LEAGUES.has(league.id) && <LeagueComingSoon league={league} />}
        </div>
      </div>
      </div>
    </div>
  );
}

// World Cup 26 — namson.dev/bet-suggester/wc26
//
// The tournament finished on 2026-07-19 (Spain, 1-0 AET). Until
// 2026-08-30 this view was index 0 of the league carousel, which meant
// the DEFAULT thing anyone landing on the site saw was a competition
// that no longer plays. It now lives at its own route, reached from the
// Archive dropdown at the top-left, and the carousel carries only the
// four leagues that are actually in season.
//
// The view itself is unchanged and moved verbatim: the same title
// lockup and entrance effect, the same live scoreboard, next-match
// hero, bracket, ranking board, watchlist and alert panels, reading the
// same endpoints. Nothing here was re-derived — this is an archive, and
// an archive that quietly recomputes itself is not one.
//
// 2026-09-06 — THE ONE THING THAT DID CHANGE, AND WHY.
// The watched-markets panel below was the last un-walled "bet now"
// surface on the site. It printed "alert fires at 75/100", ranked
// markets by a 0-100 composite score, filled a progress bar with it,
// and at 75 turned the row's border, its bar and its number `warn` and
// prefixed it with a clock emoji — a GO colour, on the ink family
// WatchedStrip reserves for REFUSALS, beside a moment named to act.
//
// Not one of the eight numbers behind that composite was ever measured
// (weights 35/25/20/10/10, a 0.7 damping, a 10-reading "learned" gate,
// slope*25, a 12-hour urgency ramp). The backend withdrew it: see
// `src/timing.py`'s WITHDRAWN registry, which rides on the payload this
// page renders, so a reader who never opens the repo still meets what
// was taken away and what would license bringing it back. The panel
// still shows every observation the composite was built out of — the
// information was never the problem, the verdict was.
//
// The charter this now keeps is `src/live/position.py`'s: IT SHOWS; IT
// DOES NOT DECIDE. No ranking, no threshold, no GO colour, no moment
// named to act, and every unmeasured constant labelled where a reader
// meets it.
//
// 2026-10-21 — FROZEN (cleanup C1). The backend's WC26 jobs, routes and
// tables are being removed. Before they went, every read this page made
// was taken one last time from production and kept verbatim under
// src/data/wc26/ (manifest.json there lists each route, when it was read
// and its checksum). What that showed:
//   - the bracket, with every result, and the champion — drawn below;
//   - the ranking board, next-match hero, live scoreboard, watched-markets
//     tape read and retired-trigger notifications — ALL EMPTY at the
//     freeze (finished matches leave the board; the watchlist and alert
//     rows lived in a container database every deploy wipes). An empty
//     panel kept in an archive would read as "nothing happened", so they
//     are not drawn, and the note under the bracket says so.
// Refresh-all, Watch / Unwatch and every other write are gone with them:
// an archive has nothing to refresh and nothing to declare.
import Head from "next/head";
import { Anton } from "next/font/google";
import { CSSProperties, useEffect, useRef, useState } from "react";
import BracketView, { WC26_CHAMPION } from "../../components/BracketView";
import { Eyebrow } from "../../components/ui";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import { NavChip, RouteProgress, TopBar } from "../../components/chrome";
import manifest from "../../data/wc26/manifest.json";

// Anton for the WC26 emblem's condensed weight.
const wcFont = Anton({ weight: "400", subsets: ["latin"] });

// The competition's own palette, kept beside the view it drives (it used
// to be entry 0 of the carousel's LEAGUES array).
const WC26 = {
  id: "wc26", name: "World Cup 26", top: "WC26",
  eyebrow: "live model · kalshi markets",
  accent: "#f5c542", dim: "rgba(245,197,66,0.35)", faint: "rgba(245,197,66,0.10)",
  ambient: "rgba(245,197,66,0.07)", modeMs: 3200,
  logo: "/leagues/wc26-official.png",
  tracking: "0.025em",
};

// The full-viewport entrance effect: spotlight beams sweeping with the
// wipe edge, confetti, crests, chants.
function WC26FX() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const g = document.querySelector(".league-glyph");
    if (!el || !g) return;
    const r = g.getBoundingClientRect();
    el.style.setProperty("--fx-x", `${r.left + r.width / 2}px`);
    el.style.setProperty("--fx-y", `${r.top + r.height / 2}px`);
  }, []);
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

// Watermark behind the title: the real emblem file, falling back to a
// built-in one-color trophy if it ever fails to load.
function WC26Mark() {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={WC26.logo} alt="" aria-hidden
        onError={() => setFailed(true)}
        className="league-glyph object-contain glyph-rich" />
    );
  }
  return (
    <svg className="league-glyph" viewBox="0 0 100 100" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden>
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

export default function WC26Archive() {
  // Curtain-up: play the entrance once on load, then get out of the way.
  // Started in the INITIAL state rather than from an effect, so the
  // reveal is on the very first paint; only the teardown is a timer.
  const [swapClass, setSwapClass] = useState("mode-reveal-wc26");
  const [fxOn, setFxOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setSwapClass(""); setFxOn(false); },
                         WC26.modeMs);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid"
      style={{ "--accent": WC26.accent, "--accent-dim": WC26.dim,
               "--accent-faint": WC26.faint,
               "--accent-ambient": WC26.ambient } as CSSProperties}>
      {/* one expression — next/head drops multi-child <title> at SSR */}
      <Head><title>{`${WC26.name} Bet Suggester · namson.dev`}</title></Head>

      <RouteProgress />
      <TopBar left={<ArchiveMenu current="wc26" />}
        back={{ href: "/bet-suggester", label: "board" }}
        title={WC26.top}>
        <NavChip href="#bracket" active>Bracket</NavChip>
        <NavChip href="/bet-suggester/bots" active={false}>Bots</NavChip>
      </TopBar>

      {fxOn && <WC26FX />}
      <div className={`mode-stage ${swapClass}`}>
      {/* ===================== SHOWCASE ZONE ===================== */}
      <div className="hero-ambient">
        <div className="mx-auto max-w-5xl px-5 pt-20 sm:pt-24">
          {/* Title lockup */}
          <header className="relative mb-16 select-none text-center sm:mb-20">
            <div className="relative">
              <div className="relative">
                <WC26Mark />
                <Eyebrow tone="accent" className="mb-5">{`bet suggester · ${WC26.eyebrow}`}</Eyebrow>
                <h1 className="text-5xl font-semibold leading-[1.02] tracking-tighter sm:text-7xl lg:text-8xl">
                  <span className={`league-title block text-accent ${wcFont.className}`}
                    style={{ letterSpacing: WC26.tracking }}>{WC26.name}</span>
                </h1>
                <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-low">
                  Monte Carlo match simulation vs. market prices, archived.
                  {" "}For research — not financial advice.
                </p>
                {WC26_CHAMPION && (
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
          </header>
        </div>
      </div>

      {/* ===================== ARCHIVE ===================== */}
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:pt-12">

        {/* Knockout bracket — reversed pyramid, final scores */}
        <div id="bracket" className="mb-12 border-t border-line pt-10">
          <BracketView />
        </div>

        <section className="mb-20 max-w-3xl" data-testid="wc26-frozen-note">
          <Eyebrow className="mb-2">what this archive keeps</Eyebrow>
          <p className="text-[13px] leading-relaxed text-ink-low">
            This page no longer reads a backend. Its reads were taken one last
            time on {manifest.frozen_on} and kept as they were answered. The
            ranking board, the live scoreboard, the watched-markets panel and
            the notification list all answered empty that day — a finished
            match leaves the board, and the watchlist and alert rows lived in
            a database every deploy wiped — so they are not drawn here. Each
            match card above opens that match&apos;s frozen T-10 record where
            one survives; the bots&apos; paper ledgers are on the Bots page.
          </p>
        </section>

        <footer className="mt-24 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
          Educational project. Simulated probabilities, not betting advice.
          Archived {manifest.frozen_on}; nothing on this page refreshes.
        </footer>
      </div>
      </div>
    </div>
  );
}

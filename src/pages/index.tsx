// namson.dev — THE HOME PAGE. TRIVELA, told in one scroll.
//
// Until 2026-10-02 this file was a server-side redirect to the board:
// there had never been a home page, so a stranger who typed the bare
// domain landed on a dense research surface with no idea what it was.
// This page is the explanation, for a reader who has never seen the
// board — a professor, an employer, a future user — and it ends at the
// board's door.
//
// THE STORY, and the one belief it exists to leave behind:
// "Every match, made readable."
//   1  the field — the hero: eleven competitions on two rating planes,
//      a switch and a panel (hover a dot for its team and Elo)
//   2  ↳ scroll moment 1: the camera moves in on one real match
//   3  three hours before — the board (real captures: the derby's card
//      and a national-team card side by side on a wide screen, behind
//      the board's own Leagues | Nations switch on a narrow one;
//      settles for one screen from 1024px — Board.tsx, BoardShot.tsx)
//   4  scroll moment 2: the match clock, model vs market, 0′→90′
//   5  scroll moment 3: full time, the review card unfolds
//   6  the record — four live counts and the honest results in plain words
//   7  open the board
// Design and data notes: trivela-ops/landing/ARCHITECTURE.md and
// VISUAL-SYSTEM.md.
//
// ONE READ, AND IT HAS A FALLBACK. The field, the nations and the derby
// are baked from read-only routes at authoring time (lib/landingData.ts).
// The record's four counts are read once per visit from GET
// /api/site/stats (lib/siteStats.ts) and fall back to the figures the
// approved draft baked from that same route (45,500 / 11 / 98,000+ /
// 12,000+) when it answers anything but a payload: the page must render
// with the backend down, and it must never touch the board routes, each
// of which writes a permanent snapshot row on every read.
// e2e/picker.spec.ts asserts the page's only /api/ request is that one.
//
// DECISION SAFETY (AGENTS.md §2). Every model number on this page sits
// under "shadow · not advice"; nothing is called an edge; nothing says
// buy, sell or bet. The results section says the standing result plainly:
// no model has shown information beyond the exchange price.
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { NavChip, TopBar } from "../components/chrome";
import { Mark, Wordmark } from "../components/Wordmark";
import Board from "../components/landing/Board";
import FieldStage from "../components/landing/FieldStage";
import FullTime from "../components/landing/FullTime";
import LandingIndex from "../components/landing/LandingIndex";
import MatchClock from "../components/landing/MatchClock";
import s from "../components/landing/landing.module.css";
import { useRise } from "../components/landing/useRise";
import { useSiteStats } from "../lib/siteStats";
import { useMediaQuery, useMotionGate, useReducedMotion } from "../lib/useScrollScene";

/** HOW TO REACH SON. One object, and a value left as "TODO" is simply
 *  not rendered — the row never shows a placeholder, and disappears
 *  entirely when nothing in it is filled. */
export const CONTACT = {
  email: "namson.dev.trivela@gmail.com",
  linkedin: "TODO",
  github: "https://github.com/SonNguyen2914",
} as const;
const filled = (v: string) => v.trim() !== "" && v !== "TODO";

export default function Home() {
  const reduced = useReducedMotion();
  /* THE MOTION GATE: scenes pin only when motion is allowed and the
     screen is tall enough to hold a stage (lib/useScrollScene). The
     board's own scene needs a wide screen as well. */
  const moving = useMotionGate();
  const wide = useMediaQuery("(min-width: 1024px)");
  const boardPinned = moving && wide;
  const { figures, source } = useSiteStats();
  useRise(!reduced, String(boardPinned));

  /* D5 · ONE PASS OF THE FLOODLIGHT across the closing headline, once,
     when half of it is on screen. At rest it is plain ink; the light is
     the page's own pale light, never gold. */
  const sweep = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = sweep.current;
    if (reduced || !el || typeof IntersectionObserver === "undefined") return;
    const make = (cb: IntersectionObserverCallback, o: IntersectionObserverInit) => {
      try { return new IntersectionObserver(cb, { root: document, ...o }); }
      catch { /* SWALLOWED(landing:io-document-root) */ return new IntersectionObserver(cb, o); }
    };
    const io: IntersectionObserver = make((es) => {
      const e = es[es.length - 1];
      if (e && e.intersectionRatio >= 0.5) { el.classList.add(s.run); io.disconnect(); }
    }, { threshold: [0, 0.5, 1] });
    io.observe(el);
    const done = () => el.classList.remove(s.run);
    el.addEventListener("animationend", done);
    return () => { io.disconnect(); el.removeEventListener("animationend", done); };
  }, [reduced]);

  const contacts = [
    filled(CONTACT.email) && { k: "email", label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    filled(CONTACT.github) && { k: "github", label: CONTACT.github.replace(/^https?:\/\//, ""), href: CONTACT.github },
    filled(CONTACT.linkedin) && { k: "linkedin", label: "LinkedIn", href: CONTACT.linkedin },
  ].filter(Boolean) as { k: string; label: string; href: string }[];

  return (
    <div className={s.root} data-testid="landing" data-motion={moving ? "on" : "off"}>
      <Head>
        <title>TRIVELA · every match, made readable</title>
        <meta name="description" content="TRIVELA reads every match in eleven football competitions against the real market — before kickoff, in play, and after the whistle. A research project at namson.dev." />
        <meta name="theme-color" content="#050507" />
      </Head>
      <div aria-hidden className={s.light} />
      {/* field · index | logo | board: the logo is the shared bar's own
          centre (components/chrome.tsx), so this page passes no wordmark
          and no title of its own */}
      {/* rail="inline": one short chip, and it fits beside the logo on a
          phone — a second row here would only take height from the
          pinned scenes, which are a screen tall */}
      <TopBar inner="max-w-[calc(1240px+7rem)] px-4 sm:px-8 lg:px-14" rail="inline"
        left={<LandingIndex />}>
        {/* below 340px the beside-the-logo track is ~118px: "board" */}
        <NavChip href="/bet-suggester"><span className="max-[340px]:hidden">open the </span>board</NavChip>
      </TopBar>

      <main>
        {moving
          ? <FieldStage mode="scroll" enabled />
          : <>
              <FieldStage mode="hero" enabled={false} />
              <FieldStage mode="match" enabled={false} />
            </>}

        <Board pinned={boardPinned} />

        <MatchClock mode={moving ? "scroll" : "still"} enabled={moving} />

        <FullTime enabled={!reduced} />

        {/* ── 6 · the record ─────────────────────────────────────── */}
        <section id="record" data-index="record" aria-labelledby="landing-record"
          className={`${s.wrap} ${s.still}`}>
          <div data-rise-group>
            <p className={s.eyebrow} data-rise>the record</p>
            <h2 id="landing-record" className={`${s.display} ${s.h2}`} data-rise>Measured, then said plainly.</h2>
          </div>
          <div data-rise-group>
            {/* the four counts: read live from GET /api/site/stats, the
                approved draft's figures when that does not answer
                (lib/siteStats.ts). data-source says which is on screen. */}
            <dl className={s.figures} data-testid="record-figures" data-source={source}>
              {figures.map((f) => (
                <div key={f.key} data-rise data-figure={f.key}>
                  <dt>{f.label}{f.sub && <span className={s.figureSub}>{f.sub}</span>}</dt>
                  <dd className={s.display}>{f.display}</dd>
                </div>
              ))}
            </dl>
            <ol className={s.findings}>
              <li data-rise>
                <span className={s.findTag}>better than the old method</span>
                <p>A learned model cuts log-loss by <b>0.018–0.030</b> per
                  match in walk-forward{"\u00a0"}tests.</p>
              </li>
              <li data-rise>
                <span className={s.findTag}>not yet confirmed</span>
                <p>The first sealed hold-outs were too small to tell.</p>
              </li>
              {/* source: backend research_archive/unified_model_2026-10-06/
                  RESULTS.md (unified-nb-v1 vs each competition's current
                  model; PREREGISTRATION.md was committed before any
                  test-period result): BETTER in La Liga, Liga MX and
                  AFCON, NOT_WORSE in the other eight; scored on pre-seal
                  history. */}
              <li data-rise>
                <span className={s.findTag}>passed a test set in advance</span>
                <p>One shared model for all eleven competitions passed a test
                  written before results were seen: better than the models it
                  replaced in La{"\u00a0"}Liga, Liga{"\u00a0"}MX and AFCON, and no worse
                  elsewhere. On past matches{"\u00a0"}— not proof of an{"\u00a0"}edge.</p>
              </li>
              <li data-rise>
                <span className={s.findTag}>not better than the market</span>
                <p>No model has shown information beyond the exchange price.{" "}
                  <span className={s.chip}>shadow · not advice</span></p>
              </li>
            </ol>
            <p className={s.recordAside} data-rise>
              In progress: an agent that acts on these reads is still
              learning. Experimental, unproven, not{"\u00a0"}advice.
            </p>
          </div>
        </section>

        {/* ── 7 · the door ───────────────────────────────────────── */}
        <section id="door" aria-labelledby="landing-end" className={`${s.wrap} ${s.end}`} data-rise-group>
          <div className={s.endMark} data-rise><Wordmark size="lg" as="p" /></div>
          <h2 id="landing-end" className={`${s.display} ${s.h2}`} data-rise>
            <span ref={sweep} className={s.sweep} data-text="Every match, made readable.">Every match, made readable.</span>
          </h2>
          <p className={s.body} data-rise>A place to look, not a thing to do.</p>
          <Link href="/bet-suggester" className={s.cta} data-rise data-testid="landing-cta">
            Open the board <span aria-hidden>→</span>
          </Link>
          {contacts.length > 0 && (
            <ul className={s.contact} data-rise data-testid="landing-contact">
              {contacts.map((c) => (
                <li key={c.k}>
                  <span className={s.contactKey}>{c.k}</span>
                  <a href={c.href} {...(c.k === "email" ? {} : { rel: "noopener noreferrer", target: "_blank" })}>
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className={`${s.wrap} ${s.footer}`}>
        <span><Mark size={12} /> TRIVELA · namson.dev</span>
        <ul className={s.footIndex} aria-label="Elsewhere on namson.dev">
          <li><Link href="/bet-suggester">the board</Link></li>
          <li><Link href="/bet-suggester/ratings">the ratings field</Link></li>
          <li><a href="#door">contact</a></li>
        </ul>
        <span>shadow · not advice</span>
      </footer>
    </div>
  );
}

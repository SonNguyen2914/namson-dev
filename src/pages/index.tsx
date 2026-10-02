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
//   1  the field — every club of the eight board leagues on one scale
//   2  ↳ scroll moment 1: the camera moves in on one real match
//   3  three hours before — the board (a real screenshot; still)
//   4  scroll moment 2: the match clock, model vs market, 0′→90′
//   5  scroll moment 3: full time, the review card unfolds
//   6  the record — scale, and the honest results in plain words
//   7  open the board
// Design and data notes: trivela-ops/landing/ARCHITECTURE.md and
// VISUAL-SYSTEM.md.
//
// NOTHING HERE IS FETCHED. Every number is baked from a read-only route
// at authoring time (lib/landingData.ts). The page must render with the
// backend down, and it must never touch the board routes, each of which
// writes a permanent snapshot row on every read. e2e/picker.spec.ts
// asserts the page makes no /api/ request at all.
//
// DECISION SAFETY (AGENTS.md §2). Every model number on this page sits
// under "shadow · not advice"; nothing is called an edge; nothing says
// buy, sell or bet. The results section says the standing result plainly:
// no model has shown information beyond the exchange price.
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { NavChip, TopBar } from "../components/chrome";
import FieldStage from "../components/landing/FieldStage";
import FullTime from "../components/landing/FullTime";
import MatchClock from "../components/landing/MatchClock";
import { Mark, Wordmark } from "../components/landing/Wordmark";
import s from "../components/landing/landing.module.css";
import { useReducedMotion } from "../lib/useScrollScene";

/** HOW TO REACH SON. One object, and a value left as "TODO" is simply
 *  not rendered — the row never shows a placeholder, and disappears
 *  entirely when nothing in it is filled. */
export const CONTACT = {
  email: "namson.dev.trivela@gmail.com",
  linkedin: "TODO",
  github: "https://github.com/SonNguyen2914",
} as const;
const filled = (v: string) => v.trim() !== "" && v !== "TODO";

const FIGURES = [
  { n: "45,500", k: "matches in the research corpus" },
  { n: "11", k: "competitions, one board" },
  { n: "~134,000", k: "Kalshi markets tracked" },
  { n: "10,000+", k: "backend tests" },
];

export default function Home() {
  const reduced = useReducedMotion();
  const moving = !reduced;
  const contacts = [
    filled(CONTACT.email) && { k: "email", label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    filled(CONTACT.github) && { k: "github", label: CONTACT.github.replace(/^https?:\/\//, ""), href: CONTACT.github },
    filled(CONTACT.linkedin) && { k: "linkedin", label: "LinkedIn", href: CONTACT.linkedin },
  ].filter(Boolean) as { k: string; label: string; href: string }[];

  return (
    <div className={s.root} data-testid="landing">
      <Head>
        <title>TRIVELA · every match, made readable</title>
        <meta name="description" content="TRIVELA reads every match in eleven football competitions against the real market — before kickoff, in play, and after the whistle. A research project at namson.dev." />
        <meta name="theme-color" content="#050507" />
      </Head>
      <div aria-hidden className={s.light} />
      <TopBar left={<Wordmark />} title="namson.dev"
        inner="max-w-[calc(1240px+7rem)] px-4 sm:px-8 lg:px-14">
        <NavChip href="/bet-suggester">open the board</NavChip>
      </TopBar>

      <main>
        {moving
          ? <FieldStage mode="scroll" enabled />
          : <>
              <FieldStage mode="hero" enabled={false} />
              <FieldStage mode="match" enabled={false} />
            </>}

        {/* ── 3 · three hours before: the board ─────────────────── */}
        <section aria-labelledby="landing-board" className={`${s.wrap} ${s.still}`}>
          <div className={s.boardGrid}>
            <div>
              <p className={s.eyebrow}>T{"−"}3h · the board</p>
              <h2 id="landing-board" className={`${s.display} ${s.h2}`}>Every fixture, ranked.</h2>
            </div>
            <p className={s.body}>
              Hours before kickoff, every fixture in the eleven competitions
              lands on one board — ranked by the gap between the two sides,
              with the tiers underneath it and the exchange&rsquo;s own price
              beside it. It ranks. It never picks.
            </p>
          </div>
          {/* THE REAL BOARD, at a size it can be read. Wide screens get
              both columns; a phone gets one card, cropped from the same
              capture, rather than the whole board shrunk to a smudge. */}
          <figure className={s.shot}>
            <div className={`${s.shotFrame} ${s.shotWide}`}>
              <Image src="/landing/board-championships.jpg" width={1020} height={518}
                alt="The TRIVELA board on 2 October 2026: two Nations League columns, each fixture card ranked, with an Elo gap split into rating and home terms, tier chips and the exchange's ask price."
                sizes="(min-width: 1100px) 1020px, 100vw" className={s.shotImg} />
              <ol aria-hidden className={s.pins}>
                <li style={{ left: "49.6%", top: "59.5%" }}>1</li>
                <li style={{ left: "49.6%", top: "65.6%" }}>2</li>
                <li style={{ left: "29.4%", top: "87.4%" }}>3</li>
              </ol>
            </div>
            <div className={`${s.shotFrame} ${s.shotNarrow}`}>
              <Image src="/landing/board-card.jpg" width={505} height={428}
                alt="One fixture card from the TRIVELA board, 2 October 2026: Hungary v Georgia, ranked first, +148 Elo gap split into +83 rating and +65 home, tier chips and the exchange's ask of 40 cents."
                sizes="100vw" className={s.shotImg} />
              <ol aria-hidden className={s.pins}>
                <li style={{ left: "79.4%", top: "50.9%" }}>1</li>
                <li style={{ left: "66%", top: "57.9%" }}>2</li>
                <li style={{ left: "57.8%", top: "84.6%" }}>3</li>
              </ol>
            </div>
            <figcaption className={s.shotCap}>
              <ol className={s.pinKey}>
                <li><b>1</b>the gap between the sides, in Elo</li>
                <li><b>2</b>that gap split: rating + home</li>
                <li><b>3</b>the exchange&rsquo;s own ask</li>
              </ol>
              <span className={s.shotMeta}>
                the Championships board · 2 Oct 2026 · <span className={s.chip}>shadow · not advice</span>
              </span>
            </figcaption>
          </figure>
        </section>

        <MatchClock mode={moving ? "scroll" : "still"} enabled={moving} />

        <FullTime enabled={moving} />

        {/* ── 6 · the record ─────────────────────────────────────── */}
        <section aria-labelledby="landing-record" className={`${s.wrap} ${s.still}`}>
          <p className={s.eyebrow}>the record</p>
          <h2 id="landing-record" className={`${s.display} ${s.h2}`}>Measured, then said plainly.</h2>
          <dl className={s.figures}>
            {FIGURES.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd className={s.display}>{f.n}</dd>
              </div>
            ))}
          </dl>
          <ol className={s.findings}>
            <li>
              <span className={s.findTag}>better than the old method</span>
              <p>In long walk-forward tests, a learned model beats the old
                method by <b>+0.018 to +0.030</b> log-loss per match.</p>
            </li>
            <li>
              <span className={s.findTag}>not yet confirmed</span>
              <p>The first sealed hold-outs were too small to confirm it.</p>
            </li>
            <li>
              <span className={s.findTag}>not better than the market</span>
              <p>No model here has shown information beyond the exchange
                price. Until one does, every model number on TRIVELA is
                labelled <b>shadow · not advice</b>.</p>
            </li>
          </ol>
        </section>

        {/* ── 7 · the door ───────────────────────────────────────── */}
        <section aria-labelledby="landing-end" className={`${s.wrap} ${s.end}`}>
          <Wordmark size="lg" as="p" />
          <h2 id="landing-end" className={`${s.display} ${s.h2}`}>Every match, made readable.</h2>
          <p className={s.body}>
            A place to look, not a thing to do. Nothing on TRIVELA is advice.
          </p>
          <Link href="/bet-suggester" className={s.cta} data-testid="landing-cta">
            Open the board <span aria-hidden>→</span>
          </Link>
          {contacts.length > 0 && (
            <ul className={s.contact} data-testid="landing-contact">
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
        <span>shadow · not advice</span>
      </footer>
    </div>
  );
}

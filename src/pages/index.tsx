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
//   3  three hours before — the board (real screenshots: clubs and
//      national teams side by side on a wide screen, behind the board's
//      own Leagues | Championships switch on a narrow one; still —
//      BoardShot.tsx)
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
import Link from "next/link";
import { NavChip, TopBar } from "../components/chrome";
import { Mark, Wordmark } from "../components/Wordmark";
import BoardShot from "../components/landing/BoardShot";
import FieldStage from "../components/landing/FieldStage";
import FullTime from "../components/landing/FullTime";
import MatchClock from "../components/landing/MatchClock";
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
  { n: "45,500", k: "matches in the corpus" },
  { n: "11", k: "competitions" },
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
      {/* field · logo · board: the logo is the shared bar's own centre
          (components/chrome.tsx), so this page passes no wordmark and no
          title of its own */}
      {/* rail="inline": one short chip, and it fits beside the logo on a
          phone — a second row here would only take height from the
          pinned scenes, which are a screen tall */}
      <TopBar inner="max-w-[calc(1240px+7rem)] px-4 sm:px-8 lg:px-14" rail="inline">
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

        {/* ── 3 · three hours before: the board ─────────────────── */}
        <section aria-labelledby="landing-board" className={`${s.wrap} ${s.still}`}>
          <div className={s.boardGrid}>
            <div>
              <p className={s.eyebrow}>T{"−"}3h · the board</p>
              <h2 id="landing-board" className={`${s.display} ${s.h2}`}>Every fixture, ranked.</h2>
            </div>
            <p className={s.body}>
              Clubs and national teams, ranked by the gap between the
              sides&nbsp;— never picked.
            </p>
          </div>
          <BoardShot />
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
              <p>A learned model cuts log-loss by <b>0.018–0.030</b> per
                match in walk-forward{"\u00a0"}tests.</p>
            </li>
            <li>
              <span className={s.findTag}>not yet confirmed</span>
              <p>The first sealed hold-outs were too small to tell.</p>
            </li>
            <li>
              <span className={s.findTag}>not better than the market</span>
              <p>No model has shown information beyond the exchange price.{" "}
                <span className={s.chip}>shadow · not advice</span></p>
            </li>
          </ol>
        </section>

        {/* ── 7 · the door ───────────────────────────────────────── */}
        <section aria-labelledby="landing-end" className={`${s.wrap} ${s.end}`}>
          <Wordmark size="lg" as="p" />
          <h2 id="landing-end" className={`${s.display} ${s.h2}`}>Every match, made readable.</h2>
          <p className={s.body}>A place to look, not a thing to do.</p>
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

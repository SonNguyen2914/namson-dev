// Leagues Cup — namson.dev/bet-suggester/leagues-cup
//
// The competition finished on 2026-09-07: Toluca 2-0 Monterrey. It is
// archived here, reached from the Archive dropdown at the top-left
// alongside World Cup 26 and the ASEAN Championship, and the same
// triage that filed ASEAN files it — see `components/ArchiveMenu.tsx`,
// whose header records the date each competition's state was CHECKED
// rather than assumed.
//
// THIS IS NOT `/bet-suggester/comp/leagues-cup`, AND BOTH STILL EXIST.
// That route is the live competition viewer — fixtures, Kalshi markets,
// a cross-league strength read — and it is still linked from the board's
// rail. This route is the finished tournament's record: three seasons of
// bracket, and nothing that implies a bet. Filing one did not delete the
// other, and the rail chip is another owner's file this round.
//
// WHERE THE DATA COMES FROM, AND WHY IT IS IMPORTED AND NOT FETCHED.
// `src/data/leagues-cup-brackets.json` is emitted by
// `backend/scripts/build_leagues_cup_brackets.py` from the research
// archive, and a backend test re-derives it and fails if the committed
// file no longer reproduces. Three finished seasons cannot change, so an
// endpoint would spend a round trip returning a constant and this page
// would carry a loading state and a failed-read state for something
// already in its own bundle. The archive is not a live read and is not
// dressed as one.
//
// NO ROUND LABEL EXISTS IN EITHER SOURCE, so every round below was
// DERIVED — see `backend/src/leagues_cup_bracket.py`. The group and
// league phases are NOT derived, and each season says so by name with
// the check that stopped the walk. A bracket slot filled by guesswork
// would be a claim about the tournament made by a layout.
import Head from "next/head";
import { useState } from "react";

import { ArchiveMenu } from "../../components/ArchiveMenu";
import { RouteProgress, TopBar } from "../../components/chrome";
import CupBracket, { Season } from "../../components/CupBracket";
import { Eyebrow } from "../../components/ui";
import raw from "../../data/leagues-cup-brackets.json";

type Doc = {
  display: string;
  no_round_label_exists: string;
  won_is_not_advanced: string;
  checks: Record<string, string>;
  seasons: Season[];
};

// Narrowed ONCE, at the single point the file enters the page. TypeScript
// widens a JSON import to string/number, which loses the string-literal
// unions the Tie type declares; the shape itself is pinned on the other
// side by tests/test_leagues_cup_bracket.py, which asserts the emitted
// keys and re-derives the file from the archive.
const DOC = raw as unknown as Doc;

// DERIVED FROM THE FILE, NOT TYPED HERE. A hand-written [2024, 2025,
// 2026] would go on rendering three tabs after a fourth season landed in
// the corpus, and the page would silently be missing one.
const SEASONS = [...DOC.seasons].sort((a, b) => b.season - a.season);

export default function LeaguesCupArchive() {
  const [season, setSeason] = useState(SEASONS[0].season);
  const current = SEASONS.find((s) => s.season === season) ?? SEASONS[0];

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head>
        <title>Leagues Cup · archive · namson.dev</title>
        <meta name="description"
          content="Three archived Leagues Cup seasons, drawn as brackets derived from the fixture record." />
      </Head>
      <RouteProgress />
      <TopBar left={<ArchiveMenu current="leagues-cup" />}
        back={{ href: "/bet-suggester", label: "board" }}
        title="Leagues Cup" />

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:pt-14">
        <header className="mb-10">
          <Eyebrow tone="accent">archive · finished 2026-09-07</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-hi sm:text-4xl">
            Leagues Cup
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink-mid">
            Three seasons, reconstructed from the fixture archive. Nothing on
            this page is a model output, a price or a recommendation — the
            competition is over and the only honest content is what happened.
          </p>
        </header>

        {/* Season tabs. Buttons, not links: the whole archive is in this
            page's bundle, so a route change per season would be a
            navigation that fetches nothing. */}
        <div role="tablist" aria-label="season"
          className="mb-8 flex flex-wrap gap-2">
          {SEASONS.map((s) => {
            const on = s.season === season;
            return (
              <button
                key={s.season}
                type="button"
                role="tab"
                aria-selected={on}
                data-testid="lc-season-tab"
                onClick={() => setSeason(s.season)}
                className={`rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  on
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi"
                }`}
              >
                {s.season}
                <span className="ml-2 text-[9px] tracking-[0.1em] text-ink-faint">
                  {s.champion ?? "—"}
                </span>
              </button>
            );
          })}
        </div>

        {/* WHAT THE READER IS LOOKING AT, BEFORE THEY LOOK AT IT. Both
            of these are load-bearing and both are easy to get wrong by
            glancing: that no round label exists anywhere in the sources,
            and that "won" and "advanced" are two different columns. The
            words come from the emitted file, so the page cannot drift
            from what the derivation actually claims. */}
        <section className="mb-10 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-elev/60 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
              every round here was derived
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-mid">
              {DOC.no_round_label_exists}
            </p>
            <ul className="mt-3 space-y-1">
              {Object.entries(DOC.checks).map(([k, v]) => (
                <li key={k} className="text-[11px] leading-snug text-ink-low">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-mid">
                    {k}
                  </span>{" "}
                  — {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-elev/60 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
              winning and going through are different
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-mid">
              {DOC.won_is_not_advanced}
            </p>
            <p className="mt-3 text-[11px] leading-snug text-ink-low">
              A level tie leaves both names on the middle ink — nobody was
              ahead — and marks the club that went through{" "}
              <span className="rounded border border-line-strong px-1 py-px font-mono text-[8px] uppercase leading-none tracking-[0.14em] text-ink-hi">
                through
              </span>{" "}
              with an amber{" "}
              <span className="rounded border border-warn/40 bg-warn/10 px-1 py-px font-mono text-[8px] uppercase leading-none tracking-[0.16em] text-warn">
                pens
              </span>{" "}
              chip on the card.
            </p>
          </div>
        </section>

        <CupBracket s={current} />
      </main>
    </div>
  );
}

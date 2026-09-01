// The picker board — namson.dev/bet-suggester
//
// The landing surface: every upcoming fixture across the four in-season
// leagues, one COLUMN per league (MLS · EPL · La Liga · Liga MX), each
// column independently sortable. Reads GET /api/picker/board, which
// serves src/picker.
//
// WHAT THIS PAGE IS ALLOWED TO SAY. It is a place to look, not a thing to
// do. No model runs on these fixtures, no probability of ours exists for
// them, and no number here is an edge — so nothing on this page may read
// as a recommendation, carry a rating of our own, or imply a price is
// wrong. The picker RANKS, NEVER CUTS: there is no qualifying bar in the
// backend and this page adds none. The operator is the threshold.
//
// FOUR THINGS THIS PAGE EXISTS TO KEEP VISIBLE, because each is a real
// finding that a tidier board would bury:
//
//  1. A row can rank first on the table gap and be HOLLOW underneath.
//     The three tier gaps therefore render as three separate signed
//     chips with a plain-English read beside them, not as one shape
//     word and three numbers to squint at.
//  2. "prior szn" is not a footnote. Under 8 games played, ALL FOUR
//     Stage 1 inputs come from last season. It gets a banner, a badge in
//     every column header, and a per-row badge.
//  3. Refused fixtures are LISTED with their reason, at the foot of the
//     column they belong to. A fixture that vanishes silently is the
//     defect the whole surface is built against.
//  4. SORT IS PRESENTATION. A column's sort mode reorders the rows it
//     was served — it never hides one, and a row with no value under the
//     active key (no quote, under a price key) sorts last, stated on
//     screen. The per-column logic lives in lib/pickerSort.ts; the card
//     itself in components/PickerColumn.tsx.
//  5. A FINISHED MATCH IS STILL REACHABLE. The board used to lose a
//     fixture at kickoff — "once a match finished I have no way to access
//     it to see where could I do better." Each column now carries a
//     FINISHED TAIL under its upcoming rows, on a second, independent
//     request to GET /api/picker/review. Two things that page owes the
//     reader and that this file is responsible for: the BACK WINDOW
//     control (default 7 days, matching the forward window, so a league
//     column tells one continuous story), and the STORE NOTE — when no
//     snapshot store is configured, nothing is being frozen anywhere and
//     every read in every tail is a reconstruction. That is a property of
//     the deployment, not a coincidence, and it belongs at the top of the
//     page rather than being inferred card by card.
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { TZ } from "../../lib/matchday";
import {
  Board, CURRENT_SEASON_GP_FLOOR, PICKER_LEAGUE_ORDER, THIN_ASK_SIZE,
  WIDE_SPREAD_C, fetchBoard, leagueLabel,
} from "../../lib/pickerApi";
import {
  DEFAULT_BACK, REVIEW_WINDOWS, Review, fetchReview,
} from "../../lib/pickerReview";
import { Eyebrow } from "../../components/ui";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import { LeagueColumn } from "../../components/PickerColumn";
import {
  Collapse, NavChip, RouteProgress, SkeletonRows, TopBar,
} from "../../components/chrome";

const WINDOWS = [1, 2, 3, 7, 14];   // the endpoint accepts 1..14
// 7, not the endpoint's own 2: four league columns deserve a fuller
// slate than a two-day sliver — a column that is usually empty teaches
// the reader to stop looking at it. The window control still offers the
// short reads.
const DEFAULT_DAYS = 7;

/** The board's own ET date key, YYYYMMDD, made readable. Left as the raw
 *  key if it is ever any other shape — inventing a date from a string we
 *  do not recognise is worse than showing the string. */
const etDate = (d: string) =>
  /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d;

export default function PickerBoard() {
  const router = useRouter();
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  // The finished tail rides on its OWN state, its own request and its own
  // window. A dead review must not blank the board, and a slow one must
  // not hold the board's first paint.
  const [back, setBack] = useState(DEFAULT_BACK);
  const [review, setReview] = useState<Review | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(true);

  // Deep-link guard. /bet-suggester?league=<id> was the carousel's own
  // URL until 2026-08-30 and is all over the match hubs' back links and
  // anyone's bookmarks. next.config.ts redirects the HARD loads; a config
  // redirect never sees a client-side <Link> transition, so the same
  // mapping lives here too. wc26 goes to the archive page, not to the
  // first league in a list it is no longer part of.
  //
  // PRESENCE, not truthiness: "?league=" (an empty value) is still a
  // legacy deep link and goes to the carousel's own default rather than
  // silently keeping a dead param on the board. And bookmarks arrive in
  // any case — "?league=WC26" means wc26, not "clamp to MLS".
  const rawLeague = router.query.league;
  const deepLink = typeof rawLeague === "string"
    ? rawLeague.toLowerCase() : null;
  useEffect(() => {
    if (!router.isReady || deepLink === null) return;
    router.replace(
      deepLink === "wc26" ? "/bet-suggester/wc26"
      : deepLink === "" ? "/bet-suggester/leagues"
      : `/bet-suggester/leagues?league=${encodeURIComponent(deepLink)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, deepLink]);

  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const b = await fetchBoard(days, signal);
      if (signal.aborted) return;
      setBoard(b);
      setError("");
    } catch (e) {
      if (signal.aborted) return;
      setBoard(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (deepLink !== null) return;        // redirecting; do not fetch
    const ac = new AbortController();
    // async, not called sync in the effect body, so every setState inside
    // load() lands in a callback rather than cascading a render
    const t = setTimeout(() => { void load(ac.signal); }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, [load, nonce, deepLink]);

  const loadReview = useCallback(async (signal: AbortSignal) => {
    setReviewLoading(true);
    try {
      const r = await fetchReview(back, signal);
      if (signal.aborted) return;
      setReview(r);
      setReviewError("");
    } catch (e) {
      if (signal.aborted) return;
      // Same contract as the board: on failure the previous payload is
      // DROPPED. A finished tail from an older window standing under a
      // fresh board is stale dressed as current.
      setReview(null);
      setReviewError(e instanceof Error ? e.message : String(e));
    } finally {
      if (!signal.aborted) setReviewLoading(false);
    }
  }, [back]);

  useEffect(() => {
    if (deepLink !== null) return;
    const ac = new AbortController();
    const t = setTimeout(() => { void loadReview(ac.signal); }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, [loadReview, nonce, deepLink]);

  const rows = board?.rows ?? [];
  const refusals = board?.refusals ?? [];
  const leaguesMap = board?.leagues ?? {};
  const leagues = Object.entries(leaguesMap);
  const priorLeagues = leagues.filter(([, m]) => m.src === "prior");

  const finished = review?.finished ?? [];
  const finishedRefusals = review?.refusals ?? [];
  const reviewLeagues = review?.leagues ?? {};
  // "Nothing was captured" and "capture was never possible here" are
  // different facts, and only the payload can tell them apart. When the
  // store reports it cannot write, EVERY read in every tail below is a
  // reconstruction by construction — say it once, at the top, rather than
  // leaving the reader to notice the pattern.
  const storeNote = review && review.store && review.store.writable === false
    ? `No pre-kickoff read is being frozen on this deployment (snapshot `
      + `store: ${review.store.backend}), so every read below is a `
      + `RECONSTRUCTION rebuilt from the season archive. That is a `
      + `property of the setup, not a coincidence, and it will stay true `
      + `until a store is configured.`
    : null;

  // Column order is FIXED — MLS · EPL · La Liga · Liga MX — then any slug
  // the payload serves that this page does not know, appended rather than
  // dropped: a new league arriving in the registry must not disappear.
  const columnSlugs = [
    ...PICKER_LEAGUE_ORDER,
    ...[...new Set([
      ...Object.keys(leaguesMap),
      ...rows.map((r) => r.league),
      ...refusals.map((r) => r.league),
      // the review payload too: a league that has finished matches but no
      // upcoming ones must not lose its column, or the operator loses the
      // matches he came back to look at
      ...Object.keys(reviewLeagues),
      ...finished.map((r) => r.league),
      ...finishedRefusals.map((r) => r.league),
    ])].filter((s) => !PICKER_LEAGUE_ORDER.includes(s)),
  ];

  if (deepLink !== null) {
    return (
      <div className="min-h-screen bg-bs font-sans text-ink-mid">
        <Head><title>Picker board · namson.dev</title></Head>
        <RouteProgress />
        <main className="mx-auto max-w-5xl px-5 pt-24">
          <Eyebrow>opening the league carousel…</Eyebrow>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>Picker board · namson.dev</title></Head>
      <RouteProgress />
      <TopBar left={<ArchiveMenu />} title="picker board">
        <NavChip href="/bet-suggester/leagues" active={false}>Leagues</NavChip>
        <NavChip href="/bet-suggester/friendlies" active={false}>Friendlies</NavChip>
        {/* Live viewer competitions. ASEAN is not here: it finished, and
            it sits in the Archive dropdown at the top-left with WC26. */}
        {[["leagues-cup", "Leagues Cup"], ["ucl", "UCL"]].map(([k, label]) => (
          <NavChip key={k} href={`/bet-suggester/comp/${k}`} active={false}>
            {label}
          </NavChip>
        ))}
      </TopBar>

      {/* max-w-[96rem], not the app's usual 5xl: four columns of match
          cards need the width, and each column stays a readable ~22rem.
          The intro copy below keeps its own measure (max-w-2xl). */}
      <main className="mx-auto max-w-[96rem] px-5 pb-24 pt-12 sm:pt-16">
        <Eyebrow tone="accent">picker · stage 1 + stage 2</Eyebrow>
        {/* "Hand-picked" read as a curated subset — the page's copy states
            its own rule (ranks, never cuts) in the H1 itself. */}
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-hi sm:text-5xl">
          Every fixture, ranked
        </h1>
        {/* The one honest line of framing. Not "bet these". */}
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-low">
          Every upcoming fixture in the four in-season leagues, ranked by how
          far apart the two clubs sit in their own league&apos;s table. No model
          runs on this page, no number below is a probability or an edge of
          ours, and nothing here is a recommendation — the ranking says where
          to look, and you are the one who picks.
        </p>

        {/* ------------------------- controls ------------------------- */}
        <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wide">
          <span className="mr-1 text-ink-faint">window</span>
          {WINDOWS.map((n) => (
            <button key={n} onClick={() => setDays(n)}
              aria-pressed={days === n}
              className={`rounded-md border px-2 py-1 transition-colors ${
                days === n
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-line text-ink-faint hover:border-line-strong hover:text-ink-mid"}`}>
              {n}d
            </button>
          ))}
          {/* The FINISHED tail's own window, its own control. It opens at
              the same 7 days as the board's forward window on purpose —
              a column should tell one continuous story — but the two are
              separate questions ("what is coming" / "what did I miss")
              and a reader lengthening one must not silently lengthen the
              other. 30 is the endpoint's own cap; it refuses beyond that
              rather than clamping, so this list may never grow past it.

              Each chip carries an EXPLICIT accessible name rather than
              relying on the visible "3d". Two reasons, both real: "3d"
              alone is a poor button name for anyone who cannot see the
              row it sits in, and the forward window's chips carry the
              same visible text — a name that says WHICH window keeps the
              two addressable apart, by assistive tech and by tests. */}
          <span className="ml-4 mr-1 text-ink-faint">finished</span>
          {REVIEW_WINDOWS.map((n) => (
            <button key={n} data-testid="review-window" data-back={n}
              onClick={() => setBack(n)}
              aria-pressed={back === n}
              aria-label={`finished window, last ${n} day${n === 1 ? "" : "s"}`}
              className={`rounded-md border px-2 py-1 transition-colors ${
                back === n
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-line text-ink-faint hover:border-line-strong hover:text-ink-mid"}`}>
              {n}d
            </button>
          ))}
          <button onClick={() => setNonce((n) => n + 1)}
            className="ml-2 rounded-md border border-line px-2 py-1 text-ink-faint transition-colors hover:border-line-strong hover:text-ink-mid">
            ↻ refresh
          </button>
          {/* !loading too: a previous board's "built …" line standing
              beside skeletons is exactly the stale-dressed-as-current
              state the error branch below promises never to show. */}
          {board && !loading && (
            <span className="ml-auto text-ink-faint">
              built {new Date(board.generated_at).toLocaleString("en-US", {
                timeZone: TZ, month: "short", day: "numeric",
                hour: "numeric", minute: "2-digit", second: "2-digit",
              })}
              {" · slate "}{etDate(board.date)} ET · {rows.length} fixture{rows.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <p className="mt-2 font-mono text-[10px] tracking-wide text-ink-faint">
          kickoffs render in {TZ} — one fixed zone for everyone, so the page is
          the same page twice. Cached 90s server-side; “built” is when the
          board was assembled, not when you asked for it.
        </p>

        {/* --------------- the season-basis banner, not a footnote --------------- */}
        {priorLeagues.length > 0 && (
          <section data-testid="prior-banner"
            className="mt-6 rounded-xl border border-warn/30 bg-warn/5 p-4">
            <Eyebrow tone="warn">
              {priorLeagues.length} of {leagues.length} leagues · rated on last season
            </Eyebrow>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-mid">
              {priorLeagues
                .map(([slug, m]) => `${leagueLabel(slug)} ${m.min_current_gp ?? "?"} GP`)
                .join(" · ")}
              {/* explicit {" "}: JSX ate the leading space of the text node
                  after this expression and shipped "Under 8games played" */}
              . Under {CURRENT_SEASON_GP_FLOOR}{" "}
              games played this season&apos;s table
              is noise, so all four ranking inputs — and the tiers below — come
              from last season&apos;s final table for those leagues. The columns
              and the rows say which.
            </p>
          </section>
        )}

        {/* ---------------------------- the board ---------------------------- */}
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-6">
            <h2 className="text-lg font-medium text-ink-hi">
              Ranked by table gap
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              per column · |GD/g gap| descending by default · no cut-off
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {PICKER_LEAGUE_ORDER.map((s) => (
                <SkeletonRows key={s} rows={3} height="h-40" />
              ))}
            </div>
          ) : error ? (
            <div data-testid="board-error"
              className="rounded-xl border border-live/30 bg-live/5 p-5">
              <Eyebrow tone="live">the board could not be built</Eyebrow>
              <p className="mt-2 font-mono text-[12px] text-live">{error}</p>
              <p className="mt-3 text-sm text-ink-low">
                Nothing is being shown from an earlier request — a stale board
                dressed as a current one is worse than none.
              </p>
              <button onClick={() => setNonce((n) => n + 1)}
                className="mt-4 rounded-md border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
                try again
              </button>
            </div>
          ) : (
            <>
              {/* On a phone the four columns stack — these chips are the
                  way to a league without scrolling through the ones above
                  it. Hidden from md up, where the grid says it itself. */}
              <nav data-testid="league-jump" aria-label="jump to a league"
                className="mb-4 flex flex-wrap gap-1.5 md:hidden">
                {columnSlugs.map((s) => (
                  <a key={s} href={`#picker-col-${s}`}
                    className="rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
                    {leagueLabel(s)}
                  </a>
                ))}
              </nav>
              {/* Every column's content flows at its natural height — no
                  inner scrollers: a row below a fold that only scrolls
                  inside a box is a row most readers never see. */}
              <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-4">
                {columnSlugs.map((slug) => (
                  <LeagueColumn key={slug} slug={slug} days={days}
                    meta={leaguesMap[slug]}
                    rows={rows.filter((r) => r.league === slug)}
                    refusals={refusals.filter((r) => r.league === slug)}
                    review={{
                      rows: finished.filter((r) => r.league === slug),
                      refusals: finishedRefusals.filter((r) => r.league === slug),
                      meta: reviewLeagues[slug],
                      back, loading: reviewLoading, error: reviewError,
                      storeNote,
                    }} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* ------------------------- how to read it -------------------------
            Deliberately NOT wrapped in <Reveal>: it is a reference block at
            the bottom of a long page, and a fade-in that has not fired yet
            renders it at opacity 0 — indistinguishable from broken for the
            one reader who came looking for a definition. */}
        <Collapse eyebrow="legend" title="How to read a row"
          defaultOpen={false} className="mt-12 border-t border-line pt-6">
          <dl className="space-y-4 text-sm leading-relaxed text-ink-low">
            <div>
              <dt className="text-ink-hi">GD/g gap · ppg gap · rank gap</dt>
              <dd className="mt-1">
                Stage 1, all three signed from the favourite&apos;s side. The
                favourite is whichever club has the better whole-league derived
                rank; conferences and groups are deliberately ignored. Each
                column opens ordered by the absolute GD/g gap and by nothing
                else.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">T1 … T5</dt>
              <dd className="mt-1">
                Within-league quintiles — T1 is the best fifth of that league,
                T5 the worst — on three separate measures: points per game
                (overall), goals for per game (attack), goals against per game
                (defence). A pair reads favourite v opponent.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">CLEAN · SPLIT · HOLLOW</dt>
              <dd className="mt-1">
                CLEAN = the favourite is a better tier on all three. HOLLOW =
                level or behind in BOTH attack and defence, however big the
                table gap looks. SPLIT = everything else. The label annotates;
                it never removes a row.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">prior szn</dt>
              <dd className="mt-1">
                That league&apos;s lowest current games-played is under{" "}
                {CURRENT_SEASON_GP_FLOOR}, so every input and every tier comes
                from last season&apos;s final table instead of a handful of
                matches.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">kalshi ask · spread · size</dt>
              <dd className="mt-1">
                The favourite&apos;s side of the book, as annotation.
                WIDE = spread over {WIDE_SPREAD_C}¢; THIN = ask size under{" "}
                {THIN_ASK_SIZE}. A missing quote never removes a fixture — the
                price decorates the board, it does not gate it.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">captured · reconstructed</dt>
              <dd className="mt-1">
                Under each column&apos;s divider are the matches that already
                finished. CAPTURED means the board row was frozen before
                kickoff — what the picker actually said. RECONSTRUCTED means
                nothing was stored, so the picker&apos;s own code was re-run
                over the season archive rewound to that kickoff. The second
                is weaker evidence and is drawn as such: a dashed rail, a
                different ink, the words &ldquo;NOT a capture&rdquo;, and a
                provenance block naming the archive file and the instant it
                was rewound to. Rebuilding a read from today&apos;s table and
                calling it the pre-kickoff one would grade the picker against
                results it did not have.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">shot share · 20&apos; · before the opener · FT</dt>
              <dd className="mt-1">
                The favourite&apos;s share of the shots at three checkpoints,
                with the raw counts beside it — the event count is part of
                the answer. A win from 44% of the shots and a win from 91% of
                them are the same word on the scoreboard and opposite
                pictures here, which is the whole reason the bars are drawn.
                TILT_FAV / CONTESTED / TILT_OPP label the threat tilt against
                the live card&apos;s own band; that band is exploratory and
                says so.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">the two verdicts</dt>
              <dd className="mt-1">
                &ldquo;Favourite won&rdquo; answers the scoreboard.
                &ldquo;In-play read at 20&apos;&rdquo; answers the tape. They
                are derived separately and shown separately because they
                disagree, and the disagreement is the thing worth looking at.
                Either can read &ldquo;not known&rdquo;, which is not a
                &ldquo;no&rdquo;. No tally of either is kept: a handful of
                matches cannot tell a read apart from luck.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">sorting the finished tail</dt>
              <dd className="mt-1">
                The tail sorts on its own keys — kickoff (most recent first,
                its default), the Stage-1 gaps, the overall tier gap, either
                verdict, the shot share at full time or at 20&apos;, and
                captured-before-reconstructed — with the same direction flip
                and the same rule: a row with no value under the active key
                sorts after every row that has one, in both directions, and
                the tail names which absence it is. It is independent of the
                column above it, and remembered separately.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">sorting a column</dt>
              <dd className="mt-1">
                Each column sorts on its own: kickoff, the three Stage-1 gaps
                (by size), the three tier gaps (signed — level and behind sort
                below ahead), or the book&apos;s ask, spread and depth, each
                with a direction flip. Sorting is presentation — it reorders
                the rows a column was served and never hides one. Under the
                three book keys a row with no quote sorts after every priced
                row, in both directions, and the column says so. The choice is
                remembered per league on this device.
              </dd>
            </div>
          </dl>
        </Collapse>

        <footer className="mt-16 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
          Research surface. The picker ranks and annotates; it sets no
          threshold, and neither does this page. Not betting advice.
        </footer>
      </main>
    </div>
  );
}

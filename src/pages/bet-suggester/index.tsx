// The picker board — namson.dev/bet-suggester
//
// The landing surface: every upcoming fixture across the four in-season
// leagues, one COLUMN per league (MLS · EPL · La Liga · Liga MX), plus a
// column for any tournament the payload carries (the Leagues Cup), each
// column independently sortable. Reads GET /api/picker/board, which
// serves src/picker.
//
// A CUP COLUMN IS NOT A LEAGUE COLUMN. The Leagues Cup has no table of
// its own, so its clubs are rated on their domestic leagues and a fixture
// between the two leagues shows TIERS ONLY, with the Stage-1 gaps
// withheld and the reason on the card. Columns are payload-driven: the
// four leagues are always drawn, and any other slug the board serves is
// appended rather than dropped.
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
//  2. WHICH SEASON IS A NUMBER, not a footnote and no longer a binary.
//     Each club is a weighted average of this season and last, by its own
//     games played (w = GP/(GP+10)), so every row carries its own share
//     — "38% this szn" — and the early leagues get a banner saying last
//     season still carries them.
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
import { TZ, dayLabel, localDay } from "../../lib/matchday";
import {
  Board, CUP_COMP_KEY, SEASON_BLEND_K, THIN_ASK_SIZE, WIDE_SPREAD_C,
  boardColumns, fetchBoard, leagueLabel,
} from "../../lib/pickerApi";
import {
  DEFAULT_BACK, REVIEW_WINDOWS, Review, fetchReview,
} from "../../lib/pickerReview";
import {
  COLUMN_DEFAULT_SORT, ColumnSort, DEFAULT_SORT, SORT_MODES, columnSort,
  isDefaultSort, loadBoardSort, modeById, nullNoteFor, orderPhrase,
  saveBoardSort,
} from "../../lib/pickerSort";
import { Eyebrow } from "../../components/ui";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import { CompRail } from "../../components/CompRail";
import LiveSection from "../../components/LiveCard";
import { LeagueColumn } from "../../components/PickerColumn";
import {
  WatchDeclarationProvider, WatchPanel,
} from "../../components/WatchDeclaration";
import WatchedStrip from "../../components/WatchedStrip";
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

/** THE BOARD, OPTIONALLY NARROWED TO ONE COLUMN.
 *
 *  `/bet-suggester` renders every column. `/bet-suggester/ucl` renders
 *  the SAME COMPONENT with `only={["ucl"]}` — not a copy of it, which is
 *  the whole point: the operator asked for "the exact layout of the
 *  landing page, for UCL only", and a second page that merely resembled
 *  this one would start resembling it less on the first change made to
 *  either. Everything below — the day bands, the sort control, the rank
 *  dumbbells, the refusal blocks, the live strip — is reached by both
 *  routes because it is literally the same code.
 *
 *  `only` names the COLUMN SET. The payload is the same board payload;
 *  rows outside the named columns simply have no column to sit in.
 *
 *  AND EVERY REGION THAT DESCRIBES THE BOARD IS NARROWED WITH IT
 *  (2026-09-08). It used to narrow the columns and nothing else, which
 *  left two regions above them still speaking for the whole board: the
 *  live strip drew every match under way anywhere, and the season
 *  banner counted leagues that have no column here — "1 OF 4 LEAGUES ·
 *  Liga MX 6 GP" on a board with no Liga MX in it. A frame that
 *  describes something the page does not show is the same defect as a
 *  number that describes a payload the page did not read. Both are
 *  derived from `columnSlugs`, never from a slug, so the next narrowed
 *  board is right without an edit here. */
export default function PickerBoard({ only, pageTitle, backTo }: {
  only?: readonly string[];
  pageTitle?: string;
  backTo?: { href: string; label: string };
} = {}) {
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
  // SORT LIVES ON THE MATCHDAY (2026-09-01, draft C shipped): one board
  // default, remembered on this device, plus per-day overrides that are
  // session-only — a remembered "Saturday" override would silently
  // apply to a different Saturday next week. Changing the default
  // clears every override, so the board never mixes stale intentions.
  const [boardSort, setBoardSort] = useState<ColumnSort>(() => loadBoardSort());
  const [daySorts, setDaySorts] = useState<Record<string, ColumnSort>>({});
  const applyBoardSort = (next: ColumnSort) => {
    setBoardSort(next);
    saveBoardSort(next);
    setDaySorts({});
  };
  const applyDaySort = (day: string, next: ColumnSort) =>
    setDaySorts((prev) => ({ ...prev, [day]: next }));
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
  // WHICH COLUMN a row is drawn in, as opposed to which competition it
  // IS. They differ only for a cup fixture whose two clubs share a
  // league: that league's table describes it completely, so it belongs
  // in that league's column with the competition named on the card
  // rather than in a column of its own (backend 2026-09-01). `?? league`
  // keeps an older payload rendering exactly as it did.
  const colOf = (r: { column?: string; league: string }) => r.column ?? r.league;

  // MATCHDAY BANDS (operator, 2026-09-01): the board is day-major. One
  // ordered union of day keys, computed here so every column lays its
  // groups on the SAME subgrid tracks — that is what aligns a date's
  // fixtures across all four leagues.
  //
  // REFUSED FIXTURES ARE FIXTURES (operator, 2026-09-07). They used to be
  // swept into a block at the column's foot, which put a match kicking
  // off on Tuesday below one that finished last week. A refusal is a
  // fixture we declined to RANK — it is still played, at a known time —
  // so its day belongs in this union or its card has no band to sit in.
  // A refusal with no kickoff still cannot be placed, and says so where
  // the column draws it, rather than being dropped here.
  const dated: { kickoff: string }[] = [
    ...rows,
    ...refusals.filter((r): r is typeof r & { kickoff: string } =>
      Boolean(r.kickoff)),
  ];
  const dayKeys = [...new Set(dated.map((r) => localDay(r.kickoff)))]
    .filter(Boolean).sort();
  const dayLabelFor: Record<string, string> = {};
  for (const r of dated) {
    const k = localDay(r.kickoff);
    if (k && !dayLabelFor[k]) dayLabelFor[k] = dayLabel(r.kickoff);
  }
  const sortFor = (k: string): ColumnSort => daySorts[k] ?? boardSort;
  const boardMode = modeById(boardSort.mode) ?? modeById(DEFAULT_SORT.mode)!;
  const boardNullNote = nullNoteFor(boardMode, rows);

  /* ── THE COLUMN SET IS THE BOARD'S DECLARATION (operator,
     2026-09-09) ──────────────────────────────────────────────────────

     ONE INPUT: `board.leagues`, which is the backend's
     `tables.BOARD_COLUMNS` — a hand-written list the operator edits,
     and the only way a competition joins or leaves his board. The
     ordering lives in `boardColumns`; the MEMBERSHIP is not ours.

     WHAT THIS REPLACED, and why it had to go. The set used to be four
     hard-coded leagues UNIONED with six more sources — the payload's
     `leagues`, every row's column, every refusal's column, the review
     payload's `leagues`, every finished row and every finished refusal.
     Seven doors into one set. The day the backend took the finished
     Leagues Cup off the board, the last three walked it straight back
     on: no upcoming rows, no league entry, a column anyway, drawn off
     its own finished matches. "REMOVE IT FROM THE BOARD" had been
     answered by the backend and overruled here.

     A LEAGUE WITH NOTHING AHEAD STILL KEEPS ITS COLUMN, which was the
     good reason those doors were opened and is not lost by closing
     them: `BOARD_COLUMNS` declares MLS whether or not MLS has a fixture
     this week, so a quiet league is a declared column with an empty
     forward half and its finished tail underneath — exactly as before.
     What can no longer happen is a column for a competition the board
     never declared at all.

     AND `PICKER_COLUMN_ORDER` CANNOT ADD ONE EITHER. It is intersected
     with the declaration inside `boardColumns`, so a slug it names and
     the board does not is simply not drawn. It orders; it never
     admits. */
  const declaredColumns = board ? Object.keys(leaguesMap) : [];
  /* NARROWED, NOT FILTERED DOWNSTREAM. A single-column route keeps the
     column it names even when the payload declares nothing for it —
     rendering nothing at all would read as broken, and `undeclared`
     below says what actually happened instead of letting the column's
     own empty state claim a fixture count nobody measured. */
  const columnSlugs = only ? [...only] : boardColumns(declaredColumns);
  /* A NARROWED BOARD ASKING FOR A COLUMN THE BOARD NO LONGER DECLARES.
     Not hypothetical: /bet-suggester/ucl is this page with
     `only={["ucl"]}`, and the Champions League left `BOARD_COLUMNS` on
     2026-09-09. Named here so the page can SAY the board carries no
     column for it — "0 fixtures" over a competition playing eighteen
     matches this week is the reading this tree exists to refuse.
     Empty while the board is still loading or after it failed: nothing
     is undeclared by a payload that never landed. */
  const undeclared = board && only
    ? only.filter((s) => !declaredColumns.includes(s))
    : [];
  /* THE COLUMN SET, WHEN IT IS NARROWER THAN THE BOARD. On the full
     board `columnSlugs` already holds every slug the payload serves, so
     there is nothing for a region above the columns to be narrower
     than; `only` is the one signal that says otherwise, and it is a SET
     rather than a slug so the next narrowed board inherits this for
     free. */
  const narrowedTo = only ? columnSlugs : null;

  /* THE SEASON BANNER DESCRIBES THIS BOARD'S COLUMNS, NOT THE PAYLOAD'S
     (2026-09-08). It counted every league in `board.leagues` regardless
     of which of them got a column, so /bet-suggester/ucl printed
     "1 OF 4 LEAGUES · Liga MX 6 GP" on a board with no Liga MX column —
     a caveat about numbers that are nowhere on the page. It is derived
     from `columnSlugs` now, which is a no-op on the full board (that
     set IS the keys of `leagues`, since 2026-09-09) and the whole point
     on a narrowed one.
     Cup columns stay excluded from the count for the older reason: a
     knockout has no season table of its own to be rated on, and folding
     it into "N of M leagues" would make that sentence untrue. A board
     narrowed to a cup therefore has NO league column to caveat, and the
     banner is correctly absent rather than borrowed from elsewhere. */
  const leagues = Object.entries(leaguesMap).filter(
    ([slug, m]) => m.kind !== "cup" && columnSlugs.includes(slug));
  const priorLeagues = leagues.filter(([, m]) => m.src === "prior");

  /* WHAT THE PAGE SAYS IT RANKS BY MUST BE WHAT IT RANKS BY.
     The board's framing names the TABLE GAP, and on the four league
     columns that is exactly right. A single-column board whose column
     ranks on shape — the Champions League, where nearly every tie pairs
     two different domestic tables and the gap between them is withheld
     by construction — would be printing the one number it refuses.
     Derived from the same rule the column's own chip uses, so the two
     can never disagree.
     THE DEFAULT BOARD'S WORDING IS UNTOUCHED: its five phrases are a
     decision-safety invariant pinned by e2e/picker-prose.spec.ts. Only
     the ranking-key clause differs here; the three sentences saying no
     model runs, nothing is a recommendation, and you are the one who
     picks are carried verbatim in both. */
  /* ONE COLUMN IS A DIFFERENT LAYOUT PROBLEM, NOT A NARROWER ONE
     (operator, 2026-09-08). Four columns get their density from sitting
     side by side; a board narrowed to one was drawing a single tall
     stack of 1,400px-wide cards — ~18 fixtures in a Champions League
     matchday, each one a screen of its own holding 200px of ink. So the
     sole column lays each matchday's matches ACROSS the band instead,
     up to six abreast (components/PickerColumn.tsx, DENSE_GRID).

     DERIVED FROM THE SAME `soleColumn` THE FRAMING AND THE RANKING KEY
     ALREADY USE, deliberately, rather than from `slug === "ucl"`: the
     Champions League is only the first board narrowed this way, the
     next one gets it without an edit here, and a multi-league board
     cannot acquire it by accident. */
  const soleColumn = columnSlugs.length === 1 ? columnSlugs[0] : null;
  const soleOwnSort = soleColumn ? COLUMN_DEFAULT_SORT[soleColumn] : undefined;

  /* WHAT THE BOARD IS ACTUALLY ORDERED BY — asked of the columns it is
     drawing, not of how many there are.

     THE HEADING BELOW USED TO BE KEYED ON `soleOwnSort` (2026-09-09), so
     it could not see the sort control at all: picking any mode left it
     reading "|GD/g gap| descending within each day". That was wrong twice
     over. `DEFAULT_SORT` is `kickoff asc` and |GD/g gap| is only the
     TIEBREAK in `defaultOrder`, so the line named the tiebreak as though
     it were the ordering — on the four league columns as much as on the
     Champions League one, which runs `shape` and has no GD/g gap to sort
     on in the first place.

     `columnSort` is THE authority on what a column runs, and it is the
     same call the columns themselves make, so this cannot drift from
     them: a column whose key changes changes this sentence with it. */
  const runningSorts = columnSlugs.map((sl) => columnSort(sl, boardSort));
  const oneRunningSort =
    runningSorts.length > 0
    && runningSorts.every((x) => x.mode === runningSorts[0].mode
                              && x.dir === runningSorts[0].dir)
      ? runningSorts[0]
      : null;

  if (deepLink !== null) {
    return (
      <div className="min-h-screen bg-bs font-sans text-ink-mid">
        <Head><title>{pageTitle ?? "Picker board"} · namson.dev</title></Head>
        <RouteProgress />
        <main className="mx-auto max-w-5xl px-5 pt-24">
          <Eyebrow>opening the league carousel…</Eyebrow>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>{pageTitle ?? "Picker board"} · namson.dev</title></Head>
      <RouteProgress />
      <TopBar left={backTo ? undefined : <ArchiveMenu />} back={backTo}
        title={pageTitle ? pageTitle.toLowerCase() : "picker board"}>
        <NavChip href="/bet-suggester/leagues" active={false}>Leagues</NavChip>
        <NavChip href="/bet-suggester/friendlies" active={false}>Friendlies</NavChip>
        {/* Live viewer competitions, and — since 2026-09-09 — WHEN each
            of them next plays: the chip glows for a fixture today or
            tomorrow. The rail moved to components/CompRail.tsx because
            it was two identical literals, here and on
            /bet-suggester/leagues, and a glow added to one of them would
            have left the other with a chip that could not.
            THE RAIL IS NOT THE BOARD'S COLUMN SET. The Champions League
            left BOARD_COLUMNS on 2026-09-09 and kept this chip: removing
            a column is not deleting a competition. */}
        <CompRail />
      </TopBar>

      {/* B0c — SELECTING MATCHES TO WATCH. The provider holds the
          operator's token and name (in this tab's memory and nowhere
          else), reads the declared set, and resolves this board's ESPN
          references to live-plane fixture ids in one call so a row can
          say whether it is declared. It renders no chrome of its own:
          the panel is placed by this page, and each row's control by
          components/PickerColumn.tsx. */}
      <WatchDeclarationProvider eventIds={rows.map((r) => r.event_id)}>
      {/* max-w-[96rem], not the app's usual 5xl: four columns of match
          cards need the width, and each column stays a readable ~22rem.
          The intro copy below keeps its own measure (max-w-2xl). */}
      <main className="mx-auto max-w-[96rem] px-5 pb-24 pt-10 sm:pt-12">
        {/* THE HERO IS A COMMAND BAR (2026-09-01). The old masthead spent
            ~40% of the first viewport on a title the operator has read a
            hundred times; the wordmark now sits at reading size in the
            board's display voice, with a floodlight wash behind it and
            the four league lights beside it. The H1 keeps its accessible
            name and the mission line keeps its words — both are pinned
            surfaces — they just stop costing a scroll. */}
        <div className="relative">
          <div aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-16 h-44 bg-[radial-gradient(ellipse_45%_90%_at_18%_0%,rgba(220,235,255,0.05),transparent_72%)]" />
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <Eyebrow tone="accent">picker · stage 1 + stage 2</Eyebrow>
            <span aria-hidden className="flex items-center gap-1.5">
              {(["mls", "epl", "laliga", "ligamx"] as const).map((s2) => (
                <i key={s2} className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `var(--lg-${s2})` }} />
              ))}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold uppercase tracking-[0.02em] text-ink-hi [font-family:var(--font-archivo)] [font-stretch:115%] sm:text-3xl">
            Every fixture, ranked
          </h1>
          {/* THE ONE HONEST LINE OF FRAMING. Not "bet these".
              2026-09-06, PROSE CUT: the opening inventory — "every
              upcoming fixture in the four in-season leagues and the
              Leagues Cup" — went. The H1, the four league lights beside
              it and the four columns below already say it, and it was a
              sentence of scene-setting standing between the reader and
              the board. Everything that survived is either the ranking
              key (what the big number on each card MEANS) or a
              decision-safety invariant, and none of it is negotiable:
              e2e/picker.spec.ts pins all four phrases. */}
          <p data-testid="board-framing"
            className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-low">
            {soleOwnSort
              ? `Ranked by ${soleOwnSort.mode} — nearly every tie here pairs two different domestic tables, and the gap between them is withheld.`
              : "Ranked by how far apart the two clubs sit in their own league's table."}
            {" "}No model runs on this page, no number below
            is a probability or an edge of ours, and nothing here is a
            recommendation — the ranking says where to look, and you are the
            one who picks.
          </p>
        </div>

        {/* ------------------------- controls ------------------------- */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-wide">
          <label htmlFor="board-sort" className="mr-1 text-ink-faint">sort</label>
          <select id="board-sort" data-testid="col-sort"
            value={boardSort.mode}
            onChange={(e) => {
              const m = modeById(e.target.value) ?? modeById(DEFAULT_SORT.mode)!;
              applyBoardSort({ mode: m.id, dir: m.defaultDir });
            }}
            className="rounded-md border border-line bg-bs px-1.5 py-1 uppercase text-ink-mid outline-none transition-colors hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent">
            {SORT_MODES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <button data-testid="col-dir" data-dir={boardSort.dir}
            onClick={() => applyBoardSort({ ...boardSort,
              dir: boardSort.dir === "asc" ? "desc" : "asc" })}
            aria-label={`sort direction ${boardSort.dir === "asc" ? "ascending" : "descending"} — press to flip`}
            className="rounded-md border border-line px-2 py-1 text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
            {boardSort.dir === "asc" ? "↑ asc" : "↓ desc"}
          </button>
          {!isDefaultSort(boardSort) && (
            <button data-testid="col-reset"
              onClick={() => applyBoardSort(DEFAULT_SORT)}
              title="back to the board's default order — |GD/g gap| descending"
              className="rounded-md border border-line px-2 py-1 text-ink-faint transition-colors hover:border-line-strong hover:text-ink-mid">
              reset
            </button>
          )}
          {boardNullNote && (
            <span data-testid="col-null-note" className="text-ink-faint normal-case tracking-normal">
              {boardNullNote}
            </span>
          )}
          <span className="ml-3 mr-1 text-ink-faint">window</span>
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
        {/* 2026-09-06, PROSE CUT. This was two lines of mechanics above
            the board. What SURVIVES is the pair of facts a reader needs
            in order to read the numbers beside them — which zone the
            kickoffs are in, and that “built” is the board's assembly
            instant rather than this request's. WHY the zone is fixed and
            what the cache does are explanations of machinery, and they
            moved into the legend disclosure at the foot of the page
            under "times · caching", where a reader who wants them can
            open them. No assertion pinned either sentence. */}
        <p data-testid="board-times"
          className="mt-2 font-mono text-[10px] tracking-wide text-ink-faint">
          kickoffs in {TZ} · cached 90s · “built” is when the board was
          assembled, not when you asked for it
        </p>

        {/* B0c's operator panel — one closed line until it is wanted.
            It sits directly above the strip because the strip renders
            the matches this panel DECLARES: read the set, declare a
            fixture, or declare every fixture you hold a position on.
            With no token it still renders and says so on its own chip
            — the page tells the truth about what it can and cannot do
            rather than hiding the control. */}
        <WatchPanel />

        {/* ---- the watched strip: the HOLD/EXIT stage, above the columns ----
            docs/HOLD-EXIT-DESIGN.md's surface. It polls its own endpoint
            on its own 15s clock and renders NOTHING when the read came
            back and said there is nothing to draw — absent, not empty —
            so on an ordinary pre-match board this line costs the reader
            nothing. A read that could not HAPPEN is a different fact and
            renders as a refusal with its status: the endpoint is
            operator-gated and, with no proxy in front of it, this
            section spent its whole life invisible in production while
            looking exactly like "nothing is live".

            IT IS MOUNTED INSIDE WatchDeclarationProvider ON PURPOSE, and
            that placement is load-bearing rather than incidental: the
            strip reads the operator token the watch panel already holds
            (useWatchToken, read-only), so declaring a match and reading
            it back take ONE token typed once. Moving this outside the
            provider would silently gate the whole section.

            It is deliberately ABOVE the season banner and the columns: a
            position that is live now outranks a note about which season
            rates a club. */}
        <WatchedStrip />

        {/* --------------- the season-basis banner, not a footnote --------------- */}
        {priorLeagues.length > 0 && (
          <section data-testid="prior-banner"
            className="mt-6 rounded-xl border border-warn/30 bg-warn/5 p-4">
            <Eyebrow tone="warn">
              {priorLeagues.length} of {leagues.length} leagues · rated on last season
            </Eyebrow>
            {/* WHAT STAYS ON ARRIVAL: the leagues and their games
                played, and the one sentence that says what the numbers
                below them are made of. That is the caveat; everything
                else here was the derivation.
                2026-09-06, PROSE CUT: the blend's arithmetic moved into
                the disclosure under it. It is STILL IN THE ACCESSIBLE
                TREE — a native <details>, so its text is in the document
                whether or not it is open — and e2e/picker-blend-cup.spec
                pins it there explicitly now rather than incidentally. */}
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-mid">
              {priorLeagues
                .map(([slug, m]) => `${leagueLabel(slug)} ${m.min_current_gp ?? "?"} GP`)
                .join(" · ")}
              {/* explicit {" "}: JSX ate the leading space of the text node
                  after this expression and shipped "Under 8games played" */}
              . These leagues are still early, so LAST SEASON carries most
              of the rating.
            </p>
            <details data-testid="prior-banner-blend" className="mt-2">
              <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.14em] text-warn/80 transition-colors hover:text-warn">
                <span aria-hidden className="mr-1.5">▸</span>
                how the two seasons are weighed
              </summary>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-mid">
                Nothing switches at a threshold: each club is a weighted
                average of both seasons, by that club&apos;s own games
                played — w = GP / (GP + {SEASON_BLEND_K}), so{" "}
                {SEASON_BLEND_K} games is the point where the two weigh the
                same. Every row prints its own share on the chip beside the
                rank, and rank and tiers are re-derived from the blended
                rates.
              </p>
            </details>
          </section>
        )}

        {/* --------------- the matches under way, in their own frame ---------------
            ABOVE THE RANKED COLUMNS, because a match in play outranks
            every judgement about one that has not kicked off — and in a
            FRAME OF ITS OWN, saying on its own rule that nothing in it
            is ranked. Dropped straight into the column flow it would be
            read as the top of the board, which is the one thing it is
            not.

            IT IS INSIDE WatchDeclarationProvider FOR THE SAME REASON THE
            STRIP IS: the watched-strip read is operator-gated and the
            token is the one the watch panel already holds. Outside the
            provider this section would be silently blank.

            It is handed the board's OWN rows and league meta rather than
            fetching a second copy: the flip's prematch face renders
            PickerColumn.RowRead, the component the ranked columns
            render, and it must be given the very row the column below is
            drawing — a second fetch could hand the two surfaces two
            different reads of one fixture. */}
        <LiveSection rows={rows} leagues={leaguesMap}
          columns={narrowedTo} />

        {/* ---------------------------- the board ---------------------------- */}
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-6">
            <h2 data-testid="board-rank-heading"
              className="text-lg font-medium text-ink-hi">
              {oneRunningSort
                ? `Ranked by ${(modeById(oneRunningSort.mode) ?? boardMode).label}`
                : "Ranked by each column\u2019s own key"}
            </h2>
            <p data-testid="board-order-note"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              {oneRunningSort
                ? `matchday bands \u00b7 ${orderPhrase(oneRunningSort)} within each day \u00b7 no cut-off`
                : `matchday bands \u00b7 ${orderPhrase(boardSort)} within each day, `
                  + "except where a column names its own \u00b7 no cut-off"}
            </p>
          </div>

          {loading ? (
            /* A SHAPE, NOT A COLUMN SET. These blocks are placeholders
               for a payload that has not landed, so their number is a
               layout choice and asserts nothing: it used to be a `.map`
               over the four hard-coded leagues, which read as the board
               naming its columns before it had been told what they are.
               Whatever the board declares replaces them wholesale. */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonRows key={i} rows={3} height="h-40" />
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
              {/* THE BOARD DOES NOT CARRY THIS COMPETITION, SAID OUT
                  LOUD. A page narrowed to a column the board's own
                  `leagues` never declares has no rows to draw and no
                  meta to describe them with — and the column below it
                  would otherwise report "0 fixtures in the next 7 days"
                  over a competition that is playing this week. That is
                  a measured absence claimed off a payload that was
                  never asked the question, which is the one sentence
                  this whole surface is built to refuse.
                  It names the competition's own page rather than
                  leaving the reader at a dead end: leaving the board is
                  not leaving the site. */}
              {undeclared.length > 0 && (
                <div data-testid="board-undeclared"
                  data-slugs={undeclared.join(",")}
                  className="mb-5 rounded-xl border border-line-strong bg-elev p-4">
                  <Eyebrow>not a board column</Eyebrow>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-mid">
                    The picker board carries no column for{" "}
                    {undeclared.map(leagueLabel).join(" · ")}, so it
                    served no ranking for it and nothing below is a count
                    of its fixtures. The competition is still played and
                    still has a page — the board simply does not rank it.
                  </p>
                  <p className="mt-2 flex flex-wrap gap-3">
                    {undeclared.map((s) => CUP_COMP_KEY[s] ? (
                      <a key={s} href={`/bet-suggester/comp/${CUP_COMP_KEY[s]}`}
                        className="rounded-md border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
                        {leagueLabel(s)} fixtures &amp; prices →
                      </a>
                    ) : null)}
                  </p>
                </div>
              )}
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
              {/* The columns are subgrids over shared row tracks: row 1
                  headers, then per matchday a label track + a content
                  track, then refusals, then the finished tails. At xl
                  the date is drawn ONCE per band, full-width, by the
                  label items below (placed by explicit grid-row, so DOM
                  order keeps mobile sane); under xl each column carries
                  its own compact divider instead. */}
              {/* THE TRACK COUNT FOLLOWS THE DATA (2026-09-07). It was
                  typed as `xl:grid-cols-4` while `columnSlugs` is four
                  FIXED leagues plus whatever else the payload names — a
                  Leagues Cup column, a cross-league column, the next
                  competition. The moment a fifth appeared, its explicit
                  `grid-column: 5` landed on an IMPLICIT track, that track
                  sized itself to the full-width band labels, and the four
                  1fr tracks were left with no free space: measured
                  `0px 0px 0px 0px 1304px` at 1440, four columns of zero
                  width with their rows overflowing. `1 / -1` had stopped
                  covering the whole board too, since -1 is the end of the
                  EXPLICIT grid and the fifth column was outside it.
                  This is the same hazard the colIndex prop documents,
                  one layer out: there, auto placement invented implicit
                  columns; here, a typed count did. A count derived from
                  the same list that places the columns cannot disagree
                  with it. */}
              {/* A SOLE COLUMN TAKES THE WHOLE WIDTH AT EVERY BREAKPOINT.
                  `md:grid-cols-2` is how four league columns pair up on a
                  tablet, and it was being applied to a board with ONE
                  column too — which put that column in the left half and
                  left the right half of the page empty from 768 to 1279,
                  the exact widths where the dense grid inside it most
                  needs the room. The explicit xl template already said
                  `repeat(1, 1fr)`, so this only ever misfired below xl. */}
              <div style={{ ["--cols" as string]: String(columnSlugs.length) }}
                className={`grid grid-cols-1 gap-6 xl:gap-y-2 xl:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] ${
                  soleColumn ? "" : "md:grid-cols-2"}`}>
                {columnSlugs.map((slug, ci) => (
                  <LeagueColumn key={slug} slug={slug} days={days}
                    dayKeys={dayKeys} sortFor={sortFor}
                    dayLabels={dayLabelFor} colIndex={ci + 1}
                    dense={Boolean(soleColumn)}
                    meta={leaguesMap[slug]}
                    rows={rows.filter((r) => colOf(r) === slug)}
                    refusals={refusals.filter((r) => colOf(r) === slug)}
                    review={{
                      rows: finished.filter((r) => colOf(r) === slug),
                      refusals: finishedRefusals.filter((r) => colOf(r) === slug),
                      meta: reviewLeagues[slug],
                      back, loading: reviewLoading, error: reviewError,
                      storeNote,
                    }} />
                ))}
                {dayKeys.map((k, i) => i % 2 === 0 ? null : (
                  <div key={`tint-${k}`} aria-hidden
                    style={{ gridRow: `${2 + 2 * i} / span 2`,
                      gridColumn: "1 / -1" }}
                    className="pointer-events-none hidden rounded-xl bg-[rgba(210,225,255,0.015)] xl:block" />
                ))}
                {dayKeys.map((k, i) => {
                  const ds = sortFor(k);
                  const overridden = Boolean(daySorts[k]);
                  return (
                    <div key={k} data-testid="day-band" data-day={k}
                      style={{ gridRow: 2 + 2 * i, gridColumn: "1 / -1" }}
                      className="hidden items-center gap-3 pt-5 xl:flex">
                      <span className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-mid">
                        {dayLabelFor[k] ?? k}
                      </span>
                      <span className="h-px flex-1 bg-line-strong" />
                      {/* THIS DAY's sort — an override on the board
                          default, session-only. The label says which it
                          is, so an overridden band cannot read as the
                          default order. */}
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-faint">
                        {overridden ? "this day" : "sort"}
                      </span>
                      <select data-testid="band-sort" data-day={k}
                        value={ds.mode}
                        onChange={(e) => {
                          const m = modeById(e.target.value)
                            ?? modeById(DEFAULT_SORT.mode)!;
                          applyDaySort(k, { mode: m.id, dir: m.defaultDir });
                        }}
                        className="rounded-md border border-line bg-bs px-1.5 py-0.5 font-mono text-[9.5px] uppercase text-ink-mid outline-none transition-colors hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent">
                        {SORT_MODES.map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                      <button data-testid="band-dir" data-day={k}
                        data-dir={ds.dir}
                        onClick={() => applyDaySort(k, { ...ds,
                          dir: ds.dir === "asc" ? "desc" : "asc" })}
                        aria-label={`sort direction for ${dayLabelFor[k] ?? k}: ${ds.dir === "asc" ? "ascending" : "descending"} — press to flip`}
                        className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[9.5px] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
                        {ds.dir === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  );
                })}
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
          {/* data-testid added 2026-09-06: the season banner now carries
              its own closed disclosure with the same "GP / (GP + 10)"
              sentence in it, so an unscoped page-wide getByText().first()
              resolves to that one instead of this definition. The legend
              is addressable now rather than found by document order. */}
          <dl data-testid="legend"
            className="space-y-4 text-sm leading-relaxed text-ink-low">
            {/* Moved here 2026-09-06 from a two-line note above the
                board. The FACTS it carried — the zone, and what "built"
                means — stayed up there beside the numbers they qualify;
                this is the reasoning, which a reader needs once and
                never again. */}
            <div>
              <dt className="text-ink-hi">times · caching</dt>
              <dd className="mt-1">
                Kickoffs render in {TZ} for everyone, whatever the reader&apos;s
                own clock says, so the page is the same page twice and two
                people comparing it are comparing one thing. The board is
                assembled server-side and cached for 90 seconds, which is why
                &ldquo;built&rdquo; can be a little behind the moment you
                asked — it is the assembly instant, not your request&apos;s.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">GD/g gap · ppg gap · rank gap</dt>
              <dd className="mt-1">
                Stage 1, all three signed from the favourite&apos;s side. The
                favourite is whichever club has the better whole-league derived
                rank; conferences and groups are deliberately ignored. The
                board is grouped by MATCHDAY first — one date&apos;s fixtures
                align across all four leagues — and each column opens ordered
                by the absolute GD/g gap within each day, by nothing else.
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
              <dt className="text-ink-hi">38% this szn</dt>
              <dd className="mt-1">
                How much of that fixture&apos;s rating comes from THIS season.
                Each club is a weighted average of this season and last, by
                its own games played: w = GP / (GP + {SEASON_BLEND_K}). The
                chip shows the fixture&apos;s lower side, because a match is
                only as current-season as its less-played club; hover for
                both. Amber below half — last season still carries the read.
                A club with no last-season row at all is refused until it has
                played {SEASON_BLEND_K} games, then rated on this season
                alone at 100%. Rank and tiers are re-derived from the blended
                rates; tiers are never themselves averaged, because the mean
                of two league positions is not a position.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">n/a · cross-league</dt>
              <dd className="mt-1">
                The Leagues Cup has no table of its own, so each club is
                rated on its own domestic league&apos;s. When the two clubs
                come from DIFFERENT leagues, the ppg, GD/g and rank gaps are
                withheld — 2.0 ppg in MLS is not 2.0 ppg in Liga MX, and
                subtracting them would invent a gap nobody measured. The
                tiers stay, because a within-league quintile means the same
                thing in both. Such a row is never sorted ahead of one with a
                real gap, and it is never removed.
              </dd>
            </div>
            <div>
              <dt className="text-ink-hi">regulation time</dt>
              <dd className="mt-1">
                The Leagues Cup market settles on 90 minutes plus stoppage,
                not on the tie: a level match resolves the TIE leg rather
                than going to penalties. So a price there is the price of
                leading at full time, not of going through — the four league
                markets settle their matches outright, and the two must not
                be read alike.
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
              <dt className="text-ink-hi">sorting the board · sorting a day</dt>
              <dd className="mt-1">
                One sort for the whole board — kickoff, the three Stage-1
                gaps (by size), the three tier gaps (signed — level and
                behind sort below ahead), the shape (CLEAN before SPLIT
                before HOLLOW), or the book&apos;s ask, spread and depth —
                each with a direction flip, ranking WITHIN each matchday.
                Any single day can override it from its own band header;
                overrides last for this visit only, because a remembered
                &ldquo;Saturday&rdquo; would silently apply to a different
                Saturday next week, and changing the board default clears
                them. Sorting is presentation — it reorders the rows a band
                was served and never hides one; under the three book keys a
                row with no quote sorts after every priced row, in both
                directions, and the board says so. The default is remembered
                on this device.
              </dd>
            </div>
          </dl>
        </Collapse>

        <footer className="mt-16 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
          Research surface. The picker ranks and annotates; it sets no
          threshold, and neither does this page. Not betting advice.
        </footer>
      </main>
      </WatchDeclarationProvider>
    </div>
  );
}

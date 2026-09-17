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
//     (`pickerReview.DEFAULT_BACK`, DERIVED from the forward window so a
//     league column tells one continuous story — it had its own control
//     until 2026-09-15 and its own copy of the number until 2026-09-16,
//     and the copy's comment said 7 while both windows held 8), and the
//     STORE NOTE — when no
//     snapshot store is configured, nothing is being frozen anywhere and
//     every read in every tail is a reconstruction. That is a property of
//     the deployment, not a coincidence, and it belongs at the top of the
//     page rather than being inferred card by card.
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from "react";

/** `useLayoutEffect` DOES NOTHING ON THE SERVER, and React says so in a
 *  warning every time a server-rendered component calls one. This page is
 *  server-rendered and the one effect that wants it is about the
 *  browser's next paint — so on the server there is nothing to schedule
 *  and the passive hook is the honest stand-in. Chosen once, at module
 *  scope, so the hook order never changes between renders. */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
import { FieldRead, fetchRatings } from "../../lib/fieldApi";
import { TZ, dayLabel, localDay } from "../../lib/matchday";
import {
  Board, CUP_COMP_KEY, DEFAULT_DAYS, SEASON_BLEND_K, THIN_ASK_SIZE,
  WIDE_SPREAD_C, askHonoured, boardColumns, columnsOf, declarationOf,
  fetchBoard, leagueLabel,
} from "../../lib/pickerApi";
import {
  DEFAULT_BACK, Review, fetchReview, readHere, reviewAskHonoured,
} from "../../lib/pickerReview";
import {
  COLUMN_DEFAULT_SORT, ColumnSort, DEFAULT_SORT, SORT_MODES, columnSort,
  loadBoardSort, modeById, nullNoteFor, orderPhrase,
} from "../../lib/pickerSort";
import { failureSentence, readFailure } from "../../lib/providerFailure";
import { Eyebrow } from "../../components/ui";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import { CompRail } from "../../components/CompRail";
import LiveSection from "../../components/LiveCard";
import { LeagueColumn, NotesPanel } from "../../components/PickerColumn";
import {
  LeagueRibbon, VIEW, VIEW_NARROW, useBoardLoop,
} from "../../components/LeagueRibbon";
import { LeagueTabs, useLeagueSwipe } from "../../components/LeagueTabs";
import { useBoardShape } from "../../lib/viewport";
import {
  WatchDeclarationProvider, WatchPanel,
} from "../../components/WatchDeclaration";
import {
  Collapse, NavChip, RouteProgress, SkeletonRows, TopBar,
} from "../../components/chrome";

// THE FORWARD WINDOW MOVED TO src/lib/pickerApi.ts ON 2026-09-16, and
// `pickerReview.DEFAULT_BACK` is now derived from it rather than being a
// second literal that agreed by hand. It was a private constant of this
// page, so the tail's window could only "match" it by copying the number
// — and the copy's comment had already gone false, reading "7 is the
// default because it MATCHES THE BOARD'S FORWARD WINDOW" above an 8. A
// page may import from a lib and a lib may not import from a page, which
// is why the number went down rather than the other one coming up.
// Everything the constant means is written beside it there.

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
  /* WHICH SHAPE THE BOARD IS IN — phone, tablet, desktop — read from
     the same `--breakpoint-*` values Tailwind compiles `md:` and `xl:`
     from (lib/viewport.ts). Three shapes because the board genuinely has
     three: ONE league at a time on a phone, TWO columns on a tablet,
     FOUR on a desktop. Answers "desktop" on the server and for the first
     hydration pass, and the real answer lands in a LAYOUT effect, before
     paint — so a phone never shows a frame of the desktop board. In
     practice it has settled long before any column exists, because the
     board arrives on a client fetch and the server renders skeletons. */
  const shape = useBoardShape();
  const phone = shape === "phone";
  const days = DEFAULT_DAYS;
  /* HOW MANY COLUMNS ARE ON SCREEN AT ONCE — `VIEW`, in
     components/LeagueRibbon.tsx beside the loop that is built on it.
     Four is measured, not chosen: the board's track is `max-w-[96rem]`,
     so a card stops growing at 1536px and a wider monitor renders the
     identical one — 4 columns give 356px and an intact club name, 5 give
     280px, 6 give 20px of name, 7 give ZERO.

     WHICH FOUR IS A SCROLL POSITION, NOT A RENDER DECISION (2026-09-15).
     Every declared column is on the track; the track is a real
     `overflow-x` scroller whose ends are removed by rotating the columns
     and rebasing `scrollLeft` by exactly one column. There is no
     `windowStart` any more, and nothing here re-renders when the board
     moves — see `useBoardLoop`. */
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  /* ── THE HEADER RAIL (operator, 2026-09-15: "make the league header
     still going with me when I go down. It need to go too right under
     the pills") ──────────────────────────────────────────────────────

     `railRef` is the rail's inner grid — the thing the loop seats and
     slides; `railOn` says whether to build it at all, and `headSlots`
     maps a column's slug to the element its header is drawn into. See
     the rail's own note further down for why any of this is needed. */
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railOn, setRailOn] = useState(false);
  const [headSlots, setHeadSlots] = useState<Record<string, HTMLElement>>({});
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  // The finished tail rides on its OWN state, its own request and its own
  // window. A dead review must not blank the board, and a slow one must
  // not hold the board's first paint. The window itself is a constant
  // rather than state: its chips came off with the forward board's on
  // 2026-09-15 and nothing on the page can ask for another length.
  const back = DEFAULT_BACK;
  /* And so does the cross-league field, per column that has one. Keyed
     by COLUMN SLUG rather than held as one object, because a board can
     draw two cups at once and each has its own field, its own request
     and its own way of failing. */
  const [fields, setFields] = useState<Record<string, FieldRead>>({});
  // SORT LIVES ON THE MATCHDAY (2026-09-01, draft C shipped): one board
  // default beneath per-day overrides that are session-only — a
  // remembered "Saturday" override would silently apply to a different
  // Saturday next week.
  // THE DEFAULT IS NO LONGER CHOSEN, NOR REMEMBERED (operator,
  // 2026-09-15). The board-level control is gone, so nothing can set
  // this; it is still held as state because `loadBoardSort` must run
  // ONCE, and what it does is clear the key that control persisted and
  // answer `DEFAULT_SORT`. It is READ on every render — `sortFor` falls
  // back to it for any day carrying no override, and `columnSort` is
  // handed it to decide whether a column may run its own key — so this
  // is a live value, not a leftover.
  const [boardSort] = useState<ColumnSort>(() => loadBoardSort());
  const [daySorts, setDaySorts] = useState<Record<string, ColumnSort>>({});
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

  /* A NARROWED ROUTE ASKS FOR ITS COLUMNS BY NAME (backend fc9bc55,
     2026-09-09). `/bet-suggester/ucl` used to render whatever the
     DECLARED board happened to hold and filter it down to one slug —
     which worked exactly as long as the Champions League WAS a declared
     column, and drew an empty page the day it stopped being one.
     `?leagues=ucl` is the door the backend opened for precisely that:
     `OFF_BOARD_BY_DECISION` says of each competition it holds that the
     spec stays and the board still builds it "for anyone who asks for
     it by name".

     THE LANDING PAGE PASSES NOTHING HERE, and that is what keeps the
     Champions League off it: `only` is undefined on `/bet-suggester`,
     so the request URL, the backend's cache key and the payload are all
     the strings they have always been, and the answer carries no
     `narrowed_to` to be mistaken for a declaration.

     Joined to a stable string so the callback's identity — and with it
     the fetch — does not change on every render. */
  const ask = only ? [...only].join(",") : "";
  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const b = await fetchBoard(days, signal,
                                 ask === "" ? undefined : ask.split(","));
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
  }, [days, ask]);

  useEffect(() => {
    if (deepLink !== null) return;        // redirecting; do not fetch
    const ac = new AbortController();
    // async, not called sync in the effect body, so every setState inside
    // load() lands in a callback rather than cascading a render
    const t = setTimeout(() => { void load(ac.signal); }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, [load, nonce, deepLink]);

  /* THE FINISHED TAIL ASKS THE SAME QUESTION THE BOARD ABOVE IT DOES
     (2026-09-10). It used to ask none: `fetchReview(back)` fetched the
     DECLARED sweep on every route, so `/bet-suggester/ucl` drew its
     upper half from `?leagues=ucl` and its finished tail from four
     other competitions' matches. On the night six Champions League
     ties finished, that endpoint served 54 finished fixtures — 28 MLS,
     11 La Liga, 10 Premier League, 5 Liga MX — and not one of them was
     a fixture this page is about.

     `ask` is the SAME string the board fetch uses, so the two halves of
     a narrowed page cannot come to be about different competitions;
     and the landing page passes nothing here for the same reason it
     passes nothing there. */
  const loadReview = useCallback(async (signal: AbortSignal) => {
    setReviewLoading(true);
    try {
      const r = await fetchReview(back, signal,
                                  ask === "" ? undefined : ask.split(","));
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
  }, [back, ask]);

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
  /* THE WHOLE-BOARD FAILURE, SCREENED. `restructure.spec.ts` already
     keeps the browser's raw vocabulary off this box ("a dead network
     renders a sentence, not the browser's raw string"); the backend's
     `detail` was the half of the same rule nobody was holding. */
  const boardFailure = readFailure(error);
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
  //
  // AND A ROW CAN BE IN MORE THAN ONE (backend #136, 2026-09-14). The
  // Campeones Cup is `tables.FOLDED_INTO_COLUMNS` — rows and no column
  // of its own — and Inter Miami v Cruz Azul belongs in the MLS column
  // AND the Liga MX column, because neither league's table describes a
  // cross-league tie and both clubs' readers want it. `columns` is the
  // whole set and `column` is its FIRST entry, so a singular reader
  // shows such a row in ONE column and silently drops it from the other.
  // `columnsOf` is that reader made plural, and it lives in pickerApi
  // beside the type so the card in the column and the filter that put it
  // there cannot disagree.
  //
  // THE COLUMN SET IS UNTOUCHED — it is `Object.keys(board.leagues)`
  // below, the operator's own declaration, and `campeones` is not one of
  // its keys. A row naming a column nobody draws is drawn nowhere, which
  // is the same thing an unknown `column` has always done.

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
  // THE BANDS ARE BUILT FROM THE DRAWN COLUMNS, further down this
  // function — `drawnSlugs` does not exist yet here, and the union has
  // to be taken over the four leagues on screen rather than all eight.
  // See "MATCHDAY BANDS FOLLOW THE WINDOW" below.
  const sortFor = (k: string): ColumnSort => daySorts[k] ?? boardSort;
  const boardMode = modeById(boardSort.mode) ?? modeById(DEFAULT_SORT.mode)!;


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
  /* AND A NARROWED PAYLOAD IS NOT A DECLARATION AT ALL. `declarationOf`
     returns null for one, which is neither "these are the columns" nor
     "there are no columns" — it is "this payload was never asked". Since
     2026-09-09 the two are trivially confusable: ask the board for the
     Champions League by name and `leagues` comes back holding exactly
     the slug you asked about, in the same shape the declaration has. */
  const declaration = board ? declarationOf(board) : null;
  const declaredColumns = declaration ?? [];
  /* NARROWED, NOT FILTERED DOWNSTREAM. A single-column route keeps the
     column it names even when the payload declares nothing for it —
     rendering nothing at all would read as broken, and the blocks below
     say what actually happened instead of letting the column's own empty
     state claim a fixture count nobody measured. */
  const columnSlugs = only ? [...only] : boardColumns(declaredColumns);

  /* ── WHICH LEAGUE THE PHONE IS LOOKING AT (operator, 2026-09-16) ────

     A board column is 356px and an iPhone 15 Pro is 393px, so exactly
     one column is ever visible on a phone — and the board drew all eight
     anyway, stacked, 27,000px of page with a control whose every name
     was clipped to a sliver. The operator's choice of the two drafts:
     one league at a time, chosen from a swipeable tab strip.

     SELECTION, NOT A DECLARATION. `columnSlugs` is untouched — it is
     still the operator's whole declared set, it is still what the strip
     offers, what the fields are fetched for and what the narrowed-board
     copy names. What narrows is `drawnSlugs`, which is the only thing
     this decides. Nothing here can add a competition, and nothing here
     can remove one from the board's own account of itself.

     HELD LOOSELY: the raw value is a league the reader pressed, and the
     board can be rebuilt under it — a competition can leave the
     declaration between two payloads. So it is resolved against the
     live set on every render rather than corrected in an effect, which
     would render one frame of a column that is not there. */
  const [pickedRaw, setPicked] = useState<string | null>(null);
  /** Has the reader opened the framing disclosure? Phone-only in effect
   *  — at every other width the paragraph is open regardless. */
  const [introOpen, setIntroOpen] = useState(false);
  const picked = pickedRaw && columnSlugs.includes(pickedRaw)
    ? pickedRaw : (columnSlugs[0] ?? null);
  /* DID THE BOARD ANSWER THE QUESTION THIS ROUTE ASKED IT? null while
     nothing has landed — an unanswered ask and an unmade one are not the
     same fact, and only a payload can tell them apart. */
  const answered = board && only ? askHonoured(board, only) : null;
  /* A NARROWED BOARD WHOSE ASK WENT UNANSWERED, over a competition the
     board does not declare. Not hypothetical twice over: the Champions
     League left `BOARD_COLUMNS` on 2026-09-09, and a backend deployed
     before fc9bc55 ignores `?leagues=` and answers with its DECLARED
     board — four columns of other people's fixtures and none of these.
     Named here so the page can SAY the board served no ranking for it:
     "0 fixtures" over a competition playing eighteen matches this week
     is the reading this tree exists to refuse.
     Empty while the board is still loading or after it failed: nothing
     is undeclared by a payload that never landed. */
  const undeclared = board && only && answered === false
    ? only.filter((s) => !declaredColumns.includes(s))
    : [];

  /* WHAT LEFT THE BOARD, AND THE REASONS IT LEFT, DERIVED ONCE.
     `off_board` is optional on the type because a board built before
     2026-09-10 has no such key — and a page that turned a missing field
     into "nothing left the board" would be asserting a measurement off
     a payload that was never asked. Absent stays absent: the strip is
     drawn only when there is something in it to draw. */
  const offBoard = board?.off_board ?? [];
  /* ONE SENTENCE PER CODE, IN THE BACKEND'S OWN WORDS. Two ties that
     kicked off share a reason; printing it against each row would read
     as two separate findings about two separate matches. */
  /* Keyed by the SENTENCE and carrying the code that emitted it, so the
     panel's heading names the departure its paragraph is about. Two
     codes that happen to share a sentence stay one finding, which is the
     whole point of the dedupe. */
  const offWhy = [...new Map(offBoard
    .filter((o) => o.why)
    .map((o) => [o.why, o] as const)).values()];
  const offCodes = [...new Set(offBoard.map((o) => o.code))].sort();
  /* THE COLUMN SET, WHEN IT IS NARROWER THAN THE BOARD. On the full
     board `columnSlugs` already holds every slug the payload serves, so
     there is nothing for a region above the columns to be narrower
     than; `only` is the one signal that says otherwise, and it is a SET
     rather than a slug so the next narrowed board inherits this for
     free. */
  const narrowedTo = only ? columnSlugs : null;

  /* ── THE FINISHED TAIL'S THREE STATES, DERIVED ONCE ────────────────

     A tail may say "nothing finished in this window" ONLY when the
     sweep actually covered its competition. Three facts, and the page
     must never let one wear another's clothes:

       1. ASKED, AND NONE FINISHED — `readHere` true, no error. A
          measurement, and the tail says so.
       2. NEVER ASKED — no key for this competition on the payload.
          NOT zero. This is the failure the whole review surface is
          built against: six Champions League ties finished and the
          card read "No Champions League fixtures finished in the last
          7 days", because the payload had no `ucl` key and the card
          fell through every branch to its empty state.
       3. ASKED AND THE READ FAILED — the whole request (`reviewError`)
          or this competition's own scoreboard (`meta.error`), named in
          the backend's own words.

     `reviewAnswered` is the FOURTH fact that decides which of (2) and
     (3) a missing key means, and it exists because a backend deployed
     behind this frontend does not know `?leagues=`, drops it, and
     answers 200 with its declared sweep. `readHere` alone already
     refuses to draw that as zero — the safe direction, without this —
     but a page that only refuses leaves the reader with an unexplained
     blank, and an unexplained blank is what this surface refuses to
     leave. null while nothing has landed: an unanswered ask and an
     unmade one are not the same fact. */
  const reviewAnswered = review && only
    ? reviewAskHonoured(review, only) : null;

  /* ── THE CROSS-LEAGUE FIELD, PER COLUMN THAT HAS ONE ────────────────

     WHICH COLUMNS HAVE ONE, and why it is not a hard-coded "ucl". The
     field exists to rate the entrants of a competition whose clubs come
     from tables that cannot be compared to each other — so it is asked
     of the columns the board itself calls a CUP, and only of those with
     a page to ask (`CUP_COMP_KEY`). A league column needs none: its own
     table already rates every club in it on one scale, which is the
     whole premise of the four columns.

     A 404 IS AN ANSWER, and it is the right one for a cup nobody has
     measured a field for. It lands in `error`, the column header names
     it, and no card draws a field block — which is a different outcome
     from a card silently omitting one.

     ON ITS OWN STATE AND ITS OWN REQUEST, like the finished tail beside
     it: a dead field must not blank the board, and a slow one must not
     hold the board's first paint. */
  const fieldSlugs = columnSlugs
    .filter((s) => leaguesMap[s]?.kind === "cup" && CUP_COMP_KEY[s]);
  const fieldKey = fieldSlugs.join(",");
  useEffect(() => {
    if (deepLink !== null || fieldKey === "") return;
    const ac = new AbortController();
    const slugs = fieldKey.split(",");
    /* async, not called sync in the effect body, so every setState
       inside lands in a callback rather than cascading a render — the
       same idiom the board's own load already uses two effects up. */
    const t = setTimeout(() => {
      setFields((prev) => {
        const next = { ...prev };
        for (const s of slugs) {
          if (!next[s]) next[s] = { data: null, error: null, loading: true };
        }
        return next;
      });
      for (const slug of slugs) {
        void fetchRatings(CUP_COMP_KEY[slug], ac.signal)
          .then((d) => {
            if (ac.signal.aborted) return;
            setFields((p) => ({ ...p, [slug]: { data: d, error: null,
                                                loading: false } }));
          })
          .catch((e) => {
            if (ac.signal.aborted) return;
            /* NAMED, NEVER SWALLOWED. The one thing this must not do is
               set `data: null, error: null`, which is the shape of "not
               measured" and would draw the same nothing as a competition
               that genuinely has no field. */
            setFields((p) => ({ ...p, [slug]: {
              data: null, loading: false,
              error: e instanceof Error ? e.message : String(e) } }));
          });
      }
    }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, [fieldKey, nonce, deepLink]);

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
     up to four abreast (components/PickerColumn.tsx, DENSE_GRID).

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
  /* THE LOOP IS A NO-OP AT FOUR COLUMNS OR FEWER, which is what keeps
     every narrowed page (`/bet-suggester/ucl`) exactly as it is: nothing
     is built to page through and no ribbon draws. */
  const windowed = columnSlugs.length > VIEW;
  /** HOW MANY COLUMNS THE SCROLLPORT HOLDS AT THIS WIDTH.
   *
   *  Four is the desktop's measured number and has not moved (see
   *  components/LeagueRibbon.tsx). Two is the tablet's, and it is the
   *  SAME ARITHMETIC run at a narrower viewport: `md:grid-cols-2` already
   *  put two columns side by side from 768 up, so two is the count that
   *  keeps a column exactly the width it is today — 352px at 768, 480 at
   *  1024 — while the board becomes a scroller instead of a four-deep
   *  stack. One is the phone, where a column is wider than the viewport.
   *
   *  `windowed` deliberately does NOT follow it. It asks whether the
   *  board declares more columns than the WIDEST scrollport can draw,
   *  which is a fact about the declaration rather than about the window
   *  you are holding — so a four-column board and every narrowed page
   *  build no loop, no ribbon and no rail at any width, exactly as
   *  before. Only the eight-column board changes, and only in how many
   *  of the eight are in front of you. */
  const view = phone ? 1 : shape === "tablet" ? VIEW_NARROW : VIEW;
  /* EVERY DECLARED COLUMN IS ON THE TRACK (2026-09-15). It used to draw
     four and mount no others, which is precisely why the board could not
     move: there was nothing beside the four to scroll TO. The track now
     carries the whole declaration and the four in front of you are a
     scroll position. `columnSlugs` is still the operator's declaration
     and this adds nothing to it.

     A PHONE IS THE ONE WIDTH WHERE THAT IS NOT TRUE (2026-09-16), and
     the reason is arithmetic rather than preference: a column is 356px
     and the viewport is 393, so a track carrying eight of them can only
     ever be a 27,000px vertical stack — every column mounted, seven of
     them unreachable without scrolling past the others. The phone draws
     the league the tab strip has selected and mounts nothing else, which
     is where the page height went. THE DECLARATION IS UNCHANGED:
     `columnSlugs` still names every column, the strip still offers every
     one of them, and the fields are still fetched for all of them. */
  const drawnSlugs = phone && picked ? [picked] : columnSlugs;

  /* ── MATCHDAY BANDS COVER THE WHOLE TRACK ─────────────────────────
     RESTATED 2026-09-15, when the board became a scroller. The union was
     briefly taken over the four columns being DRAWN, because a date
     announcing four rest days and nothing else is a promise about a
     column the reader cannot see. With every column on the track that
     premise is gone twice over: there is no undrawn column to exclude,
     and excluding one would be worse than the defect — the columns are
     subgrids over SHARED row tracks, so a day missing from this union
     has no row for its fixtures to sit in and those fixtures would be
     silently dropped from the column that plays them. A date is now a
     promise about a column you can reach by scrolling, and the rail
     sticks to the left of the scrollport so it stays legible while you
     do. `columnsOf` is the same reader the columns use to claim a row,
     so a folded fixture counts for every column it is drawn in. */
  const drawnSet = new Set(drawnSlugs);
  const onBoard = (r: Parameters<typeof columnsOf>[0]) =>
    columnsOf(r).some((c) => drawnSet.has(c));
  const dated: { kickoff: string }[] = [
    ...rows.filter(onBoard),
    ...refusals.filter((r): r is typeof r & { kickoff: string } =>
      Boolean(r.kickoff) && onBoard(r)),
  ];
  const dayKeys = [...new Set(dated.map((r) => localDay(r.kickoff)))]
    .filter(Boolean).sort();
  const dayLabelFor: Record<string, string> = {};
  for (const r of dated) {
    const k = localDay(r.kickoff);
    if (k && !dayLabelFor[k]) dayLabelFor[k] = dayLabel(r.kickoff);
  }
  const runningSorts = columnSlugs.map((sl) => columnSort(sl, boardSort));
  /** How many fixtures each declared column holds — the tab strip's
   *  accessible names, off the same `columnsOf` reader the columns
   *  themselves claim a row with, so a folded fixture counts for every
   *  column it is drawn in and the strip cannot disagree with the board.
   *  A column with none is NAMED as having none; it never wears a 0. */
  const fixtureCounts: Record<string, number> = Object.fromEntries(
    columnSlugs.map((sl) =>
      [sl, rows.filter((r) => columnsOf(r).includes(sl)).length]));

  /* ARROW KEYS, PILL CLICKS, THE ROTATION AND THE RIBBON, all in one
     place (components/LeagueRibbon.tsx). They belong together because
     the wave and the movement have to START TOGETHER: an arrow key knows
     its direction at the instant it is pressed, and cueing the ink off
     the scroll CROSSING instead put the wave at t=320ms — the board had
     all but finished sliding before the header reacted.
     `ready` gates it on the columns existing: the loop addresses the
     track's own DOM, and a board still loading has none. */
  const boardReady = Boolean(board) && !loading && error === "";
  /** ONE SWITCHER, NEVER TWO (operator, 2026-09-16). The board carried
   *  both the ribbon and a wrapped list of `#picker-col-<slug>` anchors
   *  at phone width — two accounts of where you are, one of them
   *  unreadable and the other only able to scroll you further down the
   *  same stack. The anchors are gone; each width now has exactly one
   *  control, and they are different controls because the widths are
   *  different problems. See components/LeagueTabs.tsx. */
  const showTabs = phone && boardReady && columnSlugs.length > 1;
  const showRibbon = !phone && windowed && boardReady;
  /* AND THE BOARD BODY ANSWERS A SWIPE (operator, 2026-09-16, with the
     loop: "add it"). The same step function the strip's arrow keys use,
     so the two cannot come to disagree about which league is next, and
     the same threshold `/bet-suggester/leagues` has read since it
     shipped.
     GATED ON `showTabs`, WHICH IS THE PHONE. The tablet and the desktop
     steer with the ribbon over a track that reads horizontal drags
     itself; a board-level swipe there would be a second switcher
     competing with the scroll the reader actually started.
     WHAT IT IS SPREAD ONTO is the track — the board's own body — and
     not `<main>`: the sticky bar holding the strip is above `<main>`
     and outside this subtree, so a tab press cannot reach here at all.
     The hook refuses gestures that begin in the strip regardless (see
     `carriesTheGesture`), because "the strip is somewhere else on the
     page" is a layout fact and not a decision. */
  const boardSwipe = useLeagueSwipe({
    enabled: showTabs, slugs: columnSlugs, picked, onPick: setPicked,
  });
  /** The declared set as one comparable string — the same key the loop
   *  itself is rebuilt on, so the rail's slots and the rotation can never
   *  be looking at two different boards. */
  const declaredKey = columnSlugs.join(",");
  useBoardLoop({
    trackRef, stripRef, railRef, slugs: columnSlugs, view,
    /* NOT ON A PHONE. The loop addresses every declared column on the
       track and a phone mounts one, so it would refuse to run in any
       case — said here rather than left to that, because "the phone has
       no loop" is a decision and not a side effect of the DOM. */
    enabled: showRibbon,
    /* THE RAIL IS BUILT ON A MEASUREMENT, NOT ON A BREAKPOINT. "Is the
       track a real horizontal scroller" is exactly the question the rail
       answers to, and the loop already asks it of the DOM — so it says
       so here rather than this page re-deciding it from a media query
       that could disagree with the `xl:` class that actually creates the
       overflow. */
    onRolling: setRailOn,
  });

  /* THE SLOTS, ONCE THE RAIL IS ON THE PAGE. A layout effect so the
     columns learn their slot BEFORE the browser paints the rail — an
     empty rail flashing above the board for a frame would be the board
     jumping on load, which is the one thing the operator has already
     rejected twice. Re-run when the declared set changes, because a
     column that arrived has a slot nobody has handed out yet.
     Only ever swapped for a DIFFERENT set of nodes: the rail's slots are
     keyed by slug and survive every board re-render, so a fresh object
     each time would re-portal all eight headers on every payload tick. */
  useIsoLayoutEffect(() => {
    const rail = railRef.current;
    if (!railOn || !rail) {
      setHeadSlots((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }
    const next: Record<string, HTMLElement> = {};
    for (const el of Array.from(
      rail.querySelectorAll<HTMLElement>("[data-rail-slot]"))) {
      next[el.dataset.railSlot!] = el;
    }
    setHeadSlots((prev) => {
      const ks = Object.keys(next);
      const same = ks.length === Object.keys(prev).length
        && ks.every((k) => prev[k] === next[k]);
      return same ? prev : next;
    });
  }, [railOn, declaredKey]);

  /* THE PILLS BAR IS THE STICKY STACK'S SECOND STOREY (2026-09-15).
     `--topbar-h` is what every column header sticks to, and it counted
     the app's top bar ALONE — so with the pills inserted between them
     the headers stuck at 49px, exactly where the pills sit, and every
     league name slid underneath and was read away. The offset is the two
     of them MEASURED TOGETHER, and measured rather than assumed because
     the bar's height depends on a font that loads after first paint.
     Written onto this page's own root, never `:root`: a value left on
     the document would follow the reader to a page that has no pills
     bar. */
  const pageRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    /* NOT ROUNDED (2026-09-15). Each height was rounded to a whole pixel
       and the two were then added, which is a measurement that can be
       half a pixel LONGER than the thing it measures: the pills bar is
       47.5px tall, `--topbar-h` came out 49 + 48 = 97, and the column
       headers parked 0.5px below the bar's bottom edge at 96.5. Half a
       pixel of page showing between two bars that are meant to read as
       one stack — and a hairline of a scrolling row inside it. The
       browser is perfectly happy to stick at a fractional offset; the
       rounding bought nothing and cost exactly that. */
    const seat = () => {
      const bar = barRef.current;
      const top = document.querySelector("header.topbar");
      const th = top ? top.getBoundingClientRect().height : 49;
      const bh = bar ? bar.getBoundingClientRect().height : 0;
      page.style.setProperty("--bar-top", `${th}px`);
      page.style.setProperty("--topbar-h", `${th + bh}px`);
    };
    seat();
    const ro = new ResizeObserver(seat);
    if (barRef.current) ro.observe(barRef.current);
    window.addEventListener("resize", seat);
    return () => { ro.disconnect(); window.removeEventListener("resize", seat); };
  }, [windowed, boardReady]);

  const oneRunningSort =
    runningSorts.length > 0
    && runningSorts.every((x) => x.mode === runningSorts[0].mode
                              && x.dir === runningSorts[0].dir)
      ? runningSorts[0]
      : null;

  /* THE NULL POLICY FOLLOWS THE SORT THAT IS ACTUALLY RUNNING
     (2026-09-15). It read the BOARD's sort, which is the one control the
     operator removed — so the sentence explaining why a quoteless row
     sorts last became unreachable: no band could raise it, and a board
     key could no longer be chosen. A reader picking `ask` on a matchday
     got the ordering and not the reason for it.
     `runningSorts` is what every column is genuinely sorted by, so the
     policy is derived from THAT. Where the bands disagree there is no one
     policy to state, and none is stated — a sentence claiming one key
     while several run would be worse than silence. */
  const runningNullNote = oneRunningSort
    ? nullNoteFor(modeById(oneRunningSort.mode) ?? boardMode, rows)
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
    /* `data-tap-floor` — EVERY CONTROL IN HERE GETS A 44px HIT AREA AT
       PHONE WIDTH. The rule is in globals.css and it is a subtree rule
       rather than a class per control, so a control added to this page
       tomorrow is floored without anybody remembering to. */
    <div ref={pageRef} data-tap-floor
      className="min-h-screen bg-bs font-sans text-ink-mid">
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

      {/* ── THE PILLS BAR, AT THE TOP OF THE PAGE (operator,
          2026-09-15: "use the name option, but now extend it fully on
          the header and remove everything else") ─────────────────────

          FULL-BLEED, DIRECTLY UNDER THE NAV, ABOVE THE HERO. It used to
          sit ~700px down, inside the board section below "Ranked by
          kickoff", which put the one control that says WHICH FOUR
          LEAGUES ARE IN FRONT OF YOU below the fold on the way in and
          out of sight the moment you started reading a column. It is
          the site's second storey now: the app's own top bar is the
          master header and the pills belong under it, sticky, naming
          the board's leagues for as long as the board is on screen.

          IT IS ALSO THE SHELF THE COLUMN HEADERS PARK ON. A track with
          `overflow-x` is a scrollport in BOTH axes, so a header inside
          it sticks to the track's own edge rather than to the viewport —
          103px down its own column, which is a header that has moved
          rather than one that follows. This bar first REPLACED them for
          that reason, which is the half-clipped league name in the
          operator's screenshot; since 2026-09-15 the headers leave the
          scrollport instead and come to rest against the bottom edge of
          this bar (see the header rail below). So the bar still has to
          genuinely stick — the rail's resting place is measured off it —
          and it still names the four in view at all times. */}
      {/* AND ON A PHONE IT HOLDS THE TAB STRIP INSTEAD (2026-09-16).
          Same bar, same storey, same sticky offset — the column headers
          are measured off its bottom edge whichever control is in it, so
          the two cases cannot drift apart. What changes is the control:
          a fixed-slot ribbon that divides its width by eight, or a strip
          of tabs each sized by its own name. */}
      {(showTabs || showRibbon) && (
        <div ref={barRef} data-testid="board-pillbar"
          className="sticky top-[var(--bar-top,calc(3rem+1px))] z-40 w-full border-b border-line bg-bs/95 backdrop-blur">
          <div className="mx-auto max-w-[96rem] px-5 py-2 max-md:px-3 max-md:py-1.5">
            {showTabs && picked
              ? <LeagueTabs slugs={columnSlugs} picked={picked}
                  onPick={setPicked} counts={fixtureCounts} />
              : <LeagueRibbon slugs={columnSlugs} view={view}
                  stripRef={stripRef} />}
          </div>
        </div>
      )}

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
      {/* `max-md:` — THE PAGE'S OWN MARGINS, ON A PHONE (2026-09-16).
          Not a redesign: the same layout with the gutters and the top
          padding a 393px viewport can afford. The hero was measured at
          ~900px before the first fixture on an 844px screen; folding the
          paragraph took most of that, and this takes the rest of what
          was chrome rather than content. */}
      <main className="mx-auto max-w-[96rem] px-5 pb-24 pt-10 max-md:px-3 max-md:pb-12 max-md:pt-4 sm:pt-12">
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
          {/* CENTRED (operator, 2026-09-15). The eyebrow, the title and
              the framing line share one axis now; the lede is centred as
              a BLOCK — `mx-auto` on a capped measure — rather than having
              its lines centred individually, which would give three
              ragged edges instead of one shape. */}
          <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
            <Eyebrow tone="accent">picker · stage 1 + stage 2</Eyebrow>
            <span aria-hidden className="flex items-center gap-1.5">
              {(["mls", "epl", "laliga", "ligamx"] as const).map((s2) => (
                <i key={s2} className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `var(--lg-${s2})` }} />
              ))}
            </span>
          </div>
          <h1 className="mt-2 text-center text-2xl font-bold uppercase tracking-[0.02em] text-ink-hi [font-family:var(--font-archivo)] [font-stretch:115%] sm:text-3xl">
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
          {/* ── AND ON A PHONE IT IS BEHIND A DISCLOSURE (operator,
              2026-09-16) ─────────────────────────────────────────────

              MEASURED at 393px: the eyebrow, the title, this paragraph's
              six lines, the built stamp and the timezone note together
              spent ~900px of an 844px screen before a single fixture.
              Every word of it is still here and none of it may go — four
              of these phrases are decision-safety invariants pinned by
              e2e/picker.spec.ts and e2e/picker-prose.spec.ts — so the
              paragraph is not cut, it is FOLDED, behind a summary that
              says what opening it gets you.

              ONE ELEMENT, NOT TWO. The obvious shape is a short version
              for the phone and the full one for everything else, and
              that is two copies of a charter sentence free to drift
              apart. This is the same `<p>`, in the same place, in a
              `<details>` that is open at every width but this one — so
              the desktop and the tablet render exactly the markup they
              rendered before, a `<summary>` with `display:none` and an
              open disclosure being indistinguishable from a paragraph.

              `open` is forced by the shape and remembered by the reader:
              once opened on a phone it stays open, because a reader who
              asked for the framing did not ask for it once. */}
          <details data-testid="board-intro" open={introOpen || !phone}
            onToggle={(e) => setIntroOpen(e.currentTarget.open)}
            className="mx-auto mt-2 max-w-3xl">
            <summary data-testid="board-intro-summary"
              className="mx-auto hidden w-fit cursor-pointer list-none items-center justify-center gap-1.5 rounded-md border border-line px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low marker:content-none hover:text-ink-hi max-md:flex"
              style={{ minHeight: "var(--tap-floor)" }}>
              <span aria-hidden className="text-ink-faint">?</span>
              what is this
            </summary>
          <p data-testid="board-framing"
            className="text-center text-[13px] leading-relaxed text-ink-low max-md:pt-2">
            {soleOwnSort
              ? `Ranked by ${soleOwnSort.mode} — nearly every tie here pairs two different domestic tables, and the gap between them is withheld.`
              : "Ranked by how far apart the two clubs sit in their own league's table."}
            {" "}No model runs on this page, no number below
            is a probability or an edge of ours, and nothing here is a
            recommendation — the ranking says where to look, and you are the
            one who picks.
          </p>
          </details>
        </div>

        {/* ------------------------- controls ------------------------- */}
        {/* ── THE PROVENANCE, ONE LINE ON A PHONE (operator,
            2026-09-16) ──────────────────────────────────────────────

            Two blocks — the built/slate/count stamp and the timezone
            note — cost five lines at 393px before the board. They are
            now ONE ROW that truncates at the viewport's edge, and that
            is the whole change: `max-md:contents` dissolves the flex row
            so both become inline runs of a single truncating block.

            NOTHING IS DELETED AND NOTHING IS HIDDEN. Every word is still
            in the element, so a screen reader reads the sentence whole
            and the legend at the foot of the page still carries the
            reasoning behind it. Truncation is a decision about the
            ellipsis, not about the text — which is the distinction
            e2e/layout-audit.spec.ts already draws between a clip that
            says so and one that eats a word. */}
        <div data-testid="board-provenance"
          className="mt-5 border-t border-line pt-4 max-md:mt-3 max-md:truncate max-md:pt-2.5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wide max-md:contents">
          {/* THE BOARD-LEVEL SORT IS GONE (operator, 2026-09-15). Every
              matchday band carries its own sort, which is the one that
              answers "what is worth looking at TODAY"; a second control
              above them only ever reordered days against each other.
              `DEFAULT_SORT` is kickoff ascending, so removing the control
              leaves the board in the order it already opened in. */}
          {runningNullNote && (
            <span data-testid="col-null-note" className="text-ink-faint normal-case tracking-normal">
              {runningNullNote}
            </span>
          )}
          {/* THE WINDOW CHIPS ARE GONE TOO (operator, 2026-09-15): "using
              the default is enough since I have never touched this
              section". Both windows open at 8 days — `DEFAULT_DAYS` and
              `DEFAULT_BACK` — and the values behind them are plain
              constants now rather than state nothing can set, so the
              board asks for exactly what it asked for before. What is
              kept is the PROVENANCE beside them: when the board was
              built, which slate it is, and how many fixtures it holds.
              That is not a control and was never the thing taking up the
              row; a board about fixtures that will not say how fresh it
              is would be the one real loss here. */}
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
        <span aria-hidden
          className="hidden font-mono text-[10px] text-ink-faint max-md:inline">
          {" · "}
        </span>
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
          className="mt-2 font-mono text-[10px] tracking-wide text-ink-faint max-md:mt-0 max-md:inline">
          kickoffs in {TZ} · cached 90s · “built” is when the board was
          assembled, not when you asked for it
        </p>
        </div>

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
        {/* THE WATCHED-STRIP READ IS OFF THE LANDING PAGE (operator,
            2026-09-15). It is operator-gated, and with no token held in
            an ordinary tab it could only ever draw its own refusal —
            a box explaining why it is empty, permanently, to a reader
            who cannot fix it. The declaration panel above still opens
            for whoever holds the token; what is gone is the read that
            had nothing to say without one. */}

        {/* THE SEASON-BASIS BANNER IS OFF THE LANDING PAGE (operator,
            2026-09-15). The fact it carried is not lost: EVERY column
            already prints its own blend on its own chip — "prior szn ·
            23% this szn" — which is the same fact said where it applies
            instead of a page-wide banner that has to name seven leagues
            to say it once. A second copy of a fact is the copy that
            rots. */}

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
        <section className="mt-8 max-md:mt-4">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-6 max-md:mb-2 max-md:pt-3">
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
              {/* THE BACKEND'S SENTENCE WHEN IT SENT ONE, and this
                  module's own when what it sent was machine text. The
                  board's `detail` is carried forward exactly as before
                  — "picker board unavailable" still reads as it did —
                  but a `detail` that is a provider exception no longer
                  publishes a URL on the page. */}
              <p className="mt-2 font-mono text-[12px] text-live">
                {boardFailure ? failureSentence(boardFailure) : error}
              </p>
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
              {/* THE FULL BOARD, HANDED A PAYLOAD THAT IS NOT A
                  DECLARATION. `declarationOf` returns null for a
                  narrowed payload, and this page then draws NO columns
                  — the safe direction, because the unsafe one is
                  reading an answer to somebody's question as the
                  operator's column set, which is how the board went
                  from six columns to eleven in production.
                  Unreachable through the UI: this route passes no
                  `only` and therefore asks for nothing. But a blank
                  where four columns belong is exactly the shape this
                  surface refuses to leave unexplained, so the state is
                  NAMED rather than silently empty — if a proxy, a cache
                  or a future caller ever puts a narrowed payload here,
                  the page says what it got instead of looking broken. */}
              {!only && board && declaration === null && (
                <div data-testid="board-not-a-declaration"
                  className="mb-5 rounded-xl border border-live/30 bg-live/5 p-4">
                  <Eyebrow tone="live">this payload is an answer, not the board</Eyebrow>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-mid">
                    The board answered with a NARROWED payload — a reply to
                    a request for named competitions — and a narrowed reply
                    cannot say which columns the board declares. No column
                    is drawn from it, because the alternative is showing a
                    competition nobody put on this board.
                  </p>
                  <button onClick={() => setNonce((n) => n + 1)}
                    className="mt-3 rounded-md border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
                    ask again
                  </button>
                </div>
              )}
              {/* A FIXTURE THAT LEFT THE BOARD IS NAMED, AND THE BOARD
                  SAYS WHERE IT WENT (2026-09-10).

                  On the first Champions League matchday two ties kicked
                  off at 16:45, the board went from six cards to four,
                  and the page said nothing at all. The operator's words
                  were "live matches disappeared", which is exactly
                  right: they had. The backend had always named them,
                  with a `code`, a count per code and a `why` in its own
                  words, and nothing on this page read a byte of it.

                  KICKING OFF IS NO LONGER A WAY TO LEAVE (2026-09-14).
                  `board.BOARD_STATES` keeps a match under way in its
                  own card spot with a live clock in the date cell, so
                  the only code this strip now draws on the declared
                  board is `finished` — which hands the reader the
                  review tail directly below, needing no token. THIS
                  STRIP IS NOT DEAD AND MUST NOT BE DELETED: it still
                  carries the finished departures, and a narrowed caller
                  can still produce `kicked_off`. It draws whatever the
                  payload names, which is why neither change needed an
                  edit here.

                  ABSENT-BY-DESIGN MUST NOT READ AS VANISHED. That is
                  the sentence this codebase repeats everywhere else and
                  did not honour on its own board.

                  THE BACKEND'S WORDS, NOT THIS FILE'S. `why` is
                  printed rather than restated, so a reason that changes
                  upstream cannot go on being described here in terms
                  that stopped being true. */}
              {/* COLLAPSED TO ONE LINE (operator, 2026-09-15). It was a
                  full panel — four named fixtures and a six-line
                  paragraph of the backend's reasoning — standing between
                  the reader and the board every time a match finished.
                  The INFORMATION is untouched: every departed fixture is
                  still named, and the backend's own sentence is still
                  printed verbatim, once per code. What changed is the
                  proportion. The count and the codes are the line, the
                  names are one click behind it in the disclosure the
                  finished tails already use, and the prose is behind the
                  same hover `i` the cards use for everything else that
                  explains rather than states. */}
              {offBoard.length > 0 && (
                <div data-testid="board-off-board"
                  data-codes={offCodes.join(",")}
                  className="mb-4 flex items-baseline gap-2">
                  <details data-testid="off-board-disclosure"
                    className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5">
                    <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low marker:content-none hover:text-ink-hi">
                      <span aria-hidden className="mr-2 text-ink-faint">▸</span>
                      {offBoard.length} fixture{offBoard.length === 1 ? "" : "s"}
                      {" left the board · "}
                      <span className="text-warn">
                        {offCodes.map((c) => c.replace(/_/g, " ")).join(" · ")}
                      </span>
                    </summary>
                    <ul className="mt-2 space-y-1.5 border-t border-line pt-2">
                      {offBoard.map((o) => (
                        <li key={o.event_id}
                          data-testid="off-board-row" data-code={o.code}
                          className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-sm text-ink-hi">
                            {o.home} <span className="text-ink-faint">v</span>{" "}
                            {o.away}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-warn">
                            {o.code.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono text-[10.5px] tabular-nums text-ink-faint">
                            {o.kickoff}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                  {/* THE BACKEND'S WORDS, NOT THIS FILE'S, and ONCE PER
                      CODE rather than once per row: two ties that left
                      for the same reason share one finding, and printing
                      it twice would read as two. */}
                  <NotesPanel
                    label={`why ${offBoard.length} fixture`
                      + `${offBoard.length === 1 ? "" : "s"} left the board`}
                    idPrefix="off-board" testidOpen="off-board-why"
                    testidPanel="off-board-why-panel"
                    sections={offWhy.map((o) => ({
                      id: `off-board-why-${o.code}`,
                      head: o.code.replace(/_/g, " "),
                      body: o.why, tone: "text-warn" }))} />
                </div>
              )}
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
              {/* ASKED FOR BY NAME — AND THAT IS NOT THE SAME AS BEING
                  ON THE BOARD. This page got its rows because it named
                  the competition in the request, which is the door
                  `OFF_BOARD_BY_DECISION` describes and nothing wider.
                  Saying so is not pedantry: the payload's `leagues` key
                  set now holds the slug that was asked about, in exactly
                  the shape a declaration has, and the board has twice
                  grown by that confusion — six columns to eleven in
                  production, and a finished Leagues Cup walking back on
                  after being removed. The reader is told which of the
                  two they are looking at, on the surface where the
                  distinction is invisible.
                  Derived from `narrowed_to`, so the sentence is the
                  BACKEND's answer rather than this page's assumption:
                  it appears only where the ask was actually honoured. */}
              {answered === true && (
                <p data-testid="board-narrowed"
                  data-narrowed-to={(board?.narrowed_to ?? []).join(",")}
                  className="mb-5 border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
                  {/* EXPLICIT `{" "}` ON BOTH SIDES OF THE NAME. The
                      space after an interpolation at the end of a line
                      is eaten by the JSX transform, and it shipped as
                      "Champions Leagueby name" — caught against the live
                      backend, not by reading the source, which is where
                      it looks correct. */}
                  This board was ASKED for{" "}
                  {columnSlugs.map(leagueLabel).join(" · ")}{" "}
                  by name. It is
                  not the picker board&rsquo;s declared column set, and
                  nothing here puts the competition back on{" "}
                  <Link href="/bet-suggester"
                    className="text-ink-mid underline decoration-line-strong underline-offset-2 hover:text-accent">
                    the board
                  </Link>
                  {" "}— the same ranking, built on request.
                </p>
              )}
              {/* THE JUMP NAV IS GONE (operator, 2026-09-16). It was a
                  wrapped list of `#picker-col-<slug>` anchors, phone-only,
                  and for as long as the phone stacked every column it was
                  the only READABLE switcher the board had — the ribbon
                  above it clipped all eight names to a sliver. Two
                  controls for one board is two accounts of where you are,
                  and an anchor could only ever move you down a 27,000px
                  stack: it named the place without shortening the journey.
                  The tab strip in the pills bar SELECTS, so the stack is
                  not there to be jumped through. The addresses survive it
                  — `id="picker-col-<slug>"` is still on every section, and
                  is what each tab's `aria-controls` names. */}
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
              {/* THE TRACK. A real `overflow-x` scroller at xl, where the
                  columns sit side by side; below xl they stack and there
                  is nothing to scroll, so the scrollport is not created
                  at all and the column headers keep their stickiness
                  there.
                  `--colw` is written by the loop — a MEASURED column
                  width, so four fill the viewport exactly and the fifth
                  begins off its right edge. It falls back to
                  `minmax(0,1fr)`, which is the pre-scroll board and what
                  every narrowed page still draws.
                  `overscroll-x-contain` so a trackpad flick at the end of
                  a column does not become a browser back-navigation —
                  there IS no end here, and the gesture that looks for one
                  must not leave the page. */}
              {/* THE SCROLLER IS ONLY BUILT WHEN THERE IS SOMEWHERE TO
                  SCROLL. At four columns or fewer the board shows
                  everything it has, and `overflow-x` there would buy
                  nothing and cost the column headers their scrollport —
                  so it is not created, and those boards keep a header
                  that sticks inside its own column exactly as it always
                  did. */}
              {/* ── THE BOARD FRAME: the header rail, then the track.
                  They are wrapped together because a `sticky` element
                  only sticks WITHIN ITS CONTAINING BLOCK — parked in the
                  page instead, the rail would carry on past the last
                  fixture and hang over the prose below the board. */}
              <div data-testid="board-frame">
              {/* ── THE COLUMN HEADERS, LIFTED OUT OF THE TRACK
                  (operator, 2026-09-15: "make the league header still
                  going with me when I go down. It need to go too right
                  under the pills") ─────────────────────────────────────

                  WHY THEY CANNOT STICK WHERE THEY WERE. `overflow-x:
                  auto` on the track forces `overflow-y` to compute to
                  `auto` as well, so the track is a scrollport in BOTH
                  axes — and `position: sticky` sticks to the nearest
                  scrollport, not to the viewport. A header inside it
                  therefore measured `top` from the TRACK's own edge and
                  parked ~103px down its own column, permanently. The
                  answer shipped that morning was to make it `static` and
                  let the pills bar do the wayfinding; the operator's
                  screenshot of a league name sliced in half by the pills
                  bar is what that looked like to read.

                  SO THE HEADER LEAVES THE SCROLLPORT. Each column
                  PORTALS its own header into a slot here (see `Slotted`
                  in components/PickerColumn.tsx) — the same element,
                  with the same data and the same state, drawn in a rail
                  that is a plain child of the page and so sticks to the
                  viewport like anything else. Nothing is duplicated and
                  nothing is left behind: there is one header per column
                  and this is where it is.

                  IT COMES TO REST UNDER THE PILLS BAR, at
                  `--topbar-h` — nav plus pills, MEASURED together by the
                  effect above rather than typed, because the bar's
                  height depends on a font that loads after first paint.
                  z-30 puts it under the pills (z-40) and the app bar
                  (z-50) and over the board's own rows.

                  AND IT MOVES SIDEWAYS WITH THE BOARD. The rail is a
                  grid on the track's own template — `--cols` tracks of
                  `--colw`, the same `gap-6` gutter — and `useBoardLoop`
                  writes each slot's `--col` in the same statement it
                  writes its column's, then offsets the whole rail by the
                  track's `scrollLeft`. A rotation turns both at once, so
                  a header cannot drift from the league it names.

                  CLIP, NOT HIDDEN, NOT AUTO. `overflow: hidden` would
                  make this a scrollport too and put the headers straight
                  back in the box they just escaped; `clip` cuts the
                  overhang at exactly the track's edges and creates no
                  scroll container at all. Only the x axis is clipped, so
                  the notes panel can still hang below the rail. */}
              {/* `md:block`, RESTATED 2026-09-16: the rail follows the
                  scrollport, and the scrollport now starts at `md`. It is
                  still built on a MEASUREMENT — `railOn` comes from the
                  loop asking the DOM whether the track genuinely
                  overflows — so this class says where the rail MAY be
                  drawn and never decides that it should be. */}
              {railOn && (
                <div data-testid="board-head-rail"
                  className="sticky top-[var(--topbar-h)] z-30 hidden overflow-x-clip bg-bs md:block">
                  <div ref={railRef} data-testid="board-head-track"
                    className="grid w-max items-start gap-x-6 [grid-template-columns:repeat(var(--cols),var(--colw,minmax(0,1fr)))] will-change-transform">
                    {drawnSlugs.map((slug) => (
                      /* NO `style` PROP ON PURPOSE. `--col` is the
                         loop's to write, and a style object React
                         re-asserts on every board tick is a slot that
                         snaps back to its render-time track mid-
                         rotation. The fallback keeps DOM order until the
                         first seat, which is before any header is in
                         here to see it. */
                      /* AND THE ROW IS EXPLICIT, for the same reason the
                         columns' is. A slot placed on an explicit
                         COLUMN with an auto row is still auto-placed
                         vertically, and sparse auto-placement never
                         moves the cursor backwards: the moment a
                         rotation left a slot naming a lower track than
                         the one before it in DOM order — which is every
                         rotation, and the very first seat — the grid
                         wrapped it onto a second row. Measured: two of
                         eight headers 98px below the other six, each
                         still over the right column. */
                      <div key={slug} data-rail-slot={slug}
                        className="min-w-0 [grid-column:var(--col,auto)] [grid-row:1]" />
                    ))}
                  </div>
                </div>
              )}
              {/* ── THE TRACK, AND THE TWO WIDTHS IT IS A SCROLLER AT
                  (2026-09-16) ────────────────────────────────────────

                  It was a scroller at `xl` and a four-deep stack of
                  two-wide rows from `md` to `xl` — which is the same
                  board asking the reader to scroll past six columns to
                  reach the seventh, on a device where two of them fit
                  side by side perfectly well. The scrollport starts at
                  `md` now. A COLUMN DOES NOT CHANGE WIDTH: `md:grid-cols-2`
                  already gave two columns of (width − 24px gutter) / 2,
                  and `--colw` at `VIEW_NARROW = 2` is that same
                  arithmetic — 352px at 768, 480 at 1024 — so what moved
                  is how you reach the other six, not what any of them
                  looks like.

                  ONLY A WINDOWED BOARD. Four columns or fewer have
                  nothing to scroll to, so they keep `md:grid-cols-2` and
                  the `xl` template exactly as they had them; a narrowed
                  page keeps its single full-width column. Those boards
                  are untouched at every width.

                  BELOW `md` THE TRACK HOLDS ONE COLUMN, so `grid-cols-1`
                  is the whole layout and there is nothing to overflow —
                  which is also why the headers go back to sticking
                  inside their own column there. */}
              <div ref={trackRef} data-testid="board-track"
                {...boardSwipe}
                data-swipe={showTabs ? "league" : undefined}
                style={{ ["--cols" as string]: String(drawnSlugs.length) }}
                className={`grid grid-cols-1 gap-6 ${
                  windowed
                    ? "md:gap-y-2 md:overflow-x-auto md:overscroll-x-contain md:[grid-template-columns:repeat(var(--cols),var(--colw,minmax(0,1fr)))]"
                    : `xl:gap-y-2 xl:[grid-template-columns:repeat(var(--cols),var(--colw,minmax(0,1fr)))] ${
                        soleColumn ? "" : "md:grid-cols-2"}`}`}>
                {drawnSlugs.map((slug, ci) => (
                  <LeagueColumn key={slug} slug={slug} days={days}
                    dayKeys={dayKeys} sortFor={sortFor}
                    dayLabels={dayLabelFor} colIndex={ci + 1}
                    dense={Boolean(soleColumn)}
                    /* IS THIS COLUMN ON A SIDEWAYS TRACK FROM `md` UP?
                       The same condition the track's own template is
                       written from, handed down rather than re-decided:
                       a column placed on `--col` at a width where the
                       track has no `--cols` template lands on an
                       IMPLICIT grid track, which is the zero-width-
                       columns defect the track's note above records. */
                    sideways={windowed}
                    /* AND ON A PHONE IT IS THE TAB STRIP'S PANEL. Said
                       only where a strip exists to point at it: a
                       `tabpanel` with no `tablist` is a role that lies
                       about the page. */
                    tabPanel={showTabs && slug === picked}
                    meta={leaguesMap[slug]}
                    rows={rows.filter((r) => columnsOf(r).includes(slug))}
                    refusals={refusals.filter((r) => columnsOf(r).includes(slug))}
                    review={{
                      rows: finished.filter((r) => columnsOf(r).includes(slug)),
                      refusals: finishedRefusals.filter((r) => columnsOf(r).includes(slug)),
                      meta: reviewLeagues[slug],
                      back, loading: reviewLoading, error: reviewError,
                      /* WAS THIS COMPETITION READ AT ALL? Off the
                         payload's own record, never inferred from an
                         empty row list. */
                      read: readHere(review, slug),
                      /* …and when it was not, why — if the page knows.
                         It knows exactly one reason: it asked and the
                         server did not answer the question. */
                      unreadWhy: reviewAnswered === false
                        ? "This page asked the review for "
                          + `${leagueLabel(slug)} by name and the server `
                          + "answered with the board's declared "
                          + "competitions instead — it did not narrow the "
                          + "sweep. That is a read that never covered this "
                          + "competition, not a week in which nothing was "
                          + "played."
                        : null,
                      storeNote,
                    }}
                    field={fields[slug]}
                    /* WHERE THIS COLUMN'S HEADER IS DRAWN — its slot in
                       the rail above, or nothing, in which case the
                       header stays at the top of the column and sticks
                       there. Absent until the rail has mounted, so the
                       first paint (and the server's markup) is the
                       in-column header it has always been. */
                    headSlot={headSlots[slug] ?? null} />
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
                    /* THE RAIL STICKS TO THE SCROLLPORT, NOT TO THE TRACK
                       (2026-09-15). The band spans `1 / -1`, which is now
                       every column on the track rather than the four on
                       screen — so a date drawn at the band's left edge
                       scrolls away with the first column and the reader
                       is left looking at four columns under no date at
                       all, and at a matchday sort control parked several
                       thousand pixels to the right. The band's CONTENTS
                       are therefore one viewport wide and pinned to the
                       left of the scrollport: the date and its control
                       stay over whichever four you have scrolled to.
                       `--vieww` is the track's own measured width, so
                       this cannot drift from the geometry the columns are
                       laid out on. */
                    <div key={k} data-testid="day-band" data-day={k}
                      style={{ gridRow: 2 + 2 * i, gridColumn: "1 / -1" }}
                      className="hidden pt-5 xl:block">
                    <div className="sticky left-0 flex w-[var(--vieww,100%)] items-center gap-3">
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
                    </div>
                  );
                })}
              </div>
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

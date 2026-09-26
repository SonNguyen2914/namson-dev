// THE FIELD — namson.dev/bet-suggester/ratings
//
// "create a stat page on the web, put in on the left upper side of the
//  web for me to check rankings and tier rankings anytime i need"
//                                          (operator, 2026-09-09)
//
// REBUILT 2026-09-23 TO THE DESIGN THE OPERATOR APPROVED — the artifact
// "The Pinned-Pass Field". The page used to draw ONE competition's field
// (`FieldAxes` over `/api/comp/{key}/ratings`, the Champions League by
// default). It now draws three things, behind one switch:
//
//   LEAGUES  every current-season club of the eight declared board
//            columns, on the union corpus at the pinned pass count —
//            GET /api/field/leagues
//   CUPS     the measured cup fields, ONE TABLE PER CUP — any number
//            selected, never merged, ranked or scaled against each
//            other, because no two share both a corpus and a pass
//            count — GET /api/field/cups
//   NATIONAL TEAMS (approved 2026-09-24) the four Championships
//            competitions, one table each on ONE SHARED AXIS, because all
//            four are cut from one national-team corpus at one pass
//            count — GET /api/field/nations. Read the first time the view
//            is shown, like the cups, so the other two never ask for it.
//
// `FieldAxes` and `fieldApi` are untouched and still serve the
// competition viewer and the board card; only this page's content moved.
// The component rules — ladder is data, one table one axis, rows ranked
// by value, bridges read first, a within-league read for one league —
// are written down beside the code that keeps them, in
// components/PinnedPassField.tsx.
//
// `?comp=` STILL WORKS, for any link made to the old page: a cup key (or
// an alias — `leaguescup` opens the field it shares with `campeones`)
// opens the Cups view with exactly that field selected.
//
// NOTHING HERE IS A RECOMMENDATION, and the page adds no verb the reader
// could act on. It shows; it does not decide.
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArchiveMenu } from "../../components/ArchiveMenu";
import { CompRail } from "../../components/CompRail";
import {
  CupsView, FLIP, FieldMode, LeaguesView, ModeSwitch, NationsView,
  sameClubTwoFields,
} from "../../components/PinnedPassField";
import { Eyebrow } from "../../components/ui";
import {
  Collapse, NavChip, RouteProgress, SkeletonRows, TopBar,
} from "../../components/chrome";
import {
  CupFields, LeagueField, NationFields, countWord, fetchCupFields,
  fetchLeagueField, fetchNationFields, shortSha,
} from "../../lib/fieldPageApi";

/** Where the last view is remembered. Browser storage is a per-viewer
 *  convenience here and nothing more: every read and write is guarded,
 *  and the page renders the same without it. */
const MODE_KEY = "field-page-mode";

type Read<T> = { data: T | null; error: string | null; loading: boolean };
const idle = <T,>(): Read<T> => ({ data: null, error: null, loading: false });

function ReadFailed({ what, error, testId }: {
  what: string; error: string; testId: string;
}) {
  return (
    <div data-testid={testId} className="mt-8 rounded-2xl border border-live/30 bg-live/5 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-live">
        the {what} could not be read
      </p>
      <p className="mt-2 max-w-2xl font-mono text-[12px] leading-relaxed text-live">{error}</p>
      <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-ink-low">
        This is a failed read, not an empty field: nothing below was
        measured as missing, it was not received.
      </p>
    </div>
  );
}

export default function FieldPage() {
  const router = useRouter();
  const [mode, setMode] = useState<FieldMode>("leagues");
  const [flip, setFlip] = useState(0);
  const [leagues, setLeagues] = useState<Read<LeagueField>>(
    { data: null, error: null, loading: true });
  const [cups, setCups] = useState<Read<CupFields>>(idle);
  const [cupAsked, setCupAsked] = useState<string | null>(null);
  const [nations, setNations] = useState<Read<NationFields>>(idle);

  /* THE LAST VIEW, and `?comp=`, read once the router knows the query.
     In an effect, never in render: the server has no storage and no
     query, and the first client render must match it. */
  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.comp;
    const comp = typeof raw === "string" && raw !== "" ? raw : null;
    let remembered: string | null = null;
    try { remembered = window.localStorage.getItem(MODE_KEY); } catch {
      /* SWALLOWED(field:mode-read) — registered in
         e2e/missing-is-not-zero.spec.ts with its closes_when. */
    }
    const t = setTimeout(() => {
      if (comp) { setCupAsked(comp); setMode("cups"); }
      else if (remembered === "cups" || remembered === "nations") {
        setMode(remembered);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [router.isReady, router.query.comp]);

  useEffect(() => {
    const ac = new AbortController();
    const t = setTimeout(() => {
      void fetchLeagueField(ac.signal)
        .then((d) => { if (!ac.signal.aborted) setLeagues({ data: d, error: null, loading: false }); })
        .catch((e) => {
          if (ac.signal.aborted) return;
          setLeagues({ data: null, loading: false,
            error: e instanceof Error ? e.message : String(e) });
        });
    }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, []);

  /* The cup read is fetched the first time the Cups view is shown, and
     not before: a page that opens on Leagues does not pay for it, and a
     cup artifact that fails cannot blank the league table. */
  /* THE FLAG IS THE REQUEST, not the loading state: a `loading` in the
     dependency would re-run this effect the moment the read began and
     its cleanup would abort the very read it had just started. So the
     read is started once, from a ref, and never torn down by its own
     progress. */
  const cupsStarted = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (mode !== "cups" || cupsStarted.current) return;
    cupsStarted.current = true;
    let fired = false;
    const t = setTimeout(() => {
      fired = true;
      setCups({ data: null, error: null, loading: true });
      void fetchCupFields()
        .then((d) => {
          if (mounted.current) setCups({ data: d, error: null, loading: false });
        })
        .catch((e) => {
          if (!mounted.current) return;
          setCups({ data: null, loading: false,
            error: e instanceof Error ? e.message : String(e) });
        });
    }, 0);
    /* Torn down before the timer fired (the view flipped straight back):
       nothing was asked, so the next visit may ask. Once it has fired the
       read is left to land — it is the same read either way. */
    return () => {
      if (!fired) { clearTimeout(t); cupsStarted.current = false; }
    };
  }, [mode]);

  /* THE NATIONAL READ, the same way and for the same reasons: asked for
     the first time the view is shown and never before, so the Leagues and
     Cups views never call /api/field/nations, and a national bundle that
     fails cannot blank either of them. */
  const nationsStarted = useRef(false);
  useEffect(() => {
    if (mode !== "nations" || nationsStarted.current) return;
    nationsStarted.current = true;
    let fired = false;
    const t = setTimeout(() => {
      fired = true;
      setNations({ data: null, error: null, loading: true });
      void fetchNationFields()
        .then((d) => {
          if (mounted.current) setNations({ data: d, error: null, loading: false });
        })
        .catch((e) => {
          if (!mounted.current) return;
          setNations({ data: null, loading: false,
            error: e instanceof Error ? e.message : String(e) });
        });
    }, 0);
    return () => {
      if (!fired) { clearTimeout(t); nationsStarted.current = false; }
    };
  }, [mode]);

  const choose = useCallback((m: FieldMode) => {
    if (m === mode) return;
    setMode(m);
    setFlip((f) => f + 1);
    try { window.localStorage.setItem(MODE_KEY, m); } catch {
      /* SWALLOWED(field:mode-write) — registered in
         e2e/missing-is-not-zero.spec.ts with its closes_when. */
    }
  }, [mode]);

  const L = leagues.data;
  const C = cups.data;
  const overall = L?.axes.overall?.rows ?? [];
  const zb = overall.filter((r) => r.bridge_fixtures === 0).length;
  const bf = overall.filter((r) => r.below_floor === true).length;
  const nCols = L?.columns.length ?? 0;
  const reps = overall.map((r) => r.jackknife_replicates)
    .filter((x): x is number => x != null);
  const repLo = reps.length ? Math.min(...reps) : null;
  const repHi = reps.length ? Math.max(...reps) : null;
  const same = L?.live_ucl_field?.same_fit === true;
  const example = C ? sameClubTwoFields(C.cups) : null;
  const leagueFit = (c: { corpus_sha256?: string | null;
    passes?: number | string | null }) => !!L && c.corpus_sha256 === L.corpus_sha256
      && String(c.passes) === String(L.passes);

  const N = nations.data;
  const nComps = N?.competitions ?? [];
  const oneFit = N?.shared_axis?.one_measurement === true;
  /* THE NATIONAL LEDE'S FACTS, every one read off the payload: how many
     internationals, over what window, at what count, and what the floor
     said on each axis across the four fields. */
  const goalRows = nComps.flatMap((c) => ["attack", "defence"]
    .flatMap((a) => c.axes[a]?.rows ?? []));
  const goalBelow = goalRows.filter((r) => r.below_floor === true).length;
  const ovrRows = nComps.flatMap((c) => c.axes.overall?.rows ?? []);
  const ovrBelow = ovrRows.filter((r) => r.below_floor === true).length;
  const yearOf = (d?: string | null) => d ? d.slice(0, 4) : null;
  const dayOf = (d?: string | null) => {
    if (!d) return null;
    const t = new Date(d);
    return Number.isNaN(t.getTime()) ? d : t.toLocaleDateString("en-GB",
      { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  };

  const tag = mode === "cups"
    ? "one table per cup · each on its own corpus"
    : mode === "nations"
      ? N ? `${countWord(nComps.length)} competitions · ${
          oneFit ? "one national-team measurement" : "separate measurements"
        } · ${N.passes ?? "an unstated number of"} passes`
        : "national-team field"
      : L ? `${L.passes} passes · union corpus · ${countWord(nCols)} columns`
        : "union corpus";
  const modeSwitch = <ModeSwitch mode={mode} onChange={choose} />;
  const flipClass = flip > 0 ? FLIP : "";

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head>
        <title>The field, at the pinned pass · namson.dev</title>
        <meta name="description"
          content="Every current-season club of the eight board leagues on one cross-league scale, and the three cup fields one table each — with bridges, 95% intervals and tier sets." />
      </Head>
      <RouteProgress />
      <TopBar left={<ArchiveMenu />} title="the field">
        <CompRail />
        <NavChip href="/bet-suggester">board</NavChip>
        <NavChip href="/bet-suggester/ratings" active>ratings</NavChip>
      </TopBar>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">
        <Eyebrow>rankings &amp; tier rankings</Eyebrow>
        <h1 className="mt-2 text-2xl font-medium tracking-tight text-ink-hi">
          The field, at the pinned pass
          <span data-testid="field-tag"
            className="ml-2.5 align-middle font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-ink-faint">
            {tag}
          </span>
        </h1>

        <div key={`lede-${mode}`} className={flipClass}>
          {mode === "leagues" ? (
            <>
              <p data-testid="field-lede"
                className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-low">
                Every current-season club of the {countWord(nCols || 8)} declared
                columns, read on the <b className="font-semibold text-ink-mid">union
                corpus</b> — the league fixtures plus the European, CONCACAF and
                English cups that connect them —{" "}
                {L ? (
                  <>at <b className="font-semibold text-ink-mid">{L.passes} passes</b>
                    {same ? (
                      <>, <span data-testid="same-fit">the same corpus and pass count
                        the live Champions League field is served on</span></>
                    ) : null}</>
                ) : "at the pinned pass count"}.
                On this corpus the columns sit on{" "}
                <b className="font-semibold text-ink-mid">one connected ladder</b>,
                so any selection of leagues can be ranked together.{" "}
                <b className="font-semibold text-ink-mid">Bridges is the column to read
                first:</b>{" "}a club with none carries a hollow ring instead of its
                league&rsquo;s light and draws no interval, because a narrow band
                there means no evidence rather than good evidence.
              </p>
              {L && (
                <p data-testid="field-fit"
                  className="mt-3 max-w-3xl border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
                  {overall.length} clubs · {countWord(zb)} with no bridge ·{" "}
                  {bf === 0 ? "none" : bf} below the preregistered floor. Corpus{" "}
                  <code className="font-mono text-[11px] text-ink-mid">{shortSha(L.corpus_sha256) ?? "not stated"}</code>{" "}
                  at {L.passes} passes, {L.jackknife_replicates ?? "an unstated number of"}{" "}
                  jackknife replicates.{" "}
                  {same
                    ? "The live Champions League field reads this same fit, so a figure on this page and one on its panel are one measurement."
                    : L.live_ucl_field
                      ? `The live Champions League field is on corpus ${shortSha(L.live_ucl_field.corpus_sha256) ?? "not stated"} at ${L.live_ucl_field.passes} passes, so a figure here and one on its panel are not the same measurement.`
                      : ""}
                </p>
              )}
            </>
          ) : mode === "nations" ? (
            <>
              <p data-testid="field-lede"
                className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-low">
                Every senior men&rsquo;s national team in{" "}
                {N ? countWord(nComps.length) : "the"} competitions
                {N && nComps.length ? (
                  <> &mdash; {nComps.map((c, i) => (
                    <span key={c.key}>{i === 0 ? "" : i === nComps.length - 1 ? " and " : ", "}{c.display}</span>
                  ))} &mdash;</>
                ) : null}{" "}
                rated on{" "}
                <b className="font-semibold text-ink-mid">{oneFit || !N
                  ? "one national-team measurement" : "the national-team field"}</b>
                {N ? (
                  <>: <span data-testid="nations-corpus">{N.fixtures != null
                    ? `${N.fixtures.toLocaleString("en-US")} internationals` : "an unstated number of internationals"}
                  {N.window?.start ? ` from ${yearOf(N.window.start)}` : ""}
                  {N.window?.end ? ` to ${dayOf(N.window.end)}` : ""}
                  {N.confederations?.length
                    ? ` across ${countWord(N.confederations.length)} confederations` : ""}</span>,
                  the same Elo chain, pass-count pin, jackknife band and
                  placeability floor as the club field, at{" "}
                  <b data-testid="nations-passes" className="font-semibold text-ink-mid">{N.passes ?? "an unstated number of"} passes</b>.</>
                ) : "."}{" "}
                Attack and defence come from the same goals model, fitted on
                each confederation&rsquo;s matches.
              </p>
              {N && (
                <p data-testid="nations-comparable"
                  className="mt-3 max-w-3xl border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
                  {oneFit ? (
                    <><b className="font-semibold text-ink-mid">So these tables can be
                      read against each other.</b> Unlike the cups, all{" "}
                      {countWord(nComps.length)} are cut from one corpus at one
                      count, and they share one axis.</>
                  ) : (
                    <><b className="font-semibold text-ink-mid">These fields are not one
                      measurement today</b> — they do not share both a corpus and a
                      pass count — so each table is drawn on its own axis.</>
                  )}{" "}
                  Two things to read before a number: friendlies are in the fit
                  {N.friendly_only_bridge_teams != null
                    ? <>, because {N.friendly_only_bridge_teams} teams meet another
                      confederation only in friendlies</> : ""}; and{" "}
                  {goalRows.length && goalBelow === goalRows.length ? (
                    <><b className="font-semibold text-ink-mid">attack and defence sit
                      below the floor for every team</b>{" "}&mdash; a typical 95% band is
                      wider than one band of the field, so those two are measured and
                      shown but too wide to tier with confidence</>
                  ) : (
                    <>{goalBelow} of {goalRows.length} attack and defence rows sit
                      below the floor</>
                  )}.{" "}
                  {ovrRows.length ? (ovrBelow === 0
                    ? "Overall clears the floor in every confederation."
                    : `${ovrBelow} of ${ovrRows.length} overall rows sit below the floor.`) : ""}
                  {N.band === "within_confederation" && (
                    <>{" "}Inside each table the &plusmn; band, the tiers and the floor
                      are read within the confederation &mdash; its own level taken
                      out, because every entrant shares it; the faint rule under a
                      bar is the full cross-confederation band, the one to read
                      across tables.</>
                  )}
                </p>
              )}
            </>
          ) : (
            <>
              <p data-testid="field-lede"
                className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-low">
                The platform rates {C ? countWord(C.cups.length) : "its"} cup fields, and{" "}
                <b className="font-semibold text-ink-mid">each is its own
                measurement</b>.{" "}
                {C?.cups.map((c, i) => (
                  <span key={c.key}>
                    {i === 0 ? "The " : i === C.cups.length - 1 ? " and the " : "; the "}
                    {c.display} field is fitted at {c.passes} passes on corpus{" "}
                    <code className="font-mono text-[11px] text-ink-mid">{shortSha(c.corpus_sha256)}</code>
                    {leagueFit(c) ? " — the same corpus and count as the Leagues view, so a figure here and a league figure are directly comparable" : ""}
                    {i === C.cups.length - 1 ? "." : ""}
                  </span>
                ))}
              </p>
              <p data-testid="cups-incomparable"
                className="mt-3 max-w-3xl border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
                <b className="font-semibold text-ink-mid">So every cup gets its own
                table.</b> Select one or all of them, but no two share both a
                corpus and a pass count, and a number is only comparable to
                another on the same one — so the tables are never merged, ranked
                or scaled against each other
                {example ? (
                  <>: <span data-testid="cups-example">{example.club} is{" "}
                    <b className="font-semibold text-ink-mid">{example.va.toFixed(1)}</b>{" "}
                    in the {example.a.display} field and{" "}
                    <b className="font-semibold text-ink-mid">{example.vb.toFixed(1)}</b>{" "}
                    in the {example.b.display} field — the same club, measured two
                    different ways, not {Math.abs(example.va - example.vb).toFixed(1)}{" "}
                    points apart</span>.</>
                ) : "."}{" "}
                {C && C.cups.every((c) => c.carries_bridge_counts === false)
                  ? "Per-club bridge counts are not part of these fields’ output, so this view has no bridges column rather than an empty one."
                  : ""}
              </p>
            </>
          )}
        </div>

        {mode === "leagues" && (
          leagues.loading ? (
            <div className="mt-6">{modeSwitch}
              <div data-testid="field-loading" className="mt-4"><SkeletonRows rows={8} height="h-9" /></div></div>
          ) : leagues.error ? (
            <div className="mt-6">{modeSwitch}
              <ReadFailed what="league field" error={leagues.error} testId="field-read-error" /></div>
          ) : L ? (
            <div key={`view-${flip}`} className={flipClass}>
              <LeaguesView data={L} modeSwitch={modeSwitch} />
            </div>
          ) : null
        )}
        {mode === "cups" && (
          cups.error ? (
            <div className="mt-6">{modeSwitch}
              <ReadFailed what="cup fields" error={cups.error} testId="cups-read-error" /></div>
          ) : C ? (
            C.cups.length ? (
              <div key={`view-${flip}`} className={flipClass}>
                <CupsView data={C} initial={cupAsked} modeSwitch={modeSwitch}
                  active={mode === "cups"} />
              </div>
            ) : (
              <div className="mt-6">{modeSwitch}
                <p data-testid="cups-none" className="mt-6 text-[13px] text-ink-low">
                  The backend reports no measured cup field. That is a statement
                  that nobody has measured one, not that a cup has no clubs.
                </p></div>
            )
          ) : (
            <div className="mt-6">{modeSwitch}
              <div data-testid="cups-loading" className="mt-4"><SkeletonRows rows={8} height="h-9" /></div></div>
          )
        )}

        {mode === "nations" && (
          nations.error ? (
            <div className="mt-6">{modeSwitch}
              <ReadFailed what="national-team field" error={nations.error}
                testId="nations-read-error" /></div>
          ) : N ? (
            nComps.length ? (
              <div key={`view-${flip}`} className={flipClass}>
                <NationsView data={N} modeSwitch={modeSwitch}
                  active={mode === "nations"} />
              </div>
            ) : (
              <div className="mt-6">{modeSwitch}
                <p data-testid="nations-none" className="mt-6 text-[13px] text-ink-low">
                  The backend reports no national-team competition field. That
                  is a statement that none is measured, not that a competition
                  has no teams.
                </p></div>
            )
          ) : (
            <div className="mt-6">{modeSwitch}
              <div data-testid="nations-loading" className="mt-4"><SkeletonRows rows={8} height="h-9" /></div></div>
          )
        )}

        <Collapse eyebrow="legend" title="How to read a row" defaultOpen={false}
          className="mt-12 border-t border-line pt-5">
          <dl data-testid="field-legend"
            className="grid grid-cols-[auto_1fr] gap-x-[18px] gap-y-2.5 text-[13px]">
            {([
              ["bridges", <>Cross-league fixtures behind the rating.{" "}
                <b className="font-semibold text-ink-mid">Read it before the band.</b>{" "}
                The jackknife measures how much a rating moves when those fixtures
                are deleted, so a club that played none barely moves — and draws a
                tight interval for the one reason that should make you trust it
                least.</>],
              ["the pip", <>Its league&rsquo;s light when the rating rests on
                bridges; a <b className="font-semibold text-ink-mid">hollow ring</b>{" "}
                when it rests on none. The same mark the board uses for a club it
                could not place.</>],
              ["95% band", <>A delete-d jackknife
                {L?.jackknife_replicates != null ? ` over ${L.jackknife_replicates} replicates` : ""}.
                A row carries its own count — a club appears only in the replicates
                whose chain retained it
                {repLo != null && repHi != null
                  ? <>, and across this run those run <b className="font-semibold text-ink-mid">{repLo === repHi ? repLo : `${repLo}–${repHi}`}</b></>
                  : ""}.</>],
              ["interval", <>Every bar in a table is drawn on{" "}
                <b className="font-semibold text-ink-mid">one axis — the span of the
                rows that table shows</b> — so a bar&rsquo;s position can be read
                against any other in it. A club with no bridge gets no bar at all,
                only a hatch. In a one-league read the bar gives way to how much of
                its own league the interval spans.</>],
              ["tier", <>A quintile cut against that column&rsquo;s own
                current-season roster. A tier here is not a tier on another column,
                and never a verdict — it stays on the gray ladder. Where the
                interval reaches more than one tier the chip shows the range.</>],
              ["floor", <>A club below the preregistered floor is{" "}
                <b className="font-semibold text-ink-mid">marked and kept</b>, with
                its failing condition on the mark. When every club in a section is
                below it, that is said once, in the section&rsquo;s header.</>],
              ["passes", <>The multipass fit returns a different value at every
                pass count
                {mode !== "nations" && L?.published_sweep?.length ? ` in its published sweep (${L.published_sweep.join(", ")})` : ""},
                and the band widens with it. This {mode === "nations" ? "view" : "page"} reads{" "}
                <b className="font-semibold text-ink-mid">{mode === "nations"
                  ? N?.passes ?? "the pinned count" : L?.passes ?? "the pinned count"}</b>.
                Attack and defence come from a goals model with no pass count at
                all. A rating without its count is not a number.</>],
            ] as const).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="whitespace-nowrap pt-[3px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">{k}</dt>
                <dd className="text-ink-low">{v}</dd>
              </div>
            ))}
          </dl>
        </Collapse>

        <div className="mt-16 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-ink-faint">
          <p data-testid="field-charter">
            No model runs on this page and no number below is a probability or
            an edge of ours. Nothing here is a recommendation — the ordering
            says where to look, and you are the one who picks.
          </p>
          {L && (
            <p data-testid="field-source" className="mt-3">
              Read from <code className="text-ink-low">{L.source}</code>
              {L.slices_sha256 ? <> (sha256 {shortSha(L.slices_sha256)}, checked against the bundle&rsquo;s own SHA256SUMS)</> : null}
              , at <code className="text-ink-low">resolution_corpus.json:pinned_passes</code>{" "}
              = {L.passes}. A slice is a filter, not a refit. League hues are
              wayfinding and gold is the brand; neither is ever a verdict.
              Research surface: this page shows and does not decide.
            </p>
          )}
          {mode === "nations" && N && (
            <p data-testid="nations-source" className="mt-3">
              National teams read from <code className="text-ink-low">{N.source}</code>
              {N.field_sha256 ? <> (sha256 {shortSha(N.field_sha256)}, checked against the bundle&rsquo;s own SHA256SUMS)</> : null}
              {N.served_because ? <> &mdash; {N.served_because}</> : null}.
              Competition hues are wayfinding, never a verdict.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

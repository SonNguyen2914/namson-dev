// The picker board — namson.dev/bet-suggester
//
// The landing surface: every upcoming fixture across the four in-season
// leagues, ranked by the size of the measured table gap between the two
// clubs. Reads GET /api/picker/board, which serves src/picker.
//
// WHAT THIS PAGE IS ALLOWED TO SAY. It is a place to look, not a thing to
// do. No model runs on these fixtures, no probability of ours exists for
// them, and no number here is an edge — so nothing on this page may read
// as a recommendation, carry a confidence score, or imply a price is
// wrong. The picker RANKS, NEVER CUTS: there is no qualifying bar in the
// backend and this page adds none. The operator is the threshold.
//
// THREE THINGS THIS PAGE EXISTS TO KEEP VISIBLE, because each is a real
// finding that a plain sorted list would bury:
//
//  1. A row can rank first on the table gap and be HOLLOW underneath.
//     Tonight Barcelona leads at GD/g 1.63 with defence T1 v T1 — a
//     +0 gap. The three tier gaps therefore render as three separate
//     signed chips with a plain-English read beside them, not as one
//     shape word and three numbers to squint at.
//  2. "prior szn" is not a footnote. Under 8 games played, ALL FOUR
//     Stage 1 inputs come from last season, and tonight that is three
//     leagues out of four. It gets a banner and a per-row badge.
//  3. Refused fixtures are LISTED with their reason. A promoted club has
//     no row in last season's top-flight table; borrowing its
//     second-division numbers was measured dead (ledger row 20), so the
//     picker refuses BY NAME rather than imputing. A fixture that
//     vanishes silently is the defect the whole surface is built against.
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fmtDate, TZ } from "../../lib/matchday";
import {
  Board, BoardRefusal, BoardRow, TierPair,
  CURRENT_SEASON_GP_FLOOR, THIN_ASK_SIZE, WIDE_SPREAD_C,
  fetchBoard, leagueLabel,
} from "../../lib/pickerApi";
import { Eyebrow } from "../../components/ui";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import {
  Collapse, NavChip, RouteProgress, SkeletonRows, TopBar,
} from "../../components/chrome";

const WINDOWS = [1, 2, 3, 7, 14];   // the endpoint accepts 1..14
const DEFAULT_DAYS = 2;             // the endpoint's own default

// A signed integer gap. ZERO RENDERS AS "+0", deliberately: a bare "0"
// beside "+3" and "−1" reads as an absence of data rather than as a
// measured level, and level is the finding that matters most here.
const sign = (n: number) => (n < 0 ? `−${Math.abs(n)}` : `+${n}`);
// Same rule as `sign`: ZERO RENDERS SIGNED. This is the number the board
// is ORDERED by, and a bare "0.00" beside "+1.63" reads as missing data
// on the one row that exists to prove the picker never cuts.
const dec = (n: number, places = 2) =>
  (n < 0 ? "−" : "+") + Math.abs(n).toFixed(places);
const pair = (p: TierPair) => `T${p[0]} v T${p[1]}`;

/** The board's own ET date key, YYYYMMDD, made readable. Left as the raw
 *  key if it is ever any other shape — inventing a date from a string we
 *  do not recognise is worse than showing the string. */
const etDate = (d: string) =>
  /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d;

/** The word for a signed tier gap, from the favourite's side. A gap of
 *  zero is LEVEL, not "small" — the distinction is the whole point of
 *  the hollow read. */
const gapWord = (v: number) => (v > 0 ? "ahead" : v === 0 ? "level" : "behind");

/** One sentence a human can read without the legend. */
function shapeRead(r: BoardRow): string {
  const g = r.tier_gaps, t = r.tiers;
  if (r.shape === "CLEAN") {
    return "Clean — the favourite is a better tier overall, in attack and in defence.";
  }
  const flat: string[] = [];
  if (g.atk <= 0) flat.push(`${gapWord(g.atk)} in attack (${pair(t.atk)})`);
  if (g.def <= 0) flat.push(`${gapWord(g.def)} in defence (${pair(t.def)})`);
  if (g.ovr <= 0) flat.push(`${gapWord(g.ovr)} overall (${pair(t.ovr)})`);
  const strong: string[] = [];
  if (g.atk > 0) strong.push(`attack ${sign(g.atk)}`);
  if (g.def > 0) strong.push(`defence ${sign(g.def)}`);
  if (g.ovr > 0) strong.push(`overall ${sign(g.ovr)}`);
  if (r.shape === "HOLLOW") {
    return `Hollow — high on the table gap, but ${flat.join(" and ")}.`;
  }
  return `Split — the tier gap is ${strong.join(" and ")}; ${flat.join(" and ")}.`;
}

/** A signed tier gap, drawn so a zero cannot be mistaken for a small
 *  positive. Positive is the accent; LEVEL is amber and dashed; behind
 *  is the negative ink. */
function GapChip({ label, gap, tiers }: {
  label: string; gap: number; tiers: TierPair;
}) {
  const tone =
    gap > 0 ? "border-accent/40 bg-accent/5 text-accent"
    : gap === 0 ? "border-dashed border-warn/50 bg-warn/5 text-warn"
    : "border-neg/40 bg-neg/5 text-neg";
  return (
    <span data-testid="gap-chip" data-dim={label} data-gap={gap}
      className={`inline-flex min-w-[6.5rem] flex-col rounded-md border px-2 py-1 ${tone}`}>
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-[11px] tabular-nums">
        {pair(tiers)} <span className="font-semibold">{sign(gap)}</span>
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">
        {gapWord(gap)}
      </span>
    </span>
  );
}

function ShapeChip({ shape }: { shape: BoardRow["shape"] }) {
  const tone =
    shape === "CLEAN" ? "border-accent/50 bg-accent/10 text-accent"
    : shape === "HOLLOW" ? "border-neg/50 bg-neg/10 text-neg"
    : "border-warn/50 bg-warn/10 text-warn";
  return (
    <span className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}>
      {shape}
    </span>
  );
}

/** The favourite's Kalshi quote — annotation only. A row with no event,
 *  or an event with no live quote, STAYS on the board and says which of
 *  the two it is: "no kalshi event" and "listed · no quote" are different
 *  facts, and collapsing them into one blank hides a mapping failure. */
function KalshiCell({ row }: { row: BoardRow }) {
  const k = row.kalshi;
  if (!k) {
    return (
      <span className="font-mono text-[11px] text-ink-faint"
        title="no Kalshi event matched this fixture's date and both club names">
        no kalshi event
      </span>
    );
  }
  if (k.ask_c == null) {
    return (
      <span className="font-mono text-[11px] text-ink-faint">
        listed · no quote ·{" "}
        <span className="text-ink-faint/70">{k.event_ticker}</span>
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums text-ink-mid">
      <span className="text-ink-hi">ask {k.ask_c}¢</span>
      <span>spread {k.spread_c == null ? "—" : `${k.spread_c}¢`}</span>
      <span>size {k.ask_size == null ? "—" : k.ask_size}</span>
      {k.flags.map((f) => (
        <span key={f}
          title={f === "WIDE"
            ? `spread wider than ${WIDE_SPREAD_C}c`
            : f === "THIN" ? `ask size under ${THIN_ASK_SIZE}` : undefined}
          className="rounded border border-warn/50 bg-warn/5 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-warn">
          {f}
        </span>
      ))}
    </span>
  );
}

function RowCard({ row, rank }: { row: BoardRow; rank: number }) {
  const favHome = row.fav_side === "home";
  return (
    <article
      data-testid="picker-row"
      data-shape={row.shape}
      data-league={row.league}
      className="rounded-xl border border-line bg-elev/40 p-4 transition-colors hover:border-line-strong sm:p-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {String(rank).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low">
          {leagueLabel(row.league)}
        </span>
        {row.src === "prior" && (
          <span
            title="rated on last season's final table — this season has too few games played"
            className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
            prior szn
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-faint">
          {fmtDate(row.kickoff, "short")}
        </span>
      </div>

      {/* The fixture line is the way IN. A board of hand-picked matches
          you cannot open is a list of names — every dashboard already
          links this same id space (MlsDashboard.tsx:143). Wraps only the
          matchup, so the Stage-1/2 numbers below stay plain text. */}
      <Link
        href={`/bet-suggester/${row.league}/${row.event_id}`}
        aria-label={`open ${row.favourite} versus ${row.opponent}`}
        className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs">
        <span className="text-lg font-medium text-ink-hi">{row.favourite}</span>
        <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low"
          title={favHome ? "the favourite is at home" : "the favourite is away"}>
          {favHome ? "H" : "A"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          fav · rank {row.ranks.fav}
        </span>
        <span className="px-1 text-ink-faint">vs</span>
        <span className="text-base text-ink-mid">{row.opponent}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          rank {row.ranks.opp}
        </span>
        <span aria-hidden className="text-ink-faint transition-transform">→</span>
      </Link>

      {/* Stage 1 — the ranking inputs, favourite-signed */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[11px] tabular-nums">
        <span className="text-ink-low">
          GD/g gap{" "}
          <span className="text-base font-semibold text-ink-hi">
            {dec(row.gdg_gap)}
          </span>
        </span>
        <span className="text-ink-low">
          ppg gap <span className="text-ink-hi">{dec(row.ppg_gap)}</span>
        </span>
        <span className="text-ink-low">
          rank gap <span className="text-ink-hi">{sign(row.rank_gap)}</span>
        </span>
        <span className="text-ink-faint">
          gp {row.gp_current.home ?? "—"}/{row.gp_current.away ?? "—"}
        </span>
      </div>

      {/* Stage 2 — the three tier gaps, each drawn on its own */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <GapChip label="overall" gap={row.tier_gaps.ovr} tiers={row.tiers.ovr} />
        <GapChip label="attack" gap={row.tier_gaps.atk} tiers={row.tiers.atk} />
        <GapChip label="defence" gap={row.tier_gaps.def} tiers={row.tiers.def} />
        <ShapeChip shape={row.shape} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-low">
        {shapeRead(row)}
      </p>

      <div className="mt-3 border-t border-line pt-3">
        <KalshiCell row={row} />
      </div>
    </article>
  );
}

function RefusalRow({ r }: { r: BoardRefusal }) {
  return (
    <li data-testid="picker-refusal"
      className="rounded-lg border border-line bg-elev/30 px-3 py-2.5">
      <p className="text-sm text-ink-hi">
        {r.home} <span className="text-ink-faint">vs</span> {r.away}
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low">
          {leagueLabel(r.league)}
        </span>
      </p>
      <p className="mt-1 font-mono text-[11px] text-warn">
        {r.club} — {r.reason}
      </p>
    </li>
  );
}

export default function PickerBoard() {
  const router = useRouter();
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

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

  // The board's own order is |GD/g gap| descending. Re-applied here so
  // the page states the rule it renders by rather than inheriting it
  // silently — and so a reordered payload cannot quietly reorder the
  // board. It is a SORT, never a filter: every row served is drawn.
  const rows = [...(board?.rows ?? [])]
    .sort((a, b) => Math.abs(b.gdg_gap) - Math.abs(a.gdg_gap));
  const refusals = board?.refusals ?? [];
  const leagues = Object.entries(board?.leagues ?? {});
  const priorLeagues = leagues.filter(([, m]) => m.src === "prior");
  const failedLeagues = leagues.filter(([, m]) => m.error);
  const kalshiFailed = leagues.filter(([, m]) => m.kalshi_error);

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

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:pt-16">
        <Eyebrow tone="accent">picker · stage 1 + stage 2</Eyebrow>
        {/* "Hand-picked" read as a curated subset — the one phrase on the
            page that drifted from its own rule (RANKS, NEVER CUTS). */}
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
            <p className="mt-2 text-sm leading-relaxed text-ink-mid">
              {priorLeagues
                .map(([slug, m]) => `${leagueLabel(slug)} ${m.min_current_gp ?? "?"} GP`)
                .join(" · ")}
              {/* explicit {" "}: JSX ate the leading space of the text node
                  after this expression and shipped "Under 8games played" */}
              . Under {CURRENT_SEASON_GP_FLOOR}{" "}
              games played this season&apos;s table
              is noise, so all four ranking inputs — and the tiers below — come
              from last season&apos;s final table for those leagues. The rows say
              which.
            </p>
          </section>
        )}

        {/* -------------------- named upstream failures -------------------- */}
        {failedLeagues.length > 0 && (
          <section data-testid="league-errors"
            className="mt-4 rounded-xl border border-live/30 bg-live/5 p-4">
            <Eyebrow tone="live">leagues that could not be rated</Eyebrow>
            <ul className="mt-2 space-y-1">
              {failedLeagues.map(([slug, m]) => (
                <li key={slug} className="font-mono text-[11px] text-live">
                  {leagueLabel(slug)} — {m.error}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-low">
              These leagues contribute no fixtures below. The rest of the board
              is unaffected — the page is short, not wrong.
            </p>
          </section>
        )}
        {kalshiFailed.length > 0 && (
          <p className="mt-3 font-mono text-[11px] text-ink-low">
            kalshi unavailable for {kalshiFailed.map(([s]) => leagueLabel(s)).join(", ")} —
            prices are annotation here, so those fixtures are still ranked and listed.
          </p>
        )}

        {/* ---------------------------- the board ---------------------------- */}
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-6">
            <h2 className="text-lg font-medium text-ink-hi">
              Ranked by table gap
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              |GD/g gap| descending · no cut-off
            </p>
          </div>

          {loading ? (
            <SkeletonRows rows={4} height="h-32" />
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
          ) : rows.length === 0 ? (
            <div data-testid="board-empty"
              className="rounded-xl border border-line p-6">
              <p className="text-sm text-ink-mid">
                No fixtures in the next {days} day{days === 1 ? "" : "s"} across
                {" "}{leagues.length ? leagues.map(([s]) => leagueLabel(s)).join(", ") : "the four leagues"}.
              </p>
              <p className="mt-2 text-xs text-ink-low">
                {refusals.length > 0
                  ? `${refusals.length} fixture${refusals.length === 1 ? " was" : "s were"} refused — they are listed below with the reason.`
                  : "Widen the window above to look further ahead."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r, i) => (
                <RowCard key={`${r.league}-${r.event_id}`} row={r} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* --------------------------- refusals --------------------------- */}
        {refusals.length > 0 && (
          <section data-testid="refusals" className="mt-12 border-t border-line pt-6">
            <Eyebrow tone="warn">
              refused · {refusals.length} fixture{refusals.length === 1 ? "" : "s"}
            </Eyebrow>
            <h2 className="mt-2 text-lg font-medium text-ink-hi">
              Fixtures the picker would not rate
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-low">
              A club with no row in the table being used — a promoted side, most
              often — cannot be ranked against one that has a row. Its
              second-division numbers were measured as no help at all, so the
              picker refuses it by name instead of imputing a number, and the
              fixture is listed here rather than quietly dropped.
            </p>
            <ul className="mt-4 space-y-2">
              {refusals.map((r, i) => (
                <RefusalRow key={`${r.league}-${r.club}-${i}`} r={r} />
              ))}
            </ul>
          </section>
        )}

        {/* ------------------------ per-league basis ------------------------ */}
        {leagues.length > 0 && (
          <section className="mt-12 border-t border-line pt-6">
            <Eyebrow>what each league was rated on</Eyebrow>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {leagues.map(([slug, m]) => (
                <div key={slug}
                  className="flex flex-wrap items-baseline gap-x-2 rounded-lg border border-line px-3 py-2 font-mono text-[11px]">
                  <span className="text-ink-hi">{leagueLabel(slug)}</span>
                  {m.error ? (
                    <span className="text-live">{m.error}</span>
                  ) : (
                    <>
                      <span className={m.src === "prior" ? "text-warn" : "text-accent"}>
                        {m.src === "prior" ? "prior szn" : "this season"}
                      </span>
                      <span className="text-ink-faint">
                        min {m.min_current_gp ?? "—"} GP · {m.clubs} clubs
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

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
                  rank; conferences and groups are deliberately ignored. The board
                  is ordered by the absolute GD/g gap and by nothing else.
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

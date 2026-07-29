// Club Friendlies — a MARKET-WATCHING surface, deliberately modelless.
//
// No model runs here and none is planned — not dark, not pending: never.
// Rotation, arbitrary substitutions and low motivation make friendlies
// structurally worthless as forecast evidence, so this page shows live
// scores and raw Kalshi books, states that plainly, and stops. The
// market hunter owns structural findings across KXCLUBFGAME; this page
// links there rather than re-detecting anything.
//
// MARKET-IMPLIED PROBABILITIES (2026-07-29) do not soften that line.
// Son asked for predictions on friendlies; the platform cannot produce
// them, and the reason is structural: team ratings are
// competition-scoped (the backend's model fits on
// competition_slug="mls-2026", the only approved model) while friendlies
// span the global club universe, so zero of these clubs hold a rating
// anywhere in the system. What the page CAN show is the probability set
// the exchange's own asks imply once the overround is stripped out —
// authored by the book, not by this site.
//
// The labelling is therefore the feature, not decoration:
//   - "market-implied · vig stripped", attributed to Kalshi and to the
//     time WE read it. Never "prediction", "forecast", "model", "edge",
//     or "fair value" — inside this block those words would relabel
//     someone else's arithmetic as our claim. Asserted statically over
//     the rendered output in e2e/friendlies.spec.ts.
//   - the vig removed and the per-leg spreads render BESIDE the
//     percentages, so a reader sees the width of the number instead of a
//     clean figure that hides it.
//   - the fee-adjusted breakeven renders too, and is the honest part: it
//     shows the implied percentage is NOT a price anyone can get.
//   - a stale book's numbers are visibly stale; an incomplete book shows
//     no probabilities at all, and a below-$1 book shows the anomaly in
//     words with nothing normalized.
import Link from "next/link";
import { useEffect, useState } from "react";
import { dayKeyOf, dayLabel, fmtDate, groupByDay, localDay } from "../lib/matchday";
import { Eyebrow, Reveal } from "./ui";

type Side = { name?: string; short?: string; abbrev?: string; logo?: string;
  score?: string; record?: string };
type Fixture = { id: string; date: string; state: "pre" | "in" | "post" | null;
  detail?: string; minute?: string; venue?: string; home: Side; away: Side };
type BookRow = { ticker: string; label?: string; yes_ask?: string;
  yes_bid?: string; status?: string };
type GameBook = { event_ticker: string; title?: string; markets: BookRow[] };
type Freshness = { state?: string; age_seconds?: number } | null;
// The market-implied block, exactly as the backend serves it. Every
// numeric field is a STRING because the backend computes in exact
// Decimal — parsing to a float here is for display only, and never
// feeds another calculation.
type ImpliedLeg = { ticker?: string; label?: string; is_draw?: boolean;
  ask_dollars?: string | null; bid_dollars?: string | null;
  spread_dollars?: string | null; implied_probability?: string | null;
  fee_dollars?: string | null; cost_dollars?: string | null;
  breakeven_probability?: string | null };
type Implied = {
  state: "priced" | "sum_below_one" | "incomplete";
  reason?: string | null;
  basis?: string; method?: string | null;
  legs: ImpliedLeg[];
  sum_ask_dollars?: string | null; sum_bid_dollars?: string | null;
  overround_dollars?: string | null; shortfall_dollars?: string | null;
  sum_implied_probability?: string | null;
  fee_reference_contracts?: number; fee_policy_version?: string;
  freshness?: Freshness; captured_at?: string | null;
  attribution?: string;
} | null;
type MappedRow = { fixture_id?: string; home?: string; away?: string;
  status: "mapped" | "unmapped" | "ambiguous" | "no_open_markets"
    | "unresolved_name" | "unavailable" | "registry_incomplete";
  book: GameBook | null; candidates: string[]; freshness?: Freshness;
  implied?: Implied };
type Listed = { count?: number; truncated?: boolean; complete?: boolean };

const j = (r: Response) => (r.ok ? r.json() : Promise.reject(r.status));

export default function FriendliesDashboard() {
  const [today, setToday] = useState<Fixture[] | null>(null);
  const [week, setWeek] = useState<Fixture[] | null>(null);
  const [maps, setMaps] = useState<Record<string, MappedRow>>({});
  const [listed, setListed] = useState<Listed | null>(null);
  // 404 means the deployed backend does not serve /api/friendlies yet —
  // this page can be ahead of the API it reads. Say so in words instead
  // of skeleton-loading forever.
  const [notDeployed, setNotDeployed] = useState(false);
  const [unreachable, setUnreachable] = useState(false);
  // The market hunter is a separate surface that may not be deployed on
  // this build: link to it only when its API actually answers, so the
  // page never points at a 404 (probed once, client-side).
  const [hunterUp, setHunterUp] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/hunter/findings")
      .then((r) => { if (alive) setHunterUp(r.ok); })
      .catch(() => { if (alive) setHunterUp(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/friendlies/scoreboard")
        .then((r) => {
          if (r.status === 404) { if (alive) setNotDeployed(true); return null; }
          return j(r);
        })
        .then((d) => { if (alive && d) { setToday(d.fixtures); setUnreachable(false); } })
        .catch(() => { if (alive && today === null) setUnreachable(true); });
      fetch("/api/friendlies/markets").then(j)
        .then((d) => {
          if (!alive) return;
          const m: Record<string, MappedRow> = {};
          for (const row of d.fixtures ?? []) {
            if (row.fixture_id) m[row.fixture_id] = row;
          }
          setMaps(m);
          setListed(d.listed ?? null);
        }).catch(() => {});
    };
    load();
    fetch("/api/friendlies/schedule?days=7").then(j)
      .then((d) => alive && setWeek(d.fixtures)).catch(() => {});
    const poll = setInterval(load, 60000);
    return () => { alive = false; clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The heading is DERIVED from the fixtures (ESPN's bucket is a
  // matchday, not a calendar day) and fixtures group by LOCAL day —
  // both rules imported from lib/matchday, not re-derived.
  const days = today ? groupByDay(today) : [];
  const allToday = days.length === 0
    || days.every((g) => localDay(g.list[0].date) === dayKeyOf(new Date()));
  const showDayLabels = days.length > 1 || !allToday;

  if (notDeployed) {
    return (
      <Notice>
        The deployed backend does not serve the friendlies API yet
        (/api/friendlies returned 404). This page is ahead of the API it
        reads — nothing is broken, and nothing is being estimated in the
        meantime.
      </Notice>
    );
  }
  if (unreachable && today === null) {
    return (
      <Notice>
        Backend unreachable — no fixtures or books to show. This page
        renders provider data only; it never fills gaps with estimates.
      </Notice>
    );
  }

  return (
    <div className="space-y-14">
      {/* The framing IS the feature: what this surface is, and is not. */}
      <Reveal>
        <section className="rounded-3xl border border-line bg-elev px-6 py-8">
          <Eyebrow tone="accent">market-watching surface</Eyebrow>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-hi">
            Friendlies get live scores and raw Kalshi books — and that is
            the whole page. <strong>No model runs here, and none is
            planned</strong>: rotation, arbitrary substitutions and low
            motivation make friendlies structurally worthless as forecast
            evidence, so no predictions, no shadow odds and no locks
            exist on this surface.
          </p>
          {/* The addition that keeps the scope line true rather than
              contradicted: a matched book also gets the probabilities IT
              implies. Those are the market's view of the match. This site
              performs the arithmetic and is not the author of the
              numbers — the distinction the whole surface rests on. */}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-hi">
            Where a book matches a fixture, the card also shows the
            probabilities <strong>that book implies</strong> once the
            exchange&apos;s margin is stripped out.{" "}
            <strong>Those are the market&apos;s own view, not this
            site&apos;s</strong> — arithmetic on prices Kalshi set, shown
            with the margin removed and the spread left visible.
          </p>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink-low">
            Prices are the exchange&apos;s own, shown ask / bid —
            observational, not advice.{" "}
            {hunterUp ? (
              <>
                <Link href="/bet-suggester/hunter"
                  className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
                  Structural findings across these markets live in the
                  market hunter
                </Link>, not here.
              </>
            ) : (
              <>Structural findings across these markets belong to the
              market hunter, not here.</>
            )}
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">espn · live data</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">
            {allToday ? "Today's friendlies" : "Next friendlies"}{" "}
            <span className="text-sm font-normal text-ink-low">
              · ESPN club.friendly feed, 60s poll
            </span>
          </h3>
          {today === null ? (
            <Empty>loading fixtures…</Empty>
          ) : days.length === 0 ? (
            <Empty>no club friendlies in ESPN&apos;s bucket</Empty>
          ) : (
            <div className="space-y-8">
              {days.map((g) => (
                <div key={g.key}>
                  {showDayLabels && (
                    <h4 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                      {dayLabel(g.list[0].date)}
                    </h4>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {g.list.map((f) => (
                      <FixtureCard key={f.id} f={f} m={maps[f.id]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {listed?.count != null && (
            <p className="mt-6 max-w-2xl text-xs leading-relaxed text-ink-low">
              {listed.complete === false ? (
                // a failed registry page makes the count a FLOOR — say
                // so rather than presenting a partial census as the
                // census (P0-2)
                <>Kalshi census incomplete — a fetch failed partway, so{" "}
                {`${listed.count} club-friendly match events`}
                {" "}listed is a floor, not the count. </>
              ) : (
                <>Kalshi lists{" "}
                {`${listed.count}${listed.truncated ? "+" : ""} club-friendly match events`}
                {" "}— far more than ESPN&apos;s bucket carries. </>
              )}
              Books shown above are only those matched to an ESPN fixture
              by date and both team names
              {hunterUp ? (
                <>; the rest are visible from the{" "}
                <Link href="/bet-suggester/hunter"
                  className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
                  market hunter
                </Link>.</>
              ) : (
                <>.</>
              )}
            </p>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">next seven days</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">Fixtures</h3>
          {week === null ? (
            <Empty>loading schedule…</Empty>
          ) : week.length === 0 ? (
            <Empty>no club friendlies in the next seven days</Empty>
          ) : (
            <div className="divide-y divide-line rounded-2xl border border-line">
              {week.slice(0, 40).map((f) => (
                <div key={f.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                    {fmtDate(f.date)}
                  </span>
                  <span className="flex-1 truncate text-ink-hi">
                    {f.home.short || f.home.name}
                    <span className="text-ink-faint"> vs </span>
                    {f.away.short || f.away.name}
                  </span>
                  <span className="hidden truncate font-mono text-[10px] text-ink-faint sm:block">
                    {f.venue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm leading-relaxed text-ink-low">
      {children}
    </p>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
      {children}
    </p>
  );
}

function TeamLine({ s, live }: { s: Side; live: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2">
        {s.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logo} alt="" className="h-5 w-5 shrink-0 object-contain" />
        )}
        <span className="truncate text-sm text-ink-hi">{s.name}</span>
      </span>
      <span className={`font-mono text-sm tabular-nums ${
        live ? "text-accent" : "text-ink-hi"}`}>{s.score}</span>
    </div>
  );
}

// The fixture's Kalshi state, in words when there is no price to show —
// and each non-priced state is a DIFFERENT set of words, because they
// are different truths (review P0-1/P0-2, 2026-07-29):
//   unmapped            no listed event matched at all
//   ambiguous           more than one matched; picking one silently is
//                       the bug this surface exists to avoid
//   unresolved_name     one candidate, but only a near-miss name match
//                       (B-team shape) — never priced on a guess
//   no_open_markets     the book was FETCHED and nothing trades
//   unavailable         the fetch FAILED — "couldn't look" is not
//                       "closed"
//   registry_incomplete the event registry itself was partial — absence
//                       cannot be claimed
// A mapped-but-stale book prices WITH its age on display.
function StateLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
      {children}
    </p>
  );
}

function BookState({ m }: { m?: MappedRow }) {
  if (!m) {
    return <StateLine>kalshi state unknown — no mapping data</StateLine>;
  }
  switch (m.status) {
    case "ambiguous":
      return (
        <StateLine>
          ambiguous kalshi match ({m.candidates.length} candidates) — not
          guessing, no price shown
        </StateLine>
      );
    case "unresolved_name":
      return (
        <StateLine>
          name not exact on kalshi ({m.candidates[0] ?? "candidate"}) —
          not pricing a near-miss
        </StateLine>
      );
    case "unavailable":
      return (
        <StateLine>
          kalshi book unavailable — fetch failed, no claim about the book
        </StateLine>
      );
    case "registry_incomplete":
      return (
        <StateLine>
          kalshi registry incomplete — couldn&apos;t check this fixture
        </StateLine>
      );
    case "no_open_markets":
      return <StateLine>kalshi book closed — nothing trades</StateLine>;
    case "unmapped":
      return <StateLine>no kalshi book matched</StateLine>;
  }
  if (!m.book) {
    // an unknown status never masquerades as an absence claim
    return <StateLine>kalshi state unknown — no mapping data</StateLine>;
  }
  const stale = m.freshness?.state === "stale";
  return (
    <div className="mt-2 space-y-1 rounded-lg bg-accent/10 px-2 py-1.5">
      {m.book.markets.map((r) => (
        <div key={r.ticker}
          className="flex items-center justify-between font-mono text-[10px]">
          <span className="truncate text-ink-low">{r.label}</span>
          <span className="tabular-nums">
            <span className="text-ink-hi">{cents(r.yes_ask)}</span>
            <span className="text-ink-faint"> / {cents(r.yes_bid)}</span>
          </span>
        </div>
      ))}
      <p className="pt-0.5 text-right font-mono text-[9px] uppercase tracking-wide text-ink-faint">
        {stale && (
          <span className="mr-2 rounded bg-elev px-1 py-0.5 text-live">
            stale · {m.freshness?.age_seconds ?? "?"}s old
          </span>
        )}
        ask / bid · exchange prices, not advice
      </p>
      <MarketImplied imp={m.implied} />
    </div>
  );
}

// What the book itself implies, with the exchange's margin removed.
//
// This is ARITHMETIC ON OBSERVED PRICES and the copy has to keep saying
// so — inside this block the words "prediction", "forecast", "model",
// "edge" and "fair value" are banned, because any of them would relabel
// Kalshi's numbers as ours. The framing block above carries the fuller
// statement (and is where the phrase "no model runs here" belongs).
//
// Each non-priced state renders DIFFERENT words and no percentages:
//   incomplete     the arithmetic's preconditions were not met (a
//                  missing leg, an empty ask side, an unproven 3-way).
//                  A 2-way is never renormalized — that would invent a
//                  draw price.
//   sum_below_one  asks summing under $1 are a structural anomaly, not
//                  a probability set. Nothing is normalized, and the
//                  finding itself belongs to the market hunter.
function MarketImplied({ imp }: { imp?: Implied }) {
  if (!imp) return null;
  if (imp.state === "incomplete") {
    return (
      <p data-testid="market-implied"
        className="mt-1.5 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
        book incomplete ({incompleteWords(imp.reason)}) — no implied
        probabilities computed
      </p>
    );
  }
  if (imp.state === "sum_below_one") {
    return (
      <p data-testid="market-implied"
        className="mt-1.5 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
        asks sum to {cents(imp.sum_ask_dollars)} — under $1, a structural
        anomaly rather than a probability set. nothing normalized.
      </p>
    );
  }
  const stale = imp.freshness?.state === "stale";
  const spreads = imp.legs
    .map((l) => centNumber(l.spread_dollars))
    .filter((n): n is number => n !== null);
  // min/max, not first/last: the widest leg is the one that matters and
  // book order is the provider's, not sorted
  const lo = spreads.length ? Math.min(...spreads) : null;
  const hi = spreads.length ? Math.max(...spreads) : null;
  return (
    <div data-testid="market-implied"
      className="mt-1.5 rounded-lg border border-line px-2 py-1.5">
      <p className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wide text-ink-faint">
        <span>market-implied · vig stripped</span>
        <span>{stale ? "" : "implied / breakeven"}</span>
        {stale && (
          <span className="rounded bg-elev px-1 py-0.5 text-live">
            stale book · {imp.freshness?.age_seconds ?? "?"}s old
          </span>
        )}
      </p>
      {imp.legs.map((leg) => (
        <div key={leg.ticker}
          className="flex items-center justify-between font-mono text-[10px]">
          <span className="truncate text-ink-low">{leg.label}</span>
          <span className="tabular-nums">
            <span className="text-ink-hi">{pct(leg.implied_probability)}</span>
            <span className="text-ink-faint">
              {" "}/ {cents(leg.breakeven_probability)}
            </span>
          </span>
        </div>
      ))}
      {/* the width of the number, beside the number */}
      <p className="pt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
        {cents(imp.overround_dollars)} of margin removed from{" "}
        {cents(imp.sum_ask_dollars)} of asks
        {lo !== null && hi !== null && (
          <> · spreads {lo === hi ? `${lo}¢` : `${lo}–${hi}¢`}</>
        )}
      </p>
      <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
        breakeven = ask + kalshi&apos;s taker fee on a{" "}
        {imp.fee_reference_contracts ?? 100}-contract order, so the
        implied percentages are not prices anyone can get.
      </p>
      <p className="font-mono text-[9px] leading-relaxed text-ink-faint">
        kalshi&apos;s own asks{readAt(imp.captured_at)} · this site does
        the arithmetic, not the pricing — observational, not advice.
      </p>
    </div>
  );
}

function incompleteWords(reason?: string | null) {
  switch (reason) {
    case "leg_count": return "not three legs";
    case "partition_unproven": return "3-way structure unproven";
    case "missing_ask": return "a leg has no ask";
    case "book_unavailable": return "book could not be read";
    default: return "no book";
  }
}

// Local time of OUR read, never the exchange's: Kalshi publishes no
// quote timestamp (its updated_time is the market-definition clock and
// has been seen ~30h stale on live markets). Rendered from fetched data
// only, so it cannot mismatch SSR.
function readAt(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `, read ${d.toLocaleTimeString()}`;
}

function FixtureCard({ f, m }: { f: Fixture; m?: MappedRow }) {
  const live = f.state === "in";
  // A finished match keeps its result detail (FT); anything not yet
  // under way shows WHEN it kicks off (local time — rendered only
  // client-side after fetch, so it cannot mismatch SSR).
  const when = f.state === "post"
    ? f.detail
    : (fmtDate(f.date, "short") || f.detail);
  return (
    <div className={`rounded-xl border p-3 ${
      live ? "glow glow-accent border-accent/40 bg-elev" : "border-line"}`}>
      <TeamLine s={f.home} live={live} />
      <div className="my-1.5 h-px bg-line" />
      <TeamLine s={f.away} live={live} />
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        <span className={live ? "text-accent" : undefined}>
          {live ? `LIVE ${f.minute ?? ""}` : when}
        </span>
        <span className="truncate pl-2">{f.venue}</span>
      </div>
      <BookState m={m} />
    </div>
  );
}

function cents(v?: string | null) {
  const n = v ? Math.round(parseFloat(v) * 100) : NaN;
  return Number.isFinite(n) ? `${n}¢` : "—";
}

// Same conversion, as a number, for the spread range. Null (not NaN)
// when absent, so an unpriced side cannot become a 0¢ spread.
function centNumber(v?: string | null) {
  if (v === null || v === undefined) return null;
  const n = Math.round(parseFloat(v) * 100);
  return Number.isFinite(n) ? n : null;
}

// A market-implied probability, display-only. One decimal: the exact
// set is guaranteed to sum to 1 by the backend, and rounding for display
// never feeds another calculation.
function pct(v?: string | null) {
  const n = v ? parseFloat(v) * 100 : NaN;
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : "—";
}

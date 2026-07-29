// Club Friendlies — a MARKET-WATCHING surface, deliberately modelless.
//
// No model runs here and none is planned — not dark, not pending: never.
// Rotation, arbitrary substitutions and low motivation make friendlies
// structurally worthless as forecast evidence, so this page shows live
// scores and raw Kalshi books, states that plainly, and stops. The
// market hunter owns structural findings across KXCLUBFGAME; this page
// links there rather than re-detecting anything.
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
type MappedRow = { fixture_id?: string; home?: string; away?: string;
  status: "mapped" | "unmapped" | "ambiguous" | "no_open_markets";
  book: GameBook | null; candidates: string[] };
type Listed = { count?: number; truncated?: boolean };

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
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink-low">
            Prices are the exchange&apos;s own, shown ask / bid —
            observational, not advice.{" "}
            <Link href="/bet-suggester/hunter"
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
              Structural findings across these markets live in the market
              hunter
            </Link>, not here.
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
              Kalshi lists{" "}
              {`${listed.count}${listed.truncated ? "+" : ""} club-friendly match events`}
              {" "}— far more than ESPN&apos;s bucket carries. Books shown above are
              only those matched to an ESPN fixture by date and both team
              names; the rest are visible from the{" "}
              <Link href="/bet-suggester/hunter"
                className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
                market hunter
              </Link>.
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

// The fixture's Kalshi state, in words when there is no book to show.
// An ambiguous match REFUSES to render a price: two same-day titles
// matched this fixture's names and picking one silently is exactly the
// bug this surface exists to avoid.
function BookState({ m }: { m?: MappedRow }) {
  if (!m) {
    return (
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        no kalshi book matched
      </p>
    );
  }
  if (m.status === "ambiguous") {
    return (
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        ambiguous kalshi match ({m.candidates.length} candidates) — not
        guessing, no price shown
      </p>
    );
  }
  if (m.status === "no_open_markets") {
    return (
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        kalshi book closed
      </p>
    );
  }
  if (m.status !== "mapped" || !m.book) {
    return (
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        no kalshi book matched
      </p>
    );
  }
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
        ask / bid · exchange prices, not advice
      </p>
    </div>
  );
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

function cents(v?: string) {
  const n = v ? Math.round(parseFloat(v) * 100) : NaN;
  return Number.isFinite(n) ? `${n}¢` : "—";
}

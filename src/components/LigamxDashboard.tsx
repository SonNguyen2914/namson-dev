// Liga MX dashboard — split-season league surface (Jul 29, 2026).
// Live ESPN fixtures/scores/standings for mex.1, Kalshi's real
// KXLIGAMXGAME 3-way books (both sides shown — ask to buy, bid to
// exit). The MODEL IS DARK: liga-mx-2026-v0 is unapproved, no odds
// exist server-side, and this surface says so in words instead of
// rendering a zero that could read as a forecast. SPLIT SEASONS:
// Apertura and Clausura are separate tournaments with separate tables —
// every standings table carries the tournament ESPN names, and the
// header states which tournament is being served.
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eyebrow, Reveal } from "./ui";

type Side = { name?: string; short?: string; abbrev?: string; logo?: string;
  score?: string; record?: string };
type Fixture = { id: string; date: string; state: "pre" | "in" | "post" | null;
  detail?: string; minute?: string; venue?: string; tournament?: string | null;
  home: Side; away: Side };
type StandingEntry = { team: string; abbrev?: string; rank?: number;
  played?: number; wins?: number; losses?: number; ties?: number;
  points?: number; goal_diff?: number };
type TournamentTable = { table: string; tournament: string;
  entries: StandingEntry[] };
type BookRow = { ticker: string; label?: string; yes_ask?: string;
  yes_bid?: string; status?: string };
type GameBook = { event_ticker: string; title?: string; markets: BookRow[] };
type OddsRow = { espn_event_id: string; run_type?: string; locked?: boolean;
  outcomes?: Record<string, number> };
type Tournament = { name?: string; label?: string;
  season_display?: string } | null;

const j = (r: Response) => (r.ok ? r.json() : Promise.reject(r.status));

export default function LigamxDashboard() {
  const [today, setToday] = useState<Fixture[] | null>(null);
  const [week, setWeek] = useState<Fixture[] | null>(null);
  const [tables, setTables] = useState<TournamentTable[] | null>(null);
  const [books, setBooks] = useState<GameBook[] | null>(null);
  const [odds, setOdds] = useState<Record<string, OddsRow>>({});
  const [tournament, setTournament] = useState<Tournament>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/ligamx/scoreboard").then(j)
        .then((d) => {
          if (!alive) return;
          setToday(d.fixtures);
          if (d.tournament) setTournament(d.tournament);
        }).catch(() => {});
      fetch("/api/ligamx/markets").then(j)
        .then((d) => alive && setBooks(d.games)).catch(() => {});
      fetch("/api/ligamx/odds").then(j)
        .then((d) => {
          if (!alive) return;
          const map: Record<string, OddsRow> = {};
          for (const o of d.odds ?? []) map[o.espn_event_id] = o;
          setOdds(map);
        }).catch(() => {});
    };
    load();
    fetch("/api/ligamx/schedule?days=7").then(j)
      .then((d) => alive && setWeek(d.fixtures)).catch(() => {});
    fetch("/api/ligamx/standings").then(j)
      .then((d) => alive && setTables(d.tables)).catch(() => {});
    const poll = setInterval(load, 60000);
    return () => { alive = false; clearInterval(poll); };
  }, []);

  // ESPN's scoreboard bucket is a MATCHDAY, not a calendar day: when
  // nothing is on today it returns the next one instead. So the heading
  // is derived from the fixtures rather than asserted — the same rule as
  // deriving a result letter from the score beside it. Grouping is by
  // LOCAL day: an evening slate straddles two UTC dates (Liga MX
  // kickoffs routinely cross midnight UTC) but is one evening to the
  // viewer, and splitting it would be an artefact of the wire format.
  const days = today ? groupByDay(today) : [];
  const allToday = days.length === 0
    || days.every((g) => localDay(g.list[0].date) === dayKeyOf(new Date()));
  const showDayLabels = days.length > 1 || !allToday;

  return (
    <div className="space-y-14">
      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">
            {tournament?.label
              ? `${tournament.label.toLowerCase()} · live data`
              : "tonight · live data"}
          </Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">
            {allToday ? "Today's slate" : "Next matchday"}{" "}
            <span className="text-sm font-normal text-ink-low">
              · ESPN live feed, 60s poll
            </span>
          </h3>
          {today === null ? (
            <Empty>loading fixtures…</Empty>
          ) : days.length === 0 ? (
            <Empty>no Liga MX fixtures scheduled</Empty>
          ) : (
            <div className="space-y-8">
              {days.map((g) => (
                <div key={g.key}>
                  {showDayLabels && (
                    <h4 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                      {dayLabel(g.list[0].date)}
                    </h4>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {g.list.map((f) => (
                      <FixtureCard key={f.id} f={f} o={odds[f.id]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">kalshi · real books</Eyebrow>
          <h3 className="mb-2 text-lg font-medium text-ink-hi">
            Match markets{" "}
            <span className="text-sm font-normal text-ink-low">
              · KXLIGAMXGAME three-way, ask / bid
            </span>
          </h3>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-ink-low">
            Raw exchange prices only. liga-mx-2026-v0 is <em>dark</em> —
            scaffolded but unapproved, so no model number exists or
            renders anywhere on this surface until it earns approval
            through prospective evaluation. Nothing here is a
            recommendation, and real-money signals are disabled
            server-side.
          </p>
          {books === null ? (
            <Empty>loading books…</Empty>
          ) : books.length === 0 ? (
            <Empty>no open Liga MX books right now</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((g) => <BookCard key={g.event_ticker} g={g} />)}
            </div>
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
            <Empty>no fixtures in the next seven days</Empty>
          ) : (
            <div className="divide-y divide-line rounded-2xl border border-line">
              {week.slice(0, 30).map((f) => (
                <Link key={f.id} href={`/bet-suggester/ligamx/${f.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/5">
                  <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                    {fmtDate(f.date)}
                  </span>
                  <span className="flex-1 truncate text-ink-hi">
                    {f.home.short || f.home.name}
                    <span className="text-ink-faint"> vs </span>
                    {f.away.short || f.away.name}
                  </span>
                  {odds[f.id]?.outcomes && (
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-low"
                      title="liga-mx-2026-v0 shadow odds — not advice">
                      {Math.round((odds[f.id].outcomes!.home_win ?? 0) * 100)}
                      /{Math.round((odds[f.id].outcomes!.draw ?? 0) * 100)}
                      /{Math.round((odds[f.id].outcomes!.away_win ?? 0) * 100)}
                    </span>
                  )}
                  <span className="hidden truncate font-mono text-[10px] text-ink-faint sm:block">
                    {f.venue}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">
            {tournament?.name
              ? `the table · ${tournament.name.toLowerCase()}`
              : "the table"}
          </Eyebrow>
          <h3 className="mb-2 text-lg font-medium text-ink-hi">Standings</h3>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-ink-low">
            Liga MX plays two tournaments a season — Apertura (Jul–Dec)
            and Clausura (Jan–May), each with its own table and its own
            Liguilla. Every table below is labelled with the tournament
            ESPN itself names; a tournament that has not kicked off shows
            no table at all.
          </p>
          {tables === null ? (
            <Empty>loading standings…</Empty>
          ) : tables.length === 0 ? (
            <Empty>no tournament has produced a result yet</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {tables.map((t) => <TournamentStandings key={t.table} t={t} />)}
            </div>
          )}
        </section>
      </Reveal>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
      {children}
    </p>
  );
}

// One date formatter for the whole dashboard, in the VIEWER's timezone.
// Local calendar-day identity. Deliberately not the ISO date: the wire
// format is UTC, and Liga MX's 01:00Z/03:00Z kickoffs are the previous
// evening everywhere in the Americas.
const dayKeyOf = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function localDay(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dayKeyOf(d);
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long", month: "short", day: "numeric",
  });
}

function groupByDay(fixtures: Fixture[]) {
  const groups = new Map<string, Fixture[]>();
  for (const f of [...fixtures].sort((a, b) => a.date.localeCompare(b.date))) {
    const list = groups.get(localDay(f.date));
    if (list) list.push(f);
    else groups.set(localDay(f.date), [f]);
  }
  return [...groups.entries()].map(([key, list]) => ({ key, list }));
}

function fmtDate(iso?: string, month: "short" | "numeric" = "numeric") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short", month, day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
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
        {s.record && (
          <span className="font-mono text-[10px] text-ink-faint">{s.record}</span>
        )}
      </span>
      <span className={`font-mono text-sm tabular-nums ${
        live ? "text-accent" : "text-ink-hi"}`}>{s.score}</span>
    </div>
  );
}

function OddsChip({ o }: { o?: OddsRow }) {
  const p = o?.outcomes;
  if (!p) return null;
  const pct = (k: string) =>
    p[k] != null ? `${Math.round(p[k] * 100)}` : "—";
  return (
    <div className="mt-2 flex items-center justify-between rounded-lg bg-accent/10 px-2 py-1 font-mono text-[10px] tabular-nums">
      <span className="text-ink-low">
        H {pct("home_win")} · D {pct("draw")} · A {pct("away_win")}
      </span>
      <span className="uppercase tracking-wide text-ink-faint">
        {o?.locked ? "t-10 lock" : "shadow"}
      </span>
    </div>
  );
}

function FixtureCard({ f, o }: { f: Fixture; o?: OddsRow }) {
  const live = f.state === "in";
  // A finished match keeps its result detail (FT); anything not yet
  // under way shows WHEN it kicks off — the derived-heading rule's card
  // twin ("Scheduled" said nothing). Local time is safe here: every
  // fixture is fetched in useEffect, so these cards only ever render
  // client-side and cannot mismatch SSR.
  const when = f.state === "post"
    ? f.detail
    : (fmtDate(f.date, "short") || f.detail);
  return (
    <Link href={`/bet-suggester/ligamx/${f.id}`}
      className={`block cursor-pointer rounded-xl border p-3 transition-colors hover:border-accent/50 ${
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
      <OddsChip o={o} />
    </Link>
  );
}

function BookCard({ g }: { g: GameBook }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="mb-2 truncate text-sm text-ink-hi">{g.title}</p>
      <div className="space-y-1">
        {g.markets.map((m) => (
          <div key={m.ticker}
            className="flex items-center justify-between font-mono text-[11px]">
            <span className="truncate text-ink-low">{m.label}</span>
            <span className="tabular-nums">
              <span className="text-ink-hi">{cents(m.yes_ask)}</span>
              <span className="text-ink-faint"> / {cents(m.yes_bid)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function cents(v?: string) {
  const n = v ? Math.round(parseFloat(v) * 100) : NaN;
  return Number.isFinite(n) ? `${n}¢` : "—";
}

function TournamentStandings({ t }: { t: TournamentTable }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <p className="border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        {t.tournament || t.table}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="font-mono text-[10px] uppercase text-ink-faint">
            <th className="px-3 py-1.5 text-left">#</th>
            <th className="px-3 py-1.5 text-left">club</th>
            <th className="px-2 py-1.5 text-right">gp</th>
            <th className="px-2 py-1.5 text-right">w</th>
            <th className="px-2 py-1.5 text-right">l</th>
            <th className="px-2 py-1.5 text-right">t</th>
            <th className="px-2 py-1.5 text-right">gd</th>
            <th className="px-3 py-1.5 text-right">pts</th>
          </tr>
        </thead>
        <tbody>
          {t.entries.map((e) => (
            <tr key={e.team} className="border-t border-line/60">
              <td className="px-3 py-1.5 font-mono text-[11px] text-ink-faint">{e.rank}</td>
              <td className="px-3 py-1.5 text-ink-hi">{e.team}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.played}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.wins}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.losses}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.ties}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.goal_diff}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums text-accent">{e.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

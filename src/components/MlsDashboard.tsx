// MLS dashboard — the first next-league surface (Jul 22, 2026).
// Data only, honestly labeled: live ESPN fixtures/scores/standings and
// Kalshi's real KXMLSGAME 3-way books (both sides shown — ask to buy,
// bid to exit). No model numbers yet: the engine adaptation follows the
// V7 Part H acceptance gates, and this page never pretends otherwise.
import { useEffect, useState } from "react";
import { Eyebrow, Reveal } from "./ui";

type Side = { name?: string; short?: string; abbrev?: string; logo?: string;
  score?: string; record?: string };
type Fixture = { id: string; date: string; state: "pre" | "in" | "post" | null;
  detail?: string; minute?: string; venue?: string; home: Side; away: Side };
type StandingEntry = { team: string; abbrev?: string; rank?: number;
  played?: number; wins?: number; losses?: number; ties?: number;
  points?: number; goal_diff?: number };
type Conference = { conference: string; entries: StandingEntry[] };
type BookRow = { ticker: string; label?: string; yes_ask?: string;
  yes_bid?: string; status?: string };
type GameBook = { event_ticker: string; title?: string; markets: BookRow[] };

const j = (r: Response) => (r.ok ? r.json() : Promise.reject(r.status));

export default function MlsDashboard() {
  const [today, setToday] = useState<Fixture[] | null>(null);
  const [week, setWeek] = useState<Fixture[] | null>(null);
  const [tables, setTables] = useState<Conference[] | null>(null);
  const [books, setBooks] = useState<GameBook[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/mls/scoreboard").then(j)
        .then((d) => alive && setToday(d.fixtures)).catch(() => {});
      fetch("/api/mls/markets").then(j)
        .then((d) => alive && setBooks(d.games)).catch(() => {});
    };
    load();
    fetch("/api/mls/schedule?days=7").then(j)
      .then((d) => alive && setWeek(d.fixtures)).catch(() => {});
    fetch("/api/mls/standings").then(j)
      .then((d) => alive && setTables(d.conferences)).catch(() => {});
    const poll = setInterval(load, 60000);
    return () => { alive = false; clearInterval(poll); };
  }, []);

  return (
    <div className="space-y-14">
      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">tonight · live data</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">
            Today&apos;s slate{" "}
            <span className="text-sm font-normal text-ink-low">
              · ESPN live feed, 60s poll
            </span>
          </h3>
          {today === null ? (
            <Empty>loading fixtures…</Empty>
          ) : today.length === 0 ? (
            <Empty>no MLS fixtures today</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {today.map((f) => <FixtureCard key={f.id} f={f} />)}
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
              · KXMLSGAME three-way, ask / bid
            </span>
          </h3>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-ink-low">
            Raw exchange prices — no model overlay yet. The engine that
            priced WC26 adapts to league play behind the V7 acceptance
            gates; until it clears them, this page shows the market and
            only the market.
          </p>
          {books === null ? (
            <Empty>loading books…</Empty>
          ) : books.length === 0 ? (
            <Empty>no open MLS books right now</Empty>
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
          ) : (
            <div className="divide-y divide-line rounded-2xl border border-line">
              {week.slice(0, 30).map((f) => (
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

      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">the table</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">Standings</h3>
          {tables === null ? (
            <Empty>loading standings…</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {tables.map((c) => <ConferenceTable key={c.conference} c={c} />)}
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

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short", month: "numeric", day: "numeric",
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

function FixtureCard({ f }: { f: Fixture }) {
  const live = f.state === "in";
  return (
    <div className={`rounded-xl border p-3 ${
      live ? "glow glow-accent border-accent/40 bg-elev" : "border-line"}`}>
      <TeamLine s={f.home} live={live} />
      <div className="my-1.5 h-px bg-line" />
      <TeamLine s={f.away} live={live} />
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        <span className={live ? "text-accent" : undefined}>
          {live ? `LIVE ${f.minute ?? ""}` : f.detail}
        </span>
        <span className="truncate pl-2">{f.venue}</span>
      </div>
    </div>
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

function ConferenceTable({ c }: { c: Conference }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <p className="border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        {c.conference}
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
          {c.entries.map((e) => (
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

// MLS dashboard — the first next-league surface (Jul 22, 2026).
// Live ESPN fixtures/scores/standings, Kalshi's real KXMLSGAME 3-way
// books (both sides shown — ask to buy, bid to exit), and mls-2026-v0
// SHADOW odds where a completed prediction run exists. Shadow means
// observational: every model number is labeled, none is a
// recommendation, and real-money signals stay disabled server-side.
import Link from "next/link";
import { useEffect, useState } from "react";
import { dayKeyOf, dayLabel, fmtDate, groupByDay, localDay } from "../lib/matchday";
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
type OddsRow = { espn_event_id: string; run_type?: string; locked?: boolean;
  outcomes?: Record<string, number> };

const j = (r: Response) => (r.ok ? r.json() : Promise.reject(r.status));

// LOADING, FAILED AND EMPTY ARE THREE DIFFERENT FACTS.
// Every read on this hub used to end in `.catch(() => {})`, which left
// the state at its initial `null` — and `null` is the branch that
// renders "loading fixtures…". So a dead backend spun a loading label
// for ever, and a failed odds read left an empty map that is
// indistinguishable from "no prediction run exists for this fixture",
// which is a claim about the model. The type is LaligaDashboard.tsx's
// `settle()`, redeclared here rather than imported: that file is
// another owner's and src/lib is not this change's to add to. Four
// hubs now carry the same three lines; the duplication is named so a
// later extraction knows what it is collecting.
type Load<T> = { s: "loading" } | { s: "error" } | { s: "ok"; d: T };
const settle = <T,>(v: T | null | undefined): Load<T> =>
  v == null ? { s: "error" } : { s: "ok", d: v };

export default function MlsDashboard() {
  const [today, setToday] = useState<Load<Fixture[]>>({ s: "loading" });
  const [week, setWeek] = useState<Load<Fixture[]>>({ s: "loading" });
  const [tables, setTables] = useState<Load<Conference[]>>({ s: "loading" });
  const [books, setBooks] = useState<Load<GameBook[]>>({ s: "loading" });
  // THE ODDS MAP IS A READ, NOT A DEFAULT. `{}` meant "no shadow number
  // for this fixture", and a failed read produced exactly that for
  // every fixture at once.
  const [odds, setOdds] = useState<Load<Record<string, OddsRow>>>({ s: "loading" });

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/mls/scoreboard").then(j)
        .then((d) => alive && setToday(settle<Fixture[]>(d?.fixtures ?? [])))
        .catch(() => alive && setToday({ s: "error" }));
      fetch("/api/mls/markets").then(j)
        .then((d) => alive && setBooks(settle<GameBook[]>(d?.games ?? [])))
        .catch(() => alive && setBooks({ s: "error" }));
      fetch("/api/mls/odds").then(j)
        .then((d) => {
          if (!alive) return;
          const map: Record<string, OddsRow> = {};
          for (const o of d.odds ?? []) map[o.espn_event_id] = o;
          setOdds({ s: "ok", d: map });
        }).catch(() => alive && setOdds({ s: "error" }));
    };
    load();
    fetch("/api/mls/schedule?days=7").then(j)
      .then((d) => alive && setWeek(settle<Fixture[]>(d?.fixtures ?? [])))
      .catch(() => alive && setWeek({ s: "error" }));
    fetch("/api/mls/standings").then(j)
      .then((d) => alive && setTables(settle<Conference[]>(d?.conferences ?? [])))
      .catch(() => alive && setTables({ s: "error" }));
    const poll = setInterval(load, 60000);
    return () => { alive = false; clearInterval(poll); };
  }, []);

  // ESPN's scoreboard bucket is a MATCHDAY, not a calendar day: when
  // nothing is on today it returns the next one instead. So the heading
  // is derived from the fixtures rather than asserted — the same rule as
  // deriving a result letter from the score beside it. Grouping is by
  // LOCAL day: a Saturday-night slate straddles two UTC dates but is one
  // evening to the viewer, and splitting it would be an artefact of the
  // wire format, not a fact about the football.
  const days = today.s === "ok" ? groupByDay(today.d) : [];
  // A FAILED ODDS READ IS NOT AN ABSENT PREDICTION. The map is handed
  // down only when it was actually read; the failure is stated once,
  // above the fixtures, rather than looking like every match lacking a
  // run.
  const oddsMap = odds.s === "ok" ? odds.d : {};
  const allToday = days.length === 0
    || days.every((g) => localDay(g.list[0].date) === dayKeyOf(new Date()));
  const showDayLabels = days.length > 1 || !allToday;

  return (
    <div className="space-y-14">
      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">tonight · live data</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">
            {allToday ? "Today's slate" : "Next matchday"}{" "}
            <span className="text-sm font-normal text-ink-low">
              · ESPN live feed, 60s poll
            </span>
          </h3>
          {odds.s === "error" && (
            <Empty>
              mls shadow-odds read failed — no model number is shown on any
              fixture below, and that is not the same as no run existing
            </Empty>
          )}
          {today.s === "loading" ? (
            <Empty>loading fixtures…</Empty>
          ) : today.s === "error" ? (
            <Empty>mls fixture feed unavailable — retrying every 60s</Empty>
          ) : days.length === 0 ? (
            <Empty>no MLS fixtures scheduled</Empty>
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
                      <FixtureCard key={f.id} f={f} o={oddsMap[f.id]} />
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
              · KXMLSGAME three-way, ask / bid
            </span>
          </h3>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-ink-low">
            Raw exchange prices. Where a fixture shows model numbers they
            come from mls-2026-v0 running in <em>shadow mode</em> —
            observational output logged for prospective validation, never
            a recommendation. Real-money signals are disabled server-side.
          </p>
          {books.s === "loading" ? (
            <Empty>loading books…</Empty>
          ) : books.s === "error" ? (
            <Empty>kalshi book feed unavailable — retrying every 60s</Empty>
          ) : books.d.length === 0 ? (
            <Empty>no open MLS books right now</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {books.d.map((g) => <BookCard key={g.event_ticker} g={g} />)}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">next seven days</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">Fixtures</h3>
          {week.s === "loading" ? (
            <Empty>loading schedule…</Empty>
          ) : week.s === "error" ? (
            <Empty>mls schedule feed unavailable — retrying every 60s</Empty>
          ) : week.d.length === 0 ? (
            <Empty>no mls fixtures inside seven days</Empty>
          ) : (
            <div className="divide-y divide-line rounded-2xl border border-line">
              {week.d.slice(0, 30).map((f) => (
                <Link key={f.id} href={`/bet-suggester/mls/${f.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/5">
                  <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                    {fmtDate(f.date)}
                  </span>
                  <span className="flex-1 truncate text-ink-hi">
                    {f.home.short || f.home.name}
                    <span className="text-ink-faint"> vs </span>
                    {f.away.short || f.away.name}
                  </span>
                  <WeekOdds o={oddsMap[f.id]} model="mls-2026-v0" />
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
          <Eyebrow className="mb-2" tone="accent">the table</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">Standings</h3>
          {tables.s === "loading" ? (
            <Empty>loading standings…</Empty>
          ) : tables.s === "error" ? (
            <Empty>mls standings feed unavailable — retrying every 60s</Empty>
          ) : tables.d.length === 0 ? (
            <Empty>no mls standings published yet</Empty>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {tables.d.map((c) => <ConferenceTable key={c.conference} c={c} />)}
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

// Date/matchday helpers live in ../lib/matchday — extracted (verbatim)
// so the friendlies page imports the grouping rules instead of copying
// them. See that module for the two defects they encode.

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

// ONE FORMATTER FOR ONE OUTCOME, AND EVERY PLACE THIS FILE DRAWS ONE
// GOES THROUGH IT.
//
// A probability the backend did not send is drawn as an em dash. It is
// never drawn as 0: "0" is a measured claim about what the model thinks
// of a result, and a key that is absent was never measured. `OddsChip`
// already had that rule and its own local formatter to keep it — and
// the seven-day list above, in this same file, carried an inline copy
// that read `(outcomes!.draw ?? 0) * 100` on all three legs, so a payload
// missing `draw` rendered "45/0/30". That is the shape this repo has
// now paid for four rounds running: the fix holds at the named site and
// the same shape stands one function over. There is ONE formatter now,
// so the two cannot disagree again.
function outcomePct(p: Record<string, number> | undefined, k: string): string {
  return p != null && p[k] != null ? `${Math.round(p[k] * 100)}` : "—";
}

// The seven-day list's shadow chip. Same formatter as the fixture
// card's, and the label that makes three bare numbers safe to read is
// REAL TEXT IN THE ACCESSIBLE TREE — it used to live only on a `title=`,
// where a screen reader met "45/25/30" with nothing saying whose
// numbers they were or that they are not advice. The label carries no
// em dash of its own: inside this chip an em dash means exactly one
// thing, "this leg was not measured", and a second use would blunt it.
function WeekOdds({ o, model }: { o?: OddsRow; model: string }) {
  if (!o?.outcomes) return null;
  const run = o.locked ? "t-10 lock" : "shadow";
  return (
    <span data-testid="week-odds"
      className="shrink-0 font-mono text-[10px] tabular-nums text-ink-low">
      <span className="sr-only">
        {model} {run} odds, not advice. Home / draw / away:{" "}
      </span>
      {outcomePct(o.outcomes, "home_win")}
      /{outcomePct(o.outcomes, "draw")}
      /{outcomePct(o.outcomes, "away_win")}
      <span className="ml-1.5 uppercase tracking-wide text-ink-faint" aria-hidden>
        {run}
      </span>
    </span>
  );
}

function OddsChip({ o }: { o?: OddsRow }) {
  const p = o?.outcomes;
  if (!p) return null;
  const pct = (k: string) => outcomePct(p, k);
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
  // under way shows WHEN it kicks off. "Scheduled" said nothing — least
  // of all that the card under "Today's slate" can be days away, which
  // is exactly what ESPN's scoreboard returns when nothing is on today.
  // Local time is safe here: every fixture is fetched in useEffect, so
  // these cards only ever render client-side and cannot mismatch SSR.
  const when = f.state === "post"
    ? f.detail
    : (fmtDate(f.date, "short") || f.detail);
  return (
    <Link href={`/bet-suggester/mls/${f.id}`}
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

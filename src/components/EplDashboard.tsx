import { TZ } from "../lib/matchday";
// EPL dashboard — the Premier League hub (Jul 28, 2026), mirroring the
// MLS skeleton: live ESPN eng.1 fixtures/scores, Kalshi books where
// they exist, the single league table, and shadow odds — which are
// EMPTY by design while epl-2026-v0 is DARK (unapproved, no approval
// decision; the backend structurally refuses runs). Every empty state
// says so in words; nothing renders a zero that could read as a
// forecast or a fabricated preseason table.
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eyebrow, Reveal } from "./ui";

type Side = { name?: string; short?: string; abbrev?: string; logo?: string;
  score?: string; record?: string };
type Fixture = { id: string; date: string; state: "pre" | "in" | "post" | null;
  detail?: string; minute?: string; venue?: string; home: Side; away: Side };
type StandingEntry = { team: string; abbrev?: string; rank?: number;
  played?: number; wins?: number; losses?: number; ties?: number;
  points?: number; goal_diff?: number };
type LeagueTable = { table: string; entries: StandingEntry[] };
type BookRow = { ticker: string; label?: string; yes_ask?: string;
  yes_bid?: string; status?: string };
type GameBook = { event_ticker: string; title?: string; markets: BookRow[] };
type OddsRow = { espn_event_id: string; run_type?: string; locked?: boolean;
  outcomes?: Record<string, number> };
type Discovery = { game_series?: string; series_exists?: boolean | null;
  open_events?: number | null; open_events_in_horizon?: number | null;
  mapped_events?: number;
  unmapped_upcoming?: number; upcoming_48h?: number };

// P0-5. These are THREE different facts and must never render as one:
//   dark              the backend says the model is explicitly unapproved
//   approved_no_runs  approved, but nothing has been produced yet
//   approved          approved, with runs
//   unavailable       we could not find out — a failure, not a decision
// "loading" is the pre-answer state and is deliberately distinct from
// "unavailable"; the previous build initialised to dark and never left
// it on failure, so a broken backend looked like a design choice.
type ModelState = "loading" | "dark" | "approved_no_runs" | "approved"
  | "unavailable";

const j = (r: Response) => (r.ok ? r.json() : Promise.reject(r.status));

export default function EplDashboard() {
  const [today, setToday] = useState<Fixture[] | null>(null);
  const [week, setWeek] = useState<Fixture[] | null>(null);
  const [tables, setTables] = useState<LeagueTable[] | null>(null);
  const [books, setBooks] = useState<GameBook[] | null>(null);
  const [odds, setOdds] = useState<Record<string, OddsRow>>({});
  const [modelState, setModelState] = useState<ModelState>("loading");
  const [disco, setDisco] = useState<Discovery | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/epl/scoreboard").then(j)
        .then((d) => alive && setToday(d.fixtures)).catch(() => {});
      fetch("/api/epl/markets").then(j)
        .then((d) => alive && setBooks(d.games)).catch(() => {});
      fetch("/api/epl/odds").then(j)
        .then((d) => {
          if (!alive) return;
          const map: Record<string, OddsRow> = {};
          for (const o of d.odds ?? []) map[o.espn_event_id] = o;
          setOdds(map);
          // trust the backend's explicit state; fall back to
          // "unavailable" rather than inventing "dark" from an absence
          const s = d.model_state as ModelState | undefined;
          setModelState(s && s !== "loading" ? s : "unavailable");
        })
        // a REJECTED fetch is a failure, not a dark model
        .catch(() => alive && setModelState("unavailable"));
    };
    load();
    fetch("/api/epl/schedule?days=7").then(j)
      .then((d) => alive && setWeek(d.fixtures)).catch(() => {});
    fetch("/api/epl/standings").then(j)
      .then((d) => alive && setTables(d.tables)).catch(() => {});
    fetch("/api/epl/markets/discovery").then(j)
      .then((d) => alive && setDisco(d)).catch(() => {});
    const poll = setInterval(load, 60000);
    return () => { alive = false; clearInterval(poll); };
  }, []);

  // ESPN's scoreboard bucket is a MATCHDAY, not a calendar day (same
  // rule as the MLS hub, and it matters MORE preseason: today's bucket
  // is Aug 21). The heading is derived from the fixtures, never
  // asserted; grouping is by the viewer's LOCAL day.
  const days = today ? groupByDay(today) : [];
  const allToday = days.length === 0
    || days.every((g) => localDay(g.list[0].date) === dayKeyOf(new Date()));
  const showDayLabels = days.length > 1 || !allToday;

  return (
    <div className="space-y-14">
      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">fixtures · live data</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">
            {allToday ? "Today's slate" : "Next matchday"}{" "}
            <span className="text-sm font-normal text-ink-low">
              · ESPN live feed, 60s poll
            </span>
          </h3>
          {today === null ? (
            <Empty>loading fixtures…</Empty>
          ) : days.length === 0 ? (
            <Empty>no premier league fixtures scheduled</Empty>
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
              · {disco?.game_series ?? "KXEPLGAME"} three-way, ask / bid
            </span>
          </h3>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-ink-low">
            Raw exchange prices.{" "}
            {modelState === "dark" ? (
              <>
                epl-2026-v0 is scaffolded but <em>dark</em> — unapproved,
                structurally refused by the backend — so no model number
                appears anywhere on this page until it earns approval
                through prospective evaluation.
              </>
            ) : modelState === "unavailable" ? (
              <>
                The model&apos;s state could not be read, so this page
                makes no claim about it either way.
              </>
            ) : (
              <>
                Any model number shown beside them is epl-2026-v0 shadow
                output — observational, never advice.
              </>
            )}{" "}
            Real-money signals are disabled server-side.
          </p>
          {books === null ? (
            <Empty>loading books…</Empty>
          ) : books.length === 0 ? (
            <Empty>
              no open premier league books
              {disco?.series_exists
                ? ` — ${disco.game_series} exists but lists no 2026-27 events yet`
                : ""}
            </Empty>
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
            <Empty>no fixtures in the next seven days — season starts Aug 21</Empty>
          ) : (
            <div className="divide-y divide-line rounded-2xl border border-line">
              {week.slice(0, 30).map((f) => (
                <Link key={f.id} href={`/bet-suggester/epl/${f.id}`}
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
                      title="epl-2026-v0 shadow odds — not advice">
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
          <Eyebrow className="mb-2" tone="accent">the table</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">Standings</h3>
          {tables === null ? (
            <Empty>loading standings…</Empty>
          ) : tables.length === 0 ? (
            // ESPN serves 20 all-zero rows ranked ALPHABETICALLY before
            // a ball is kicked. Rendering that would crown Bournemouth —
            // the backend withholds the table and this states why.
            <Empty>
              season not started — no standings until a match is played
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {tables.map((t) => <StandingsTable key={t.table} t={t} />)}
            </div>
          )}
        </section>
      </Reveal>

      <ModelStatus state={modelState} />
    </div>
  );
}

// One block, three DIFFERENT statements. Collapsing them was the defect:
// "model dark" is a design decision a reader can accept and move on
// from, so wearing it over a failure means nobody investigates.
function ModelStatus({ state }: { state: ModelState }) {
  if (state === "loading" || state === "approved") return null;
  const copy = {
    dark: {
      head: "model status · epl-2026-v0 — dark",
      body: "The engine is wired end-to-end (fixtures, identity, market "
        + "discovery, lock machinery) but the model is unapproved and "
        + "produces no output. Approval is earned through the same "
        + "evaluation ladder MLS passed — on real 2026-27 results, which "
        + "don't exist yet. Until then this hub shows data, never "
        + "predictions.",
    },
    approved_no_runs: {
      head: "model status · epl-2026-v0 — approved / no runs",
      body: "epl-2026-v0 is approved for shadow collection, and no "
        + "complete run exists yet. This is an empty result, not a "
        + "withheld one: nothing has been produced to show. Odds appear "
        + "here as soon as the first sweep completes.",
    },
    unavailable: {
      head: "model status · unavailable",
      body: "The odds board could not be read, so this page cannot say "
        + "what state the model is in. That is a FAILURE, not a design "
        + "decision — absence of odds here means nothing until the read "
        + "succeeds.",
    },
  }[state];
  return (
    <Reveal>
      <section data-testid={`model-status-${state}`}
        className="rounded-2xl border border-line bg-elev px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-low">
          {copy.head}
        </p>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-low">
          {copy.body}
        </p>
      </section>
    </Reveal>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
      {children}
    </p>
  );
}

// Local calendar-day identity — deliberately NOT the ISO date: the wire
// format is UTC and one evening can straddle two UTC dates.
const dayKeyOf = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function localDay(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dayKeyOf(d);
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
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
  return d.toLocaleString("en-US", {
    timeZone: TZ,
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
  if (!p) return null;    // dark model: no chip at all — never a zero bar
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
  // A finished match keeps its result detail (FT); anything not under
  // way shows WHEN it kicks off — never the bare provider "Scheduled",
  // least of all preseason when the default bucket is weeks away.
  const when = f.state === "post"
    ? f.detail
    : (fmtDate(f.date, "short") || f.detail);
  return (
    <Link href={`/bet-suggester/epl/${f.id}`}
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

function StandingsTable({ t }: { t: LeagueTable }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <p className="border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        {t.table}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="font-mono text-[10px] uppercase text-ink-faint">
            <th className="px-3 py-1.5 text-left">#</th>
            <th className="px-3 py-1.5 text-left">club</th>
            <th className="px-2 py-1.5 text-right">gp</th>
            <th className="px-2 py-1.5 text-right">w</th>
            <th className="px-2 py-1.5 text-right">d</th>
            <th className="px-2 py-1.5 text-right">l</th>
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
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.ties}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.losses}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[11px]">{e.goal_diff}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums text-accent">{e.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

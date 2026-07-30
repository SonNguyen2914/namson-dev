// La Liga hub — the reconciled surface (Jul 30, 2026).
//
// Two implementations of this board existed: one merged to main as PR #14,
// one on feat-laliga-hub which was older and carried more (a full per-match
// page and a hermetic spec). This is the single survivor. It keeps the
// branch's structure — five e2e assertions pin its wording — and takes
// main's discipline: the SHARED matchday rules instead of a private copy,
// and the model-state section stated first and explicitly.
//
// La Liga's honest state today is EMPTY in four different ways, and this
// page says WHICH rather than rendering blanks:
//   1. the model is DARK — laliga-2026-v0 has no approval decision, the
//      backend structurally refuses runs, and no model number renders;
//   2. standings are preseason — ESPN serves 20 all-zero rows ranked
//      alphabetically, the backend suppresses that, and rendering it
//      would fabricate an order;
//   3. Kalshi lists the KXLALIGAGAME series but no 2026-27 game books;
//   4. no fixtures inside the window — the season has not started.
//
// Two further states are deliberately distinct from all four: a feed
// still in flight, and one that FAILED. A permanent "loading…" is a lie,
// and a failure that renders as "no fixtures" is a worse one.
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
type LeagueTable = { conference: string; entries: StandingEntry[] };
type StandingsPayload = { tables: LeagueTable[]; preseason?: boolean };
type BookRow = { ticker: string; label?: string; yes_ask?: string;
  yes_bid?: string; status?: string };
type GameBook = { event_ticker: string; title?: string; markets: BookRow[] };
type KalshiProbe = { series?: string; series_exists?: boolean | null;
  open_events?: number | null; coverage_verified?: boolean };
type OddsRow = { espn_event_id: string; run_type?: string; locked?: boolean;
  outcomes?: Record<string, number> };
type OddsPayload = { odds?: OddsRow[]; model_state?: string;
  model_dark?: boolean; model_version?: string;
  no_runs_reason?: { state?: string; min_games?: number;
                     clubs_rated?: number; fixtures_in_horizon?: number } };
type StatusPayload = { model_version?: string; model_dark?: boolean;
  model_dark_note?: string; xg_note?: string;
  counts?: { blockers?: string[] } & Record<string, unknown> };

// Loading, failed and empty are three different facts. Collapsing them is
// how a dead backend renders as "no fixtures today".
type Load<T> = { s: "loading" } | { s: "error" } | { s: "ok"; d: T };

const j = (r: Response) => (r.ok ? r.json() : Promise.reject(r.status));
const settle = <T,>(v: T | null | undefined): Load<T> =>
  v == null ? { s: "error" } : { s: "ok", d: v };

export default function LaligaDashboard() {
  const [today, setToday] = useState<Load<Fixture[]>>({ s: "loading" });
  const [week, setWeek] = useState<Load<Fixture[]>>({ s: "loading" });
  const [standings, setStandings] = useState<Load<StandingsPayload>>({ s: "loading" });
  const [books, setBooks] = useState<Load<GameBook[]>>({ s: "loading" });
  const [probe, setProbe] = useState<KalshiProbe | null>(null);
  const [odds, setOdds] = useState<Record<string, OddsRow>>({});
  const [model, setModel] = useState<OddsPayload | null>(null);
  const [status, setStatus] = useState<StatusPayload | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      Promise.all([
        fetch("/api/laliga/scoreboard").then(j).catch(() => null),
        fetch("/api/laliga/schedule?days=7").then(j).catch(() => null),
        fetch("/api/laliga/standings").then(j).catch(() => null),
        fetch("/api/laliga/markets").then(j).catch(() => null),
        // The odds board is EMPTY while the model is dark; polled anyway
        // so the surface lights up the day an approval ever lands,
        // without a frontend deploy.
        fetch("/api/laliga/odds").then(j).catch(() => null),
        fetch("/api/laliga/status").then(j).catch(() => null),
      ]).then(([sb, sc, stn, mkt, od, sts]) => {
        if (!alive) return;
        setToday(settle<Fixture[]>(sb ? sb.fixtures ?? [] : null));
        setWeek(settle<Fixture[]>(sc ? sc.fixtures ?? [] : null));
        setStandings(settle<StandingsPayload>(stn));
        setBooks(settle<GameBook[]>(mkt ? mkt.games ?? [] : null));
        setProbe(mkt?.kalshi ?? null);
        setModel(od ?? null);
        setStatus(sts ?? null);
        const map: Record<string, OddsRow> = {};
        for (const o of od?.odds ?? []) map[o.espn_event_id] = o;
        setOdds(map);
      });
    };
    load();
    const poll = setInterval(load, 60000);
    return () => { alive = false; clearInterval(poll); };
  }, []);

  // ESPN's scoreboard bucket is a MATCHDAY, not a calendar day — the
  // heading is DERIVED from the fixtures, never asserted. Shared rules
  // from lib/matchday, not a private copy (EplDashboard still carries
  // one at its foot; this board deliberately does not).
  const todayFx = today.s === "ok" ? today.d : [];
  const days = groupByDay(todayFx);
  const allToday = days.length === 0
    || days.every((g) => localDay(g.list[0].date) === dayKeyOf(new Date()));
  const showDayLabels = days.length > 1 || !allToday;
  const dark = model?.model_state === "dark" || model?.model_dark
    || status?.model_dark;
  const blockers = status?.counts?.blockers ?? [];
  const nr = model?.no_runs_reason;

  return (
    <div className="space-y-14">
      {/* MODEL STATE, first and explicit. An empty odds board with no
          explanation is the thing that reads as broken. */}
      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">
            model · {model?.model_version || status?.model_version
              || "laliga-2026-v0"}
          </Eyebrow>
          <h3 className="mb-2 text-lg font-medium text-ink-hi">
            {dark
              ? "Dark — no approval decision exists"
              : model?.model_state === "approved_no_runs"
                ? "Approved, no runs yet"
                : model?.model_state === "approved"
                  ? "Approved · shadow"
                  : "State unavailable"}
          </h3>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-low">
            {status?.model_dark_note
              || "No odds render until an approval is earned through the "
               + "evaluation ladder on real 2026-27 results."}
          </p>
          {blockers.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {blockers.map((b) => (
                <li key={b}
                  className="rounded-lg border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  {b}
                </li>
              ))}
            </ul>
          )}
          {nr && (
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["state", nr.state],
                ["clubs rated", nr.clubs_rated],
                ["floor", nr.min_games],
                ["fixtures in horizon", nr.fixtures_in_horizon],
              ].map(([k, v]) => (
                <div key={String(k)}
                  className="rounded-xl border border-line px-3 py-2">
                  <dt className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                    {k}
                  </dt>
                  <dd className="mt-1 truncate font-mono text-sm text-accent">
                    {v ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {status?.xg_note && (
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-faint">
              {status.xg_note}
            </p>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Eyebrow className="mb-2" tone="accent">fixtures · live data</Eyebrow>
          <h3 className="mb-6 text-lg font-medium text-ink-hi">
            {allToday ? "Today's slate" : "Next matchday"}{" "}
            <span className="text-sm font-normal text-ink-low">
              · ESPN live feed, 60s poll
            </span>
          </h3>
          {today.s === "loading" ? (
            <Empty>loading fixtures…</Empty>
          ) : today.s === "error" ? (
            <Empty>la liga fixture feed unavailable — retrying every 60s</Empty>
          ) : days.length === 0 ? (
            <Empty>no la liga fixtures scheduled</Empty>
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
              · KXLALIGAGAME three-way, ask / bid
            </span>
          </h3>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-ink-low">
            {/* JSX strips the leading space of a text chunk that follows
                an element, so the dash needs an explicit one or it renders
                as "dark— it has". */}
            Raw exchange prices. laliga-2026-v0 is <em>dark</em>{" "}— it has
            no approval decision, so no model number renders anywhere on
            this board. A model earns its way onto the page through
            prospective validation, the way MLS&apos;s did; until then
            the absence of a prediction is shown as exactly that.
            Real-money signals are disabled server-side.
          </p>
          {books.s === "loading" ? (
            <Empty>loading books…</Empty>
          ) : books.s === "error" ? (
            <Empty>kalshi book feed unavailable — retrying every 60s</Empty>
          ) : books.d.length === 0 ? (
            <Empty>
              {probe?.series_exists
                ? `no open la liga books — kalshi lists the ${probe.series ?? "KXLALIGAGAME"} series but no 2026-27 events yet`
                : "no open la liga books right now"}
            </Empty>
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
            <Empty>la liga schedule feed unavailable — retrying every 60s</Empty>
          ) : week.d.length === 0 ? (
            <Empty>
              no fixtures inside seven days — the 2026-27 season has not
              started
            </Empty>
          ) : (
            <div className="divide-y divide-line rounded-2xl border border-line">
              {week.d.slice(0, 30).map((f) => (
                <Link key={f.id} href={`/bet-suggester/laliga/${f.id}`}
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
                      title="laliga-2026-v0 shadow odds — not advice">
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
          {standings.s === "loading" ? (
            <Empty>loading standings…</Empty>
          ) : standings.s === "error" ? (
            <Empty>la liga standings feed unavailable — retrying every 60s</Empty>
          ) : standings.d.preseason || standings.d.tables.length === 0 ? (
            <Empty>
              {standings.d.preseason
                ? "no standings yet — the 2026-27 season kicks off "
                  + "mid-august. ESPN serves 20 all-zero rows ranked "
                  + "alphabetically here, and rendering that would "
                  + "fabricate an order"
                : "standings unavailable"}
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {standings.d.tables.map((t) => (
                <LeagueTableView key={t.conference} t={t} />
              ))}
            </div>
          )}
        </section>
      </Reveal>
    </div>
  );
}

/** One empty state, said in words, with the reason attached. A blank
 *  panel and a deliberately-empty panel must not look the same. */
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
        {s.record && (
          <span className="font-mono text-[10px] text-ink-faint">{s.record}</span>
        )}
      </span>
      <span className={`font-mono text-sm tabular-nums ${
        live ? "text-accent" : "text-ink-hi"}`}>{s.score}</span>
    </div>
  );
}

// Renders ONLY when the backend actually sent outcomes — while the
// model is dark it never mounts, and no zero-bar stands in for it.
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
  // A finished match keeps its result detail (FT); anything not under
  // way shows WHEN it kicks off — never the provider's bare "Scheduled"
  // (the card can be days away when ESPN serves the next matchday).
  const when = f.state === "post"
    ? f.detail
    : (fmtDate(f.date, "short") || f.detail);
  return (
    <Link href={`/bet-suggester/laliga/${f.id}`}
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

function LeagueTableView({ t }: { t: LeagueTable }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <p className="border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        {t.conference}
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

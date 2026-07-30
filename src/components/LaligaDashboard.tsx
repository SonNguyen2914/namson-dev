// La Liga hub.
//
// The backend has served /api/laliga/* since 2026-07-30 and nothing could
// reach it: there was no proxy route and no dashboard, so the board rendered
// "coming soon" for a competition that was fully wired. This closes that.
//
// Its honest state on 2026-07-30 is EMPTY, in four different ways, and this
// page says which rather than rendering blanks:
//   - the model is DARK (no approval decision for laliga-2026-v0);
//   - standings are preseason, so ESPN's all-zero table is refused outright
//     — an alphabetical all-zero table fabricates an order;
//   - Kalshi lists the series but no 2026-27 game books yet;
//   - two fixtures exist in the window and the season has not started.
//
// Deliberately reuses the shared matchday rules rather than the private
// day-grouping copy EplDashboard still carries at its foot.
import { useEffect, useState } from "react";

import { dayLabel, groupByDay } from "../lib/matchday";
import { Eyebrow, Reveal } from "./ui";

type Side = {
  name?: string; short?: string; abbrev?: string; logo?: string | null;
  score?: string; record?: string;
};
type Fixture = {
  id: string; date?: string; state?: string; detail?: string;
  minute?: string; venue?: string; home: Side; away: Side;
};
type Row = {
  rank?: number; team?: string; logo?: string | null;
  gp?: number; w?: number; d?: number; l?: number;
  gd?: number; pts?: number;
};
type Standings = { tables?: { name?: string; rows?: Row[] }[];
                   preseason?: boolean };
type Status = {
  competition?: string; model_version?: string; model_dark?: boolean;
  model_dark_note?: string; xg_source?: string | null; xg_note?: string;
  enabled?: boolean; counts?: Record<string, number>;
  kalshi?: Record<string, unknown>;
};
type Odds = {
  odds?: unknown[]; model_state?: string; model_version?: string;
  no_runs_reason?: { state?: string; min_games?: number;
                     clubs_rated?: number; clubs_known?: number;
                     max_games_seen?: number;
                     fixtures_in_horizon?: number };
};
type Markets = { games?: unknown[]; kalshi?: Record<string, unknown> };

const j = (r: Response) => (r.ok ? r.json() : Promise.reject(r.status));

/** One empty state, said in words, with the reason attached. Used for all
 *  four of La Liga's currently-empty sections — a blank panel and a
 *  deliberately-empty panel must not look the same. */
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-line bg-elev px-4 py-5 text-center font-mono text-[11px] uppercase leading-relaxed tracking-wide text-ink-faint">
      {children}
    </p>
  );
}

function TeamLine({ s, live }: { s?: Side; live?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {s?.logo
        ? <img src={s.logo} alt="" className="h-5 w-5 shrink-0" />
        : <div className="h-5 w-5 shrink-0 rounded-full border border-line" />}
      <span className="min-w-0 flex-1 truncate text-sm text-ink-hi">
        {s?.name ?? "—"}
      </span>
      <span className={`font-mono text-sm ${
        live ? "text-accent" : "text-ink-mid"}`}>
        {s?.score ?? "–"}
      </span>
    </div>
  );
}

export default function LaligaDashboard() {
  const [fx, setFx] = useState<Fixture[]>([]);
  const [week, setWeek] = useState<Fixture[]>([]);
  const [st, setSt] = useState<Standings | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [odds, setOdds] = useState<Odds | null>(null);
  const [mk, setMk] = useState<Markets | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      Promise.all([
        fetch("/api/laliga/scoreboard").then(j).catch(() => null),
        fetch("/api/laliga/schedule?days=7").then(j).catch(() => null),
        fetch("/api/laliga/standings").then(j).catch(() => null),
        fetch("/api/laliga/status").then(j).catch(() => null),
        fetch("/api/laliga/odds").then(j).catch(() => null),
        fetch("/api/laliga/markets").then(j).catch(() => null),
      ]).then(([sb, sc, stn, sts, od, m]) => {
        if (!alive) return;
        if (!sb && !sc && !sts) { setErr(true); return; }
        setErr(false);
        setFx(sb?.fixtures || []);
        setWeek(sc?.fixtures || []);
        setSt(stn || null);
        setStatus(sts || null);
        setOdds(od || null);
        setMk(m || null);
      });
    };
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const groups = groupByDay(week
    .map((f) => ({ id: f.id, date: f.date || "", f }))
    .filter((x) => x.date));
  const tables = st?.tables || [];
  const nr = odds?.no_runs_reason;

  return (
    <div>
      {err && (
        <Empty>la liga feed unavailable — retrying every 60s</Empty>
      )}

      {/* MODEL STATE, first and explicit. An empty odds board with no
          explanation is the thing that reads as broken. */}
      <section>
        <Eyebrow tone="accent">model · {odds?.model_version || "laliga-2026-v0"}</Eyebrow>
        <h2 className="mt-3 text-lg text-ink-hi">
          {odds?.model_state === "dark"
            ? "Dark — no approval decision exists"
            : odds?.model_state === "approved_no_runs"
              ? "Approved, no runs yet"
              : odds?.model_state === "approved"
                ? "Approved · shadow"
                : "State unavailable"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-low">
          {status?.model_dark_note
            || "No odds render until an approval is earned through the "
             + "evaluation ladder on real 2026-27 results."}
        </p>
        {nr && (
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["state", nr.state],
              ["clubs rated", nr.clubs_rated],
              [`floor`, nr.min_games],
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

      <section className="mt-12">
        <Eyebrow>espn · live data</Eyebrow>
        <h2 className="mt-3 text-lg text-ink-hi">
          Today&apos;s fixtures{" "}
          <span className="font-normal text-ink-faint">
            · 60s poll
          </span>
        </h2>
        {fx.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {fx.map((f) => {
              const live = f.state === "in";
              return (
                <Reveal key={f.id}>
                  <div className={`rounded-xl border p-3 ${live
                    ? "glow glow-accent border-accent/40 bg-elev"
                    : "border-line"}`}>
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
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <Empty>no la liga fixtures today</Empty>
          </div>
        )}
      </section>

      <section className="mt-12">
        <Eyebrow>next seven days</Eyebrow>
        <h2 className="mt-3 text-lg text-ink-hi">Fixtures</h2>
        {groups.length ? groups.map(({ key, list }) => (
          <div key={key} className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                {dayLabel(list[0].date)}
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                {list.length} {list.length === 1 ? "match" : "matches"}
              </span>
            </div>
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {list.map(({ f }) => (
                <div key={f.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 truncate text-ink-mid">
                    {f.home?.short || f.home?.name}
                    <span className="px-1.5 text-ink-faint">vs</span>
                    {f.away?.short || f.away?.name}
                  </span>
                  <span className="shrink-0 truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                    {f.venue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="mt-4">
            <Empty>
              no fixtures in the next seven days — the 2026-27 season has
              not started
            </Empty>
          </div>
        )}
      </section>

      <section className="mt-12">
        <Eyebrow>the table</Eyebrow>
        <h2 className="mt-3 text-lg text-ink-hi">Standings</h2>
        {tables.length ? tables.map((t, ti) => (
          <div key={t.name ?? ti} className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  {["#", "club", "gp", "w", "d", "l", "gd", "pts"].map((h) => (
                    <th key={h} className={`py-2 font-normal ${
                      h === "club" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(t.rows || []).map((r) => (
                  <tr key={r.team} className="border-b border-line/60">
                    <td className="py-1.5 text-right font-mono text-ink-faint">
                      {r.rank}
                    </td>
                    <td className="py-1.5 text-ink-mid">{r.team}</td>
                    {[r.gp, r.w, r.d, r.l, r.gd, r.pts].map((v, i) => (
                      <td key={i}
                        className="py-1.5 text-right font-mono text-ink-low">
                        {v ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )) : (
          <div className="mt-4">
            <Empty>
              {st?.preseason
                ? "preseason — no standings until a match is played. ESPN "
                  + "serves 20 all-zero rows ranked alphabetically here, and "
                  + "rendering that would fabricate an order"
                : "no standings available"}
            </Empty>
          </div>
        )}
      </section>

      <section className="mt-12">
        <Eyebrow>market · kalshi</Eyebrow>
        <h2 className="mt-3 text-lg text-ink-hi">Real books</h2>
        {(mk?.games || []).length ? (
          <p className="mt-4 font-mono text-[11px] text-ink-faint">
            {(mk?.games || []).length} game book(s) listed
          </p>
        ) : (
          <div className="mt-4">
            <Empty>
              no open la liga game books — the series exists but lists no
              2026-27 events yet
            </Empty>
          </div>
        )}
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-faint">
          prices are the exchange&apos;s own, observational — not advice, and
          no model number renders on this surface while the model is dark.
        </p>
      </section>
    </div>
  );
}

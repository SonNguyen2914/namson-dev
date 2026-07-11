// Live scoreboard for the landing page — the top of the showcase zone.
// Apple-Sports-style cards for matches in progress: the score is the hero
// (oversized numerals that flash when a goal lands), live clock, scorers
// split under each side, subtle radial red glow for depth.
// Polls the feed-backed /live-scores endpoint (one API-Football call covers
// every live match at once, so this is budget-cheap). Renders nothing when
// no match is live, so it never clutters the page pre-match.
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, flag, pct, signedPct, LiveAutoResponse, LiveScoreEntry, LiveStatsResponse, TeamNewsResponse } from "../lib/suggesterApi";
import { Eyebrow, Flash, Reveal } from "./ui";
import { Collapse } from "./chrome";
import LivePanel from "./LivePanel";
import TeamNewsSection from "./TeamNews";

const POLL_MS = 15000; // matches the backend's 15s live tick; snapshot reads are free

export default function LiveScoreboard() {
  const [live, setLive] = useState<LiveScoreEntry[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api.liveScores();
        if (alive) setLive(r.live);
      } catch {
        /* feed off or unreachable — just show nothing */
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (live.length === 0) return null;

  return (
    <section className="mb-20 space-y-5">
      {live.map((m) => (
        <Reveal key={m.match_id}>
          <LiveCard m={m} />
        </Reveal>
      ))}
    </section>
  );
}

// Lineups + the manual live read, INSIDE an in-progress match's score card.
// Both are self-contained: lineups poll the facts-only team-news endpoint
// (backend caches ESPN for 60s), the LivePanel manages its own state per
// match id. Rendered outside the score block's Link so controls don't
// navigate.
// The hands-free live read: the backend re-simulates the remainder every
// ~30s from the real state + live shot stats (levers derived, echoed, and
// capped) and prices every open market. Informational — the market already
// knows the score, so differences are a read, not a signal.
function LiveMarketStream({ a, home, away }: {
  a: LiveAutoResponse; home: string; away: string;
}) {
  const adv = a.live_advance;
  const lev = a.levers;
  const rows = [...(a.markets ?? [])]
    .sort((x, y) => y.live_model_probability - x.live_model_probability);
  return (
    <div>
      {adv && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-bs p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">{home} advances</p>
            <p className="mt-1 font-mono text-xl tabular-nums text-ink-hi">{pct(adv.home)}</p>
          </div>
          <div className="rounded-xl border border-line bg-bs p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">{away} advances</p>
            <p className="mt-1 font-mono text-xl tabular-nums text-ink-hi">{pct(adv.away)}</p>
          </div>
        </div>
      )}
      {lev && (
        <p className="mb-3 font-mono text-[11px] text-ink-low"
          title={lev.basis
            ? `SoT ${lev.basis.sot_home}-${lev.basis.sot_away} · shots ${lev.basis.shots_home}-${lev.basis.shots_away} · share ${lev.basis.actual_share_home} vs expected ${lev.basis.expected_share_home} · weight ${lev.basis.weight}`
            : undefined}>
          auto levers · {lev.source}: {home} {lev.home.toFixed(2)}× / {away} {lev.away.toFixed(2)}×
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-line">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[minmax(0,1fr)_6rem_5.5rem_5rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
            <span>Market</span>
            <span className="text-right">Live model</span>
            <span className="text-right">Market</span>
            <span className="text-right">Δ</span>
          </div>
          {rows.map((r) => (
            <div key={r.market_id} className="grid grid-cols-[minmax(0,1fr)_6rem_5.5rem_5rem] items-center gap-x-3 border-b border-line px-4 py-2 text-sm last:border-b-0">
              <span className="min-w-0 truncate pr-2 text-ink-mid" title={r.market_title}>{r.market_title}</span>
              <span className="text-right font-mono tabular-nums text-ink-hi">{pct(r.live_model_probability)}</span>
              <span className="text-right font-mono tabular-nums text-ink-low">
                {r.market_probability != null ? pct(r.market_probability) : "—"}
              </span>
              <span className={`text-right font-mono tabular-nums ${
                r.difference == null ? "text-ink-faint"
                  : r.difference >= 0 ? "text-accent" : "text-neg"}`}>
                {r.difference != null ? signedPct(r.difference) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        Re-simulated every ~30s from the live state and shot stats. The
        market already knows the score — differences are a read, not an
        edge. Hover the levers for their full derivation.
      </p>
    </div>
  );
}

function LiveExtras({ m }: { m: LiveScoreEntry }) {
  const [news, setNews] = useState<TeamNewsResponse | null>(null);
  const [stats, setStats] = useState<LiveStatsResponse | null>(null);
  const [auto, setAuto] = useState<LiveAutoResponse | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const tn = await api.teamNews(m.match_id);
        if (alive) setNews(tn);
      } catch { /* no lineups — section shows nothing */ }
    };
    load();
    const id = setInterval(load, 300000); // squads are settled; 5 min is plenty
    // broadcast stat card — moves with the match, 30s cadence
    const loadStats = async () => {
      try {
        const st = await api.liveStats(m.match_id);
        if (alive && st.available) setStats(st);
      } catch { /* stats stay hidden */ }
    };
    loadStats();
    const id2 = setInterval(loadStats, 30000);
    // the self-running live read: same 30s cycle as the stats
    const loadAuto = async () => {
      try {
        const la = await api.liveAuto(m.match_id);
        if (alive && la.available) setAuto(la);
      } catch { /* stream stays hidden */ }
    };
    loadAuto();
    const id3 = setInterval(loadAuto, 30000);
    return () => { alive = false; clearInterval(id); clearInterval(id2); clearInterval(id3); };
  }, [m.match_id]);

  return (
    <div className="mt-8 border-t border-line pt-6">
      {auto && auto.available && (
        <Collapse eyebrow="live model" title="Live market read · auto" className="mb-6">
          <LiveMarketStream a={auto} home={m.home} away={m.away} />
        </Collapse>
      )}
      {stats && stats.rows.length > 0 && (
        <Collapse eyebrow="live" title="Match stats" className="mb-6">
          <div className="space-y-2.5">
            {stats.rows.map((r) => {
              const h = parseFloat(r.home) || 0;
              const a = parseFloat(r.away) || 0;
              const tot = h + a;
              const pctH = tot > 0 ? (h / tot) * 100 : 50;
              return (
                <div key={r.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="w-14 shrink-0 font-mono tabular-nums text-ink-hi">{r.home}</span>
                    <span className="min-w-0 truncate text-center text-xs text-ink-low">{r.label}</span>
                    <span className="w-14 shrink-0 text-right font-mono tabular-nums text-ink-hi">{r.away}</span>
                  </div>
                  <div className="mt-1 flex h-1 gap-0.5 overflow-hidden rounded-full">
                    <div className="rounded-full bg-accent/70" style={{ width: `${pctH}%` }} />
                    <div className="flex-1 rounded-full bg-elev2" />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-ink-faint">
            {stats.home_team} left · {stats.away_team} right — via ESPN, ~30s behind the broadcast.
          </p>
        </Collapse>
      )}
      {news && (
        <Collapse eyebrow="team news" title="Official lineups" className="mb-6">
          <TeamNewsSection news={news} home={m.home} away={m.away} />
        </Collapse>
      )}
      <Collapse eyebrow="what-if" title="Manual override · test your own state" defaultOpen={false} className="mb-0">
        <LivePanel matchId={m.match_id} />
      </Collapse>
    </div>
  );
}

function LiveCard({ m }: { m: LiveScoreEntry }) {
  const homeGoals = m.goals_list.filter((g) => g.team === "home");
  const awayGoals = m.goals_list.filter((g) => g.team === "away");
  const finished = m.is_finished === true;
  const running = !finished && m.status_short !== "HT";
  // finished shows the full-time label (FT / AET / PEN); live shows the clock.
  const clock =
    finished ? (m.status_short || "FT") :
    m.status_short === "HT" ? "HT" :
    m.minutes_elapsed != null ? `${Math.round(m.minutes_elapsed)}′` : m.status_short;

  return (
    <div className={`glow overflow-hidden rounded-3xl border bg-elev px-6 py-8 transition-colors duration-300 sm:px-10 sm:py-10 ${
      finished
        ? "border-line hover:border-line-strong"
        : "glow-live border-line hover:border-live/40"
    }`}>
      {/* the score block links to the match page; the extras below it are
          interactive and live INSIDE the same box, so they don't navigate */}
      <Link href={`/bet-suggester/market/${m.match_id}`} className="block cursor-pointer">
        {/* status badge: pulsing "live" vs quiet "final" */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {finished ? (
            <Eyebrow tone="low">{m.status_short === "AET" ? "after extra time"
              : m.status_short === "PEN" ? "after penalties" : "full time"}</Eyebrow>
          ) : (
            <>
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-live" />
              <Eyebrow tone="live">live</Eyebrow>
            </>
          )}
        </div>

        {/* score line — the hero */}
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <div className="min-w-0 flex-1 text-right">
            <span className="block text-3xl sm:text-4xl">{flag(m.home)}</span>
            <p className="mt-2 flex items-center justify-end gap-2 truncate text-sm text-ink-mid sm:text-lg">
              {m.home}
              {m.red_home && (
                <span title="red card" className="inline-block h-3 w-2 rounded-[2px] bg-live" />
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-7">
            <Flash
              value={m.home_goals}
              tone={finished ? "accent" : "live"}
              className={`text-6xl font-semibold tracking-tight tabular-nums sm:text-8xl ${
                finished ? "text-ink-mid" : "text-ink-hi"}`}
            />
            <span className="flex flex-col items-center gap-1.5">
              <span className={`font-mono text-sm tabular-nums sm:text-base ${
                running ? "text-live" : "text-ink-low"
              }`}>
                {clock}
              </span>
              {!finished && m.minutes_elapsed != null && (
                <span className="minutebar w-14" aria-hidden>
                  <div style={{ width: `${Math.min(100,
                    (m.minutes_elapsed / (["ET", "BT", "P"].includes(m.status_short) ? 120 : 90)) * 100)}%` }} />
                </span>
              )}
            </span>
            <Flash
              value={m.away_goals}
              tone={finished ? "accent" : "live"}
              className={`text-6xl font-semibold tracking-tight tabular-nums sm:text-8xl ${
                finished ? "text-ink-mid" : "text-ink-hi"}`}
            />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <span className="block text-3xl sm:text-4xl">{flag(m.away)}</span>
            <p className="mt-2 flex items-center gap-2 truncate text-sm text-ink-mid sm:text-lg">
              {m.red_away && (
                <span title="red card" className="inline-block h-3 w-2 rounded-[2px] bg-live" />
              )}
              {m.away}
            </p>
          </div>
        </div>

        {/* scorers, split under each side */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-7 flex items-start justify-center gap-8 font-mono text-xs text-ink-low sm:gap-14">
            <div className="flex-1 space-y-1 text-right">
              {homeGoals.map((g, i) => (
                <p key={i}>
                  {g.player ?? "Goal"}{" "}
                  <span className="text-ink-faint">
                    {g.minute != null ? `${g.minute}′` : ""}
                    {g.detail === "Penalty" ? " (P)" : ""}
                  </span>
                </p>
              ))}
            </div>
            <div className="flex-1 space-y-1 text-left">
              {awayGoals.map((g, i) => (
                <p key={i}>
                  <span className="text-ink-faint">
                    {g.minute != null ? `${g.minute}′` : ""}
                    {g.detail === "Penalty" ? " (P) " : " "}
                  </span>
                  {g.player ?? "Goal"}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="mt-7 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          {finished ? "final result →" : "full markets & strategy →"}
        </p>
      </Link>

      {/* lineups + live read, inside the live match box */}
      {!finished && <LiveExtras m={m} />}
    </div>
  );
}

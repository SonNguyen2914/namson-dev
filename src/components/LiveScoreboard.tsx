// Live scoreboard for the landing page — Apple-Sports-style cards for
// matches in progress: prominent score, live minute, and goal scorers.
// Polls the feed-backed /live-scores endpoint (one API-Football call covers
// every live match at once, so this is budget-cheap). Renders nothing when
// no match is live, so it never clutters the page pre-match.
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, LiveScoreEntry } from "../lib/suggesterApi";

const POLL_MS = 30000; // live scores move fast; 30s keeps it fresh & cheap

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
    <section className="mb-10 space-y-4">
      {live.map((m) => (
        <LiveCard key={m.match_id} m={m} />
      ))}
    </section>
  );
}

function LiveCard({ m }: { m: LiveScoreEntry }) {
  const homeGoals = m.goals_list.filter((g) => g.team === "home");
  const awayGoals = m.goals_list.filter((g) => g.team === "away");
  const clock =
    m.status_short === "HT" ? "HT" :
    m.status_short === "FT" ? "FT" :
    m.minutes_elapsed != null ? `${Math.round(m.minutes_elapsed)}'` : m.status_short;

  return (
    <Link href={`/bet-suggester/market/${m.match_id}`}>
      <div className="cursor-pointer overflow-hidden rounded-2xl border border-red-900/50 bg-gradient-to-br from-neutral-900 via-red-950/20 to-neutral-900 p-6 transition hover:border-red-700/70">
        {/* live clock */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="animate-pulse text-red-500">●</span>
          <span className="text-xs uppercase tracking-widest text-red-400">
            live
          </span>
        </div>

        {/* score line — big and centered like the reference */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-right">
            <p className="text-lg text-neutral-200">
              {m.home}
              {m.red_home && <span className="ml-2 text-xs text-red-500">▮</span>}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold tabular-nums text-white">
              {m.home_goals}
            </span>
            <span className="text-sm tabular-nums text-neutral-400">{clock}</span>
            <span className="text-5xl font-bold tabular-nums text-white">
              {m.away_goals}
            </span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-lg text-neutral-200">
              {m.red_away && <span className="mr-2 text-xs text-red-500">▮</span>}
              {m.away}
            </p>
          </div>
        </div>

        {/* scorers, split under each side */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-4 flex items-start justify-between gap-4 text-xs text-neutral-500">
            <div className="flex-1 space-y-0.5 text-right">
              {homeGoals.map((g, i) => (
                <p key={i}>
                  {g.player ?? "Goal"} {g.minute != null ? `${g.minute}'` : ""}
                  {g.detail === "Penalty" ? " (P)" : ""} ⚽
                </p>
              ))}
            </div>
            <div className="flex-1 space-y-0.5 text-left">
              {awayGoals.map((g, i) => (
                <p key={i}>
                  ⚽ {g.player ?? "Goal"} {g.minute != null ? `${g.minute}'` : ""}
                  {g.detail === "Penalty" ? " (P)" : ""}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-neutral-600">
          tap for live model read &amp; markets
        </p>
      </div>
    </Link>
  );
}

// Live scoreboard for the landing page — the top of the showcase zone.
// Apple-Sports-style cards for matches in progress: the score is the hero
// (oversized numerals that flash when a goal lands), live clock, scorers
// split under each side, subtle radial red glow for depth.
// Polls the feed-backed /live-scores endpoint (one API-Football call covers
// every live match at once, so this is budget-cheap). Renders nothing when
// no match is live, so it never clutters the page pre-match.
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, flag, LiveScoreEntry } from "../lib/suggesterApi";
import { Eyebrow, Flash, Reveal } from "./ui";

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
    <section className="mb-20 space-y-5">
      {live.map((m) => (
        <Reveal key={m.match_id}>
          <LiveCard m={m} />
        </Reveal>
      ))}
    </section>
  );
}

function LiveCard({ m }: { m: LiveScoreEntry }) {
  const homeGoals = m.goals_list.filter((g) => g.team === "home");
  const awayGoals = m.goals_list.filter((g) => g.team === "away");
  const running = m.status_short !== "HT" && m.status_short !== "FT";
  const clock =
    m.status_short === "HT" ? "HT" :
    m.status_short === "FT" ? "FT" :
    m.minutes_elapsed != null ? `${Math.round(m.minutes_elapsed)}′` : m.status_short;

  return (
    <Link href={`/bet-suggester/market/${m.match_id}`} className="block">
      <div className="glow glow-live cursor-pointer overflow-hidden rounded-3xl border border-line bg-elev px-6 py-8 transition-colors duration-300 hover:border-live/40 sm:px-10 sm:py-10">
        {/* live badge */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-live" />
          <Eyebrow tone="live">live</Eyebrow>
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
              tone="live"
              className="text-6xl font-semibold tracking-tight tabular-nums text-ink-hi sm:text-8xl"
            />
            <span className={`font-mono text-sm tabular-nums sm:text-base ${
              running ? "text-live" : "text-ink-low"
            }`}>
              {clock}
            </span>
            <Flash
              value={m.away_goals}
              tone="live"
              className="text-6xl font-semibold tracking-tight tabular-nums text-ink-hi sm:text-8xl"
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
          live model read &amp; markets →
        </p>
      </div>
    </Link>
  );
}

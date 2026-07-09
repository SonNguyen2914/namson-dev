// Live scoreboard for the landing page — the top of the showcase zone.
// Apple-Sports-style cards for matches in progress: the score is the hero
// (oversized numerals that flash when a goal lands), live clock, scorers
// split under each side, subtle radial red glow for depth.
// Polls the feed-backed /live-scores endpoint (one API-Football call covers
// every live match at once, so this is budget-cheap). Renders nothing when
// no match is live, so it never clutters the page pre-match.
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, flag, LiveScoreEntry, TeamNewsResponse } from "../lib/suggesterApi";
import { Eyebrow, Flash, Reveal } from "./ui";
import { Collapse } from "./chrome";
import LivePanel from "./LivePanel";
import TeamNewsSection from "./TeamNews";

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
          {/* lineups + live read ride WITH the live match — outside the
              card's Link so their controls don't navigate */}
          {!m.is_finished && <LiveExtras m={m} />}
        </Reveal>
      ))}
    </section>
  );
}

// Lineups + the manual live read, attached under an in-progress match's
// score card. Both are self-contained: lineups poll the facts-only
// team-news endpoint (backend caches ESPN for 60s), the LivePanel manages
// its own state per match id.
function LiveExtras({ m }: { m: LiveScoreEntry }) {
  const [news, setNews] = useState<TeamNewsResponse | null>(null);

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
    return () => { alive = false; clearInterval(id); };
  }, [m.match_id]);

  return (
    <div className="mt-5">
      {news && (
        <Collapse eyebrow="team news" title="Official lineups">
          <TeamNewsSection news={news} home={m.home} away={m.away} />
        </Collapse>
      )}
      <Collapse eyebrow="in-play" title="Live read · what the model makes of the state">
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
    <Link href={`/bet-suggester/market/${m.match_id}`} className="block">
      <div className={`glow cursor-pointer overflow-hidden rounded-3xl border bg-elev px-6 py-8 transition-colors duration-300 sm:px-10 sm:py-10 ${
        finished
          ? "border-line hover:border-line-strong"
          : "glow-live border-line hover:border-live/40"
      }`}>
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
            <span className={`font-mono text-sm tabular-nums sm:text-base ${
              running ? "text-live" : "text-ink-low"
            }`}>
              {clock}
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
          {finished ? "final result →" : "live model read \u0026 markets →"}
        </p>
      </div>
    </Link>
  );
}

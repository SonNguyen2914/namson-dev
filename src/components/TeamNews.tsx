// Team news — FACTS ONLY. ESPN's official matchday squads, surfaced
// verbatim: starters, bench, and (by omission) who is out. No sentiment or
// rumor multipliers — a player left out of the squad has his per-match
// scoring chances zeroed in Player props, and that is the only model effect.
// Shared by the match page (pre-match home) and the landing page's live
// section (lineups beside the live score).
import { flag, LineupPlayer, TeamNewsResponse } from "../lib/suggesterApi";

export default function TeamNewsSection({ news, home, away }: {
  news: TeamNewsResponse;
  home: string;
  away: string;
}) {
  if (!news.available) {
    return (
      <div className="rounded-2xl border border-line bg-elev p-5">
        <p className="text-sm text-ink-mid">
          No official lineups yet — federations release them roughly an hour
          before kickoff.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          Once they post, starters and bench appear here, and any player left
          out of the matchday squad has this match&apos;s scoring chances zeroed
          in Player props — a settled fact, never a rumor adjustment.
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <LineupCard team={news.home_team || home} lu={news.home} />
        <LineupCard team={news.away_team || away} lu={news.away} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        Official matchday squads via ESPN. Players missing from the squad
        entirely are tagged OUT in Player props with this match&apos;s scoring
        chances set to zero — the only lineup effect the model applies.
      </p>
    </div>
  );
}

function LineupCard({ team, lu }: {
  team: string;
  lu?: { starters: LineupPlayer[]; bench: LineupPlayer[] };
}) {
  if (!lu) return null;
  return (
    <div className="rounded-2xl border border-line bg-elev p-5">
      <p className="mb-3 text-sm font-medium text-ink-hi">{flag(team)} {team}</p>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
        Starting XI
      </p>
      <ul className="space-y-1">
        {lu.starters.map((p) => (
          <li key={p.player} className="flex items-baseline gap-2 text-sm">
            <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-ink-faint">
              {p.shirt ?? ""}
            </span>
            <span className="min-w-0 truncate text-ink-hi">{p.player}</span>
            {p.pos && (
              <span className="ml-auto shrink-0 font-mono text-[10px] uppercase text-ink-faint">
                {p.pos}
              </span>
            )}
          </li>
        ))}
      </ul>
      {lu.bench.length > 0 && (
        <>
          <p className="mb-1 mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
            Bench
          </p>
          <p className="text-xs leading-relaxed text-ink-low">
            {lu.bench.map((p) => p.player).join(" · ")}
          </p>
        </>
      )}
    </div>
  );
}

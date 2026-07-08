// Knockout bracket — the single source of truth for the whole knockout
// picture. Reversed-pyramid layout: quarterfinals wide across the top,
// narrowing through semifinals to the final at the bottom point, with the
// 3rd-place match beside the final and a champion box at the very tip.
//
// Card states:
//   upcoming (resolved, not played) -> win probabilities + live countdown
//   finished                        -> final score, winner white / loser grey
//   placeholder (feeders unknown)   -> "TBD"
//
// Connecting lines link each pair of matches down to the slot they feed
// (QF1+QF2 -> SF1, QF3+QF4 -> SF2, SF1+SF2 -> Final).
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  api, flag, pct, countdown, BracketMatch, BracketResponse,
} from "../lib/suggesterApi";
import { Eyebrow, Reveal } from "./ui";

export default function BracketView() {
  const [b, setB] = useState<BracketResponse | null>(null);
  const [, setTick] = useState(0); // ticking clock for per-card countdowns

  useEffect(() => {
    let alive = true;
    const load = () => api.bracket().then((r) => { if (alive) setB(r); }).catch(() => {});
    load();
    const poll = setInterval(load, 60000);
    const tick = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { alive = false; clearInterval(poll); clearInterval(tick); };
  }, []);

  if (!b || b.quarterfinals.length === 0) return null;

  return (
    <Reveal>
      <section>
        <Eyebrow className="mb-2">bracket</Eyebrow>
        <h3 className="mb-8 text-lg font-medium text-ink-hi">
          Road to the final <span className="text-sm font-normal text-ink-low">· model win probabilities</span>
        </h3>

        <div className="mx-auto max-w-4xl">
          <RoundLabel>Quarter-finals</RoundLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {b.quarterfinals.map((m) => <BracketCard key={m.match_id} m={m} />)}
          </div>

          <BranchLines />

          <RoundLabel>Semi-finals</RoundLabel>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {b.semifinals.map((m) => <BracketCard key={m.match_id} m={m} />)}
          </div>

          <BranchLines />

          <RoundLabel>Final</RoundLabel>
          <div className="mx-auto max-w-md">
            {b.final.map((m) => <BracketCard key={m.match_id} m={m} emphasis />)}
          </div>

          {b.third_place.length > 0 && (
            <div className="mx-auto mt-4 max-w-xs opacity-80">
              <p className="mb-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                Third place
              </p>
              {b.third_place.map((m) => <BracketCard key={m.match_id} m={m} small />)}
            </div>
          )}

          <ChampionBox champion={b.champion} />
        </div>
      </section>
    </Reveal>
  );
}

function RoundLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
      {children}
    </p>
  );
}

// Subtle centered connector between rounds — a short drop that reads as
// "these feed downward" without the sprawl of a horizontal bracket.
function BranchLines() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <div className="h-5 w-px bg-line" />
    </div>
  );
}

function BracketCard({ m, emphasis = false, small = false }: {
  m: BracketMatch; emphasis?: boolean; small?: boolean;
}) {
  const tbd = !m.fully_resolved;
  const finished = m.result != null;
  const kickoff = new Date(m.kickoff);
  const secs = Math.floor((kickoff.getTime() - Date.now()) / 1000);

  const pad = small ? "p-2.5" : "p-3";
  const border = emphasis && !finished ? "border-accent/30" : "border-line";

  const inner = (
    <div className={`rounded-xl border ${pad} transition-colors ${
      tbd ? "border-dashed border-line"
          : `cursor-pointer ${border} hover:border-line-strong hover:bg-elev`
    } ${emphasis ? "bg-elev" : ""}`}>
      <TeamLine
        name={m.home} resolved={m.home_resolved}
        prob={m.probs?.home_win}
        score={m.result?.home_goals}
        state={finished ? (m.result!.winner === "home" ? "win" : "loss") : "none"}
        small={small}
      />
      <div className="my-1.5 h-px bg-line" />
      <TeamLine
        name={m.away} resolved={m.away_resolved}
        prob={m.probs?.away_win}
        score={m.result?.away_goals}
        state={finished ? (m.result!.winner === "away" ? "win" : "loss") : "none"}
        small={small}
      />
      <p className="mt-2 text-center font-mono text-[10px] tracking-wide text-ink-faint">
        {tbd ? "awaiting bracket"
          : finished ? (m.result!.status_short || "FT")
          : secs > 0 ? countdown(secs)
          : "kickoff"}
      </p>
    </div>
  );

  return tbd ? inner : (
    <Link href={`/bet-suggester/market/${m.match_id}`} className="block">{inner}</Link>
  );
}

function TeamLine({ name, resolved, prob, score, state, small }: {
  name: string;
  resolved: boolean;
  prob?: number;
  score?: number;
  state: "win" | "loss" | "none";
  small?: boolean;
}) {
  // Finished: winner white, loser greyed. Upcoming: probability-tinted.
  const textColor =
    state === "win" ? "text-ink-hi font-medium"
    : state === "loss" ? "text-ink-faint"
    : resolved ? "text-ink-mid"
    : "text-ink-low";

  return (
    <div className="flex items-center gap-2">
      <span className={`shrink-0 ${small ? "text-sm" : "text-base"}`}>
        {resolved ? flag(name) : "\u2022"}
      </span>
      <span className={`flex-1 truncate ${small ? "text-xs" : "text-sm"} ${textColor}`}>
        {name}
      </span>
      {state !== "none" ? (
        <span className={`shrink-0 font-mono tabular-nums ${small ? "text-sm" : "text-base"} ${
          state === "win" ? "text-ink-hi" : "text-ink-faint"
        }`}>
          {score}
        </span>
      ) : prob != null ? (
        <span className={`shrink-0 font-mono text-xs tabular-nums ${
          prob >= 0.5 ? "text-accent" : "text-ink-low"
        }`}>
          {pct(prob)}
        </span>
      ) : null}
    </div>
  );
}

function ChampionBox({ champion }: { champion: string | null }) {
  return (
    <>
      <BranchLines />
      <div className="mx-auto max-w-xs">
        <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Champion
        </p>
        <div className={`rounded-xl border p-4 text-center ${
          champion ? "glow glow-accent border-accent/40 bg-elev"
                   : "border-dashed border-line"
        }`}>
          {champion ? (
            <p className="text-lg font-semibold tracking-tight text-ink-hi">
              <span className="mr-2">{flag(champion)}</span>{champion}
            </p>
          ) : (
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              to be decided
            </p>
          )}
        </div>
      </div>
    </>
  );
}

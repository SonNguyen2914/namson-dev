// Knockout bracket — the single source of truth for the whole knockout
// picture. Reversed-pyramid layout: quarterfinals wide across the top,
// narrowing through semifinals to the final at the bottom point. The
// 3rd-place match sits OFF TO THE SIDE of the final (not in the pyramid),
// and a champion box caps the tip.
//
// Card states:
//   upcoming (resolved, not played) -> win probabilities (higher side green)
//                                       + edge vs market + local kickoff time
//   finished                        -> final score, winner white / loser grey
//   placeholder (feeders unknown)   -> "TBD"
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  api, flag, pct, signedPct, countdown, kickoffLocal,
  BracketMatch, BracketResponse,
} from "../lib/suggesterApi";
import { Eyebrow, Reveal } from "./ui";

export default function BracketView() {
  const [b, setB] = useState<BracketResponse | null>(null);
  const [, setTick] = useState(0); // ticking clock for per-card countdowns

  useEffect(() => {
    let alive = true;
    // ONE bracket call carries probs + edges — no per-match prediction
    // fetches (those triggered fresh backend sims every cache expiry,
    // multiplied per viewer).
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
          Road to the final <span className="text-sm font-normal text-ink-low">· model win probabilities + edge</span>
        </h3>

        <div className="mx-auto max-w-4xl">
          <RoundLabel>Quarter-finals</RoundLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {b.quarterfinals.map((m) => (
              <BracketCard key={m.match_id} m={m} />
            ))}
          </div>

          <BranchLines />

          <RoundLabel>Semi-finals</RoundLabel>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {b.semifinals.map((m) => (
              <BracketCard key={m.match_id} m={m} />
            ))}
          </div>

          <BranchLines />

          <RoundLabel>Final</RoundLabel>
          {/* Final centered; 3rd-place beside it (not in the pyramid). A grid
              with symmetric side columns RESERVES the space, so the two cards
              can never overlap at any width (absolute positioning could). */}
          <div className="mx-auto max-w-4xl lg:grid lg:grid-cols-[1fr_minmax(0,26rem)_1fr] lg:items-start lg:gap-4">
            <div className="hidden lg:block" aria-hidden />
            <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              {b.final.map((m) => (
                <BracketCard key={m.match_id} m={m} emphasis />
              ))}
            </div>

            {b.third_place.length > 0 ? (
              <div className="mx-auto mt-6 max-w-xs opacity-90 lg:mx-0 lg:mt-0 lg:max-w-none">
                <p className="mb-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                  Third place
                </p>
                {b.third_place.map((m) => (
                  <BracketCard key={m.match_id} m={m} small />
                ))}
              </div>
            ) : (
              <div className="hidden lg:block" aria-hidden />
            )}
          </div>

          <ChampionBox champion={b.champion} forecast={b.champion_forecast} />
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
  m: BracketMatch;
  emphasis?: boolean;
  small?: boolean;
}) {
  const tbd = !m.fully_resolved;
  const finished = m.result != null;
  const kickoff = new Date(m.kickoff);
  const secs = Math.floor((kickoff.getTime() - Date.now()) / 1000);

  // The higher of the two win probabilities gets the green (accent) tint,
  // regardless of whether it clears 50% — a draw can leave the favourite
  // under 50%, but it's still the model's pick.
  const hp = m.probs?.home_win ?? 0;
  const ap = m.probs?.away_win ?? 0;
  const homeLeads = hp >= ap;

  const pad = small ? "p-2.5" : "p-3";
  const border = emphasis && !finished ? "border-accent/30" : "border-line";

  const inner = (
    <div className={`rounded-xl border ${pad} transition-colors ${
      tbd ? "border-dashed border-line"
          : `cursor-pointer ${border} hover:border-line-strong hover:bg-elev`
    } ${emphasis ? "bg-elev" : ""}`}>
      <TeamLine
        name={m.home} resolved={m.home_resolved}
        prob={m.probs?.home_win} edge={m.probs?.home_edge} leader={homeLeads}
        score={m.result?.home_goals}
        state={finished ? (m.result!.winner === "home" ? "win" : "loss") : "none"}
        small={small} forecast={m.forecast?.home}
      />
      <div className="my-1.5 h-px bg-line" />
      <TeamLine
        name={m.away} resolved={m.away_resolved}
        prob={m.probs?.away_win} edge={m.probs?.away_edge} leader={!homeLeads}
        score={m.result?.away_goals}
        state={finished ? (m.result!.winner === "away" ? "win" : "loss") : "none"}
        small={small} forecast={m.forecast?.away}
      />
      <div className="mt-2 space-y-0.5 text-center font-mono text-[10px] tracking-wide text-ink-faint">
        <p>{kickoffLocal(m.kickoff)}</p>
        <p>
          {tbd ? "awaiting bracket"
            : finished ? (m.result!.status_short || "FT")
            : secs > 0 ? countdown(secs)
            : "kickoff"}
        </p>
      </div>
    </div>
  );

  return tbd ? inner : (
    <Link href={`/bet-suggester/market/${m.match_id}`} className="block">{inner}</Link>
  );
}

function TeamLine({ name, resolved, prob, edge, leader, score, state, small, forecast }: {
  name: string;
  resolved: boolean;
  prob?: number;
  edge?: number | null;
  leader?: boolean;
  score?: number;
  state: "win" | "loss" | "none";
  small?: boolean;
  forecast?: { team: string; p: number } | null;
}) {
  // Finished: winner white, loser greyed. Upcoming: the leading side green.
  const textColor =
    state === "win" ? "text-ink-hi font-medium"
    : state === "loss" ? "text-ink-faint"
    : state === "none" && prob != null && leader ? "text-ink-hi"
    : resolved ? "text-ink-mid"
    : "text-ink-low";

  // Unresolved slot with a model forecast: ghost the predicted team's flag
  // and show "model: <team> <p>" under the placeholder label.
  const showForecast = !resolved && forecast != null;

  return (
    <div className="flex items-center gap-2">
      <span className={`shrink-0 ${small ? "text-sm" : "text-base"} ${showForecast ? "opacity-60" : ""}`}>
        {resolved ? flag(name) : showForecast ? flag(forecast!.team) : "•"}
      </span>
      <span className={`min-w-0 flex-1 ${small ? "text-xs" : "text-sm"} ${textColor}`}>
        <span className="block truncate">{name}</span>
        {showForecast && (
          <span className="block truncate font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
            model: <span className="text-accent/80">{forecast!.team} {pct(forecast!.p)}</span>
          </span>
        )}
      </span>
      {state !== "none" ? (
        <span className={`shrink-0 font-mono tabular-nums ${small ? "text-sm" : "text-base"} ${
          state === "win" ? "text-ink-hi" : "text-ink-faint"
        }`}>
          {score}
        </span>
      ) : prob != null ? (
        <span className="shrink-0 text-right leading-tight">
          <span className={`block font-mono text-xs tabular-nums ${
            leader ? "text-accent" : "text-ink-low"
          }`}>
            {pct(prob)}
          </span>
          {edge != null && (
            <span className={`block font-mono text-[9px] tabular-nums ${
              edge >= 0 ? "text-accent" : "text-neg"
            }`}>
              {signedPct(edge)}
            </span>
          )}
        </span>
      ) : null}
    </div>
  );
}

function ChampionBox({ champion, forecast }: {
  champion: string | null;
  forecast?: { team: string; p: number } | null;
}) {
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
            <>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
                to be decided
              </p>
              {forecast != null && (
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                  model pick:{" "}
                  <span className="text-accent">
                    {flag(forecast.team)} {forecast.team} {pct(forecast.p)}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

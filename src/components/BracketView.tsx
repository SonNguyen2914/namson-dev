// Knockout bracket — reversed-pyramid layout: quarterfinals wide across the
// top, narrowing to semifinals, down to the final at the bottom point.
// Each resolved match shows model win probabilities on a thin split bar.
// Placeholder rounds (SF/final before their feeders finish) render as TBD.
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, flag, pct, BracketMatch, BracketResponse } from "../lib/suggesterApi";
import { Eyebrow, Reveal } from "./ui";

export default function BracketView() {
  const [b, setB] = useState<BracketResponse | null>(null);

  useEffect(() => {
    let alive = true;
    api.bracket().then((r) => { if (alive) setB(r); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!b || b.quarterfinals.length === 0) return null;

  return (
    <Reveal>
      <section className="mb-20">
        <Eyebrow className="mb-2">bracket</Eyebrow>
        <h3 className="mb-6 text-lg font-medium text-ink-hi">
          Road to the final <span className="text-sm font-normal text-ink-low">· model win probabilities</span>
        </h3>

        {/* Reversed pyramid: each round is a centered row, narrowing downward */}
        <div className="space-y-3">
          {/* Quarterfinals — widest */}
          <BracketRow label="Quarter-finals" matches={b.quarterfinals} maxW="100%" />
          <Connector />
          {/* Semifinals */}
          <BracketRow label="Semi-finals" matches={b.semifinals} maxW="66%" />
          {b.final.length > 0 && (
            <>
              <Connector />
              <BracketRow label="Final" matches={b.final} maxW="33%" />
            </>
          )}
        </div>
      </section>
    </Reveal>
  );
}

function BracketRow({ label, matches, maxW }: {
  label: string; matches: BracketMatch[]; maxW: string;
}) {
  if (matches.length === 0) return null;
  return (
    <div className="mx-auto" style={{ maxWidth: maxW }}>
      <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </p>
      <div className={`grid gap-3 ${
        matches.length >= 4 ? "sm:grid-cols-4"
        : matches.length === 2 ? "sm:grid-cols-2"
        : "sm:grid-cols-1"
      }`}>
        {matches.map((m) => <BracketCard key={m.match_id} m={m} />)}
      </div>
    </div>
  );
}

function BracketCard({ m }: { m: BracketMatch }) {
  const tbd = !m.fully_resolved;
  const kickoff = new Date(m.kickoff);
  const when = kickoff.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    + " " + kickoff.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const inner = (
    <div className={`rounded-xl border p-3 transition-colors ${
      tbd ? "border-dashed border-line"
          : "cursor-pointer border-line hover:border-line-strong hover:bg-elev"
    }`}>
      <TeamLine name={m.home} resolved={m.home_resolved}
        prob={m.probs?.home_win} winner={m.probs ? m.probs.home_win > m.probs.away_win : false} />
      <div className="my-1.5 h-px bg-line" />
      <TeamLine name={m.away} resolved={m.away_resolved}
        prob={m.probs?.away_win} winner={m.probs ? m.probs.away_win > m.probs.home_win : false} />
      <p className="mt-2 text-center font-mono text-[10px] tracking-wide text-ink-faint">
        {tbd ? "awaiting bracket" : when}
      </p>
    </div>
  );

  return tbd ? inner : (
    <Link href={`/bet-suggester/market/${m.match_id}`} className="block">{inner}</Link>
  );
}

function TeamLine({ name, resolved, prob, winner }: {
  name: string; resolved: boolean; prob?: number; winner: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-base">{resolved ? flag(name) : "•"}</span>
      <span className={`flex-1 truncate text-sm ${
        resolved ? (winner ? "text-ink-hi" : "text-ink-mid") : "text-ink-low"
      }`}>
        {name}
      </span>
      {prob != null && (
        <span className={`shrink-0 font-mono text-xs tabular-nums ${
          winner ? "text-accent" : "text-ink-low"
        }`}>
          {pct(prob)}
        </span>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <div className="h-4 w-px bg-line" />
    </div>
  );
}

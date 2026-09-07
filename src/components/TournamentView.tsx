// Tournament surface for viewer competitions that have one — built on the
// WC26 page's bracket language: the champion spot crowns the top with its
// percentage inside, then the flipped pyramid unfolds beneath (final,
// semis, groups). One structural difference it must never lose: the WC26
// bracket shows a MODEL's win probabilities and edges; this shows a
// Monte-Carlo forecast on an EXTERNAL published rating (eloratings.net).
// Every ghost line under an unresolved slot says "forecast:", never
// "model:", and no edge column exists because no edge exists here.
//
// Renders null for competitions whose backend serves no tournament —
// the 404 is the feature switch, so this component mounts unconditionally
// on the shared /comp/[key] page without per-competition frontend code.
import { useEffect, useState } from "react";

import { flag } from "../lib/suggesterApi";
import { Eyebrow, Reveal } from "./ui";

type TableRow = {
  team: string; played: number; w: number; d: number; l: number;
  gf: number; ga: number; gd: number; points: number;
};
type ForecastRow = {
  team: string; p_champion: number; p_final: number; p_semis: number;
};
type SlotDist = { team: string; p: number };
type Slot = { label: string; dist: SlotDist[] };
type ProjectedTie = {
  name: string; home_slot: Slot; away_slot: Slot; winner_dist?: SlotDist[];
};
type RealTie = {
  teams: { team: string; p_advance: number | null }[];
  legs: { kickoff_utc?: string; status?: string; home?: string;
          away?: string; goals?: { home: number | null;
                                   away: number | null } }[];
  aggregate?: string | null;
  legs_settled?: number;
};
type Bracket = {
  projected: boolean; basis?: string;
  semifinals?: (ProjectedTie | RealTie)[];
  final?: { home_slot: Slot; away_slot: Slot };
  final_ties?: RealTie[];
};
type Tournament = {
  available?: boolean; reason?: string;
  format?: string; forecast_kind?: string;
  assumptions?: Record<string, string>;
  groups?: { name: string; table: TableRow[] }[];
  remaining_group_matches?: number;
  knockout_fixtures_published?: number;
  n_sims?: number; tiebreak_proxy_share?: number;
  champion?: string | null;
  champion_forecast?: ForecastRow[];
  champion_forecast_leader?: { team: string; p: number } | null;
  bracket?: Bracket;
};

const pct = (p: number) => `${(p * 100).toFixed(p >= 0.1 ? 0 : 1)}%`;

// FOUR FACTS, NOT ONE BLANK.
//
// The header above says "the 404 is the feature switch" — a competition
// with no tournament answers 404 and this component renders nothing, on
// purpose and unconditionally, so /comp/[key] needs no per-competition
// frontend code. That design is kept exactly. What was wrong is that
// EVERY other outcome arrived at the same `setT(null)` on the same line:
// a 500, a proxy timeout, a body that would not parse. So a backend that
// fell over rendered as "this competition has no tournament" — a claim
// about the competition made off a read that never landed.
//
// The switch is now the thing it claims to be: it is the 404 status
// specifically that means "no tournament here", and only it. Anything
// else is named, in the failure's own words. Three states, the type
// LaligaDashboard.tsx's `settle()` established; redeclared here rather
// than imported because src/lib is not this change's to add to, and the
// duplication is named so a later extraction knows what it collects.
type Read<T> =
  | { s: "asking" }
  | { s: "absent" }                       // the 404 — the feature switch
  | { s: "failed"; why: string }
  | { s: "ok"; d: T };

/** The failure's own words, never a shrug. */
const why = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

/** The read behind what is drawn did not land; what IS drawn is the
 *  earlier answer. Said as real text, in the refusal ink family — never
 *  the up/neg traffic light, which here would read as a verdict on a
 *  tie. Declared at module scope: a component created during render
 *  resets its state on every render, and this repo's lint makes that an
 *  error. */
function StaleNotice({ reason }: { reason: string | null }) {
  if (reason === null) return null;
  return (
    <p data-testid="tournament-read-stale" role="status"
      className="mb-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
      The tournament read failed: {reason}. Everything below is from the
      last read that answered and has not been refreshed.
    </p>
  );
}

export default function TournamentView({ compKey }: { compKey: string }) {
  const [read, setRead] = useState<Read<Tournament>>({ s: "asking" });
  // A forecast that arrived once is KEPT when a later poll fails; the
  // poll is five minutes apart, so a stale bracket beats a vanished one.
  const [lastOk, setLastOk] = useState<Tournament | null>(null);
  // A COMPETITION'S ANSWER MUST NOT SURVIVE INTO THE NEXT COMPETITION.
  // /comp/[key] keeps this component mounted across a client-side hop,
  // so without a reset the previous key's forecast would be drawn under
  // the new key's name. React's "adjust state when input changes"
  // pattern — a conditional setState during RENDER, which LivePanel.tsx
  // already uses for its lever tracking — not a setState in an effect
  // body, which this repo's lint makes an error.
  const [forKey, setForKey] = useState(compKey);
  if (forKey !== compKey) {
    setForKey(compKey);
    setRead({ s: "asking" });
    setLastOk(null);
  }

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/comp/${compKey}/tournament`);
        if (!alive) return;
        // THE SWITCH, AND NOTHING ELSE THROUGH IT.
        if (r.status === 404) { setRead({ s: "absent" }); return; }
        if (!r.ok) {
          setRead({ s: "failed", why: `the tournament read answered ${r.status}` });
          return;
        }
        const j = (await r.json()) as Tournament;
        if (!alive) return;
        setLastOk(j);
        setRead({ s: "ok", d: j });
      } catch (e) {
        if (alive) setRead({ s: "failed", why: why(e) });
      }
    };
    load();
    const poll = setInterval(load, 300000);
    return () => { alive = false; clearInterval(poll); };
  }, [compKey]);

  // NOTHING ASKED YET, and THE ANSWER WAS "no tournament for this
  // competition" — the only two states that may draw nothing at all.
  if (read.s === "asking" || read.s === "absent") return null;

  if (read.s === "failed" && !lastOk) {
    return (
      <section className="mt-10 rounded-2xl border border-warn/40 bg-warn/5 p-5">
        <Eyebrow>tournament</Eyebrow>
        <p data-testid="tournament-read-failed" role="status"
          className="mt-2 text-[12px] leading-relaxed text-warn">
          The tournament read failed: {read.why}. That is not this
          competition having no tournament — a competition without one
          answers 404, and this did not. It is that we could not ask.
        </p>
      </section>
    );
  }

  const t = read.s === "ok" ? read.d : lastOk!;
  const staleWhy = read.s === "failed" ? read.why : null;

  if (t.available === false) {
    return (
      <section className="mt-10 rounded-2xl border border-dashed border-line p-5">
        <Eyebrow>tournament</Eyebrow>
        <StaleNotice reason={staleWhy} />
        <p className="mt-2 font-mono text-[11px] text-ink-faint">
          forecast withheld — {t.reason}
        </p>
      </section>
    );
  }
  const fc = t.champion_forecast || [];
  const lead = t.champion_forecast_leader;
  const b = t.bracket;

  return (
    <Reveal>
      <section className="mt-12">
        <Eyebrow className="mb-2">bracket · forecast</Eyebrow>
        <StaleNotice reason={staleWhy} />
        <h3 className="mb-1 text-lg font-medium text-ink-hi">
          Road to the title{" "}
          <span className="text-sm font-normal text-ink-low">
            · external-rating forecast, not a model
          </span>
        </h3>
        <p className="mb-8 max-w-3xl text-[11px] leading-relaxed text-ink-faint">
          {t.forecast_kind}
        </p>

        <div className="mx-auto max-w-4xl">
          {/* ============ the champion spot, % inside ============ */}
          <div className="mx-auto max-w-xs">
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Champion
            </p>
            <div className={`rounded-xl border p-4 text-center ${
              t.champion
                ? "glow glow-accent border-accent/40 bg-elev"
                : "border-dashed border-line"
            }`}>
              {t.champion ? (
                <p className="text-lg font-semibold text-ink-hi">
                  {flag(t.champion)} {t.champion}
                </p>
              ) : lead ? (
                <>
                  <p className="flex items-baseline justify-center gap-2">
                    <span className="text-lg font-semibold text-ink-hi">
                      {flag(lead.team)} {lead.team}
                    </span>
                    <span className="font-mono text-2xl font-semibold tabular-nums text-accent">
                      {pct(lead.p)}
                    </span>
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                    forecast · not crowned ·{" "}
                    {t.n_sims?.toLocaleString()} sims
                  </p>
                </>
              ) : (
                <p className="text-ink-faint">TBD</p>
              )}
            </div>
          </div>

          <BranchLines />
          <RoundLabel>Final · two legs</RoundLabel>
          <div className="mx-auto max-w-md">
            {b?.projected && b.final ? (
              <ProjectedCard
                home={b.final.home_slot} away={b.final.away_slot} emphasis />
            ) : b?.final_ties?.length ? (
              b.final_ties.map((tie, i) => (
                <RealTieCard key={i} tie={tie} emphasis />
              ))
            ) : (
              <PlaceholderCard label="TBD" />
            )}
          </div>

          <BranchLines />
          <RoundLabel>Semi-finals · two legs</RoundLabel>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {b?.projected
              ? (b.semifinals as ProjectedTie[] | undefined)?.map((sf) => (
                  <ProjectedCard key={sf.name} home={sf.home_slot}
                    away={sf.away_slot} winner={sf.winner_dist?.[0]} />
                ))
              : (b?.semifinals as RealTie[] | undefined)?.map((tie, i) => (
                  <RealTieCard key={i} tie={tie} />
                ))}
          </div>
          {b?.projected && (
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-wide text-ink-faint">
              projected — pairings are not drawn until the groups finish
            </p>
          )}

          <BranchLines />
          <RoundLabel>Groups</RoundLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(t.groups || []).map((g) => (
              <div key={g.name}
                className="rounded-2xl border border-line bg-elev p-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  {g.name}
                </p>
                <table className="w-full font-mono text-[11px]">
                  <thead>
                    <tr className="text-left text-[9px] uppercase text-ink-faint">
                      <th className="pb-1 pr-2 font-normal">team</th>
                      <th className="pb-1 pr-2 text-right font-normal">p</th>
                      <th className="pb-1 pr-2 text-right font-normal">w-d-l</th>
                      <th className="pb-1 pr-2 text-right font-normal">gd</th>
                      <th className="pb-1 text-right font-normal">pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.table.map((r, i) => (
                      <tr key={r.team}
                        className={i < 2 ? "text-ink-hi" : "text-ink-faint"}>
                        <td className="py-0.5 pr-2">
                          {i < 2 && (
                            <span className="mr-1 text-accent">▸</span>
                          )}
                          {flag(r.team)} {r.team}
                        </td>
                        <td className="py-0.5 pr-2 text-right">{r.played}</td>
                        <td className="py-0.5 pr-2 text-right">
                          {r.w}-{r.d}-{r.l}
                        </td>
                        <td className="py-0.5 pr-2 text-right">
                          {r.gd > 0 ? `+${r.gd}` : r.gd}
                        </td>
                        <td className="py-0.5 text-right text-ink-hi">
                          {r.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* the full forecast — every team, three stages */}
          <div className="mt-8 rounded-2xl border border-line bg-elev p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              champion forecast · {t.n_sims?.toLocaleString()} sims ·
              seed fixed
            </p>
            <div className="space-y-1.5">
              {fc.map((r) => (
                <div key={r.team}
                  className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="w-28 shrink-0 truncate text-ink-mid">
                    {flag(r.team)} {r.team}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-line/40">
                    <div className="h-full rounded bg-accent/70"
                      style={{ width: `${Math.max(r.p_champion * 100, 0.5)}%` }} />
                  </div>
                  <span className="w-12 shrink-0 text-right text-ink-hi">
                    {pct(r.p_champion)}
                  </span>
                  <span className="hidden w-24 shrink-0 text-right text-ink-faint sm:inline">
                    final {pct(r.p_final)}
                  </span>
                </div>
              ))}
            </div>
            {t.assumptions && (
              <details className="mt-4">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  assumptions — read before quoting a number
                </summary>
                <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-ink-faint">
                  {Object.entries(t.assumptions).map(([k, v]) => (
                    <li key={k}>
                      <span className="text-ink-low">{k}:</span> {v}
                    </li>
                  ))}
                  {t.tiebreak_proxy_share != null && (
                    <li>
                      <span className="text-ink-low">proxy impact:</span>{" "}
                      the tiebreak proxy decided a qualification slot in{" "}
                      {pct(t.tiebreak_proxy_share)} of simulations
                    </li>
                  )}
                  {b?.basis && (
                    <li>
                      <span className="text-ink-low">bracket:</span> {b.basis}
                    </li>
                  )}
                </ul>
              </details>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function RoundLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-ink-faint">
      {children}
    </p>
  );
}

// Subtle centered connector between rounds — same drop the WC26 bracket
// uses, so the two pages read as one family.
function BranchLines() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <div className="h-5 w-px bg-line" />
    </div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-3 text-center font-mono text-[11px] text-ink-faint">
      {label}
    </div>
  );
}

// An unresolved slot, WC26-style: the slot label carries a ghosted
// forecast of its most likely occupant — labelled "forecast:", never
// "model:" — and the occupant's probability sits where the WC26 card
// puts its win probability.
function SlotLine({ slot, leader }: { slot: Slot; leader: boolean }) {
  const top = slot.dist?.[0];
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-base opacity-60">
        {top ? flag(top.team) : "•"}
      </span>
      <span className="min-w-0 flex-1 text-sm text-ink-low">
        <span className="block truncate">{slot.label}</span>
        {top && (
          <span className="block truncate font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
            forecast:{" "}
            <span className="text-accent/80">
              {top.team} {pct(top.p)}
            </span>
          </span>
        )}
      </span>
      {top && (
        <span className={`shrink-0 font-mono text-xs tabular-nums ${
          leader ? "text-accent" : "text-ink-low"}`}>
          {pct(top.p)}
        </span>
      )}
    </div>
  );
}

function ProjectedCard({ home, away, winner, emphasis = false }: {
  home: Slot; away: Slot; winner?: SlotDist; emphasis?: boolean;
}) {
  const hp = home.dist?.[0]?.p ?? 0;
  const ap = away.dist?.[0]?.p ?? 0;
  return (
    <div className={`rounded-xl border border-dashed border-line p-3 ${
      emphasis ? "bg-elev" : ""}`}>
      <SlotLine slot={home} leader={hp >= ap} />
      <div className="my-1.5 h-px bg-line" />
      <SlotLine slot={away} leader={ap > hp} />
      {winner && (
        <p className="mt-2 text-center font-mono text-[10px] tracking-wide text-ink-faint">
          tie forecast:{" "}
          <span className="text-accent/80">
            {winner.team} {pct(winner.p)}
          </span>
        </p>
      )}
    </div>
  );
}

// A published two-legged tie: real teams, real legs, aggregate as it
// lands. p_advance is the Elo expectation; no winner is claimed from an
// aggregate — regulations decide those, not this card.
function RealTieCard({ tie, emphasis = false }: {
  tie: RealTie; emphasis?: boolean;
}) {
  const [t1, t2] = tie.teams;
  const lead1 = (t1.p_advance ?? 0) >= (t2.p_advance ?? 0);
  return (
    <div className={`rounded-xl border border-line p-3 ${
      emphasis ? "border-accent/30 bg-elev" : ""}`}>
      {[t1, t2].map((s, i) => (
        <div key={s.team}>
          {i === 1 && <div className="my-1.5 h-px bg-line" />}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-base">{flag(s.team)}</span>
            <span className={`min-w-0 flex-1 truncate text-sm ${
              (i === 0 ? lead1 : !lead1) ? "text-ink-hi" : "text-ink-mid"}`}>
              {s.team}
            </span>
            {s.p_advance != null && (
              <span className={`shrink-0 font-mono text-xs tabular-nums ${
                (i === 0 ? lead1 : !lead1) ? "text-accent" : "text-ink-low"}`}>
                {pct(s.p_advance)}
              </span>
            )}
          </div>
        </div>
      ))}
      <div className="mt-2 space-y-0.5 text-center font-mono text-[10px] tracking-wide text-ink-faint">
        {tie.aggregate && (
          <p>
            aggregate <span className="text-ink-hi">{tie.aggregate}</span>
            {" "}after {tie.legs_settled} leg{tie.legs_settled === 1 ? "" : "s"}
          </p>
        )}
        {tie.legs?.map((l, i) => (
          <p key={i}>
            leg {i + 1} · {l.home} v {l.away} ·{" "}
            {l.status && l.status !== "NS" && l.goals?.home != null
              ? `${l.goals.home}-${l.goals.away} (${l.status})`
              : l.kickoff_utc
                ? new Date(l.kickoff_utc).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "numeric",
                    minute: "2-digit" })
                : "TBD"}
          </p>
        ))}
      </div>
    </div>
  );
}

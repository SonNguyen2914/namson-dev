// Tournament surface for viewer competitions that have one — groups,
// bracket skeleton, and a champion FORECAST. Mirrors BracketView's
// flipped-pyramid language (champion crowns the top, the road unfolds
// beneath) with one structural difference it must never lose: BracketView
// shows a MODEL's win probabilities and edges; this shows a Monte-Carlo
// forecast on an EXTERNAL published rating (eloratings.net). No edge
// column exists here because no edge exists here.
//
// Renders null for competitions whose backend serves no tournament —
// the 404 is the feature switch, so this component mounts unconditionally
// on the shared /comp/[key] page without per-competition frontend code.
import { useEffect, useState } from "react";

import { Eyebrow, Reveal } from "./ui";

type TableRow = {
  team: string; played: number; w: number; d: number; l: number;
  gf: number; ga: number; gd: number; points: number;
};
type ForecastRow = {
  team: string; p_champion: number; p_final: number; p_semis: number;
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
};

const pct = (p: number) =>
  `${(p * 100).toFixed(p >= 0.1 ? 0 : 1)}%`;

export default function TournamentView({ compKey }: { compKey: string }) {
  const [t, setT] = useState<Tournament | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/comp/${compKey}/tournament`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => { if (alive) setT(j); })
        .catch(() => { if (alive) setT(null); });
    load();
    const poll = setInterval(load, 300000);
    return () => { alive = false; clearInterval(poll); };
  }, [compKey]);

  if (!t) return null;
  if (t.available === false) {
    return (
      <section className="mt-10 rounded-2xl border border-dashed border-line p-5">
        <Eyebrow>tournament</Eyebrow>
        <p className="mt-2 font-mono text-[11px] text-ink-faint">
          forecast withheld — {t.reason}
        </p>
      </section>
    );
  }
  const fc = t.champion_forecast || [];
  const lead = t.champion_forecast_leader;
  const semisKnown = (t.knockout_fixtures_published || 0) > 0;

  return (
    <Reveal>
      <section className="mt-12">
        <Eyebrow className="mb-2">bracket · forecast</Eyebrow>
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
          {/* champion box — dashed until the real final crowns someone */}
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
                <p className="text-lg font-semibold text-ink-hi">{t.champion}</p>
              ) : lead ? (
                <>
                  <p className="text-lg font-semibold text-ink-hi">
                    {lead.team}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-accent">
                    {pct(lead.p)} in the forecast
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                    not crowned — {t.n_sims?.toLocaleString()} simulations
                  </p>
                </>
              ) : (
                <p className="text-ink-faint">TBD</p>
              )}
            </div>
          </div>

          <PyramidGap />
          <RoundLabel>Final · two legs</RoundLabel>
          <div className="mx-auto max-w-md">
            <TieCard label={semisKnown ? "TBD" : "Winner SF1 v Winner SF2"} />
          </div>

          <PyramidGap />
          <RoundLabel>Semi-finals · two legs</RoundLabel>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <TieCard label="Winner A v Runner-up B" />
            <TieCard label="Winner B v Runner-up A" />
          </div>

          <PyramidGap />
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
                          {r.team}
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
                  <span className="w-24 shrink-0 truncate text-ink-mid">
                    {r.team}
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

function PyramidGap() {
  return <div className="mx-auto my-4 h-5 w-px bg-line" aria-hidden />;
}

function TieCard({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-3 text-center font-mono text-[11px] text-ink-faint">
      {label}
    </div>
  );
}

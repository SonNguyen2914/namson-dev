// MLS match hub — the SAME Apple-Sports treatment as the WC26 match
// page (hero matchup, xG headline, model prediction, outcome bars,
// model's pick, scenario engine, every-market edge table), themed MLS
// red and fed by the mls-2026-v0 SHADOW model. Model numbers come from
// the stored prediction run (evidence chain), joined to the live
// Kalshi book by ticker through the approved alias mapping — never by
// guessing at side labels. Everything model-made is labeled shadow;
// real-money signals stay disabled server-side.
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { countdown, kickoffLocal, pct, signedPct } from "../../../lib/suggesterApi";
import { Eyebrow, Reveal } from "../../../components/ui";
import { Collapse, NavChip, TopBar, useScrollSpy } from "../../../components/chrome";

type Side = { name?: string; abbrev?: string; logo?: string; score?: string };
type StatRow = { key: string; label: string; home?: string; away?: string };
type Ev = { minute?: string; type?: string; team?: string; text?: string;
  scoring?: boolean };
type FiveGame = { result?: string; score?: string; at_vs?: string;
  opponent?: string; date?: string };
type LastFive = { team?: string; abbrev?: string; form?: string;
  games: FiveGame[] };
type H2H = { perspective?: string; result?: string; home_score?: string;
  away_score?: string; at_vs?: string; opponent?: string; date?: string };
type Match = { id: string; date?: string; state?: string; detail?: string;
  minute?: string; venue?: string; home: Side; away: Side;
  stats: StatRow[]; events: Ev[];
  scouting?: { last_five: LastFive[]; head_to_head: H2H[] } };
type BookRow = { ticker: string; label?: string; yes_ask?: string;
  yes_bid?: string; status?: string };
type Book = { event_ticker: string; title?: string; markets: BookRow[] };
type ModelRun = { run_type?: string; captured_at?: string; seed?: number;
  n_simulations?: number; outcomes?: Record<string, number>;
  tickers?: Record<string, string>;
  xg?: { home: number; away: number } | null;
  scorelines?: Array<{ score: string; prob: number }>;
  props?: Record<string, number>;
  basis?: { home_games?: number; away_games?: number;
    league_gpg?: number; venue_home?: number } };
type ModelInfo = { model_version?: string; shadow?: boolean;
  latest?: ModelRun; t10_lock?: ModelRun | null };

const MLS_VARS = {
  "--accent": "#d50032",
  "--accent-dim": "rgba(213,0,50,0.35)",
  "--accent-faint": "rgba(213,0,50,0.10)",
  "--accent-ambient": "rgba(213,0,50,0.07)",
} as React.CSSProperties;

const fee = (p: number) => 0.07 * p * (1 - p);

export default function MlsMatchPage() {
  const router = useRouter();
  const eventId = typeof router.query.eventId === "string"
    ? router.query.eventId : null;
  const [m, setM] = useState<Match | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [err, setErr] = useState(false);
  const [now, setNow] = useState(() => Date.now());   // 1s countdown tick

  useEffect(() => {
    if (!eventId) return;
    let alive = true;
    const load = () =>
      fetch(`/api/mls/match/${eventId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => {
          if (!alive) return;
          setM(d.match); setBook(d.book ?? null);
          setModel(d.model ?? null); setErr(false);
        })
        .catch(() => alive && setErr(true));
    load();
    const poll = setInterval(load, 30000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => { alive = false; clearInterval(poll); clearInterval(tick); };
  }, [eventId]);

  const live = m?.state === "in";
  const post = m?.state === "post";
  const run = model?.latest;
  const home = m?.home.name ?? "Home";
  const away = m?.away.name ?? "Away";
  const secsToKick = m?.date && now > 0
    ? Math.floor((new Date(m.date).getTime() - now) / 1000) : null;
  const activeSection = useScrollSpy(["prediction", "strategy", "markets", "stats"]);

  return (
    <div style={MLS_VARS} className="min-h-screen bg-canvas">
      <Head><title>
        {m ? (m.home.score != null && m.away.score != null
          ? `${m.home.abbrev} ${m.home.score}–${m.away.score} ${m.away.abbrev} · MLS`
          : `${m.home.abbrev} vs ${m.away.abbrev} · MLS`) : "MLS match"}
      </title></Head>

      <TopBar back={{ href: "/bet-suggester", label: "mls board" }}
        title={m ? `${m.home.abbrev} vs ${m.away.abbrev}` : "MLS"}>
        {live && (
          <NavChip href="#stats">
            <span className="pulse-dot mr-1 inline-block h-1 w-1 rounded-full bg-live align-middle" />
            <span className="text-live">
              {m?.home.abbrev} {m?.home.score}–{m?.away.score} {m?.away.abbrev}
            </span>
          </NavChip>
        )}
        <NavChip href="#prediction" active={activeSection === "prediction"}>Prediction</NavChip>
        <NavChip href="#strategy" active={activeSection === "strategy"}>Strategy</NavChip>
        <NavChip href="#markets" active={activeSection === "markets"}>Markets</NavChip>
        <NavChip href="#stats" active={activeSection === "stats"}>Live</NavChip>
      </TopBar>

      <div className="mx-auto max-w-4xl px-5 py-10">
        {err && !m && (
          <p className="mt-10 rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            match feed unavailable — retrying every 30s
          </p>
        )}

        {m && (
          <>
            {/* ============ HERO — the matchup ============ */}
            <header className="hero-ambient mt-4 mb-12 rounded-3xl pb-2 text-center">
              <Eyebrow className="mb-4" tone="accent">
                {live ? `live · ${m.minute ?? ""}` : post ? "full time" : "mls · regular season"}
              </Eyebrow>
              <h1 className="text-3xl font-semibold tracking-tight text-ink-hi sm:text-5xl">
                <span className="whitespace-nowrap">
                  {m.home.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.home.logo} alt=""
                      className="mr-3 inline-block h-9 w-9 object-contain align-baseline sm:h-11 sm:w-11" />
                  )}
                  {home}
                </span>
                <span className="mx-3 text-xl font-normal text-ink-faint sm:text-2xl">
                  {(live || post) ? `${m.home.score}–${m.away.score}` : "vs"}
                </span>
                <span className="whitespace-nowrap">
                  {away}
                  {m.away.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.away.logo} alt=""
                      className="ml-3 inline-block h-9 w-9 object-contain align-baseline sm:h-11 sm:w-11" />
                  )}
                </span>
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-xs tracking-wide text-ink-low">
                {m.date && <span>{kickoffLocal(m.date)}</span>}
                {m.venue && (
                  <>
                    <span className="text-ink-faint">·</span>
                    <span>{m.venue}</span>
                  </>
                )}
                {secsToKick != null && secsToKick > 0 ? (
                  <>
                    <span className="text-ink-faint">·</span>
                    <span className="tabular-nums text-accent">
                      kickoff in {countdown(secsToKick)}
                    </span>
                  </>
                ) : live ? (
                  <>
                    <span className="text-ink-faint">·</span>
                    <span className="text-live">in play</span>
                  </>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className="rounded-md border border-line px-2.5 py-1 font-mono text-[11px] tracking-wide text-ink-low">
                  mls-2026-v0 · shadow · not advice
                </span>
                {model?.t10_lock && (
                  <span className="rounded-md border border-live/40 px-2.5 py-1 font-mono text-[11px] tracking-wide text-live">
                    🔒 t-10 shadow lock recorded
                  </span>
                )}
              </div>
            </header>

            {/* Headline stats — xG duel, right under the hero */}
            {run?.xg && (
              <Reveal>
                <section className="mb-10">
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label={`${m.home.abbrev} xG`} value={run.xg.home.toFixed(2)} />
                    <Stat label={`${m.away.abbrev} xG`} value={run.xg.away.toFixed(2)} />
                    <Stat label="sims" value={run.n_simulations?.toLocaleString() ?? "—"} />
                  </div>
                  {run.xg.home + run.xg.away > 0 && (
                    <div className="mt-3">
                      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div className="rounded-full bg-accent/75"
                          style={{ width: `${(run.xg.home / (run.xg.home + run.xg.away)) * 100}%` }} />
                        <div className="flex-1 rounded-full bg-elev2" />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                        <span>{home} {pct(run.xg.home / (run.xg.home + run.xg.away))} of expected goals</span>
                        <span>{away}</span>
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>
            )}

            {/* Model prediction — scoreline distribution + chance chips */}
            {run?.scorelines && run.scorelines.length > 0 && (
              <Reveal>
                <Collapse id="prediction" eyebrow="pure model · shadow" title="Model prediction">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {run.scorelines.slice(0, 6).map((s, i) => (
                      <div key={s.score}
                        className={`rounded-xl border p-3 text-center ${
                          i === 0 ? "border-accent/40 bg-accent/5" : "border-line"}`}>
                        <p className="font-mono text-lg tabular-nums text-ink-hi">{s.score}</p>
                        <p className="mt-1 font-mono text-[11px] tabular-nums text-ink-low">{pct(s.prob)}</p>
                      </div>
                    ))}
                  </div>
                  {run.props && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {([["btts", "Both teams score"], ["over_1_5", "Over 1.5"],
                        ["over_2_5", "Over 2.5"], ["over_3_5", "Over 3.5"]] as const)
                        .filter(([k]) => run.props![k] != null)
                        .map(([k, label]) => (
                          <span key={k}
                            className="rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] text-ink-mid">
                            {label}{" "}
                            <span className="tabular-nums text-ink-hi">{pct(run.props![k])}</span>
                          </span>
                        ))}
                    </div>
                  )}
                  <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
                    Most likely scorelines from {run.n_simulations?.toLocaleString()} seeded
                    Monte Carlo runs (seed {run.seed}) of the shared engine on fitted
                    MLS goal rates ({run.basis?.home_games}/{run.basis?.away_games} games
                    of history, league {run.basis?.league_gpg} gpg).
                  </p>
                </Collapse>
              </Reveal>
            )}

            {/* Outcome probabilities — thin stat bars, same as WC26 */}
            {run?.outcomes && (
              <Reveal>
                <section className="mb-10 rounded-2xl border border-line bg-elev p-5 sm:p-6">
                  <Eyebrow className="mb-4">
                    model outcome probabilities · pure model, unanchored
                  </Eyebrow>
                  <div className="space-y-3">
                    {run.outcomes.home_win != null &&
                      <OutcomeBar label={`${home} win`} value={run.outcomes.home_win} />}
                    {run.outcomes.draw != null &&
                      <OutcomeBar label="Draw" value={run.outcomes.draw} />}
                    {run.outcomes.away_win != null &&
                      <OutcomeBar label={`${away} win`} value={run.outcomes.away_win} />}
                  </div>
                  <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
                    Raw mls-2026-v0 numbers — NOT blended toward the market the way
                    the WC26 board was. Shadow mode logs these against outcomes to
                    find out whether they deserve anchoring at all.
                  </p>
                </section>
              </Reveal>
            )}

            {/* Model's read — the most likely outcome vs its market price */}
            <ModelPick m={m} run={run} book={book} />

            {/* Betting strategy — the fee-aware scenario engine */}
            <Reveal>
              <Collapse id="strategy" eyebrow="scenario engine" title="Betting strategy">
                <ScenarioSection book={book} />
              </Collapse>
            </Reveal>

            {/* Every market priced — model vs book, the edge table */}
            <MarketsTable m={m} run={run} book={book} />

            {/* Live stats + timeline — the in-play read (MLS bonus) */}
            <section id="stats" className="mb-10">
              <Reveal>
                <Collapse eyebrow="espn live" title="Match stats" defaultOpen={live || post}>
                  {m.stats.length === 0 ? (
                    <Empty>stats populate after kickoff</Empty>
                  ) : (
                    <div className="space-y-3">
                      {m.stats.map((s) => <StatBar key={s.key} s={s} />)}
                    </div>
                  )}
                  {m.events.length > 0 && (
                    <div className="mt-6 divide-y divide-line rounded-2xl border border-line">
                      {m.events.map((e, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                          <span className="w-10 shrink-0 font-mono text-[11px] text-ink-faint">
                            {e.minute}
                          </span>
                          <span className={`shrink-0 font-mono text-[11px] uppercase tracking-wide ${
                            e.scoring ? "text-accent" : "text-ink-low"}`}>
                            {e.scoring ? "⚽ " : ""}{e.type}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-ink-low">
                            {e.text || e.team}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Collapse>
              </Reveal>
            </section>

            <ScoutingSection m={m} />

            <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
              live data + real market prices · shadow model, observational
              only · not betting advice
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- building blocks shared with the WC26 look ---------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-elev p-4 text-center">
      <p className="font-mono text-2xl tabular-nums text-ink-hi">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
    </div>
  );
}

function OutcomeBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[minmax(7rem,12rem)_1fr_3.5rem] items-center gap-3">
      <span className="truncate text-sm text-ink-mid">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-accent/10">
        <div className="h-full rounded-full bg-accent"
          style={{ width: `${Math.min(value * 100, 100)}%` }} />
      </div>
      <span className="text-right font-mono text-sm tabular-nums text-ink-hi">
        {pct(value)}
      </span>
    </div>
  );
}

/* ---------- model vs market ---------- */

type MarketJoin = {
  ticker: string; label: string; outcome: string | null;
  modelP: number | null; ask: number | null; bid: number | null;
};

// Join the live book to the stored run: by ticker (the approved
// mapping) first, "tie" fallback for the draw, nothing else guessed.
function joinMarkets(m: Match, run?: ModelRun, book?: Book | null): MarketJoin[] {
  const rows = book?.markets ?? [];
  const byTicker = new Map(
    Object.entries(run?.tickers ?? {}).map(([o, t]) => [t, o]));
  return rows.map((r) => {
    let outcome = byTicker.get(r.ticker) ?? null;
    if (!outcome && (r.label ?? "").trim().toLowerCase() === "tie") {
      outcome = "draw";
    }
    const modelP = outcome != null ? run?.outcomes?.[outcome] ?? null : null;
    const ask = r.yes_ask ? parseFloat(r.yes_ask) : null;
    const bid = r.yes_bid ? parseFloat(r.yes_bid) : null;
    const outcomeLabel = outcome === "home_win" ? `${m.home.name} win`
      : outcome === "away_win" ? `${m.away.name} win`
      : outcome === "draw" ? "Draw" : r.label ?? r.ticker;
    return { ticker: r.ticker, label: outcomeLabel, outcome,
      modelP, ask: Number.isFinite(ask!) ? ask : null,
      bid: Number.isFinite(bid!) ? bid : null };
  });
}

function ModelPick({ m, run, book }: {
  m: Match; run?: ModelRun; book: Book | null;
}) {
  const joined = joinMarkets(m, run, book).filter((j) => j.modelP != null);
  const best = joined.sort((a, b) => (b.modelP ?? 0) - (a.modelP ?? 0))[0];
  const edge = best && best.ask != null ? best.modelP! - best.ask : null;
  return (
    <Reveal>
      <section className={`glow mb-10 rounded-2xl border p-6 ${
        best ? "glow-accent border-accent/25 bg-elev" : "border-line"}`}>
        <Eyebrow>
          model&apos;s read — most likely outcome vs its market price
        </Eyebrow>
        {best ? (
          <>
            <p className="mt-3 text-xl font-medium text-ink-hi sm:text-2xl">{best.label}</p>
            <p className="mt-2 font-mono text-sm tabular-nums text-ink-mid">
              {pct(best.modelP!)} likely
              {best.ask != null && (
                <>
                  {" "}· ask {Math.round(best.ask * 100)}¢ ·{" "}
                  <span className={edge! >= 0 ? "text-accent" : "text-neg"}>
                    {signedPct(edge!)} edge
                  </span>{" "}
                  · {(1 / best.ask).toFixed(2)}x payout
                </>
              )}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Shadow read, not a pick: mls-2026-v0 is unvalidated on league play
              and real-money signals are off. This line exists so the edge claim
              can be scored against results later.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-low">
            {run?.outcomes
              ? "No open book on this match to compare against."
              : "No completed prediction run for this fixture yet."}
          </p>
        )}
      </section>
    </Reveal>
  );
}

function MarketsTable({ m, run, book }: {
  m: Match; run?: ModelRun; book: Book | null;
}) {
  const joined = joinMarkets(m, run, book)
    .sort((a, b) => (b.modelP ?? -1) - (a.modelP ?? -1));
  return (
    <Reveal>
      <section id="markets" className="mb-10">
        <Eyebrow className="mb-2">markets</Eyebrow>
        <h3 className="mb-3 text-lg font-medium text-ink-hi">
          Every Kalshi market on this match
        </h3>
        <p className="mb-4 text-xs text-ink-low">
          Model likelihood vs the buyable ask — positive edge means the shadow
          model sees the outcome as more likely than the market charges for it.
        </p>
        {joined.length === 0 ? (
          <p className="rounded-xl border border-line p-4 text-sm text-ink-low">
            No Kalshi book is open for this match right now — books usually
            list a few days before kickoff.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5.5rem_5.5rem] items-center gap-x-3 border-b border-line bg-elev px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
                <span>Market</span>
                <span className="text-right" title="mls-2026-v0 shadow probability">Likelihood</span>
                <span className="text-right"
                  title="Model probability minus the ask's implied probability">Edge</span>
                <span className="text-right"
                  title="Payout multiple at the buyable ask price">Mult</span>
                <span className="text-right">Ask / Bid</span>
              </div>
              {joined.map((j) => {
                const edge = j.modelP != null && j.ask != null
                  ? j.modelP - j.ask : null;
                return (
                  <div key={j.ticker}
                    className="grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5.5rem_5.5rem] items-center gap-x-3 border-b border-line px-4 py-3 text-sm transition-colors hover:bg-elev">
                    <span className="min-w-0 truncate pr-2 text-ink-hi" title={j.ticker}>
                      {j.label}
                    </span>
                    <span className="text-right font-mono tabular-nums text-ink-hi">
                      {j.modelP != null ? pct(j.modelP) : "—"}
                    </span>
                    <span className={`text-right font-mono tabular-nums ${
                      edge == null ? "text-ink-faint"
                        : edge >= 0 ? "text-accent" : "text-neg"}`}>
                      {edge != null ? signedPct(edge) : "—"}
                    </span>
                    <span className="text-right font-mono tabular-nums text-ink-mid">
                      {j.ask != null ? `${(1 / j.ask).toFixed(2)}x` : "—"}
                    </span>
                    <span className="text-right font-mono tabular-nums text-ink-mid">
                      {j.ask != null ? `${Math.round(j.ask * 100)}¢` : "—"}
                      <span className="text-ink-faint">
                        {j.bid != null ? ` / ${Math.round(j.bid * 100)}¢` : ""}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
          Shadow comparison only — the model is unvalidated on MLS and no row
          here is a recommendation. Ask/bid are the real KXMLSGAME prices; the
          spread is the exchange&apos;s, not the model&apos;s.
        </p>
      </section>
    </Reveal>
  );
}

/* ---------- scenario engine (fee-aware, price-only) ---------- */

function ScenarioSection({ book }: { book: Book | null }) {
  const rows = (book?.markets ?? []).filter((r) => r.yes_ask);
  const [stakes, setStakes] = useState<Record<string, string>>({});
  if (rows.length === 0) {
    return <Empty>no open book to run scenarios against</Empty>;
  }
  const legs = rows.map((r) => {
    const ask = parseFloat(r.yes_ask!);
    const stake = parseFloat(stakes[r.ticker] ?? "") || 0;
    const contracts = ask > 0 ? Math.floor(stake / (ask + fee(ask))) : 0;
    const cost = contracts * (ask + fee(ask));
    return { ...r, ask, stake, contracts, cost };
  });
  const totalCost = legs.reduce((s, l) => s + l.cost, 0);
  return (
    <div>
      <p className="mb-4 text-xs leading-relaxed text-ink-low">
        Stake any mix of outcomes at the real ask plus Kalshi&apos;s
        0.07·P·(1−P) fee. Pure execution arithmetic — this table does not
        opine on which outcome is likely.
      </p>
      <div className="space-y-2">
        {legs.map((l) => (
          <div key={l.ticker}
            className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_7rem] items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-sm">
            <span className="min-w-0 truncate text-ink-hi">{l.label}</span>
            <span className="text-right font-mono tabular-nums text-ink-mid">
              @{Math.round(l.ask * 100)}¢
            </span>
            <input
              inputMode="decimal"
              placeholder="$0"
              value={stakes[l.ticker] ?? ""}
              onChange={(e) => setStakes((s) => ({ ...s, [l.ticker]: e.target.value }))}
              className="rounded-lg border border-line bg-transparent px-2 py-1.5 text-right font-mono text-sm text-ink-hi outline-none focus:border-accent/60"
            />
            <span className="text-right font-mono text-[11px] tabular-nums text-ink-low">
              {l.contracts > 0 ? `${l.contracts} × → $${l.contracts.toFixed(0)}` : "—"}
            </span>
          </div>
        ))}
      </div>
      {totalCost > 0 && (
        <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            net if each outcome hits
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-3">
            {legs.map((w) => {
              const payout = w.contracts;      // $1 per contract
              const net = payout - totalCost;
              return (
                <p key={w.ticker} className="font-mono text-xs tabular-nums text-ink-mid">
                  {w.label}:{" "}
                  <span className={net >= 0 ? "text-accent" : "text-neg"}>
                    {net >= 0 ? "+" : ""}${net.toFixed(2)}
                  </span>
                </p>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[10px] text-ink-faint">
            total at risk ${totalCost.toFixed(2)} · fees included · $1/contract settlement
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- live stats + scouting (MLS-specific) ---------- */

function StatBar({ s }: { s: StatRow }) {
  const h = parseFloat(s.home ?? "");
  const a = parseFloat(s.away ?? "");
  const total = (Number.isFinite(h) ? h : 0) + (Number.isFinite(a) ? a : 0);
  const hw = total > 0 ? (h / total) * 100 : 50;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between font-mono text-[11px] tabular-nums">
        <span className="text-ink-hi">{s.home ?? "—"}</span>
        <span className="uppercase tracking-[0.14em] text-ink-faint">{s.label}</span>
        <span className="text-ink-hi">{s.away ?? "—"}</span>
      </div>
      <div className="flex h-1 gap-0.5 overflow-hidden rounded-full">
        <div className="rounded-full bg-accent/80" style={{ width: `${hw}%` }} />
        <div className="flex-1 rounded-full bg-elev2" />
      </div>
    </div>
  );
}

function FormChips({ form }: { form?: string }) {
  if (!form) return null;
  return (
    <span className="inline-flex gap-1">
      {form.split("").map((c, i) => (
        <span key={i}
          className={`inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] ${
            c === "W" ? "bg-accent/20 text-accent"
              : c === "L" ? "bg-neg/20 text-neg" : "bg-elev2 text-ink-low"}`}>
          {c}
        </span>
      ))}
    </span>
  );
}

function ScoutingSection({ m }: { m: Match }) {
  const sc = m.scouting;
  if (!sc || (sc.last_five.length === 0 && sc.head_to_head.length === 0)) {
    return null;
  }
  return (
    <Reveal>
      <Collapse eyebrow="espn form + h2h" title="Scouting" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          {sc.last_five.map((t) => (
            <div key={t.team} className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-ink-hi">{t.team}</p>
                <FormChips form={t.form} />
              </div>
              <div className="space-y-1.5">
                {t.games.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
                    <span className={`w-4 text-center ${
                      g.result === "W" ? "text-accent"
                        : g.result === "L" ? "text-neg" : "text-ink-low"}`}>
                      {g.result}
                    </span>
                    <span className="w-10 tabular-nums text-ink-hi">{g.score}</span>
                    <span className="min-w-0 flex-1 truncate text-ink-low">
                      {g.at_vs} {g.opponent}
                    </span>
                    <span className="shrink-0 text-ink-faint">{g.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {sc.head_to_head.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
              recent meetings · from {sc.head_to_head[0]?.perspective ?? "home"}&apos;s side
            </p>
            <div className="space-y-1.5">
              {sc.head_to_head.map((g, i) => (
                <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`w-4 text-center ${
                    g.result === "W" ? "text-accent"
                      : g.result === "L" ? "text-neg" : "text-ink-low"}`}>
                    {g.result}
                  </span>
                  <span className="w-12 tabular-nums text-ink-hi">
                    {g.home_score}–{g.away_score}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-low">
                    {g.at_vs} {g.opponent}
                  </span>
                  <span className="shrink-0 text-ink-faint">{g.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Collapse>
    </Reveal>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
      {children}
    </p>
  );
}

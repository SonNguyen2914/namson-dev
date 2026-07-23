// MLS match hub — live stats + the fixture's real Kalshi book + a
// fee-aware scenario engine + ESPN scouting (form, last five, H2H) +
// the mls-2026-v0 SHADOW model. Model probabilities are observational
// only: every panel carries the shadow label, and nothing here is a
// recommendation while real-money signals stay disabled.
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Eyebrow, Reveal } from "../../../components/ui";

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
  n_simulations?: number; outcomes?: Record<string, number> };
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
    return () => { alive = false; clearInterval(poll); };
  }, [eventId]);

  const live = m?.state === "in";
  return (
    <div style={MLS_VARS} className="min-h-screen bg-canvas px-4 py-10">
      <Head><title>
        {m ? (m.home.score != null && m.away.score != null
          ? `${m.home.abbrev} ${m.home.score}–${m.away.score} ${m.away.abbrev} · MLS`
          : `${m.home.abbrev} vs ${m.away.abbrev} · MLS`) : "MLS match"}
      </title></Head>
      <div className="mx-auto max-w-2xl">
        <Link href="/bet-suggester"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint hover:text-accent">
          ← mls dashboard
        </Link>

        {err && !m && (
          <p className="mt-10 rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            match feed unavailable — retrying every 30s
          </p>
        )}

        {m && (
          <>
            <Reveal>
              <section className="mt-8 rounded-3xl border border-line bg-elev p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Eyebrow tone="accent">
                    {live ? `live · ${m.minute ?? ""}` : m.detail}
                  </Eyebrow>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                    {m.venue}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <TeamBlock s={m.home} />
                  <div className={`text-center font-mono text-3xl tabular-nums ${
                    live ? "text-accent" : "text-ink-hi"}`}>
                    {m.home.score}–{m.away.score}
                  </div>
                  <TeamBlock s={m.away} right />
                </div>
              </section>
            </Reveal>

            <MarketSection book={book} />
            <ScenarioSection book={book} />

            <ModelSection model={model} m={m} />

            <Reveal>
              <section className="mt-10">
                <Eyebrow className="mb-4" tone="accent">match stats · espn live</Eyebrow>
                {m.stats.length === 0 ? (
                  <Empty>stats populate after kickoff</Empty>
                ) : (
                  <div className="space-y-3">
                    {m.stats.map((s) => <StatBar key={s.key} s={s} />)}
                  </div>
                )}
              </section>
            </Reveal>

            <Reveal>
              <section className="mt-10">
                <Eyebrow className="mb-4" tone="accent">timeline</Eyebrow>
                {m.events.length === 0 ? (
                  <Empty>no key events yet</Empty>
                ) : (
                  <div className="divide-y divide-line rounded-2xl border border-line">
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
              </section>
            </Reveal>

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

/* ---------- model (shadow) ---------- */

const OUTCOME_ROWS: Array<[string, "home" | "away" | null, string]> = [
  ["home_win", "home", "home win"],
  ["draw", null, "draw"],
  ["away_win", "away", "away win"],
];

function ModelSection({ model, m }: { model: ModelInfo | null; m: Match }) {
  const run = model?.latest;
  return (
    <Reveal>
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <Eyebrow tone="accent">model outcome probabilities</Eyebrow>
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-faint">
            shadow · not advice
          </span>
        </div>
        {!run?.outcomes ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-ink-faint">
            mls data collection active — this fixture has no completed
            prediction run yet
          </p>
        ) : (
          <div className="rounded-2xl border border-line bg-elev p-4">
            <div className="space-y-2.5">
              {OUTCOME_ROWS.map(([key, side, fallback]) => {
                const p = run.outcomes?.[key];
                if (p == null) return null;
                const label = side
                  ? (m[side].abbrev || m[side].name || fallback)
                  : fallback;
                return (
                  <div key={key} className="grid grid-cols-[6rem_1fr_3.5rem] items-center gap-3">
                    <span className="truncate font-mono text-[11px] uppercase tracking-wide text-ink-low">
                      {label}
                    </span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-accent/10">
                      <div className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.round(p * 100)}%` }} />
                    </div>
                    <span className="text-right font-mono text-sm tabular-nums text-ink-hi">
                      {(p * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-line pt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
              {model?.model_version} · {run.n_simulations?.toLocaleString()} sims
              · seed {run.seed}
              {run.captured_at &&
                ` · ${new Date(run.captured_at).toLocaleString([], {
                  month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit" })}`}
              {model?.t10_lock ? " · t-10 locked" : ""}
              <br />
              shadow mode — real-money recommendations are disabled until the
              mls model passes prospective validation
            </p>
          </div>
        )}
      </section>
    </Reveal>
  );
}

/* ---------- market ---------- */

function MarketSection({ book }: { book: Book | null }) {
  const rows = book?.markets ?? [];
  const mids = rows.map((r) => {
    const a = parseFloat(r.yes_ask ?? ""), b = parseFloat(r.yes_bid ?? "");
    return Number.isFinite(a) && Number.isFinite(b) ? (a + b) / 2
      : Number.isFinite(a) ? a : NaN;
  });
  const midSum = mids.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
  return (
    <Reveal>
      <section className="mt-10">
        <Eyebrow className="mb-2" tone="accent">market · kalshi three-way</Eyebrow>
        <p className="mb-4 max-w-xl text-xs leading-relaxed text-ink-low">
          Implied % is the bid/ask midpoint normalized across the book — it
          contains the exchange&apos;s spread and is <em>not</em> a model
          probability.
        </p>
        {!book ? (
          <Empty>no open kalshi book matched to this fixture</Empty>
        ) : (
          <div className="divide-y divide-line rounded-2xl border border-line">
            {rows.map((r, i) => {
              const implied = Number.isFinite(mids[i]) && midSum > 0
                ? (mids[i] / midSum) * 100 : null;
              return (
                <div key={r.ticker}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5">
                  <span className="truncate text-sm text-ink-hi">{r.label}</span>
                  <span className="font-mono text-[11px] tabular-nums text-accent">
                    {implied != null ? `${implied.toFixed(1)}%` : "—"}
                  </span>
                  <span className="w-24 text-right font-mono text-[11px] tabular-nums text-ink-low">
                    {cents(r.yes_ask)} / {cents(r.yes_bid)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Reveal>
  );
}

/* ---------- scenario engine ---------- */

function ScenarioSection({ book }: { book: Book | null }) {
  const [stakes, setStakes] = useState<Record<string, string>>({});
  if (!book) return null;
  const rows = book.markets.filter((r) =>
    Number.isFinite(parseFloat(r.yes_ask ?? "")));
  const picks = rows.map((r) => {
    const ask = parseFloat(r.yes_ask!);
    const stake = parseFloat(stakes[r.ticker] ?? "") || 0;
    const unit = ask + fee(ask);
    const contracts = stake > 0 ? Math.floor(stake / unit) : 0;
    const cost = contracts * unit;
    return { r, ask, stake, contracts, cost };
  });
  const totalCost = picks.reduce((s, p) => s + p.cost, 0);
  return (
    <Reveal>
      <section className="mt-10">
        <Eyebrow className="mb-2" tone="accent">scenario engine · price-only</Eyebrow>
        <p className="mb-4 max-w-xl text-xs leading-relaxed text-ink-low">
          Stake any mix of outcomes at the real ask plus Kalshi&apos;s
          0.07·P·(1−P) fee. Pure execution arithmetic — the engine does not
          opine on which outcome is likely.
        </p>
        <div className="rounded-2xl border border-line p-4">
          <div className="space-y-2">
            {picks.map(({ r, ask, contracts, cost }) => (
              <div key={r.ticker}
                className="grid grid-cols-[1fr_5rem_auto] items-center gap-3">
                <span className="truncate text-sm text-ink-hi">{r.label}
                  <span className="pl-2 font-mono text-[10px] text-ink-faint">
                    @{cents(r.yes_ask)}
                  </span>
                </span>
                <input
                  inputMode="decimal"
                  placeholder="$0"
                  value={stakes[r.ticker] ?? ""}
                  onChange={(e) => setStakes((s) => (
                    { ...s, [r.ticker]: e.target.value }))}
                  className="rounded-lg border border-line bg-canvas px-2 py-1 text-right font-mono text-xs text-ink-hi outline-none focus:border-accent/60"
                />
                <span className="w-36 text-right font-mono text-[11px] tabular-nums text-ink-low">
                  {contracts > 0
                    ? `${contracts}× · cost $${cost.toFixed(2)}`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
          {totalCost > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                total outlay ${totalCost.toFixed(2)} · net if each outcome
                settles yes:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {picks.map(({ r, contracts }) => {
                  const net = contracts * 1 - totalCost;
                  return (
                    <div key={r.ticker}
                      className="rounded-lg border border-line px-2 py-1.5 text-center">
                      <p className="truncate font-mono text-[10px] text-ink-faint">
                        {r.label}
                      </p>
                      <p className={`font-mono text-sm tabular-nums ${
                        net >= 0 ? "text-accent" : "text-ink-low"}`}>
                        {net >= 0 ? "+" : ""}{net.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}

/* ---------- scouting ---------- */

function ScoutingSection({ m }: { m: Match }) {
  const lf = m.scouting?.last_five ?? [];
  const h2h = m.scouting?.head_to_head ?? [];
  if (lf.length === 0 && h2h.length === 0) return null;
  return (
    <Reveal>
      <section className="mt-10">
        <Eyebrow className="mb-4" tone="accent">scouting · espn form + h2h</Eyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {lf.map((t) => (
            <div key={t.abbrev} className="rounded-2xl border border-line p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="truncate text-sm font-medium text-ink-hi">{t.team}</p>
                <FormChips form={t.form} />
              </div>
              <div className="space-y-1">
                {t.games.map((g, i) => (
                  <div key={i} className="flex justify-between font-mono text-[11px]">
                    <span className={g.result === "W" ? "text-accent"
                      : g.result === "L" ? "text-ink-faint" : "text-ink-low"}>
                      {g.result}
                    </span>
                    <span className="text-ink-low">
                      {g.at_vs} {g.opponent}
                    </span>
                    <span className="tabular-nums text-ink-hi">{g.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {h2h.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              recent meetings · from {h2h[0].perspective}&apos;s side
            </p>
            <div className="space-y-1">
              {h2h.map((g, i) => (
                <div key={i} className="flex justify-between font-mono text-[11px]">
                  <span className={g.result === "W" ? "text-accent"
                    : g.result === "L" ? "text-ink-faint" : "text-ink-low"}>
                    {g.result}
                  </span>
                  <span className="text-ink-low">{g.at_vs} {g.opponent}</span>
                  <span className="tabular-nums text-ink-hi">
                    {g.home_score}–{g.away_score}
                  </span>
                  <span className="text-ink-faint">{(g.date || "").slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </Reveal>
  );
}

function FormChips({ form }: { form?: string }) {
  if (!form) return null;
  return (
    <span className="flex gap-1">
      {form.split(" ").map((c, i) => (
        <span key={i}
          className={`inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] ${
            c === "W" ? "bg-accent/20 text-accent"
              : c === "L" ? "bg-elev2 text-ink-faint"
                : "bg-elev2 text-ink-low"}`}>
          {c}
        </span>
      ))}
    </span>
  );
}

/* ---------- shared bits ---------- */

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
      {children}
    </p>
  );
}

function cents(v?: string) {
  const n = v ? Math.round(parseFloat(v) * 100) : NaN;
  return Number.isFinite(n) ? `${n}¢` : "—";
}

function TeamBlock({ s, right = false }: { s: Side; right?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${right ? "flex-row-reverse text-right" : ""}`}>
      {s.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-hi">{s.name}</p>
        <p className="font-mono text-[10px] uppercase text-ink-faint">{s.abbrev}</p>
      </div>
    </div>
  );
}

function StatBar({ s }: { s: StatRow }) {
  const h = parseFloat(s.home ?? "");
  const a = parseFloat(s.away ?? "");
  const ok = Number.isFinite(h) && Number.isFinite(a) && h + a > 0;
  const hw = ok ? (h / (h + a)) * 100 : 50;
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[11px] tabular-nums">
        <span className="text-ink-hi">{s.home ?? "—"}</span>
        <span className="text-[10px] uppercase tracking-[0.15em] text-ink-faint">{s.label}</span>
        <span className="text-ink-hi">{s.away ?? "—"}</span>
      </div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        <div className="rounded-full bg-accent/75" style={{ width: `${hw}%` }} />
        <div className="flex-1 rounded-full bg-elev2" />
      </div>
    </div>
  );
}

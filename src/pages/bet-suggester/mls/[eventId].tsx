// MLS match hub — Son's Jul 23 layout: the compact match-info card
// (the original hero box), xG duel, "how they play" (data-driven from
// the fitted ratings — no hand-sourced blurbs), ESPN scouting, then
// the market-vs-model comparison as two ALIGNED three-way stacked bars
// (home segment in the club's signature color, draw neutral, away in
// theirs) with the every-market edge table beneath. Model numbers come
// from the stored prediction run, joined to the live Kalshi book by
// ticker through the approved alias mapping. Everything model-made is
// labeled shadow; real-money signals stay disabled server-side.
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { countdown, pct, signedPct } from "../../../lib/suggesterApi";
import { Eyebrow, Reveal } from "../../../components/ui";
import { Collapse, NavChip, TopBar, useScrollSpy } from "../../../components/chrome";

type Side = { name?: string; abbrev?: string; logo?: string; score?: string;
  color?: string; alt_color?: string };
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
  yes_bid?: string; status?: string; model_key?: string | null };
type Book = { event_ticker: string; title?: string; markets: BookRow[] };
type Family = { key: string; label: string; event_ticker: string;
  markets: BookRow[] };
type Basis = { home_games?: number; away_games?: number;
  league_gpg?: number; venue_home?: number;
  home_attack?: number; home_defence?: number;
  away_attack?: number; away_defence?: number };
type ModelRun = { run_type?: string; captured_at?: string; seed?: number;
  n_simulations?: number; outcomes?: Record<string, number>;
  tickers?: Record<string, string>;
  xg?: { home: number; away: number } | null;
  scorelines?: Array<{ score: string; prob: number }>;
  props?: Record<string, number>; basis?: Basis };
type ModelInfo = { model_version?: string; shadow?: boolean;
  latest?: ModelRun; t10_lock?: ModelRun | null };

const MLS_VARS = {
  "--accent": "#d50032",
  "--accent-dim": "rgba(213,0,50,0.35)",
  "--accent-faint": "rgba(213,0,50,0.10)",
  "--accent-ambient": "rgba(213,0,50,0.07)",
} as React.CSSProperties;

const fee = (p: number) => 0.07 * p * (1 - p);
const DRAW_COLOR = "#52525b";          // neutral — no club owns the draw

/* club signature colors: ESPN hex, alternate when the primary would
   vanish on the near-black canvas */
function luminance(hex: string): number {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function sideColor(s: Side, fallback: string): string {
  for (const c of [s.color, s.alt_color]) {
    const h = (c ?? "").replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(h) && luminance(h) > 0.12) return `#${h}`;
  }
  return fallback;
}

export default function MlsMatchPage() {
  const router = useRouter();
  const eventId = typeof router.query.eventId === "string"
    ? router.query.eventId : null;
  const [m, setM] = useState<Match | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Family[]>([]);
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
          setBooks(d.books ?? []);
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

      <TopBar back={{ href: "/bet-suggester?league=mls", label: "mls board" }}
        title={m ? `${m.home.abbrev} vs ${m.away.abbrev}` : "MLS"}>
        {live && (
          <NavChip href="#stats">
            <span className="pulse-dot mr-1 inline-block h-1 w-1 rounded-full bg-live align-middle" />
            <span className="text-live">
              {m?.home.abbrev} {m?.home.score}–{m?.away.score} {m?.away.abbrev}
            </span>
          </NavChip>
        )}
        <NavChip href="#markets" active={activeSection === "markets"}>Markets</NavChip>
        <NavChip href="#prediction" active={activeSection === "prediction"}>Prediction</NavChip>
        <NavChip href="#strategy" active={activeSection === "strategy"}>Strategy</NavChip>
        <NavChip href="#stats" active={activeSection === "stats"}>Live</NavChip>
      </TopBar>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {err && !m && (
          <p className="mt-10 rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            match feed unavailable — retrying every 30s
          </p>
        )}

        {m && (
          <>
            {/* ===== the match-info box (the original hero card) ===== */}
            <Reveal>
              <section className="mt-4 rounded-3xl border border-line bg-elev p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex items-baseline gap-3">
                    <Eyebrow tone="accent">
                      {live ? `live · ${m.minute ?? ""}` : m.detail}
                    </Eyebrow>
                    {secsToKick != null && secsToKick > 0 && (
                      <span className="font-mono text-[11px] tabular-nums text-ink-low">
                        in {countdown(secsToKick)}
                      </span>
                    )}
                  </span>
                  <span className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                    {m.venue}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <TeamBlock s={m.home} />
                  <div className={`text-center font-mono text-3xl tabular-nums ${
                    live ? "text-accent" : "text-ink-hi"}`}>
                    {(live || post) ? `${m.home.score}–${m.away.score}` : "–"}
                  </div>
                  <TeamBlock s={m.away} right />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                    mls-2026-v0 · shadow · not advice
                  </span>
                  {model?.t10_lock && (
                    <span className="rounded-md border border-live/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-live">
                      🔒 t-10 shadow lock recorded
                    </span>
                  )}
                </div>
              </section>
            </Reveal>

            {/* in play, the live read jumps the queue — see bottom */}
            {live && <LiveBlock m={m} promoted />}

            {/* ===== xG duel ===== */}
            {run?.xg && (
              <Reveal>
                <section className="mt-8">
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label={`${m.home.abbrev} xG`} value={run.xg.home.toFixed(2)} />
                    <Stat label={`${m.away.abbrev} xG`} value={run.xg.away.toFixed(2)} />
                    <Stat label="sims" value={run.n_simulations?.toLocaleString() ?? "—"} />
                  </div>
                  {run.xg.home + run.xg.away > 0 && (
                    <div className="mt-3">
                      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div className="rounded-full"
                          style={{
                            width: `${(run.xg.home / (run.xg.home + run.xg.away)) * 100}%`,
                            background: sideColor(m.home, "#d50032"),
                          }} />
                        <div className="flex-1 rounded-full bg-elev2" />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                        <span>{m.home.name} {pct(run.xg.home / (run.xg.home + run.xg.away))} of expected goals</span>
                        <span>{m.away.name}</span>
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>
            )}

            {/* ===== how they play — fitted ratings, no hand-waving ===== */}
            <HowTheyPlay m={m} run={run} />

            {/* ===== ESPN scouting: form + H2H ===== */}
            <ScoutingSection m={m} />

            {/* ===== market vs model — the aligned three-way bars ===== */}
            <section id="markets" className="mt-10">
              <Reveal>
                <div className="rounded-2xl border border-line bg-elev p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <Eyebrow tone="accent">market · kalshi three-way</Eyebrow>
                    <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-faint">
                      shadow · not advice
                    </span>
                  </div>
                  <TripleBar m={m} probs={impliedProbs(m, run, book)}
                    caption="implied % — normalized bid/ask midpoints; contains the exchange's spread"
                    emptyText="no open kalshi book matched to this fixture" />
                  <div className="mt-5 border-t border-line pt-4">
                    <Eyebrow className="mb-1">model outcome probabilities</Eyebrow>
                    <TripleBar m={m} probs={modelProbs(run)}
                      caption={run ? `mls-2026-v0 · ${run.n_simulations?.toLocaleString()} sims · seed ${run.seed}` : undefined}
                      emptyText="no completed prediction run yet" />
                  </div>
                  <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
                    same scale, read vertically — where the boundaries disagree
                    is where model and market disagree · shadow mode, real-money
                    recommendations disabled until prospective validation
                  </p>
                </div>
              </Reveal>

              <MarketsTable m={m} run={run} book={book} families={books} />
            </section>

            {/* ===== model prediction: scorelines + chance chips ===== */}
            {run?.scorelines && run.scorelines.length > 0 && (
              <Reveal>
                <Collapse id="prediction" eyebrow="pure model · shadow"
                  title="Model prediction" className="mt-10 mb-0">
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
                </Collapse>
              </Reveal>
            )}

            {/* ===== scenario engine ===== */}
            <Reveal>
              <Collapse id="strategy" eyebrow="scenario engine"
                title="Betting strategy" className="mt-10 mb-0" defaultOpen={false}>
                <ScenarioSection book={book} />
              </Collapse>
            </Reveal>

            {/* ===== live stats + timeline (bottom slot when not live) ===== */}
            {!live && <LiveBlock m={m} />}

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

/* ---------- hero building blocks ---------- */

function TeamBlock({ s, right }: { s: Side; right?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${
      right ? "flex-row-reverse text-right" : ""}`}>
      {s.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-hi sm:text-base">
          {s.name}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
          {s.abbrev}
        </p>
      </div>
    </div>
  );
}

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

/* ---------- the three-way stacked bar ---------- */

type Triple = { home: number; draw: number; away: number } | null;

function modelProbs(run?: ModelRun): Triple {
  const o = run?.outcomes;
  if (!o || o.home_win == null || o.draw == null || o.away_win == null) return null;
  return { home: o.home_win, draw: o.draw, away: o.away_win };
}

// normalized bid/ask midpoints, joined to outcomes by ticker
function impliedProbs(m: Match, run?: ModelRun, book?: Book | null): Triple {
  const rows = book?.markets ?? [];
  if (rows.length === 0) return null;
  const byTicker = new Map(
    Object.entries(run?.tickers ?? {}).map(([o, t]) => [t, o]));
  const mids: Record<string, number> = {};
  for (const r of rows) {
    let outcome = byTicker.get(r.ticker);
    if (!outcome && (r.label ?? "").trim().toLowerCase() === "tie") outcome = "draw";
    if (!outcome) {
      // last resort: the ticker's trailing team code vs the abbrevs
      const tail = r.ticker.split("-").pop() ?? "";
      if (tail === m.home.abbrev) outcome = "home_win";
      else if (tail === m.away.abbrev) outcome = "away_win";
      else if (tail === "TIE") outcome = "draw";
    }
    const ask = parseFloat(r.yes_ask ?? "");
    const bid = parseFloat(r.yes_bid ?? "");
    const mid = Number.isFinite(ask) && Number.isFinite(bid) ? (ask + bid) / 2
      : Number.isFinite(ask) ? ask : NaN;
    if (outcome && Number.isFinite(mid)) mids[outcome] = mid;
  }
  if (mids.home_win == null || mids.draw == null || mids.away_win == null) return null;
  const total = mids.home_win + mids.draw + mids.away_win;
  if (total <= 0) return null;
  return { home: mids.home_win / total, draw: mids.draw / total,
    away: mids.away_win / total };
}

function TripleBar({ m, probs, caption, emptyText }: {
  m: Match; probs: Triple; caption?: string; emptyText: string;
}) {
  if (!probs) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-5 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
        {emptyText}
      </p>
    );
  }
  const hc = sideColor(m.home, "#d50032");
  const ac = sideColor(m.away, "#a1a1aa");
  return (
    <div className="mt-3">
      <div className="flex h-3 gap-px overflow-hidden rounded-full">
        <div style={{ width: `${probs.home * 100}%`, background: hc }} />
        <div style={{ width: `${probs.draw * 100}%`, background: DRAW_COLOR }} />
        <div className="flex-1" style={{ background: ac }} />
      </div>
      <div className="mt-1.5 grid grid-cols-3 font-mono text-[11px] tabular-nums">
        <span className="text-left">
          <span style={{ color: hc }}>{m.home.abbrev}</span>{" "}
          <span className="text-ink-hi">{pct(probs.home)}</span>
        </span>
        <span className="text-center text-ink-low">
          draw {pct(probs.draw)}
        </span>
        <span className="text-right">
          <span className="text-ink-hi">{pct(probs.away)}</span>{" "}
          <span style={{ color: ac }}>{m.away.abbrev}</span>
        </span>
      </div>
      {caption && (
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
          {caption}
        </p>
      )}
    </div>
  );
}

/* ---------- how they play (fitted ratings + form) ---------- */

function ratingLine(label: string, v?: number, invert = false) {
  if (v == null) return null;
  const delta = (v - 1) * 100;
  const good = invert ? delta < 0 : delta > 0;
  return (
    <div key={label} className="flex items-baseline justify-between font-mono text-[11px]">
      <span className="uppercase tracking-[0.12em] text-ink-faint">{label}</span>
      <span className={`tabular-nums ${good ? "text-accent" : "text-ink-mid"}`}>
        {v.toFixed(2)}× league {delta >= 0 ? `(+${delta.toFixed(0)}%)` : `(${delta.toFixed(0)}%)`}
      </span>
    </div>
  );
}

function HowTheyPlay({ m, run }: { m: Match; run?: ModelRun }) {
  const b = run?.basis;
  if (!b?.home_attack) return null;
  const formFor = (abbrev?: string) =>
    m.scouting?.last_five.find((t) => t.abbrev === abbrev)?.form?.replace(/ /g, "");
  const cards = [
    { s: m.home, attack: b.home_attack, defence: b.home_defence,
      games: b.home_games, note: `at home (venue ×${b.venue_home})` },
    { s: m.away, attack: b.away_attack, defence: b.away_defence,
      games: b.away_games, note: "away side" },
  ];
  return (
    <Reveal>
      <Collapse eyebrow="scouting" title="How they play"
        defaultOpen={false} className="mt-8 mb-0">
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.s.abbrev} className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="truncate text-sm font-medium text-ink-hi">{c.s.name}</p>
                <FormChips form={formFor(c.s.abbrev)} />
              </div>
              <div className="space-y-1.5">
                {ratingLine("attack", c.attack)}
                {ratingLine("defence (lower = tighter)", c.defence, true)}
                <div className="flex items-baseline justify-between font-mono text-[11px]">
                  <span className="uppercase tracking-[0.12em] text-ink-faint">basis</span>
                  <span className="tabular-nums text-ink-low">{c.games} games · {c.note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
          fitted mls-2026-v0 goal rates, shrunk toward league average —
          recency-weighted, no hand-sourced narratives
        </p>
      </Collapse>
    </Reveal>
  );
}

/* ---------- the every-market table ---------- */

// families whose long tails read better folded away until asked for
const COLLAPSED_FAMILIES = new Set(
  ["score", "mov", "h1", "h1_total", "h1_spread", "h1_btts"]);

function MarketsTable({ m, run, book, families }: {
  m: Match; run?: ModelRun; book: Book | null; families: Family[];
}) {
  const [closed, setClosed] = useState<Set<string>>(
    () => new Set(COLLAPSED_FAMILIES));
  // every probability the stored run knows, keyed the way the backend
  // keys each market row (model_key)
  const probs: Record<string, number> = {
    ...(run?.outcomes ?? {}), ...(run?.props ?? {}),
  };
  for (const s of run?.scorelines ?? []) {
    const [h, a] = s.score.split("-");
    probs[`score_${h}_${a}`] = s.prob;
  }
  // the winner family joins by ticker through the approved mapping
  const winnerByTicker = new Map(
    Object.entries(run?.tickers ?? {}).map(([o, t]) => [t, o]));

  const fams = families.length > 0 ? families
    : book ? [{ key: "winner", label: "Winner · 3-way",
                event_ticker: book.event_ticker,
                markets: book.markets }] : [];
  if (fams.length === 0) return null;
  const nMarkets = fams.reduce((n, f) => n + f.markets.length, 0);

  const toggle = (key: string) => setClosed((c) => {
    const next = new Set(c);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const rowsFor = (f: Family) => f.markets.map((r) => {
    let mk = r.model_key ?? null;
    if (f.key === "winner") mk = winnerByTicker.get(r.ticker) ?? null;
    const modelP = mk != null ? probs[mk] ?? null : null;
    const ask = r.yes_ask ? parseFloat(r.yes_ask) : NaN;
    const bid = r.yes_bid ? parseFloat(r.yes_bid) : NaN;
    let label = r.label ?? r.ticker;
    if (f.key === "winner") {
      label = mk === "home_win" ? `${m.home.name} win`
        : mk === "away_win" ? `${m.away.name} win`
        : mk === "draw" ? "Draw" : label;
    }
    return { ticker: r.ticker, label, modelP,
      ask: Number.isFinite(ask) ? ask : null,
      bid: Number.isFinite(bid) ? bid : null };
  }).sort((a, b) => (b.modelP ?? -1) - (a.modelP ?? -1));

  return (
    <Reveal>
      <div className="mt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          every kalshi market on this match · {nMarkets} markets across{" "}
          {fams.length} families · click a group to fold
        </p>
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
            {fams.map((f) => {
              const fold = closed.has(f.key);
              return (
                <div key={f.key}>
                  <button onClick={() => toggle(f.key)}
                    className="flex w-full items-center gap-2.5 border-b border-line bg-elev/40 px-4 py-2.5 text-left transition-colors hover:bg-elev">
                    <span className={`text-ink-faint transition-transform ${
                      fold ? "" : "rotate-90"}`}>▸</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid">
                      {f.label}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
                      {f.markets.length} market{f.markets.length === 1 ? "" : "s"}
                    </span>
                  </button>
                  {!fold && rowsFor(f).map((j) => {
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
                          {j.ask != null && j.ask > 0 ? `${(1 / j.ask).toFixed(2)}x` : "—"}
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
              );
            })}
          </div>
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
          likelihood = the stored shadow run&apos;s probability where the model
          prices the market (&quot;—&quot; where it doesn&apos;t: method of
          victory + 1st-half families are market-only for now) · shadow,
          not advice
        </p>
      </div>
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

/* ---------- live stats + timeline ---------- */

function LiveBlock({ m, promoted }: { m: Match; promoted?: boolean }) {
  const live = m.state === "in";
  const post = m.state === "post";
  return (
    <section id="stats" className={promoted ? "mt-8" : "mt-10"}>
      <Reveal>
        <Collapse eyebrow={live ? "espn live · in play" : "espn live"}
          title="Match stats" defaultOpen={live || post} className="mb-0">
          {m.stats.length === 0 ? (
            <Empty>stats populate after kickoff</Empty>
          ) : (
            <div className="space-y-3">
              {m.stats.map((s) => <StatBar key={s.key} s={s} m={m} />)}
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
  );
}

function StatBar({ s, m }: { s: StatRow; m: Match }) {
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
        <div className="rounded-full"
          style={{ width: `${hw}%`,
            background: sideColor(m.home, "#d50032") }} />
        <div className="flex-1 rounded-full bg-elev2" />
      </div>
    </div>
  );
}

/* ---------- scouting (ESPN form + H2H) ---------- */

function fmtShortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString(undefined,
        { month: "short", day: "numeric", year: "numeric" })
    : iso;
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
      <Collapse eyebrow="scouting" title="ESPN form + H2H"
        defaultOpen={false} className="mt-8 mb-0">
        <div className="grid gap-4 sm:grid-cols-2">
          {sc.last_five.map((t) => (
            <div key={t.team} className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-ink-hi">{t.team}</p>
                <FormChips form={t.form?.replace(/ /g, "")} />
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
                      {g.at_vs === "@" ? "away at" : "home vs"} {g.opponent}
                    </span>
                    <span className="shrink-0 text-ink-faint">{fmtShortDate(g.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {sc.head_to_head.length > 0 && (() => {
          const persp = sc.head_to_head[0]?.perspective ?? "";
          return (
            <div className="mt-4 rounded-2xl border border-line p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                recent meetings · {persp} score always shown first
              </p>
              <div className="space-y-1.5">
                {sc.head_to_head.map((g, i) => {
                  // ESPN gives the score in that MATCH's home-away
                  // order; reorder it to perspective-first so W/L/D
                  // always agrees with the numbers the eye reads
                  const away = g.at_vs === "@";
                  const mine = away ? g.away_score : g.home_score;
                  const theirs = away ? g.home_score : g.away_score;
                  return (
                    <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`w-4 text-center ${
                        g.result === "W" ? "text-accent"
                          : g.result === "L" ? "text-neg" : "text-ink-low"}`}>
                        {g.result}
                      </span>
                      <span className="w-24 tabular-nums text-ink-hi">
                        {persp} {mine}–{theirs} {g.opponent}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ink-low">
                        {away ? `away at ${g.opponent}` : "at home"}
                      </span>
                      <span className="shrink-0 text-ink-faint">
                        {fmtShortDate(g.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
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

import { TZ } from "../../../lib/matchday";
// Liga MX match hub — mirrors the MLS hub skeleton (shared chrome +
// the every-market EDGE table are the core): compact match-info card,
// xG duel (model-simulated xG — NO provider xG exists for Liga MX),
// "how they play" from fitted ratings, ESPN scouting, then the
// market-vs-model comparison as two ALIGNED three-way stacked bars with
// the every-market edge table beneath. liga-mx-2026-v0 is DARK —
// unapproved, so no model number exists server-side yet; every model
// slot states that in words instead of rendering a zero. The market
// side (real Kalshi KXLIGAMX* books) is live and shown as raw prices.
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
// team_score/opponent_score are THIS team's goals first. Never render the
// provider's `score` string: ESPN formats it winner-first, so a 0-1 loss
// arrives as "1-0" and reads as a win (reported Jul 24, 2026).
type FiveGame = { result?: string; team_score?: number | null;
  opponent_score?: number | null; score?: string; at_vs?: string;
  opponent?: string; date?: string };
type LastFive = { team?: string; abbrev?: string; form?: string;
  games: FiveGame[] };
type H2H = { perspective?: string; result?: string; home_score?: string;
  away_score?: string; at_vs?: string; opponent?: string; date?: string };
type Match = { id: string; date?: string; state?: string; detail?: string;
  minute?: string; venue?: string; home: Side; away: Side;
  stats: StatRow[]; events: Ev[];
  scouting?: { last_five: LastFive[]; head_to_head: H2H[] } };
type XiPlayer = { name?: string; position?: string; jersey?: string;
  xg90?: number | null; apps?: number | null; is_goalkeeper?: boolean };
type Absence = { name?: string; xg90?: number; apps?: number;
  status?: "bench" | "out" };
type SideLineup = { formation?: string; confirmed?: boolean;
  released?: boolean; starters: XiPlayer[]; bench: XiPlayer[];
  goalkeeper?: string | null; key_absences: Absence[] };
type Lineups = { home: SideLineup | null; away: SideLineup | null;
  strength_available?: boolean };
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
  props?: Record<string, number>; basis?: Basis;
  input_quality?: Record<string, boolean> | null };
type ModelInfo = { model_version?: string; shadow?: boolean;
  primary?: ModelRun; latest?: ModelRun; t10_lock?: ModelRun | null };

const LIGAMX_VARS = {
  "--accent": "#0fbe66",
  "--accent-dim": "rgba(15,190,102,0.35)",
  "--accent-faint": "rgba(15,190,102,0.10)",
  "--accent-ambient": "rgba(15,190,102,0.07)",
} as React.CSSProperties;

const ACCENT = "#0fbe66";
const fee = (p: number) => 0.07 * p * (1 - p);
const DRAW_COLOR = "#52525b";          // neutral — no club owns the draw

function fmtTime(iso?: string | number | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    timeZone: TZ,
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

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

export default function LigamxMatchPage() {
  const router = useRouter();
  const eventId = typeof router.query.eventId === "string"
    ? router.query.eventId : null;
  const [m, setM] = useState<Match | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Family[]>([]);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [lineups, setLineups] = useState<Lineups | null>(null);
  const [err, setErr] = useState(false);
  const [now, setNow] = useState(() => Date.now());   // 1s countdown tick
  const [fetchedAt, setFetchedAt] = useState(0);      // when `book` was pulled

  useEffect(() => {
    if (!eventId) return;
    let alive = true;
    const load = () =>
      fetch(`/api/ligamx/match/${eventId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => {
          if (!alive) return;
          setM(d.match); setBook(d.book ?? null);
          setBooks(d.books ?? []);
          setModel(d.model ?? null); setLineups(d.lineups ?? null);
          setErr(false);
          setFetchedAt(Date.now());
        })
        .catch(() => alive && setErr(true));
    load();
    const poll = setInterval(load, 30000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => { alive = false; clearInterval(poll); clearInterval(tick); };
  }, [eventId]);

  const live = m?.state === "in";
  const post = m?.state === "post";
  // the canonical T-10 lock is the fixture's model once it exists —
  // a later scheduled run must never silently supersede it (V8 eval F9)
  const run = model?.primary ?? model?.latest;
  const secsToKick = m?.date && now > 0
    ? Math.floor((new Date(m.date).getTime() - now) / 1000) : null;
  const activeSection = useScrollSpy(["prediction", "strategy", "markets", "stats"]);

  return (
    <div style={LIGAMX_VARS} className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>
        {m ? (m.home.score != null && m.away.score != null
          ? `${m.home.abbrev} ${m.home.score}–${m.away.score} ${m.away.abbrev} · Liga MX`
          : `${m.home.abbrev} vs ${m.away.abbrev} · Liga MX`) : "Liga MX match"}
      </title></Head>

      <TopBar back={{ href: "/bet-suggester?league=ligamx", label: "liga mx board" }}
        title={m ? `${m.home.abbrev} vs ${m.away.abbrev}` : "Liga MX"}>
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
            {/* ===== the match-info box ===== */}
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
                    {run
                      ? "liga-mx-2026-v0 · shadow · not advice"
                      : "liga-mx-2026-v0 · dark — unapproved, no prediction exists"}
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

            {/* ===== xG duel — the SIMULATOR's expected goals; no
                   provider xG exists for Liga MX ===== */}
            {run?.xg && (
              <Reveal>
                <section className="mt-8">
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label={`${m.home.abbrev} sim xG`} value={run.xg.home.toFixed(2)} />
                    <Stat label={`${m.away.abbrev} sim xG`} value={run.xg.away.toFixed(2)} />
                    <Stat label="sims" value={run.n_simulations?.toLocaleString() ?? "—"} />
                  </div>
                  {run.xg.home + run.xg.away > 0 && (
                    <div className="mt-3">
                      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div className="rounded-full"
                          style={{
                            width: `${(run.xg.home / (run.xg.home + run.xg.away)) * 100}%`,
                            background: sideColor(m.home, ACCENT),
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

            {/* ===== team news: announced XI + notable absentees ===== */}
            <LineupSection lu={lineups} m={m} run={run} />

            {/* ===== ESPN scouting: form + H2H ===== */}
            <ScoutingSection m={m} />

            {/* ===== market vs model — the aligned three-way bars ===== */}
            <section id="markets" className="mt-10">
              <Reveal>
                <div className="rounded-2xl border border-line bg-elev p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <Eyebrow tone="accent">market · kalshi three-way</Eyebrow>
                    <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-faint">
                      {run ? "shadow · not advice" : "model dark · not advice"}
                    </span>
                  </div>
                  <TemporalBasis model={model} run={run} fetchedAt={fetchedAt} />
                  <MarketBar m={m} book={book} run={run} />
                  <div className="mt-5 border-t border-line pt-4">
                    <Eyebrow className="mb-1">model outcome probabilities</Eyebrow>
                    <TripleBar m={m} probs={modelProbs(run)}
                      caption={run ? `liga-mx-2026-v0 · ${run.n_simulations?.toLocaleString()} sims · seed ${run.seed}${run.run_type === "t10" ? " · T-10 LOCK — frozen pre-kickoff" : ""}` : undefined}
                      emptyText="liga-mx-2026-v0 is dark — unapproved, no prediction run exists" />
                  </div>
                  <InputQuality run={run} />
                  <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
                    same scale, read vertically — where the boundaries disagree
                    is where model and market disagree · the model stays dark
                    until it earns approval through prospective evaluation ·
                    real-money recommendations disabled
                  </p>
                </div>
              </Reveal>
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

            {/* ===== every market, right under the pure-model view ===== */}
            <MarketsTable m={m} run={run} book={book} families={books} />

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
              live data + real market prices · model dark until approved,
              observational only · not betting advice
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

/* ---------- input-quality honesty row (Phase 5) ---------- */

const QUALITY_LABELS: Array<[string, string]> = [
  ["LINEUP_CONFIRMED", "lineup"],
  ["GOALKEEPER_CONFIRMED", "keeper"],
  ["TEAM_DATA_FRESH", "team form"],
];

function InputQuality({ run }: { run?: ModelRun }) {
  const q = run?.input_quality;
  if (!q) return null;
  return (
    <div className="mt-4 border-t border-line pt-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        input quality at run time
      </p>
      <div className="flex flex-wrap gap-1.5">
        {QUALITY_LABELS.map(([key, label]) => {
          const ok = q[key];
          return (
            <span key={key}
              className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                ok ? "border-accent/40 text-accent"
                   : "border-line text-ink-faint"}`}>
              {ok ? "✓" : "·"} {label} {ok ? "" : "pending"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- the three-way stacked bar ---------- */

type Triple = { home: number; draw: number; away: number;
  method?: string } | null;

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
  let askOnly = 0;
  for (const r of rows) {
    let outcome = byTicker.get(r.ticker);
    if (!outcome && (r.label ?? "").trim().toLowerCase() === "tie") outcome = "draw";
    if (!outcome) {
      // last resort: the ticker's trailing team code vs the abbrevs.
      // NOTE Kalshi codes are its own (CDG for Guadalajara, CRA for
      // Cruz Azul) — this only ever matches when they coincide with
      // ESPN's, which is why the label pass above comes first.
      const tail = r.ticker.split("-").pop() ?? "";
      if (tail === m.home.abbrev) outcome = "home_win";
      else if (tail === m.away.abbrev) outcome = "away_win";
      else if (tail === "TIE") outcome = "draw";
    }
    if (!outcome) {
      // final pass: match the market's LABEL against the two club
      // names (Kalshi labels are ASCII, ESPN names carry accents —
      // strip diacritics on both sides before comparing)
      const label = strip((r.label ?? "").toLowerCase());
      const hn = strip((m.home.name ?? "").toLowerCase());
      const an = strip((m.away.name ?? "").toLowerCase());
      if (label && hn && (label.includes(hn) || hn.includes(label))) {
        outcome = "home_win";
      } else if (label && an && (label.includes(an) || an.includes(label))) {
        outcome = "away_win";
      }
    }
    const ask = parseFloat(r.yes_ask ?? "");
    const bid = parseFloat(r.yes_bid ?? "");
    let mid = NaN;
    if (Number.isFinite(ask) && Number.isFinite(bid)) mid = (ask + bid) / 2;
    else if (Number.isFinite(ask)) { mid = ask; askOnly += 1; }
    if (outcome && Number.isFinite(mid)) mids[outcome] = mid;
  }
  if (mids.home_win == null || mids.draw == null || mids.away_win == null) return null;
  const total = mids.home_win + mids.draw + mids.away_win;
  if (total <= 0) return null;
  return { home: mids.home_win / total, draw: mids.draw / total,
    away: mids.away_win / total,
    method: askOnly > 0
      ? `${askOnly} side${askOnly > 1 ? "s" : ""} ask-only (no bid)`
      : "bid/ask midpoints" };
}

function strip(s: string): string {
  return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/* The four temporal objects, labeled explicitly (V9 eval F16) — so a
   reader never mistakes "frozen model vs current market" for a
   same-moment edge. While the model is dark the model rows say so. */
function TemporalBasis({ model, run, fetchedAt }: {
  model: ModelInfo | null; run?: ModelRun; fetchedAt: number;
}) {
  const lock = model?.t10_lock ?? null;
  const latest = model?.latest ?? null;
  const showingLock = run?.run_type === "t10";
  const modelUsed = showingLock ? "T-10 lock" : "latest diagnostic";
  type Row = { label: string; value: string; active: boolean };
  const rows: Row[] = [
    { label: "canonical T-10 model",
      value: lock ? `frozen ${fmtTime(lock.captured_at)}`
        : run ? "not locked yet" : "none — model dark",
      active: showingLock },
  ];
  if (latest && (!lock || latest.captured_at !== lock.captured_at))
    rows.push({ label: "latest diagnostic model",
      value: fmtTime(latest.captured_at), active: !showingLock });
  rows.push({ label: "canonical T-10 frozen book",
    value: lock ? "recorded with the lock" : "—", active: false });
  rows.push({ label: "current market book",
    value: `live · ${fmtTime(fetchedAt || undefined)}`, active: true });
  return (
    <div className="mb-4 rounded-xl border border-line bg-elev2 p-3">
      <Eyebrow className="mb-2">temporal basis</Eyebrow>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label}
            className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-low">
              <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${
                r.active ? "bg-accent" : "bg-line-strong"}`} />
              {r.label}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-ink-mid">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
        {run
          ? `edge below = ${modelUsed} model (${fmtTime(run?.captured_at)}) vs the CURRENT market ask (${fmtTime(fetchedAt || undefined)}) — two different moments. the T-10 frozen book is recorded but is not the comparator shown here.`
          : "no model exists to compare — liga-mx-2026-v0 is dark, so the market bar below stands alone as raw exchange prices."}
      </p>
    </div>
  );
}

function MarketBar({ m, book, run }: {
  m: Match; book: Book | null; run?: ModelRun;
}) {
  const probs = impliedProbs(m, run, book);
  const caption = probs
    ? `implied % — normalized ${probs.method}; contains the exchange's spread`
    : undefined;
  return <TripleBar m={m} probs={probs} caption={caption}
    emptyText="no open kalshi book matched to this fixture" />;
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
  const hc = sideColor(m.home, ACCENT);
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
          fitted liga-mx-2026-v0 goal rates, shrunk toward league average —
          recency-weighted, goals only (no xG source exists for liga mx)
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
  // keys each market row (model_key). While the model is dark this map
  // is empty and every Likelihood/Net-edge cell renders "—".
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
              <span className="text-right" title="liga-mx-2026-v0 shadow probability — empty while the model is dark">Likelihood</span>
              <span className="text-right"
                title="Frozen/latest MODEL probability minus the CURRENT ask minus Kalshi's entry fee — empty while the model is dark">Net edge</span>
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
                      ? j.modelP - (j.ask + fee(j.ask)) : null;
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
          likelihood = the stored shadow run&apos;s probability where the
          model prices the market — every cell is &quot;—&quot; while
          liga-mx-2026-v0 stays dark (no prediction exists) · never advice
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
            background: sideColor(m.home, ACCENT) }} />
        <div className="flex-1 rounded-full bg-elev2" />
      </div>
    </div>
  );
}

/* ---------- team news: announced XI + notable absentees ----------
   DISPLAY CONTEXT ONLY — the model does not use lineups. No player-xG
   column has data here: no public per-player xG source exists for
   Liga MX (the MLS hub's xg/90 comes from the official Sportec feed,
   which Liga MX does not have), so the column renders "—" and the
   footnote says why. */

function XiRow({ p }: { p: XiPlayer }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[11px]">
      <span className="w-5 shrink-0 text-right tabular-nums text-ink-faint">
        {p.jersey ?? ""}
      </span>
      <span className="min-w-0 flex-1 truncate text-ink-hi">
        {p.name}
        {p.is_goalkeeper && (
          <span className="ml-1 text-ink-faint">(GK)</span>
        )}
      </span>
      <span className="w-10 shrink-0 text-ink-faint">{p.position ?? ""}</span>
      <span className="w-12 shrink-0 text-right tabular-nums text-ink-low">
        {typeof p.xg90 === "number" ? p.xg90.toFixed(2) : "—"}
      </span>
    </div>
  );
}

function SideXi({ side, team }: { side: SideLineup | null; team?: string }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-ink-hi">{team}</p>
        {side?.formation && (
          <span className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-ink-low">
            {side.formation}
          </span>
        )}
      </div>

      {!side?.released ? (
        <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
          awaiting team news
        </p>
      ) : (
        <>
          <div className="mb-1 flex items-baseline gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            <span className="w-5 shrink-0" />
            <span className="min-w-0 flex-1">starting xi</span>
            <span className="w-10 shrink-0">pos</span>
            <span className="w-12 shrink-0 text-right">xg/90</span>
          </div>
          <div className="space-y-1">
            {side.starters.map((p, i) => <XiRow key={i} p={p} />)}
          </div>
        </>
      )}

      {side && side.key_absences.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            not starting
          </p>
          <div className="space-y-1">
            {side.key_absences.map((a, i) => (
              <div key={i} className="flex items-baseline gap-2 font-mono text-[11px]">
                <span className="min-w-0 flex-1 truncate text-ink-hi">
                  {a.name}
                </span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] ${
                  a.status === "bench"
                    ? "bg-elev2 text-ink-low" : "bg-neg/15 text-neg"}`}>
                  {a.status === "bench" ? "bench" : "out"}
                </span>
                <span className="w-12 shrink-0 text-right tabular-nums text-ink-low">
                  {typeof a.xg90 === "number" ? a.xg90.toFixed(2) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LineupSection({ lu, m, run }: {
  lu: Lineups | null; m: Match; run?: ModelRun }) {
  if (!lu || (!lu.home && !lu.away)) return null;
  const anyReleased = Boolean(lu.home?.released || lu.away?.released);
  const post = m.state === "post";
  return (
    <Reveal>
      <Collapse eyebrow="team news" title="lineups + absentees"
        defaultOpen={anyReleased} className="mt-8 mb-0">
        {/* V9.3 eval F19: this block is CURRENT team news, fetched now —
            never lineup evidence attributed to a frozen model input. */}
        <div className="mb-3 rounded-xl border border-line bg-elev2 px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
            {post ? "as-played / latest" : "current team news"} — fetched now,
            not an input to any model
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            {run?.captured_at
              ? `the model's frozen input is the ${run.run_type === "t10"
                  ? "T-10 lock" : "latest run"} of ${fmtTime(run.captured_at)}`
              : "no model run exists for this fixture — liga-mx-2026-v0 is dark"}
            {run?.input_quality
              ? ` · lineup at run time: ${run.input_quality.LINEUP_CONFIRMED
                  ? "confirmed" : "pending"}`
              : ""}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SideXi side={lu.home} team={m.home?.name} />
          <SideXi side={lu.away} team={m.away?.name} />
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          xi from espn · no player xg — no public per-player xg source
          exists for liga mx · context only — the model does not use lineups
        </p>
      </Collapse>
    </Reveal>
  );
}

/* ---------- scouting (ESPN form + H2H) ---------- */

function fmtShortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString("en-US", {
    timeZone: TZ, month: "short", day: "numeric", year: "numeric" })
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
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-ink-hi">{t.team}</p>
                <FormChips form={t.form?.replace(/ /g, "")} />
              </div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                {t.abbrev ?? "their"} score first · oldest to newest
              </p>
              <div className="space-y-1.5">
                {t.games.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
                    <span className={`w-4 text-center ${
                      g.result === "W" ? "text-accent"
                        : g.result === "L" ? "text-neg" : "text-ink-low"}`}>
                      {g.result}
                    </span>
                    <span className="w-10 tabular-nums text-ink-hi">
                      {g.team_score != null && g.opponent_score != null
                        ? `${g.team_score}–${g.opponent_score}` : "–"}
                    </span>
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

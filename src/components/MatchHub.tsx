// The SHARED match hub — one component behind all four league match
// pages (2026-09-01). They began as forks of the MLS page and drifted
// exactly the way forks do: TWO of the four (MLS, Liga MX) were still
// applying a naive per-contract float fee that src/lib/fee.ts exists
// to forbid, while the other two had the canonical ceil-to-centicent
// whole-order policy. One implementation ends that class of bug: the
// league pages are now thin config files, and every honesty surface —
// dark-model states, the T-10 temporal basis, the absence-null
// semantics, the every-market table — is written once.
//
// League differences live in HubCfg and are COPY AND CAPABILITY, not
// structure: which strings a dark model states, whether a per-player
// strength feed exists, whether the xG shown is the simulator's, and
// whether a suggestion-card competition exists. Payload-driven
// sections (xG duel, input quality, absences) render wherever the
// data appears, so a league lighting up needs a config edit only for
// its words.
import { TZ } from "../lib/matchday";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { countdown, pct, signedPct } from "../lib/suggesterApi";
import { FEE_NOT_MODELED, maxContractsForStake, orderCostDollars,
  unitFeeDollars } from "../lib/fee";
import { Eyebrow, Reveal } from "./ui";
import { Collapse, NavChip, TopBar, useScrollSpy } from "./chrome";
import SuggestionCard from "./SuggestionCard";

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
  goalkeeper?: string | null;
  // null (never []) when the backend could NOT compute absences — the
  // competition has no player-strength feed, or a club did not resolve.
  // [] means it computed them and nobody is missing. Conflating the two
  // is the bug the backend fix exists to prevent; do not "simplify" this
  // to Absence[] with a ?? [] default.
  key_absences: Absence[] | null;
  key_absences_reason?: string | null };
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
export type ModelInfo = { model_version?: string; shadow?: boolean;
  primary?: ModelRun; latest?: ModelRun; t10_lock?: ModelRun | null };

/** Everything a league is ALLOWED to differ in. Copy and capability
 *  only — the structure is this file's and is not configurable. */
export interface HubCfg {
  /** board deep-link query value ("mls") and API base ("/api/mls") */
  boardQuery: string;
  api: string;
  /** title suffix + fallback words ("MLS" -> "MLS match") */
  tag: string;
  boardLabel: string;
  accentVars: React.CSSProperties;
  accentHex: string;
  version: string;
  /** the hero chip — each league's exact historical wording */
  chip: (model: ModelInfo | null, run?: ModelRun) => string;
  /** card-v1 competition slug; absent = no suggestion card, no Card nav.
   *  The union is SuggestionCard's own prop type — a league without a
   *  card-v1 backend cannot be wired here by accident. */
  suggestion?: "mls-2026" | "epl-2026" | "la-liga-2026";
  /** the xG shown is the SIMULATOR's (no provider feed) */
  simXg?: boolean;
  /** extra pill on the market section (Liga MX keeps its dark pill) */
  marketPill?: (run?: ModelRun) => string;
  /** the market section carries the temporal-basis panel */
  temporal: boolean;
  marketFootnote: string;
  modelEmptyText: string;
  likelihoodTooltip: string;
  netEdgeTooltip: string;
  tableFootnote: string;
  howTheyPlayNote: string;
  lineups: {
    title: string;
    /** per-player strength machinery (xg/90 column + absences) */
    rich: boolean;
    /** tail of the fetched-now note's first line */
    fetchedLine: string;
    /** the second line when no run exists */
    darkRunText: string;
    footnote: (strengthAvailable: boolean | undefined) => string;
  };
  footer: string;
}

// the net-edge gate's per-contract fee, unquantized — the same quantity
// the backend compares against a probability (src/lib/fee.ts). ONE
// definition: two of the four forks had quietly regressed to a naive
// per-contract float here.
const fee = unitFeeDollars;
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

export default function MatchHub({ cfg }: { cfg: HubCfg }) {
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
      fetch(`${cfg.api}/match/${eventId}`)
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
  const activeSection = useScrollSpy([
    ...(cfg.suggestion ? ["card"] : []),
    "prediction", "strategy", "markets", "stats"]);

  return (
    <div style={cfg.accentVars} className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>
        {m ? (m.home.score != null && m.away.score != null
          ? `${m.home.abbrev} ${m.home.score}–${m.away.score} ${m.away.abbrev} · ${cfg.tag}`
          : `${m.home.abbrev} vs ${m.away.abbrev} · ${cfg.tag}`) : `${cfg.tag} match`}
      </title></Head>

      <TopBar back={{ href: `/bet-suggester/leagues?league=${cfg.boardQuery}`,
          label: cfg.boardLabel }}
        title={m ? `${m.home.abbrev} vs ${m.away.abbrev}` : cfg.tag}>
        {live && (
          <NavChip href="#stats">
            <span className="pulse-dot mr-1 inline-block h-1 w-1 rounded-full bg-live align-middle" />
            <span className="text-live">
              {m?.home.abbrev} {m?.home.score}–{m?.away.score} {m?.away.abbrev}
            </span>
          </NavChip>
        )}
        {cfg.suggestion && (
          <NavChip href="#card" active={activeSection === "card"}>Card</NavChip>
        )}
        <NavChip href="#markets" active={activeSection === "markets"}>Markets</NavChip>
        <NavChip href="#prediction" active={activeSection === "prediction"}>Prediction</NavChip>
        <NavChip href="#strategy" active={activeSection === "strategy"}>Strategy</NavChip>
        <NavChip href="#stats" active={activeSection === "stats"}>Live</NavChip>
      </TopBar>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
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
                    {cfg.chip(model, run)}
                  </span>
                  {model?.t10_lock && (
                    <span className="rounded-md border border-live/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-live">
                      🔒 t-10 shadow lock recorded
                    </span>
                  )}
                </div>
              </section>
            </Reveal>

            <div className="mt-2 grid items-start gap-x-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
            <div className="min-w-0">
            {/* in play, the live read jumps the queue — see bottom */}
            {live && <LiveBlock m={m} promoted hex={cfg.accentHex} />}

            {/* ===== the suggestion card — every layer present or
                refusing by name (card-v1) ===== */}
            {eventId && cfg.suggestion && (
              <SuggestionCard key={eventId} competition={cfg.suggestion}
                eventId={eventId} />
            )}

            </div>{/* /main column */}
            <aside className="min-w-0 lg:pt-4">
            {/* ===== xG duel ===== */}
            {run?.xg && (
              <Reveal>
                <section className="mt-8">
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label={`${m.home.abbrev}${cfg.simXg ? " sim" : ""} xG`}
                      value={run.xg.home.toFixed(2)} />
                    <Stat label={`${m.away.abbrev}${cfg.simXg ? " sim" : ""} xG`}
                      value={run.xg.away.toFixed(2)} />
                    <Stat label="sims" value={run.n_simulations?.toLocaleString() ?? "—"} />
                  </div>
                  {run.xg.home + run.xg.away > 0 && (
                    <div className="mt-3">
                      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div className="rounded-full"
                          style={{
                            width: `${(run.xg.home / (run.xg.home + run.xg.away)) * 100}%`,
                            background: sideColor(m.home, cfg.accentHex),
                          }} />
                        <div className="flex-1 rounded-full bg-elev2" />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                        <span className="min-w-0 truncate">{m.home.abbrev} {pct(run.xg.home / (run.xg.home + run.xg.away))} of xG</span>
                        <span className="min-w-0 truncate">{m.away.abbrev}</span>
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>
            )}

            {/* ===== how they play — fitted ratings, no hand-waving ===== */}
            <HowTheyPlay m={m} run={run} note={cfg.howTheyPlayNote} />

            {/* ===== team news: announced XI + notable absentees ===== */}
            <LineupSection lu={lineups} m={m} run={run} cfg={cfg.lineups} />

            {/* ===== ESPN scouting: form + H2H ===== */}
            <ScoutingSection m={m} />

            </aside>{/* /rail */}
            </div>{/* /grid — the decision flow continues full-main below */}
            {/* ===== market vs model — the aligned three-way bars ===== */}
            <section id="markets" className="mt-10">
              <Reveal>
                <div className="rounded-2xl border border-line bg-elev p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <Eyebrow tone="accent">market · kalshi three-way</Eyebrow>
                    {cfg.marketPill && (
                      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-faint">
                        {cfg.marketPill(run)}
                      </span>
                    )}
                  </div>
                  {cfg.temporal && (
                    <TemporalBasis model={model} run={run}
                      fetchedAt={fetchedAt} version={cfg.version} />
                  )}
                  <MarketBar m={m} book={book} run={run} hex={cfg.accentHex} />
                  <div className="mt-5 border-t border-line pt-4">
                    <Eyebrow className="mb-1">model outcome probabilities</Eyebrow>
                    <TripleBar m={m} probs={modelProbs(run)} hex={cfg.accentHex}
                      caption={run ? `${cfg.version} · ${run.n_simulations?.toLocaleString()} sims · seed ${run.seed}${run.run_type === "t10" ? " · T-10 LOCK — frozen pre-kickoff" : ""}` : undefined}
                      emptyText={cfg.modelEmptyText} />
                  </div>
                  <InputQuality run={run} />
                  <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
                    {cfg.marketFootnote}
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
            <MarketsTable m={m} run={run} book={book} families={books} cfg={cfg} />

            {/* ===== scenario engine ===== */}
            <Reveal>
              <Collapse id="strategy" eyebrow="scenario engine"
                title="Betting strategy" className="mt-10 mb-0" defaultOpen={false}>
                <ScenarioSection book={book} />
              </Collapse>
            </Reveal>

            {/* ===== live stats + timeline (bottom slot when not live) ===== */}
            {!live && <LiveBlock m={m} hex={cfg.accentHex} />}

            <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
              {cfg.footer}
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
        <p className="truncate text-sm font-semibold text-ink-hi [font-family:var(--font-archivo)] [font-stretch:97%] sm:text-base">
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
      <p className="truncate font-mono text-xl tabular-nums text-ink-hi">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
    </div>
  );
}

/* ---------- input-quality honesty row (Phase 5) ---------- */

// Shows what team-selection data existed when the run was made. The
// model does NOT use lineups yet; this exists so missing data reads as
// PENDING, never as silent confidence.
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
                ok ? "border-up/40 text-up"
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
      // strip diacritics on both sides before comparing). This lived
      // only in the Liga MX fork before the merge; La Liga, whose
      // clubs are just as accented, never got it — the exact class of
      // stranded fix the shared hub exists to end.
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

/* The four temporal objects the evaluator asked to be labeled explicitly
   (V9 eval F16): the frozen T-10 model, the T-10 frozen book, the latest
   diagnostic model, and the CURRENT market book — so a reader never
   mistakes "frozen model vs current market" for a same-moment edge. */
function TemporalBasis({ model, run, fetchedAt, version }: {
  model: ModelInfo | null; run?: ModelRun; fetchedAt: number;
  version: string;
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
          ? `edge below = ${modelUsed} model (${fmtTime(run?.captured_at)}) vs the CURRENT market ask (${fmtTime(fetchedAt || undefined)}) — two different moments. the T-10 frozen book is recorded (in the corpus) but is not the comparator shown here.`
          : `no model exists to compare — ${version} is dark, so the market bar below stands alone as raw exchange prices.`}
      </p>
    </div>
  );
}

function MarketBar({ m, book, run, hex }: {
  m: Match; book: Book | null; run?: ModelRun; hex: string;
}) {
  const probs = impliedProbs(m, run, book);
  const caption = probs
    ? `implied % — normalized ${probs.method}; contains the exchange's spread`
    : undefined;
  return <TripleBar m={m} probs={probs} caption={caption} hex={hex}
    emptyText="no open kalshi book matched to this fixture" />;
}

function TripleBar({ m, probs, caption, emptyText, hex }: {
  m: Match; probs: Triple; caption?: string; emptyText: string; hex: string;
}) {
  if (!probs) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-5 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
        {emptyText}
      </p>
    );
  }
  const hc = sideColor(m.home, hex);
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
      <span className={`tabular-nums ${good ? "text-up" : "text-ink-mid"}`}>
        {v.toFixed(2)}× league {delta >= 0 ? `(+${delta.toFixed(0)}%)` : `(${delta.toFixed(0)}%)`}
      </span>
    </div>
  );
}

function HowTheyPlay({ m, run, note }: {
  m: Match; run?: ModelRun; note: string }) {
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
        <div className="grid gap-3">
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
          {note}
        </p>
      </Collapse>
    </Reveal>
  );
}

/* ---------- the every-market table ---------- */

// families whose long tails read better folded away until asked for
const COLLAPSED_FAMILIES = new Set(
  ["score", "mov", "h1", "h1_total", "h1_spread", "h1_btts"]);

function MarketsTable({ m, run, book, families, cfg }: {
  m: Match; run?: ModelRun; book: Book | null; families: Family[];
  cfg: HubCfg;
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
              <span className="text-right" title={cfg.likelihoodTooltip}>Likelihood</span>
              <span className="text-right" title={cfg.netEdgeTooltip}>Net edge</span>
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
                            : edge >= 0 ? "text-up" : "text-neg"}`}>
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
          {cfg.tableFootnote}
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
  // The CANONICAL fee policy (src/lib/fee.ts), which mirrors the
  // backend's order_fee_dollars: ONE ceil-to-centicent fee on the whole
  // order, in integer arithmetic. This used to apply 0.07·P·(1−P) per
  // contract in binary floating point, which both disagreed with the
  // policy and lost a whole contract to rounding ($10.63 at 10c buys
  // 100, not 99).
  const legs = rows.map((r) => {
    const ask = parseFloat(r.yes_ask!);
    const stake = parseFloat(stakes[r.ticker] ?? "") || 0;
    const contracts = maxContractsForStake(ask, stake);
    const cost = orderCostDollars(ask, contracts);
    return { ...r, ask, stake, contracts, cost };
  });
  const totalCost = legs.reduce((s, l) => s + l.cost, 0);
  return (
    <div>
      <p className="mb-4 text-xs leading-relaxed text-ink-low">
        Stake any mix of outcomes at the real ask plus Kalshi&apos;s
        general taker fee — ceil-to-centicent of 0.07·C·P·(1−P), charged
        once on the whole order, exactly as the backend&apos;s fee policy
        computes it. Pure execution arithmetic — this table does not
        opine on which outcome is likely. Not modelled: {FEE_NOT_MODELED}.
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
            <span data-testid={`scenario-contracts-${l.ticker}`}
              className="text-right font-mono text-[11px] tabular-nums text-ink-low">
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
                  <span className={net >= 0 ? "text-up" : "text-neg"}>
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

function LiveBlock({ m, promoted, hex }: {
  m: Match; promoted?: boolean; hex: string }) {
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
              {m.stats.map((s) => <StatBar key={s.key} s={s} m={m} hex={hex} />)}
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

function StatBar({ s, m, hex }: { s: StatRow; m: Match; hex: string }) {
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
            background: sideColor(m.home, hex) }} />
        <div className="flex-1 rounded-full bg-elev2" />
      </div>
    </div>
  );
}

/* ---------- team news: announced XI + notable absentees ----------
   DISPLAY CONTEXT ONLY. The walk-forward tests were explicit: an
   XI-strength adjustment does not beat team-xG, and key-attacker
   availability (+0.0034) is not significant — so nothing here moves a
   probability. It answers "who is actually playing?", nothing more.
   xG/90 has no La Liga source; the backend sends lineups=null and
   this section stays absent — honest, not stripped-down. */

function XiRow({ p, rich }: { p: XiPlayer; rich: boolean }) {
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
      {rich && (
        <span className="w-12 shrink-0 text-right tabular-nums text-ink-low">
          {typeof p.xg90 === "number" ? p.xg90.toFixed(2) : "—"}
        </span>
      )}
    </div>
  );
}

function SideXi({ side, team, rich }: {
  side: SideLineup | null; team?: string; rich: boolean }) {
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
            {rich && <span className="w-12 shrink-0 text-right">xg/90</span>}
          </div>
          <div className="space-y-1">
            {side.starters.map((p, i) => <XiRow key={i} p={p} rich={rich} />)}
          </div>
        </>
      )}

      {rich && side && side.key_absences === null && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            not starting
          </p>
          <p className="font-mono text-[10px] leading-relaxed text-ink-low">
            not available — {side.key_absences_reason
              || "the backend did not compute absences for this fixture"}.
            This is NOT a statement that nobody is missing.
          </p>
        </div>
      )}

      {rich && side && side.key_absences != null && side.key_absences.length > 0 && (
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

function LineupSection({ lu, m, run, cfg }: {
  lu: Lineups | null; m: Match; run?: ModelRun; cfg: HubCfg["lineups"] }) {
  if (!lu || (!lu.home && !lu.away)) return null;
  const anyReleased = Boolean(lu.home?.released || lu.away?.released);
  const post = m.state === "post";
  return (
    <Reveal>
      <Collapse eyebrow="team news" title={cfg.title}
        defaultOpen={anyReleased} className="mt-8 mb-0">
        {/* V9.3 eval F19: this block is CURRENT team news, fetched now —
            it is NOT the lineup evidence frozen into the T-10 lock. A
            reader must never attribute information to the model that was
            not available when the lock was created. */}
        <div className="mb-3 rounded-xl border border-line bg-elev2 px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
            {post ? "as-played / latest" : "current team news"} — fetched
            now, {cfg.fetchedLine}
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            {run?.captured_at
              ? `the model's frozen input is the ${run.run_type === "t10"
                  ? "T-10 lock" : "latest run"} of ${fmtTime(run.captured_at)}`
              : cfg.darkRunText}
            {run?.input_quality
              ? ` · lineup at run time: ${run.input_quality.LINEUP_CONFIRMED
                  ? "confirmed" : "pending"}`
              : ""}
          </p>
        </div>
        <div className="grid gap-4">
          <SideXi side={lu.home} team={m.home?.name} rich={cfg.rich} />
          <SideXi side={lu.away} team={m.away?.name} rich={cfg.rich} />
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          {cfg.footnote(lu.strength_available)}
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
            c === "W" ? "bg-up/20 text-up"
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
        <div className="grid gap-4">
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
                      g.result === "W" ? "text-up"
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
                        g.result === "W" ? "text-up"
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

// Live in-play panel (Layer 3 + Piece 5 honest presentation).
//
// The user enters the CURRENT match state — phase (1st/2nd half, extra time,
// penalties), score, minute, red-card counts, and optional attack "intensity"
// levers for qualitative reads ("team B is chasing"). The backend re-simulates
// only the remaining match and prices every current market against it.
// Deliberately kept visually and logically separate from the pre-match board:
// this shows the model's live read NEXT TO the market's own price, with the
// gap labelled informational — never as exploitable edge, because the market
// already knows the score.
//
// Inputs and the last computed read persist per-match in localStorage, so a
// reload doesn't lose a state that was fetched from the feed (past states
// never change).
import { useEffect, useState } from "react";
import {
  api, pct, LivePredictionResponse, LiveStateInput,
} from "../lib/suggesterApi";
import { Eyebrow } from "./ui";

// Match phases. 1st/2nd half drive the remaining-90 simulation; extra time
// simulates the remaining ET then 50/50 pens; penalties is the coin flip
// itself (90-minute markets are settled facts by then).
const PHASES = [
  { id: "1h", label: "1st half", min: 0, max: 45, phase: "regulation" },
  { id: "2h", label: "2nd half", min: 45, max: 90, phase: "regulation" },
  { id: "et", label: "Extra time", min: 90, max: 120, phase: "et" },
  { id: "pens", label: "Penalties", min: 120, max: 120, phase: "pens" },
] as const;
type PhaseId = (typeof PHASES)[number]["id"];

type Saved = {
  scoreH: number; scoreA: number; minute: number; phaseId: PhaseId;
  redH: number; redA: number; attH: number; attA: number;
  trackLive?: boolean;
  res: LivePredictionResponse | null; savedAt: string;
};

const storeKey = (matchId: string) => `bs-liveread-${matchId}`;

function loadSaved(matchId: string): Saved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storeKey(matchId));
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch { return null; }
}

export default function LivePanel({ matchId, liveLevers }: {
  matchId: string;
  // the auto stream's live-stats-derived levers; when present, the attack
  // sliders track them until the user grabs a slider (manual override)
  liveLevers?: { home: number; away: number } | null;
}) {
  // Full team names arrive with the first live response; until then fall
  // back to the codes in the match id (e.g. "POR_ESP" -> POR / ESP).
  const [codeH, codeA] = (matchId || "_").split("_");
  const saved = loadSaved(matchId);
  const [scoreH, setScoreH] = useState(saved?.scoreH ?? 0);
  const [scoreA, setScoreA] = useState(saved?.scoreA ?? 0);
  const [minute, setMinute] = useState(saved?.minute ?? 45);
  const [phaseId, setPhaseId] = useState<PhaseId>(saved?.phaseId ?? "1h");
  const [redH, setRedH] = useState(saved?.redH ?? 0);
  const [redA, setRedA] = useState(saved?.redA ?? 0);
  const [attH, setAttH] = useState(saved?.attH ?? 1.0);
  const [attA, setAttA] = useState(saved?.attA ?? 1.0);
  const [trackLive, setTrackLive] = useState(saved?.trackLive ?? true);

  // auto-track: follow the live-derived levers as the stats change, until
  // the user takes a slider (then their read wins until they re-enable).
  // React's "adjust state when input changes" pattern — a conditional
  // setState during render (compared by VALUE so a re-created liveLevers
  // object doesn't loop), never a setState-in-effect.
  const [trackedLevers, setTrackedLevers] =
    useState<{ home: number; away: number } | null>(null);
  if (trackLive && liveLevers &&
      (!trackedLevers || trackedLevers.home !== liveLevers.home
       || trackedLevers.away !== liveLevers.away)) {
    setTrackedLevers({ home: liveLevers.home, away: liveLevers.away });
    setAttH(liveLevers.home);
    setAttA(liveLevers.away);
  }

  const manualAttH = (v: number) => { setTrackLive(false); setAttH(v); };
  const manualAttA = (v: number) => { setTrackLive(false); setAttA(v); };

  const [res, setRes] = useState<LivePredictionResponse | null>(saved?.res ?? null);
  const [savedAt, setSavedAt] = useState(saved?.savedAt ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [autoMsg, setAutoMsg] = useState("");
  const [autoLoading, setAutoLoading] = useState(false);

  const ph = PHASES.find((p) => p.id === phaseId)!;

  // Persist inputs + last result per match; a fetched past state never
  // changes, so surviving a reload is the honest default.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const s: Saved = { scoreH, scoreA, minute, phaseId, redH, redA,
                         attH, attA, trackLive, res,
                         savedAt: savedAt || new Date().toISOString() };
      localStorage.setItem(storeKey(matchId), JSON.stringify(s));
    } catch { /* storage full/blocked — nothing to do */ }
  }, [matchId, scoreH, scoreA, minute, phaseId, redH, redA, attH, attA, trackLive, res, savedAt]);

  function pickPhase(id: PhaseId) {
    const p = PHASES.find((x) => x.id === id)!;
    setPhaseId(id);
    setMinute((m) => Math.min(Math.max(m, p.min), p.max));
  }

  function phaseForMinute(m: number): PhaseId {
    return m <= 45 ? "1h" : m <= 90 ? "2h" : "et";
  }

  async function autoFill() {
    setAutoLoading(true);
    setAutoMsg("");
    try {
      const s = await api.liveState(matchId);
      if (!s.available) {
        setAutoMsg(
          s.reason === "feed not configured"
            ? "Live feed not set up — enter the state manually below."
            : "No live match found right now — enter the state manually below."
        );
        return;
      }
      setScoreH(s.current_home ?? 0);
      setScoreA(s.current_away ?? 0);
      if (s.minutes_elapsed != null) {
        const m = Math.round(s.minutes_elapsed);
        setMinute(m);
        setPhaseId(phaseForMinute(m));
      }
      // feed now reports COUNTS (legacy responses may still send booleans)
      setRedH(Math.min(3, Number(s.red_home) || 0));
      setRedA(Math.min(3, Number(s.red_away) || 0));
      setSavedAt(new Date().toISOString());
      const fin = s.is_finished ? " (match finished)" : "";
      setAutoMsg(
        `Filled from live feed: ${s.current_home}-${s.current_away}, ${
          s.minutes_elapsed ?? "?"}'${fin} · ${s.budget.remaining} feed calls left today · saved locally`
      );
    } catch {
      setAutoMsg("Couldn't reach the live feed — enter the state manually.");
    } finally {
      setAutoLoading(false);
    }
  }

  async function run() {
    setLoading(true);
    setErr("");
    const state: LiveStateInput = {
      current_home: scoreH, current_away: scoreA,
      minutes_elapsed: phaseId === "pens" ? 120 : minute,
      red_home: redH, red_away: redA, phase: ph.phase,
      attack_home_mult: attH, attack_away_mult: attA,
    };
    try {
      setRes(await api.livePrediction(matchId, state));
      setSavedAt(new Date().toISOString());
    } catch {
      setErr("Could not compute a live read. Is the backend reachable?");
    } finally {
      setLoading(false);
    }
  }

  const home = res?.teams?.home ?? codeH ?? "Home";
  const away = res?.teams?.away ?? codeA ?? "Away";
  const resPhase = res?.live_state?.phase ?? "regulation";

  const num = (v: number, set: (n: number) => void, min: number, max: number) => (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => set(Math.max(min, v - 1))}
        className="h-7 w-7 rounded-md border border-line text-ink-mid transition-colors hover:border-line-strong hover:text-ink-hi"
      >−</button>
      <span className="w-8 text-center font-mono tabular-nums text-ink-hi">{v}</span>
      <button
        onClick={() => set(Math.min(max, v + 1))}
        className="h-7 w-7 rounded-md border border-line text-ink-mid transition-colors hover:border-line-strong hover:text-ink-hi"
      >+</button>
    </div>
  );

  return (
    <section className="mb-14 rounded-2xl border border-skylive/25 bg-skylive/5 p-5 sm:p-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-skylive" />
        <Eyebrow tone="sky">Live read — experimental</Eyebrow>
        <span className="rounded-md border border-warn/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
          developer use only
        </span>
      </div>
      <p className="mb-5 max-w-xl text-xs leading-relaxed text-ink-low">
        Enter the current state while watching. The model re-simulates the
        rest of the match from here. Shown next to the market&apos;s own price —
        the gap is informational, not a betting edge.
      </p>

      {/* auto-fill from the live feed (Layer 2) */}
      <div className="mb-5">
        <button
          onClick={autoFill} disabled={autoLoading}
          className={`rounded-lg border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
            autoLoading
              ? "cursor-not-allowed border-line text-ink-faint"
              : "border-accent/40 text-accent hover:border-accent hover:bg-accent/5"
          }`}
        >
          {autoLoading ? "Fetching…" : "⟳ Auto-fill from live feed"}
        </button>
        {autoMsg && <p className="mt-2 text-xs text-ink-mid">{autoMsg}</p>}
      </div>

      {/* --- phase selector --- */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => pickPhase(p.id)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              phaseId === p.id
                ? "border-skylive/60 bg-skylive/10 text-skylive"
                : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {(phaseId === "et" || phaseId === "pens") && (
        <p className="mb-4 text-[11px] leading-relaxed text-ink-faint">
          {phaseId === "et"
            ? "Extra time: regulation ended level, so 90-minute markets are settled. The model simulates the remaining ET from the current score, then 50/50 penalties — only advancement is priced."
            : "Penalty shootout: an honest coin flip (≈50/50). Nothing left to simulate — 90-minute markets are settled and no invented skill number is applied."}
        </p>
      )}

      {/* --- state entry --- */}
      <div className="mb-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-mid">{home} goals</span>
            {num(scoreH, setScoreH, 0, 20)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-mid">{away} goals</span>
            {num(scoreA, setScoreA, 0, 20)}
          </div>
          {phaseId !== "pens" && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-mid">minute</span>
              <input
                type="range" min={ph.min} max={ph.max} value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-32 accent-skylive"
              />
              <span className="w-10 text-right font-mono tabular-nums text-ink-hi">{minute}&apos;</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-mid">{home} red cards</span>
            {num(redH, setRedH, 0, 3)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-mid">{away} red cards</span>
            {num(redA, setRedA, 0, 3)}
          </div>
        </div>
      </div>

      {/* --- optional qualitative levers --- */}
      <details className="mb-5 rounded-xl border border-line p-3.5">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
          Attack intensity levers (optional — your read)
        </summary>
        <p className="mt-3 mb-3 text-xs leading-relaxed text-ink-faint">
          Seeing a team throw everyone forward? Nudge their attack up. Seeing a
          team park the bus? Defence is covered by the same lever — lower the
          OPPONENT&apos;s attack (each lever scales that team&apos;s whole goal rate,
          which already includes what the defence allows). This is your
          transparent adjustment to the model&apos;s inputs — you can see exactly
          what it does. 1.0 = no change.
        </p>
        {liveLevers && (
          <button
            onClick={() => setTrackLive(!trackLive)}
            className={`mb-3 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
              trackLive
                ? "border-skylive/50 bg-skylive/10 text-skylive"
                : "border-line text-ink-low hover:border-line-strong hover:text-ink-mid"
            }`}
            title="ON: the sliders follow the live read's stats-derived levers as the match evolves. Touching a slider switches to your manual read."
          >
            {trackLive ? "● tracking live stats" : "○ track live stats"}
          </button>
        )}
        <Lever label={`${home} attack`} v={attH} set={manualAttH} />
        <Lever label={`${away} attack`} v={attA} set={manualAttA} />
      </details>

      <button
        onClick={run} disabled={loading}
        className={`rounded-lg border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
          loading
            ? "cursor-not-allowed border-line text-ink-faint"
            : "border-skylive/50 text-skylive hover:border-skylive hover:bg-skylive/5"
        }`}
      >
        {loading ? "Simulating…" : "Compute live read"}
      </button>

      {err && <p className="mt-3 text-sm text-live">{err}</p>}

      {res && !loading && (
        <div className="mt-7">
          {savedAt && (
            <p className="mb-3 text-right font-mono text-[10px] tracking-wide text-ink-faint">
              saved locally · {new Date(savedAt).toLocaleTimeString()}
            </p>
          )}
          {/* the entered state, score-as-hero */}
          <div className="mb-6 text-center">
            <p className="text-5xl font-semibold tracking-tight tabular-nums text-ink-hi sm:text-6xl">
              {res.live_state.score}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
              {resPhase === "pens" ? "penalty shootout"
                : resPhase === "et"
                ? `${res.live_state.minutes_remaining}′ of extra time left`
                : `${res.live_state.minutes_remaining}′ of regulation left`}
              {Number(res.live_state.red_home) > 0 &&
                ` · ${home} red ×${Number(res.live_state.red_home)}`}
              {Number(res.live_state.red_away) > 0 &&
                ` · ${away} red ×${Number(res.live_state.red_away)}`}
            </p>
          </div>

          {/* live W/D/L — one simulation, sums to 100%, so one honest bar.
              In ET/pens regulation is settled (draw), so skip the 90' bar. */}
          {resPhase === "regulation" && (
            <div className="mb-5">
              <Eyebrow className="mb-3">rest-of-match simulation · regulation</Eyebrow>
              <SegBar segs={[
                { label: `${home} win (90′)`, value: res.live_outcomes.home_win, color: "var(--accent)" },
                { label: "draw (90′)", value: res.live_outcomes.draw, color: "rgba(255,255,255,0.22)" },
                { label: `${away} win (90′)`, value: res.live_outcomes.away_win, color: "var(--skylive)" },
              ]} />
            </div>
          )}

          {res.live_advance && res.stage === "knockout" && (
            <div className="mb-6">
              <Eyebrow className="mb-3">
                {resPhase === "pens" ? "shootout · 50/50 by design"
                  : "advance · with ET + penalties"}
              </Eyebrow>
              <SegBar segs={[
                { label: `${home} advance`, value: res.live_advance.home, color: "var(--accent)" },
                { label: `${away} advance`, value: res.live_advance.away, color: "var(--skylive)" },
              ]} />
              {resPhase !== "pens" && (
                <p className="mt-2.5 font-mono text-[11px] tabular-nums text-ink-faint">
                  reaches ET {pct(res.live_advance.p_reach_et)} · reaches pens {pct(res.live_advance.p_reach_pens)}
                </p>
              )}
            </div>
          )}

          <Eyebrow className="mb-3">
            Live read vs market — {res.live_state.score}
            {resPhase === "regulation" && `, ${res.live_state.minutes_remaining}′ left`}
          </Eyebrow>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-elev text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Market</th>
                  <th className="px-3 py-2.5 text-right font-normal">Live model</th>
                  <th className="px-3 py-2.5 text-right font-normal">Market</th>
                  <th className="px-3 py-2.5 text-right font-normal">Diff</th>
                  <th className="px-3 py-2.5 text-right font-normal">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {res.markets.map((m) => (
                  <tr key={m.market_id} className="border-t border-line transition-colors hover:bg-elev">
                    <td className="px-4 py-2.5 text-ink-hi">{m.market_title}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-skylive">
                      {pct(m.live_model_probability)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-mid">
                      {m.market_probability != null ? pct(m.market_probability) : "—"}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                      m.difference == null ? "text-ink-faint"
                        : m.difference >= 0 ? "text-accent" : "text-neg"
                    }`}>
                      {m.difference == null ? "—"
                        : `${m.difference >= 0 ? "+" : ""}${(m.difference * 100).toFixed(1)}%`}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-mid">
                      {m.kalshi_odds != null ? `${m.kalshi_odds.toFixed(2)}x` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {res.markets.length === 0 && (
            <p className="mt-2.5 text-xs text-ink-low">
              No live market prices available for this match right now (its books
              may be closed). The read above is simulation-only.
            </p>
          )}
          <p className="mt-4 text-xs italic leading-relaxed text-ink-faint">{res.disclaimer}</p>
        </div>
      )}
    </section>
  );
}

function SegBar({ segs }: {
  segs: { label: string; value: number; color: string }[];
}) {
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-elev2">
        {segs.map((s) => (
          <div
            key={s.label}
            style={{ width: `${Math.max(s.value * 100, 0)}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        {segs.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11px] text-ink-low">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="font-mono tabular-nums text-ink-mid">{pct(s.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Lever({ label, v, set }: {
  label: string; v: number; set: (n: number) => void;
}) {
  return (
    <div className="mb-2.5 flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-ink-mid">{label}</span>
      <input
        type="range" min={0.5} max={2.0} step={0.05} value={v}
        onChange={(e) => set(Number(e.target.value))}
        className="flex-1 accent-warn"
      />
      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-ink-mid">
        {v.toFixed(2)}×
      </span>
    </div>
  );
}

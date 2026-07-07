// Live in-play panel (Layer 3 + Piece 5 honest presentation).
//
// The user enters the CURRENT match state — score, minute, red cards, and
// optional attack "intensity" levers for qualitative reads ("team B is
// chasing"). The backend re-simulates only the remaining match and prices
// every current market against it. Deliberately kept visually and logically
// separate from the pre-match board: this shows the model's live read NEXT
// TO the market's own price, with the gap labelled informational — never as
// exploitable edge, because the market already knows the score.
//
// Presentation note: the live W/D/L here is a SINGLE segmented bar (unlike
// the pre-match stat bars) because these come from one simulation and sum
// to 100% — a partition bar is honest for this data.
import { useState } from "react";
import {
  api, pct, LivePredictionResponse, LiveStateInput,
} from "../lib/suggesterApi";
import { Eyebrow } from "./ui";

export default function LivePanel({ matchId }: { matchId: string }) {
  // Full team names arrive with the first live response; until then fall
  // back to the codes in the match id (e.g. "POR_ESP" -> POR / ESP).
  const [codeH, codeA] = (matchId || "_").split("_");
  const [scoreH, setScoreH] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [minute, setMinute] = useState(45);
  const [redH, setRedH] = useState(false);
  const [redA, setRedA] = useState(false);
  const [attH, setAttH] = useState(1.0);
  const [attA, setAttA] = useState(1.0);

  const [res, setRes] = useState<LivePredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [autoMsg, setAutoMsg] = useState("");
  const [autoLoading, setAutoLoading] = useState(false);

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
      if (s.minutes_elapsed != null) setMinute(Math.round(s.minutes_elapsed));
      setRedH(!!s.red_home);
      setRedA(!!s.red_away);
      const fin = s.is_finished ? " (match finished)" : "";
      setAutoMsg(
        `Filled from live feed: ${s.current_home}-${s.current_away}, ${
          s.minutes_elapsed ?? "?"}'${fin} · ${s.budget.remaining} feed calls left today`
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
      current_home: scoreH, current_away: scoreA, minutes_elapsed: minute,
      red_home: redH, red_away: redA,
      attack_home_mult: attH, attack_away_mult: attA,
    };
    try {
      setRes(await api.livePrediction(matchId, state));
    } catch {
      setErr("Could not compute a live read. Is the backend reachable?");
    } finally {
      setLoading(false);
    }
  }

  const home = res?.teams?.home ?? codeH ?? "Home";
  const away = res?.teams?.away ?? codeA ?? "Away";

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
      <div className="mb-2 flex items-center gap-2">
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-skylive" />
        <Eyebrow tone="sky">Live read — experimental</Eyebrow>
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
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-mid">minute</span>
            <input
              type="range" min={0} max={120} value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="w-32 accent-skylive"
            />
            <span className="w-10 text-right font-mono tabular-nums text-ink-hi">{minute}&apos;</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-ink-mid">
            <input type="checkbox" checked={redH}
              onChange={(e) => setRedH(e.target.checked)}
              className="accent-live" />
            {home} red card
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-mid">
            <input type="checkbox" checked={redA}
              onChange={(e) => setRedA(e.target.checked)}
              className="accent-live" />
            {away} red card
          </label>
        </div>
      </div>

      {/* --- optional qualitative levers --- */}
      <details className="mb-5 rounded-xl border border-line p-3.5">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
          Attack intensity levers (optional — your read)
        </summary>
        <p className="mt-3 mb-3 text-xs leading-relaxed text-ink-faint">
          Seeing a team throw everyone forward? Nudge their attack. This is your
          transparent adjustment to the model&apos;s inputs — you can see exactly
          what it does. 1.0 = no change.
        </p>
        <Lever label={`${home} attack`} v={attH} set={setAttH} />
        <Lever label={`${away} attack`} v={attA} set={setAttA} />
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
          {/* the entered state, score-as-hero */}
          <div className="mb-6 text-center">
            <p className="text-5xl font-semibold tracking-tight tabular-nums text-ink-hi sm:text-6xl">
              {res.live_state.score}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
              {res.live_state.minutes_remaining}&prime; of regulation left
              {res.live_state.red_home && ` · ${home} red card`}
              {res.live_state.red_away && ` · ${away} red card`}
            </p>
          </div>

          {/* live W/D/L — one simulation, sums to 100%, so one honest bar */}
          <div className="mb-5">
            <Eyebrow className="mb-3">rest-of-match simulation · regulation</Eyebrow>
            <SegBar segs={[
              { label: `${home} win (90′)`, value: res.live_outcomes.home_win, color: "var(--accent)" },
              { label: "draw (90′)", value: res.live_outcomes.draw, color: "rgba(255,255,255,0.22)" },
              { label: `${away} win (90′)`, value: res.live_outcomes.away_win, color: "var(--skylive)" },
            ]} />
          </div>

          {res.live_advance && res.stage === "knockout" && (
            <div className="mb-6">
              <Eyebrow className="mb-3">advance · with ET + penalties</Eyebrow>
              <SegBar segs={[
                { label: `${home} advance`, value: res.live_advance.home, color: "var(--accent)" },
                { label: `${away} advance`, value: res.live_advance.away, color: "var(--skylive)" },
              ]} />
              <p className="mt-2.5 font-mono text-[11px] tabular-nums text-ink-faint">
                reaches ET {pct(res.live_advance.p_reach_et)} · reaches pens {pct(res.live_advance.p_reach_pens)}
              </p>
            </div>
          )}

          <Eyebrow className="mb-3">
            Live read vs market — {res.live_state.score},{" "}
            {res.live_state.minutes_remaining}&apos; left
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
                {res.markets.slice(0, 15).map((m) => (
                  <tr key={m.market_id} className="border-t border-line transition-colors hover:bg-elev">
                    <td className="px-4 py-2.5 text-ink-hi">{m.market_title}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-skylive">
                      {pct(m.live_model_probability)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-mid">
                      {pct(m.market_probability)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-low">
                      {m.difference >= 0 ? "+" : ""}{(m.difference * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-mid">{m.kalshi_odds.toFixed(2)}x</td>
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

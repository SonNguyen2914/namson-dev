// Live in-play panel (Layer 3 + Piece 5 honest presentation).
//
// The user enters the CURRENT match state — score, minute, red cards, and
// optional attack "intensity" levers for qualitative reads ("team B is
// chasing"). The backend re-simulates only the remaining match and prices
// every current market against it. Deliberately kept visually and logically
// separate from the pre-match board: this shows the model's live read NEXT
// TO the market's own price, with the gap labelled informational — never as
// exploitable edge, because the market already knows the score.
import { useState } from "react";
import {
  api, pct, LivePredictionResponse, LiveStateInput,
} from "../lib/suggesterApi";

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
    } catch (e) {
      setErr("Could not compute a live read. Is the backend reachable?");
    } finally {
      setLoading(false);
    }
  }

  const home = res?.teams?.home ?? codeH ?? "Home";
  const away = res?.teams?.away ?? codeA ?? "Away";

  const num = (v: number, set: (n: number) => void, min: number, max: number) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => set(Math.max(min, v - 1))}
        className="h-7 w-7 rounded border border-neutral-700 text-neutral-300 hover:border-neutral-500"
      >−</button>
      <span className="w-8 text-center tabular-nums text-white">{v}</span>
      <button
        onClick={() => set(Math.min(max, v + 1))}
        className="h-7 w-7 rounded border border-neutral-700 text-neutral-300 hover:border-neutral-500"
      >+</button>
    </div>
  );

  return (
    <section className="mb-10 rounded-lg border border-sky-900/50 bg-sky-950/10 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="animate-pulse text-sky-400">●</span>
        <h3 className="text-sm uppercase tracking-widest text-sky-300">
          Live read — experimental
        </h3>
      </div>
      <p className="mb-4 text-xs text-neutral-500">
        Enter the current state while watching. The model re-simulates the
        rest of the match from here. Shown next to the market&apos;s own price —
        the gap is informational, not a betting edge.
      </p>

      {/* auto-fill from the live feed (Layer 2) */}
      <div className="mb-4">
        <button
          onClick={autoFill} disabled={autoLoading}
          className={`rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition ${
            autoLoading
              ? "cursor-not-allowed border-neutral-800 text-neutral-600"
              : "border-emerald-800 text-emerald-400 hover:border-emerald-500"
          }`}
        >
          {autoLoading ? "Fetching…" : "⟳ Auto-fill from live feed"}
        </button>
        {autoMsg && <p className="mt-2 text-xs text-neutral-400">{autoMsg}</p>}
      </div>

      {/* --- state entry --- */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">{home} goals</span>
            {num(scoreH, setScoreH, 0, 20)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">{away} goals</span>
            {num(scoreA, setScoreA, 0, 20)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">minute</span>
            <input
              type="range" min={0} max={120} value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="w-32 accent-sky-500"
            />
            <span className="w-10 text-right tabular-nums text-white">{minute}&apos;</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={redH}
              onChange={(e) => setRedH(e.target.checked)}
              className="accent-red-500" />
            {home} red card
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={redA}
              onChange={(e) => setRedA(e.target.checked)}
              className="accent-red-500" />
            {away} red card
          </label>
        </div>
      </div>

      {/* --- optional qualitative levers --- */}
      <details className="mb-4 rounded border border-neutral-800 p-3">
        <summary className="cursor-pointer text-xs uppercase tracking-wider text-neutral-500">
          Attack intensity levers (optional — your read)
        </summary>
        <p className="mt-2 mb-3 text-xs text-neutral-600">
          Seeing a team throw everyone forward? Nudge their attack. This is your
          transparent adjustment to the model&apos;s inputs — you can see exactly
          what it does. 1.0 = no change.
        </p>
        <Lever label={`${home} attack`} v={attH} set={setAttH} />
        <Lever label={`${away} attack`} v={attA} set={setAttA} />
      </details>

      <button
        onClick={run} disabled={loading}
        className={`rounded border px-4 py-2 text-sm uppercase tracking-wider transition ${
          loading
            ? "cursor-not-allowed border-neutral-800 text-neutral-600"
            : "border-sky-700 text-sky-300 hover:border-sky-500 hover:text-sky-200"
        }`}
      >
        {loading ? "Simulating…" : "Compute live read"}
      </button>

      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

      {res && !loading && (
        <div className="mt-5">
          {/* live outcome summary */}
          <div className="mb-4 grid grid-cols-3 gap-3 text-center">
            <LiveStat label={`${home} win (90)`} value={pct(res.live_outcomes.home_win)} />
            <LiveStat label="draw (90)" value={pct(res.live_outcomes.draw)} />
            <LiveStat label={`${away} win (90)`} value={pct(res.live_outcomes.away_win)} />
          </div>
          {res.live_advance && res.stage === "knockout" && (
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <LiveStat label={`${home} advance`} value={pct(res.live_advance.home)} accent />
              <LiveStat label="reaches ET" value={pct(res.live_advance.p_reach_et)} />
              <LiveStat label={`${away} advance`} value={pct(res.live_advance.away)} accent />
            </div>
          )}

          <p className="mb-2 text-xs uppercase tracking-wider text-neutral-500">
            Live read vs market — {res.live_state.score},{" "}
            {res.live_state.minutes_remaining}&apos; left
          </p>
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="w-full text-sm tabular-nums">
              <thead className="bg-neutral-900 text-left text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-2">Market</th>
                  <th className="px-3 py-2 text-right">Live model</th>
                  <th className="px-3 py-2 text-right">Market</th>
                  <th className="px-3 py-2 text-right">Diff</th>
                  <th className="px-3 py-2 text-right">Multiplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70">
                {res.markets.slice(0, 15).map((m) => (
                  <tr key={m.market_id} className="hover:bg-neutral-900/60">
                    <td className="px-4 py-2 text-neutral-100">{m.market_title}</td>
                    <td className="px-3 py-2 text-right text-sky-300">
                      {pct(m.live_model_probability)}
                    </td>
                    <td className="px-3 py-2 text-right text-neutral-400">
                      {pct(m.market_probability)}
                    </td>
                    <td className="px-3 py-2 text-right text-neutral-500">
                      {m.difference >= 0 ? "+" : ""}{(m.difference * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right">{m.kalshi_odds.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {res.markets.length === 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              No live market prices available for this match right now (its books
              may be closed). The read above is simulation-only.
            </p>
          )}
          <p className="mt-3 text-xs italic text-neutral-600">{res.disclaimer}</p>
        </div>
      )}
    </section>
  );
}

function Lever({ label, v, set }: {
  label: string; v: number; set: (n: number) => void;
}) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <span className="w-28 text-xs text-neutral-400">{label}</span>
      <input
        type="range" min={0.5} max={2.0} step={0.05} value={v}
        onChange={(e) => set(Number(e.target.value))}
        className="flex-1 accent-amber-500"
      />
      <span className="w-10 text-right text-xs tabular-nums text-neutral-300">
        {v.toFixed(2)}×
      </span>
    </div>
  );
}

function LiveStat({ label, value, accent }: {
  label: string; value: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${
      accent ? "border-sky-900/50 bg-sky-950/20" : "border-neutral-800"
    }`}>
      <p className="text-lg text-white">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
    </div>
  );
}

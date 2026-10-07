// THE CAREFUL STRATEGY on the console (2026-10-06, Son's decisions;
// backend src/trading/careful.py, careful_run.py, docs/TRADING-AGENT.md
// §38; redesigned into the Model view 2026-10-07). EXPERIMENTAL, UNPROVEN.
//
// Reads the status route's `careful` block — never a provider, never a
// per-market result — and draws:
//   * the newest tick's gate: candidates / qualifying / funded / swaps /
//     probable data errors (edges above the ceiling, never bet);
//   * the competitions with Son's on/off switch (POST
//     /api/ops/trading-careful): off = paper only;
//   * paper vs real per situation (competition × family × time bucket),
//     a disagreement (CLV good, money losing) flagged;
//   * (2026-10-07) the paper bets' would-be RESULTS beside their CLV, per
//     competition × family × phase (`paper_results`), the same flag when
//     CLV and results disagree; the probable data errors split into
//     pre-match and in play; the IN-PLAY three-point ladder (deep, fresh,
//     spare: 0-1 paper, 2 $1, 3 $2) and the last day's in-play paper bets
//     by score, tier and signal (`inplay_ladder`);
//   * the grounds' paper and real evidence (n, matches, mean CLV after the
//     fee and its match-clustered 95% range), promoted and probation
//     grounds, and the section-4 events (checks and proposals);
//   * the knobs in force.
// The DAILY BUDGET and the PER-KICKOFF-HOUR usage are money at risk, so
// they are drawn with the capital on Overview (components/console/
// Overview.tsx). A block the backend does not send reads "not served yet",
// never 0.
import { useState } from "react";
import { compLabel } from "../lib/tradingConsole";
import { Info, Panel } from "./console/primitives";
import { items as line, plain, warn } from "./console/summaries";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : null;
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const str = (v: unknown): string | null => (typeof v === "string" && v !== "" ? v : null);
const usdSigned = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${n >= 0 ? "+" : "−"}$${Math.abs(n).toFixed(2)}`;
};
const c2 = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}c`;
};
const NOT_SERVED = "not served yet";

function Cell({ k, v, sub, tone, inline }: { k: string; v: string; sub?: string; tone?: string; inline?: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low">
        {k}{sub && <Info label={k}>{sub}</Info>}
      </div>
      <p className={`tc-num mt-0.5 text-[16px] font-medium ${tone ?? "text-ink-hi"}`}>{v}</p>
      {inline && <p className="tc-num mt-0.5 text-[11.5px] text-ink-low">{inline}</p>}
    </div>
  );
}

const H3 = "mb-1.5 mt-4 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low";
const TH = "whitespace-nowrap border-b border-tc-line px-2 py-1.5 text-left text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low first:pl-0";
const TD = "whitespace-nowrap border-b border-tc-line px-2 py-1 first:pl-0";

export function TradingCareful({ d, token }: { d: Obj; token: string }) {
  const c = obj(d.careful);
  const [busy, setBusy] = useState<string | null>(null);
  const [said, setSaid] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, boolean>>({});

  async function toggle(comp: string, on: boolean) {
    setBusy(comp);
    setSaid(null);
    try {
      const r = await fetch("/api/ops/trading-careful", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ op: on ? "competition_on" : "competition_off",
          competition: comp }),
      });
      if (r.ok) {
        setLocal((m) => ({ ...m, [comp]: on }));
        setSaid(`${compLabel(comp)} ${on ? "back on" : "paper only"} — the next tick reads it`);
      } else {
        setSaid(`the switch was refused (HTTP ${r.status})`);
      }
    } catch {
      setSaid("the switch could not be sent");
    } finally {
      setBusy(null);
    }
  }

  const tick = obj(c?.tick);
  const comps = obj(c?.competitions) ?? {};
  const sits = obj(c?.situations) ?? {};
  const results = obj(c?.paper_results);
  const ladder = obj(c?.inplay_ladder);
  const gp = obj(c?.grounds_paper) ?? {};
  const gr = obj(c?.grounds_real) ?? {};
  const knobs = obj(c?.knobs);
  const events = Array.isArray(c?.events) ? (c?.events as unknown[]) : [];

  const de = num(tick?.data_errors) ?? 0;
  const disagree = Object.values(sits).filter((v) => obj(v)?.disagreement === true).length;
  const resultsDisagree = Object.values(results ?? {}).filter((v) => obj(v)?.disagreement === true).length;
  // (2026-10-07, #110) the probable data errors, split by phase when sent
  const split = tick && num(tick.data_errors_in_play) !== null
    ? `pre-match ${num(tick.data_errors_pre_match) ?? "—"} · in play ${num(tick.data_errors_in_play)}` : null;
  const summary = !c ? [plain(NOT_SERVED)] : typeof c.error === "string" ? [warn("block failed")] : line(
    plain(c.enabled === true ? "on" : "off"),
    tick ? plain(`${num(tick.funded) ?? "—"} / ${num(tick.qualifying) ?? "—"} funded`) : null,
    plain(`${Object.values(comps).filter((v) => obj(v)?.on === false).length} paper-only`),
    de > 0 ? warn(`${de} data errors${split ? ` (${split})` : ""}`, "data errors") : null,
    disagree > 0 ? warn(`${disagree} disagree`, "disagree") : null,
    resultsDisagree > 0 ? warn(`${resultsDisagree} results disagree`, "results disagree") : null,
  );
  return (
    <Panel testid="ops-careful" title="Careful strategy" cid="careful" summary={summary}
      info={<>Real money only on match winner, directly priced totals and
        both-teams-to-score; everything else is paper. A bet needs the bookmakers AND our model to clear the bar.</>}>
      <div>
        {!c ? (
          <p data-testid="careful-absent" className="text-[12px] text-ink-low">careful strategy: {NOT_SERVED}</p>
        ) : typeof c.error === "string" ? (
          <p data-testid="careful-absent" className="text-[12px] text-warn">◆ careful strategy: the block failed on the backend ({c.error})</p>
        ) : (
          <>
            <div data-testid="careful-tick" className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <Cell k="state" v={c.enabled === true ? "on" : "off"} sub={str(c.version) ?? undefined} />
              <Cell k="funded / qualifying"
                v={tick ? `${num(tick.funded) ?? "—"} / ${num(tick.qualifying) ?? "—"}` : NOT_SERVED}
                sub={tick ? `of ${num(tick.candidates) ?? "—"} candidates · ${num(tick.paper_rows) ?? "—"} paper rows` : undefined} />
              <Cell k="swaps" v={tick ? String(num(tick.swaps) ?? "—") : NOT_SERVED} />
              <Cell k="data errors" v={tick ? `${(num(tick.data_errors) ?? 0) > 0 ? "◆ " : ""}${num(tick.data_errors) ?? "—"}` : NOT_SERVED}
                tone={(num(tick?.data_errors) ?? 0) > 0 ? "text-warn" : "text-ink-hi"}
                inline={split ?? undefined}
                sub="Edges above the ceiling: probable data errors, never bet." />
            </div>

            <h3 className={H3}>competitions <Info label="the competition switches">Off = paper only.</Info></h3>
            <div data-testid="careful-competitions" className="flex flex-wrap gap-1.5">
              {Object.entries(comps).map(([k, v]) => {
                const on = local[k] ?? (obj(v)?.on !== false);
                return (
                  <button key={k} type="button" data-testid="careful-comp"
                    data-competition={k} data-on={on ? "true" : "false"} aria-pressed={on}
                    disabled={busy !== null || token === ""}
                    onClick={() => toggle(k, !on)}
                    className={`flex h-7 items-center gap-1.5 rounded-md border px-2 text-[12px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${on
                      ? "border-tc-line-strong text-ink-hi hover:bg-tc-hover" : "border-dashed border-tc-line-strong text-ink-low hover:bg-tc-hover"}`}>
                    <span aria-hidden className={`inline-block h-[7px] w-[7px] rounded-full ${on ? "bg-ink-hi" : "ring-1 ring-ink-faint"}`} />
                    {compLabel(k)} · {on ? "real" : "paper"}
                  </button>
                );
              })}
            </div>
            {said && <p data-testid="careful-said" role="status" className="mt-2 text-[12px] text-ink-mid">{said}</p>}

            <h3 className={H3}>paper vs real</h3>
            {Object.keys(sits).length === 0 ? (
              <p className="text-[12px] text-ink-low">no bet scored yet</p>
            ) : (
              <div className="tc-scroll overflow-x-auto">
                <table data-testid="careful-situations" className="w-full min-w-[620px] border-collapse text-[12.5px]">
                  <thead><tr>
                    {["situation", "paper n", "paper CLV−fee", "real n", "real CLV−fee", "real money", ""].map((h) => (
                      <th key={h} scope="col" className={TH}>{h}</th>))}
                  </tr></thead>
                  <tbody>
                    {Object.entries(sits).map(([k, v]) => {
                      const s = obj(v) ?? {};
                      return (
                        <tr key={k} data-testid="careful-situation" data-flag={s.disagreement === true ? "true" : "false"}>
                          <td className={`${TD} text-ink-hi`}>{k.replaceAll("|", " · ")}</td>
                          <td className={`${TD} tc-num`}>{num(s.paper_n) ?? "—"}</td>
                          <td className={`${TD} tc-num`}>{c2(s.paper_x_c)}</td>
                          <td className={`${TD} tc-num`}>{num(s.real_n) ?? "—"}</td>
                          <td className={`${TD} tc-num`}>{c2(s.real_x_c)}</td>
                          <td className={`${TD} tc-num`}>{c2(s.real_pnl_c)}</td>
                          <td className={`${TD} text-warn`} title={s.disagreement === true ? "CLV and money disagree" : undefined}>{s.disagreement === true ? "◆ disagree" : ""}</td>
                        </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className={H3}>paper results <Info label="the paper results">
              The paper bets&apos; would-be results beside their CLV, per competition × family × phase. Would-be: had
              the paper bet been placed, fee included; from the trader&apos;s own settlement reads, else Kalshi&apos;s
              public market record; never guessed. The learner still chooses on CLV.</Info></h3>
            {results === null ? (
              <p data-testid="careful-results-absent" className="text-[12px] text-ink-low">{NOT_SERVED}</p>
            ) : Object.keys(results).length === 0 ? (
              <p className="text-[12px] text-ink-low">no paper bet scored or settled yet</p>
            ) : (
              <div className="tc-scroll overflow-x-auto">
                <table data-testid="careful-results" className="w-full min-w-[640px] border-collapse text-[12.5px]">
                  <thead><tr>
                    {["situation", "paper n", "CLV−fee", "settled", "wins", "would-be / contract", "would-be at size", ""].map((h) => (
                      <th key={h} scope="col" className={TH}>{h}</th>))}
                  </tr></thead>
                  <tbody>
                    {Object.entries(results).map(([k, v]) => {
                      const r = obj(v) ?? {};
                      return (
                        <tr key={k} data-testid="careful-result" data-flag={r.disagreement === true ? "true" : "false"}>
                          <td className={`${TD} text-ink-hi`}>{k.replaceAll("|", " · ").replace("pre_match", "pre-match").replace("in_play", "in play")}</td>
                          <td className={`${TD} tc-num`}>{num(r.n) ?? "—"}</td>
                          <td className={`${TD} tc-num`}>{c2(r.clv_x_c)}</td>
                          <td className={`${TD} tc-num`}>{num(r.results_n) ?? "—"}</td>
                          <td className={`${TD} tc-num`}>{num(r.wins) ?? "—"}</td>
                          <td className={`${TD} tc-num`}>{c2(r.pnl_c_mean)}</td>
                          <td className={`${TD} tc-num`}>{num(r.sized_n) ? `${usdSigned(r.pnl_dollars)} (${num(r.sized_n)})` : "—"}</td>
                          <td className={`${TD} text-warn`} title={r.disagreement === true ? "CLV and results disagree" : undefined}>
                            {r.disagreement === true ? "◆ disagree" : ""}</td>
                        </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className={H3}>in-play ladder <Info label="the in-play ladder">
              The in-play three-point ladder: deep, fresh, spare — 0–1 paper, 2 $1, 3 $2. In play a score is out of 3;
              pre-match keeps its 5. The last day&apos;s in-play paper bets by score, tier and signal.</Info></h3>
            {ladder === null ? (
              <p data-testid="careful-ladder-absent" className="text-[12px] text-ink-low">{NOT_SERVED}</p>
            ) : (
              <div data-testid="careful-ladder" className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
                <Cell k="signals" v={Array.isArray(ladder.signals) ? (ladder.signals as string[]).join(" · ") : "—"}
                  sub={`deep ≥ ${num(ladder.deep_book) ?? "—"} a side · fresh ≤ ${num(ladder.fresh_s) ?? "—"} s · spare ${num(ladder.spare) !== null ? `${((num(ladder.spare) as number) * 100).toFixed(0)}c` : "—"}`} />
                <Cell k="tiers" v={Object.entries(obj(ladder.tiers) ?? {}).map(([k, v]) =>
                  `${k}: ${num(v) ? `$${num(v)}` : "paper"}`).join(" · ") || "—"}
                  sub={`score of ${num(ladder.score_of) ?? "—"}; pre-match keeps its 5`} />
                <Cell k={`paper, ${num(ladder.since_hours) ?? "—"} h`} v={String(num(ladder.paper_n) ?? "—")}
                  inline={Object.entries(obj(ladder.by_score) ?? {}).map(([k, v]) => `${k}/${num(ladder.score_of) ?? 3}: ${num(v) ?? 0}`).join(" · ") || "none"}
                  sub={`in-play paper bets in the last ${num(ladder.since_hours) ?? "—"} h, by score${obj(ladder.by_tier) ? ` · by tier ${Object.entries(obj(ladder.by_tier)!).map(([k, v]) => `${k}: ${num(v) ?? 0}`).join(" · ")}` : ""}`} />
                <Cell k="by signal" v={Object.entries(obj(ladder.by_signal) ?? {}).map(([k, v]) => `${k} ${num(v) ?? 0}`).join(" · ") || "none"} />
              </div>
            )}

            <h3 className={H3}>grounds <Info label="the grounds">Evidence so far. Mean CLV after the fee, with its match-clustered 95% range; a range that spans zero is not evidence either way.</Info></h3>
            <p className="text-[12px] text-ink-low">
              promoted: {Array.isArray(c.promoted) && c.promoted.length ? (c.promoted as string[]).join(", ") : "none"}
              {" · "}probation: {Array.isArray(c.probation) && c.probation.length ? (c.probation as string[]).join(", ") : "none"}
            </p>
            <ul data-testid="careful-grounds" className="mt-1.5 divide-y divide-tc-line text-[12.5px]">
              {[...Object.entries(gp).map(([g, v]) => [g, v, "paper"] as const),
                ...Object.entries(gr).map(([g, v]) => [g, v, "real"] as const)].map(([g, v, kind]) => {
                const s = obj(v) ?? {};
                return (
                  <li key={`${kind}:${g}`} className="flex flex-wrap justify-between gap-2 py-0.5">
                    <span className="text-ink-hi"><span className="font-mono text-[11.5px]">{g}</span> <span className="text-ink-low">({kind})</span></span>
                    <span className="tc-num text-ink-mid">
                      n {num(s.n) ?? "—"} · {num(s.matches) ?? "—"} matches · {c2(s.mean)}
                      {num(s.lo) !== null ? ` [${c2(s.lo)}, ${c2(s.hi)}]` : ""}
                    </span>
                  </li>);
              })}
            </ul>
            {events.length > 0 && (
              <>
                <h3 className={H3}>checks · proposals</h3>
                <ul data-testid="careful-events" className="space-y-1 text-[12px] text-ink-mid">
                  {events.slice(-8).map((e, i) => {
                    const o = obj(e) ?? {};
                    return (<li key={i}><span className="font-mono text-[11px] text-ink-low">{str(o.at)?.slice(0, 16) ?? ""}</span> · {str(o.reason)}
                      {o.ground ? ` · ${String(o.ground)}` : ""}{o.milestone ? ` @ ${String(o.milestone)}` : ""}
                      {o.proposed === true ? <span className="text-ink-hi" title="Son decides"> · PROPOSED</span> : ""}</li>);
                  })}
                </ul>
              </>
            )}
            {knobs && (
              <details className="mt-4">
                <summary className="cursor-pointer text-[11.5px] text-ink-low outline-none hover:text-ink-mid focus-visible:text-ink-hi">Knobs ({Object.keys(knobs).length})</summary>
                <dl className="mt-2 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(knobs).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-tc-line py-1 text-[11.5px]">
                      <dt className="font-mono text-ink-low">{k}</dt><dd className="tc-num text-ink-hi">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

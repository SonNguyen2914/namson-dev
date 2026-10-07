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

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : null;
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const str = (v: unknown): string | null => (typeof v === "string" && v !== "" ? v : null);
const c2 = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}c`;
};
const NOT_SERVED = "not served yet";

function Cell({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low">{k}</p>
      <p className={`tc-num mt-0.5 text-[16px] font-medium ${tone ?? "text-ink-hi"}`}>{v}</p>
      {sub && <p className="mt-0.5 text-[11.5px] text-ink-low">{sub}</p>}
    </div>
  );
}

const H3 = "mb-2 mt-5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low";
const TH = "border-b border-tc-line px-2 py-1.5 text-left text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low first:pl-0";
const TD = "border-b border-tc-line px-2 py-1.5 first:pl-0";

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
  const gp = obj(c?.grounds_paper) ?? {};
  const gr = obj(c?.grounds_real) ?? {};
  const knobs = obj(c?.knobs);
  const events = Array.isArray(c?.events) ? (c?.events as unknown[]) : [];

  return (
    <section data-testid="ops-careful" aria-labelledby="ops-careful-h"
      className="rounded-lg border border-tc-line bg-tc-panel">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-tc-line px-4 py-2.5">
        <h2 id="ops-careful-h" className="text-[13px] font-semibold text-ink-hi">Careful strategy</h2>
        <span className="text-[11.5px] text-ink-low">
          Experimental, unproven. Real money only on match winner, directly priced totals and
          both-teams-to-score; everything else is paper. A bet needs the bookmakers AND our model to clear the bar.
        </span>
      </header>
      <div className="px-4 py-3">
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
              <Cell k="edges above the ceiling" v={tick ? String(num(tick.data_errors) ?? "—") : NOT_SERVED}
                tone={(num(tick?.data_errors) ?? 0) > 0 ? "text-warn" : "text-ink-hi"}
                sub="probable data errors, never bet" />
            </div>

            <h3 className={H3}>competitions (off = paper only)</h3>
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

            <h3 className={H3}>paper vs real, per situation</h3>
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
                          <td className={`${TD} text-warn`}>{s.disagreement === true ? "◆ CLV and money disagree" : ""}</td>
                        </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className={H3}>grounds — evidence so far</h3>
            <p className="text-[12px] text-ink-low">
              promoted: {Array.isArray(c.promoted) && c.promoted.length ? (c.promoted as string[]).join(", ") : "none"}
              {" · "}probation: {Array.isArray(c.probation) && c.probation.length ? (c.probation as string[]).join(", ") : "none"}
            </p>
            <ul data-testid="careful-grounds" className="mt-1.5 divide-y divide-tc-line text-[12.5px]">
              {[...Object.entries(gp).map(([g, v]) => [g, v, "paper"] as const),
                ...Object.entries(gr).map(([g, v]) => [g, v, "real"] as const)].map(([g, v, kind]) => {
                const s = obj(v) ?? {};
                return (
                  <li key={`${kind}:${g}`} className="flex flex-wrap justify-between gap-2 py-1">
                    <span className="text-ink-hi"><span className="font-mono text-[11.5px]">{g}</span> <span className="text-ink-low">({kind})</span></span>
                    <span className="tc-num text-ink-mid">
                      n {num(s.n) ?? "—"} · {num(s.matches) ?? "—"} matches · {c2(s.mean)}
                      {num(s.lo) !== null ? ` [${c2(s.lo)}, ${c2(s.hi)}]` : ""}
                    </span>
                  </li>);
              })}
            </ul>
            <p className="mt-1 text-[11px] text-ink-faint">Mean CLV after the fee, with its match-clustered 95% range; a range that spans zero is not evidence either way.</p>
            {events.length > 0 && (
              <>
                <h3 className={H3}>checks and proposals (section 4)</h3>
                <ul data-testid="careful-events" className="space-y-1 text-[12px] text-ink-mid">
                  {events.slice(-8).map((e, i) => {
                    const o = obj(e) ?? {};
                    return (<li key={i}><span className="font-mono text-[11px] text-ink-low">{str(o.at)?.slice(0, 16) ?? ""}</span> · {str(o.reason)}
                      {o.ground ? ` · ${String(o.ground)}` : ""}{o.milestone ? ` @ ${String(o.milestone)}` : ""}
                      {o.proposed === true ? <span className="text-ink-hi"> · PROPOSED (Son decides)</span> : ""}</li>);
                  })}
                </ul>
              </>
            )}
            {knobs && (
              <details className="mt-4">
                <summary className="cursor-pointer text-[11.5px] text-ink-low outline-none hover:text-ink-mid focus-visible:text-ink-hi">Knobs in force ({Object.keys(knobs).length})</summary>
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
    </section>
  );
}

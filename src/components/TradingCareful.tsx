// THE CAREFUL STRATEGY on the console (2026-10-06, Son's decisions;
// backend src/trading/careful.py, docs/TRADING-AGENT.md §38).
// EXPERIMENTAL, UNPROVEN.
//
// Reads the status route's `daily_budget` and `careful` blocks — never a
// provider, never a per-market result — and draws:
//   * the daily budget: used / remaining / limit, its parts (realised NET,
//     open positions, resting orders) and the trading day and its zone;
//   * per-kickoff-hour usage against the $12 cap, and the newest tick's
//     funded / qualifying / swaps / probable data errors (edges above 8c);
//   * the eleven competitions with Son's on/off switch (POST
//     /api/ops/trading-careful): off = paper only;
//   * paper vs real per situation (competition × family × time bucket),
//     a disagreement (CLV good, money losing) flagged;
//   * the grounds' paper and real evidence (n, matches, mean CLV after the
//     fee and its match-clustered 95% range), promoted and probation
//     grounds, and the section-4 events.
// A block the backend does not send reads "not served yet", never 0.
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
const usd = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${n < 0 ? "−" : ""}$${Math.abs(n).toFixed(2)}`;
};
const c2 = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}c`;
};
const NOT_SERVED = "not served yet";

function Cell({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-bs px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{k}</p>
      <p className={`mt-0.5 break-words font-mono text-sm tabular-nums ${tone ?? "text-ink-hi"}`}>{v}</p>
      {sub && <p className="mt-0.5 break-words font-mono text-[10px] text-ink-faint">{sub}</p>}
    </div>
  );
}

const H3 = "mb-1.5 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low";
const TH = "border-b border-line px-2 py-1 text-left font-normal text-ink-faint";
const TD = "border-b border-line/50 px-2 py-1";

export function TradingCareful({ d, token }: { d: Obj; token: string }) {
  const b = obj(d.daily_budget);
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
  const usage = obj(tick?.usage);
  const hours = obj(usage?.hour) ?? {};
  const comps = obj(c?.competitions) ?? {};
  const sits = obj(c?.situations) ?? {};
  const gp = obj(c?.grounds_paper) ?? {};
  const gr = obj(c?.grounds_real) ?? {};
  const events = Array.isArray(c?.events) ? (c?.events as unknown[]) : [];

  return (
    <section data-testid="ops-careful" aria-labelledby="ops-careful-h"
      className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <h2 id="ops-careful-h"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        Careful strategy
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-faint">
        Experimental, unproven. Real money only on match winner, directly
        priced totals and both-teams-to-score; everything else is paper.
        A bet needs the bookmakers AND our model to clear the bar.
      </p>

      <h3 className={H3}>daily budget</h3>
      {!b || b.used === undefined ? (
        <p data-testid="careful-budget-absent" className="font-mono text-[11px] text-ink-faint">{NOT_SERVED}</p>
      ) : (
        <div data-testid="careful-budget" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Cell k="used" v={`${usd(b.used)} / ${usd(b.limit)}`} />
          <Cell k="remaining" v={usd(b.remaining)}
            tone={(num(b.remaining) ?? 0) <= 0 ? "text-warn" : "text-ink-hi"} />
          <Cell k="parts" v={`${usd(b.realised)} · ${usd(b.open_positions)} · ${usd(b.resting_orders)}`}
            sub="realised (net; a win adds room) · open · resting" />
          <Cell k="trading day" v={str(b.trading_day) ?? "—"} sub={str(b.trading_day_tz) ?? undefined} />
        </div>
      )}

      {!c ? (
        <p data-testid="careful-absent" className="mt-3 font-mono text-[11px] text-ink-faint">
          careful strategy: {NOT_SERVED}
        </p>
      ) : (
        <>
          <h3 className={H3}>newest tick</h3>
          <div data-testid="careful-tick" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Cell k="state" v={c.enabled === true ? "on" : "off"}
              tone={c.enabled === true ? "text-up" : "text-ink-mid"} />
            <Cell k="funded / qualifying"
              v={tick ? `${num(tick.funded) ?? "—"} / ${num(tick.qualifying) ?? "—"}` : NOT_SERVED} />
            <Cell k="swaps" v={tick ? String(num(tick.swaps) ?? "—") : NOT_SERVED} />
            <Cell k="edges above 8c" v={tick ? String(num(tick.data_errors) ?? "—") : NOT_SERVED}
              tone={(num(tick?.data_errors) ?? 0) > 0 ? "text-warn" : "text-ink-hi"}
              sub="probable data errors, never bet" />
          </div>

          <h3 className={H3}>per kickoff hour (cap {usd(usage?.hour_max)})</h3>
          {Object.keys(hours).length === 0 ? (
            <p className="font-mono text-[11px] text-ink-faint">nothing at risk in any kickoff hour</p>
          ) : (
            <ul data-testid="careful-hours" className="space-y-1 font-mono text-[11px]">
              {Object.entries(hours).map(([h, v]) => (
                <li key={h} className="flex justify-between gap-2">
                  <span className="text-ink-mid">{new Date(h).toLocaleString()}</span>
                  <span className="tabular-nums text-ink-hi">{usd(v)} / {usd(usage?.hour_max)}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className={H3}>competitions (off = paper only)</h3>
          <div data-testid="careful-competitions" className="flex flex-wrap gap-2">
            {Object.entries(comps).map(([k, v]) => {
              const on = local[k] ?? (obj(v)?.on !== false);
              return (
                <button key={k} type="button" data-testid="careful-comp"
                  data-competition={k} data-on={on ? "true" : "false"}
                  disabled={busy !== null || token === ""}
                  onClick={() => toggle(k, !on)}
                  className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-colors ${on
                    ? "border-up/50 text-up" : "border-line text-ink-faint"} disabled:opacity-50`}>
                  {compLabel(k)} · {on ? "on" : "paper"}
                </button>
              );
            })}
          </div>
          {said && <p data-testid="careful-said" role="status" className="mt-2 font-mono text-[11px] text-ink-mid">{said}</p>}

          <h3 className={H3}>paper vs real, per situation</h3>
          {Object.keys(sits).length === 0 ? (
            <p className="font-mono text-[11px] text-ink-faint">no bet scored yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table data-testid="careful-situations" className="w-full min-w-[560px] border-collapse font-mono text-xs tabular-nums">
                <thead><tr>
                  {["situation", "paper n", "paper CLV−fee", "real n", "real CLV−fee", "real money", ""].map((h) => (
                    <th key={h} scope="col" className={TH}>{h}</th>))}
                </tr></thead>
                <tbody>
                  {Object.entries(sits).map(([k, v]) => {
                    const s = obj(v) ?? {};
                    return (
                      <tr key={k} data-testid="careful-situation" data-flag={s.disagreement === true ? "true" : "false"}>
                        <td className={TD}>{k.replaceAll("|", " · ")}</td>
                        <td className={TD}>{num(s.paper_n) ?? "—"}</td>
                        <td className={TD}>{c2(s.paper_x_c)}</td>
                        <td className={TD}>{num(s.real_n) ?? "—"}</td>
                        <td className={TD}>{c2(s.real_x_c)}</td>
                        <td className={TD}>{c2(s.real_pnl_c)}</td>
                        <td className={`${TD} text-warn`}>{s.disagreement === true ? "CLV and money disagree" : ""}</td>
                      </tr>);
                  })}
                </tbody>
              </table>
            </div>
          )}

          <h3 className={H3}>grounds</h3>
          <p className="font-mono text-[11px] text-ink-faint">
            promoted: {Array.isArray(c.promoted) && c.promoted.length ? (c.promoted as string[]).join(", ") : "none"}
            {" · "}probation: {Array.isArray(c.probation) && c.probation.length ? (c.probation as string[]).join(", ") : "none"}
          </p>
          <ul data-testid="careful-grounds" className="mt-1 space-y-1 font-mono text-[11px]">
            {[...Object.entries(gp).map(([g, v]) => [g, v, "paper"] as const),
              ...Object.entries(gr).map(([g, v]) => [g, v, "real"] as const)].map(([g, v, kind]) => {
              const s = obj(v) ?? {};
              return (
                <li key={`${kind}:${g}`} className="flex flex-wrap justify-between gap-2">
                  <span className="text-ink-mid">{g} <span className="text-ink-faint">({kind})</span></span>
                  <span className="tabular-nums text-ink-hi">
                    n {num(s.n) ?? "—"} · {num(s.matches) ?? "—"} matches · {c2(s.mean)}
                    {num(s.lo) !== null ? ` [${c2(s.lo)}, ${c2(s.hi)}]` : ""}
                  </span>
                </li>);
            })}
          </ul>
          {events.length > 0 && (
            <>
              <h3 className={H3}>checks and proposals</h3>
              <ul data-testid="careful-events" className="space-y-1 font-mono text-[11px] text-ink-mid">
                {events.slice(-8).map((e, i) => {
                  const o = obj(e) ?? {};
                  return (<li key={i}>{str(o.at)?.slice(0, 16) ?? ""} · {str(o.reason)}
                    {o.ground ? ` · ${String(o.ground)}` : ""}{o.milestone ? ` @ ${String(o.milestone)}` : ""}
                    {o.proposed === true ? " · PROPOSED (Son decides)" : ""}</li>);
                })}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

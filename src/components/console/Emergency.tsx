// KILL AND HALT — THE OPERATOR'S EMERGENCY BUTTONS (Son, 2026-10-07; this
// overrides the redesign's "no new kill button" default).
//
//   KILL  "stop everything": the backend journals an operator kill; its
//         tick cancels every resting agent order and places nothing.
//         POST /api/ops/trading-kill {minutes} → /api/admin/trading/kill
//   HALT  "stop buying, keep protecting": no new buys, resting buys
//         cancelled, positions held, protective sells continue.
//         POST /api/ops/trading-halt {minutes} → /api/admin/trading/halt
//
// Neither can lift or override TRADING_KILL on Railway, and no word here
// says "resume". The kill's lift stays the one "Lift operator kill"
// (TradingKillLift); the halt gets its own lift, shown while one holds.
//
// TWO PRESSES, IN THE PAGE (never window.confirm): the first press arms the
// button — "Confirm KILL · 5" counting down — and a second press within
// five seconds sends; otherwise it disarms. The duration is chosen first:
// one hour, until the end of the trading day (from the status route's
// `trading_day.ends_at`, America/Los_Angeles), or 24 hours.
//
// NEVER A SILENT NO-OP: every answer is said — the backend's "until", a
// refusal, a missing token, a timeout — and a backend without the halt
// route (no `operator_halt` in its status, or a 404 on the POST) shows
// HALT disabled, "not on this backend yet".
import { useEffect, useState } from "react";
import { isObj } from "../../lib/tradingConsole";
import { Info, when } from "./primitives";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);
export type Action = "kill" | "halt";
type Dur = "hour" | "today" | "day";
export interface Outcome { ok: boolean; text: string }
/** the answer and the "no halt here" finding, held ABOVE the controls: the
 *  controls move between the Safety panel and the rail's menu as the
 *  status changes, and the answer must not vanish with the move */
export interface EmergencyMemory {
  said: Outcome | null; setSaid: (o: Outcome | null) => void;
  haltMissing: boolean; setHaltMissing: (b: boolean) => void;
}

const ARM_MS = 5_000;

/** minutes until the trading day ends, 1..1440; null when not sent */
export function minutesToDayEnd(d: Obj, now: number): number | null {
  const ends = Date.parse(String(obj(d.trading_day)?.ends_at ?? ""));
  if (!Number.isFinite(ends)) return null;
  return Math.min(1440, Math.max(1, Math.ceil((ends - now) / 60_000)));
}

/** the operator halt the status route reports, if any */
export function operatorHalt(d: Obj, now: number): { served: boolean; active: boolean; until: string | null } {
  if (!("operator_halt" in d)) return { served: false, active: false, until: null };
  const h = obj(d.operator_halt);
  const until = typeof h?.until === "string" && h.until !== "" ? h.until : null;
  const t = until ? Date.parse(until) : NaN;
  const active = h?.active === true || (Number.isFinite(t) && t > now);
  return { served: true, active, until };
}

/** what an answer says, in plain words. Exported for tests. */
export function describeEmergency(action: Action, status: number, body: unknown): Outcome & { missing?: boolean } {
  const b = obj(body) ?? {};
  const NAME = action === "kill" ? "KILL" : "HALT";
  if (status >= 200 && status < 300) {
    const until = [b.until, b.kill_until, b.halt_until, obj(b.operator_halt)?.until]
      .find((x): x is string => typeof x === "string" && x !== "") ?? null;
    return { ok: true, text: until ? `${NAME} set — until ${when(until, true)}.`
      : `${NAME} sent (HTTP ${status}); the backend named no end time — the status is read again.` };
  }
  if (status === 404 && b.available === false) {
    return { ok: false, missing: true, text: `${NAME} is not on this backend yet — nothing was set.` };
  }
  if (status === 401) return { ok: false, text: `${NAME} not sent: no operator token.` };
  if (status === 403) return { ok: false, text: `${NAME} refused: token rejected.` };
  if (status === 504) {
    return { ok: false, text: `${NAME}: no answer in time — the status is read again to show whether it went through.` };
  }
  const detail = typeof b.detail === "string" ? ` — ${b.detail}` : "";
  return { ok: false, text: `${NAME} failed: HTTP ${status}${detail}.` };
}

const RED = "rounded-md border px-3 py-1 text-[12.5px] font-semibold tracking-[0.04em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

function EmergencyButton({ action, minutes, token, onDone, disabledWhy, testid }: {
  action: Action; minutes: number | null; token: string; onDone: (o: Outcome & { missing?: boolean }) => void;
  disabledWhy: string | null; testid: string;
}) {
  const NAME = action === "kill" ? "KILL" : "HALT";
  const [armedAt, setArmedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (armedAt === null) return;
    const t = setInterval(() => {
      const n = Date.now();
      if (n - armedAt >= ARM_MS) setArmedAt(null); else setNow(n);
    }, 200);
    return () => clearInterval(t);
  }, [armedAt]);
  const left = armedAt === null ? 0 : Math.max(1, Math.ceil((ARM_MS - ((now || armedAt) - armedAt)) / 1000));
  const send = async () => {
    setBusy(true);
    let o: Outcome & { missing?: boolean };
    try {
      const r = await fetch(`/api/ops/trading-${action}`, {
        method: "POST", cache: "no-store",
        headers: { "x-admin-token": token, "content-type": "application/json" },
        body: JSON.stringify({ minutes }),
      });
      let body: unknown = null;
      try { body = await r.json(); } catch {
        /* SWALLOWED(emergency:post-body-parse) — registered in
           e2e/missing-is-not-zero.spec.ts with its closes_when. */
      }
      o = describeEmergency(action, r.status, body);
    } catch {
      /* SWALLOWED(emergency:post-no-answer) — registered in
         e2e/missing-is-not-zero.spec.ts with its closes_when. */
      o = { ok: false, text: `${NAME}: no answer came back — the status is read again to show whether it went through.` };
    }
    setBusy(false);
    setArmedAt(null);
    onDone(o);
  };
  const press = () => {
    if (busy || disabledWhy || minutes === null) return;
    if (armedAt === null) { const n = Date.now(); setArmedAt(n); setNow(n); return; }
    void send();
  };
  const armed = armedAt !== null;
  return (
    <button type="button" data-testid={testid} data-armed={armed || undefined}
      disabled={busy || !!disabledWhy || minutes === null} onClick={press}
      aria-describedby={`${testid}-what`}
      className={`${RED} ${armed ? "border-neg bg-neg text-white hover:bg-neg/90" : "border-neg/70 bg-neg/10 text-neg hover:bg-neg/20"}`}>
      {busy ? `Sending ${NAME}…` : armed ? `Confirm ${NAME} · ${left}` : NAME}
    </button>
  );
}

/** the halt's lift: inline Confirm / Cancel, like the kill's */
function HaltLift({ token, onDone }: { token: string; onDone: (o: Outcome) => void }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const lift = async () => {
    setBusy(true);
    let o: Outcome;
    try {
      const r = await fetch("/api/ops/trading-halt-lift", { method: "POST", cache: "no-store",
        headers: { "x-admin-token": token } });
      let body: unknown = null;
      try { body = await r.json(); } catch {
        /* SWALLOWED(emergency:lift-body-parse) — registered in
           e2e/missing-is-not-zero.spec.ts with its closes_when. */
      }
      const b = obj(body) ?? {};
      o = r.ok ? { ok: true, text: b.lifted === false ? "Nothing to lift — no operator halt was in force."
          : "Operator halt lifted. Buying is allowed again only where nothing else holds it (the kill, a loss halt, TRADING_KILL)." }
        : r.status === 404 && b.available === false ? { ok: false, text: "Lifting the halt is not on this backend yet." }
          : describeEmergency("halt", r.status, body);
    } catch {
      /* SWALLOWED(emergency:lift-no-answer) — registered in
         e2e/missing-is-not-zero.spec.ts with its closes_when. */
      o = { ok: false, text: "Halt lift: no answer came back — the status is read again." };
    }
    setBusy(false);
    setAsking(false);
    onDone(o);
  };
  return !asking ? (
    <button type="button" data-testid="halt-lift" onClick={() => setAsking(true)}
      className="rounded-md border border-warn/60 px-2.5 py-1 text-[12.5px] text-warn outline-none hover:bg-warn/10 focus-visible:ring-2 focus-visible:ring-accent">
      Lift operator halt
    </button>
  ) : (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-[12.5px] text-ink-hi">Lift the operator halt?</span>
      <button type="button" data-testid="halt-lift-confirm" disabled={busy} onClick={() => void lift()}
        className="rounded-md border border-warn/60 bg-warn/10 px-2.5 py-1 text-[12.5px] font-medium text-warn outline-none hover:bg-warn/20 focus-visible:ring-2 focus-visible:ring-accent">
        {busy ? "Sending…" : "Confirm lift"}
      </button>
      <button type="button" disabled={busy} onClick={() => setAsking(false)}
        className="rounded-md border border-tc-line-strong px-2.5 py-1 text-[12.5px] text-ink-mid outline-none hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent">
        Cancel
      </button>
    </span>
  );
}

/** KILL and HALT with their duration, their answers and the halt's lift */
export function EmergencyControls({ d, token, onDone, now, memory }: {
  d: Obj; token: string; onDone: () => void; now: number; memory: EmergencyMemory;
}) {
  const [dur, setDur] = useState<Dur>("hour");
  const { said, setSaid, haltMissing, setHaltMissing } = memory;
  const today = minutesToDayEnd(d, now);
  const minutes = dur === "hour" ? 60 : dur === "day" ? 1440 : today;
  const halt = operatorHalt(d, now);
  const haltWhy = !halt.served || haltMissing ? "not on this backend yet" : null;
  const tokenWhy = token.trim() === "" ? "no operator token" : null;
  const done = (o: Outcome & { missing?: boolean }, action: Action) => {
    if (o.missing && action === "halt") setHaltMissing(true);
    setSaid(o);
    onDone();
  };
  const opts: [Dur, string, boolean][] = [
    ["hour", "1 hour", true],
    ["today", today === null ? "until end of today (day not sent)" : `until end of today (${Math.floor(today / 60)}h ${today % 60}m)`, today !== null],
    ["day", "24 hours", true],
  ];
  return (
    <div data-testid="emergency" className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low">
          Emergency
          <Info label="the emergency buttons" testid="emergency-info">
            <span id="emergency-kill-what" className="block"><b className="text-ink-hi">KILL — stop everything.</b> Cancels every resting agent order and places nothing until it ends or is lifted.</span>
            <span id="emergency-halt-what" className="mt-1 block"><b className="text-ink-hi">HALT — stop buying, keep protecting.</b> No new buys, resting buys cancelled, positions held, protective sells continue.</span>
            <span className="mt-1 block">Press once to arm, again within 5 s to send. Neither can lift or override TRADING_KILL on Railway.</span>
          </Info>
        </span>
        <fieldset className="flex flex-wrap items-center gap-1" aria-label="how long">
          {opts.map(([k, label, ok]) => (
            // THE LABEL IS THE TARGET (the touch floor reads a 13 px native radio
            // as too small): the radio is visually hidden, still focused and
            // read; the label wears the choice and the focus ring
            <label key={k} data-testid={`emergency-dur-${k}`} data-checked={dur === k || undefined}
              className={`relative flex cursor-pointer items-center rounded-md border px-2 py-0.5 text-[11.5px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
              dur === k ? "border-accent/60 text-ink-hi" : "border-tc-line text-ink-mid"} ${ok ? "" : "cursor-not-allowed opacity-40"}`}>
              <input type="radio" name="emergency-duration" value={k}
                checked={dur === k} disabled={!ok} onChange={() => setDur(k)}
                className="pointer-events-none absolute h-px w-px opacity-0" />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5">
          <EmergencyButton action="kill" minutes={minutes} token={token} testid="emergency-kill"
            disabledWhy={tokenWhy} onDone={(o) => done(o, "kill")} />
          <span className="text-[11.5px] text-ink-low">stop everything</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <EmergencyButton action="halt" minutes={minutes} token={token} testid="emergency-halt"
            disabledWhy={haltWhy ?? tokenWhy} onDone={(o) => done(o, "halt")} />
          <span data-testid="emergency-halt-note" className={`text-[11.5px] ${haltWhy ? "text-warn" : "text-ink-low"}`}>
            {haltWhy ? `◆ HALT ${haltWhy}` : "stop buying, keep protecting"}
          </span>
        </span>
        {tokenWhy && <span className="text-[11.5px] text-warn">◆ {tokenWhy}</span>}
      </div>
      {halt.active && (
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span data-testid="emergency-halt-active" className="text-neg">■ HALT ACTIVE{halt.until ? ` · until ${when(halt.until, true)}` : ""}</span>
          <HaltLift token={token} onDone={(o) => { setSaid(o); onDone(); }} />
        </div>
      )}
      {said && (
        <p data-testid="emergency-result" data-ok={said.ok ? "true" : "false"} role={said.ok ? "status" : "alert"}
          className={`rounded-md border px-3 py-1.5 text-[12.5px] leading-snug ${said.ok ? "border-tc-line-strong text-ink-hi" : "border-warn/40 text-warn"}`}>
          {said.text}
        </p>
      )}
    </div>
  );
}

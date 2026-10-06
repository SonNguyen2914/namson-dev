// LIFT KILL, BESIDE THE KILL SWITCH (2026-10-06).
//
// The backend journals an operator kill until a bounded time (POST
// /api/admin/trading/kill); this lifts it early through
// /api/ops/trading-kill-lift, which answers `{lifted, kill_until}`.
// `kill_until` non-null means a kill is still in force after the lift —
// TRADING_KILL on the Railway service (or its five-minute echo across
// containers), which nothing on this page can lift.
//
// CONFIRMATION IS INLINE (Confirm / Cancel), never window.confirm. The
// answer is said in plain words; `onDone` asks the page to read the
// status again at once.
import { useState } from "react";

type Obj = Record<string, unknown>;
interface Outcome { ok: boolean; text: string }

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function when(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const STILL = "TRADING_KILL on Railway (or its echo, up to 5 minutes after "
  + "it is unset) cannot be lifted here — only unsetting it on the backend "
  + "service does.";

/** What the backend's answer says, in plain words. Exported for tests. */
export function describeLift(status: number, body: unknown): Outcome {
  const b = isObj(body) ? body : {};
  const until = typeof b.kill_until === "string" && b.kill_until !== ""
    ? b.kill_until : null;
  if (status >= 200 && status < 300 && typeof b.lifted === "boolean") {
    if (until) {
      return { ok: false, text: `${b.lifted ? "Operator kill lifted, but a"
        : "Nothing lifted: a"} kill is still in force until ${when(until)}. `
        + STILL };
    }
    return b.lifted
      ? { ok: true, text: "Kill lifted — nothing holds the trader now; its "
          + "next tick may place." }
      : { ok: true, text: "Nothing to lift — no operator kill was in force." };
  }
  const code = typeof b.error === "string" ? b.error : null;
  const detail = typeof b.detail === "string" ? b.detail : null;
  let why: string;
  if (status === 403) why = "token rejected";
  else if (status === 404 || b.available === false) {
    why = "lifting the kill is not available on this backend yet";
  } else if (status === 504) {
    why = "no answer in time — the status above is read again to show "
      + "whether it went through";
  } else {
    why = `HTTP ${status}${code ? ` · ${code}` : ""}${detail ? ` — ${detail}` : ""}`;
  }
  return { ok: false, text: `Lift failed: ${why}.` };
}

const BTN = "whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors disabled:opacity-40";

export function TradingKillLift({ token, onDone }: {
  token: string; onDone: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const lift = async () => {
    setBusy(true);
    let o: Outcome;
    try {
      const r = await fetch("/api/ops/trading-kill-lift", {
        method: "POST", cache: "no-store",
        headers: { "x-admin-token": token },
      });
      let body: unknown = null;
      try { body = await r.json(); } catch {
        /* SWALLOWED(killlift:post-body-parse) — registered in
           e2e/missing-is-not-zero.spec.ts with its closes_when. */
      }
      o = describeLift(r.status, body);
    } catch {
      /* SWALLOWED(killlift:post-no-answer) — registered in
         e2e/missing-is-not-zero.spec.ts with its closes_when. */
      o = { ok: false, text: "Lift failed: no answer came back — the status "
        + "above is read again to show whether it went through." };
    }
    setBusy(false);
    setAsking(false);
    setOutcome(o);
    onDone();
  };

  return (
    <div data-testid="kill-lift" className="mt-3 text-[12px] text-ink-mid">
      <div className="flex flex-wrap items-center gap-2">
        {!asking ? (
          <button type="button" disabled={busy}
            onClick={() => { setOutcome(null); setAsking(true); }}
            className={`${BTN} border-warn/50 text-warn hover:bg-warn/10`}>
            Lift kill
          </button>
        ) : (
          <>
            <span className="text-[11px] text-ink-hi">
              Lift the operator kill? The trader may place again on its next tick.
            </span>
            <button type="button" data-testid="kill-lift-confirm" disabled={busy}
              onClick={() => void lift()}
              className={`${BTN} border-warn/60 text-warn hover:bg-warn/10`}>
              {busy ? "Sending…" : "Confirm"}
            </button>
            <button type="button" data-testid="kill-lift-cancel" disabled={busy}
              onClick={() => setAsking(false)}
              className={`${BTN} border-line text-ink-mid hover:bg-elev2`}>
              Cancel
            </button>
          </>
        )}
      </div>
      {outcome && (
        <p data-testid="kill-lift-result" data-ok={outcome.ok ? "true" : "false"}
          role={outcome.ok ? "status" : "alert"}
          className={`mt-2 rounded-xl border px-3 py-2 font-mono text-[12px] ${
            outcome.ok ? "border-line-strong text-ink-hi" : "border-warn/40 text-warn"}`}>
          {outcome.text}
        </p>
      )}
      <p className="mt-1 text-[11px] text-ink-faint">
        Lifts a kill set through the backend&apos;s kill route only. It cannot
        lift TRADING_KILL set on the Railway backend service — while that is
        set, nothing is placed whatever this says.
      </p>
    </div>
  );
}

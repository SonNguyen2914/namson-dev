// Is the Analyst switched on? Read from /api/analyst/status (ANALYST_ENABLED
// on the server — the kill switch) and shared by every Analyst surface on
// the page. "unknown" while in flight; anything but a clean `enabled: true`
// reads as "off", so a failed status read hides the Analyst rather than
// drawing a broken one.
//
// A FAILED READ IS NOT AN ANSWER (review finding 8, 2026-10-25). The first
// read used to be kept for the whole session, so one 503 or dropped
// request hid VAR on every page until a full reload. Now only a clean
// answer is kept: a failure is forgotten, the next surface to mount asks
// again, and a mounted surface retries a few times on a widening delay.
import { useEffect, useState } from "react";

export type AnalystStatus = "unknown" | "on" | "off";
type Read = "on" | "off" | "failed";

/** The delays before each retry of a FAILED read, per mounted surface. */
export const STATUS_RETRY_MS = [3_000, 10_000, 30_000] as const;

let once: Promise<Read> | null = null;

function readStatus(): Promise<Read> {
  once ??= fetch("/api/analyst/status")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))))
    .then((d): Read => (d && d.enabled === true ? "on" : "off"))
    // a status that did not answer reads off for now, and is asked again
    .catch((): Read => { once = null; return "failed"; });
  return once;
}

export function useAnalystStatus(): AnalystStatus {
  const [s, setS] = useState<AnalystStatus>("unknown");
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = (attempt: number) => {
      void readStatus().then((v) => {
        if (!live) return;
        if (v !== "failed") { setS(v); return; }
        setS("off");
        if (attempt < STATUS_RETRY_MS.length) {
          timer = setTimeout(() => ask(attempt + 1), STATUS_RETRY_MS[attempt]);
        }
      });
    };
    ask(0);
    return () => { live = false; if (timer) clearTimeout(timer); };
  }, []);
  return s;
}

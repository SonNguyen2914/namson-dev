// Is the Analyst switched on? Read once per page view from
// /api/analyst/status (ANALYST_ENABLED on the server — the kill switch) and
// shared by every Analyst surface on the page. "unknown" while in flight;
// anything but a clean `enabled: true` reads as "off", so a failed status
// read hides the Analyst rather than drawing a broken one.
import { useEffect, useState } from "react";

export type AnalystStatus = "unknown" | "on" | "off";

let once: Promise<AnalystStatus> | null = null;

function readStatus(): Promise<AnalystStatus> {
  once ??= fetch("/api/analyst/status")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && d.enabled === true ? "on" as const : "off" as const))
    // a status that did not answer is the switch reading off, by design
    .catch(() => "off" as const);
  return once;
}

export function useAnalystStatus(): AnalystStatus {
  const [s, setS] = useState<AnalystStatus>("unknown");
  useEffect(() => {
    let live = true;
    readStatus().then((v) => { if (live) setS(v); });
    return () => { live = false; };
  }, []);
  return s;
}

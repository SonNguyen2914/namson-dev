// ONE POLLER FOR EVERY SURFACE THAT REFRESHES ON A CLOCK (2026-09-25).
//
// WHY. The production backend hung twice on 2026-09-25 — worker-pool
// starvation during a provider rate-limit storm — and the frontend's own
// pollers were built to make a stall worse. Eighteen `setInterval` loops
// across the dashboards, the match hubs, the comp viewer and the WC26
// archive shared four properties (audit F5):
//
//   1. none paused in a hidden tab, so a forgotten tab polled for ever;
//   2. none but one guarded against a request still in flight, so a
//      backend that stopped answering got a NEW request every period on
//      top of every one it had not answered yet;
//   3. none backed off after a failure — a 503 was retried at full
//      cadence by every open tab at once;
//   4. none could stop — a finished match or an archived tournament kept
//      asking about something that can no longer change.
//
// WHAT THIS DOES INSTEAD.
//
//   * The first read runs on mount. After that the next read is SCHEDULED
//     only when the previous one has settled (a `setTimeout` chain, not an
//     interval), so two reads of one poller can never overlap.
//   * A read that falls due while `document.hidden` is not made. It is
//     made the moment the tab is visible again, and the chain resumes
//     from there.
//   * After a failure the next read comes at the normal cadence; after
//     consecutive failures the delay doubles per failure, with jitter (so
//     a hundred tabs that failed together do not retry together), capped
//     at MAX_BACKOFF_MS. One success resets it.
//   * The task can answer "stop" — a finished match, a final bracket, a
//     definitive 404 — and the poller stops for the life of the mount.
//
// The task receives an AbortSignal that fires on unmount or when the
// dependencies change, so a read that outlives its page does not land.

import { useEffect, useRef } from "react";

/** What one read concluded. `void` counts as "ok" so a task that simply
 *  sets state need not say so. A thrown error counts as "failed". */
export type PollOutcome = "ok" | "failed" | "stop" | void;

/** The ceiling on the delay after repeated failures. */
export const MAX_BACKOFF_MS = 5 * 60_000;

/** The delay before the next read, given how many reads in a row failed.
 *  Exported so the rule is testable without a browser. `rand` is
 *  injectable for the same reason. */
export function nextDelay(
  intervalMs: number, failures: number, rand: () => number = Math.random,
): number {
  if (failures <= 1) return intervalMs;
  const base = Math.min(MAX_BACKOFF_MS, intervalMs * 2 ** (failures - 1));
  // "equal jitter": half the base, plus a random share of the other half —
  // never below half the backoff, never above the cap
  return Math.round(base / 2 + rand() * (base / 2));
}

const hidden = () =>
  typeof document !== "undefined" && document.visibilityState === "hidden";

export function usePoll(
  task: (signal: AbortSignal) => Promise<PollOutcome>,
  intervalMs: number,
  deps: readonly unknown[],
  enabled = true,
): void {
  // the LATEST task, so a caller may close over fresh state without the
  // poll restarting on every render
  const taskRef = useRef(task);
  useEffect(() => { taskRef.current = task; });

  useEffect(() => {
    if (!enabled) return;
    const ctl = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;
    let stopped = false;
    let dueWhileHidden = false;
    let failures = 0;

    const schedule = () => {
      if (stopped || ctl.signal.aborted) return;
      timer = setTimeout(() => run(), nextDelay(intervalMs, failures));
    };

    const run = async (first = false) => {
      timer = undefined;
      if (stopped || ctl.signal.aborted || inFlight) return;
      // the FIRST read is made even in a tab opened in the background, so
      // the page has something to show when it is looked at; every later
      // one waits for the tab to be visible
      if (!first && hidden()) { dueWhileHidden = true; return; }
      inFlight = true;
      let outcome: PollOutcome;
      try {
        outcome = await taskRef.current(ctl.signal);
      } catch {
        outcome = "failed";
      }
      inFlight = false;
      if (ctl.signal.aborted) return;
      if (outcome === "stop") { stopped = true; return; }
      failures = outcome === "failed" ? failures + 1 : 0;
      schedule();
    };

    const onVisibility = () => {
      if (!hidden() && dueWhileHidden) {
        dueWhileHidden = false;
        run();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    run(true);
    return () => {
      ctl.abort();
      if (timer !== undefined) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // `deps` is the caller's own dependency list, spread on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, enabled, ...deps]);
}

/** FOR A POLL MADE OF SEVERAL READS FIRED SIDE BY SIDE (the league
 *  dashboards read scoreboard, markets and odds together). `get` is
 *  `fetch` bound to the poll's signal that records whether any read
 *  failed — a rejected fetch or a non-OK status — and `settled()` waits
 *  for every response and answers the poll's outcome, so the in-flight
 *  guard and the backoff see the whole round, not its first read. */
export function pollReads(signal: AbortSignal) {
  const pending: Promise<unknown>[] = [];
  let failed = false;
  const get = (url: string, init?: RequestInit): Promise<Response> => {
    const p = fetch(url, { ...init, signal }).then(
      (r) => { if (!r.ok) failed = true; return r; },
      (e) => { failed = true; throw e; });
    pending.push(p.catch(() => undefined));
    return p;
  };
  const settled = async (): Promise<PollOutcome> => {
    await Promise.all(pending);
    return failed ? "failed" : "ok";
  };
  return { get, settled };
}

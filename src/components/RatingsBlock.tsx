// THE LIVE PLAYER-RATINGS TEAM +/- (Son, 2026-10-01: placement A — its
// own compact block on the live match hub, under the live section).
//
// What it shows is the backend's `GET /api/live-performance/{event_id}`
// (TRIVELA src/live_perf/read.py, schema `live-performance-v0`): each
// side's minutes-weighted live player rating against what the SAME
// players were expected to rate, frozen at kickoff. `delta` is that
// difference — Son's +/- — and nothing here re-derives it.
//
// WHAT IT IS NOT. Whether the +/- predicts the result beyond the score
// state has NOT been tested (the backend's own `notes.version` says so),
// so the block is labelled UNTESTED until a preregistered forward test
// passes, and it carries the shadow framing every model surface does.
// The +/- is printed in plain ink: no green for plus, no red for minus,
// because a colour is a verdict and there is no verdict to give.
//
// THE STATES, each named and none of them a zero:
//   collection off  the route answered 404 — the backend holds no
//                   live-performance record for this match. The backend
//                   publishes no "collection enabled" flag, so this is
//                   the only evidence a page can have; while
//                   LIVE_PERF_ENABLED is unset on Railway it is the
//                   state every match is in. A payload carrying
//                   `collection_enabled: false` is honoured the same way.
//   unavailable     any other failed read, with its status and sentence.
//   no reading yet  a record exists and no rated minute has arrived.
//   live / held     a reading; HELD (dimmed, with its minute) once it is
//                   older than the cadence it was taken under allows.
//   missing ratings a side whose +/- is null is NAMED with the reason
//                   its own fields give, never left blank.
//
// AFTER A RED CARD THE BLOCK KEEPS SHOWING. The +/- is computed over the
// players on the pitch, so after a sending-off it is a read of the ten
// still on. The line is BROKEN at that minute and marked, and a caption
// says whose ten. The red-card minute is read off the same response's
// ESPN state series (`espn.series[].h[5]` / `.a[5]`, red cards), never
// guessed from the hub's event list.
import { useState } from "react";
import { failureOf, NEVER_ANSWERED } from "../lib/httpFailure";
import { usePoll } from "../lib/usePoll";

type PerfSide = { live_rating?: number | null;
  expected_rating?: number | null; delta?: number | null;
  players_rated_on_pitch?: number | null };
type PerfLatest = { minute?: number | null; status?: string | null;
  age_s?: number | null; cadence_s?: number | null;
  home: PerfSide; away: PerfSide };
/** [live, expected, delta, sot, xg] — the backend's `series_row.h` */
type PerfRow = { m?: number | null; h?: Array<number | null>;
  a?: Array<number | null> };
/** [xg, xg_last15, momentum, sot, corners, red cards] */
type EspnRow = { m?: number | null; h?: Array<number | null>;
  a?: Array<number | null> };
export type LivePerf = { home?: string | null; away?: string | null;
  latest: PerfLatest | null; series?: PerfRow[];
  espn?: { series?: EspnRow[] } | null;
  collection_enabled?: boolean };

type State =
  | { kind: "loading" }
  | { kind: "off" }
  | { kind: "failed"; why: string }
  | { kind: "read"; d: LivePerf };

/** The words, written once so a spec can name them from here. */
export const RATINGS_COPY = {
  off: "ratings collection is off",
  offWhy: "No player ratings are being recorded for this match, so there "
    + "is no +/- to show. This is not a zero.",
  untested: "untested",
  shadow: "shadow · not advice",
  read: "a read, not a signal",
  noReading: "no rated minute has arrived yet — there is no +/- to show",
} as const;

/** Signed, two decimals, a true minus sign. Never coloured. */
export function signed(v: number): string {
  const s = Math.abs(v).toFixed(2);
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s;
}

/** Why a side has no +/-, from that side's own fields. */
export function missingReason(s: PerfSide | undefined): string {
  if (!s) return "this side was not sent";
  if (!s.players_rated_on_pitch)
    return "no player on the pitch carries a rating yet";
  if (s.expected_rating == null)
    return "no pre-match expectation was frozen for this side";
  if (s.live_rating == null) return "the live rating was not sent";
  return "the +/- was not sent";
}

/** A reading is HELD when it is older than the cadence it was taken
 *  under allows: two missed polls plus a minute of grace. */
export function isHeld(l: PerfLatest): boolean {
  if (l.age_s == null) return false;
  const cad = l.cadence_s && l.cadence_s > 0 ? l.cadence_s : 60;
  return l.age_s > 2 * cad + 60;
}

/** The first minute each side is down a man, off the ESPN state series. */
export function redCards(d: LivePerf): Array<{ side: "home" | "away";
  minute: number }> {
  const out: Array<{ side: "home" | "away"; minute: number }> = [];
  for (const side of ["home", "away"] as const) {
    const k = side === "home" ? "h" : "a";
    const row = (d.espn?.series ?? []).find((r) =>
      typeof r.m === "number" && (r[k]?.[5] ?? 0) > 0);
    if (row && typeof row.m === "number")
      out.push({ side, minute: row.m });
  }
  return out.sort((x, y) => x.minute - y.minute);
}

export default function RatingsBlock({ eventId }: { eventId: string }) {
  const [st, setSt] = useState<State>({ kind: "loading" });
  usePoll(async (signal) => {
    let r: Response;
    try {
      r = await fetch(`/api/live-performance/${eventId}`, { signal });
    } catch {
      if (signal.aborted) return "stop";
      setSt({ kind: "failed", why: NEVER_ANSWERED });
      return "failed";
    }
    if (r.status === 404) {
      setSt({ kind: "off" });
      return "stop";
    }
    if (!r.ok) {
      setSt({ kind: "failed", why: await failureOf(r) });
      return "failed";
    }
    let d: LivePerf;
    try {
      d = await r.json();
    } catch {
      setSt({ kind: "failed",
              why: `HTTP ${r.status} — the answer was not JSON` });
      return "failed";
    }
    if (signal.aborted) return "stop";
    if (d.collection_enabled === false) {
      setSt({ kind: "off" });
      return "stop";
    }
    setSt({ kind: "read", d });
    return "ok";
  }, 60000, [eventId]);

  return (
    <section id="ratings" data-testid="ratings-block"
      className="mt-6 rounded-2xl border border-line bg-elev px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-low">
          player ratings · team +/-
        </h3>
        <div className="flex flex-wrap gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
          <span data-testid="ratings-untested"
            className="rounded-md border border-line px-1.5 py-0.5">
            {RATINGS_COPY.untested}
          </span>
          <span className="rounded-md border border-line px-1.5 py-0.5">
            {RATINGS_COPY.shadow}
          </span>
        </div>
      </div>
      <div className="mt-3">
        {st.kind === "loading" && (
          <p className="text-sm text-ink-faint">reading ratings…</p>
        )}
        {st.kind === "off" && (
          <div data-testid="ratings-off">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid">
              {RATINGS_COPY.off}
            </p>
            <p className="mt-1 text-sm text-ink-low">{RATINGS_COPY.offWhy}</p>
          </div>
        )}
        {st.kind === "failed" && (
          <p data-testid="ratings-failed" className="text-sm text-ink-low">
            ratings unavailable — {st.why}
          </p>
        )}
        {st.kind === "read" && <Reading d={st.d} />}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        {RATINGS_COPY.read}. Each side&apos;s live player rating against what
        the same players were expected to rate, frozen at kickoff. Whether
        it says anything about the result beyond the score has not been
        tested; a forward test is preregistered and is read once.
      </p>
    </section>
  );
}

function Reading({ d }: { d: LivePerf }) {
  const l = d.latest;
  if (!l) {
    return (
      <p data-testid="ratings-no-reading" className="text-sm text-ink-low">
        {RATINGS_COPY.noReading}
      </p>
    );
  }
  const held = isHeld(l);
  const reds = redCards(d);
  const name = (side: "home" | "away") =>
    (side === "home" ? d.home : d.away) || side;
  return (
    <div data-testid={held ? "ratings-held" : "ratings-live"}
      className={held ? "opacity-50" : undefined}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        {held
          ? `held · last reading ${l.minute ?? "?"}'`
          : `reading at ${l.minute ?? "?"}'`}
      </p>
      <div className="mt-2 grid gap-2">
        {(["home", "away"] as const).map((side) => {
          const s = l[side];
          const has = typeof s?.delta === "number";
          return (
            <div key={side} data-testid={`ratings-${side}`}
              className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3">
              <span className="min-w-0 truncate text-sm text-ink-mid">
                {name(side)}
              </span>
              {has ? (
                <span className="font-mono text-sm tabular-nums text-ink-hi">
                  {signed(s.delta as number)}
                  <span className="ml-2 text-[11px] text-ink-faint">
                    {s.live_rating?.toFixed(2) ?? "—"} vs{" "}
                    {s.expected_rating?.toFixed(2) ?? "—"}
                  </span>
                </span>
              ) : (
                <span data-testid={`ratings-${side}-missing`}
                  className="text-[12px] text-ink-low">
                  rating missing — {missingReason(s)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <Line d={d} reds={reds} />
      {(d.series ?? []).length > 0 && (
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          solid {name("home")} · dashed {name("away")} · flat line = as expected
        </p>
      )}
      {reds.map((r) => (
        <p key={r.side} data-testid="ratings-red-caption"
          className="mt-1 text-[12px] text-ink-low">
          Red card {r.minute}&apos; ({name(r.side)}): from there the +/-
          covers the 10 still on.
        </p>
      ))}
    </div>
  );
}

/** The +/- over the match, one line per side, in ink. BROKEN at every
 *  red-card minute and wherever a minute has no +/-. */
function Line({ d, reds }: { d: LivePerf;
  reds: Array<{ side: "home" | "away"; minute: number }> }) {
  const rows = (d.series ?? []).filter((r) => typeof r.m === "number");
  const vals = rows.flatMap((r) => [r.h?.[2], r.a?.[2]])
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  const W = 300, H = 64, PAD = 4;
  const maxM = Math.max(90, ...rows.map((r) => r.m as number));
  const span = Math.max(0.5, ...vals.map(Math.abs));
  const x = (m: number) => PAD + (m / maxM) * (W - 2 * PAD);
  const y = (v: number) => H / 2 - (v / span) * (H / 2 - PAD);
  const cuts = reds.map((r) => r.minute);
  const paths = (k: "h" | "a") => {
    const segs: string[] = [];
    let cur = "";
    let prevM = -1;
    for (const r of rows) {
      const m = r.m as number;
      const v = r[k]?.[2];
      const crossed = cuts.some((c) => prevM < c && m >= c);
      if (typeof v !== "number" || crossed) {
        if (cur) segs.push(cur);
        cur = "";
      }
      if (typeof v === "number")
        cur += `${cur ? "L" : "M"}${x(m).toFixed(1)},${y(v).toFixed(1)}`;
      prevM = m;
    }
    if (cur) segs.push(cur);
    return segs;
  };
  return (
    <svg data-testid="ratings-line" viewBox={`0 0 ${W} ${H}`}
      className="mt-3 block h-16 w-full" preserveAspectRatio="none"
      role="img" aria-label="each side's +/- by minute">
      <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2}
        className="stroke-line" strokeWidth={1} />
      {paths("h").map((p, i) => (
        <path key={`h${i}`} d={p} data-testid="ratings-seg-home" fill="none"
          className="stroke-ink-mid" strokeWidth={1.5}
          vectorEffect="non-scaling-stroke" />
      ))}
      {paths("a").map((p, i) => (
        <path key={`a${i}`} d={p} data-testid="ratings-seg-away" fill="none"
          className="stroke-ink-low" strokeWidth={1.5} strokeDasharray="3 2"
          vectorEffect="non-scaling-stroke" />
      ))}
      {reds.map((r) => (
        <line key={r.side} data-testid="ratings-red-mark"
          x1={x(r.minute)} x2={x(r.minute)} y1={PAD} y2={H - PAD}
          className="stroke-ink-low" strokeWidth={1} strokeDasharray="1 2"
          vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// THE TRADER'S CANDIDATES, ON THE OPERATOR CONSOLE (2026-10-05).
//
// Son, 2026-10-03: "also let me see the candidate too, transparency is
// also the purpose of the console". So this section shows the markets the
// trader considered on its newest tick — what our model and the bookmakers
// said, the blend weight it drew, the Kalshi book on both sides, the maker
// price it would rest at, the edge per side against its bar, the in-play
// reads — and what it decided: placed (side · count @ price), or skipped /
// refused / not run…, said in plain words.
//
// WHAT IT READS: GET /api/ops/trading-candidates (the relay of the
// backend's operator-gated GET /api/admin/trading/candidates), every 15 s
// while a token is held, through lib/usePoll. The payload is a BOUNDED
// snapshot of one tick; lib/tradingConsole.ts reads it, and is the one
// place to align if the backend's contract moves.
//
// EVERY COMPETITION IS A ROW (Son's standing order, 2026-10-03). The
// competition chips list every competition the payload names (its scope
// or its per-competition counts), or the eleven focus competitions when it
// names none, each with what this snapshot holds of it. A competition with
// no row says "none in this snapshot", never "0 considered": a bounded
// snapshot can leave one out. When the payload carries per-competition
// counts, they are a table of their own, every competition a row.
//
// FILTERS: by competition (the chips) and by decision (all, placed,
// skipped, and any other action the snapshot holds). They are this tab's
// state and survive every refresh.
//
// MISSING IS NOT ZERO, A FAILED READ IS NOT AN EMPTY ONE. A route the
// backend does not have reads "not available yet"; a refusal, an error or
// an answer that is not JSON is named; an empty `rows` is explained by
// `emptyWhy` (stale snapshot, no snapshot, withheld, cut) and reads "the
// newest tick considered no markets" only when that is what it says.
//
// EXPERIMENTAL, UNPROVEN. Our model's probability is unvalidated; a
// placement here is the trader's rule at work, not advice and not
// evidence of an edge. This section reads; it places nothing.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ABSENT, ACTION_LABEL, ACTION_ORDER, BOUND_REASONS, type Candidate,
  type Candidates, type Pair, anchorWords, cents, compLabel, coverage,
  decisionWords, emptyWhy, isObj, parseCandidates, pct, scopeSource,
  signedCents,
} from "../lib/tradingConsole";
import { usePoll, type PollOutcome } from "../lib/usePoll";

const POLL_MS = 15_000;
/** A read older than three cadences is shown dimmed. */
const STALE_MS = 3 * POLL_MS;

type Read =
  | { kind: "idle" }
  | { kind: "ok" }
  | { kind: "unavailable" }
  | { kind: "refused"; detail: string }
  | { kind: "error"; status: number; detail: string };

const ALL = "__all__";

function when(iso: string | null): string {
  if (!iso) return ABSENT;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

const fixed = (n: number | null, d = 2) => (n === null ? ABSENT : n.toFixed(d));
const signed = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}`;
/** a (home, away) pair as "home +0.12 · away −0.30", or one number */
function pair(p: Pair): string {
  if (p === null) return ABSENT;
  return "one" in p ? signed(p.one)
    : `home ${signed(p.home)} · away ${signed(p.away)}`;
}
const count = (n: number | null) => (n === null ? ABSENT : n.toLocaleString("en-US"));

const TH = "border-b border-line pb-1 pr-3 font-normal uppercase tracking-[0.12em] text-[10px] text-ink-faint whitespace-nowrap";
const TD = "py-1.5 pr-3 align-top";
const CHIP = "whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors";

/** One side's book: bid / ask, and the maker price it would rest at. */
function BookCell({ bid, ask, maker }: {
  bid: number | null; ask: number | null; maker: number | null;
}) {
  return (
    <>
      <span className="block whitespace-nowrap text-ink-hi">
        {cents(bid)} <span className="text-ink-faint">/</span> {cents(ask)}
      </span>
      <span className="block whitespace-nowrap text-[10px] text-ink-faint">
        maker {cents(maker)}
      </span>
    </>
  );
}

/** An edge, drawn brighter when it clears the bar. Clearing the bar is
 *  the trader's rule, not a verdict, so it is ink weight, not a colour. */
function EdgeCell({ edge, threshold, side, basis }: {
  edge: number | null; threshold: number | null; side: "yes" | "no";
  basis: string | null;
}) {
  const clears = edge !== null && threshold !== null && edge >= threshold;
  return (
    <>
      <span data-testid={`cand-edge-${side}`} data-clears={clears || undefined}
        className={`block whitespace-nowrap ${clears ? "font-semibold text-ink-hi" : "text-ink-low"}`}>
        {signedCents(edge)}
      </span>
      {basis === "ask" && edge !== null && (
        <span className="block text-[10px] text-ink-faint">at the ask</span>
      )}
    </>
  );
}

function InPlayCell({ c }: { c: Candidate }) {
  const ip = c.inplay;
  if (!ip) return <span className="text-ink-faint">pre-match</span>;
  const hot: string[] = [];
  if (ip.hot === true) hot.push("HOT");
  if (ip.hot_yes === true) hot.push("HOT against YES");
  if (ip.hot_no === true) hot.push("HOT against NO");
  const danger = ip.danger_yes !== null || ip.danger_no !== null
    ? `YES ${pct(ip.danger_yes)} · NO ${pct(ip.danger_no)}` : pct(ip.danger);
  return (
    <span className="flex flex-col gap-0.5 whitespace-nowrap text-[11px] text-ink-mid">
      {hot.map((h) => (
        <span key={h} data-testid="cand-hot"
          className="w-fit rounded-full border border-warn/60 px-1.5 text-[10px] font-semibold text-warn">
          {h}
        </span>
      ))}
      {ip.mode && <span className="text-ink-low">mode {ip.mode}</span>}
      <span>momentum {pair(ip.momentum)}</span>
      <span>xG15 {pair(ip.xg15)}</span>
      <span>danger {danger}</span>
      {(ip.p_engine !== null || ip.p_informed !== null) && (
        <span className="text-ink-low">
          engine {pct(ip.p_engine)} · live-stat {pct(ip.p_informed)}
        </span>
      )}
      {ip.anchor && (
        <span data-testid="cand-anchor" className="text-ink-low"
          title="what the in-play engine number started from: w on our pre-match forecast, the rest the market's T-10 price (experimental, unvalidated)">
          {anchorWords(ip.anchor)}
          {ip.anchor.why ? ` (${ip.anchor.why})` : ""}
        </span>
      )}
    </span>
  );
}

function DecisionCell({ c }: { c: Candidate }) {
  const d = c.decision;
  const SIDE = c.side_considered ? c.side_considered.toUpperCase() : null;
  if (d.action === "placed") {
    return (
      <span className="flex flex-col gap-0.5">
        <span data-testid="cand-placed-chip"
          className="w-fit whitespace-nowrap rounded-full border border-accent/60 px-2 py-0.5 text-[10px] font-semibold text-accent">
          Placed
        </span>
        <span className="whitespace-nowrap text-[11px] text-ink-hi">
          {SIDE ?? "side not stated"} · {d.count === null ? ABSENT : d.count}
          {" "}@ {cents(d.price_cents)}
        </span>
        {d.words && <span className="text-[11px] text-ink-low">{d.words}</span>}
      </span>
    );
  }
  const w = decisionWords(d);
  const small = [w.sentWords ? d.reason : null, d.detail].filter(Boolean).join(" · ");
  return (
    <span className="flex flex-col gap-0.5">
      <span data-testid="cand-action"
        className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
        {ACTION_LABEL[d.action] ?? d.action}
        {SIDE ? ` · ${SIDE}` : ""}
      </span>
      <span data-testid="cand-words" className="block min-w-[170px] font-sans text-[12px] leading-snug text-ink-mid">
        {w.text}
      </span>
      {small && <span className="text-[10px] text-ink-faint">{small}</span>}
    </span>
  );
}

function Pill({ pressed, onClick, testid, data, children }: {
  pressed: boolean; onClick: () => void; testid: string;
  data?: Record<string, string>; children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={pressed} data-testid={testid}
      onClick={onClick} {...data}
      className={`${CHIP} ${pressed
        ? "border-accent/70 bg-accent/10 text-ink-hi"
        : "border-line text-ink-mid hover:border-line-strong"}`}>
      {children}
    </button>
  );
}

export function TradingCandidates({ token }: { token: string }) {
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ c: Candidates; at: number } | null>(null);
  const [comp, setComp] = useState<string>(ALL);
  const [dec, setDec] = useState<string>(ALL);
  const [now, setNow] = useState(() => Date.now());

  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch("/api/ops/trading-candidates", {
      headers: { "x-admin-token": token }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try {
      body = await r.json();
    } catch (err) {
      // NAMED, NEVER AN EMPTY TABLE: an answer that is not JSON is said
      // by its status — a 404 is the missing route, a 403 the refusal,
      // anything else an error naming that it was not JSON
      if (r.status === 404) {
        setRead({ kind: "unavailable" });
        setLast(null);
        return "ok";
      }
      if (r.status === 403) {
        setRead({ kind: "refused", detail: "HTTP 403" });
        setLast(null);
        return "stop";
      }
      setRead({ kind: "error", status: r.status,
        detail: `the answer was not JSON (${String(err)})` });
      return "failed";
    }
    if (r.status === 404 || (isObj(body) && body.available === false)) {
      // a definite answer: keep asking at the usual cadence, so the
      // section fills in once the backend has the route
      setRead({ kind: "unavailable" });
      setLast(null);
      return "ok";
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body)) {
      const at = Date.now();
      setRead({ kind: "ok" });
      setLast({ c: parseCandidates(body), at });
      setNow(at);
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    setRead({ kind: "error", status: r.status,
      detail: r.ok ? "the answer was not an object, so there is no table to draw"
        : detail });
    return "failed";
  }, POLL_MS, [token], token !== "");

  useEffect(() => {
    if (!last) return;
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, [last]);

  const c = last?.c ?? null;
  const stale = last !== null && (read.kind !== "ok" || now - last.at > STALE_MS);
  const cov = useMemo(() => (c ? coverage(c) : []), [c]);

  const inComp = useMemo(() => (c ? c.rows.filter((r) => comp === ALL
    || (r.competition ?? "") === comp) : []), [c, comp]);
  const shown = useMemo(() => inComp.filter((r) => dec === ALL
    || r.decision.action === dec), [inComp, dec]);
  /** the decision pills: placed and skipped always, then every other
   *  action the snapshot holds, in the route's order */
  const actions = useMemo(() => {
    const present = new Set(c ? c.rows.map((r) => r.decision.action) : []);
    const ordered: string[] = ACTION_ORDER.filter((a) => a === "placed"
      || a === "skipped" || present.has(a));
    for (const a of [...present].sort()) if (!ordered.includes(a)) ordered.push(a);
    return ordered;
  }, [c]);
  const byAction = (rows: Candidate[], a: string) =>
    rows.filter((r) => r.decision.action === a).length;

  /** why the competition's rows were not placed, largest first */
  const why = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of inComp) {
      if (r.decision.action === "placed") continue;
      const k = decisionWords(r.decision).text;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [inComp]);

  const tickAt = c?.tick_at ?? null;
  const tickMs = tickAt ? Date.parse(tickAt) : NaN;
  // the markets left out BY DESIGN (far-off kickoffs, not trading, out of
  // scope…), said in neutral ink; only a cut to the bound is a warning
  const bound = new Set<string>(BOUND_REASONS);
  const byDesign = c ? Object.entries(c.omitted).filter(([k]) => !bound.has(k))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) : [];
  const byDesignN = byDesign.reduce((s, [, n]) => s + n, 0);
  const cutReasons = c ? Object.entries(c.omitted).filter(([k]) => bound.has(k))
    : [];
  const src = c ? scopeSource(c) : "focus";
  const empty = c && c.rows.length === 0 ? emptyWhy(c) : null;

  return (
    <section data-testid="ops-candidates" aria-labelledby="ops-candidates-h"
      className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <h2 id="ops-candidates-h"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        Candidates
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-faint">
        The markets the trader considered on its newest tick, and what it
        decided. Experimental, unproven: our model&apos;s probability is
        unvalidated, and a placement here is the trader&apos;s rule at work —
        not advice, not evidence of an edge. Prices in cents; edges are after
        the maker fee.
      </p>
      {c && (
        <p data-testid="cand-summary" className="mt-1 font-mono text-[11px] text-ink-faint">
          {c.rows.length} shown · {byAction(c.rows, "placed")} placed ·{" "}
          {c.rows.length - byAction(c.rows, "placed")} not placed
          {c.considered !== null ? ` · ${c.considered.toLocaleString("en-US")} considered` : ""}
          {" "}· tick {when(tickAt)}
          {Number.isFinite(tickMs) ? ` (${ago(now - tickMs)} ago)` : ""}
          {c.truncated && (
            <span data-testid="cand-truncated" className="text-warn">
              {" "}· snapshot cut to its bound
              {c.cut > 0 ? ` — ${c.cut} left out (${cutReasons
                .map(([k, n]) => `${k} ${n}`).join(", ")})`
                : c.considered !== null ? ` — ${c.rows.length} of ${c.considered} shown` : ""}
            </span>
          )}
          {byDesignN > 0 && (
            <span data-testid="cand-not-shown">
              {" "}· {byDesignN.toLocaleString("en-US")} not shown by design ({byDesign
                .slice(0, 4).map(([k, n]) => `${k} ${n}`).join(", ")}
              {byDesign.length > 4 ? ", …" : ""})
            </span>
          )}
          {(c.not_served ?? 0) > 0 && (
            <span data-testid="cand-not-served">
              {" "}· {c.not_served} withheld ({c.stale === true
                ? "the snapshot is too old to serve" : "market no longer trading"})
            </span>
          )}
          {c.unreadable > 0 && (
            <span data-testid="cand-unreadable" className="text-warn">
              {" "}· {c.unreadable} row{c.unreadable === 1 ? "" : "s"} unreadable (no ticker), not drawn
            </span>
          )}
          {stale && ` · stale, ${ago(now - last!.at)} old`}
        </p>
      )}

      <div className="mt-3">
        {read.kind === "unavailable" && (
          <p data-testid="cand-unavailable" className="font-mono text-[12px] text-ink-low">
            Candidates not available yet — this backend does not serve what the
            trader considered. The rest of the console is unaffected.
          </p>
        )}
        {read.kind === "refused" && (
          <p data-testid="cand-error" role="alert" className="font-mono text-[12px] text-neg">
            token rejected — the backend refused it ({read.detail})
          </p>
        )}
        {read.kind === "error" && (
          <p data-testid="cand-error" role="alert" className="font-mono text-[12px] text-warn">
            the candidates read failed (HTTP {read.status}) — {read.detail}
          </p>
        )}
        {read.kind === "idle" && !c && (
          <p className="font-mono text-[11px] text-ink-faint">reading the candidates…</p>
        )}

        {c && (
          <div data-testid="cand-body" data-stale={stale || undefined}
            className={`transition-opacity ${stale ? "opacity-50" : ""}`}>
            <h3 className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
              by competition · {src === "focus"
                ? "the eleven focus competitions" : "the trader's scope"}
            </h3>
            <div data-testid="cand-comps" role="group" aria-label="filter by competition"
              className="flex flex-wrap gap-1.5">
              <Pill testid="cand-comp" data={{ "data-comp": ALL }}
                pressed={comp === ALL} onClick={() => setComp(ALL)}>
                All · {c.rows.length}
              </Pill>
              {cov.map((k) => (
                <Pill key={k.competition || "none"} testid="cand-comp"
                  data={{ "data-comp": k.competition,
                          "data-considered": String(k.considered) }}
                  pressed={comp === k.competition}
                  onClick={() => setComp(k.competition)}>
                  {k.label} · {k.considered === 0
                    ? "none in this snapshot"
                    : `${k.considered}${k.placed ? `, ${k.placed} placed` : ""}`}
                  {!k.declared && k.considered > 0 ? " (not in scope list)" : ""}
                </Pill>
              ))}
            </div>

            <div data-testid="cand-decisions" role="group" aria-label="filter by decision"
              className="mt-2 flex flex-wrap gap-1.5">
              <Pill testid="cand-decision" data={{ "data-decision": "all" }}
                pressed={dec === ALL} onClick={() => setDec(ALL)}>
                All decisions · {inComp.length}
              </Pill>
              {actions.map((a) => (
                <Pill key={a} testid="cand-decision" data={{ "data-decision": a }}
                  pressed={dec === a} onClick={() => setDec(a)}>
                  {ACTION_LABEL[a] ?? a} · {byAction(inComp, a)}
                </Pill>
              ))}
            </div>
            {dec !== ALL && c.actions[dec] && (
              <p data-testid="cand-action-means" className="mt-1 text-[11px] text-ink-faint">
                {c.actions[dec]}
              </p>
            )}

            <div className="mt-3">
              {empty ? (
                <p data-testid="cand-none" data-why={empty.code}
                  className={`font-mono text-[11px] ${empty.code === "none" ? "text-ink-faint" : "text-warn"}`}>
                  {empty.text}
                </p>
              ) : shown.length === 0 ? (
                <p data-testid="cand-filtered-empty" className="font-mono text-[11px] text-ink-faint">
                  {comp !== ALL && inComp.length === 0
                    ? `No candidate from ${compLabel(comp)} in this snapshot.`
                    : "No candidates match these filters."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table data-testid="cand-table"
                    className="w-full min-w-[1080px] border-collapse font-mono text-xs tabular-nums">
                    <thead>
                      <tr>
                        {/* THE DECISION SITS NEXT TO THE MARKET, so at phone
                            width what the trader did is on screen before
                            the numbers that explain it are scrolled to */}
                        {["market", "decision", "competition", "kickoff / minute",
                          "model", "consensus", "w", "fair (yes)", "yes bid / ask",
                          "no bid / ask", "edge yes", "edge no", "min edge",
                          "in play"].map((h, i) => (
                          <th key={h} scope="col"
                            className={`${TH} ${i >= 4 && i <= 12 ? "text-right" : "text-left"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r) => {
                        const isPlaced = r.decision.action === "placed";
                        return (
                          <tr key={r.key} data-testid="cand-row" data-ticker={r.ticker}
                            data-decision={r.decision.action}
                            data-competition={r.competition ?? ""}
                            className={`border-b border-line/50 ${isPlaced
                              ? "bg-accent/10 shadow-[inset_3px_0_0_var(--color-accent)]" : ""}`}>
                            <td className={`${TD} min-w-[150px] pl-2`}>
                              <span className="block font-sans text-[12px] text-ink-hi">{r.title}</span>
                              <span className="block break-all text-[10px] text-ink-faint">{r.ticker}</span>
                              <span className="block text-[10px] text-ink-faint">
                                {r.family ?? "market type not stated"}
                              </span>
                            </td>
                            <td className={TD}><DecisionCell c={r} /></td>
                            <td className={`${TD} text-ink-mid`}>{compLabel(r.competition)}</td>
                            <td className={`${TD} whitespace-nowrap`}>
                              {r.minute !== null
                                ? <span className="text-live">in play {r.minute}&prime;</span>
                                : r.inplay || r.phase === "in_play"
                                  ? <span className="text-live">in play</span>
                                  : <span className="text-ink-mid">{when(r.kickoff_utc)}</span>}
                            </td>
                            <td className={`${TD} text-right text-ink-mid`}>{pct(r.p_model)}</td>
                            <td className={`${TD} text-right text-ink-mid`}>{pct(r.p_consensus)}</td>
                            <td className={`${TD} text-right text-ink-mid`}>{fixed(r.w)}</td>
                            <td className={`${TD} text-right text-ink-hi`}>{pct(r.fair)}</td>
                            <td className={`${TD} text-right`}>
                              <BookCell bid={r.yes_bid} ask={r.yes_ask} maker={r.maker_yes} />
                            </td>
                            <td className={`${TD} text-right`}>
                              <BookCell bid={r.no_bid} ask={r.no_ask} maker={r.maker_no} />
                            </td>
                            <td className={`${TD} text-right`}>
                              <EdgeCell edge={r.edge_yes} threshold={r.threshold} side="yes"
                                basis={r.edge_basis} />
                            </td>
                            <td className={`${TD} text-right`}>
                              <EdgeCell edge={r.edge_no} threshold={r.threshold} side="no"
                                basis={r.edge_basis} />
                            </td>
                            <td className={`${TD} text-right text-ink-mid`}>{cents(r.threshold)}</td>
                            <td className={TD}><InPlayCell c={r} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {why.length > 0 && (
              <>
                <h3 className="mb-1.5 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                  why not placed{comp === ALL ? "" : ` · ${compLabel(comp)}`}
                </h3>
                <ul data-testid="cand-why" className="space-y-0.5 text-[12px] text-ink-mid">
                  {why.map(([words, n]) => (
                    <li key={words} className="flex gap-2">
                      <span className="w-8 shrink-0 text-right font-mono tabular-nums text-ink-hi">{n}</span>
                      <span>{words}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {c.by_competition && (
              <>
                <h3 className="mb-1.5 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                  every competition, this tick
                </h3>
                <div className="overflow-x-auto">
                  <table data-testid="cand-by-comp"
                    className="w-full min-w-[600px] border-collapse font-mono text-[11px] tabular-nums">
                    <thead>
                      <tr>
                        {["competition", "in scope", "assessed", "eligible", "in play",
                          "decided", "model-priced", "placed", "in this snapshot"].map((h, i) => (
                          <th key={h} scope="col"
                            className={`${TH} ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cov.map((k) => (
                        <tr key={k.competition || "none"} data-testid="cand-by-comp-row"
                          data-comp={k.competition} className="border-b border-line/50">
                          <td className="py-1 pr-3 text-ink-mid">{k.label}</td>
                          <td data-testid="cand-by-comp-in-scope"
                            className="py-1 pr-3 text-right text-ink-hi">
                            {k.counts?.in_scope === true ? "yes"
                              : k.counts?.in_scope === false ? "no" : ABSENT}
                          </td>
                          {[k.counts?.assessed, k.counts?.eligible,
                            k.counts?.in_play_markets, k.counts?.decided,
                            k.counts?.model_priced, k.counts?.placed].map((n, i) => (
                            <td key={i} className="py-1 pr-3 text-right text-ink-hi">
                              {count(n ?? null)}
                            </td>
                          ))}
                          <td className="py-1 text-right text-ink-mid">{k.considered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <p className="mt-3 font-mono text-[10px] text-ink-faint">
              {c.version ?? "version not stated"} · generated {when(c.generated_at)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

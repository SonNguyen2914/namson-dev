// /ops/trading — THE OPERATOR'S TRADING CONSOLE (basic, typed token).
//
// Son, 2026-10-03: "I need to track what the trader doing." This page
// reads /api/ops/trading-status, which relays the backend's
// operator-gated `GET /api/admin/trading/status` — aggregates only:
// counts, dollar sums, flags and clocks.
//
// THE BOOK (2026-10-03, later). Once the status has been read, the
// "Positions & orders" section (components/TradingBook.tsx) reads
// /api/ops/trading-book — every open position and resting order, each
// flagged by whose it is — and is the page's ONE write: handing a
// position the operator holds to the trader, or taking it back, through
// /api/ops/trading-handover. It places, cancels and stops nothing.
//
// THE TOKEN (option A). Typed into a password field and held in React
// state ONLY — never localStorage, sessionStorage, a cookie, an env var
// or the bundle. A reload forgets it. Without one the page shows the
// field and makes no request at all. (Option B, a signed-in cookie, is
// later work.)
//
// ONE TOKEN PER VISIT (2026-10-03). The state is the tab's, held in
// components/OperatorToken.tsx above every page, so the token typed into
// the board's watch panel is already here after the Trading chip's
// client-side hop: it is used at once, with no second typing and no
// debounce wait, because nobody is typing. The field stays for a direct
// visit, and what is typed here is the board's token too.
//
// THE POLL. Every 15 s while a token is held, through lib/usePoll: no
// overlap, nothing while the tab is hidden, backoff after failures. A 403
// stops the poll until the token changes. The last good read stays on
// screen after a failed one, dimmed with its age, never presented as
// current.
//
// LINKED FOR THE OPERATOR ONLY. The header's Trading chip points here,
// and it is drawn only while the tab holds a token (components/chrome.tsx
// TradingChip); a visitor's pages carry no link to it. noindex. The way
// OUT is every page's: the logo goes home, the back arrow and the chips
// go to the board, the leagues and the field.
//
// CANDIDATES, LIVE VALUE, AND THE REST OF THE STATUS (2026-10-05). Once
// the status has been read, the "Candidates" section
// (components/TradingCandidates.tsx) reads /api/ops/trading-candidates —
// every market the newest tick considered and what it decided — and the
// book's positions carry their live value. The status route's in-play v2
// block, the learner's arms, the hand-over aggregates and the settlement
// reads are drawn here too; a block the backend does not send says "not
// on this backend", never a row of zeros.
//
// WHY IT SKIPS IN PLAY (2026-10-06). The trader had never placed an
// in-play order and the console could not say why. Son chose "Show why
// it skips": the "In play" section draws the day's in-play skips and
// refusals per reason, in the backend's plain words (largest first, the
// code beside them), every focus competition as an in-play row (legs,
// skipped, refused, placed), and the in-play strategy that RAN — a
// backend that still labels it v1 while its v2 block says v2 ran is
// drawn as v2, and the lag is said. A field the backend does not send
// reads "not served yet", never 0. Readers: lib/tradingConsole.ts.
//
// EXPERIMENTAL, UNPROVEN. The agent's numbers are its own bookkeeping
// of a small, capped experiment. Nothing on this page is advice and
// nothing here is evidence of an edge.
import Head from "next/head";
import { useEffect, useState, type ReactNode } from "react";
import { NavChip, RouteProgress, TopBar } from "../../components/chrome";
import { useOperatorToken } from "../../components/OperatorToken";
import { TradingBook } from "../../components/TradingBook";
import { TradingCandidates } from "../../components/TradingCandidates";
import { Eyebrow } from "../../components/ui";
import {
  NOT_SERVED, type ReasonsBlock, compLabel, inPlayByCompetition, inPlayReasons,
  inPlayStrategy,
} from "../../lib/tradingConsole";
import { usePoll, type PollOutcome } from "../../lib/usePoll";

const TOKEN_DEBOUNCE_MS = 600;
const POLL_MS = 15_000;
/** A read older than three cadences is shown dimmed, with its age. */
const STALE_MS = 3 * POLL_MS;

type Obj = Record<string, unknown>;

type Read =
  | { kind: "idle" }
  | { kind: "ok"; data: Obj; at: number }
  | { kind: "refused"; detail: string }
  | { kind: "not_ready"; detail: string }
  | { kind: "error"; status: number; detail: string };

// ------------------------------------------------------------ readers

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);
const num = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};
const ABSENT = "—";

function money(v: unknown, signed = false): string {
  const n = num(v);
  if (n === null) return ABSENT;
  const sign = n < 0 ? "−" : signed && n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}
function count(v: unknown): string {
  const n = num(v);
  return n === null ? ABSENT : n.toLocaleString("en-US");
}
function flag(v: unknown): string {
  return v === true ? "yes" : v === false ? "no" : ABSENT;
}
function text(v: unknown): string {
  if (v === null || v === undefined || v === "") return ABSENT;
  return typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean"
    ? String(v) : JSON.stringify(v);
}
function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h ${m % 60}m` : `${Math.floor(h / 24)}d`;
}
function clock(v: unknown, now: number): string {
  if (typeof v !== "string" || v === "") return ABSENT;
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return v;
  const d = new Date(t);
  const when = d.toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    second: "2-digit",
  });
  return `${when} (${ago(now - t)} ago)`;
}
/** Cents a contract, signed: a reward or a CLV. */
function cents(v: unknown): string {
  const n = num(v);
  return n === null ? ABSENT : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}¢`;
}
function fixed(v: unknown, d = 2): string {
  const n = num(v);
  return n === null ? ABSENT : n.toFixed(d);
}
/** "1 reward", "2 rewards", "— rewards" */
function nOf(v: unknown, one: string): string {
  return `${count(v)} ${one}${num(v) === 1 ? "" : "s"}`;
}
/** Which of `keys` a block carries at all. */
const carries = (o: Obj, keys: string[]) => keys.some((k) => k in o);

/** A {key: n} block as rows, largest first. */
function rowsOf(v: unknown): [string, number][] {
  const o = obj(v);
  if (!o) return [];
  return Object.entries(o)
    .map(([k, n]) => [k, num(n) ?? 0] as [string, number])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// ------------------------------------------------------------- pieces

function Section({ id, title, note, children }: {
  id: string; title: string; note?: string; children: ReactNode;
}) {
  return (
    <section data-testid={`ops-${id}`} aria-labelledby={`ops-${id}-h`}
      className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <h2 id={`ops-${id}-h`}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        {title}
      </h2>
      {note && <p className="mt-1 text-xs leading-relaxed text-ink-faint">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

type Tone = "hi" | "up" | "warn" | "neg";
const TONE: Record<Tone, string> = {
  hi: "text-ink-hi", up: "text-up", warn: "text-warn", neg: "text-neg",
};

function Stat({ k, v, tone = "hi", sub }: {
  k: string; v: string; tone?: Tone; sub?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-bs px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{k}</p>
      <p className={`mt-0.5 break-words font-mono text-sm tabular-nums ${TONE[tone]}`}>{v}</p>
      {sub && <p className="mt-0.5 break-words font-mono text-[10px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>;
}

const pnlTone = (v: unknown): Tone => {
  const n = num(v);
  return n === null || n === 0 ? "hi" : n > 0 ? "up" : "neg";
};

/** USED AGAINST A LIMIT, as a bar. The share is |used| / limit, so a
 *  loss measured as a negative number fills the bar the same way. */
function Meter({ label, used, limit, testid }: {
  label: string; used: unknown; limit: unknown; testid: string;
}) {
  const u = num(used);
  const l = num(limit);
  const share = u !== null && l !== null && l > 0
    ? Math.min(1, Math.abs(u) / l) : null;
  const tone = share === null ? "bg-line-strong"
    : share >= 0.8 ? "bg-neg" : share >= 0.5 ? "bg-warn" : "bg-up";
  return (
    <div data-testid={testid} className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</span>
        <span className="font-mono text-xs tabular-nums text-ink-hi">
          {money(used)} <span className="text-ink-faint">of</span> {money(limit)}
          {share !== null && (
            <span className="text-ink-low"> · {Math.round(share * 100)}%</span>
          )}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-bs" role="presentation">
        <div className={`h-full ${tone}`}
          style={{ width: `${share === null ? 0 : share * 100}%` }} />
      </div>
    </div>
  );
}

function Table({ head, rows, empty, testid, words = false }: {
  head: string[]; rows: (string | number)[][]; empty: string; testid?: string;
  /** the first column is prose: wrap it at words, not mid-word */
  words?: boolean;
}) {
  if (rows.length === 0) {
    return <p data-testid={testid} className="font-mono text-[11px] text-ink-faint">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table data-testid={testid} className="w-full border-collapse font-mono text-xs tabular-nums">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col"
                className={`border-b border-line pb-1 font-normal uppercase tracking-[0.12em] text-[10px] text-ink-faint ${
                  i === 0 ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-line/50">
              {r.map((c, i) => (
                <td key={i} className={`py-1 ${i === 0
                  ? `${words ? "break-words font-sans" : "break-all"} pr-2 text-left text-ink-mid`
                  : "pl-2 text-right text-ink-hi"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-1.5 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
      {children}
    </h3>
  );
}

// ----------------------------------------------------------- sections

function TopStrip({ d, now }: { d: Obj; now: number }) {
  const halt = obj(d.halt) ?? {};
  const ip = obj(d.in_play_trading) ?? {};
  const learning = obj(d.learning);
  const last = obj(d.last_tick);
  const halted = halt.active === true;
  return (
    <Section id="strip" title="Agent state"
      note={`${text(d.label) === ABSENT ? "" : `${text(d.label)} · `}experimental, unproven · strategy ${text(d.strategy)}`}>
      <Grid>
        <Stat k="env" v={text(d.env)} />
        <Stat k="enabled" v={flag(d.enabled)} />
        <Stat k="in-play enabled" v={flag(ip.enabled)} />
        <Stat k="learning enabled"
          v={learning ? flag(learning.enabled) : "not on this backend"} />
        <Stat k="universe enabled" v={flag(d.universe_enabled)} />
        <Stat k="kill switch" v={d.kill === true ? "KILLED" : flag(d.kill)}
          tone={d.kill === true ? "neg" : "hi"} />
        <Stat k="halt" v={halted ? `HALTED · ${text(halt.reason)}` : flag(halt.active)}
          tone={halted ? "neg" : "hi"}
          sub={halted
            ? `since ${clock(halt.since, now)} · re-arm: ${text(halt.rearm)}`
            : undefined} />
        <Stat k="last tick"
          v={last ? text(last.outcome) : "no tick on record"}
          sub={last ? `${clock(last.at, now)}${num(last.elapsed_s) !== null
            ? ` · took ${num(last.elapsed_s)!.toFixed(1)}s` : ""}` : undefined} />
      </Grid>
    </Section>
  );
}

function Money({ d, now }: { d: Obj; now: number }) {
  const pnl = obj(d.pnl) ?? {};
  const daily = obj(d.daily_loss) ?? {};
  const dd = obj(d.drawdown) ?? {};
  return (
    <Section id="money" title="Money"
      note="Agent P&L is the agent's own bookkeeping (its fills, fees and settlements) — what the halts measure. Realized is Kalshi's account-wide figure, manual trades included.">
      <Grid>
        <Stat k="balance (cash)" v={money(d.balance)}
          sub={`read ${clock(d.account_read_at, now)}`} />
        <Stat k="marked equity" v={money(d.marked_equity)} />
        <Stat k="agent P&L total" v={money(pnl.agent_total, true)}
          tone={pnlTone(pnl.agent_total)} />
        <Stat k="agent P&L since start" v={money(pnl.agent_since_start, true)}
          tone={pnlTone(pnl.agent_since_start)} />
        <Stat k="realized (account-wide)" v={money(pnl.realized_total, true)} />
        <Stat k="bankroll cap" v={money(d.bankroll_cap)} />
      </Grid>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Meter testid="meter-risk" label="total at risk"
          used={d.total_at_risk} limit={d.total_limit} />
        <Meter testid="meter-daily" label="daily loss used"
          used={daily.used} limit={daily.limit} />
        <Meter testid="meter-drawdown" label="drawdown used"
          used={dd.used} limit={dd.limit} />
      </div>
    </Section>
  );
}

function Activity({ d }: { d: Obj }) {
  const today = obj(d.today) ?? {};
  const byKind = rowsOf(today.by_kind);
  const byReason: [string, string, number][] = [];
  const br = obj(today.by_reason) ?? {};
  for (const [kind, reasons] of Object.entries(br)) {
    for (const [reason, n] of rowsOf(reasons)) byReason.push([kind, reason, n]);
  }
  byReason.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0])
    || a[1].localeCompare(b[1]));
  return (
    <Section id="activity" title="Activity today (UTC day)">
      <Grid>
        <Stat k="open agent orders" v={count(d.open_agent_orders)} />
        <Stat k="other (manual) orders" v={count(d.open_other_orders)} />
        <Stat k="orders placed today" v={count(d.placed_today)} />
        <Stat k="fills today" v={count(d.fills_today)} />
      </Grid>
      <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
        <div>
          <Sub>journal rows by kind</Sub>
          <Table testid="by-kind" head={["kind", "rows"]}
            rows={byKind.map(([k, n]) => [k, n.toLocaleString("en-US")])}
            empty="no journal rows today" />
        </div>
        <div>
          <Sub>by reason — why it acted or skipped</Sub>
          <Table testid="by-reason" head={["kind · reason", "rows"]}
            rows={byReason.map(([k, r, n]) => [`${k} · ${r}`, n.toLocaleString("en-US")])}
            empty="no reasons recorded today" />
        </div>
      </div>
    </Section>
  );
}

function InPlay({ d, now }: { d: Obj; now: number }) {
  const p = obj(d.in_play) ?? {};
  const t = obj(d.in_play_trading) ?? {};
  const tp = obj(t.pnl) ?? {};
  const shocks = rowsOf(t.shocks_today);
  const strat = inPlayStrategy(t);
  return (
    <Section id="inplay" title="In play"
      note="Positions in fixtures that have kicked off and not settled — the halts count them at cost until they settle — and, when in-play trading is on, the resting maker orders it places in play and why it skipped or was refused.">
      <Grid>
        <Stat k="positions" v={count(p.positions)}
          sub={`marked ${count(p.marked)} · unmarked ${count(p.unmarked)}`} />
        <Stat k="cost" v={money(p.cost)} />
        <Stat k="live mark total" v={money(p.live_mark_total)} />
        <Stat k="last live update" v={clock(p.last_live_update_at, now)} />
      </Grid>
      <Sub>in-play trading</Sub>
      <p className="mb-2 font-mono text-[11px] text-ink-faint">
        strategy{" "}
        <span data-testid="inplay-strategy" className="text-ink-hi">
          {strat.label ?? NOT_SERVED}
        </span>
      </p>
      {strat.lag && (
        <p data-testid="inplay-strategy-note"
          className="-mt-1 mb-2 font-mono text-[10px] text-warn">
          this backend&apos;s status labels in-play trading
          &ldquo;{strat.sent ?? "nothing"}&rdquo;, but its in-play v2 block
          says the newest in-play tick ran {strat.label}
        </p>
      )}
      <Grid>
        <Stat k="enabled" v={flag(t.enabled)} />
        <Stat k="active" v={flag(t.active)} sub={`outcome ${text(t.outcome)}`} />
        <Stat k="feed" v={t.feed_healthy === true ? "healthy"
          : t.feed_healthy === false ? "unhealthy" : ABSENT}
          tone={t.feed_healthy === false ? "warn" : "hi"}
          sub={`available ${flag(t.feed_available)} · subs ${count(t.feed_subscriptions)}`} />
        <Stat k="legs in play" v={count(t.legs_in_play)} />
        <Stat k="cool-downs active" v={count(t.cooldowns_active)}
          sub={`global ${flag(t.global_cooldown)}`} />
        <Stat k="in-play orders open" v={count(t.orders_open)} />
        <Stat k="placed / cancelled today"
          v={`${count(t.placed_today)} / ${count(t.cancelled_today)}`} />
        <Stat k="in-play P&L settled" v={money(tp.settled, true)}
          tone={pnlTone(tp.settled)}
          sub={`cost ${money(tp.cost)} · share ${text(tp.share_of_agent_pnl)}`} />
      </Grid>
      <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
        <div>
          <Sub>why in-play legs were skipped today (UTC day)</Sub>
          <Reasons testid="inplay-skips"
            block={inPlayReasons(t.v2, "skipped_by_reason_today", "skips")}
            empty="no in-play skips recorded today" />
        </div>
        <div>
          <Sub>refused by the risk engine in play today</Sub>
          <Reasons testid="inplay-refusals"
            block={inPlayReasons(t.v2, "refused_by_reason_today", "refusals")}
            empty="no in-play refusals recorded today" />
        </div>
      </div>
      <Sub>in play, every competition</Sub>
      <InPlayByComp v={t.by_competition} />
      <Sub>shocks today, by kind</Sub>
      <Table testid="shocks" head={["kind", "count"]}
        rows={shocks.map(([k, n]) => [k, n])} empty="no shocks today" />
      <Sub>in-play v2 · live stats, pressure entries, protective exits</Sub>
      <InPlayV2 v={obj(t.v2)} now={now} />
    </Section>
  );
}

/** A DAY'S IN-PLAY REASONS (status `in_play_trading.v2.*_by_reason_today`):
 *  the backend's plain words, the code beneath them, the count beside —
 *  largest first. Not served is said as not served; served and empty is
 *  "none today". */
function Reasons({ block, testid, empty }: {
  block: ReasonsBlock; testid: string; empty: string;
}) {
  if ("notServed" in block) {
    return (
      <p data-testid={testid} data-served="false"
        className="font-mono text-[11px] text-ink-faint">
        {block.notServed}
      </p>
    );
  }
  if (block.rows.length === 0) {
    return (
      <p data-testid={testid} className="font-mono text-[11px] text-ink-faint">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table data-testid={testid} className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {["reason", "count"].map((h, i) => (
              <th key={h} scope="col"
                className={`border-b border-line pb-1 font-mono font-normal uppercase tracking-[0.12em] text-[10px] text-ink-faint ${
                  i === 0 ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((r) => (
            <tr key={r.code} data-testid="inplay-reason-row" data-code={r.code}
              data-words={r.from} className="border-b border-line/50">
              <td className="py-1 pr-2 text-left align-top">
                <span className="block break-words text-ink-mid">{r.words}</span>
                <span className="block break-all font-mono text-[10px] text-ink-faint">
                  {r.code}
                </span>
              </td>
              <td data-testid="inplay-reason-count"
                className="py-1 pl-2 text-right align-top font-mono tabular-nums text-ink-hi">
                {count(r.n)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** IN PLAY, EVERY COMPETITION (status `in_play_trading.by_competition`):
 *  the eleven focus competitions in the registry's order, then any other
 *  the backend names. What the backend did not send reads "not served
 *  yet", never 0. */
function InPlayByComp({ v }: { v: unknown }) {
  const b = inPlayByCompetition(v);
  return (
    <>
      {b.failed && (
        <p className="mb-1 font-mono text-[11px] text-warn">
          the per-competition in-play counts failed on the backend: {b.failed}
        </p>
      )}
      <div className="overflow-x-auto">
        <table data-testid="inplay-by-comp" data-served={b.served}
          className="w-full border-collapse font-mono text-xs tabular-nums">
          <thead>
            <tr>
              {["competition", "legs in play", "skipped", "refused", "placed"].map((h, i) => (
                <th key={h} scope="col"
                  className={`border-b border-line pb-1 font-normal uppercase tracking-[0.12em] text-[10px] text-ink-faint ${
                    i === 0 ? "text-left" : "text-right"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r) => (
              <tr key={r.competition} data-testid="inplay-comp-row"
                data-comp={r.competition} className="border-b border-line/50">
                <td className="py-1 pr-2 text-left font-sans text-ink-mid">{r.label}</td>
                {r.counts === null ? (
                  <td colSpan={4} className="py-1 pl-2 text-right text-ink-faint">
                    {NOT_SERVED}
                  </td>
                ) : (
                  [r.counts.legs, r.counts.skipped, r.counts.refused,
                    r.counts.placed].map((n, i) => (
                    <td key={i} className={`py-1 pl-2 text-right ${
                      n === null ? "text-ink-faint" : "text-ink-hi"}`}>
                      {n === null ? NOT_SERVED : n.toLocaleString("en-US")}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** IN-PLAY V2 (status `in_play_trading.v2`): aggregates only. */
function InPlayV2({ v, now }: { v: Obj | null; now: number }) {
  if (!v) {
    return (
      <p data-testid="inplay-v2-absent" className="font-mono text-[11px] text-ink-faint">
        in-play v2 is not on this backend
      </p>
    );
  }
  return (
    <div data-testid="inplay-v2">
      {typeof v.error === "string" && (
        <p className="mb-2 font-mono text-[11px] text-warn">
          the in-play v2 summary failed on the backend: {v.error}
        </p>
      )}
      <Grid>
        <Stat k="v2 enabled" v={flag(v.enabled)} sub={`strategy ${text(v.strategy)}`} />
        <Stat k="v2 active" v={flag(v.active)} sub={`as of ${clock(v.at, now)}`} />
        <Stat k="legs with a live-stat read" v={count(v.informed_available_legs)}
          sub={`mean w ${fixed(v.w_mean)}`} />
        <Stat k="pressure entries today"
          v={`${count(v.entries_placed_today)} placed`}
          sub={`${count(v.entries_cancelled_today)} cancelled`} />
        <Stat k="exits placed today" v={count(v.exits_placed_today)} />
        <Stat k="protective exits today"
          v={`${count(v.protective_exits_placed_today)} placed`}
          sub={`${count(v.protective_exits_refused_today)} refused · ${count(v.protective_exits_cancelled_today)} cancelled`} />
        <Stat k="+5-min marks today" v={count(v.marks_today)} sub="journal only" />
        <Stat k="mean in-play CLV" v={cents(v.mean_inplay_clv_c)}
          sub={nOf(v.inplay_clv_rewards, "reward")} />
        <Stat k="mean exit reward" v={cents(v.mean_exit_reward_c)}
          sub={`${nOf(v.exit_rewards, "reward")} · P&L rewards ${count(v.pnl_rewards)}`} />
        {"anchor_rewards" in v && (
          <Stat k="mean anchor reward" v={cents(v.mean_anchor_reward_c)}
            sub={`${nOf(v.anchor_rewards, "reward")} · w on our forecast, learned`} />
        )}
      </Grid>
      <ArmsInUse v={v.arms_in_use} testid="inplay-v2-arms"
        title="in-play arms in use on the newest tick (entry, exit, anchor)" />
    </div>
  );
}

/** THE LEARNER'S ARMS IN USE, if the backend sends them. Read in the
 *  route's shape — `{at, <phase>: {competition: {"w/threshold": markets}}}`
 *  (phases pre_match, entry, exit) — and in two simpler ones: a list of
 *  `{context, arm | w + threshold, count}` and a `{name: {w, threshold,
 *  count}}` block. Drawn as sent; absent, nothing is claimed. */
function ArmsInUse({ v, testid, title }: {
  v: unknown; testid: string; title: string;
}) {
  if (v === undefined || v === null) return null;
  let rows: (string | number)[][] = [];
  let error: string | null = null;
  const o = obj(v);
  const phased = o !== null && Object.entries(o).some(([k, x]) =>
    k !== "at" && k !== "error" && obj(x) !== null
    && Object.values(obj(x)!).every((y) => obj(y) !== null));
  if (o && typeof o.error === "string") error = o.error;
  if (Array.isArray(v)) {
    rows = v.map((a) => {
      const r = obj(a) ?? {};
      const arm = Array.isArray(r.arm) ? r.arm : null;
      const ctx = Array.isArray(r.context) ? r.context.map(text).join(" · ")
        : text(r.context ?? r.competition);
      return [ctx,
        `w ${text(r.w ?? arm?.[0])} · t ${text(r.threshold ?? arm?.[1])}`,
        count(r.count ?? r.ticks ?? r.n)];
    });
  } else if (o && phased) {
    for (const [phase, byComp] of Object.entries(o)) {
      const bc = obj(byComp);
      if (phase === "at" || phase === "error" || !bc) continue;
      for (const [comp, arms] of Object.entries(bc)) {
        for (const [label, n] of Object.entries(obj(arms) ?? {})) {
          rows.push([`${phase.replace(/_/g, "-")} · ${compLabel(comp)}`,
            label, count(n)]);
        }
      }
    }
  } else if (o) {
    rows = Object.entries(o).filter(([k, a]) => k !== "at" && k !== "error"
      && a !== null && a !== undefined)
      .map(([k, a]) => {
        const r = obj(a);
        return [k, r ? `w ${text(r.w)} · t ${text(r.threshold)}` : text(a),
          r ? count(r.count ?? r.ticks ?? r.n) : ABSENT];
      });
  }
  return (
    <>
      <Sub>{title}</Sub>
      {error && (
        <p className="mb-1 font-mono text-[11px] text-warn">
          the arms read failed on the backend: {error}
        </p>
      )}
      <Table testid={testid} head={["phase · competition", "arm (w/threshold)", "markets"]}
        rows={rows} empty="no arm was drawn on the newest tick" />
    </>
  );
}

/** HAND-OVER AGGREGATES: the status route's `handover` block (handed
 *  over, managed and manual contracts, markets, clips, today's
 *  risk-lowering closes), or — on a backend before it — the top-level
 *  handed_over_contracts / managed_markets / risk_lowering_closes_today /
 *  managed_at. Counts only. */
function Handover({ d, now }: { d: Obj; now: number }) {
  const keys = ["handed_over_contracts", "managed_markets",
    "risk_lowering_closes_today", "managed_at"];
  const h: Obj | null = obj(d.handover)
    ?? (carries(d, keys) ? { ...d, at: d.managed_at } : null);
  return (
    <Section id="handover" title="Hand-over"
      note="Contracts you handed to the trader, what it manages, what stays yours, and the closes that went over a cap because they lowered risk. Experimental, unproven.">
      {!h ? (
        <p data-testid="handover-absent" className="font-mono text-[11px] text-ink-faint">
          hand-over numbers are not on this backend
        </p>
      ) : (
        <>
          {typeof h.closes_error === "string" && (
            <p className="mb-2 font-mono text-[11px] text-warn">
              today&apos;s risk-lowering closes could not be counted: {h.closes_error}
            </p>
          )}
          <Grid>
            <Stat k="handed-over contracts" v={count(h.handed_over_contracts)}
              sub={"handed_markets" in h ? `in ${count(h.handed_markets)} markets` : undefined} />
            <Stat k="managed contracts" v={count(h.managed_contracts)}
              sub={`in ${count(h.managed_markets)} markets`} />
            <Stat k="yours (manual) contracts" v={count(h.manual_contracts)} />
            <Stat k="risk-lowering closes today" v={count(h.risk_lowering_closes_today)} />
            <Stat k="clips" v={count(h.clips)}
              sub={`pending ${count(h.clips_pending)} · sold outside the trader`} />
            <Stat k="as of" v={clock(h.at, now)}
              sub={typeof h.outcome === "string" ? `reconcile ${h.outcome}` : undefined} />
          </Grid>
        </>
      )}
    </Section>
  );
}

/** WHAT EACH SETTLEMENT-READ OUTCOME MEANS (src/trading/agent.py
 *  journal_settlements). An unsettled market is valued at 0 by the
 *  halts: a win is never assumed. */
const SETTLEMENT_WORDS: [string, string][] = [
  ["settled", "settled — the account's settlement data gave one yes/no result"],
  ["not_listed", "not listed yet — Kalshi has no settlement row for it; asked again later"],
  ["unknown_result", "unclear result — not one clean yes/no; left unsettled"],
  ["refused", "read refused — asked again later"],
];
/** keys of a settlement block that are not outcome counts */
const SETTLEMENT_META = new Set(["outcome", "at", "due", "asked", "today",
  "label", "basis", "version", "window_ticks", "window_since", "passes",
  "latest", "settled_rows_today", "error"]);
const PASS_WORDS: Record<string, string> = {
  read: "asked Kalshi", nothing_held: "nothing held awaits a result",
  error: "the read raised",
};

/** SETTLEMENT READS AND FILL READS (ops T5 on the status route). Read in
 *  the route's shape — `settlement_reads: {window_ticks, window_since, due,
 *  asked, settled, not_listed, unknown_result, refused (summed over the
 *  window), passes, latest: {outcome, due, asked, …, at},
 *  settled_rows_today}` and `fill_reads: {total, today, unreadable,
 *  unreadable_today, by_terms_basis, by_direction_basis,
 *  legacy_words_disagreed}` — and in a flat one (the newest pass's counts
 *  at the top, `today` beside them; `unreadable_fills` a number or
 *  `{today, total}`). Counts only: no market is named. A block the backend
 *  does not send says so; a block that failed on the backend says that. */
function Settlements({ d, now }: { d: Obj; now: number }) {
  const s = obj(d.settlement_reads);
  const latest = s ? obj(s.latest) : null;
  const today = s ? obj(s.today) : null;
  // the newest pass: the route's `latest`, or the flat block itself
  const pass: Obj | null = latest ?? (s && !("window_ticks" in s) ? s : null);
  const windowed = s !== null && "window_ticks" in s;
  const known = new Set(SETTLEMENT_WORDS.map(([k]) => k));
  const extra = s ? Object.keys(s).filter((k) => !known.has(k)
    && !SETTLEMENT_META.has(k) && num(s[k]) !== null).sort() : [];
  const head = ["outcome", "last read",
    ...(windowed ? [`last ${count(s!.window_ticks)} ticks`] : []),
    ...(today ? ["today"] : [])];
  const cells = (k: string) => [count(pass?.[k]),
    ...(windowed ? [count(s![k])] : []), ...(today ? [count(today[k])] : [])];
  const passes = s ? obj(s.passes) : null;
  const fr = obj(d.fill_reads);
  const uf = d.unreadable_fills;
  const ufo = obj(uf);
  return (
    <Section id="settlements" title="Settlement reads"
      note="Held markets that stopped trading are asked for their result from the account's settlement data. Until one clean yes/no comes back the halts value them at 0 — a win is never assumed. Experimental, unproven.">
      {!s ? (
        <p data-testid="settlements-absent" className="font-mono text-[11px] text-ink-faint">
          settlement-read outcomes are not on this backend
        </p>
      ) : (
        <>
          {typeof s.error === "string" && (
            <p data-testid="settlements-error" className="mb-2 font-mono text-[11px] text-warn">
              the settlement-read summary failed on the backend: {s.error}
            </p>
          )}
          <Grid>
            <Stat k="last read"
              v={pass ? PASS_WORDS[text(pass.outcome)] ?? text(pass.outcome) : ABSENT}
              sub={`as of ${clock(pass?.at ?? s.at, now)}`} />
            <Stat k="due a read" v={count(pass?.due)}
              sub={windowed ? `${count(s.due)} over the window` : undefined} />
            <Stat k="asked on the last read" v={count(pass?.asked)}
              sub={windowed ? `${count(s.asked)} over the window` : undefined} />
            {"settled_rows_today" in s && (
              <Stat k="settled rows today" v={count(s.settled_rows_today)} />
            )}
          </Grid>
          {windowed && (
            <p className="mt-2 font-mono text-[10px] text-ink-faint">
              window: the last {count(s.window_ticks)} ticks, since {clock(s.window_since, now)}
              {passes ? ` · passes ${Object.entries(passes)
                .map(([k, n]) => `${PASS_WORDS[k] ?? k} ${count(n)}`).join(" · ")}` : ""}
            </p>
          )}
          <Sub>outcomes</Sub>
          <Table testid="settlement-outcomes" words head={head}
            rows={[
              ...SETTLEMENT_WORDS.map(([k, words]) => [words, ...cells(k)]),
              ...extra.map((k) => [k, ...cells(k)]),
            ]}
            empty="no outcomes recorded" />
        </>
      )}
      <Sub>fill reads</Sub>
      <div data-testid="unreadable-fills" className="font-mono text-xs text-ink-hi">
        {fr ? (
          typeof fr.error === "string" ? (
            <p className="text-warn">the fill-read summary failed on the backend: {fr.error}</p>
          ) : (
            <>
              <p>
                unreadable: {count(fr.unreadable_today)} today · {count(fr.unreadable)} in all
                <span className="text-ink-faint">
                  {" "}(of {count(fr.today)} fills today · {count(fr.total)} in all)
                </span>
              </p>
              {num(fr.legacy_words_disagreed) !== null && num(fr.legacy_words_disagreed)! > 0 && (
                <p className="text-warn">
                  {count(fr.legacy_words_disagreed)} fill rows carried legacy words that disagreed with the canonical fields
                </p>
              )}
              <Table testid="fill-terms" head={["how the terms were decided", "fills"]}
                rows={rowsOf(fr.by_terms_basis).map(([k, n]) => [k, n.toLocaleString("en-US")])}
                empty="no fills recorded" />
            </>
          )
        ) : uf === undefined ? (
          <p className="text-ink-faint">not on this backend</p>
        ) : (
          <p>
            unreadable: {ufo
              ? `${count(ufo.today)} today · ${count(ufo.total)} in all`
              : count(uf)}
          </p>
        )}
        <p className="mt-1 text-[10px] text-ink-faint">
          a fill whose venue fields could not be read takes its own order&apos;s
          side and price, and is counted here
        </p>
      </div>
    </Section>
  );
}

function Learning({ l, now }: { l: Obj; now: number }) {
  const trades = obj(l.trades_by_competition) ?? {};
  const fills = obj(l.fills_rewarded_by_competition) ?? {};
  const clv = obj(l.mean_clv_c_by_competition) ?? {};
  const best = obj(l.best_arm_by_competition) ?? {};
  // EVERY FOCUS COMPETITION IS A ROW: the backend's `competitions` list
  // (in its order) first, then any other the counts name
  const listed = Array.isArray(l.competitions)
    ? l.competitions.filter((c): c is string => typeof c === "string") : [];
  const comps = [...new Set([...listed, ...[...new Set([
    ...Object.keys(trades), ...Object.keys(fills), ...Object.keys(clv),
    ...Object.keys(best)])].sort()])];
  /** a per-competition count: 0 when the backend sent the count map and it
   *  has no entry (it counts rows; none were counted), "—" when it sent no
   *  map at all */
  const tally = (m: unknown, c: string) => {
    const o = obj(m);
    return o === null ? ABSENT : c in o ? count(o[c]) : "0";
  };
  const dflt = obj(l.default_arm);
  // the ratings model's share of the model-priced markets (backend
  // learning.ratings_model, 2026-10-05): UNVALIDATED, said so
  const rm = obj(l.ratings_model);
  return (
    <Section id="learning" title="Learning"
      note={`${text(l.label) === ABSENT ? "" : `${text(l.label)} · `}CLV is cents per contract after fees against the last stored mid before kickoff — a learning signal, not a result.`}>
      {typeof l.error === "string" && (
        <p className="mb-2 font-mono text-[11px] text-warn">
          the learner summary failed on the backend: {l.error}
        </p>
      )}
      <Grid>
        <Stat k="enabled" v={flag(l.enabled)} sub={`strategy ${text(l.strategy)}`} />
        <Stat k="mean CLV" v={cents(l.mean_clv_c)} />
        <Stat k="model-priced markets" v={count(l.model_priced_markets)}
          sub={`fixtures ${count(l.model_priced_fixtures)} · model-only ${count(l.model_only_markets)}`} />
        <Stat k="candidates" v={count(l.candidates)} sub={`as of ${clock(l.at, now)}`} />
        {rm && (
          <Stat k="ratings model · unvalidated"
            v={`${count(rm.priced_markets)} markets`}
            sub={`fixtures ${count(rm.priced_fixtures)} · ${text(rm.version)} · ${text(rm.label)}`} />
        )}
        <Stat k="default arm"
          v={dflt ? `w ${text(dflt.w)} · t ${text(dflt.threshold)}` : ABSENT}
          sub="where every context starts" />
      </Grid>
      {typeof l.reward_basis === "string" && (
        <p data-testid="learning-basis" className="mt-2 font-mono text-[10px] text-ink-faint">
          reward: {l.reward_basis}
        </p>
      )}
      <ArmsInUse v={l.arms_in_use} testid="learning-arms"
        title="arms in use on the newest tick (pre-match)" />
      <Sub>by competition</Sub>
      <Table testid="learning-comps"
        head={["competition", "trades", "fills", "mean CLV", "best arm"]}
        rows={comps.map((c) => {
          const b = obj(best[c]);
          return [compLabel(c), tally(l.trades_by_competition, c),
            tally(l.fills_rewarded_by_competition, c), cents(clv[c]),
            b ? `w ${text(b.w)} · t ${text(b.threshold)} · ${cents(b.posterior_mean_c)}`
              : "prior only"];
        })}
        empty="no trades or fills recorded by competition yet" />
    </Section>
  );
}

function Catalogue({ d, now }: { d: Obj; now: number }) {
  const u = obj(d.universe);
  if (!u) {
    return (
      <Section id="catalogue" title="Catalogue coverage">
        <p className="font-mono text-[11px] text-ink-faint">
          no coverage block on record
        </p>
      </Section>
    );
  }
  const cat = obj(u.catalogue) ?? {};
  return (
    <Section id="catalogue" title="Catalogue coverage"
      note={`as of ${clock(d.universe_at, now)}`}>
      {typeof u.error === "string" && (
        <p className="mb-2 font-mono text-[11px] text-warn">
          the coverage read failed on the tick: {u.error}
        </p>
      )}
      <Grid>
        <Stat k="known" v={count(u.known)} sub={`in scope ${count(u.in_scope)}`} />
        <Stat k="priced" v={count(u.priced)} />
        <Stat k="eligible" v={count(u.eligible)} />
        <Stat k="catalogue rows" v={`${count(cat.rows)} / ${count(cat.max_rows)}`}
          sub={`full refresh ${clock(cat.last_full_refresh_at, now)}`} />
      </Grid>
      <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
        <div>
          <Sub>refusals by reason</Sub>
          <Table testid="refusals" head={["reason", "markets"]}
            rows={rowsOf(u.refusals_by_reason).map(([k, n]) => [k, n.toLocaleString("en-US")])}
            empty="no refusals recorded" />
        </div>
        <div>
          <Sub>unmapped fixtures / no fair price, by why</Sub>
          <Table head={["why", "markets"]}
            rows={[
              ...rowsOf(u.fixture_unmapped_by_why).map(([k, n]) =>
                [`unmapped · ${k}`, n.toLocaleString("en-US")]),
              ...rowsOf(u.no_fair_price_by_why).map(([k, n]) =>
                [`no price · ${k}`, n.toLocaleString("en-US")]),
            ]}
            empty="none recorded" />
        </div>
      </div>
    </Section>
  );
}

function HowToStop() {
  return (
    <section data-testid="ops-stop"
      className="rounded-2xl border border-dashed border-line-strong p-4 text-sm leading-relaxed text-ink-mid">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        How to stop it
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Set <code className="font-mono text-ink-hi">TRADING_KILL=true</code> on
          the Railway backend service. The next tick places nothing.
        </li>
        <li>Or delete the agent&apos;s Kalshi API key in Kalshi&apos;s settings.</li>
      </ul>
      <p className="mt-2 text-xs text-ink-faint">
        This page cannot place, cancel or stop anything. The one thing it
        changes is which of your positions the trader may manage.
      </p>
    </section>
  );
}

// --------------------------------------------------------------- page

export default function TradingConsole() {
  // the TAB's token, shared with the board (components/OperatorToken.tsx)
  const [token, setToken] = useOperatorToken();
  const typed = token.trim();
  // ARRIVING WITH A TOKEN IS NOT TYPING ONE. A token already held when
  // the page mounts (the board's, carried by the Trading chip) is armed
  // from the first render, so the first read goes out at once — one
  // request, not one after a debounce for a token nobody is typing.
  const [armed, setArmed] = useState(typed);
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ data: Obj; at: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // A REAL DEBOUNCE: every keystroke restarts the clock, so a half-typed
  // token is never sent. Clearing the field disarms at once and drops
  // what was read with the old token (in the change handler below). On
  // arrival with a held token this re-arms the same string, which
  // changes nothing and asks nothing.
  useEffect(() => {
    if (typed === "") return;
    const t = setTimeout(() => setArmed(typed), TOKEN_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [typed]);
  const onToken = (v: string) => {
    setToken(v);
    if (v.trim() === "") {
      setArmed("");
      setRead({ kind: "idle" });
      setLast(null);
    }
  };

  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch("/api/ops/trading-status", {
      headers: { "x-admin-token": armed }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try {
      body = await r.json();
    } catch (err) {
      // a 403 or a 503 is named by its status alone; any other answer
      // that is not JSON is named as exactly that
      if (r.status !== 403 && r.status !== 503) {
        setRead({ kind: "error", status: r.status,
          detail: `the answer was not JSON (${String(err)})` });
        return "failed";
      }
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body)) {
      const at = Date.now();
      setRead({ kind: "ok", data: body, at });
      setLast({ data: body, at });
      setNow(at);
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    if (r.status === 503) {
      setRead({ kind: "not_ready", detail });
      return "failed";
    }
    setRead({ kind: "error", status: r.status, detail });
    return "failed";
  }, POLL_MS, [armed], armed !== "");

  // the age of what is on screen, ticking only while something is
  useEffect(() => {
    if (!last) return;
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, [last]);

  const age = last ? now - last.at : 0;
  const stale = last !== null && (read.kind !== "ok" || age > STALE_MS);
  const d = last?.data;
  const learning = d ? obj(d.learning) : null;

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head>
        <title>Trading console · namson.dev</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <RouteProgress />
      {/* THE WAY BACK TO EVERYTHING (Son, 2026-10-03): the logo goes
          home and the field link to the field, as on every page; the
          back arrow and the chips go to the board, the leagues and the
          field. The Trading chip itself is TopBar's, drawn — and lit as
          this page — only while the tab holds a token. */}
      <TopBar back={{ href: "/bet-suggester", label: "board" }}
        title="trading console">
        <NavChip href="/bet-suggester">board</NavChip>
        <NavChip href="/bet-suggester/leagues">leagues</NavChip>
        <NavChip href="/bet-suggester/ratings">field</NavChip>
      </TopBar>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-5">
        <Eyebrow tone="warn">operator · experimental, unproven</Eyebrow>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-hi">
          Trading console
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-low">
          What the trading agent is doing, from its own journal, and every
          open position and order on the account — refreshed every 15
          seconds while a token is held. Not advice; no edge is claimed.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label htmlFor="watch-token" className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              operator token
            </span>
            <input id="watch-token" type="password" value={token}
              autoComplete="off" spellCheck={false}
              onChange={(e) => onToken(e.target.value)}
              className="w-56 max-w-full rounded-md border border-line bg-elev px-2 py-1 font-mono text-[12px] text-ink-hi outline-none transition-colors hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent" />
          </label>
          <span data-testid="ops-state" className="font-mono text-[11px] text-ink-faint">
            {armed === "" ? "held in this tab only — a reload forgets it"
              : read.kind === "idle" ? "reading…"
              : last ? `last updated ${new Date(last.at).toLocaleTimeString()}`
                + (stale ? ` · stale, ${ago(age)} old` : "")
              : ""}
          </span>
        </div>

        {read.kind === "refused" && (
          <p data-testid="ops-refused" role="alert"
            className="mt-4 rounded-xl border border-neg/40 px-3 py-2 font-mono text-[12px] text-neg">
            token rejected — the backend refused it ({read.detail})
          </p>
        )}
        {read.kind === "not_ready" && (
          <p data-testid="ops-not-ready" role="alert"
            className="mt-4 rounded-xl border border-warn/40 px-3 py-2 font-mono text-[12px] text-warn">
            trading plane not ready — {read.detail}
          </p>
        )}
        {read.kind === "error" && (
          <p data-testid="ops-error" role="alert"
            className="mt-4 rounded-xl border border-warn/40 px-3 py-2 font-mono text-[12px] text-warn">
            the status read failed (HTTP {read.status}) — {read.detail}
          </p>
        )}

        {d && (
          <div data-testid="ops-console" data-stale={stale || undefined}
            className={`mt-6 space-y-4 transition-opacity ${stale ? "opacity-50" : ""}`}>
            <TopStrip d={d} now={now} />
            {/* read only once the status answered: a refused or not-ready
                plane is not asked for its book */}
            <TradingBook token={armed} />
            <TradingCandidates token={armed} />
            <Money d={d} now={now} />
            <Activity d={d} />
            <InPlay d={d} now={now} />
            <Handover d={d} now={now} />
            {learning && <Learning l={learning} now={now} />}
            <Settlements d={d} now={now} />
            <Catalogue d={d} now={now} />
            <p className="font-mono text-[10px] text-ink-faint">
              {text(d.version)} · generated {clock(d.generated_at, now)}
            </p>
          </div>
        )}

        {armed !== "" && <div className="mt-4"><HowToStop /></div>}
      </main>
    </div>
  );
}

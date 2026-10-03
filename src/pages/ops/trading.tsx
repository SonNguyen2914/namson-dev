// /ops/trading — THE OPERATOR'S TRADING CONSOLE (basic, typed token).
//
// Son, 2026-10-03: "I need to track what the trader doing." This page
// reads ONE route, /api/ops/trading-status, which relays the backend's
// operator-gated `GET /api/admin/trading/status` — aggregates only:
// counts, dollar sums, flags and clocks. No ticker, fixture or order id
// is on the payload, so none can be on this page.
//
// THE TOKEN (option A). Typed into a password field and held in React
// state ONLY — never localStorage, sessionStorage, a cookie, an env var
// or the bundle. A reload forgets it. Without one the page shows the
// field and makes no request at all. (Option B, a signed-in cookie, is
// later work.)
//
// THE POLL. Every 15 s while a token is held, through lib/usePoll: no
// overlap, nothing while the tab is hidden, backoff after failures. A 403
// stops the poll until the token changes. The last good read stays on
// screen after a failed one, dimmed with its age, never presented as
// current.
//
// UNLINKED. No nav chip points here; it is bookmark-only, and noindex.
//
// EXPERIMENTAL, UNPROVEN. The agent's numbers are its own bookkeeping
// of a small, capped experiment. Nothing on this page is advice and
// nothing here is evidence of an edge.
import Head from "next/head";
import { useEffect, useState, type ReactNode } from "react";
import { TopBar } from "../../components/chrome";
import { Eyebrow } from "../../components/ui";
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

function Table({ head, rows, empty, testid }: {
  head: string[]; rows: (string | number)[][]; empty: string; testid?: string;
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
                  ? "break-all pr-2 text-left text-ink-mid" : "pl-2 text-right text-ink-hi"}`}>
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
  return (
    <Section id="inplay" title="In play"
      note="Positions in fixtures that have kicked off and not settled. The halts count them at cost until they settle.">
      <Grid>
        <Stat k="positions" v={count(p.positions)}
          sub={`marked ${count(p.marked)} · unmarked ${count(p.unmarked)}`} />
        <Stat k="cost" v={money(p.cost)} />
        <Stat k="live mark total" v={money(p.live_mark_total)} />
        <Stat k="last live update" v={clock(p.last_live_update_at, now)} />
      </Grid>
      <Sub>in-play trading · {text(t.strategy)}</Sub>
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
      <Sub>shocks today, by kind</Sub>
      <Table testid="shocks" head={["kind", "count"]}
        rows={shocks.map(([k, n]) => [k, n])} empty="no shocks today" />
    </Section>
  );
}

function Learning({ l, now }: { l: Obj; now: number }) {
  const trades = obj(l.trades_by_competition) ?? {};
  const fills = obj(l.fills_rewarded_by_competition) ?? {};
  const clv = obj(l.mean_clv_c_by_competition) ?? {};
  const best = obj(l.best_arm_by_competition) ?? {};
  const comps = [...new Set([...Object.keys(trades), ...Object.keys(fills),
    ...Object.keys(clv), ...Object.keys(best)])].sort();
  const cents = (v: unknown) => {
    const n = num(v);
    return n === null ? ABSENT : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}¢`;
  };
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
      </Grid>
      <Sub>by competition</Sub>
      <Table testid="learning-comps"
        head={["competition", "trades", "fills", "mean CLV", "best arm"]}
        rows={comps.map((c) => {
          const b = obj(best[c]);
          return [c, count(trades[c]), count(fills[c]), cents(clv[c]),
            b ? `w ${text(b.w)} · t ${text(b.threshold)} · ${cents(b.posterior_mean_c)}`
              : ABSENT];
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
        This page is read-only: it cannot place, cancel or stop anything.
      </p>
    </section>
  );
}

// --------------------------------------------------------------- page

export default function TradingConsole() {
  const [token, setToken] = useState("");
  const [armed, setArmed] = useState("");
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ data: Obj; at: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // A REAL DEBOUNCE: every keystroke restarts the clock, so a half-typed
  // token is never sent. Clearing the field disarms at once and drops
  // what was read with the old token (in the change handler below).
  useEffect(() => {
    if (token === "") return;
    const t = setTimeout(() => setArmed(token), TOKEN_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [token]);
  const onToken = (v: string) => {
    setToken(v);
    if (v === "") {
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
      <TopBar title="trading console" />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-5">
        <Eyebrow tone="warn">operator · experimental, unproven</Eyebrow>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-hi">
          Trading console
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-low">
          What the trading agent is doing, from its own journal: aggregates
          only, read-only, refreshed every 15 seconds while a token is held.
          Not advice; no edge is claimed.
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
            <Money d={d} now={now} />
            <Activity d={d} />
            <InPlay d={d} now={now} />
            {learning && <Learning l={learning} now={now} />}
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

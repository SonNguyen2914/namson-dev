// SYSTEM (redesign, 2026-10-07): the raw diagnostics, dense — the journal's
// activity today by kind and reason (raw codes beside the backend's plain
// words), the settlement and fill reads, the catalogue's coverage funnel
// (exactly the four stages the backend counts: known → in scope → priced →
// eligible), why markets were refused, unmapped or unpriced, the journal's
// retention, every block's own clock, and the versions. Human description
// first; the raw code is always beside it.
import type { ReactNode } from "react";
import { GROUP_LABEL, codeWords, reasonGroup, reasonTag } from "../../lib/consoleModel";
import { type Candidates, isObj, num, str } from "../../lib/tradingConsole";
import { items as line, plain, warn } from "./summaries";
import {
  BarList, DASH, InfoNote, KV, Metric, Panel, SimpleTable, SubHead, Tech, agoIso, count, when,
} from "./primitives";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);
const text = (v: unknown) => (v === null || v === undefined || v === "" ? DASH : typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : JSON.stringify(v));

/** A {key: n} block as rows, largest first. */
function rowsOf(v: unknown): [string, number][] {
  const o = obj(v);
  if (!o) return [];
  return Object.entries(o).map(([k, n]) => [k, num(n) ?? 0] as [string, number])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const Code = ({ c }: { c: string }) => <Tech tone="text-ink-mid">{c}</Tech>;
/** a code with the backend's plain words one hover away (title) */
const CodeW = ({ c, prefix = "" }: { c: string; prefix?: string }) => {
  const w = codeWords(c);
  return <Tech tone="text-ink-hi" title={w ? `${w} (${c})` : c}>{prefix}{c}</Tech>;
};

// ------------------------------------------------------------- activity

function Activity({ d }: { d: Obj }) {
  const today = obj(d.today) ?? {};
  const byKind = rowsOf(today.by_kind);
  const byReason: [string, string, number][] = [];
  for (const [kind, reasons] of Object.entries(obj(today.by_reason) ?? {})) {
    for (const [reason, n] of rowsOf(reasons)) byReason.push([kind, reason, n]);
  }
  byReason.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  const day = obj(d.trading_day);
  return (
    <Panel testid="ops-activity" title="Journal today" cid="journal"
      summary={line(plain(`${count(d.placed_today)} placed`), plain(`${count(d.fills_today)} fills`),
        plain(`${byKind.reduce((n, [, k]) => n + k, 0).toLocaleString("en-US")} rows`),
        byReason[0] ? plain(`top: ${byReason[0][0]} · ${byReason[0][1]} ${byReason[0][2].toLocaleString("en-US")}`) : null)}
      meta={`${str(day?.day) ?? "(UTC)"}${str(day?.tz) ? ` · ${str(day?.tz)}` : ""}`}
      info="Journal activity on the trading day. Hover a reason code for the backend's plain words.">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
        <Metric size="md" label="agent orders" value={count(d.open_agent_orders)} sub="Open agent orders" />
        <Metric size="md" label="manual orders" value={count(d.open_other_orders)} sub="Other (manual) open orders" />
        <Metric size="md" label="placed" value={count(d.placed_today)} sub="Orders placed today" />
        <Metric size="md" label="fills" value={count(d.fills_today)} sub="Fills today" />
      </div>
      <div className="mt-3 grid gap-x-8 gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <SubHead>Rows by kind</SubHead>
          <SimpleTable testid="by-kind" head={["kind", "rows"]} right={[1]} sortId="sys-by-kind"
            values={byKind.map(([k, n]) => [k, n])}
            rows={byKind.map(([k, n]) => [<Code key="k" c={k} />, n.toLocaleString("en-US")])}
            empty="no journal rows today" />
        </div>
        <div>
          <SubHead info="Why it acted or skipped: kind · raw code · group. Hover a code for the backend's plain words.">By reason</SubHead>
          <SimpleTable testid="by-reason" head={["kind · reason", "group", "rows"]} right={[2]} sortId="sys-by-reason"
            values={byReason.map(([k, r, n]) => [`${k} · ${r}`, k === "tick" ? "tick outcome" : GROUP_LABEL[reasonGroup(r)], n])}
            rows={byReason.map(([k, r, n]) => [
              <CodeW key="r" c={r} prefix={`${k} · `} />,
              <span key="g" className="text-[11.5px] text-ink-low">{k === "tick" ? "tick outcome" : GROUP_LABEL[reasonGroup(r)]}</span>,
              n.toLocaleString("en-US")])}
            empty="no reasons recorded today" />
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------- settlements

/** WHAT EACH SETTLEMENT-READ OUTCOME MEANS (src/trading/agent.py
 *  journal_settlements). An unsettled market is valued at 0 by the halts:
 *  a win is never assumed. */
const SETTLEMENT_WORDS: [string, string][] = [
  ["settled", "settled — the account's settlement data gave one yes/no result"],
  ["not_listed", "not listed yet — Kalshi has no settlement row for it; asked again later"],
  ["unknown_result", "unclear result — not one clean yes/no; left unsettled"],
  ["refused", "read refused — asked again later"],
];
const SETTLEMENT_META = new Set(["outcome", "at", "due", "asked", "today",
  "label", "basis", "version", "window_ticks", "window_since", "passes",
  "latest", "settled_rows_today", "error"]);
const PASS_WORDS: Record<string, string> = {
  read: "asked Kalshi", nothing_held: "nothing held awaits a result", error: "the read raised",
};

function Settlements({ d, now }: { d: Obj; now: number }) {
  void now;
  const s = obj(d.settlement_reads);
  const latest = s ? obj(s.latest) : null;
  const today = s ? obj(s.today) : null;
  const pass: Obj | null = latest ?? (s && !("window_ticks" in s) ? s : null);
  const windowed = s !== null && "window_ticks" in s;
  const known = new Set(SETTLEMENT_WORDS.map(([k]) => k));
  const extra = s ? Object.keys(s).filter((k) => !known.has(k) && !SETTLEMENT_META.has(k) && num(s[k]) !== null).sort() : [];
  const head = ["outcome", "last read", ...(windowed ? [`last ${count(s!.window_ticks)} ticks`] : []), ...(today ? ["today"] : [])];
  const cells = (k: string) => [count(pass?.[k]), ...(windowed ? [count(s![k])] : []), ...(today ? [count(today[k])] : [])];
  const passes = s ? obj(s.passes) : null;
  const fr = obj(d.fill_reads);
  const uf = d.unreadable_fills;
  const ufo = obj(uf);
  return (
    <Panel testid="ops-settlements" title="Settlement & fill reads" cid="settlements"
      summary={!s ? [plain("not on this backend")] : line(
        plain(`last read ${pass ? PASS_WORDS[text(pass.outcome)] ?? text(pass.outcome) : DASH}`),
        plain(`due ${count(pass?.due)}`),
        typeof s.error === "string" ? warn("settlement summary failed") : null,
        fr && typeof fr.error === "string" ? warn("fill summary failed") : null,
        (num(fr?.unreadable_today) ?? 0) > 0 ? warn(`${count(fr!.unreadable_today)} unreadable fills today`, "unreadable fills") : null,
        (num(fr?.legacy_words_disagreed) ?? 0) > 0 ? warn("legacy words disagree") : null,
      )}
      info="Held markets that stopped trading are asked for their result; until one clean yes/no comes back the halts value them at 0 — a win is never assumed.">
      {!s ? (
        <p data-testid="settlements-absent" className="text-[12px] text-ink-low">settlement-read outcomes are not on this backend</p>
      ) : (
        <>
          {typeof s.error === "string" && (
            <p data-testid="settlements-error" className="mb-2 text-[12px] text-warn">◆ settlement summary failed: {s.error}</p>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
            <Metric size="md" label="last read" value={pass ? PASS_WORDS[text(pass.outcome)] ?? text(pass.outcome) : DASH}
              sub={`As of ${when(pass?.at ?? s.at, true)}`} />
            <Metric size="md" label="due" value={count(pass?.due)} sub={`due a read${windowed ? ` · ${count(s.due)} over the window` : ""}`} />
            <Metric size="md" label="asked" value={count(pass?.asked)} sub={`asked on the last read${windowed ? ` · ${count(s.asked)} over the window` : ""}`} />
            {"settled_rows_today" in s && <Metric size="md" label="settled today" value={count(s.settled_rows_today)} sub="settled rows today" />}
          </div>
          {windowed && (
            <p className="mt-1.5 text-[11.5px] text-ink-low">
              window: the last {count(s.window_ticks)} ticks, since {when(s.window_since, true)}
              {passes ? ` · passes ${Object.entries(passes).map(([k, n]) => `${PASS_WORDS[k] ?? k} ${count(n)}`).join(" · ")}` : ""}
            </p>
          )}
          <div className="mt-2.5">
            <SubHead info={<>{SETTLEMENT_WORDS.map(([k, w]) => <span key={k} className="block">{w}</span>)}</>}>Outcomes</SubHead>
            <SimpleTable testid="settlement-outcomes" head={head} right={head.map((_, i) => i).slice(1)}
              rows={[...SETTLEMENT_WORDS.map(([k, w]) => [<span key="w" title={w}>{w.split(" — ")[0]}</span>, ...cells(k)]), ...extra.map((k) => [k, ...cells(k)])]}
              empty="no outcomes recorded" />
          </div>
        </>
      )}
      <div className="mt-3">
        <SubHead info="A fill whose venue fields could not be read takes its own order's side and price, and is counted here.">Fill reads</SubHead>
        <div data-testid="unreadable-fills" className="text-[12.5px] text-ink-hi">
          {fr ? (
            typeof fr.error === "string" ? (
              <p className="text-warn">◆ fill summary failed: {fr.error}</p>
            ) : (
              <>
                <p className="tc-num">
                  unreadable: <span className={(num(fr.unreadable_today) ?? 0) > 0 ? "text-warn" : ""}>{count(fr.unreadable_today)}</span> today · {count(fr.unreadable)} in all
                  <span className="text-ink-low"> (of {count(fr.today)} fills today · {count(fr.total)} in all)</span>
                </p>
                {num(fr.legacy_words_disagreed) !== null && num(fr.legacy_words_disagreed)! > 0 && (
                  <p className="text-warn">◆ {count(fr.legacy_words_disagreed)} fill rows carried legacy words that disagreed with the canonical fields</p>
                )}
                <div className="mt-2 grid gap-x-8 md:grid-cols-2">
                  <SimpleTable testid="fill-terms" head={["terms basis", "fills"]} right={[1]} sortId="sys-fill-terms"
                    values={rowsOf(fr.by_terms_basis).map(([k, n]) => [k, n])}
                    rows={rowsOf(fr.by_terms_basis).map(([k, n]) => [<Code key="k" c={k} />, n.toLocaleString("en-US")])}
                    empty="no fills recorded" />
                  {obj(fr.by_direction_basis) && (
                    <SimpleTable head={["direction basis", "fills"]} right={[1]} sortId="sys-fill-direction"
                      values={rowsOf(fr.by_direction_basis).map(([k, n]) => [k, n])}
                      rows={rowsOf(fr.by_direction_basis).map(([k, n]) => [<Code key="k" c={k} />, n.toLocaleString("en-US")])}
                      empty="no fills recorded" />
                  )}
                </div>
              </>
            )
          ) : uf === undefined ? (
            <p className="text-ink-low">not on this backend</p>
          ) : (
            <p className="tc-num">unreadable: {ufo ? `${count(ufo.today)} today · ${count(ufo.total)} in all` : count(uf)}</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ------------------------------------------------------------ catalogue

function Catalogue({ d }: { d: Obj }) {
  const u = obj(d.universe);
  if (!u) {
    return <Panel testid="ops-catalogue" title="Catalogue coverage" summary={[plain("no coverage block")]}><InfoNote>no coverage block on record</InfoNote></Panel>;
  }
  const cat = obj(u.catalogue) ?? {};
  const stages = [["known", u.known], ["in scope", u.in_scope], ["priced", u.priced], ["eligible", u.eligible]] as const;
  const top = num(u.known);
  return (
    <Panel testid="ops-catalogue" title="Catalogue coverage"
      summary={line(plain(`${count(u.known)} known`), plain(`${count(u.in_scope)} in scope`), plain(`${count(u.priced)} priced`),
        plain(`${count(u.eligible)} eligible`), typeof u.error === "string" ? warn("coverage read failed") : null)}
      meta={`as of ${when(d.universe_at, true)} · ${text(u.version)}`}>
      {typeof u.error === "string" && <p className="mb-2 text-[12px] text-warn">◆ coverage read failed: {u.error}</p>}
      <div className="grid gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <SubHead info="The backend's four stages.">Funnel</SubHead>
          <ol className="space-y-1.5">
            {stages.map(([k, v]) => {
              const n = num(v);
              return (
                <li key={k}>
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="text-ink-hi">{k}</span>
                    <span className="tc-num text-ink-hi">{n === null ? DASH : n.toLocaleString("en-US")}
                      {n !== null && top ? <span className="ml-2 text-ink-low">{Math.round((n / top) * 1000) / 10}%</span> : null}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-tc-raised">
                    <div className="h-full rounded-full bg-ink-mid/60" style={{ width: `${n !== null && top ? (n / top) * 100 : 0}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-[12px] text-ink-low">
            rows <span className="tc-num text-ink-hi">{count(cat.rows)}</span> of {count(cat.max_rows)} · refreshed {when(cat.last_full_refresh_at)}
          </p>
        </div>
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <SubHead>Refusals by reason</SubHead>
            <SimpleTable testid="refusals" head={["reason", "markets"]} right={[1]} sortId="sys-refusals"
              values={rowsOf(u.refusals_by_reason).map(([k, n]) => [k, n])}
              rows={rowsOf(u.refusals_by_reason).map(([k, n]) => [<CodeW key="k" c={k} />, n.toLocaleString("en-US")])}
              empty="no refusals recorded" />
          </div>
          <div>
            <SubHead>Unmapped / unpriced</SubHead>
            <SimpleTable testid="unmapped" head={["why", "markets"]} right={[1]} sortId="sys-unmapped"
              values={[...rowsOf(u.fixture_unmapped_by_why).map(([k, n]) => [`unmapped · ${k}`, n]),
                ...rowsOf(u.no_fair_price_by_why).map(([k, n]) => [`no price · ${k}`, n])]}
              rows={[...rowsOf(u.fixture_unmapped_by_why).map(([k, n]) => [<span key="k">unmapped · <Code c={k} /></span>, n.toLocaleString("en-US")]),
                ...rowsOf(u.no_fair_price_by_why).map(([k, n]) => [<span key="k">no price · <Code c={k} /></span>, n.toLocaleString("en-US")])]}
              empty="none recorded" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ------------------------------------------------- clocks and retention

function Clocks({ d, now, candidates }: { d: Obj; now: number; candidates: Candidates | null }) {
  const rows: [string, unknown, ReactNode?][] = [
    ["status generated", d.generated_at],
    ["newest tick", obj(d.last_tick)?.at, <><Tech>{text(obj(d.last_tick)?.outcome)}</Tech>{num(obj(d.last_tick)?.elapsed_s) !== null ? ` · ${num(obj(d.last_tick)?.elapsed_s)!.toFixed(1)} s` : ""}</>],
    ["account read", d.account_read_at],
    ["account block", d.account_at],
    ["risk block", d.risk_at],
    ["coverage block", d.universe_at],
    ["in-play block", obj(d.in_play_trading)?.at],
    ["in-play live update", obj(d.in_play)?.last_live_update_at],
    ["hand-over block", obj(d.handover)?.at ?? d.managed_at],
    ["learner block", obj(d.learning)?.at],
    ["daily budget", obj(d.daily_budget)?.at],
    ["news guard", obj(d.news_guard)?.at],
    ["anomaly", obj(d.anomaly_avoid)?.at],
    ["candidate snapshot", candidates?.tick_at ?? null, candidates ? `${candidates.version ?? "version not stated"}${candidates.age_s !== null ? ` · age ${Math.round(candidates.age_s)} s` : ""}` : "not read"],
  ];
  const last = obj(d.last_tick);
  const shed = obj(last?.shed);
  const over = !!last && (last.truncated === true || (!!shed && Object.keys(shed).length > 0));
  return (
    <Panel testid="ops-clocks" title="Data freshness" cid="clocks"
      summary={line(plain(`status ${agoIso(d.generated_at, now) ?? DASH} ago`), plain(`tick ${agoIso(obj(d.last_tick)?.at, now) ?? DASH} ago`),
        plain(`account ${agoIso(d.account_read_at, now) ?? DASH} ago`), over ? warn("tick row over the journal cap") : null)} info="Each block carries the clock of the tick row it came from.">
      <dl>
        {rows.map(([k, v, sub]) => (
          <KV key={k} k={k}>
            {typeof v === "string" && v !== "" ? <span className="tc-num" title={when(v, true)}>{agoIso(v, now)} ago</span> : <span className="text-ink-low">not sent</span>}
            {sub ? <span className="block truncate text-[11px] text-ink-low">{sub}</span> : null}
          </KV>
        ))}
        {last && (last.truncated === true || (shed && Object.keys(shed).length > 0)) && (
          <KV k="newest tick row">
            <span className="text-warn">◆ over the journal cap — {last.truncated === true ? "stored as a marker" : `left out: ${Object.entries(shed!).map(([k, n]) => `${k} (${n} bytes)`).join(", ")}`}</span>
          </KV>
        )}
      </dl>
    </Panel>
  );
}

function Retention({ d }: { d: Obj }) {
  const r = obj(d.journal_retention);
  return (
    <Panel testid="ops-retention" title="Journal retention"
      summary={!r ? [plain("not served yet")] : typeof r.error === "string" ? [warn("retention block failed")]
        : line(plain(`mode ${text(r.mode)}`), plain(`keep ${text(r.keep_days)} days`))}>
      {!r ? <InfoNote>not served yet</InfoNote>
        : typeof r.error === "string" ? <InfoNote tone="warn">◆ retention block failed: {r.error}</InfoNote> : (
          <dl>
            {Object.entries(r).filter(([k, v]) => !["label", "basis", "prunable_kinds", "kept_kinds"].includes(k) && (typeof v !== "object" || v === null))
              .map(([k, v]) => <KV key={k} k={k.replace(/_/g, " ")}><span className="tc-num">{text(v)}</span></KV>)}
            {Object.entries(r).filter(([k, v]) => !["kept_kinds", "prunable_kinds"].includes(k) && obj(v))
              .map(([k, v]) => (
                <KV key={k} k={k.replace(/_/g, " ")}>
                  {Object.entries(obj(v)!).map(([kk, vv]) => <span key={kk} className="mr-3 inline-block"><span className="text-ink-low">{kk.replace(/_/g, " ")}</span> <span className="tc-num">{text(vv)}</span></span>)}
                </KV>
              ))}
          </dl>
        )}
    </Panel>
  );
}

function FeedGaps({ d }: { d: Obj }) {
  const ip = obj(d.in_play_trading);
  const lastSkips = obj(ip?.skips_by_reason_last_tick);
  const lastRef = obj(ip?.refusals_by_reason_last_tick);
  if (!lastSkips && !lastRef) return null;
  const items = [...rowsOf(lastSkips), ...rowsOf(lastRef)].sort((a, b) => b[1] - a[1]);
  return (
    <Panel title="In-play reasons" cid="inplay-reasons"
      summary={items.length ? line(plain(`top: ${reasonTag(items[0][0])} ${items[0][1]}`), plain(`${items.reduce((n, [, k]) => n + k, 0)} in all`)) : [plain("none")]}
      info={<>Skips and refusals the newest in-play tick counted.
      {items.map(([k]) => <span key={k} className="mt-1 block"><span className="text-ink-hi">{reasonTag(k)}</span> — {codeWords(k) ?? k} <span className="font-mono text-[10.5px]">{k}</span></span>)}</>}>
      {items.length === 0 ? <InfoNote>none on the newest tick</InfoNote> : (
        <BarList dense items={items.map(([k, n]) => ({
          key: k, value: n, label: <span title={`${codeWords(k) ?? k} (${k})`}>{reasonTag(k)}</span>,
          display: n.toLocaleString("en-US"),
        }))} />
      )}
    </Panel>
  );
}

export function SystemView({ d, now, candidates, go }: {
  d: Obj; now: number; candidates: Candidates | null; go: (v: string, p?: Record<string, string>) => void;
}) {
  void go;
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12"><Activity d={d} /></div>
      <div className="col-span-12"><Catalogue d={d} /></div>
      <div className="col-span-12 xl:col-span-7"><Settlements d={d} now={now} /></div>
      <div className="col-span-12 xl:col-span-5"><Clocks d={d} now={now} candidates={candidates} /></div>
      <div className="col-span-12 xl:col-span-6"><FeedGaps d={d} /></div>
      <div className="col-span-12 xl:col-span-6"><Retention d={d} /></div>
      <div className="col-span-12">
        <Panel title="Versions" summary={[plain(`status ${text(d.version)}`), plain(`strategy ${text(d.strategy)}`), plain(`env ${text(d.env)}`)]}>
          <p className="font-mono text-[11px] leading-relaxed text-ink-low">
            status {text(d.version)} · strategy {text(d.strategy)} · in-play {text(obj(d.in_play_trading)?.strategy)}
            {" "}(at tick {text(obj(d.in_play_trading)?.strategy_at_tick)}) · learner {text(obj(d.learning)?.strategy)}
            {" "}· careful {text(obj(d.careful)?.version)} · candidates {text(candidates?.version)} · env {text(d.env)}
          </p>
        </Panel>
      </div>
    </div>
  );
}

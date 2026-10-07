// MODEL (redesign, 2026-10-07): the learner and the strategies that decide
// — the pre-match learner (arms, CLV by competition, model-priced markets,
// the ratings model's share), the careful strategy (switches, paper vs
// real, grounds, section-4 checks), the news guard and anomaly avoidance.
//
// RESTRAINED LANGUAGE. Everything here is a learning signal of a small,
// capped experiment: CLV is cents per contract after fees against the last
// stored mid before kickoff — a signal, not a result. Every mean carries its
// sample; nothing is called proven, winning or high-confidence.
import { compLabel, isObj, num, str } from "../../lib/tradingConsole";
import { TradingCareful } from "../TradingCareful";
import { ArmsInUse } from "./InPlayPanel";
import {
  DASH, InfoNote, Metric, Panel, SimpleTable, SubHead, Tech, count, when,
} from "./primitives";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);
const ABSENT = DASH;
const text = (v: unknown) => (v === null || v === undefined || v === "" ? ABSENT : typeof v === "string" ? v : String(v));
const cents = (v: unknown) => {
  const n = num(v);
  return n === null ? ABSENT : `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}¢`;
};

function Learning({ l, now }: { l: Obj; now: number }) {
  void now;
  const trades = obj(l.trades_by_competition) ?? {};
  const fills = obj(l.fills_rewarded_by_competition) ?? {};
  const clv = obj(l.mean_clv_c_by_competition) ?? {};
  const best = obj(l.best_arm_by_competition) ?? {};
  // EVERY FOCUS COMPETITION IS A ROW: the backend's `competitions` list (in
  // its order) first, then any other the counts name
  const listed = Array.isArray(l.competitions) ? l.competitions.filter((c): c is string => typeof c === "string") : [];
  const comps = [...new Set([...listed, ...[...new Set([...Object.keys(trades), ...Object.keys(fills),
    ...Object.keys(clv), ...Object.keys(best)])].sort()])];
  /** 0 when the backend sent the count map without an entry; "—" when it
   *  sent no map at all */
  const tally = (m: unknown, c: string) => {
    const o = obj(m);
    return o === null ? ABSENT : c in o ? count(o[c]) : "0";
  };
  const dflt = obj(l.default_arm);
  const rm = obj(l.ratings_model);
  const totalFills = Object.values(fills).reduce<number>((s, n) => s + (num(n) ?? 0), 0);
  return (
    <Panel testid="ops-learning" title="Learning (pre-match)"
      meta={<>{text(l.label) === ABSENT ? "" : `${text(l.label)} · `}CLV is cents per contract after fees against the last stored mid before kickoff — a learning signal, not a result.</>}>
      {typeof l.error === "string" && <p className="mb-2 text-[12px] text-warn">◆ the learner summary failed on the backend: {l.error}</p>}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric size="md" label="enabled" value={l.enabled === true ? "yes" : l.enabled === false ? "no" : ABSENT}
          sub={<>strategy <Tech>{text(l.strategy)}</Tech></>} />
        <Metric size="md" label="mean CLV" cls="learning" value={cents(l.mean_clv_c)}
          sub={`rewarded fills, summed by competition: ${totalFills}`} />
        <Metric size="md" label="model-priced markets" value={count(l.model_priced_markets)}
          sub={`fixtures ${count(l.model_priced_fixtures)} · model-only ${count(l.model_only_markets)}`} />
        <Metric size="md" label="candidates" value={count(l.candidates)} sub={`as of ${when(l.at, true)}`} />
        {rm && (
          <Metric size="md" label="ratings model · unvalidated" value={`${count(rm.priced_markets)} markets`}
            sub={`fixtures ${count(rm.priced_fixtures)} · ${text(rm.version)} · ${text(rm.label)}`} />
        )}
        <Metric size="md" label="default arm" value={dflt ? `w ${text(dflt.w)} · t ${text(dflt.threshold)}` : ABSENT}
          sub="where every context starts" />
      </div>
      {typeof l.reward_basis === "string" && (
        <p data-testid="learning-basis" className="mt-3 text-[11.5px] text-ink-low">reward: {l.reward_basis}</p>
      )}
      <div className="mt-2 grid gap-x-8 xl:grid-cols-2">
        <div>
          <ArmsInUse v={l.arms_in_use} testid="learning-arms" title="Arms in use on the newest tick (pre-match)" />
        </div>
        <div className="mt-4">
          <SubHead right="n = trades / rewarded fills">By competition</SubHead>
          <SimpleTable testid="learning-comps" head={["competition", "trades", "fills", "mean CLV", "best arm"]}
            right={[1, 2, 3]}
            rows={comps.map((c) => {
              const b = obj(best[c]);
              return [compLabel(c), tally(l.trades_by_competition, c), tally(l.fills_rewarded_by_competition, c),
                cents(clv[c]), b ? `w ${text(b.w)} · t ${text(b.threshold)} · ${cents(b.posterior_mean_c)}` : "prior only"];
            })}
            empty="no trades or fills recorded by competition yet" />
          <p className="mt-1 text-[11px] text-ink-faint">A best arm is the learner&apos;s posterior on a handful of fills; &ldquo;prior only&rdquo; means no evidence yet.</p>
        </div>
      </div>
    </Panel>
  );
}

/** A guard block, drawn generically from what it sends: its switches and
 *  counts, today's per-reason counts, and its per-competition rows. */
function GuardPanel({ b, title, testid, wordsKey }: { b: Obj | null; title: string; testid: string; wordsKey?: string }) {
  if (!b) {
    return <Panel testid={testid} title={title}><InfoNote>not served yet — this backend sends no {title.toLowerCase()} block</InfoNote></Panel>;
  }
  if (typeof b.error === "string") {
    return <Panel testid={testid} title={title}><InfoNote tone="warn">◆ the {title.toLowerCase()} block failed on the backend: {b.error}</InfoNote></Panel>;
  }
  const scalars = Object.entries(b).filter(([k, v]) => !["label", "version", "basis", "wording", "at", "by_competition", "absences", "not_built", "threshold_bounds"].includes(k)
    && (typeof v === "number" || typeof v === "boolean" || (typeof v === "string" && v.length < 40)));
  const maps = Object.entries(b).filter(([k, v]) => obj(v) && !["by_competition", "absences", "not_built", "threshold_bounds", "pre_match", "in_play"].includes(k)
    && Object.values(obj(v)!).every((x) => typeof x === "number"));
  const phases = (["pre_match", "in_play"] as const).map((k) => [k, obj(b[k])] as const).filter(([, v]) => v);
  return (
    <Panel testid={testid} title={title} meta={<>{str(b.label) ?? ""}{b.at ? ` · as of ${when(b.at, true)}` : ""}</>}>
      {wordsKey && typeof b[wordsKey] === "string" && <p className="mb-3 text-[12px] leading-snug text-ink-mid">{String(b[wordsKey])}</p>}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
        {scalars.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-tc-line py-1 text-[12px]">
            <dt className="text-ink-low">{k.replace(/_/g, " ")}</dt>
            <dd className="tc-num text-ink-hi">{typeof v === "boolean" ? (v ? "yes" : "no") : String(v)}</dd>
          </div>
        ))}
      </dl>
      {phases.map(([k, v]) => (
        <div key={k} className="mt-3">
          <SubHead>{k.replace(/_/g, "-")}</SubHead>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
            {Object.entries(v!).filter(([, x]) => typeof x === "number" || typeof x === "boolean").map(([kk, x]) => (
              <div key={kk} className="flex justify-between gap-3 border-b border-tc-line py-1 text-[12px]">
                <dt className="text-ink-low">{kk.replace(/_/g, " ")}</dt><dd className="tc-num text-ink-hi">{String(x)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      {maps.map(([k, v]) => (
        <div key={k} className="mt-3">
          <SubHead>{k.replace(/_/g, " ")}</SubHead>
          <SimpleTable head={["reason", "count"]} right={[1]}
            rows={Object.entries(obj(v)!).sort((a, z) => Number(z[1]) - Number(a[1])).map(([r, n]) => [<Tech key="r" tone="text-ink-mid">{r}</Tech>, String(n)])}
            empty="none today" />
        </div>
      ))}
    </Panel>
  );
}

export function ModelView({ d, now, token }: { d: Obj; now: number; token: string }) {
  const learning = obj(d.learning);
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12">
        {learning ? <Learning l={learning} now={now} /> : (
          <Panel title="Learning (pre-match)"><InfoNote>learning is not on this backend</InfoNote></Panel>
        )}
      </div>
      <div className="col-span-12"><TradingCareful d={d} token={token} /></div>
      <div className="col-span-12 xl:col-span-6">
        <GuardPanel b={obj(d.news_guard)} title="News guard" testid="ops-news-guard" />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <GuardPanel b={obj(d.anomaly_avoid)} title="Anomaly avoidance" testid="ops-anomaly" wordsKey="wording" />
      </div>
      <p className="col-span-12 text-[11px] text-ink-faint">
        In-play learning (arms, entry and exit rewards, in-play CLV) is under Trading → In play. CLV by market type,
        phase or model-only is not served by any route.
      </p>
    </div>
  );
}

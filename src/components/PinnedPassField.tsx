// THE PINNED-PASS FIELD — the two views of /bet-suggester/ratings.
//
// Approved by the operator on 2026-09-23 as the artifact "The Pinned-Pass
// Field", and ported here in the repo's own idiom. Every rule below was
// a decision in that review, and several fixed real bugs:
//
//   LADDER IS DATA. A table is one ladder, read off the rows' own
//     `ladder` / `component`. Two ladders selected is two tables and a
//     refusal of a single ranking; on the union corpus all eight columns
//     are one ladder, so one table. A section's label lists the columns
//     it actually holds.
//   ONE TABLE, ONE AXIS. Every bar in a table is drawn on the span of
//     the rows that table shows. Per-column scales put a Serie A club
//     level with Bayern while it ranked eleventh.
//   HIGHEST VALUE FIRST. Every axis is signed higher-is-better, and a
//     bundle's rows arrive in NAME order — rendering in data order
//     printed an alphabetical "rank". The rank is the value rank, and a
//     search FINDS a club without renumbering it.
//   BRIDGES READ FIRST. The count sits left of the interval; a zero-
//     bridge club gets a hollow ring instead of its league's light and no
//     bar at all, because a narrow band there means no evidence.
//   ONE LEAGUE IS A WITHIN-LEAGUE READ. The bridge and band columns give
//     way to games played and how much of its own league a club's
//     interval spans: league prior persistence is one π per league, so a
//     bridge cannot move a club relative to its league-mates.
//   A STRADDLING TIER SHOWS ITS SET's RANGE, min–max.
//   A FACT TRUE OF A WHOLE SECTION IS SAID ONCE, in its header.
//   CUPS ARE ONE AT A TIME — different corpora, different pass counts.
//   MISSING IS NEVER ZERO. An absent figure is named, never 0, 0.00, 0%
//     or a bare dash.
//   IT SHOWS; IT DOES NOT DECIDE.
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import {
  CupField, CupFields, CupRow, FIELD_AXES, FieldAxisName, LeagueField,
  LeagueFieldRow, barRefusal, byValue, countWord, fmt, ladders, place,
  shortSha, tableScale, tierText,
} from "../lib/fieldPageApi";
import {
  RibbonPill, RibbonStrip, useLetterReveal, useRibbonSlot,
} from "./FieldPills";
import { hueOf } from "./PickerColumn";

// ─────────────────────────────── shared ink ────────────────────────────

const BTN = "flex items-center justify-center rounded-lg border bg-bs-elev2 px-2.5 py-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] transition-colors hover:border-ink-faint disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line";
const btn = (on: boolean) =>
  `${BTN} ${on ? "border-accent text-ink-hi" : "border-line text-ink-faint"}`;
const META = "font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint";
const TH = "whitespace-nowrap border-b border-line px-3 py-2 text-left font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-faint";
/* NO COLOUR IN THE BASE, on purpose: a cell that adds `text-accent` to
   a base carrying `text-ink-mid` loses to whichever utility the
   stylesheet happens to emit later — the gold value column and rank 01
   rendered gray that way. Each cell names its one colour. */
const TD = "px-3 py-1.5 font-mono text-[12px] tabular-nums";
const NA = "font-mono text-[9.5px] text-ink-faint";

/** An absent figure, NAMED. */
function Na({ children }: { children: ReactNode }) {
  return <span data-testid="named-absence" className={NA}>{children}</span>;
}

function SearchBox({ value, onChange, label }: {
  value: string; onChange: (v: string) => void; label: string;
}) {
  return (
    <input type="search" value={value} aria-label={label}
      placeholder="find a club" onChange={(e) => onChange(e.target.value)}
      className="min-w-[140px] rounded-lg border border-line bg-bs-elev2 px-2.5 py-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] text-ink-hi placeholder:uppercase placeholder:text-ink-faint" />
  );
}

function SectionHead({ title, note, testId }: {
  title: string; note: string; testId?: string;
}) {
  return (
    <div className="mb-3.5 mt-8 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-5">
      <h2 className="text-lg font-medium text-ink-hi">{title}</h2>
      <p data-testid={testId} className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {note}
      </p>
    </div>
  );
}

/** The tier as a chip: a set's range where the interval straddles, the
 *  one tier where it does not, and a named absence where nothing was
 *  cut. */
function Tier({ t }: { t: { tier?: number | null; tier_set?: number[] | null;
  straddles?: boolean | null } }) {
  const x = tierText(t);
  if (!x) return <Na>not cut</Na>;
  return (
    <span data-testid="tier-chip"
      title={x.hi != null ? `the interval reaches tiers ${x.lo}–${x.hi}`
        + (t.tier != null ? `; its point sits in ${t.tier}` : "") : undefined}
      className="inline-flex items-center gap-0.5 rounded-[3px] border border-line-strong px-[5px] py-px font-mono text-[9px] tracking-[0.12em] text-ink-mid">
      {x.lo}
      {x.hi != null && <em className="cursor-help not-italic text-ink-faint">–{x.hi}</em>}
    </span>
  );
}

/** The interval, as FieldAxes draws one: a hairline, the span in
 *  ink-low over it, an 11×2 ink-hi tick at the point. */
function Bar({ lo, hi, v, sc }: {
  lo: number; hi: number; v: number; sc: { lo: number; hi: number };
}) {
  const p = place(lo, hi, v, sc);
  return (
    <div data-testid="bar" className="relative h-[15px]"
      title={`${lo.toFixed(1)} to ${hi.toFixed(1)}`}>
      <span className="absolute inset-x-0 top-[7px] h-px bg-line" />
      <i className="absolute top-[6.5px] h-[2px] rounded-[1px] bg-ink-low"
        style={{ left: `${p.left}%`, width: `${p.width}%` }} />
      <i className="-ml-px absolute top-[2px] h-[11px] w-[2px] rounded-sm bg-ink-hi"
        style={{ left: `${p.point}%` }} />
    </div>
  );
}

/** No bar, on purpose: a hatched track and the reason. */
function NoBar({ why }: { why: string }) {
  return (
    <div data-testid="bar-refused" title={why} aria-label={`no interval drawn: ${why}`}
      className="relative h-[15px]">
      <span className="absolute inset-x-0 top-[7px] h-px [background:repeating-linear-gradient(90deg,var(--ink-faint),var(--ink-faint)_2px,transparent_2px,transparent_5px)]" />
    </div>
  );
}

function Pip({ hue, hollow, title }: {
  hue?: string; hollow?: boolean; title?: string;
}) {
  return hollow
    ? <span data-testid="pip" data-hollow="yes" title={title}
        className="block h-[7px] w-[7px] flex-none rounded-full border border-ink-low" />
    : <span data-testid="pip" style={{ backgroundColor: hue }}
        className="block h-2 w-2 flex-none rounded-full" />;
}

function Chip({ children, title, warn, testId }: {
  children: ReactNode; title?: string; warn?: boolean; testId?: string;
}) {
  return (
    <span data-testid={testId} title={title}
      className={`ml-0.5 inline-flex flex-none cursor-help items-center rounded-[3px] border px-[5px] py-px font-mono text-[9px] uppercase tracking-[0.14em] ${
        warn ? "border-warn/40 bg-warn/5 text-warn" : "border-line-strong text-ink-mid"}`}>
      {children}
    </span>
  );
}

function Table({ head, children, testId, section }: {
  head: ReactNode; children: ReactNode; testId: string; section?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table data-testid={testId} data-section={section}
        className="w-full min-w-[620px] border-collapse text-[13px]">
        <thead><tr>{head}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ───────────────────────────── the leagues view ────────────────────────

type SortKey = "value" | "club" | "column" | "bridge_fixtures"
  | "half_width_95" | "games_played" | "quintiles_spanned_own_league";

/** The header's word for the value column, from the rows' own
 *  `goals_per_match.means` on a goal axis. */
function valueLabel(axis: string, rows: LeagueFieldRow[]) {
  if (axis === "overall") return "elo";
  const m = rows.find((r) => r.goals_per_match?.means)?.goals_per_match?.means;
  return m ? `goals ${m} / match` : axis;
}

function sortBy(rows: LeagueFieldRow[], key: SortKey, dir: 1 | -1,
                display: (c: string) => string) {
  if (key === "value") {
    const s = byValue(rows);
    return dir === -1 ? s : [...s.filter((r) => r.value != null).reverse(),
      ...s.filter((r) => r.value == null)];
  }
  const get = (r: LeagueFieldRow): string | number | null | undefined =>
    key === "club" ? r.club : key === "column" ? display(r.column) : r[key];
  return [...rows].sort((a, b) => {
    const x = get(a), y = get(b);
    if (x == null && y == null) return 0;
    if (x == null) return 1;           // missing sorts last, both ways
    if (y == null) return -1;
    if (typeof x === "string" || typeof y === "string") {
      return String(x).localeCompare(String(y)) * dir;
    }
    return (x - y) * dir;
  });
}

export function LeaguesView({ data, modeSwitch }: {
  data: LeagueField; modeSwitch: ReactNode;
}) {
  const cols = data.columns.map((c) => c.key);
  const display = (k: string) =>
    data.columns.find((c) => c.key === k)?.display ?? k;
  const [axis, setAxis] = useState<FieldAxisName>("overall");
  const [sel, setSel] = useState<Record<string, boolean>>(
    () => Object.fromEntries(cols.map((k) => [k, true])));
  const [evid, setEvid] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>(
    { key: "value", dir: -1 });
  const stripRef = useRef<HTMLDivElement | null>(null);
  const reveal = useLetterReveal();
  useRibbonSlot(stripRef, [cols.join(",")]);

  /* The strip resolves once on arrival, staggered across the row the way
     the ribbon staggers a step — after the font settles, so the cells
     churn at their final width. */
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const go = () => reveal(Array.from(
      el.querySelectorAll<HTMLElement>("[data-pill]")));
    let alive = true;
    if (document.fonts?.ready) void document.fonts.ready.then(() => { if (alive) go(); });
    else go();
    return () => { alive = false; };
  }, [reveal]);

  const block = data.axes[axis];
  const allRows = useMemo(() => block?.rows ?? [], [block]);
  const selected = cols.filter((k) => sel[k]);
  const solo = selected.length === 1 ? selected[0] : null;
  /* THE SELECTION is what is ranked: leagues and "with evidence only".
     The search is applied after, so it finds a club without renumbering
     it. */
  const ranked = allRows.filter((r) => sel[r.column]
    && !(evid && r.bridge_fixtures === 0));
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? ranked.filter((r) => r.club.toLowerCase().includes(needle)) : ranked;
  const groups = ladders(ranked);
  const split = groups.length > 1;
  const vlabel = valueLabel(axis, allRows);
  const goal = axis !== "overall";

  const absent = cols.filter((k) => block?.columns[k]?.measured === false);
  const why = absent.map((k) => {
    const c = block?.columns[k];
    return c && c.measured === false ? c.why : undefined;
  }).find(Boolean);

  const heads: Array<[SortKey | null, string, boolean, string?]> = solo
    ? [[null, "", false], ["club", "club", false], ["games_played", "played", true],
       ["value", vlabel, true], ["quintiles_spanned_own_league", "spans of its league", false],
       [null, "tier", false]]
    : [[null, "", false], ["club", "club", false], ["column", "league", false],
       ["bridge_fixtures", "bridges", true], ["value", vlabel, true],
       ["half_width_95", goal ? "95% band (log)" : "95% band", true],
       [null, "interval", false], [null, "tier", false]];
  const head = heads.map(([k, label, right]) => (
    <th key={label || "rank"} data-sort={k ?? undefined}
      aria-sort={k && sort.key === k ? (sort.dir < 0 ? "descending" : "ascending") : undefined}
      onClick={k ? () => setSort((s) => s.key === k
        ? { key: k, dir: (s.dir * -1) as 1 | -1 }
        : { key: k, dir: k === "club" || k === "column" ? 1 : -1 }) : undefined}
      title={k === "value" && axis === "defence"
        ? "ranked on the signed value — higher is better on every axis, so "
          + "the fewest goals conceded come first" : undefined}
      className={`${TH} ${right ? "text-right" : ""} ${k ? "cursor-pointer select-none" : ""} ${
        k && sort.key === k ? "text-accent" : ""}`}>
      {label}{k && sort.key === k ? (sort.dir < 0 ? " ↓" : " ↑") : ""}
    </th>
  ));

  const sections: Array<{ title: string; note: string; rows: LeagueFieldRow[];
    ladder: string; all: LeagueFieldRow[] }> = [];
  for (const g of groups) {
    const present = [...new Set(g.rows.map((r) => r.column))];
    const holds = present.length === cols.length
      ? `all ${countWord(cols.length)} columns`
      : cols.filter((k) => present.includes(k)).map(display).join(", ");
    const comps = new Set(g.rows.map((r) => String(r.component ?? "none")));
    const conn = comps.size === 1 ? "one connected component"
      : `${countWord(comps.size)} components`;
    let note: string;
    let title: string;
    if (solo) {
      title = display(solo);
      const pl = g.rows.filter(
        (r) => r.placeable_in_a_quintile_of_its_own_league === true).length;
      const hasPl = g.rows.some(
        (r) => r.placeable_in_a_quintile_of_its_own_league !== undefined);
      note = `${g.rows.length} clubs · a within-league read`
        + (hasPl ? ` · ${pl} placeable in one of its own quintiles` : "");
    } else {
      title = g.ladder === "no ladder named" ? "No ladder named"
        : /^component /.test(g.ladder) ? `Component ${g.ladder.slice(10)}`
        : `Ladder ${g.ladder}`;
      note = `${g.rows.length} clubs · ${holds} · ${
        split ? (g === groups[0] ? conn : "a separate component") : conn}`;
    }
    /* A FACT TRUE OF THE WHOLE SECTION, said once. */
    const nbf = g.rows.filter((r) => r.below_floor === true).length;
    if (nbf && nbf === g.rows.length) note += " · every club below the floor at this count";
    else if (nbf) note += ` · ${nbf} below the floor`;
    const sh = needle ? g.rows.filter((r) => r.club.toLowerCase().includes(needle)) : g.rows;
    sections.push({ title, note, rows: sh, ladder: g.ladder, all: g.rows });
  }

  const passes = data.passes;
  const reps = data.jackknife_replicates;
  const prov = (data.provisional ?? []).filter((p) => sel[p.column]
    && (!needle || p.club.toLowerCase().includes(needle)));

  return (
    <>
      <div data-testid="field-controls"
        className="z-20 mt-6 border-y border-line bg-bs pb-3 pt-4 md:sticky md:top-[var(--topbar-h)]">
        {modeSwitch}
        <div className="mb-2 flex flex-wrap items-center gap-[7px]">
          {FIELD_AXES.map((a) => (
            <button key={a} type="button" data-testid="axis-button" data-axis={a}
              aria-pressed={axis === a} onClick={() => setAxis(a)}
              disabled={!data.axes[a]}
              title={!data.axes[a] ? `${a} is not in this payload` : undefined}
              className={btn(axis === a)}>{a}</button>
          ))}
          <button type="button" data-testid="evidence-only" aria-pressed={evid}
            onClick={() => setEvid((e) => !e)} className={btn(evid)}>
            with evidence only
          </button>
          <SearchBox value={q} onChange={setQ} label="find a club" />
          <span data-testid="field-count" className={`${META} ml-auto`}>
            {shown.length} of {allRows.length} clubs
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <RibbonStrip stripRef={stripRef} label="leagues shown"
            testId="league-strip">
            {data.columns.map((c) => {
              const n = data.axes.overall?.rows.filter(
                (r) => r.column === c.key).length ?? 0;
              return (
                <RibbonPill key={c.key} hueKey={c.key} dataKey={c.key}
                  testId="league-pill" label={c.display} on={sel[c.key] === true}
                  title={`${c.display} — ${c.measured
                    ? `${n} clubs in season` : "not measured in this bundle"}`}
                  onClick={() => {
                    setSel((s) => ({ ...s, [c.key]: !s[c.key] }));
                    const el = stripRef.current?.querySelector<HTMLElement>(
                      `[data-pill][data-key="${c.key}"]`);
                    if (el) reveal([el]);
                  }} />
              );
            })}
          </RibbonStrip>
          <span data-testid="axis-hint" className={`${META} basis-full text-right`}>
            {goal ? "log-goals, shown as goals per match · no pass count"
              : `${passes ?? "an unstated number of"} passes · ${
                reps ?? "an unstated number of"} replicates · elo`}
          </span>
        </div>
      </div>

      {split && (
        <p data-testid="field-notice" data-kind="split"
          className="mt-5 border-l-2 border-warn/50 bg-warn/5 py-2 pl-3.5 pr-3 text-[12px] leading-relaxed text-ink-mid">
          <b className="font-semibold text-ink-hi">
            {countWord(groups.length).replace(/^./, (c) => c.toUpperCase())} ladders
            are selected, so there is no single ranking.</b>{" "}
          Elo is comparable only inside one connected component; clubs on
          different ladders share nothing but the starting constant. They are
          drawn apart below and cannot be sorted against each other.
        </p>
      )}
      {solo && (
        <p data-testid="field-notice" data-kind="solo"
          className="mt-5 border-l-2 border-line-strong py-2 pl-3.5 pr-3 text-[12px] leading-relaxed text-ink-low">
          <b className="font-semibold text-ink-hi">One league, so this is a
            within-league read and every club is usable.</b>{" "}
          The 95% band measures dependence on cross-league fixtures, and the
          league&rsquo;s prior persistence is one figure shared by all its
          clubs — so a bridge cannot move a club relative to its own
          league-mates. It fixes where the whole league sits on the shared
          scale, and that offset cancels here. What is shown instead is how
          much of its own league the club&rsquo;s interval spans.
        </p>
      )}

      {sections.map((s) => {
        /* ONE TABLE, ONE AXIS — on the rows this table draws bars for. */
        const sc = tableScale(s.all.filter((r) => barRefusal(r) === null));
        const hoisted = s.all.length > 0
          && s.all.every((r) => r.below_floor === true);
        const order = sortBy(s.rows, sort.key, sort.dir, display);
        /* A club with no value has no rank — it is listed last and
           UNRANKED, never numbered as if it had been measured lowest. */
        const rank = new Map(byValue(s.all).filter((r) => r.value != null)
          .map((r, i) => [r, i + 1]));
        return (
          <section key={s.ladder} data-testid="ladder-section"
            data-ladder={s.ladder}>
            <SectionHead title={s.title} note={s.note} testId="section-note" />
            <Table testId="field-table" section={s.ladder} head={head}>
              {order.map((r) => (
                <LeagueRow key={`${r.column}:${r.club}`} r={r}
                  rank={rank.get(r) ?? null} solo={solo !== null} goal={goal}
                  axis={axis} sc={sc} hoisted={hoisted}
                  league={display(r.column)} />
              ))}
              {!order.length && (
                <tr><td colSpan={heads.length}
                  className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                  No club matches this filter.</td></tr>
              )}
            </Table>
          </section>
        );
      })}
      {!sections.length && (
        <p data-testid="field-empty"
          className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          No league is selected.</p>
      )}

      {absent.length > 0 && (
        <p data-testid="axis-absent"
          className="mt-4 border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
          <b className="text-ink-mid">{axis} is not measured for{" "}
            {absent.map(display).join(" or ")}.</b>{" "}
          {why ?? ""} Named, not filled from another fit.
        </p>
      )}

      {prov.length > 0 && (
        <section data-testid="provisional">
          <SectionHead title="In season, not in the fit"
            note={`${prov.length} clubs · no rating on this corpus · listed, not ranked`} />
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {prov.map((p) => (
              <li key={`${p.column}:${p.club}`} data-testid="provisional-row"
                title={p.what_this_value_is_not ?? undefined}
                className="flex items-baseline gap-2 text-[13px]">
                <Pip hollow title="not in the fit" />
                <span className="font-medium text-ink-mid">{p.club}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                  {display(p.column)}
                </span>
                <span className="ml-auto font-mono text-[10px] text-ink-faint">
                  {p.matches_played != null
                    ? `${p.matches_played} matches in the live table`
                    : "matches not reported"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-ink-faint">
            These clubs play in a declared column this season and the fit
            holds no rating for them — {prov[0].overall_not_measured
              ? prov[0].overall_not_measured.split(". ")[0].toLowerCase()
              : "there is no Elo row for them"}. A club here has no rank, no
            band and no tier; it is not last, it is not measured.
          </p>
        </section>
      )}
    </>
  );
}

function LeagueRow({ r, rank, solo, goal, axis, sc, hoisted, league }: {
  r: LeagueFieldRow; rank: number | null; solo: boolean; goal: boolean;
  axis: string; sc: { lo: number; hi: number } | null; hoisted: boolean;
  league: string;
}) {
  const refused = barRefusal(r);
  const zero = r.bridge_fixtures === 0;
  const hollow = !solo && zero;
  const value = goal
    ? fmt(r.goals_per_match?.point, 2) : fmt(r.value, 1);
  const hw = fmt(r.half_width_95, goal ? 3 : 2);
  const floorChip = r.below_floor === true && !hoisted;
  return (
    <tr data-testid="field-row" data-club={r.club} data-column={r.column}
      data-rank={rank ?? undefined}
      {...(r.bridge_fixtures != null
        ? { "data-bridge-fixtures": String(r.bridge_fixtures) } : {})}
      className="border-b border-line last:border-b-0 hover:bg-white/[0.02]">
      <td className={`${TD} w-10 text-right text-[11px] ${rank === 1 ? "text-accent" : "text-ink-faint"}`}>
        {rank ?? <Na>unranked</Na>}
      </td>
      <td className="min-w-[200px] py-1.5 pl-3 pr-4 md:w-[34%]">
        <span className="flex items-center gap-2">
          <Pip hue={hueOf(r.column)} hollow={hollow}
            title={hollow ? "no bridge evidence" : undefined} />
          <span className={`min-w-0 truncate text-[13px] font-medium ${
            r.below_floor === true ? "text-ink-mid" : "text-ink-hi"}`}>{r.club}</span>
          {floorChip && (
            <Chip warn testId="floor-chip"
              title={(r.floor_refusal ?? "below the preregistered floor")
                + (r.floor_failing_condition
                  ? ` — failing condition ${r.floor_failing_condition}` : "")}>
              floor
            </Chip>
          )}
          {r.rated_on_another_division && (
            <Chip testId="division-chip" title={r.rated_on_another_division}>
              came up
            </Chip>
          )}
        </span>
      </td>
      {solo ? (
        <>
          <td className={`${TD} w-[58px] text-right text-ink-mid`}>
            {r.games_played ?? <Na>not reported</Na>}
          </td>
          <td className={`${TD} w-[78px] text-right text-accent`}>
            {value ?? <Na>not measured</Na>}
          </td>
          <td className={`${TD} min-w-[120px] text-ink-mid`}>
            <OwnSpan r={r} axis={axis} />
          </td>
        </>
      ) : (
        <>
          <td className="w-[118px] whitespace-nowrap px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
            {league}
          </td>
          <td data-testid="bridge-count" title="cross-league fixtures behind this rating"
            className={`${TD} w-[58px] text-right ${zero ? "text-warn" : "text-ink-mid"}`}>
            {r.bridge_fixtures ?? <Na>not reported</Na>}
          </td>
          <td className={`${TD} w-[78px] text-right text-accent`}>
            {value ?? <Na>not measured</Na>}
          </td>
          <td className={`${TD} w-[76px] text-right text-[11px] text-ink-faint`}
            title={r.jackknife_replicates != null
              ? `${r.jackknife_replicates} jackknife replicates` : undefined}>
            {hw != null ? `±${hw}` : <Na>not measured</Na>}
          </td>
          <td className="hidden min-w-[120px] px-3 py-1.5 md:table-cell md:w-[20%]">
            {refused || !sc
              ? <NoBar why={refused ?? "no interval in this table to scale against"} />
              : <Bar lo={r.lo!} hi={r.hi!} v={r.value!} sc={sc} />}
          </td>
        </>
      )}
      <td className="w-[66px] whitespace-nowrap px-3 py-1.5"><Tier t={r} /></td>
    </tr>
  );
}

/** THE WITHIN-LEAGUE SPAN. Five quintiles wide; the fill is how much of
 *  its own league the club's interval covers, so short is well placed.
 *  An unplaceable club is drawn hatched rather than long. */
function OwnSpan({ r, axis }: { r: LeagueFieldRow; axis: string }) {
  const qs = r.quintiles_spanned_own_league;
  if (qs === undefined) return <Na>not measured on {axis}</Na>;
  if (qs === null) return <Na>not placed</Na>;
  const w = Math.max(2, Math.min(100, (qs / 5) * 100));
  const un = r.placeable_in_a_quintile_of_its_own_league !== true;
  return (
    <div data-testid="own-span" data-placeable={un ? "no" : "yes"}
      title={`spans ${qs.toFixed(2)} of this league’s five quintiles`
        + (un ? " — too wide to place in one" : "")}
      className="relative h-1.5 max-w-[170px] rounded-[3px] bg-white/5">
      <i style={{ width: `${w.toFixed(1)}%` }}
        className={`absolute left-0 top-0 h-1.5 rounded-[3px] ${un
          ? "opacity-70 [background:repeating-linear-gradient(135deg,var(--warn),var(--warn)_2px,transparent_2px,transparent_5px)]"
          : "bg-ink-low"}`} />
    </div>
  );
}

// ─────────────────────────────── the cups view ─────────────────────────

/** A club that appears under the SAME NAME in two cup fields, with both
 *  figures — the worked example of why the fields are not merged. Exact
 *  name equality only; if no two fields share a name, there is no
 *  example rather than a guessed one. */
export function sameClubTwoFields(cups: CupField[]) {
  for (const a of cups) {
    for (const r of byValue(a.axes.overall?.rows ?? [])) {
      for (const b of cups) {
        if (b === a) continue;
        const o = b.axes.overall?.rows.find((x) => x.club === r.club);
        if (o && r.value != null && o.value != null) {
          return { club: r.club, a, b, va: r.value, vb: o.value };
        }
      }
    }
  }
  return null;
}

export function CupsView({ data, initial, modeSwitch, active }: {
  data: CupFields; initial?: string | null; modeSwitch: ReactNode;
  active: boolean;
}) {
  const cups = data.cups;
  const pick = (k?: string | null) =>
    cups.find((c) => c.key === k || c.aliases.includes(k ?? "")) ?? cups[0];
  const [key, setKey] = useState(() => pick(initial)?.key);
  const [axis, setAxis] = useState<FieldAxisName>("overall");
  const [q, setQ] = useState("");
  const stripRef = useRef<HTMLDivElement | null>(null);
  const reveal = useLetterReveal();
  useRibbonSlot(stripRef, [cups.length]);
  useEffect(() => {
    if (!active || !stripRef.current) return;
    reveal(Array.from(stripRef.current.querySelectorAll<HTMLElement>("[data-pill]")));
  }, [active, reveal]);

  const cup = pick(key);
  if (!cup) return null;
  const ax: FieldAxisName = cup.axes[axis] ? axis : "overall";
  const a = cup.axes[ax];
  const all = byValue(a?.rows ?? []);
  const rank = new Map(all.filter((r) => r.value != null).map((r, i) => [r, i + 1]));
  const needle = q.trim().toLowerCase();
  const rows = needle ? all.filter((r) => r.club.toLowerCase().includes(needle)) : all;
  const sc = tableScale(all);
  const goal = ax !== "overall";
  const nbf = all.filter((r) => r.below_floor === true).length;
  const hoisted = nbf > 0 && nbf === all.length;
  const unit = goal
    ? `goals ${ax === "attack" ? "scored" : "conceded"} / match` : "elo";
  const note = [
    `${all.length} clubs`,
    goal ? "goals measurement · no pass count" : `${cup.passes} passes`,
    `corpus ${shortSha(cup.corpus_sha256) ?? "not stated"}`,
    `${cup.admitted_leagues?.length ?? 0} leagues admitted`,
    ...(hoisted ? ["every club below the floor"] : nbf ? [`${nbf} below the floor`] : []),
  ].join(" · ");

  return (
    <>
      <div data-testid="cup-controls"
        className="z-20 mt-6 border-y border-line bg-bs pb-3 pt-4 md:sticky md:top-[var(--topbar-h)]">
        {modeSwitch}
        <div className="mb-2 flex flex-wrap items-center gap-[7px]">
          {FIELD_AXES.map((x) => {
            const has = !!cup.axes[x];
            return (
              <button key={x} type="button" data-testid="cup-axis-button"
                data-axis={x} aria-pressed={ax === x} disabled={!has}
                title={has ? undefined : `${x} is not measured for ${cup.display} `
                  + "— this field carries the overall axis only"}
                onClick={() => setAxis(x)} className={btn(ax === x)}>{x}</button>
            );
          })}
          <SearchBox value={q} onChange={setQ} label="find a club in this cup" />
          <span data-testid="cup-count" className={`${META} ml-auto`}>
            {rows.length} of {all.length} clubs
          </span>
        </div>
        <RibbonStrip stripRef={stripRef} label="cup field shown — one at a time"
          testId="cup-strip">
          {cups.map((c) => (
            <RibbonPill key={c.key} hueKey={c.key} dataKey={c.key}
              testId="cup-pill" label={c.display} on={c.key === cup.key}
              title={`${c.display} — ${c.passes} passes, corpus ${shortSha(c.corpus_sha256)}`}
              onClick={() => {
                setKey(c.key); setQ("");
                const el = stripRef.current?.querySelector<HTMLElement>(
                  `[data-pill][data-key="${c.key}"]`);
                if (el) reveal([el]);
              }} />
          ))}
        </RibbonStrip>
        {cups.some((c) => !c.axes[axis]) && axis !== "overall" && !cup.axes[axis] && (
          <p className={`${META} mt-2`}>{axis} is not measured for {cup.display}</p>
        )}
      </div>

      <section data-testid="cup-section" data-cup={cup.key}>
        <SectionHead title={cup.display} note={note} testId="cup-note" />
        <Table testId="cup-table" section={cup.key} head={<>
          <th className={TH} />
          <th className={TH}>club</th>
          <th className={TH}>league</th>
          <th className={`${TH} text-right text-accent`}>{unit} ↓</th>
          <th className={`${TH} text-right`}>{goal ? "95% band (log)" : "95% band"}</th>
          <th className={`${TH} hidden md:table-cell`}>interval</th>
          <th className={TH}>tier</th>
        </>}>
          {rows.map((r) => (
            <CupRowView key={r.club} r={r} rank={rank.get(r) ?? null}
              goal={goal} sc={sc} hoisted={hoisted} />
          ))}
          {!rows.length && (
            <tr><td colSpan={7}
              className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              No club matches this filter.</td></tr>
          )}
        </Table>
        {cup.basis && (
          <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-ink-faint">
            <span className="text-ink-low">What this field is:</span> {cup.basis}
          </p>
        )}
      </section>
    </>
  );
}

function CupRowView({ r, rank, goal, sc, hoisted }: {
  r: CupRow; rank: number | null; goal: boolean;
  sc: { lo: number; hi: number } | null; hoisted: boolean;
}) {
  const v = goal ? fmt(r.rate, 2) : fmt(r.value, 1);
  const hw = fmt(r.half_width_95, goal ? 3 : 2);
  return (
    <tr data-testid="cup-row" data-club={r.club} data-rank={rank ?? undefined}
      className="border-b border-line last:border-b-0 hover:bg-white/[0.02]">
      <td className={`${TD} w-10 text-right text-[11px] ${rank === 1 ? "text-accent" : "text-ink-faint"}`}>
        {rank ?? <Na>unranked</Na>}
      </td>
      <td className="min-w-[200px] py-1.5 pl-3 pr-4 md:w-[34%]">
        <span className="flex items-center gap-2">
          <Pip hue={r.board_column ? hueOf(r.board_column) : "var(--ink-low)"} />
          <span className={`min-w-0 truncate text-[13px] font-medium ${
            r.below_floor === true ? "text-ink-mid" : "text-ink-hi"}`}>{r.club}</span>
          {r.below_floor === true && !hoisted && (
            <Chip warn testId="floor-chip" title={r.floor_note ?? "below the floor"}>
              floor
            </Chip>
          )}
        </span>
      </td>
      <td className="w-[118px] whitespace-nowrap px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
        {r.league_display ?? r.league ?? <Na>no league attributed</Na>}
      </td>
      <td className={`${TD} w-[78px] text-right text-accent`}>
        {v ?? <Na>not measured</Na>}
      </td>
      <td className={`${TD} w-[76px] text-right text-[11px] text-ink-faint`}>
        {hw != null ? `±${hw}` : <Na>not measured</Na>}
      </td>
      <td className="hidden min-w-[120px] px-3 py-1.5 md:table-cell md:w-[20%]">
        {r.lo != null && r.hi != null && r.value != null && sc
          ? <Bar lo={r.lo} hi={r.hi} v={r.value} sc={sc} />
          : <NoBar why="no interval measured" />}
      </td>
      <td className="w-[66px] whitespace-nowrap px-3 py-1.5"><Tier t={r} /></td>
    </tr>
  );
}

// ────────────────────────────── the page switch ────────────────────────

export type FieldMode = "leagues" | "cups";

/** THE PAGE SWITCH. Bigger than a pill because it changes what the whole
 *  page is about, built from the same parts: the board's filled ground,
 *  its hairline, gold for the live choice. */
export function ModeSwitch({ mode, onChange }: {
  mode: FieldMode; onChange: (m: FieldMode) => void;
}) {
  return (
    <div role="group" aria-label="what the page rates"
      className="mb-3 inline-flex gap-[3px] rounded-[10px] border border-line bg-bs-elev2 p-[3px]">
      {(["leagues", "cups"] as const).map((m) => (
        <button key={m} type="button" data-testid={`mode-${m}`}
          aria-pressed={mode === m} onClick={() => onChange(m)}
          className={`rounded-[7px] border px-[18px] py-[9px] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
            mode === m ? "border-accent bg-bs text-ink-hi"
              : "border-transparent text-ink-low hover:text-ink-hi"}`}>
          {m}
        </button>
      ))}
    </div>
  );
}

export const FLIP = "field-flip";

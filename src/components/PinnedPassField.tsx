// THE PINNED-PASS FIELD — the three views of /bet-suggester/ratings.
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
//   CUPS ARE NEVER MERGED. Any number may be selected, and each is drawn
//     as its OWN table — own heading, own axis, own rank — because no two
//     share both a corpus and a pass count.
//   NATIONAL TEAMS ARE ONE MEASUREMENT (approved 2026-09-24). The four
//     Championships competitions are cut from ONE national-team corpus at
//     ONE pass count, so — unlike the cups — their tables share ONE axis,
//     for as long as the backend's `shared_axis.one_measurement` says so.
//     Each keeps its own rank; a team with no figure on an axis is named
//     under its table, never filled.
//   MISSING IS NEVER ZERO. An absent figure is named, never 0, 0.00, 0%
//     or a bare dash.
//   IT SHOWS; IT DOES NOT DECIDE.
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import {
  CupField, CupFields, CupRow, FIELD_AXES, FieldAxisName, LeagueField,
  LeagueFieldRow, NationCompetition, NationFields, NationRow, barRefusal,
  byValue, countWord, fmt, ladders, place, shortSha, tableScale, tierText,
} from "../lib/fieldPageApi";
import {
  RibbonPill, RibbonStrip, useLetterReveal, useRibbonSlot,
} from "./FieldPills";
import { hueOf } from "./PickerColumn";

// ─────────────────────────────── shared ink ────────────────────────────

const BTN = "flex items-center justify-center rounded-lg border bg-bs-elev2 px-2.5 py-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] transition-colors hover:border-ink-faint disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line";
const btn = (on: boolean) =>
  `${BTN} ${on ? "border-accent text-ink-hi" : "border-line text-ink-faint"}`;
/* SELECT ALL / DESELECT ALL is an ACTION, not a state, so it never takes
   aria-pressed or the lit gold border; a dashed hairline in the muted ink
   marks it as the odd one out in a row of toggles. */
const ALL = `${BTN} border-dashed border-line text-ink-low hover:text-ink-hi`;

/** ONE BUTTON, TWO WORDS. It says what a press will do: "deselect all"
 *  while every pill is lit, "select all" otherwise — so a half-lit strip
 *  fills in on the first press rather than emptying. */
function SelectAll({ full, noun, onPress, testId }: {
  full: boolean; noun: string; onPress: () => void; testId: string;
}) {
  return (
    <button type="button" data-testid={testId} onClick={onPress}
      aria-label={full ? `deselect every ${noun}` : `select every ${noun}`}
      className={ALL}>
      {full ? "deselect all" : "select all"}
    </button>
  );
}
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
  /* A SORTABLE HEADER IS A BUTTON INSIDE THE <th> (2026-09-25, audit
     F13). It was `<th onClick>`, which no keyboard can reach and no
     screen reader announces as a control. `aria-sort` stays on the <th>,
     where the table semantics put it; the button carries the name and
     the press, so Tab reaches it and Enter or Space sorts. */
  const head = heads.map(([k, label, right]) => {
    const active = k !== null && sort.key === k;
    const press = k ? () => setSort((s) => s.key === k
      ? { key: k, dir: (s.dir * -1) as 1 | -1 }
      : { key: k, dir: k === "club" || k === "column" ? 1 : -1 }) : undefined;
    return (
      <th key={label || "rank"} data-sort={k ?? undefined} scope="col"
        aria-sort={k ? (active ? (sort.dir < 0 ? "descending" : "ascending")
                               : "none") : undefined}
        title={k === "value" && axis === "defence"
          ? "ranked on the signed value — higher is better on every axis, so "
            + "the fewest goals conceded come first" : undefined}
        className={`${TH} ${right ? "text-right" : ""} ${active ? "text-accent" : ""}`}>
        {k ? (
          <button type="button" data-testid="sort-header" onClick={press}
            className={`cursor-pointer select-none rounded-sm uppercase tracking-[inherit] ${
              right ? "text-right" : "text-left"} focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent`}>
            {label}{active ? (sort.dir < 0 ? " ↓" : " ↑") : ""}
          </button>
        ) : label}
      </th>
    );
  });

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
          <SelectAll testId="league-select-all" noun="league"
            full={selected.length === cols.length} onPress={() => {
              const to = selected.length !== cols.length;
              /* only the pills that CHANGE replay the reveal */
              const moved = cols.filter((k) => (sel[k] === true) !== to);
              setSel(Object.fromEntries(cols.map((k) => [k, to])));
              const els = moved.map((k) => stripRef.current?.querySelector<HTMLElement>(
                `[data-pill][data-key="${k}"]`)).filter((e): e is HTMLElement => !!e);
              if (els.length) reveal(els);
            }} />
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
          {selected.length ? "No club matches this filter."
            : "No league selected — pick one above, or select all."}</p>
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

/** THE UNIT a cup axis is read in. */
const cupUnit = (ax: FieldAxisName) => ax === "overall" ? "elo"
  : `goals ${ax === "attack" ? "scored" : "conceded"} / match`;

/** "A", "A or B", "A or B or C" — the cups a sentence is about. */
const either = (cs: CupField[]) => cs.map((c) => c.display).join(" or ");

/* MULTI-SELECT, NEVER MERGED. Each selected cup is drawn as its own table
   with its own axis, heading and rank — no two cups share both a corpus
   and a pass count, so nothing is ranked or scaled across them. */
export function CupsView({ data, initial, modeSwitch, active }: {
  data: CupFields; initial?: string | null; modeSwitch: ReactNode;
  active: boolean;
}) {
  const cups = data.cups;
  const find = (k?: string | null) =>
    cups.find((c) => c.key === k || c.aliases.includes(k ?? ""));
  /* The first cup alone is lit, or exactly the one `?comp=` asked for. */
  const [sel, setSel] = useState<Record<string, boolean>>(() => {
    const c = find(initial) ?? cups[0];
    return c ? { [c.key]: true } : {};
  });
  const [axis, setAxis] = useState<FieldAxisName>("overall");
  const [q, setQ] = useState("");
  const stripRef = useRef<HTMLDivElement | null>(null);
  const reveal = useLetterReveal();
  useRibbonSlot(stripRef, [cups.length]);
  useEffect(() => {
    if (!active || !stripRef.current) return;
    reveal(Array.from(stripRef.current.querySelectorAll<HTMLElement>("[data-pill]")));
  }, [active, reveal]);

  const picked = cups.filter((c) => sel[c.key]);
  const full = picked.length === cups.length;
  /* A new selection in which NO cup carries the axis drops it for good,
     back to the one every field has — it does not come back on its own
     when a cup that carries it is lit again. */
  const choose = (next: Record<string, boolean>) => {
    setSel(next);
    if (!cups.some((c) => next[c.key] && c.axes[axis])) setAxis("overall");
  };
  const pillEl = (k: string) => stripRef.current?.querySelector<HTMLElement>(
    `[data-pill][data-key="${k}"]`) ?? null;

  /* AN AXIS STAYS PRESSABLE WHILE ANY SELECTED CUP CARRIES IT. */
  const ax: FieldAxisName = picked.some((c) => c.axes[axis]) ? axis : "overall";
  const goal = ax !== "overall";
  const unit = cupUnit(ax);
  const needle = q.trim().toLowerCase();
  const drawn = picked.filter((c) => c.axes[ax]);
  const missing = picked.filter((c) => !c.axes[ax]);
  const tables = drawn.map((cup) => {
    const all = byValue(cup.axes[ax]?.rows ?? []);
    const rank = new Map(all.filter((r) => r.value != null).map((r, i) => [r, i + 1]));
    const rows = needle ? all.filter((r) => r.club.toLowerCase().includes(needle)) : all;
    /* ONE TABLE, ONE AXIS — this cup's own rows, never the span of every
       cup on screen. */
    const sc = tableScale(all);
    const nbf = all.filter((r) => r.below_floor === true).length;
    const hoisted = nbf > 0 && nbf === all.length;
    const note = [
      `${all.length} clubs`,
      goal ? "goals measurement · no pass count" : `${cup.passes} passes`,
      `corpus ${shortSha(cup.corpus_sha256) ?? "not stated"}`,
      `${cup.admitted_leagues?.length ?? 0} leagues admitted`,
      ...(hoisted ? ["every club below the floor"] : nbf ? [`${nbf} below the floor`] : []),
    ].join(" · ");
    return { cup, all, rank, rows, sc, hoisted, note };
  });
  const shown = tables.reduce((n, t) => n + t.rows.length, 0);
  const of = tables.reduce((n, t) => n + t.all.length, 0);

  return (
    <>
      <div data-testid="cup-controls"
        className="z-20 mt-6 border-y border-line bg-bs pb-3 pt-4 md:sticky md:top-[var(--topbar-h)]">
        {modeSwitch}
        <div className="mb-2 flex flex-wrap items-center gap-[7px]">
          {FIELD_AXES.map((x) => {
            const has = x === "overall" || picked.some((c) => !!c.axes[x]);
            return (
              <button key={x} type="button" data-testid="cup-axis-button"
                data-axis={x} aria-pressed={ax === x} disabled={!has}
                title={has ? undefined : `${x} is not measured for ${
                  picked.length ? either(picked) : "the selected cups"} — ${
                  picked.length > 1 ? "these fields carry" : "this field carries"
                } the overall axis only`}
                onClick={() => setAxis(x)} className={btn(ax === x)}>{x}</button>
            );
          })}
          <SelectAll testId="cup-select-all" noun="cup" full={full}
            onPress={() => {
              const to = !full;
              const moved = cups.filter((c) => (sel[c.key] === true) !== to);
              choose(Object.fromEntries(cups.map((c) => [c.key, to])));
              const els = moved.map((c) => pillEl(c.key))
                .filter((e): e is HTMLElement => !!e);
              if (els.length) reveal(els);
            }} />
          <SearchBox value={q} onChange={setQ} label="find a club in the selected cups" />
          <span data-testid="cup-count" className={`${META} ml-auto`}>
            {shown} of {of} clubs
          </span>
        </div>
        <RibbonStrip stripRef={stripRef} label="cup fields shown — one table each"
          testId="cup-strip">
          {cups.map((c) => (
            <RibbonPill key={c.key} hueKey={c.key} dataKey={c.key}
              testId="cup-pill" label={c.display} on={sel[c.key] === true}
              title={`${c.display} — ${c.passes} passes, corpus ${shortSha(c.corpus_sha256)}`}
              onClick={() => {
                choose({ ...sel, [c.key]: !sel[c.key] });
                const el = pillEl(c.key);
                if (el) reveal([el]);
              }} />
          ))}
        </RibbonStrip>
      </div>

      {picked.length > 1 && (
        <p data-testid="cups-split-note"
          className="mt-5 border-l-2 border-line-strong py-2 pl-3.5 pr-3 text-[12px] leading-relaxed text-ink-low">
          <b className="font-semibold text-ink-hi">{picked.length} cups,{" "}
            {picked.length} separate measurements.</b>{" "}
          Each table has its own corpus, pass count, axis and rank. A
          club&rsquo;s figure in one says nothing about its figure in another,
          so the tables are never merged or sorted against each other.
        </p>
      )}

      {tables.map(({ cup, rank, rows, sc, hoisted, note }) => (
        <section key={cup.key} data-testid="cup-section" data-cup={cup.key}>
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
      ))}

      {missing.length > 0 && (
        <p data-testid="cup-axis-absent"
          className="mt-4 border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
          <b className="text-ink-mid">{unit} is not measured for {either(missing)}.</b>{" "}
          {missing.length > 1 ? "These fields carry" : "This field carries"} the
          overall axis only — named, not filled from another fit.
        </p>
      )}

      {!picked.length && (
        <p data-testid="cup-empty"
          className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          No cup selected — pick one above, or select all.</p>
      )}
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

// ─────────────────────────── the national-teams view ───────────────────

/** Per-row chips for the reader's caveat keys. The sentence on hover is
 *  the payload's own (`caveat_notes`); only the two-word label is here. */
const CAVEAT_LABEL: Record<string, string> = {
  band_from_zero_bridges: "no bridge",
  team_rating_mostly_prior: "mostly prior",
  goal_axes_from_a_block_before_2022: "old block",
};

/** HIGHEST VALUE FIRST, the team's name breaking a tie; a missing value
 *  last. The same order `byValue` gives a club. */
const nationOrder = (rows: readonly NationRow[]) =>
  byValue(rows.map((r) => ({ ...r, club: r.team }))) as Array<NationRow & { club: string }>;

/** Where a row's bar sits: the band the field is read on, and the full
 *  cross-confederation band around it (absent on a v1 payload, which is
 *  then the same band twice). */
function nationBands(r: NationRow) {
  const within = r.lo != null && r.hi != null ? { lo: r.lo, hi: r.hi } : null;
  const cross = r.lo_cross_confederation != null && r.hi_cross_confederation != null
    ? { lo: r.lo_cross_confederation, hi: r.hi_cross_confederation } : within;
  return { within, cross };
}

/** The tier as this view reads it: the LICENSED cut where the axis says
 *  its declared five bands are more than the field's resolution licenses
 *  (attack and defence, v2 section 4), the declared cut otherwise. */
function nationTier(r: NationRow, licensed: boolean) {
  return licensed && r.tier_set_licensed != null
    ? { tier: r.tier_licensed, tier_set: r.tier_set_licensed,
        straddles: r.straddles_licensed }
    : { tier: r.tier, tier_set: r.tier_set, straddles: r.straddles };
}

/** THE INTERVAL ON THE SHARED AXIS. The full cross-confederation band as a
 *  faint rule — the one to read against another table — and the band the
 *  field is tiered on over it, with the point. */
function NationBar({ r, sc }: { r: NationRow; sc: { lo: number; hi: number } }) {
  const { within, cross } = nationBands(r);
  if (!within || r.value == null) return <NoBar why="no interval measured" />;
  const w = place(within.lo, within.hi, r.value, sc);
  const c = cross ? place(cross.lo, cross.hi, r.value, sc) : null;
  return (
    <div data-testid="bar" data-lo={within.lo} data-hi={within.hi}
      data-cross-lo={cross?.lo} data-cross-hi={cross?.hi}
      className="relative h-[15px]"
      title={`${within.lo.toFixed(1)} to ${within.hi.toFixed(1)}`
        + (cross && (cross.lo !== within.lo || cross.hi !== within.hi)
          ? `; across confederations ${cross.lo.toFixed(1)} to ${cross.hi.toFixed(1)}` : "")}>
      <span className="absolute inset-x-0 top-[7px] h-px bg-line" />
      {c && <i data-testid="bar-cross" className="absolute top-[7px] h-px bg-ink-faint"
        style={{ left: `${c.left}%`, width: `${c.width}%` }} />}
      <i data-testid="bar-within" className="absolute top-[6.5px] h-[2px] rounded-[1px] bg-ink-low"
        style={{ left: `${w.left}%`, width: `${w.width}%` }} />
      <i data-testid="bar-point" className="-ml-px absolute top-[2px] h-[11px] w-[2px] rounded-sm bg-ink-hi"
        style={{ left: `${w.point}%` }} />
    </div>
  );
}

/* FOUR COMPETITIONS, ONE MEASUREMENT. Every table here is cut from the
   same national-team corpus at the same pass count, so unlike the cups a
   figure in one table IS comparable to a figure in another — which is why
   the tables share ONE axis rather than each owning its own. Whether they
   may is the backend's `shared_axis.one_measurement`, computed from the
   four fields' own fits; the day it is false each table is drawn on its
   own axis and the note says so. */
export function NationsView({ data, modeSwitch, active }: {
  data: NationFields; modeSwitch: ReactNode; active: boolean;
}) {
  const comps = data.competitions;
  const shared = data.shared_axis?.one_measurement === true;
  const notes = data.caveat_notes ?? {};
  const [sel, setSel] = useState<Record<string, boolean>>(
    () => (comps[0] ? { [comps[0].key]: true } : {}));
  const [axis, setAxis] = useState<FieldAxisName>("overall");
  const [q, setQ] = useState("");
  const stripRef = useRef<HTMLDivElement | null>(null);
  const reveal = useLetterReveal();
  useRibbonSlot(stripRef, [comps.length]);
  useEffect(() => {
    if (!active || !stripRef.current) return;
    reveal(Array.from(stripRef.current.querySelectorAll<HTMLElement>("[data-pill]")));
  }, [active, reveal]);
  const pillEl = (k: string) => stripRef.current?.querySelector<HTMLElement>(
    `[data-pill][data-key="${k}"]`) ?? null;

  const picked = comps.filter((c) => sel[c.key]);
  const full = picked.length === comps.length;
  const goal = axis !== "overall";
  const unit = cupUnit(axis);
  const needle = q.trim().toLowerCase();

  /* ONE AXIS ACROSS EVERY TABLE SHOWN, on the span of the selected
     competitions' full bands — the widest thing any bar draws. */
  const scaleOf = (cs: NationCompetition[]) => tableScale(cs.flatMap((c) =>
    (c.axes[axis]?.rows ?? []).map((r) => nationBands(r).cross ?? {})));
  const common = shared ? scaleOf(picked) : null;

  const tables = picked.map((c) => {
    const A = c.axes[axis];
    const all = nationOrder(A?.rows ?? []);
    const rank = new Map(all.filter((r) => r.value != null)
      .map((r, i) => [r.team_id, i + 1]));
    const rows = needle ? all.filter((r) => r.team.toLowerCase().includes(needle)) : all;
    const nbf = all.filter((r) => r.below_floor === true).length;
    const licensed = goal && A?.declared_above_licence === true
      && A.bands_licensed != null;
    const note = [
      `${all.length} of ${c.entrants} teams`,
      c.confederation,
      goal ? "goals measurement · no pass count" : `${A?.passes ?? c.passes} passes`,
      `corpus ${shortSha(c.corpus_sha256) ?? "not stated"}`,
      A?.levels != null ? `${A.levels.toFixed(1)} distinguishable levels` : "levels not stated",
      ...(licensed ? [`tiered at the ${A!.bands_licensed} bands its resolution licenses`] : []),
      ...(nbf ? [nbf === all.length ? "every team below the floor" : `${nbf} below the floor`] : []),
    ].join(" · ");
    const missing = c.not_measured.filter((m) => m.axes.includes(axis));
    return { c, A, all, rank, rows, note, licensed,
      sc: common ?? scaleOf([c]), missing };
  });
  const shown = tables.reduce((n, t) => n + t.rows.length, 0);
  const of = tables.reduce((n, t) => n + t.all.length, 0);

  return (
    <>
      <div data-testid="nation-controls"
        className="z-20 mt-6 border-y border-line bg-bs pb-3 pt-4 md:sticky md:top-[var(--topbar-h)]">
        {modeSwitch}
        <div className="mb-2 flex flex-wrap items-center gap-[7px]">
          {FIELD_AXES.map((x) => (
            <button key={x} type="button" data-testid="nation-axis-button"
              data-axis={x} aria-pressed={axis === x} onClick={() => setAxis(x)}
              className={btn(axis === x)}>{x}</button>
          ))}
          <SelectAll testId="nation-select-all" noun="competition" full={full}
            onPress={() => {
              const to = !full;
              const moved = comps.filter((c) => (sel[c.key] === true) !== to);
              setSel(Object.fromEntries(comps.map((c) => [c.key, to])));
              const els = moved.map((c) => pillEl(c.key))
                .filter((e): e is HTMLElement => !!e);
              if (els.length) reveal(els);
            }} />
          <input type="search" value={q} aria-label="find a team in the selected competitions"
            placeholder="find a team" onChange={(e) => setQ(e.target.value)}
            className="min-w-[140px] rounded-lg border border-line bg-bs-elev2 px-2.5 py-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] text-ink-hi placeholder:uppercase placeholder:text-ink-faint" />
          <span data-testid="nation-count" className={`${META} ml-auto`}>
            {shown} of {of} teams
          </span>
        </div>
        <RibbonStrip stripRef={stripRef} label="national-team competitions shown"
          testId="nation-strip">
          {comps.map((c) => (
            <RibbonPill key={c.key} hueKey={c.key} dataKey={c.key}
              testId="nation-pill" label={c.display} on={sel[c.key] === true}
              title={`${c.display} — ${c.entrants} teams · ${c.confederation}`}
              onClick={() => {
                setSel({ ...sel, [c.key]: !sel[c.key] });
                const el = pillEl(c.key);
                if (el) reveal([el]);
              }} />
          ))}
        </RibbonStrip>
      </div>

      {picked.length > 1 && (
        <p data-testid="nations-split-note"
          className="mt-5 border-l-2 border-line-strong py-2 pl-3.5 pr-3 text-[12px] leading-relaxed text-ink-low">
          {shared ? (
            <><b className="font-semibold text-ink-hi">{picked.length} competitions,
              one measurement.</b>{" "}
            Every table is cut from the same national-team corpus at the same
            pass count and drawn on one shared axis, so a team in one table can
            be read against a team in another. Each keeps its own rank.
            {data.band === "within_confederation" && (
              <>{" "}Across two tables read the faint rule under a bar — the full
              cross-confederation band; the &plusmn; column and the tiers are
              read within each confederation.</>
            )}</>
          ) : (
            <><b className="font-semibold text-ink-hi">{picked.length} competitions,
              not one measurement.</b>{" "}
            These fields do not share both a corpus and a pass count, so each
            table is drawn on its own axis and none is read against another.</>
          )}
        </p>
      )}

      {tables.map(({ c, rank, rows, note, licensed, sc, missing, all }) => (
        <section key={c.key} data-testid="nation-section" data-nation={c.key}>
          <div className="mb-3.5 mt-8 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-5">
            <h2 className="flex items-center text-lg font-medium text-ink-hi">
              <span aria-hidden className="mr-2.5 inline-block h-2 w-2 flex-none rounded-full"
                style={{ backgroundColor: hueOf(c.key) }} />
              {c.display}
            </h2>
            <p data-testid="nation-note" className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              {note}
            </p>
          </div>
          <Table testId="nation-table" section={c.key} head={<>
            <th className={TH} />
            <th className={TH}>team</th>
            <th className={`${TH} hidden md:table-cell`}>group</th>
            <th className={`${TH} text-right text-accent`}>{unit} ↓</th>
            <th className={`${TH} text-right`}
              title={data.band === "within_confederation"
                ? "within the confederation — its own level taken out; hover a figure for the full cross-confederation band"
                : undefined}>{goal ? "95% band (log)" : "95% band"}</th>
            <th className={`${TH} hidden md:table-cell`}>interval</th>
            <th className={TH}>tier</th>
            <th className={`${TH} text-right`}
              title="matches against another confederation: competitive + friendly">bridges</th>
            <th className={`${TH} text-right`}>matches</th>
          </>}>
            {rows.map((r) => (
              <NationRowView key={r.team_id} r={r} rank={rank.get(r.team_id) ?? null}
                goal={goal} sc={sc} licensed={licensed} notes={notes}
                scope={data.no_bridge_caveat_scope ?? null}
                first={!needle && rank.get(r.team_id) === 1} />
            ))}
            {!rows.length && (
              <tr><td colSpan={9}
                className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                {all.length ? "No team matches this filter." : `No team is measured on ${axis}.`}</td></tr>
            )}
          </Table>
          {missing.length > 0 && (
            <p data-testid="nation-absent"
              className="mt-4 border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
              {missing.map((m) => (
                <span key={m.team_id} data-team={m.team}>
                  <b className="text-ink-mid">{m.team} has no {axis}.</b>{" "}
                  {m.matches_in_window != null
                    ? `${m.matches_in_window} matches in the window, and ` : ""}
                  {m.why}. Named, not filled.{" "}
                </span>
              ))}
            </p>
          )}
        </section>
      ))}

      {!picked.length && (
        <p data-testid="nation-empty"
          className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          No competition selected — pick one above, or select all.</p>
      )}
    </>
  );
}

function NationRowView({ r, rank, goal, sc, licensed, notes, scope, first }: {
  r: NationRow; rank: number | null; goal: boolean;
  sc: { lo: number; hi: number } | null; licensed: boolean;
  notes: Record<string, string>; scope: string | null; first: boolean;
}) {
  const v = goal ? fmt(r.goals_per_match, 2) : fmt(r.value, 1);
  const hw = fmt(r.half_width_95, goal ? 3 : 1);
  const hwx = fmt(r.half_width_95_cross_confederation, goal ? 3 : 1);
  const cb = r.competitive_bridges, fb = r.friendly_bridges;
  const floorTitle = r.floor_failing_condition === "G3"
    ? "G3: the median team’s 95% interval is wider than one band of the field. Measured and shown; not precise enough to tier."
    : `below the floor${r.floor_failing_condition ? ` — failing condition ${r.floor_failing_condition}` : ""}`;
  return (
    <tr data-testid="nation-row" data-team={r.team} data-rank={rank ?? undefined}
      {...(r.bridge_fixtures != null
        ? { "data-bridge-fixtures": String(r.bridge_fixtures) } : {})}
      className="border-b border-line last:border-b-0 hover:bg-white/[0.02]">
      <td className={`${TD} w-10 text-right text-[11px] ${first ? "text-accent" : "text-ink-faint"}`}>
        {rank ?? <Na>unranked</Na>}
      </td>
      <td className="min-w-[200px] py-1.5 pl-3 pr-4 md:w-[34%]">
        <span className="flex items-center gap-2">
          <span className={`min-w-0 truncate text-[13px] font-medium ${
            r.below_floor === true && !goal ? "text-ink-mid" : "text-ink-hi"}`}>{r.team}</span>
          {r.below_floor === true && (
            <Chip warn testId="floor-chip" title={floorTitle}>floor</Chip>
          )}
          {(r.caveats ?? []).map((k) => (
            <Chip key={k} testId="caveat-chip"
              title={(notes[k] ?? k) + (k === "band_from_zero_bridges" && scope ? ` ${scope}` : "")}>
              <span data-caveat={k}>{CAVEAT_LABEL[k] ?? k.replace(/_/g, " ")}</span>
            </Chip>
          ))}
        </span>
      </td>
      <td className="hidden w-[118px] whitespace-nowrap px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint md:table-cell">
        {r.group ? r.group.replace(/^Group /, "") : <Na>no group</Na>}
      </td>
      <td className={`${TD} w-[78px] text-right text-accent`}>
        {v ?? <Na>not measured</Na>}
      </td>
      <td className={`${TD} w-[76px] text-right text-[11px] text-ink-faint`}
        title={hwx != null && hwx !== hw ? `±${hwx} across confederations` : undefined}>
        {hw != null ? `±${hw}` : <Na>not measured</Na>}
      </td>
      <td className="hidden min-w-[120px] px-3 py-1.5 md:table-cell md:w-[20%]">
        {sc ? <NationBar r={r} sc={sc} /> : <NoBar why="no interval in this table to scale against" />}
      </td>
      <td className="w-[66px] whitespace-nowrap px-3 py-1.5"><Tier t={nationTier(r, licensed)} /></td>
      <td data-testid="bridge-count" className={`${TD} w-[70px] whitespace-nowrap text-right text-ink-mid`}
        title={cb != null || fb != null ? `${cb ?? "?"} competitive · ${fb ?? "?"} friendly` : undefined}>
        {r.bridge_fixtures != null ? (
          <>{r.bridge_fixtures}
            {cb != null && fb != null && (
              <em className="not-italic text-[0.85em] text-ink-faint"> {cb}+{fb}</em>
            )}</>
        ) : <Na>not reported</Na>}
      </td>
      <td className={`${TD} w-[58px] text-right text-ink-mid`}>
        {r.matches ?? <Na>not reported</Na>}
      </td>
    </tr>
  );
}

// ────────────────────────────── the page switch ────────────────────────

export type FieldMode = "leagues" | "cups" | "nations";

/** The switch's segments, in order, with the word each one shows. */
export const FIELD_MODES: ReadonlyArray<readonly [FieldMode, string]> = [
  ["leagues", "leagues"], ["cups", "cups"], ["nations", "national teams"],
];

/** THE PAGE SWITCH. Bigger than a pill because it changes what the whole
 *  page is about, built from the same parts: the board's filled ground,
 *  its hairline, gold for the live choice. */
export function ModeSwitch({ mode, onChange }: {
  mode: FieldMode; onChange: (m: FieldMode) => void;
}) {
  return (
    <div role="group" aria-label="what the page rates"
      className="mb-3 inline-flex gap-[3px] rounded-[10px] border border-line bg-bs-elev2 p-[3px]">
      {FIELD_MODES.map(([m, word]) => (
        <button key={m} type="button" data-testid={`mode-${m}`}
          aria-pressed={mode === m} onClick={() => onChange(m)}
          className={`rounded-[7px] border px-[18px] py-[9px] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
            mode === m ? "border-accent bg-bs text-ink-hi"
              : "border-transparent text-ink-low hover:text-ink-hi"}`}>
          {word}
        </button>
      ))}
    </div>
  );
}

export const FLIP = "field-flip";

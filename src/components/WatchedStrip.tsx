// The watched strip — the HOLD/EXIT stage's surface, above the league
// columns on the picker board.
//
// docs/HOLD-EXIT-DESIGN.md, "The surface": *"a live section above the
// match card on the landing page. The matches I selected will be live
// there and will have all the feature you and I just discussed."*
//
// THE CHARTER IS THE MODULE'S, NOT THIS FILE'S TO SOFTEN.
// src/live/position.py: IT SHOWS; IT DOES NOT DECIDE. No string rendered
// here says cash out, sell, take, hold or exit as an instruction. Every
// sentence with an opinion in it is quoted from the payload, which is
// the layer that owns the words.
//
// THE NIGHT THIS IS CALIBRATED AGAINST. 2026-09-02, América on the
// regulation-time leg: 0.46 pre-match, 0.80 at 65' two-one up, levelled
// at 71', settled $0.00. Hold was arithmetically correct at 76', 81' and
// 87'. Nothing in the decision layer failed — the SURFACE collapsed a
// cliff into a difference ("$3.46 apart", when the two things being
// compared were $19.84 certain and 23.3% of $100). So on this surface
// the branches are drawn beside the expectation, always, and the
// expectation is labelled as the figure the position never pays.
//
// ABSENT, NOT EMPTY. The pattern is LiveScoreboard's: poll at 15s
// (matching the backend's live tick), and render NOTHING when there is
// nothing live to show, so the board is never cluttered pre-match. The
// one thing that is NOT nothing: an open position on a fixture nobody
// declared. That is the census-of-nothing finding and it renders even
// when no match is live, because it is exactly the shape of the leg this
// stage was built for.
//
// FOUR RULES THIS FILE IS RESPONSIBLE FOR, each paid for elsewhere:
//
//  1. A REFUSAL IS FIRST-CLASS. Every absence is stated by its registry
//     name with the registry's own words, never as a dash, never as a
//     zero, never imputed. The codes are DERIVED from the registry the
//     payload carries (position.REFUSAL_CODES) — this file hand-lists
//     none of them, so a ninth code names itself here the day it exists.
//  2. TWO VOCABULARIES, DELIBERATELY DISJOINT. watchlist.POLICY_CODES
//     names a decision about the monitored SET; position.REFUSAL_CODES
//     names a number that could not be PRODUCED. They are rendered under
//     different headings and are never counted together.
//  3. P&L IS SEPARATED FROM THE ARITHMETIC. It is the number the
//     operator computes anyway and the one that should least influence
//     the decision, so it never shares a line — or a block — with the
//     hold and sell figures.
//  4. G1 RIDES ON EVERY POSITION. Certainty is cheap when winning
//     (-0.2%) and dear when losing (18.6%): the fee peaks at 50c and the
//     spread is a fixed number of cents, so the most prominent feature
//     on the page quietly stops working in exactly the situation it was
//     asked for. That is said here, on every card, ahead vs behind.
//
// ACCESSIBILITY IS DECISION-SAFETY HERE, NOT DECORATION. This project
// has a live defect where a table's caveats ride only on `title=`
// attached to non-focusable spans, so a screen-reader user gets the
// number and loses the warning. NOTHING on this surface uses `title` to
// carry meaning: every caveat, every refusal and every unit is real text
// in the accessible tree.
//
// DESIGN SYSTEM: Floodlit. League hues are WAYFINDING ONLY (a dot and
// the slug — they never encode a quantity). One traffic light, --up /
// --warn / --neg. Gold --accent is brand and rank and is NEVER a
// verdict, which is why the cost of certainty below is rendered in plain
// ink: colouring "it is free to take certainty" green would be this
// surface making the recommendation the whole stage refuses to make.
import { useEffect, useRef, useState } from "react";
import {
  CertaintyPremium, EntryMap, EntryMapBranch, LiveReadComponentPayload,
  LiveReadSide, PartialExit, PartialExitFraction, PartialExitRealises,
  WatchedMatch, WatchedPosition, WatchedStripResponse, api, money,
} from "../lib/suggesterApi";
import { Eyebrow } from "./ui";

const POLL_MS = 15000; // matches the backend's 15s live tick, as LiveScoreboard does

/** League hue for WAYFINDING ONLY — a dot beside the slug, never a
 *  quantity. Keyed off the competition slug's league prefix; an
 *  unrecognised competition gets NO hue rather than a borrowed one. */
const HUE: Record<string, string> = {
  "mls": "--lg-mls", "epl": "--lg-epl",
  "la-liga": "--lg-laliga", "laliga": "--lg-laliga",
  "ligamx": "--lg-ligamx", "liga-mx": "--lg-ligamx",
};
const hueFor = (slug: string): string | null => {
  for (const key of Object.keys(HUE)) {
    if (slug === key || slug.startsWith(key + "-")) return `var(${HUE[key]})`;
  }
  return null;
};

/** Cents (dollars x 100, the payload's readable form) as a dollar
 *  figure. Widened when two decimals would round a real difference to
 *  nothing — position._d2's discipline, because "-$0.00" reads as free
 *  when it is not. */
function usdc(cents: number | null | undefined): string | null {
  if (cents == null || !Number.isFinite(cents)) return null;
  const d = cents / 100;
  const two = d.toFixed(2);
  if (Number(two) === 0 && d !== 0) return `$${d.toFixed(4)}`;
  return `$${two}`;
}

/** A decimal-string dollar figure from the payload, kept as it was
 *  written. Returns null rather than 0 when it is missing or unreadable
 *  — missing is never zero. */
function num(x: unknown): number | null {
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  if (typeof x === "string" && x.trim() !== "") {
    const v = Number(x);
    return Number.isFinite(v) ? v : null;
  }
  return null;
}

// --- refusals ---------------------------------------------------------
//
// DERIVED FROM THE REGISTRY, NEVER HAND-LISTED. Two shapes carry a
// refusal on these payloads:
//
//   (a) a block keyed by its own REGISTRY NAME at the top level of a
//       position — `no_bid`, `thin_bid`, `stale_quote`, and whatever
//       ninth finding is added next — each an object carrying a
//       `finding`. This is card._withdraw_unobtainable_exit's own move:
//       walk the registry, not a list of names written down here.
//   (b) a NAMED BLOCK that refuses by code — the certainty premium, the
//       sell branch, the exposure, the exit-obtainability withdrawal,
//       the read's own state row. Those are block PATHS, which are a
//       property of the payload's shape; the CODES they carry still come
//       from the registry and are never spelled in this file.

type Refusal = { code: string; where: string; says: string };

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** Every coded refusal on one position — WALKED, not hand-listed.
 *
 *  This used to enumerate six block PATHS by hand, which was fine while
 *  a position had six blocks. B4's partial exit refuses per FRACTION and
 *  B2's map refuses per BRANCH, per CONTRACT and per cell, so a
 *  hand-listed path set would have gone on being green while the new
 *  refusals went unnamed — the shape that let a league disarm itself on
 *  every boot for as long as a test called "both planes" listed two of
 *  three. The walk finds both shapes the payload uses, at any depth:
 *
 *    (a) a block keyed by its own REGISTRY NAME carrying a `finding`
 *        (`no_bid`, `thin_bid`, `stale_quote`, and whatever ninth
 *        finding is added next), and
 *    (b) any object carrying a `refusal_code` with its `refused`
 *        sentence.
 *
 *  Ordered by the registry's own order, then by path, so two positions
 *  never report the same findings in different orders. An unregistered
 *  code still renders — under its bare name, never glossed with a guess. */
function positionRefusals(
  p: WatchedPosition, registry: Record<string, string>,
): Refusal[] {
  const found: { code: string; where: string; says: string }[] = [];
  const seen = new Set<string>();
  const push = (code: unknown, where: string, says: unknown) => {
    if (typeof code !== "string" || !code) return;
    const key = `${code}@${where}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ code, where,
      says: typeof says === "string" && says ? says : "" });
  };
  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    if (!isObj(node)) return;
    push(node.refusal_code, path || "position", node.refused);
    for (const [k, v] of Object.entries(node)) {
      // (a) a finding riding under its own registry name
      if (k in registry && isObj(v) && typeof v.finding === "string") {
        push(k, path ? `${path}.${k}` : k, v.finding);
      }
      walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(p as Record<string, unknown>, "");
  const order = Object.keys(registry);
  const rank = (c: string) => {
    const i = order.indexOf(c);
    return i < 0 ? order.length : i;
  };
  return found.sort((a, b) =>
    rank(a.code) - rank(b.code) || a.where.localeCompare(b.where));
}

/** The read's own refusals: one per side, off the state row that was
 *  persisted at the tick. */
function readRefusals(m: WatchedMatch): Refusal[] {
  const out: Refusal[] = [];
  for (const side of Object.values(m.read?.sides ?? {})) {
    const st = side.state;
    if (st?.refusal_code) {
      out.push({ code: st.refusal_code, where: `read · ${side.side}`,
                 says: st.refusal ?? "" });
    }
  }
  return out;
}

/** The tape state's own refusals, as the payload names them. */
const stateRefusals = (m: WatchedMatch): Refusal[] =>
  (m.state?.refusals ?? []).map((r) => ({
    code: r.code, where: "state", says: r.refused }));

// --- the strip --------------------------------------------------------

export default function WatchedStrip() {
  const [data, setData] = useState<WatchedStripResponse | null>(null);
  // A FAILED POLL IS NOT A QUIET MATCH. LiveScoreboard can keep its last
  // payload silently because a scoreline that is 30s old is still a
  // scoreline. These figures are priced off a book with an age ceiling,
  // so when the newest poll fails the strip keeps showing what it had
  // and SAYS the numbers are from the earlier read, with the clock.
  const [staleSince, setStaleSince] = useState<string | null>(null);
  const lastOk = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api.watchedStrip();
        if (!alive) return;
        lastOk.current = r.generated_at;
        setData(r);
        setStaleSince(null);
      } catch {
        // no route, no credential, or a dead backend. With nothing ever
        // loaded the strip stays ABSENT; with a payload in hand it stays
        // up and dated.
        if (alive && lastOk.current) setStaleSince(lastOk.current);
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!data || data.dormant) return null;
  const matches = data.matches ?? [];
  const orphans = data.open_positions_not_monitored ?? [];
  // ABSENT, NOT EMPTY — with the one exception that is a finding.
  if (matches.length === 0 && orphans.length === 0) return null;

  const registry = data.refusal_codes ?? {};
  const bySource = data.monitored_by_source ?? {};

  return (
    <section data-testid="watched-strip" aria-labelledby="watched-strip-h"
      className="mt-8 rounded-2xl border border-line bg-elev px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <Eyebrow tone="accent">watched · hold / exit</Eyebrow>
        <h2 id="watched-strip-h" className="text-lg font-medium text-ink-hi">
          The matches you declared
        </h2>
        {/* SPLIT BY SOURCE, NEVER TOTALLED. A human-selected set carries
            selection bias by construction; one that follows open
            positions does not. One number would destroy the distinction
            forever, so there is no total here and there never will be. */}
        <p data-testid="watched-sources"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {Object.keys(bySource).length === 0
            ? "no source counts on this payload"
            : Object.keys(bySource).sort().map((k) =>
                `${k.replace(/_/g, " ")} ${bySource[k].length}`).join(" · ")}
          <span className="sr-only">
            {" "}— counted separately by source and deliberately not added
            together: a set you chose and a set that followed your open
            positions are different evidence.
          </span>
        </p>
      </div>
      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-low">
        The live read, the position, both branches and what certainty
        costs — for the matches you declared, and only those. Nothing here
        is a recommendation and no line names a moment to do anything:
        it states what the market will pay to end the exposure and what
        that costs against a measured base rate. You decide.
      </p>

      {staleSince && (
        <p data-testid="watched-stale" role="status"
          className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
          The last poll failed. Every figure below is from the read
          generated at {staleSince} and none of it has been refreshed —
          these prices are quoted off a book with an age ceiling, so
          treat them as that read and not as now.
        </p>
      )}

      {orphans.length > 0 && (
        <p data-testid="watched-orphans"
          className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
          {orphans.length} open position{orphans.length === 1 ? " is" : "s are"}{" "}
          on {orphans.length === 1 ? "a fixture" : "fixtures"} nobody
          declared — fixture {orphans.join(", ")}.{" "}
          {orphans.length === 1 ? "It is" : "They are"} not being read
          here. A set that silently omits an open position is a census of
          nothing, so it is named rather than dropped.
        </p>
      )}

      <div className="mt-5 space-y-5">
        {matches.map((m) => (
          <MatchBlock key={m.fixture_id} m={m} registry={registry}
            policyCodes={data.policy_codes ?? {}} />
        ))}
      </div>
    </section>
  );
}

// --- one watched match ------------------------------------------------

function MatchBlock({ m, registry, policyCodes }: {
  m: WatchedMatch;
  registry: Record<string, string>;
  policyCodes: Record<string, string>;
}) {
  const hue = hueFor(m.competition_slug);
  const hid = `watched-${m.fixture_id}-h`;
  const st = m.state ?? { in_play: false, minute: null,
                          score_home: null, score_away: null };
  // MISSING IS NEVER ZERO, at the top of the card as much as inside it:
  // a score the tape did not carry is not 0-0 and a clock it could not
  // read is not minute 0. Both refuse by name below.
  const score = (st.score_home != null && st.score_away != null)
    ? `${st.score_home}–${st.score_away}` : null;
  const minute = st.minute != null ? `${Math.round(st.minute)}'` : null;
  const cover = m.coverage;
  const positions = m.positions ?? [];
  const shared = [...stateRefusals(m), ...readRefusals(m)];

  return (
    <article data-testid="watched-match" data-fixture={m.fixture_id}
      aria-labelledby={hid}
      className="rounded-xl border border-line bg-bs px-4 py-4 sm:px-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {hue && (
          <i aria-hidden className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: hue }} />
        )}
        <h3 id={hid} className="text-[15px] font-medium text-ink-hi">
          {m.home} <span className="text-ink-faint">v</span> {m.away}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {m.competition_slug}
        </span>
        <span data-testid="watched-scoreline"
          className="ml-auto font-mono text-sm tabular-nums text-ink-hi">
          {score ?? (
            <span className="text-warn">score not on the tape</span>
          )}
          <span className="sr-only"> home–away, the tape row&apos;s own order</span>
          {" "}
          <span className={st.in_play ? "text-live" : "text-ink-low"}>
            {minute ?? (st.clock_display || "clock unreadable")}
          </span>
        </span>
      </header>

      {/* COVERAGE — the mid-way-join answer, and it is a POLICY fact
          about the monitored set, not a refused number, so it is worded
          and coded under its own vocabulary. */}
      <p data-testid="watched-coverage"
        className={`mt-2 text-[12px] leading-relaxed ${
          cover?.complete_history ? "text-ink-faint" : "text-warn"}`}>
        {cover?.complete_history
          ? `Declared before kickoff — ${cover.history ?? "the read spans the whole match"}.`
          : <>
              {cover?.history ?? "This watch did not begin at kickoff."}{" "}
              {cover?.no_history_is_not_quiet}
              {cover?.unobserved_before_minute != null && (
                <> The tape before minute {cover.unobserved_before_minute} does
                   not exist for this watch.</>
              )}
            </>}
        {cover?.source && (
          <span className="text-ink-faint">
            {" "}Source: {cover.source.replace(/_/g, " ")}
            {cover.source_meaning ? ` — ${cover.source_meaning}` : ""}
            {cover.actor ? `, declared by ${cover.actor}` : ""}.
          </span>
        )}
        {cover?.policy_code && (
          <span className="text-ink-faint">
            {" "}Policy: {cover.policy_code}
            {policyCodes[cover.policy_code]
              ? ` — ${policyCodes[cover.policy_code]}` : ""}.
          </span>
        )}
      </p>

      {/* 1 — THE STATE: the live read's components */}
      <ReadBlock m={m} />

      {/* 2..5 — per held position */}
      {positions.length === 0 ? (
        <p data-testid="watched-no-position"
          className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-low">
          {m.positions_note
            ?? "Nothing is on this fixture. It is watched, and the read "
               + "above is being scored either way — which is what "
               + "declaring it before the evidence buys."}
        </p>
      ) : positions.map((p, i) => (
        <PositionBlock key={p.journal_entry?.bet_id ?? i} p={p}
          registry={registry} />
      ))}

      {/* the refusals that belong to the MATCH rather than to a position */}
      <RefusalList refusals={shared} registry={registry}
        testid="watched-match-refusals"
        heading="refused on this match" />
    </article>
  );
}

// --- 1. the state: the live read's four components, per side ----------

function ReadBlock({ m }: { m: WatchedMatch }) {
  const sides = m.read?.sides ?? {};
  const names = Object.keys(sides);
  if (names.length === 0) {
    return (
      <p data-testid="watched-read-absent"
        className="mt-3 rounded-lg border border-line bg-elev2 px-3 py-2 text-[12px] leading-relaxed text-warn">
        {m.read?.words
          ?? "No component read has been persisted for this fixture. That "
             + "is not a match in which nothing has happened."}
      </p>
    );
  }
  // home first, then away, then anything else — a stable order, so the
  // same two sides are never swapped between ticks.
  const order = ["home", "away"];
  names.sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  return (
    <div data-testid="watched-read" className="mt-3 grid gap-3 sm:grid-cols-2">
      {names.map((side) => (
        <ReadSideBlock key={side} side={sides[side]}
          team={side === "home" ? m.home : side === "away" ? m.away : side} />
      ))}
    </div>
  );
}

function ReadSideBlock({ side, team }: { side: LiveReadSide; team: string }) {
  const st = side.state;
  const comps = side.components ?? {};
  return (
    <div data-testid="watched-read-side" data-side={side.side}
      className="rounded-lg border border-line bg-elev2 px-3 py-3">
      <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        <span className="text-ink-mid">{team}</span>
        {/* THE WORD IS DERIVED FROM THE NUMBERS BESIDE IT — the backend
            computes leading/level/trailing from the same score it prints,
            and both are shown here so the reader can check one against
            the other. A stored label free to drift from the numbers is
            how a winner-first score string rendered every defeat as a
            win. */}
        {st?.score_state
          ? <span>{st.score_state}
              <span className="sr-only">
                {" "}— derived from {st.score_home}–{st.score_away} home–away
                and the side this read belongs to
              </span>
            </span>
          : <span className="text-warn">state not conditionable</span>}
        {st?.minute != null && <span>{st.minute}&apos;</span>}
      </p>
      <dl className="mt-2 space-y-1.5">
        {Object.keys(comps).map((key) => (
          <ComponentRow key={key} c={comps[key]} />
        ))}
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
        Decaying reads, half-life {side.half_life_seconds}s of MATCH
        time, {side.observed_from_kickoff
          ? "observed from kickoff"
          : "observed only from the minute this watch began"}.{" "}
        {/* NO COMPOSITE BEFORE M1: the four are not even in the same
            units, and a hand-weighted blend of them would look
            authoritative while encoding nothing but somebody's
            intuition. Each rides under its own name here for the same
            reason it does on the payload. */}
        These four are shown separately and are never combined into one
        number — the weights have not been fitted, and a composite would
        be a claim.
      </p>
    </div>
  );
}

function ComponentRow({ c }: { c: LiveReadComponentPayload }) {
  // THE VALUE RIDES UNDER THE KEY THAT CARRIES ITS UNIT, and the block
  // names that key. It used to ride under the component's own name, so
  // the four blocks were one uniform subscript apart and the composite
  // the design forbids fell out of a one-line fold over them. Read
  // through `value_key` — never `component_key`, which is the name.
  const v = c ? (c[c.value_key] as number | null | undefined) : null;
  const label = (c?.component_key ?? "").replace(/_read$/, "").replace(/_/g, " ");
  return (
    <div data-testid="watched-component" data-component={c?.component_key}
      className="flex flex-wrap items-baseline gap-x-2">
      <dt className="font-mono text-[11px] text-ink-low">{label}</dt>
      <dd className="ml-auto text-right font-mono text-[13px] tabular-nums text-ink-hi">
        {v == null
          ? <span data-testid="watched-component-null" className="text-warn">
              not read this tick
              <span className="sr-only">
                {" "}— the provider did not send it, and missing is never zero
              </span>
            </span>
          : <>{v.toFixed(2)}{" "}
              <span className="font-mono text-[10px] text-ink-faint">{c.unit}</span></>}
      </dd>
      {c?.possession_is_distrusted && (
        // IN THE ACCESSIBLE TREE, NOT ON A title=. This is the input the
        // charter distrusts by name; a reader who cannot see the caveat
        // must not receive the number without it.
        <p data-testid="watched-possession-caveat"
          className="w-full text-[11px] leading-relaxed text-warn">
          {c.possession_is_distrusted}
        </p>
      )}
    </div>
  );
}

// --- 2..5 — the position, the branches, the certainty, the refusals ---

function PositionBlock({ p, registry }: {
  p: WatchedPosition; registry: Record<string, string>;
}) {
  const pos = p.position;
  const cert = p.certainty_premium;
  const refusals = positionRefusals(p, registry);
  return (
    <div data-testid="watched-position"
      data-bet={p.journal_entry?.bet_id ?? ""}
      className="mt-4 border-t border-line pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        position · {pos?.outcome_key ?? p.journal_entry?.outcome_key ?? "leg"}
        {p.journal_entry?.bet_id != null && (
          <span className="text-ink-faint"> · entry #{p.journal_entry.bet_id}</span>
        )}
      </p>

      <Ledger p={p} />
      <Branches p={p} />
      <Certainty cert={cert} />
      <PartialExits pe={p.partial_exit} registry={registry} />
      <MapBlock map={p.entry_map} registry={registry} />
      <NotBuiltUpstream p={p} />
      <RefusalList refusals={refusals} registry={registry}
        testid="watched-position-refusals"
        heading="refused on this position" />
    </div>
  );
}

// --- 2. contracts, at risk, P&L — SEPARATED from the arithmetic -------
//
// Its own block, above the branches and never on a line with them. The
// design's words: P&L "is the number the operator will compute anyway
// and the one that should least influence the decision". Showing it is
// honest; showing it beside the hold and sell figures would let it drive
// them.

function Ledger({ p }: { p: WatchedPosition }) {
  const pos = p.position;
  const contracts = pos?.size ?? null;
  const atRisk = num(pos?.entry_cost_dollars);
  const valueNow = p.value_now_cents;
  const pnl = (valueNow != null && atRisk != null)
    ? valueNow / 100 - atRisk : null;
  // WHEN THE EXIT IS WITHDRAWN, SO IS THE P&L — by the SAME code the
  // card withdrew the figure under. A mark-to-market against a bid the
  // book will not pay is the same false certainty one key over.
  const withheldBy = p.exit_is_obtainable?.refusal_code ?? null;

  return (
    <dl data-testid="watched-ledger"
      className="mt-2 flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-line bg-elev2 px-3 py-2.5">
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">contracts</dt>
        <dd data-testid="watched-contracts"
          className="font-mono text-[15px] tabular-nums text-ink-hi">
          {contracts ?? <span className="text-warn">size not on the record</span>}
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">at risk</dt>
        <dd data-testid="watched-at-risk"
          className="font-mono text-[15px] tabular-nums text-ink-hi">
          {atRisk != null
            ? `$${atRisk.toFixed(2)}`
            : <span className="text-warn">no entry cost on the record</span>}
          <span className="sr-only">
            {" "}— what this position cost, which on a binary is the whole of
            what it can lose.
          </span>
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          profit &amp; loss
        </dt>
        <dd data-testid="watched-pnl"
          className={`font-mono text-[15px] tabular-nums ${
            pnl == null ? "" : pnl > 0 ? "text-up" : pnl < 0 ? "text-neg" : "text-ink-hi"}`}>
          {pnl != null ? money(pnl) : (
            <span data-testid="watched-pnl-withheld" className="text-warn">
              {withheldBy ? `withheld · ${withheldBy}` : "no mark to price it against"}
            </span>
          )}
        </dd>
      </div>
      <p className="w-full text-[11px] leading-relaxed text-ink-faint">
        {pnl != null ? (
          <>Mark-to-bid: what hitting the live bid nets today, less what
            the position cost. The entry fee is not in that cost, and the
            entry is sunk either way — this figure is here because you
            would compute it anyway, and it is the one number on this card
            that should least influence the decision.</>
        ) : (
          <>P&amp;L is WITHHELD rather than shown as a dash: the exit it
            would be marked against was withdrawn
            {withheldBy ? ` under ${withheldBy}` : ""}, and marking a
            position against a bid the book will not pay is the same false
            certainty one key over.{" "}
            {p.value_now_withdrawn ?? ""}</>
        )}
      </p>
    </dl>
  );
}

// --- 3. the branches — the expectation AND the two outcomes behind it -

function Branches({ p }: { p: WatchedPosition }) {
  const bv = p.branch_view;
  const hold = bv?.hold?.conditioned_grid ?? bv?.hold?.engine_read;
  const sell = bv?.sell;
  return (
    <div data-testid="watched-branches"
      className="mt-3 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-line px-3 py-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          hold
        </p>
        {hold?.refused ? (
          <p className="mt-1 text-[12px] leading-relaxed text-warn">{hold.refused}</p>
        ) : hold?.branches ? (
          <>
            <p className="mt-1 font-mono text-[15px] tabular-nums text-ink-hi">
              {usdc(hold.expectation_cents) ?? `$${hold.expectation_dollars}`}
              <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                expectation
              </span>
            </p>
            {/* THE TWO THINGS THAT CAN ACTUALLY HAPPEN. The expectation
                above is a figure the position never pays; these are what
                it pays. Drawn beside it, always — this is the line the
                2026-09-02 card collapsed. */}
            <ul className="mt-1.5 space-y-1">
              {hold.branches.map((b, i) => (
                <li key={i} data-testid="watched-branch"
                  className="flex items-baseline gap-2 text-[12px] text-ink-mid">
                  <span className="w-14 shrink-0 font-mono tabular-nums text-ink-hi">
                    {b.percent.toFixed(1)}%
                  </span>
                  <span className="min-w-0">{b.outcome}</span>
                </li>
              ))}
            </ul>
            {hold.says && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
                {hold.says}
              </p>
            )}
            {hold.quantity?.n != null && (
              <p className="mt-1 font-mono text-[10px] text-ink-faint">
                n={hold.quantity.n.toLocaleString()}
                {hold.quantity.band && hold.quantity.band.every((x) => x != null)
                  ? ` · band [${hold.quantity.band.join(", ")}]` : ""}
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 text-[12px] leading-relaxed text-warn">
            no branch view on this payload
          </p>
        )}
      </div>
      <div className="rounded-lg border border-line px-3 py-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          sell into the live bid
        </p>
        {sell?.refused ? (
          <p data-testid="watched-sell-refused"
            className="mt-1 text-[12px] leading-relaxed text-warn">{sell.refused}</p>
        ) : sell?.branches ? (
          <>
            <p className="mt-1 font-mono text-[15px] tabular-nums text-ink-hi">
              {usdc(sell.expectation_cents) ?? `$${sell.expectation_dollars}`}
            </p>
            <ul className="mt-1.5 space-y-1">
              {sell.branches.map((b, i) => (
                <li key={i} data-testid="watched-branch"
                  className="flex items-baseline gap-2 text-[12px] text-ink-mid">
                  <span className="w-14 shrink-0 font-mono tabular-nums text-ink-hi">
                    {b.percent.toFixed(1)}%
                  </span>
                  <span className="min-w-0">{b.outcome}</span>
                </li>
              ))}
            </ul>
            {sell.says && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
                {sell.says}
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 text-[12px] leading-relaxed text-warn">
            no sell branch on this payload
          </p>
        )}
      </div>
      {bv?.why && (
        <p className="text-[11px] leading-relaxed text-ink-faint sm:col-span-2">
          {bv.why}
        </p>
      )}
    </div>
  );
}

// --- 4. certainty — what the market pays for it, and what it costs ----

function Certainty({ cert }: { cert: CertaintyPremium | undefined }) {
  if (!cert) {
    return (
      <p data-testid="watched-certainty-absent"
        className="mt-3 text-[12px] leading-relaxed text-warn">
        No certainty block on this payload — that is an absent block, not
        a cost of zero.
      </p>
    );
  }
  const cost = num(cert.cost_of_certainty_dollars);
  const frac = cert.cost_of_certainty_fraction_of_hold_ev;
  return (
    <div data-testid="watched-certainty"
      className="mt-3 rounded-lg border border-line px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        certainty
      </p>
      {cert.applies ? (
        <>
          <p data-testid="watched-certainty-cost"
            className="mt-1 font-mono text-[15px] tabular-nums text-ink-hi">
            {/* DELIBERATELY NOT COLOURED. A cost of certainty rendered
                green when it is negative would be this surface saying
                "free money, take it" — a verdict, which is the one thing
                the stage does not do. Gold is brand and rank and is
                never a verdict either. The words carry it. */}
            {cost != null ? (cost < 0 ? `−$${Math.abs(cost).toFixed(2)}`
                                      : `$${cost.toFixed(2)}`) : "—"}
            <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              cost of certainty
              {frac != null ? ` · ${(frac * 100).toFixed(1)}% of hold EV` : ""}
            </span>
          </p>
          {cert.line && (
            <p data-testid="watched-certainty-line"
              className="mt-1.5 font-mono text-[11px] leading-relaxed text-ink-mid">
              {cert.line}
            </p>
          )}
          {cert.removes?.says && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-mid">
              {cert.removes.says}
            </p>
          )}
          {cert.premium?.says && (
            <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
              {cert.premium.says}
            </p>
          )}
          {cert.not_a_recommendation && (
            <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
              {cert.not_a_recommendation}
            </p>
          )}
        </>
      ) : (
        <p data-testid="watched-certainty-refused"
          className="mt-1 text-[12px] leading-relaxed text-warn">
          {cert.refused ?? "the certainty premium does not apply here"}
        </p>
      )}
      <Asymmetry cert={cert} />
    </div>
  );
}

// --- G1, carried onto this surface ------------------------------------
//
// "When a watched position is BEHIND, the strip must say certainty is
// expensive there." The cost of certainty runs -0.2% when winning and
// 18.6% when losing, because the fee peaks at 50c and the spread is a
// fixed number of cents — so both are enormous in proportion to a
// position trading at 13c and trivial against one at 79c. The most
// prominent feature on the page structurally stops working in exactly
// the situation it was asked for, and that is said here on EVERY
// position, ahead or behind, rather than left to be discovered.
//
// FAIL CLOSED. `position_is_ahead` absent is not "ahead": it is unknown,
// and it says so. The ahead/behind word itself is the backend's, derived
// from the same two numbers the scoreline prints, so this file never
// computes a second one that could disagree with it.

function Asymmetry({ cert }: { cert: CertaintyPremium }) {
  const a = cert.asymmetry;
  const ahead = a?.position_is_ahead;
  const behind = ahead === false;
  const unknown = a == null || ahead == null;
  return (
    <p data-testid="watched-g1" data-ahead={String(ahead ?? "unknown")}
      className={`mt-2 rounded-md px-2.5 py-2 text-[12px] leading-relaxed ${
        behind || unknown
          ? "border border-warn/40 bg-warn/5 text-warn"
          : "text-ink-faint"}`}>
      {behind && (
        <strong className="font-semibold">
          Certainty is at its most expensive here.{" "}
        </strong>
      )}
      {unknown && (
        <strong className="font-semibold">
          Whether this position is ahead is not on this payload, so the
          strip does not assume it is.{" "}
        </strong>
      )}
      {a?.finding ? <>{a.finding}{" "}</> : null}
      {a?.rule
        ?? "Certainty is cheap exactly when you are winning and dear "
           + "exactly when you are losing, and that is structural, not a "
           + "setting: it protects gains and cannot protect losses."}
    </p>
  );
}

// --- 5. B4, the partial exit ------------------------------------------
//
// "Price 25/50/75/100% against the actual book rather than the top of
// it, since the top of it is often 0-1 contracts" (HOLD-EXIT-DESIGN B4).
// The backend walks the yes-side ladder captured with the SAME quote row
// the whole-position figure reads and states, per fraction, what it
// REALISES and what it LEAVES EXPOSED.
//
// NO FRACTION IS HIGHLIGHTED. Every row gets the same border, the same
// ink and the same weight; the rows sit in the registry's own order
// (25 / 50 / 75 / 100) and nothing sorts them by attractiveness. A
// surface that made one row look like the answer would be recommending
// a clip, which is the one thing this stage does not do — and gold is
// brand here, never a verdict, so no row is ever gold either.
//
// A WITHDRAWN ROW SAYS SO. On a leg held twice the ladder is one pool,
// and the card withdraws the rows the pool cannot pay together. The
// withdrawn figure is kept by the payload under its OWN key
// (`realises_alone_withdrawn`) and is rendered under that name, struck
// out of the claim, so the number is visible as history and never as an
// exit the operator can have.

/** Whole-dollar rendering of the payload's own decimal strings. The
 *  string is never re-derived: it is parsed only to choose the sign, and
 *  the payload's digits are what is printed. */
function dollars(x: string | null | undefined): string | null {
  if (x == null || x === "") return null;
  const v = Number(x);
  if (!Number.isFinite(v)) return null;
  return v < 0 ? `−$${Math.abs(v).toFixed(2)}` : `$${v.toFixed(2)}`;
}

function Realises({ r, withdrawn }: {
  r: PartialExitRealises; withdrawn?: boolean;
}) {
  return (
    <div data-testid={withdrawn ? "watched-fraction-realises-withdrawn"
                                : "watched-fraction-realises"}
      className="mt-1">
      <p className="font-mono text-[12px] tabular-nums text-ink-hi">
        {withdrawn && (
          <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-warn">
            withdrawn ·{" "}
          </span>
        )}
        net {dollars(r.net_dollars)}
        <span className="text-ink-faint">
          {" "}· {r.contracts} contracts at {r.average_price_dollars} average
          {" "}across {r.levels_walked} level{r.levels_walked === 1 ? "" : "s"}
          {" "}· gross {dollars(r.gross_dollars)} less fee{" "}
          {dollars(r.fee_dollars)}
        </span>
      </p>
      <ul className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
        {r.allocations?.map((a) => (
          <li key={a.seq}
            className="font-mono text-[10px] tabular-nums text-ink-faint">
            {a.qty} @ ${a.price} <span className="text-ink-low">fee ${a.fee}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Fraction({ f }: { f: PartialExitFraction }) {
  const withdrawnByLeg = f.executability?.refused_by === "shared_exit_book";
  const alone = f.realises_alone_withdrawn;
  return (
    // IDENTICAL CHROME ON EVERY ROW. Same border, same padding, same
    // ink — a priced row and a refused row differ only in the words
    // they carry, never in prominence.
    <li data-testid="watched-fraction" data-label={f.label}
      data-obtainable={String(f.obtainable)}
      data-withdrawn-by={f.executability?.refused_by ?? ""}
      className="rounded-lg border border-line px-3 py-2">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-[13px] tabular-nums text-ink-hi">
          {f.label}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-ink-low">
          {f.contracts} of {f.of_contracts} contracts
        </span>
        {f.rounded_down_from && (
          <span className="font-mono text-[10px] text-warn">
            rounded down from {f.rounded_down_from}
          </span>
        )}
      </p>

      {/* the row's own arithmetic, or its own absence — never both */}
      {f.realises ? <Realises r={f.realises} /> : null}

      {f.no_whole_contract && (
        // NO REGISTRY CODE IS BORROWED HERE. A quarter of three
        // contracts is arithmetic about the position, not a finding
        // about the book, and the payload refuses to label it with one.
        <p data-testid="watched-fraction-no-whole"
          className="mt-1 text-[11px] leading-relaxed text-warn">
          {f.no_whole_contract}
        </p>
      )}

      {f.refused && (
        <p data-testid="watched-fraction-refused" data-code={f.refusal_code}
          className="mt-1 text-[12px] leading-relaxed text-warn">
          <span className="font-mono font-semibold">
            {withdrawnByLeg ? "withdrawn · " : "refused · "}
          </span>
          {f.refused}
        </p>
      )}
      {/* a second finding never hides behind the first */}
      {f.refusals && Object.keys(f.refusals).length > 1 && (
        <ul className="mt-1 space-y-0.5">
          {Object.keys(f.refusals).filter((c) => c !== f.refusal_code)
            .map((c) => (
              <li key={c} data-testid="watched-fraction-also-refused"
                data-code={c}
                className="text-[11px] leading-relaxed text-warn">
                {f.refusals![c]}
              </li>
            ))}
        </ul>
      )}

      {alone && (
        <>
          <Realises r={alone} withdrawn />
          <p className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
            That figure is what this row would have realised on a ladder
            nobody else was on. It is kept here as the withdrawn number
            and is not an exit this position can take: the ladder is one
            pool and the leg is held more than once.
          </p>
        </>
      )}

      {f.leg_consult && (
        <p data-testid="watched-fraction-leg-consult"
          data-holds={String(f.leg_consult.holds)}
          className={`mt-1 text-[11px] leading-relaxed ${
            f.leg_consult.holds ? "text-ink-faint" : "text-warn"}`}>
          {f.leg_consult.says}
          {f.leg_consult.unpriced_contracts && (
            <> A sibling position on this leg could not be priced at all;
              its {f.leg_consult.unpriced_contracts} contract(s) are
              counted into that total rather than assumed away.</>
          )}
        </p>
      )}

      {f.remains && (
        <p data-testid="watched-fraction-remains"
          className="mt-1 text-[12px] leading-relaxed text-ink-mid">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            remains{" "}
          </span>
          {f.remains.says}
          {f.remains.expected_at_engine_read_dollars != null && (
            <span className="text-ink-faint">
              {" "}Expected at the engine&apos;s read:{" "}
              {dollars(f.remains.expected_at_engine_read_dollars)}
              {f.remains.expected_basis ? ` — ${f.remains.expected_basis}` : ""}
            </span>
          )}
          {f.remains.expected_refused && (
            <span className="block text-warn">
              {f.remains.expected_refused}
            </span>
          )}
        </p>
      )}

      {(f.vs_whole_position || f.vs_whole_position_alone) && (
        <p data-testid="watched-fraction-vs-whole"
          data-matches={String(f.matches_whole_position_exit)}
          className="mt-1 text-[11px] leading-relaxed text-ink-faint">
          {f.vs_whole_position ?? f.vs_whole_position_alone}
        </p>
      )}
      <p className="mt-1 text-[11px] leading-relaxed text-ink-low">
        {f.says}
      </p>
    </li>
  );
}

function PartialExits({ pe, registry }: {
  pe: PartialExit | undefined; registry: Record<string, string>;
}) {
  if (!pe) {
    // ABSENT, NOT EMPTY — and absent is not "no clip is available".
    return (
      <p data-testid="watched-partial-exit-absent"
        className="mt-3 text-[12px] leading-relaxed text-warn">
        No partial-exit block on this payload. That is a block this read
        did not carry, not a finding that a clip is unobtainable, and no
        fraction is priced in its place.
      </p>
    );
  }
  const book = pe.book;
  return (
    <div data-testid="watched-partial-exit"
      className="mt-3 rounded-lg border border-line px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        partial exit · {pe.fractions.length} sizes of one trade ·{" "}
        {pe.fractions_priced} priced
      </p>

      {/* THE BOOK THE ROWS WALK, stated before the rows do. */}
      <p data-testid="watched-partial-exit-book"
        data-source={book?.source}
        className="mt-1 font-mono text-[11px] leading-relaxed text-ink-low">
        ladder: {(book?.source ?? "unknown").replace(/_/g, " ")}
        {book?.quote_id != null ? ` · quote #${book.quote_id}` : ""}
        {book?.resting_total != null
          ? ` · ${book.resting_total} resting across ${
              book.levels?.length ?? 0} level(s)` : ""}
        {book?.captured_at ? ` · captured ${book.captured_at}` : ""}
        {book?.levels?.length ? (
          <span className="block text-ink-faint">
            {book.levels.map((l) => `${l.size} @ $${l.price_dollars}`).join(" · ")}
          </span>
        ) : null}
        {book?.levels_from_another_quote_dropped
          ? (
            <span className="block text-warn">
              {book.levels_from_another_quote_dropped} depth level(s)
              belonging to another quote were dropped rather than
              substituted.
            </span>
          ) : null}
        {book?.best_level_matches_top_of_book === false && (
          <span className="block text-warn">
            The best level on the ladder does not match the quote&apos;s own
            top of book.
          </span>
        )}
      </p>

      {/* A FAILED DEPTH READ IS NAMED, never folded into "no depth". */}
      {book?.depth_read && (
        <p data-testid="watched-partial-exit-depth-failed"
          className="mt-1 rounded-md border border-warn/40 bg-warn/5 px-2.5 py-2 text-[11px] leading-relaxed text-warn">
          The depth read failed: {book.depth_read}
          {book.depth_read_note ? ` — ${book.depth_read_note}` : ""}
        </p>
      )}

      {/* the block itself may refuse, and then no row prints a figure */}
      {pe.refused && (
        <p data-testid="watched-partial-exit-refused" data-code={pe.refusal_code}
          className="mt-1 text-[12px] leading-relaxed text-warn">
          {pe.refused}
        </p>
      )}

      {pe.withdrawn_on_shared_ladder?.length ? (
        <p data-testid="watched-partial-exit-withdrawn"
          className="mt-1 text-[12px] leading-relaxed text-warn">
          Withdrawn on the shared ladder:{" "}
          {pe.withdrawn_on_shared_ladder.join(", ")}. {" "}
          {pe.withdrawn_on_shared_ladder_rule}
        </p>
      ) : null}

      <ul className="mt-2 space-y-2">
        {pe.fractions.map((f) => <Fraction key={f.label} f={f} />)}
      </ul>

      {/* every caveat the block carries, once, in the accessible tree */}
      <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-faint">
        <p>{pe.rule}</p>
        <p>{pe.fee_basis}</p>
        <p>{pe.whole_contracts}</p>
        <p>{pe.common_case}</p>
        <p data-testid="watched-partial-exit-not-a-recommendation">
          {pe.not_a_recommendation}
        </p>
        {pe.executability?.rule && <p>{pe.executability.rule}</p>}
        {pe.executability?.consulted?.length ? (
          <p data-testid="watched-partial-exit-consulted">
            Every row consulted, in the registry&apos;s own order:{" "}
            {pe.executability.consulted.map((c) =>
              registry[c] ? `${c} (${registry[c]})` : c).join("; ")}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

// --- 6. B2, the minute-0 map ------------------------------------------
//
// The map drawn AT PURCHASE: match states that may arise, the measured
// frequency of what happened from each in the corpus with its n and its
// Wilson band, and what the held contract settles at either way.
//
// IT IS A MAP, NOT A VERDICT, and the payload says so in its own words,
// which are rendered rather than paraphrased. Which branch a match takes
// is not known at minute 0 and nothing here claims to know it.
//
// THE CATEGORY WALL IS RENDERED, NOT ASSUMED. A branch's held number is
// either a win probability or a LOWER BOUND on one; they answer
// different questions, they are not comparable, and they never share a
// bar or a column here. The number is read through the payload's own
// `quantity_key` — the same discipline the live read's `value_key`
// enforces — so this file can never quietly read one as the other.
//
// THE BRANCHES ARE THE PAYLOAD'S, DERIVED. entry_map.BRANCHES carries
// four; a fifth needs no edit here. (The brief for this surface said
// three; the registry says four, and the registry is what is drawn.)

/** The number a branch's held quantity carries, read through the key the
 *  payload names. Never off a key spelled in this file. */
function quantityNumbers(q: Record<string, unknown> | undefined) {
  if (!q || typeof q.quantity_key !== "string") return null;
  const key = q.quantity_key;
  const pct = q[`${key}_percent`];
  const band = q[`${key}_wilson_band_percent`];
  return {
    key,
    percent: typeof pct === "number" ? pct : null,
    band: Array.isArray(band) ? (band as (number | null)[]) : null,
    n: typeof q.n === "number" ? q.n : null,
    answers: typeof q.answers === "string" ? q.answers : "",
    note: typeof q.note === "string" ? q.note : "",
    cell: typeof q.source_cell === "string" ? q.source_cell : "",
  };
}

/** The reader-facing name of a quantity, derived from its own key so a
 *  lower bound can never be labelled as an estimate. */
const QUANTITY_WORD: Record<string, string> = {
  p_win: "P(this contract wins)",
  lower_bound_on_p_win: "LOWER BOUND on P(this contract wins)",
};

function bandText(band: (number | null)[] | null): string {
  if (!band || band.length < 2 || band.some((x) => x == null)) return "";
  return ` · band [${band[0]}, ${band[1]}]`;
}

/** Every refusal on the map THIS SURFACE DRAWS, collected once and used
 *  twice: to render the rows and to state how many of the map's own
 *  tally are visible. One collector, so the printed number can never
 *  drift from the rows beside it. */
function mapRefusalsDrawn(map: EntryMap): { where: string; code: string }[] {
  const out: { where: string; code: string }[] = [];
  const add = (where: string, code: unknown) => {
    if (typeof code === "string" && code) out.push({ where, code });
  };
  add("favourite", map.favourite?.refusal_code);
  for (const [k, b] of Object.entries(map.branches ?? {})) {
    add(`${k}.branch`, b.refusal_code);
    add(`${k}.your_contract`, b.your_contract?.refusal_code);
    add(`${k}.reached`, b.reached?.refusal_code);
    add(`${k}.reached.by_side`, b.reached?.by_side?.refusal_code);
    add(`${k}.expected`, b.dollars?.expected?.refusal_code);
  }
  return out;
}

function MapBranch({ name, b }: { name: string; b: EntryMapBranch }) {
  const q = quantityNumbers(b.your_contract?.quantity as
    Record<string, unknown> | undefined);
  const exp = b.dollars?.expected;
  const priced = exp != null && exp.priced !== false
    && exp.refusal_code == null && exp.settlement_dollars != null;
  return (
    <li data-testid="watched-map-branch" data-branch={name}
      data-quantity={q?.key ?? ""}
      className="rounded-lg border border-line px-3 py-2">
      <p className="text-[12px] leading-relaxed text-ink-hi">
        {b.state ?? name.replace(/_/g, " ")}
      </p>
      {b.relation_to_you && (
        <p className="text-[11px] leading-relaxed text-ink-low">
          {b.relation_to_you}
        </p>
      )}

      {/* the whole branch may refuse — and then it carries no number */}
      {b.refusal_code && (
        <p data-testid="watched-map-refusal" data-where={`${name}.branch`}
          data-code={b.refusal_code}
          className="mt-1 text-[12px] leading-relaxed text-warn">
          {b.refused}
        </p>
      )}

      {b.reached && (
        <p data-testid="watched-map-reached"
          className="mt-1 font-mono text-[11px] leading-relaxed text-ink-mid">
          {b.reached.p_first_goal_percent != null ? (
            <>
              reaching this state: {b.reached.p_first_goal_percent.toFixed(1)}%
              {bandText(b.reached.p_first_goal_wilson_band_percent ?? null)}
              {b.reached.n != null ? ` · n=${b.reached.n.toLocaleString()}` : ""}
              {b.reached.k != null ? ` · k=${b.reached.k.toLocaleString()}` : ""}
            </>
          ) : (
            <span data-testid={b.reached.refusal_code
              ? "watched-map-refusal" : undefined}
              data-where={`${name}.reached`} data-code={b.reached.refusal_code}
              className="text-warn">
              {b.reached.refused ?? "no measured rate for reaching this state"}
            </span>
          )}
          <span className="block font-sans text-[11px] text-ink-faint">
            {b.reached.state}
            {b.reached.either_side ? ` — ${b.reached.either_side}` : ""}
            {b.reached.composed_from?.length
              ? ` (composed from ${b.reached.composed_from.join(", ")})` : ""}
          </span>
          {b.reached.by_side?.refusal_code && (
            <span data-testid="watched-map-refusal"
              data-where={`${name}.reached.by_side`}
              data-code={b.reached.by_side.refusal_code}
              className="block font-sans text-[11px] text-warn">
              {b.reached.by_side.refused}
            </span>
          )}
        </p>
      )}

      {/* THE HELD CONTRACT. The word beside the number is derived from
          the quantity's own key, so a bound is never drawn as an
          estimate and the two never share a bar. */}
      {b.your_contract?.refusal_code ? (
        <p data-testid="watched-map-refusal"
          data-where={`${name}.your_contract`}
          data-code={b.your_contract.refusal_code}
          className="mt-1 text-[12px] leading-relaxed text-warn">
          {b.your_contract.refused}
        </p>
      ) : q ? (
        <p data-testid="watched-map-contract"
          className="mt-1 text-[12px] leading-relaxed text-ink-mid">
          <span className="font-mono text-[13px] tabular-nums text-ink-hi">
            {q.percent != null ? `${q.percent.toFixed(1)}%` : "—"}
          </span>{" "}
          {/* THE WORD IS DERIVED FROM THE KEY, and it has its own handle
              so a guard can read the LABEL rather than the paragraph —
              the payload's `answers` sentence beside it also contains
              the phrase "LOWER BOUND", which is exactly how a scan of
              the whole block would keep passing while the label drifted
              to calling a bound an estimate. */}
          <span data-testid="watched-map-quantity-word"
            data-quantity-key={q.key}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            {QUANTITY_WORD[q.key] ?? q.key.replace(/_/g, " ")}
          </span>
          <span className="font-mono text-[10px] text-ink-faint">
            {bandText(q.band)}
            {q.n != null ? ` · n=${q.n.toLocaleString()}` : ""}
          </span>
          <span className="block text-[11px] text-ink-faint">
            answers: {q.answers}
          </span>
          {q.note && (
            <span className="block text-[11px] text-ink-faint">{q.note}</span>
          )}
        </p>
      ) : null}

      {/* WHAT IT PAYS — the two outcomes, always, beside any mean. */}
      {b.dollars?.settles && (
        <p data-testid="watched-map-dollars"
          className="mt-1 font-mono text-[11px] tabular-nums text-ink-mid">
          settles {dollars(b.dollars.settles.if_your_side_wins_dollars)} or{" "}
          {dollars(b.dollars.settles.otherwise_dollars)}
          {b.dollars.pnl && (
            <> · P&amp;L {dollars(b.dollars.pnl.if_your_side_wins_dollars)} or{" "}
              {dollars(b.dollars.pnl.otherwise_dollars)}</>
          )}
        </p>
      )}
      {exp && (
        priced ? (
          <p data-testid="watched-map-expected"
            className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-faint">
            expected {dollars(exp.settlement_dollars)}
            {exp.settlement_dollars_wilson_band?.length === 2
              ? ` · band [${exp.settlement_dollars_wilson_band.join(", ")}]` : ""}
            {exp.n != null ? ` · n=${exp.n.toLocaleString()}` : ""}
            <span className="block font-sans text-ink-faint">
              {exp.certainty_vs_mean}
            </span>
          </p>
        ) : exp.refusal_code ? (
          <p data-testid="watched-map-refusal" data-where={`${name}.expected`}
            data-code={exp.refusal_code}
            className="mt-0.5 text-[11px] leading-relaxed text-warn">
            {exp.refused}
          </p>
        ) : (
          // NOT REFUSED — REFUSED BY TYPE. An expectation off a LOWER
          // BOUND would be the 2026-09-02 substitution in dollars, so
          // the backend never computes one and the block says why. It
          // carries no registry code because nothing was missing.
          <p data-testid="watched-map-expected-not-priced"
            className="mt-0.5 text-[11px] leading-relaxed text-warn">
            {exp.not_priced}
          </p>
        )
      )}
      {b.dollars?.branches_not_averages && (
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
          {b.dollars.branches_not_averages}
        </p>
      )}
    </li>
  );
}

function MapBlock({ map, registry }: {
  map: EntryMap | undefined; registry: Record<string, string>;
}) {
  if (!map) return null;   // absent, not empty — no map, no block
  const branches = map.branches ?? {};
  const names = Object.keys(branches);
  const fav = map.favourite;
  const started = map.match_now?.started === true;
  // DERIVED FROM THE PAYLOAD'S OWN TALLY, NEVER FROM A GUESS. The map
  // counts every refusal on itself; this surface draws the branch-level
  // ones. Both numbers are printed so a reader can see the difference
  // rather than be told the visible ones are all of them.
  const shown = mapRefusalsDrawn(map).length;
  const tally = map.refusals?.total ?? null;
  // ONE CATEGORY RULE, QUOTED ONCE — the payload writes the same
  // sentence on every quantity that carries one.
  const categoryRule = names.map((k) =>
    (branches[k].your_contract?.quantity as Record<string, unknown> | undefined)
      ?.category_rule).find((x) => typeof x === "string") as string | undefined;

  return (
    <div data-testid="watched-entry-map" data-started={String(started)}
      className="mt-3 rounded-lg border border-line px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        the map · {map.drawn_from} · {map.version}
      </p>

      {/* WHETHER A BALL HAS BEEN KICKED IS THE PAYLOAD'S ANSWER, not a
          clock in this file. A started fixture keeps the map and says
          the map is history, in the backend's own words. */}
      <p data-testid="watched-map-when"
        className={`mt-1 text-[11px] leading-relaxed ${
          started ? "text-warn" : "text-ink-faint"}`}>
        {map.match_now?.witness ? `${map.match_now.witness} ` : ""}
        {map.match_now?.note}
      </p>

      <p data-testid="watched-map-favourite"
        className="mt-1 text-[12px] leading-relaxed text-ink-mid">
        {fav?.refusal_code ? (
          <span data-testid="watched-map-refusal" data-where="favourite"
            data-code={fav.refusal_code} className="text-warn">
            {fav.refused}
          </span>
        ) : (
          <>
            Favourite at the lock: {fav?.fav_side}
            {fav?.fav_p != null ? ` at ${(fav.fav_p * 100).toFixed(1)}%` : ""}
            {fav?.band ? `, gap band ${fav.band}` : ""}.
            {map.you_are ? ` ${map.you_are.says}.` : ""}
          </>
        )}
      </p>

      {map.grids && (
        <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
          Cells read on the {map.grids.variant} variant, floor n ≥{" "}
          {map.grids.min_n_floor}. {map.grids.floor_rule}
        </p>
      )}

      {map.red_card?.withdraws || map.red_card?.void ? (
        <p data-testid="watched-map-voided"
          className="mt-1 text-[12px] leading-relaxed text-warn">
          {/* the withdrawal is an object; render ITS OWN words, by name.
              `because` says which witness (or which failure to consult
              one) withdrew the map, `rule` states the rule -- neither is
              restated here. The gate is `withdraws`, the QUESTION, not
              `void`, the FACT: an unreadable tape withdraws without
              asserting a dismissal, and reading the fact would draw a
              full map on a tape nobody could read. */}
          {[map.red_card.withdrawal?.because, map.red_card.withdrawal?.rule]
            .filter(Boolean).join(" ")
            || "a dismissal voids every grid-derived number on this map "
               + "from first sighting"}
        </p>
      ) : map.red_card?.tape_note ? (
        <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
          {map.red_card.tape_note}
        </p>
      ) : null}

      {names.length > 0 && (
        <ul className="mt-2 space-y-2">
          {names.map((k) => (
            <MapBranch key={k} name={k} b={branches[k]} />
          ))}
        </ul>
      )}

      <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-faint">
        <p data-testid="watched-map-not-a-verdict">{map.a_map_not_a_verdict}</p>
        <p data-testid="watched-map-no-window">{map.no_response_window}</p>
        {map.not_a_signal && <p>{map.not_a_signal}</p>}
        {categoryRule && (
          <p data-testid="watched-map-category-rule">{categoryRule}</p>
        )}
        {tally != null && (
          <p data-testid="watched-map-refusal-count">
            The map counts {tally} refusal{tally === 1 ? "" : "s"} on itself
            {map.refusals?.count_by_code
              ? ` (${Object.keys(map.refusals.count_by_code).sort()
                  .map((c) => `${c} ${map.refusals!.count_by_code[c]}`)
                  .join(", ")})`
              : ""}
            ; {shown} of them {shown === 1 ? "is" : "are"} drawn above. The
            rest sit inside grid subtrees this surface does not draw —
            they are counted here rather than left to be assumed away.
            {map.refusals?.codes && (
              <span className="block">
                {Object.keys(map.refusals.codes).map((c) =>
                  `${c}: ${registry[c] ?? map.refusals!.codes![c]}`).join(" · ")}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// --- 7. what this surface knows it cannot draw -------------------------
//
// REGISTERED, NOT PRETENDED. B3 (a blended live rate, to be shown BESIDE
// the engine's read as a second opinion and never in its place) does not
// exist in the backend tree this file was built against: there is no
// src/live/live_rates.py, so no payload carries a blended rate and no
// shape of one has been recorded. Rather than draw a block against a
// shape nobody sends — which is how a surface certifies a reader that
// cannot read the real payload — the hole is written down here with the
// condition that closes it.
//
// The guard this pays for: a key named below that ARRIVES on a position
// is NAMED on the surface instead of being silently dropped, and the day
// its shape is recorded the record retires with the block that replaces
// it. `closes_when` is the whole point; an absence label without one is
// prose, not a record.
export const UNRENDERED_PAYLOAD_KEYS: Record<string, {
  finding: string; closes_when: string;
}> = {
  blended_rate: {
    finding: "B3 SHIPPED (backend 688a696, src/live/live_rates.py) and "
      + "REFUSES EVERY BLEND: M1 published k but not the shots-to-goals "
      + "conversion k was fitted with, so live_rates carries a "
      + "registered hole, m1_conversion_unpublished, and its table is "
      + "empty. No POSITION payload carries `blended_rate` yet, so "
      + "nothing on this card stands in for one and nothing is drawn. "
      + "This is an absent second opinion, not agreement with the "
      + "engine.",
    closes_when: "a position payload carries `blended_rate` AND its "
      + "shape has been recorded off the backend's own emitter; then "
      + "this record retires and the rate is drawn BESIDE the engine's "
      + "read — never in its place — with its own registered hole "
      + "beside it.",
  },
};

function NotBuiltUpstream({ p }: { p: WatchedPosition }) {
  const present = Object.keys(UNRENDERED_PAYLOAD_KEYS)
    .filter((k) => (p as Record<string, unknown>)[k] !== undefined);
  if (present.length === 0) return null;
  return (
    <div data-testid="watched-unrendered" className="mt-3">
      {present.map((k) => (
        <p key={k} data-testid="watched-unrendered-key" data-key={k}
          className="rounded-md border border-warn/40 bg-warn/5 px-2.5 py-2 text-[11px] leading-relaxed text-warn">
          This payload carries <span className="font-mono">{k}</span>, and
          this surface has no recorded shape for it, so it is named rather
          than drawn or dropped. {UNRENDERED_PAYLOAD_KEYS[k].finding}{" "}
          Closes when: {UNRENDERED_PAYLOAD_KEYS[k].closes_when}
        </p>
      ))}
    </div>
  );
}

// --- 8. the refusals, by name -----------------------------------------

function RefusalList({ refusals, registry, testid, heading }: {
  refusals: Refusal[];
  registry: Record<string, string>;
  testid: string;
  heading: string;
}) {
  if (refusals.length === 0) return null;
  return (
    <div data-testid={testid} className="mt-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {heading} · {refusals.length}
      </p>
      <ul className="mt-1.5 space-y-1.5">
        {refusals.map((r) => (
          <li key={`${r.code}@${r.where}`} data-testid="watched-refusal"
            data-code={r.code}
            className="text-[12px] leading-relaxed text-warn">
            <span className="font-mono font-semibold">{r.code}</span>
            <span className="font-mono text-ink-faint"> · {r.where}</span>
            {/* the block's own sentence, then the REGISTRY's definition
                of the name — both visible, neither on a title=. A code
                the payload's registry does not define is shown as the
                bare name rather than glossed with a guess. */}
            {r.says && <> — {r.says}</>}
            {registry[r.code] && (
              <span className="block text-ink-low">
                {r.code}: {registry[r.code]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  CertaintyPremium, LiveReadComponentPayload, LiveReadSide, WatchedMatch,
  WatchedPosition, WatchedStripResponse, api, money,
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

/** Every coded refusal on one position, in the registry's own order so
 *  two positions never report the same findings in different orders. */
function positionRefusals(
  p: WatchedPosition, registry: Record<string, string>,
): Refusal[] {
  const out: Refusal[] = [];
  const seen = new Set<string>();
  const push = (code: unknown, where: string, says: unknown) => {
    if (typeof code !== "string" || !code) return;
    const key = `${code}@${where}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ code, where,
      says: typeof says === "string" && says ? says : "" });
  };
  // (a) registry-derived: the executability findings, in registry order
  for (const code of Object.keys(registry)) {
    const blk = (p as Record<string, unknown>)[code];
    if (isObj(blk) && typeof blk.finding === "string") {
      push(code, code, blk.finding);
    }
  }
  // (b) the blocks that refuse by code
  const named: [string, unknown][] = [
    ["certainty_premium", p.certainty_premium],
    ["branch_view.sell", p.branch_view?.sell],
    ["branch_view.hold.conditioned_grid", p.branch_view?.hold?.conditioned_grid],
    ["exposure", p.exposure],
    ["exit_is_obtainable", p.exit_is_obtainable],
    ["red_card_void", p.red_card_void],
  ];
  for (const [where, blk] of named) {
    if (!isObj(blk)) continue;
    push(blk.refusal_code, where, blk.refused);
  }
  return out;
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

// --- 5. the refusals, by name -----------------------------------------

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

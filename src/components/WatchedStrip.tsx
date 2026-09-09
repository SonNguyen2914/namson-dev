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
// ABSENT, NOT EMPTY — AND REFUSED IS NEITHER. The pattern is
// LiveScoreboard's: poll at 15s (matching the backend's live tick), and
// render NOTHING when the read came back and said there is nothing to
// show, so the board is never cluttered pre-match. Two things are NOT
// nothing:
//   - an open position on a fixture nobody declared. That is the
//     census-of-nothing finding and it renders even when no match is
//     live, because it is exactly the shape of the leg this stage was
//     built for; and a declared fixture the route could not describe,
//     which is the only way a monitored match can be missing from
//     `matches` and is drawn for the same reason;
//   - A READ THAT DID NOT HAPPEN. Until 2026-09-06 this component had a
//     single `catch` for "no route, no credential, or a dead backend"
//     and drew nothing for all three. There was no proxy route in front
//     of the backend endpoint, so in production every poll 404'd, this
//     surface has NEVER RENDERED, and a reader saw a board with no live
//     section and concluded there was nothing live. That conclusion was
//     about a set nobody counted. So a poll that produced no payload is
//     now DRAWN, with its status and the upstream sentence, and it says
//     which of the four it was. Absent and refused are different facts.
//
// SON'S INVARIANT, AND WHAT THIS FILE OWES IT: "any matches that is
// selected at any moment while it is still in play to be in the Live
// section". Every declared match is drawn — nothing on this surface is
// filtered out of the record or out of the DOM — and the ones whose
// state block says in_play are drawn FIRST, in their own group, each
// marked in real text. A match that silently drops off this section is
// the bug.
//
// AND THE SECOND HALF OF THE SAME INVARIANT, ADDED 2026-09-06. Of 38
// declared, 17 carried a coverage row saying in its own words "there is
// no read left to run", 20 had no establishable phase, and ONE had the
// ball moving in it. Drawing all 38 in full buries the one this stage
// exists for. Son: "I just want it to be the only match to watch". So
// the DISPLAY collapses and the RECORD does not: the in-play group is
// expanded, everything else sits inside one disclosure whose summary is
// always visible, always carries the total, and always says what those
// matches are in the TAPE'S OWN WORDS. Absent, collapsed and omitted
// are three different things; the count is what keeps them apart.
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
import { useEffect, useId, useRef, useState } from "react";
import {
  CertaintyPremium, EntryMap, EntryMapBranch, LiveReadComponentPayload,
  LiveReadSide, PartialExit, PartialExitFraction, PartialExitRealises,
  WatchedMatch, WatchedPosition, WatchedStripResponse, WatchedStripRefusal,
  api, money,
} from "../lib/suggesterApi";
import { useWatchToken } from "./WatchDeclaration";
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

// --- a refusal renders ONCE ------------------------------------------
//
// WHAT WAS WRONG, IN THE OPERATOR'S OWN WORDS: "every refusal renders
// TWICE: once as the route's coded sentence and once as the registry's
// definition", and a code that fired on four fractions and on the whole
// position printed its paragraph five times over. The finding is not
// five findings. So the surface now carries ONE CHIP PER CODE, with the
// number of sites on it, and the sentences — the block's own and the
// registry's definition — live once each inside the card's single
// disclosure.
//
// GROUPED BY CODE, ORDERED BY THE REGISTRY. `positionRefusals` already
// walks the payload and sorts by the registry's own order, so this
// preserves that order and never re-ranks: the first site of a code
// fixes where the chip sits.

type CodeGroup = { code: string; sites: Refusal[] };

function groupByCode(rs: Refusal[]): CodeGroup[] {
  const out: CodeGroup[] = [];
  for (const r of rs) {
    const hit = out.find((g) => g.code === r.code);
    if (hit) hit.sites.push(r); else out.push({ code: r.code, sites: [r] });
  }
  return out;
}

// --- the method notes, DERIVED FROM THE PAYLOAD'S OWN BYTES ----------
//
// WHY THIS IS A WALK AND NOT A LIST OF PATHS. Every standing sentence
// this stage writes — BRANCHES_NOT_AVERAGES, the fee basis, the whole-
// contracts rule, "a map, not a verdict", M0's no-response-window
// sentence, the category rule — rides on the payload under a dozen
// different keys, on every block that carries one, so the same sentence
// reached the surface four and five times over. A hand-listed set of
// note paths is the shape this repo has already been bitten by: it
// stays green while the omitted case drifts. So the notes are WALKED
// out of the match payload, DEDUPED BY TEXT (which is what collapses
// one rule repeated per block and per fraction into a single line) and
// kept in the payload's own order of first appearance.
//
// THE THRESHOLD IS A JUDGEMENT AND IT IS PRINTED AS ONE. A prose note
// is a string of at least NOTE_MIN_CHARS characters; below that a value
// is a label, a code, a price or a clock. Nothing is classified by key
// NAME, so a sentence added to the payload tomorrow appears here
// without an edit to this file.
//
// WHAT IS EXCLUDED, AND WHY NEITHER IS AN OMISSION:
//   - a sentence that is already a REFUSAL's sentence. It is rendered
//     once in the refusal ledger beside its code; printing it again as
//     a note is the exact duplication this block exists to end;
//   - anything under `registered`. Those are the payload's own
//     REGISTERED HOLES — a finding and its `closes_when` — which is
//     bookkeeping about the payload rather than a fact about this
//     match, and it does not belong on an operator surface. It stays in
//     the payload, which is where a guard reads it.
const NOTE_MIN_CHARS = 60;
const NOTE_SKIP_KEYS = new Set([
  "registered", "refusal_codes", "policy_codes", "standing",
]);

function proseNotes(node: unknown, skip: Set<string>,
                    out: string[] = [], seen = new Set<string>()): string[] {
  if (Array.isArray(node)) {
    for (const v of node) proseNotes(v, skip, out, seen);
    return out;
  }
  if (!isObj(node)) return out;
  for (const [k, v] of Object.entries(node)) {
    if (NOTE_SKIP_KEYS.has(k)) continue;
    if (typeof v === "string") {
      const t = v.trim();
      if (t.length >= NOTE_MIN_CHARS && !skip.has(t) && !seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
      continue;
    }
    proseNotes(v, skip, out, seen);
  }
  return out;
}

// --- can the tape be read at all? ------------------------------------
//
// THREE ANSWERS, AND THE FIRST TWO ARE NOT THE SAME FACT. This is the
// distinction that must survive the collapse: a competition nobody
// tapes and a tape read that FAILED must never look alike, and neither
// of them is "a quiet match".
//
//   read      the newest state-tape row was read and is described.
//   failed    the read itself failed — position.UnreadableTape reached
//             this response and every field was withdrawn. The route
//             names it (`tape_unreadable`) and nothing here re-derives
//             it.
//   no_row    the read succeeded and there is no row for this fixture.
//             DERIVED FROM THE TWO FIELDS THE ROUTE FILLS OFF THE ROW
//             ITSELF: a row that exists carries a capture clock and a
//             match_state; one that does not carries neither.
//
// FAIL-CLOSED, AND THE ORDER IS THE WHOLE POINT: `failed` is tested
// FIRST, because a failed read also leaves both fields null, and
// reading that as `no_row` would turn "we could not look" into "there
// is nothing there" — the fold this surface exists against.
type TapeVerdict = "read" | "failed" | "no_row";

export function tapeVerdictOf(m: WatchedMatch): TapeVerdict {
  const refusals = m.state?.refusals ?? [];
  if (refusals.some((r) => r?.code === "tape_unreadable")) return "failed";
  const st = m.state;
  if (st == null) return "no_row";
  const noRow = (st.captured_at == null || st.captured_at === "")
    && (st.match_state == null || st.match_state === "");
  return noRow ? "no_row" : "read";
}

/** The competitions the STATE COLLECTOR folds over, as the payload
 *  itself publishes them — walked, never typed here, and null when the
 *  payload publishes no such list.
 *
 *  NULL MEANS NO CLAIM. With no published fold this surface says "no
 *  state-tape row for this fixture" and stops. It does not guess that
 *  the competition is untaped: "we tape it and it wrote nothing" and
 *  "nothing tapes it" are different findings and only the payload can
 *  tell them apart. */
function stateTapedCompetitions(data: WatchedStripResponse): string[] | null {
  let found: string[] | null = null;
  const walk = (node: unknown, depth: number) => {
    if (found !== null || depth > 4) return;
    if (Array.isArray(node)) { node.forEach((v) => walk(v, depth + 1)); return; }
    if (!isObj(node)) return;
    for (const [k, v] of Object.entries(node)) {
      if (k === "collector_folds_over" && Array.isArray(v)
          && v.length > 0 && v.every((x) => typeof x === "string")) {
        found = v as string[];
        return;
      }
      walk(v, depth + 1);
    }
  };
  walk(data as unknown as Record<string, unknown>, 0);
  return found;
}

/** The one line a match the tape cannot read gets, in the payload's own
 *  terms and never imputing which of the two it is. */
function tapeLine(m: WatchedMatch, verdict: TapeVerdict,
                  taped: string[] | null): string {
  if (verdict === "failed") {
    return "the tape read FAILED — every figure is withdrawn, and "
      + "nothing here says whether this match is running";
  }
  if (taped === null) return "no state-tape row for this fixture";
  return taped.includes(m.competition_slug)
    ? "the collector taps this competition and has written no state-tape "
      + "row for this fixture"
    : "no state tape for this competition — the collector does not fold "
      + "over it, so no row was ever written";
}

// --- a list the payload did not carry is not a list of nothing --------
//
// THE FIX THAT HELD ONE FILE OVER AND NOT IN THIS ONE. WatchDeclaration
// closed exactly this shape for the declared set — *"DERIVED FROM THE
// PAYLOAD'S OWN SHAPE, not from its truthiness … Absence of the list is
// not a list of nothing"* — and gave the answer its own name
// (`setIsReadable`) so a row reads "declared set unread" rather than
// "not watched". This file kept `data.matches ?? []`, which reads "the
// payload carried no `matches` key" as "no match is declared" and then
// returns NULL: a blank Live section, which is the one conclusion this
// whole component exists against, produced from an answer that said
// nothing. The same shape, one file over. It is closed the same way.
//
// REQUIRED, NOT OPTIONAL, AND THE DIFFERENCE COMES OFF THE RECORDED
// CONTRACT rather than from a judgement here: `matches` and
// `open_positions_not_monitored` are declared NON-OPTIONAL in
// lib/suggesterApi.ts's WatchedStripResponse — every payload recorded
// off this route carries both — so a payload without one is an answer
// this surface could not read, not an empty set.
// `monitored_not_described` and `policy_codes` are declared optional
// there and are read as optional here.
//
// EVERY LIST THIS SURFACE COUNTS GOES THROUGH ONE READER, so a fourth
// one cannot be the one that forgets, and the set is cross-checked
// against CONSUMED_ENVELOPE_KEYS by the guard in
// e2e/watched-strip.spec.ts.
export const REQUIRED_LISTS: readonly string[] = [
  "matches", "open_positions_not_monitored",
];

/** The list under `key`, or NULL when the payload carried no list
 *  there. Never `[]` — an empty list is a finding and this is not one. */
function requiredList<T>(data: WatchedStripResponse, key: string): T[] | null {
  const v = (data as unknown as Record<string, unknown>)[key];
  return Array.isArray(v) ? (v as T[]) : null;
}

/** The required lists this payload did not carry, NAMED. Drawn, because
 *  the alternative is the blank that means "nothing is live". */
function UnreadableLists({ keys }: { keys: readonly string[] }) {
  if (keys.length === 0) return null;
  const one = keys.length === 1;
  return (
    <p data-testid="watched-lists-unreadable" data-keys={keys.join(",")}
      aria-live="polite"
      className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
      This read answered without{" "}
      <span className="font-mono">{keys.join(", ")}</span> — {one
        ? "a list this section counts"
        : "lists this section counts"}, and every payload recorded off
      this route carries {one ? "it" : "them"}. Nothing is drawn from{" "}
      {one ? "it" : "them"} and NOTHING HERE SAYS THE SET IS EMPTY: a
      count off a key that never arrived would be this section reporting
      a number nobody sent.
    </p>
  );
}

// --- the strip --------------------------------------------------------

export default function WatchedStrip() {
  // ONE TOKEN, TWO SURFACES. The read is operator-gated because the
  // payload carries POSITIONS, and the operator has already typed a
  // token into the watch panel to declare a match. It is read from that
  // provider (WatchDeclaration's useWatchToken, read-only) rather than
  // held here: a second field for the same secret would be this surface
  // inventing a credential. Outside the provider it is "" and the
  // section says so.
  const token = useWatchToken();
  const [data, setData] = useState<WatchedStripResponse | null>(null);
  // A FAILED POLL IS NOT A QUIET MATCH. LiveScoreboard can keep its last
  // payload silently because a scoreline that is 30s old is still a
  // scoreline. These figures are priced off a book with an age ceiling,
  // so when the newest poll fails the strip keeps showing what it had
  // and SAYS the numbers are from the earlier read, with the clock.
  const [staleSince, setStaleSince] = useState<string | null>(null);
  // ABSENT AND REFUSED ARE DIFFERENT FACTS, AND THIS IS WHERE THEY
  // SEPARATE. Until this round every failure — no proxy route, no
  // credential, a credential the backend refused, a dead backend —
  // arrived as one blank space, and the blank space read as "no live
  // matches". It never was: the strip has never rendered in production
  // at all. So a read that produced no payload is now kept, with its
  // status and the backend's own sentence, and DRAWN.
  const [refusal, setRefusal] = useState<WatchedStripRefusal | null>(null);
  // Whether the first poll has come back. Before it has, this surface
  // knows nothing and renders nothing — that is absence with a reason,
  // not a claim about the watchlist.
  const [asked, setAsked] = useState(false);
  const lastOk = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api.watchedStrip(token);
        if (!alive) return;
        lastOk.current = r.generated_at;
        setData(r);
        setRefusal(null);
        setStaleSince(null);
        setAsked(true);
      } catch (e) {
        if (!alive) return;
        setAsked(true);
        // The refusal is KEPT, never swallowed. A throw that is not a
        // WatchedStripRefusal has no status and no upstream sentence,
        // and is wrapped as exactly that rather than glossed.
        setRefusal(e instanceof WatchedStripRefusal ? e
          : new WatchedStripRefusal(null, String(e), token !== ""));
        // With a payload in hand the figures stay up and dated.
        if (lastOk.current) setStaleSince(lastOk.current);
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
    // Re-read the moment a token is typed or changed: the operator
    // should not have to reload the page to see the section they were
    // just told needs a credential.
  }, [token]);

  // NOTHING HAS BEEN READ YET — not a statement about the watchlist.
  if (!data && !asked) return null;
  // READ, AND REFUSED. Drawn, because a blank Live section is read as
  // "no live matches" and this surface has no evidence for that.
  if (!data) return refusal ? <GateNotice r={refusal} /> : null;
  if (data.dormant) return null;
  // A KEY THE PAYLOAD DID NOT CARRY IS NOT AN EMPTY LIST — read through
  // `requiredList`, never through `?? []`. See the block above it.
  const matches = requiredList<WatchedMatch>(data, "matches");
  const orphans = requiredList<number>(data, "open_positions_not_monitored");
  const unreadableLists = REQUIRED_LISTS.filter(
    (k) => requiredList(data, k) === null);
  // A DECLARED MATCH THAT IS NOT IN `matches`. The backend registers
  // this hole (WATCHED_STRIP_OPEN["no_identity_row"]) and says in the
  // record that an operator watching the strip alone would not see it.
  // Drawing it here is what closes that half: a match that silently
  // drops off this surface is the defect the stage was reported for.
  //
  // OPTIONAL ON THE RECORDED CONTRACT, so its absence is not a failed
  // read: `monitored_not_described?` is declared optional in
  // lib/suggesterApi.ts because payloads recorded off this route do not
  // all carry it. Folding an absent OPTIONAL key to an empty list says
  // only what the contract says; folding an absent REQUIRED one would
  // be a claim, which is why the two are read differently.
  const undescribed = data.monitored_not_described ?? [];
  // ABSENT, NOT EMPTY — with the exceptions that are findings, and
  // A LIST THAT COULD NOT BE READ IS NEVER ONE OF THE EMPTY CASES.
  if (unreadableLists.length === 0
      && matches!.length === 0 && orphans!.length === 0
      && undescribed.length === 0) return null;
  // From here the two are drawn as far as they were readable. A list
  // that was NOT readable draws no rows AND is named by
  // `UnreadableLists` below — it never quietly contributes zero.
  const matchRows = matches ?? [];
  const orphanRows = orphans ?? [];

  const registry = data.refusal_codes ?? {};
  const bySource = data.monitored_by_source ?? {};
  // IN PLAY FIRST, AND THE FLAG IS THE PAYLOAD'S OWN. `state.in_play`
  // is `match_state == "in"` on the backend and nothing else; a match
  // with no state block is NOT folded into "in play" here, it is simply
  // not in that group, and its missing fields already refuse by name on
  // the card. The split is a partition of the SAME set the payload
  // sent — nothing is filtered, nothing is dropped, and the two groups
  // add back to `matches` exactly. Array.prototype.sort is not used:
  // two lists make the partition obvious and keep the payload's own
  // order inside each.
  const live = matchRows.filter(isInPlay);
  const rest = matchRows.filter((m) => !isInPlay(m));
  // The tape states that MEAN in play, as the PAYLOAD carries them.
  // null = this payload published no such registry, and this surface
  // then makes no claim about which states are in play.
  const inPlayStates = inPlayStatesOf(data);
  // THE COLLECTOR'S OWN COMPETITION FOLD, from the payload or not at
  // all. It is what tells "no state tape is written for this
  // competition" apart from "the tape read FAILED" on a match with no
  // row — the one distinction the collapse below must not lose.
  const stateTaped = stateTapedCompetitions(data);

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
      {/* ONE LINE, NOT FOUR. The charter used to open this section as a
          paragraph above every match; it is the same sentence on every
          poll and it was shouting over the one match the ball is moving
          in. The rule it states has not changed and is not hidden — it
          is the summary of the section's own disclosure, one line down,
          and every card repeats nothing of it. */}
      <details data-testid="watched-strip-charter" className="mt-2">
        {/* THE CHARTER IS THE SUMMARY, NOT THE CONTENTS. Compressing
            the paragraph to one line was right; putting the whole of it
            behind a CLOSED disclosure was not, because a reader arrives
            without the one sentence that says whose call this is — and
            `innerText` agrees, which is how the guard caught it. The
            line that states the rule is now the visible half and the
            elaboration is what folds away. */}
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          nothing here is a recommendation — you decide
        </summary>
        <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed text-ink-low">
          The live read, the position, both branches and what certainty
          costs — for the matches you declared, and only those. No line
          names a moment to do anything: it states what the market will
          pay to end the exposure and what that costs against a measured
          base rate. You decide.
        </p>
      </details>

      {staleSince && (
        <p data-testid="watched-stale" role="status"
          className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
          The last poll failed. Every figure below is from the read
          generated at {staleSince} and none of it has been refreshed —
          these prices are quoted off a book with an age ceiling, so
          treat them as that read and not as now.
          {/* WHY it failed, in the layer's own words rather than as a
              shrug. A refused credential and a dead backend leave the
              same stale figures on the page and are not the same
              problem. */}
          {refusal && (
            <span data-testid="watched-stale-why" className="block">
              {" "}The failed read answered{" "}
              {refusal.status == null ? "nothing at all" : refusal.status}
              {refusal.said ? `: ${refusal.said}` : "."}
            </span>
          )}
        </p>
      )}

      <UnreadableLists keys={unreadableLists} />

      {orphanRows.length > 0 && (
        <p data-testid="watched-orphans"
          className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
          {orphanRows.length} open position{orphanRows.length === 1 ? " is" : "s are"}{" "}
          on {orphanRows.length === 1 ? "a fixture" : "fixtures"} nobody
          declared — fixture {orphanRows.join(", ")}.{" "}
          {orphanRows.length === 1 ? "It is" : "They are"} not being read
          here. A set that silently omits an open position is a census of
          nothing, so it is named rather than dropped.
        </p>
      )}

      {undescribed.length > 0 && (
        <div data-testid="watched-undescribed"
          className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
          <p>
            {undescribed.length} declared fixture
            {undescribed.length === 1 ? " is" : "s are"} monitored and{" "}
            {undescribed.length === 1 ? "is" : "are"} NOT drawn as a match
            below — the read could not name{" "}
            {undescribed.length === 1 ? "it" : "them"}. A match that
            silently drops off this section is the defect this stage was
            reported for, so{" "}
            {undescribed.length === 1 ? "it is" : "they are"} listed here
            by id instead.
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {undescribed.map((u) => (
              <li key={u.fixture_id} data-testid="watched-undescribed-row"
                data-fixture={u.fixture_id}>
                <span className="font-mono font-semibold">
                  fixture {u.fixture_id}
                </span>
                {/* watchlist.POLICY_CODES, NOT position.REFUSAL_CODES.
                    The two vocabularies are disjoint by construction —
                    a policy code names a decision about the monitored
                    SET, a refusal code names a number that could not be
                    produced — so this rides under its own heading and
                    is never counted with the refusals. */}
                {u.policy_code && (
                  <span className="font-mono text-ink-faint">
                    {" "}· policy {u.policy_code}
                  </span>
                )}
                {u.refused && <> — {u.refused}</>}
                {/* THE REGISTERED HOLE IS NOT DRAWN. `u.registered`
                    carries the route's own finding and its
                    `closes_when` — bookkeeping about the payload, not a
                    fact about this fixture — and it stays in the
                    payload, where a guard reads it, rather than sitting
                    on an operator surface. What the operator needs, the
                    policy code and its sentence, is above. */}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* IN PLAY FIRST, AND SAID OUT LOUD. Son's invariant is that a
          match selected while it is still in play is in the Live
          section; the one that must never be lost is the one the ball
          is moving in. So the in-play group is drawn FIRST, under a
          heading of its own, and every card in it carries a mark in
          real text. The rest of the declared set follows, complete: a
          fixture that has not kicked off keeps its minute-0 map and a
          fixture whose read refused keeps its refusal. Nothing here
          filters. */}
      <div className="mt-5 space-y-5">
        {live.length > 0 && (
          <section aria-labelledby="watched-group-in-play"
            className="space-y-5">
            <p id="watched-group-in-play" data-testid="watched-group"
              data-group="in_play" data-count={live.length}
              className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-live">
              <span aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-live" />
              in play now · {live.length}
              <span className="sr-only">
                {" "}— drawn first, before every other declared match.
                These are the fixtures whose state block says in_play,
                which upstream is the newest state-tape row&apos;s
                match_state read against the registry of states that
                mean in play
                {inPlayStates
                  ? ` (${inPlayStates.join(", ")}, as this payload
                     publishes them)`
                  : " (this payload publishes no such registry, so the "
                    + "states themselves are not named here)"}.
              </span>
            </p>
            {live.map((m) => (
              <MatchBlock key={m.fixture_id} m={m} registry={registry}
                policyCodes={data.policy_codes ?? {}}
                inPlayStates={inPlayStates} stateTaped={stateTaped} />
            ))}
          </section>
        )}
        {rest.length > 0 && (
          <section aria-labelledby="watched-group-not-in-play">
            <CollapsedGroup ms={rest} startOpen={live.length === 0}>
              {rest.map((m) => (
                <MatchBlock key={m.fixture_id} m={m} registry={registry}
                  policyCodes={data.policy_codes ?? {}}
                  inPlayStates={inPlayStates} stateTaped={stateTaped} />
              ))}
            </CollapsedGroup>
          </section>
        )}
      </div>

      <UndrawnEnvelope data={data} />
    </section>
  );
}

/** Whether the payload's own state block says this fixture is in play.
 *
 *  STRICT, AND UNRECOGNISED NEVER FOLDS INTO A MEANINGFUL CLASS. This
 *  reads the flag the backend computed and computes nothing of its own
 *  — never the fixture row, never the calendar, never "it has a
 *  minute". A tape read that FAILED sets the flag fail-closed false
 *  beside a `tape_unreadable` refusal. A missing state block, a missing
 *  flag or any non-true value therefore means NOT in this group; it
 *  does not mean the match is quiet, and the card says which of its
 *  fields are missing by name. */
const isInPlay = (m: WatchedMatch): boolean => m.state?.in_play === true;

/** The tape's OWN WORD for this match, verbatim, or a named absence.
 *
 *  THE PROVIDER'S VOCABULARY, NEVER THIS FILE'S. Nothing here maps a
 *  value to a class, folds an unrecognised one into a meaningful one,
 *  or decides what any word means — `post` is printed because the tape
 *  said `post`. A row with no value at all gets its own bucket that
 *  says exactly that, because "the tape said nothing" and "the tape
 *  said something we do not recognise" are different facts and neither
 *  is "not in play". */
export function tapeWordOf(m: WatchedMatch): string {
  const w = m.state?.match_state;
  return (typeof w === "string" && w !== "") ? w
    : "(no match_state on the tape row)";
}

/** How many of these matches carry the `tape_unreadable` refusal.
 *
 *  COUNTED APART, AND DELIBERATELY NOT A BUCKET. `tape_unreadable` is a
 *  position.REFUSAL_CODES name — a number that could not be PRODUCED —
 *  and the tally above is the tape's own vocabulary. Counting one as
 *  the other is the two-vocabularies rule this file is responsible for,
 *  so this rides as a SUBSET of the tally rather than beside it: a
 *  failed read also carries no match_state, so it is already inside the
 *  "(no match_state on the tape row)" bucket, and adding it as a
 *  seventh bucket would count it twice and break the partition. */
const unreadableCount = (ms: WatchedMatch[]): number =>
  ms.filter((m) => (m.state?.refusals ?? [])
    .some((r) => r?.code === "tape_unreadable")).length;

/** The tally, in the payload's own order of first appearance. */
function tapeTally(ms: WatchedMatch[]): { word: string; n: number }[] {
  const out: { word: string; n: number }[] = [];
  for (const m of ms) {
    const w = tapeWordOf(m);
    const hit = out.find((x) => x.word === w);
    if (hit) hit.n += 1; else out.push({ word: w, n: 1 });
  }
  return out;
}

/** THE DECLARED MATCHES THE TAPE CANNOT READ RIGHT NOW — COLLAPSED,
 *  NEVER OMITTED, AND NEVER FILTERED OUT OF THE RECORD.
 *
 *  WHAT WAS REPORTED. 38 declared: 17 whose coverage row says in its
 *  own words "there is no read left to run", 20 whose phase could not
 *  be established at all, and ONE with the ball moving in it. Son: "I
 *  just want it to be the only match to watch". Drawing all 38 in full
 *  buries the one this stage exists for under 37 that have no read to
 *  show.
 *
 *  WHAT IS AND IS NOT DONE ABOUT IT. Nothing is filtered from the
 *  RECORD: the backend still sends every declared fixture
 *  (WATCHED_STRIP_EVERY_MATCH_IS_DRAWN) and this surface still receives
 *  and renders every one of them. What changes is the DISPLAY: the
 *  matches the tape says are in play stay expanded, and the rest sit
 *  inside one disclosure. ABSENT, COLLAPSED AND OMITTED ARE THREE
 *  DIFFERENT THINGS, and the count is what keeps them apart — the
 *  summary is always visible, always carries the total, and always says
 *  WHAT they are in the tape's own words. A reader who never opens it
 *  still knows how many there are and what the tape calls each of them,
 *  which is strictly more than the flat list told them.
 *
 *  IT OPENS ITSELF WHEN THERE IS NOTHING ELSE TO LOOK AT. With no
 *  in-play match, collapsing the whole section would leave a summary
 *  line where the surface used to be — so the disclosure starts open.
 *  That is a display judgement and it is written here rather than
 *  buried: the collapse exists to stop the live match being buried, and
 *  with no live match there is nothing to bury it. */
function CollapsedGroup({ ms, startOpen, children }: {
  ms: WatchedMatch[]; startOpen: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(startOpen);
  const tally = tapeTally(ms);
  const unread = unreadableCount(ms);
  return (
    <details data-testid="watched-collapsed" data-open={open ? "true" : "false"}
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="rounded-xl border border-line bg-bs/40">
      <summary className="cursor-pointer list-none px-4 py-3">
        {/* THE COUNT IS ALWAYS VISIBLE. It carries the same testid and
            the same data-count as the expanded group above it, so the
            partition guard reads both the same way and a collapsed
            group can never be mistaken for a shorter set. */}
        <p id="watched-group-not-in-play" data-testid="watched-group"
          data-group="not_in_play" data-count={ms.length}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span aria-hidden className="mr-1.5">{open ? "▾" : "▸"}</span>
          not in play on the tape · {ms.length}
          <span className="sr-only">
            {" "}— still declared, still on the record and still sent by
            the backend, which filters nothing. They are COLLAPSED here
            rather than dropped: {open ? "this list is open" : "open this"}
            {" "}to see each one in full, with the map a fixture was
            bought against and every refusal by name.
          </span>
        </p>
        {/* WHAT THEY ARE, IN THE TAPE'S OWN WORDS. Derived by counting
            the payload's `match_state` values; no word here is mapped,
            classified or renamed, and a row with no value at all says
            that rather than being folded into one that has one. */}
        <p data-testid="watched-collapsed-tally"
          data-tally={tally.map((t) => `${t.word}=${t.n}`).join(",")}
          className="mt-1 font-mono text-[10px] text-ink-faint">
          {tally.map((t) => `${t.word} ${t.n}`).join(" · ")}
          <span className="sr-only">
            {" "}— counted by the newest state-tape row&apos;s own
            match_state, printed verbatim as the provider wrote it. This
            surface classifies none of them.
          </span>
        </p>
        {unread > 0 && (
          <p data-testid="watched-collapsed-unreadable" data-count={unread}
            className="mt-1 font-mono text-[10px] text-warn">
            of these, {unread} could not be read at all — refusal
            tape_unreadable
            <span className="sr-only">
              {" "}— a subset of the tally above and not a bucket of its
              own: a failed read carries no match_state, so it is already
              counted there. This is a refusal code and the tally is the
              tape&apos;s vocabulary; the two are never added together.
              It does not mean the match is quiet — only that we could
              not look.
            </span>
          </p>
        )}
      </summary>
      <div className="space-y-5 px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}

/** The tape states that MEAN in play, as the payload itself carries
 *  them — never a string typed into this file.
 *
 *  THIS IS THE ROUND'S OWN LESSON, PAID FOR TWICE. The first draft of
 *  the in-play mark checked `match_state !== "in"` and would have
 *  lit a false contradiction on every card the day a second started
 *  state joined the class. That is precisely the venue-class failure
 *  this repo has already shipped once — twelve green tests spoke the
 *  CODE's vocabulary while the feed spoke its own — and the backend has
 *  since replaced its own `== "in"` with a lookup into watchlist's
 *  PHASE_OF_STARTED_STATE, published on the payload as
 *  `in_play_states`.
 *
 *  WALKED, NOT PATH-ADDRESSED, for the same reason positionRefusals is:
 *  the key's home on the envelope is a property of the payload's shape
 *  and has already moved once. A payload that carries no such registry
 *  yields NULL, and null means this surface MAKES NO CLAIM about which
 *  states are in play — it does not fall back to a guess. */
function inPlayStatesOf(data: WatchedStripResponse): string[] | null {
  let found: string[] | null = null;
  const walk = (node: unknown, depth: number) => {
    if (found !== null || depth > 4) return;
    if (Array.isArray(node)) { node.forEach((v) => walk(v, depth + 1)); return; }
    if (!isObj(node)) return;
    for (const [k, v] of Object.entries(node)) {
      if (k === "in_play_states" && Array.isArray(v)
          && v.length > 0 && v.every((x) => typeof x === "string")) {
        found = v as string[];
        return;
      }
      walk(v, depth + 1);
    }
  };
  walk(data as unknown as Record<string, unknown>, 0);
  return found;
}

// --- the section, read and refused ------------------------------------
//
// WHY THIS EXISTS AT ALL, and it is the whole point of this round. The
// strip has been mounted on the landing page since 707a564 and has
// never rendered in production: the proxy route did not exist, so every
// poll 404'd, and the component treated "no route, no credential, or a
// dead backend" as a single reason to draw nothing. A reader saw an
// ordinary board and concluded there was nothing live. THAT WAS NEVER
// MEASURED — the section had not been read at all.
//
// So: a read that produced no payload is drawn, and it says which of
// the four it was. The status and the upstream sentence are printed
// verbatim; this component adds no diagnosis of its own beyond mapping
// the status to which sentence is true, and prints the status beside
// the sentence so a reader can check one against the other.
//
// WHAT IT MUST NEVER SAY is that no match is live. It has no evidence
// for that: the set it would have counted is exactly the thing it could
// not read.
function GateNotice({ r }: { r: WatchedStripRefusal }) {
  const gated = r.status === 401 || r.status === 403;
  const kind = gated ? (r.sentToken ? "token_refused" : "needs_token")
    : r.status === 404 ? "no_route"
    : r.status == null || r.status === 502 ? "unreachable"
    : "unexpected_status";
  const headline =
    kind === "needs_token"
      ? "This section is operator-gated and no token is held in this tab."
    : kind === "token_refused"
      ? "The operator token held in this tab was refused by the read."
    : kind === "no_route"
      ? "The read this section polls is not there."
    : kind === "unreachable"
      ? "Nothing answered the read."
    : "The read answered a status this section has no handling for.";
  const next =
    kind === "needs_token"
      ? "Type your operator token into the watch panel on this page — the "
        + "same token the watch toggle uses — and the matches you declared "
        + "are read here."
    : kind === "token_refused"
      ? "The token in the watch panel on this page is the one that was "
        + "sent. The backend's own sentence for the refusal is above."
    : kind === "no_route"
      ? "That is a missing endpoint, not an empty watchlist: no set was "
        + "counted, because nothing was asked."
    : kind === "unreachable"
      ? "The read did not get past the proxy to a backend that could "
        + "answer it, so nothing about the declared set was learned on "
        + "this poll — this is not a refusal and not an empty watchlist."
      : "No branch of this section knows what that status means, so it "
        + "is printed as it arrived rather than sorted into one of the "
        + "reasons above.";
  return (
    <section data-testid="watched-strip" data-state="refused"
      aria-labelledby="watched-strip-h"
      className="mt-8 rounded-2xl border border-warn/40 bg-warn/5 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <Eyebrow tone="accent">watched · hold / exit</Eyebrow>
        <h2 id="watched-strip-h" className="text-lg font-medium text-ink-hi">
          The matches you declared
        </h2>
      </div>
      {/* A LIVE REGION, BUT NOT role="status". The distinction is not
          cosmetic: the picker board draws one role="status" skeleton per
          league while it loads and e2e/restructure.spec.ts counts them
          (`toHaveCount(4)`), so a fifth status node anywhere on this
          page silently breaks a guard that has nothing to do with this
          section. `aria-live` gives the announcement without taking a
          role another surface is counting. */}
      <p data-testid="watched-strip-gate" data-kind={kind}
        data-status={r.status == null ? "none" : String(r.status)}
        data-token-held={r.sentToken ? "true" : "false"}
        aria-live="polite"
        className="mt-2 max-w-3xl text-[13px] leading-relaxed text-warn">
        {headline}{" "}
        {/* THE ANSWER, DERIVED FROM THE NUMBER BESIDE IT. The status is
            printed next to the sentence it selected, so a reader can
            check the claim against the evidence rather than trust it. */}
        The read answered{" "}
        <span className="font-mono">
          {r.status == null ? "nothing at all" : r.status}
        </span>
        {r.said ? <> and said: “{r.said}”.</> : "."}{" "}
        {next}
      </p>
      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-low">
        This section has NOT been read, so nothing here says whether a
        match is live. A blank space would have said that, and it would
        have been a claim about a set nobody counted — which is why this
        is drawn refused rather than left out. Absent and refused are
        different facts.
      </p>
    </section>
  );
}

// --- one watched match ------------------------------------------------
//
// TWO SHAPES, AND WHICH ONE IS DECIDED BY WHETHER THE TAPE COULD BE
// READ AT ALL.
//
// THE FINDING THAT FORCED THIS. A declared fixture with no tape row
// rendered a full card: four paragraphs of charter and coverage prose,
// three refusals — not_in_play, no_minute, no_score — each printed
// twice, once as the route's coded sentence and once as the registry's
// definition, and a closing paragraph of the payload's own registered
// holes. All of it says one thing: THERE IS NO ROW. Thirty-seven of
// those buried the one match the ball was moving in.
//
// So a match the tape cannot read is ONE LINE: the clubs, the
// competition, and which of the two absences it is. Nothing is
// filtered, nothing leaves the DOM and nothing leaves the record — the
// line is still an <article> with the same testid, the same fixture id
// and the same in-play flag as a card, and every refusal it carries is
// still named, once, inside its own disclosure. A COUNT IS NOT A
// CENSUS: what collapses is the DISPLAY.
//
// THE ONE-LINE FORM IS ONLY TAKEN WHEN THERE IS NOTHING ELSE TO SHOW.
// A position on the fixture, or a persisted read on it, is drawn as a
// card however silent the tape is — those are figures, and a figure is
// never collapsed into a line about the tape.

function MatchBlock({ m, registry, policyCodes, inPlayStates, stateTaped }: {
  m: WatchedMatch;
  registry: Record<string, string>;
  policyCodes: Record<string, string>;
  /** the payload's own in-play tape states, or null when it published
   *  none — null means no claim, never a fallback guess */
  inPlayStates: string[] | null;
  /** the competitions the state collector folds over, as the payload
   *  publishes them, or null for NO CLAIM */
  stateTaped: string[] | null;
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
  const readSides = Object.keys(m.read?.sides ?? {});
  // EVERY REFUSAL ON THIS MATCH, COLLECTED ONCE AND USED TWICE: as the
  // chips beside the block that could not produce a number, and as the
  // ledger inside this card's one disclosure. One collector, so a chip
  // and its sentence can never drift apart.
  const shared = [...stateRefusals(m), ...readRefusals(m)];
  const perPosition = positions.map((p) => positionRefusals(p, registry));
  const allRefusals = [...shared, ...perPosition.flat()];

  const live = isInPlay(m);
  // THE WORD IS DERIVED FROM THE VALUE BESIDE IT. `in_play` IS
  // `match_state == "in"` upstream, so a payload claiming one without
  // the other did not come off that emitter. The mark still follows the
  // flag — nothing is regrouped or dropped on a suspicion — but the
  // disagreement is stated rather than smoothed over, because a stored
  // label free to drift from the value it was computed from is how a
  // winner-first score string rendered every defeat as a win.
  const stateWord = m.state?.match_state ?? null;
  // DERIVED FROM THE REGISTRY THE PAYLOAD CARRIES, never from a string
  // typed here. With no registry on the payload there is no claim to
  // make and none is made — a surface that guessed the class would be
  // the venue-class failure all over again.
  const markDisagrees = live && inPlayStates !== null
    && (stateWord === null || !inPlayStates.includes(stateWord));

  const verdict = tapeVerdictOf(m);
  const asLine = verdict !== "read" && positions.length === 0
    && readSides.length === 0;

  const identity = (
    <>
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
    </>
  );

  if (asLine) {
    return (
      <article data-testid="watched-match" data-fixture={m.fixture_id}
        data-in-play={live ? "true" : "false"} data-render="line"
        data-tape={verdict}
        aria-labelledby={hid}
        className="rounded-xl border border-line bg-bs px-4 py-2.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {identity}
          <span data-testid="watched-match-oneline" data-tape={verdict}
            className="ml-auto text-right font-mono text-[11px] leading-snug text-warn">
            {tapeLine(m, verdict, stateTaped)}
          </span>
        </div>
        {/* THE SUMMARY IS A LABEL, NOT A CLAIM. It read "why there is
            nothing to read here", which asserts the very thing the two
            reads below may not have established: `positions.length ===
            0` is also what a FAILED journal read looks like and
            `sides` is empty on a live read that FAILED, so this line
            is taken on a match where two reads could not be made and
            the summary above them said there was nothing to read. What
            this surface can honestly say is which shape it drew.

            AND THE TWO SENTENCES ARE DRAWN, not left to the prose walk.
            On a CARD `read.words` and `positions_note` sit on the face;
            on a line they had no home, so they fell through
            `proseNotes`' >= 60-character threshold — into an unlabelled
            grey note if they were long enough, and out of the DOM
            entirely if they were not. */}
        <CardNotes m={m} registry={registry} refusals={allRefusals}
          summary="what this line does not say · method · every refusal"
          shown={[readAbsentWords(m), m.positions_note,
                  possessionCaveat(m), ...faceProse(m)]}
          lead={<LineReads m={m} />} />
        <UncodedAbsences m={m} registry={registry} />
      </article>
    );
  }

  return (
    <article data-testid="watched-match" data-fixture={m.fixture_id}
      data-in-play={live ? "true" : "false"} data-render="card"
      data-tape={verdict}
      aria-labelledby={hid}
      className={`rounded-xl border bg-bs px-4 py-4 sm:px-5 ${
        live ? "border-live/50" : "border-line"}`}>
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {identity}
        {live && (
          <span data-testid="watched-in-play"
            data-match-state={stateWord ?? "absent"}
            data-derived={markDisagrees ? "disagrees" : "agrees"}
            className="rounded-full border border-live px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-live">
            in play
            <span className="sr-only">
              {" "}— this fixture&apos;s newest state-tape row reads
              match_state {stateWord === null
                ? "with no value at all"
                : `“${stateWord}”`}, and its state block says in_play, so
              it is drawn in the in-play group at the top of this
              section. Both are shown so one can be checked against the
              other.
            </span>
          </span>
        )}
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

      {markDisagrees && (
        <p data-testid="watched-in-play-disagrees"
          className="mt-2 rounded-md border border-warn/40 bg-warn/5 px-2.5 py-2 text-[12px] leading-relaxed text-warn">
          This payload says in_play is true while the same state block
          reads match_state{" "}
          {stateWord === null ? "with no value at all" : `“${stateWord}”`}
          , which is not one of the states this same payload publishes as
          meaning in play ({(inPlayStates ?? []).join(", ")}). Upstream
          in_play IS that lookup and is computed from nothing else, so
          the two cannot disagree on a payload from that emitter. The
          mark above follows the flag and this fixture is not regrouped
          or hidden on a suspicion — but the disagreement is stated
          rather than resolved here, because which of the two describes
          this row is not something this surface can know.
        </p>
      )}

      {/* THE TAPE, WHEN IT COULD NOT BE READ AND THERE ARE STILL
          FIGURES TO DRAW. The card keeps its line: a position priced
          off a book is not evidence that the match was observed, and a
          silent header would let the figures below stand as if it had
          been. */}
      {verdict !== "read" && (
        <p data-testid="watched-match-oneline" data-tape={verdict}
          className="mt-2 font-mono text-[11px] leading-snug text-warn">
          {tapeLine(m, verdict, stateTaped)}
        </p>
      )}

      {/* COVERAGE — the mid-way-join answer, and it is a POLICY fact
          about the monitored set, not a refused number, so it is worded
          and coded under its own vocabulary. THE CHIP IS THE ANSWER AND
          THE SENTENCES ARE IN THE DISCLOSURE: `complete_history` is a
          boolean the operator reads at a glance, and the coverage prose
          — which watch, from whom, under which policy — is method. */}
      <p data-testid="watched-coverage" data-complete={
          cover?.complete_history === true ? "true"
            : cover?.complete_history === false ? "false" : "unknown"}
        className={`mt-2 font-mono text-[11px] ${
          cover?.complete_history ? "text-ink-faint" : "text-warn"}`}>
        {cover?.complete_history
          ? "history · complete — declared before kickoff"
          : cover == null
            ? "history · no coverage block on this payload"
            : "history · PARTIAL — this watch did not begin at kickoff"}
        {cover?.unobserved_before_minute != null
          && ` · nothing before minute ${cover.unobserved_before_minute}`}
        {cover?.policy_code && (
          <span className="text-ink-faint"> · policy {cover.policy_code}</span>
        )}
        <span className="sr-only">
          {" "}— what this watch actually observed. The words behind it,
          and the policy code&apos;s own definition, are in “method,
          definitions and every refusal in full” at the foot of this
          card.
        </span>
      </p>

      {/* 1 — THE STATE: the live read's components */}
      <ReadBlock m={m} />

      {/* 2..5 — per held position */}
      {/* NO POSITION, OR NO ANSWER — AND THEY ARE NOT THE SAME FACT.
          `positions_note` is the route's own sentence for a journal
          read that REFUSED or FAILED; an empty list beside it does not
          mean nothing is held, it means nobody could look. So when the
          payload carries the note it is DRAWN, and excluded from the
          notes below rather than printed twice.

          AND AN EMPTY LIST WITH NO NOTE SAYS NOTHING AT ALL. This
          branch used to read "nothing is held on this fixture", with
          the comment beside it claiming that a silent empty list "is
          the one case where 'nothing is held' is what the payload
          actually said". It is the exact opposite: api/main.py's
          `_positions` puts journal.held_positions' own `refused`
          wording on `positions_note` WHENEVER the list is empty, so an
          empty list with no note is a payload that did not answer —
          and this surface was answering for it, in its own words, with
          the louder of the two claims. */}
      {positions.length === 0 ? (
        <p data-testid="watched-no-position"
          data-note={m.positions_note ? "payload" : "unstated"}
          className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-warn">
          {m.positions_note ?? (
            <>this response carries no position on this fixture and no
              words for that
              <span className="sr-only">
                {" "}— every payload recorded off this route puts the
                journal read&apos;s own sentence here when it holds no
                position, so an empty list with nothing beside it is an
                answer that was not given, and not a finding about what
                is on this fixture.
              </span>
            </>
          )}
        </p>
      ) : positions.map((p, i) => (
        <PositionBlock key={p.journal_entry?.bet_id ?? i} p={p}
          refusals={perPosition[i]} />
      ))}

      {/* the refusals that belong to the MATCH rather than to a
          position — as CHIPS. Their sentences and the registry's own
          definitions are in the one disclosure below, once each. */}
      <RefusalChips refusals={shared} testid="watched-match-refusals" />

      {/* ONE DISCLOSURE PER CARD. Method, definitions and every refusal
          in full — real text in the accessible tree, and not a word of
          it above the match. */}
      <CardNotes m={m} registry={registry} refusals={allRefusals}
        policyCodes={policyCodes}
        shown={[readAbsentWords(m), m.positions_note,
                possessionCaveat(m), ...faceProse(m)]} />
      <UncodedAbsences m={m} registry={registry} />
    </article>
  );
}

// --- the chips, and the one disclosure behind them --------------------

/** A refusal, ONCE, as a short chip carrying its registry name and how
 *  many sites on this block produced it.
 *
 *  THE NAME IS ON THE SURFACE AND THE SENTENCE IS ONE CLICK AWAY. A
 *  refusal is first-class here as it always was — named, counted, never
 *  imputed and never zero-filled — but a finding that fired on four
 *  fractions is ONE finding, and it now reads as one. `data-code` and
 *  `data-sites` are what a guard reads; the ledger inside the card's
 *  disclosure carries the block's own sentence for every site and the
 *  registry's definition of the name, each exactly once. */
function RefusalChips({ refusals, testid }: {
  refusals: Refusal[]; testid: string;
}) {
  const groups = groupByCode(refusals);
  if (groups.length === 0) return null;
  return (
    <ul data-testid={testid} data-codes={groups.length}
      className="mt-2 flex flex-wrap items-center gap-1.5">
      {groups.map((g) => (
        <li key={g.code} data-testid="watched-refusal" data-code={g.code}
          data-sites={g.sites.length}
          className="rounded border border-warn/50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-warn">
          {g.code.replace(/_/g, " ")}
          {g.sites.length > 1 && (
            <span className="text-ink-faint"> ×{g.sites.length}</span>
          )}
          {/* A CHIP IS A NAME, AND THAT INCLUDES THE HALF ONLY A
              SCREEN READER HEARS. `innerText` carries sr-only text, so
              a paragraph here made the chip a paragraph for one reader
              and a name for the other — which is the same surface
              saying two different things. The count and where the
              definition lives are what a name needs; the reason each
              block gave is in the disclosure, once. */}
          <span className="sr-only">
            {" "}— refused at {g.sites.length}{" "}
            {g.sites.length === 1 ? "block" : "blocks"}; defined below.
          </span>
        </li>
      ))}
    </ul>
  );
}

/** ONE DISCLOSURE PER CARD: the refusal ledger and the method notes.
 *
 *  WHAT IS IN HERE AND WHY IT IS NOT ON THE SURFACE. Every sentence
 *  below is either a definition (what a number means, what a rule is,
 *  what the payload refuses to claim) or a refusal's own reason. None
 *  of it is a figure and none of it changes between polls, so on the
 *  surface it was noise that grew with the number of blocks — the same
 *  rule repeated per block and per fraction, over four paragraphs,
 *  above a match that was actually being played.
 *
 *  IT IS REAL TEXT IN THE ACCESSIBLE TREE. A <details> is a disclosure,
 *  not a tooltip and not a `title=`: the summary is a control, the
 *  content is markup a screen reader reaches by opening it, and nothing
 *  here rides on an attribute or on a colour.
 *
 *  WHAT IS NOT IN HERE: the payload's REGISTERED HOLES. `registered`
 *  subtrees are skipped by the walk — a finding about the payload's own
 *  unfinished business, with its `closes_when`, is bookkeeping for a
 *  guard and not something to hand an operator mid-match. */
function CardNotes({ m, registry, refusals, policyCodes, summary,
                     shown = [], lead }: {
  m: WatchedMatch;
  registry: Record<string, string>;
  refusals: Refusal[];
  policyCodes?: Record<string, string>;
  summary?: string;
  /** sentences this card already draws on its face. Excluded from the
   *  notes so that NOTHING on a card is rendered twice — which is the
   *  whole point of this block. */
  shown?: (string | null | undefined)[];
  /** blocks a CARD draws on its face and a LINE has no room for, drawn
   *  here first and under their own testids rather than left to the
   *  prose walk, which classifies by length and drops anything short */
  lead?: React.ReactNode;
}) {
  const groups = groupByCode(refusals);
  // The refusal sentences are rendered in the ledger; excluded from the
  // notes so no sentence on this card appears twice.
  const said = new Set<string>([
    ...refusals.map((r) => r.says).filter(Boolean),
    ...shown.filter((x): x is string => typeof x === "string" && x !== ""),
  ]);
  const notes = proseNotes(m, said);
  const policy = m.coverage?.policy_code;
  if (groups.length === 0 && notes.length === 0 && lead == null) return null;
  return (
    <details data-testid="watched-card-notes" className="mt-3">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {summary ?? "method · definitions · every refusal in full"}
      </summary>
      <div className="mt-2 space-y-2 border-l border-line pl-3">
        {lead}
        {groups.length > 0 && (
          <ul data-testid="watched-refusal-ledger"
            className="space-y-1.5">
            {groups.map((g) => (
              <li key={g.code} data-testid="watched-refusal-detail"
                data-code={g.code} data-sites={g.sites.length}
                className="text-[12px] leading-relaxed text-warn">
                <span className="font-mono font-semibold">{g.code}</span>
                {/* THE REGISTRY'S DEFINITION, ONCE PER CODE. A code the
                    payload's registry does not define is shown as the
                    bare name rather than glossed with a guess. */}
                {registry[g.code]
                  ? <span className="text-ink-low"> — {registry[g.code]}</span>
                  : (
                    <span className="text-ink-low">
                      {" "}— this payload&apos;s registry does not define this
                      name, so nothing is put in its place.
                    </span>
                  )}
                <ul className="mt-0.5 space-y-0.5">
                  {g.sites.map((r) => (
                    <li key={`${r.code}@${r.where}`}
                      data-testid="watched-refusal-site" data-where={r.where}
                      className="text-[11px] leading-relaxed text-ink-mid">
                      <span className="font-mono text-ink-faint">{r.where}</span>
                      {r.says ? <> — {r.says}</> : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {policy && policyCodes?.[policy] && (
          <p data-testid="watched-coverage-policy" data-code={policy}
            className="text-[11px] leading-relaxed text-ink-faint">
            {/* THE OTHER VOCABULARY, UNDER ITS OWN HEADING AND NEVER
                COUNTED WITH THE REFUSALS ABOVE: a policy code names a
                decision about the monitored SET, a refusal code names a
                number that could not be produced. */}
            policy {policy} — {policyCodes[policy]}
          </p>
        )}
        {notes.map((t) => (
          <p key={t} data-testid="watched-note"
            className="text-[11px] leading-relaxed text-ink-faint">
            {t}
          </p>
        ))}
      </div>
    </details>
  );
}

/** THE TWO READS A ONE-LINE MATCH HAS NO ROOM FOR, drawn inside its
 *  disclosure under their own testids.
 *
 *  WHY THIS EXISTS. The line is taken when the tape could not be read
 *  AND there is no position AND no read side — and the last two are
 *  ALSO exactly what a journal read that FAILED and a live read that
 *  FAILED look like (api/main.py `_positions` returns `[]` with the
 *  failure on `positions_note`; `_read` returns `sides: {}` with the
 *  failure on `read.words`). On a card both sentences sit on the face.
 *  On a line they had nowhere to go, so they fell through
 *  `proseNotes`, which keeps a string only if it is at least
 *  NOTE_MIN_CHARS long and then prints it as an unlabelled method note
 *  — a failed read rendered as a definition, or dropped outright.
 *
 *  IT DOES NOT CLASSIFY THEM, BECAUSE IT CANNOT. Neither key carries a
 *  code, so "we could not look" and "there is nothing" arrive as one
 *  untyped string and this surface cannot tell them apart. That is
 *  REGISTERED — UNCODED_ABSENCE_KEYS, below, with the condition that
 *  closes it — and until it closes, the payload's own sentence is
 *  drawn verbatim and nothing is inferred from it. */
function LineReads({ m }: { m: WatchedMatch }) {
  const read = readAbsent(m);
  const held = m.positions_note;
  return (
    <>
      <p data-testid="watched-line-read" data-source={read.source}
        className="text-[11px] leading-relaxed text-warn">
        the live read — {read.words}
      </p>
      <p data-testid="watched-line-positions"
        data-note={held ? "payload" : "unstated"}
        className="text-[11px] leading-relaxed text-warn">
        the journal read — {held ?? "this response carries no position on "
          + "this fixture and no words for that, so nothing here says "
          + "whether one is held"}
      </p>
    </>
  );
}

// --- 1. the state: the live read's four components, per side ----------
//
// THE READ'S OWN ABSENCE STAYS ON THE FACE OF THE CARD, and it is the
// only prose that does. `live_read`'s words are the difference between
// "no component read has been persisted" (a statement about the
// collector) and "THE LIVE READ COULD NOT BE READ" (a statement about
// this poll), and folding those two together is the failure this stage
// was built against. So it is drawn where the read would have been —
// and, because it is drawn, it is excluded from the card's notes rather
// than printed a second time down there.

/** The words for a read with no sides — THE PAYLOAD'S, or a named
 *  absence about the payload itself, and the two are told apart by
 *  `source` rather than by reading the sentence.
 *
 *  THIS FILE NO LONGER WRITES THE BACKEND'S OWN ABSENT-CASE SENTENCE.
 *  The fallback used to be live_read.read_for_fixture's wording for
 *  "no component read has been persisted", typed out here — so a
 *  payload that carried NO words at all rendered as a positive
 *  statement about the collector that nothing on the response
 *  supports, in the same ink and under the same testid as the
 *  backend's own. A read block with neither sides nor words is a
 *  payload that said nothing; that is what is said, and `source`
 *  is what a guard reads. */
function readAbsent(m: WatchedMatch): {
  words: string; source: "payload" | "unstated";
} {
  const w = m.read?.words;
  if (typeof w === "string" && w.trim() !== "") {
    return { words: w, source: "payload" };
  }
  return {
    source: "unstated",
    words: "This response carries no live read for this fixture and no "
      + "words for its absence — neither a persisted read nor a reason "
      + "there is none. Nothing here says the collector wrote nothing.",
  };
}

const readAbsentWords = (m: WatchedMatch): string => readAbsent(m).words;


/** THE CAVEAT IS ONE FACT ABOUT ONE COMPONENT, NOT ONE PER SIDE. The
 *  payload hangs `possession_is_distrusted` on the possession component
 *  of every side that has one, so drawing it where it hangs put the
 *  same sentence on the face twice — home and away — and a third time
 *  in the card's disclosure, which is precisely what the card's note
 *  guard exists to catch. It is read once here, drawn once under the
 *  two sides (beside the numbers it qualifies, not hidden behind a
 *  disclosure), and passed to CardNotes as already-said so the prose
 *  walk does not repeat it. */
/** EVERY PAYLOAD SENTENCE A POSITION DRAWS ON ITS FACE, in one place.
 *
 *  The note walk collects payload prose over a length threshold into the
 *  card's one disclosure, and CardNotes excludes whatever the face has
 *  already said. Each of these was drawn on the face by a block that
 *  meant to — the asymmetry FINDING is about this position and its own
 *  comment says it stays on the card, while the RULE beside it is the
 *  same paragraph on every position ever priced and belongs in the
 *  disclosure — but none of them was declared, so each landed in both
 *  places. They are collected here rather than beside each caller so
 *  that "what the face says" is one readable list instead of an
 *  argument spread over three call sites. */
function faceProse(m: WatchedMatch): string[] {
  const out: (string | null | undefined)[] = [];
  for (const p of m.positions ?? []) {
    const cert = p.certainty_premium;
    out.push(cert?.line, cert?.asymmetry?.finding);
    // A FAILED DEPTH READ IS NAMED ON THE FACE, never folded into "no
    // depth" — so it is said here too.
    const book = p.partial_exit?.book;
    out.push(book?.depth_read, book?.depth_read_note);
    // THE ROUNDING RULE IS STATED ON EVERY ROW IT CHANGES, and the row
    // states it inside its own `no_whole_contract` sentence. The
    // standing paragraph under `rounding` is that same text, so leaving
    // it to the prose walk put the rule on the face and again in the
    // disclosure — one rule, read twice.
    for (const f of p.partial_exit?.fractions ?? []) {
      out.push(f?.rounding, f?.no_whole_contract);
    }
    out.push(p.partial_exit?.not_a_recommendation, mapCategoryRule(p.entry_map),
             p.entry_map?.a_map_not_a_verdict, p.entry_map?.no_response_window,
             p.entry_map?.not_a_signal, p.entry_map?.match_now?.witness,
             p.entry_map?.match_now?.note);
    // THE CLEAN-VARIANT REFUSAL IS SAID ONCE, IN THE MAP'S HEADER,
    // behind the circled `i`. Without this line the prose walk sweeps
    // it into the card's disclosure as well — it is a ~1,500-character
    // string on fourteen nodes of the map, far over NOTE_MIN_CHARS —
    // and one fact would be told twice on one card, which is the whole
    // reason that disclosure excludes what the face already says.
    if (p.entry_map) out.push(variantExceptionWords(p.entry_map));
  }
  return out.filter((x): x is string => typeof x === "string" && x !== "");
}

function possessionCaveat(m: WatchedMatch): string | null {
  for (const side of Object.values(m.read?.sides ?? {})) {
    for (const c of Object.values(side?.components ?? {})) {
      const w = c?.possession_is_distrusted;
      if (typeof w === "string" && w) return w;
    }
  }
  return null;
}

function ReadBlock({ m }: { m: WatchedMatch }) {
  const sides = m.read?.sides ?? {};
  const names = Object.keys(sides);
  if (names.length === 0) {
    const absent = readAbsent(m);
    return (
      <p data-testid="watched-read-absent" data-source={absent.source}
        className="mt-3 rounded-lg border border-line bg-elev2 px-3 py-2 text-[12px] leading-relaxed text-warn">
        {absent.words}
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
  const caveat = possessionCaveat(m);
  return (
    <>
      <div data-testid="watched-read" className="mt-3 grid gap-3 sm:grid-cols-2">
        {names.map((side) => (
          <ReadSideBlock key={side} side={sides[side]}
            team={side === "home" ? m.home : side === "away" ? m.away : side} />
        ))}
      </div>
      {caveat && (
        // IN THE ACCESSIBLE TREE, NOT ON A title=, and not behind the
        // disclosure either: a reader must not receive the possession
        // number without the sentence that distrusts it.
        <p data-testid="watched-possession-caveat"
          className="mt-2 text-[11px] leading-relaxed text-warn">
          {caveat}
        </p>
      )}
    </>
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
      {/* THE UNITS AND THE SPAN, WHICH ARE PART OF THE NUMBERS. The
          rules about them — that the four are never combined, that a
          composite would be a claim — are the same sentence on every
          side of every card, so they ride in the card's one disclosure
          instead of under each of the four blocks. */}
      <p data-testid="watched-read-basis"
        className="mt-2 font-mono text-[10px] text-ink-faint">
        half-life {side.half_life_seconds}s match time ·{" "}
        {side.observed_from_kickoff
          ? "from kickoff"
          : "from the minute this watch began"}
        <span className="sr-only">
          {" "}— decaying reads. The four components are never combined
          into one number; the payload&apos;s own words for why are in the
          disclosure at the foot of this card.
        </span>
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

    </div>
  );
}

// --- 2..5 — the position, the branches, the certainty, the refusals ---

function PositionBlock({ p, refusals }: {
  p: WatchedPosition;
  /** WALKED ONCE, BY THE CARD. The same collector feeds these chips and
   *  the card's ledger, so a chip and its sentence cannot drift. */
  refusals: Refusal[];
}) {
  const pos = p.position;
  const cert = p.certainty_premium;
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
      <PartialExits pe={p.partial_exit} />
      <MapBlock map={p.entry_map} />
      <NotBuiltUpstream p={p} />
      <RefusalChips refusals={refusals}
        testid="watched-position-refusals" />
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
      {/* THE UNITS, NOT THE ESSAY. What mark-to-bid means, why the
          entry fee is not in it and why it should least influence the
          decision are the same three sentences on every position on
          every card; they ride in the card's one disclosure. What
          cannot move is the WITHHELD word and the code that withheld
          it, because that is a fact about THIS number. */}
      <p className="w-full font-mono text-[10px] text-ink-faint">
        {pnl != null ? (
          <>mark-to-bid, entry sunk
            <span className="sr-only">
              {" "}— what hitting the live bid nets today less what the
              position cost. The entry fee is not in that cost. This is
              the one number on this card that should least influence the
              decision; the payload&apos;s own words are in the disclosure
              below.
            </span>
          </>
        ) : (
          <span data-testid="watched-pnl-withheld-why" className="text-warn">
            withheld{withheldBy ? ` under ${withheldBy}` : ""} — the exit
            it would be marked against was withdrawn, and marking a
            position against a bid the book will not pay is the same
            false certainty one key over
          </span>
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
          <p data-testid="watched-hold-refused"
            data-code={hold.refusal_code ?? ""}
            className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-warn">
            refused{hold.refusal_code ? ` · ${hold.refusal_code}` : ""}
          </p>
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
            {hold.quantity?.n != null && (
              <p className="mt-1 font-mono text-[10px] text-ink-faint">
                n={hold.quantity.n.toLocaleString()}
                {/* A BOOLEAN OVER AN EMPTY SET IS NOT A FACT, and the
                    correct version of this check was already one
                    function over. `band.every(x => x != null)` is TRUE
                    for `[]`, so a band array with nothing in it drew
                    " · band []" — a band rendered for a quantity that
                    has none. `bandText` (the map's reader) requires two
                    endpoints and neither of them null; it is the reader
                    both places use now, so the two cannot disagree
                    about what a band is. */}
                {bandText(hold.quantity.band ?? null)}
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
            data-code={sell.refusal_code ?? ""}
            className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-warn">
            refused{sell.refusal_code ? ` · ${sell.refusal_code}` : ""}
            <span className="sr-only">
              {" "}— no figure is drawn in its place. The reason is in
              the disclosure at the foot of this card.
            </span>
          </p>
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
          </>
        ) : (
          <p className="mt-1 text-[12px] leading-relaxed text-warn">
            no sell branch on this payload
          </p>
        )}
      </div>
      {/* `hold.says`, `sell.says` and `branch_view.why` are the
          BRANCHES_NOT_AVERAGES rule and its two glosses — the same
          three sentences under every position on the card. They ride in
          the card's one disclosure; the branches themselves, which are
          the thing the 2026-09-02 card collapsed, stay here. */}
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
          {/* THE LINE STAYS. It is the only sentence here that is
              made of THIS position's own numbers — the hold figure, the
              net bid and the state the ahead/behind word was derived
              from — so a reader can check the word against the numbers
              beside it. `removes.says`, `premium.says` and
              `not_a_recommendation` are standing rules, identical on
              every position on the card, and they ride in the card's
              one disclosure. */}
          {cert.line && (
            <p data-testid="watched-certainty-line"
              className="mt-1.5 font-mono text-[11px] leading-relaxed text-ink-mid">
              {cert.line}
            </p>
          )}
        </>
      ) : (
        <p data-testid="watched-certainty-refused"
          data-code={cert.refusal_code ?? ""}
          className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-warn">
          refused{cert.refusal_code ? ` · ${cert.refusal_code}` : ""}
          <span className="sr-only">
            {" "}— the certainty premium is not priced here and nothing
            stands in for it. The reason is in the disclosure at the foot
            of this card.
          </span>
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
      {/* THE FINDING IS ABOUT THIS POSITION AND STAYS ON THE FACE OF
          THE CARD. `a.rule` is CERTAINTY_IS_ASYMMETRIC — the same
          paragraph on every position ever priced — and it rides in the
          card's one disclosure. G1 itself does not move: an ahead
          position still carries this line, a behind one still leads
          with the escalation, and an unknown one still fails closed. */}
      {a?.finding
        ? <>{a.finding}</>
        : (behind || unknown ? null
           : <>Certainty is cheap when you are winning and dear when you
               are losing — structural, not a setting.</>)}
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

      {/* THE NAME, NOT THE PARAGRAPH. A stale book refuses all four
          fractions AND the whole position with one sentence; printing
          it five times is what buried the rows it applied to. The code
          is here, on the row that could not be priced, and the sentence
          is once in the card's ledger. */}
      {f.refused && (
        <p data-testid="watched-fraction-refused" data-code={f.refusal_code}
          className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-warn">
          {withdrawnByLeg ? "withdrawn" : "refused"}
          {f.refusal_code ? ` · ${f.refusal_code}` : ""}
          <span className="sr-only">
            {" "}— no figure is drawn for this fraction. The reason is in
            the disclosure at the foot of this card.
          </span>
        </p>
      )}
      {/* a second finding never hides behind the first */}
      {f.refusals && Object.keys(f.refusals).length > 1 && (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {Object.keys(f.refusals).filter((c) => c !== f.refusal_code)
            .map((c) => (
              <li key={c} data-testid="watched-fraction-also-refused"
                data-code={c}
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-warn">
                also refused · {c}
              </li>
            ))}
        </ul>
      )}

      {alone && (
        <>
          <Realises r={alone} withdrawn />
          <p className="mt-0.5 font-mono text-[10px] text-ink-faint">
            what this row would have realised alone — not an exit this
            position can take
            <span className="sr-only">
              {" "}— the ladder is one pool and this leg is held more
              than once, so the figure is kept as history rather than
              offered. The rule is in the disclosure at the foot of this
              card.
            </span>
          </p>
        </>
      )}

      {f.leg_consult && (
        <p data-testid="watched-fraction-leg-consult"
          data-holds={String(f.leg_consult.holds)}
          className={`mt-1 font-mono text-[10px] ${
            f.leg_consult.holds ? "text-ink-faint" : "text-warn"}`}>
          shared ladder · {f.leg_consult.holds ? "holds" : "does NOT hold"}
          {f.leg_consult.unpriced_contracts
            ? ` · ${f.leg_consult.unpriced_contracts} sibling contract(s) `
              + "unpriced and counted in" : ""}
          <span className="sr-only">
            {" "}— the ladder&apos;s own words are in the disclosure at the
            foot of this card; a sibling that could not be priced is
            counted into the total rather than assumed away.
          </span>
        </p>
      )}

      {f.remains && (
        <p data-testid="watched-fraction-remains"
          className="mt-1 font-mono text-[11px] tabular-nums text-ink-mid">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            remains{" "}
          </span>
          {f.remains.contracts != null
            ? `${f.remains.contracts} contracts exposed` : "exposed"}
          {f.remains.expected_at_engine_read_dollars != null && (
            <span className="text-ink-faint">
              {" "}· expected{" "}
              {dollars(f.remains.expected_at_engine_read_dollars)}
            </span>
          )}
          {f.remains.expected_refused && (
            <span className="text-warn"> · expectation refused</span>
          )}
        </p>
      )}

      {(f.vs_whole_position || f.vs_whole_position_alone) && (
        <p data-testid="watched-fraction-vs-whole"
          data-matches={String(f.matches_whole_position_exit)}
          className="mt-1 font-mono text-[10px] text-ink-faint">
          vs the whole position ·{" "}
          {f.matches_whole_position_exit === true ? "matches"
            : f.matches_whole_position_exit === false ? "differs"
            : "not stated"}
        </p>
      )}
      {/* `f.says`, `f.remains.says` and the vs-whole sentence are the
          payload's prose for this row. They ride in the card's one
          disclosure, deduped — four fractions carry four near-identical
          copies of the same rule. */}
    </li>
  );
}

function PartialExits({ pe }: { pe: PartialExit | undefined }) {
  if (!pe) {
    // ABSENT, NOT EMPTY — and absent is not "no clip is available".
    return (
      <p data-testid="watched-partial-exit-absent"
        className="mt-3 font-mono text-[11px] text-warn">
        partial exit · ABSENT from this payload
        <span className="sr-only">
          {" "}— a block this read did not carry, which is not a finding
          that a clip is unobtainable. No fraction is priced in its
          place.
        </span>
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
        {/* MISSING IS NEVER ZERO, on the ladder as everywhere else. This
            read `book.levels?.length ?? 0`, so a book that carried a
            resting total and NO level list printed "…resting across 0
            level(s)" — a measured empty ladder and an absent one in the
            same words, on the line that says what the fractions below
            were walked against. */}
        {book?.resting_total != null
          ? ` · ${book.resting_total} resting across ${
              Array.isArray(book.levels)
                ? `${book.levels.length} level(s)`
                : "a level list this payload did not carry"}` : ""}
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
          className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-warn">
          refused{pe.refusal_code ? ` · ${pe.refusal_code}` : ""}
          <span className="sr-only">
            {" "}— no fraction below prints a figure. The reason is in
            the disclosure at the foot of this card.
          </span>
        </p>
      )}

      {pe.withdrawn_on_shared_ladder?.length ? (
        <p data-testid="watched-partial-exit-withdrawn"
          className="mt-1 font-mono text-[11px] text-warn">
          withdrawn on the shared ladder:{" "}
          {pe.withdrawn_on_shared_ladder.join(", ")}
          <span className="sr-only">
            {" "}— the rule that withdrew them is in the disclosure at
            the foot of this card.
          </span>
        </p>
      ) : null}

      <ul className="mt-2 space-y-2">
        {pe.fractions.map((f) => <Fraction key={f.label} f={f} />)}
      </ul>

      {/* THE BLOCK'S FIVE STANDING SENTENCES — the ladder rule, the fee
          basis, whole contracts and the common case — are identical
          under every position on every card and are drawn ONCE, in the
          card's one disclosure, by the walk that collects them from this
          payload's own bytes. What stays here is what is about THIS
          block: the sentence that says four sizes are not a menu, and
          which rows were consulted, by name. */}
      {/* THE NEGATION IS THE POINT OF THE BLOCK. Four priced sizes of
          one trade look like a menu; this is the sentence that says they
          are not one, and it belongs under them rather than in a
          disclosure a reader may never open. Declared as face-said so
          the walk does not draw it a second time. */}
      {pe.not_a_recommendation && (
        <p data-testid="watched-partial-exit-not-a-recommendation"
          className="mt-2 text-[11px] leading-relaxed text-ink-faint">
          {pe.not_a_recommendation}
        </p>
      )}
      {pe.executability?.consulted?.length ? (
        <p data-testid="watched-partial-exit-consulted"
          data-consulted={pe.executability.consulted.join(",")}
          className="mt-2 font-mono text-[10px] text-ink-faint">
          consulted, in the registry&apos;s own order:{" "}
          {pe.executability.consulted.join(" · ")}
          <span className="sr-only">
            {" "}— each of those names is defined once, with the reason it
            fired, in the disclosure at the foot of this card.
          </span>
        </p>
      ) : null}
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

// --- the grid that refuses the clean variant --------------------------
//
// ONE FACT ABOUT THE WHOLE MAP, DRAWN ONCE, IN THE HEADER.
//
// Four of the map's five grids read the clean variant (`clean_11v11`,
// eleven-a-side throughout). The first-goal grid reads `all`, and the
// backend explains why in ~1,500 characters: that grid's clean filter's
// WINDOW END IS THE AXIS IT BINS, so its seven bins are conditioned on
// seven different events and a map that SUMS bins cannot use them
// (entry_map.FIRST_GOAL_TIMING_CLEAN_REFUSED).
//
// EVERY "reaching this state" FIGURE ON THIS MAP IS SUMMED OUT OF THAT
// GRID, which is why this belongs to the surface rather than to a row.
// The payload carries the sentence in fourteen places — on the timing
// panel, on each of its seven bin rows, on each branch's composed tail,
// and once on the grids block — because a row is what an operator reads
// and a number lifted out on its own must carry its provenance. That is
// a rule about the PAYLOAD. Printing it fourteen times is the "remove
// this warning in each match card, it is so annoying and repetitive"
// complaint, verbatim, and the answer he asked for then is the answer
// here: put it at the top beside the basis label, behind a circled `i`,
// and show the words on hover.
//
// THE FIGURES ARE UNTOUCHED. This moves the EXPLANATION to where a
// whole-surface fact belongs. Nothing about which numbers are drawn, or
// what they say, changes — and each drawn tail still carries its own
// variant as DATA (`data-variant`), so a guard can prove the header
// speaks for every figure under it without a word of prose on the row.

/** Every grid whose variant differs from the map's headline one, read
 *  off the payload's own per-grid table. DERIVED, never a grid named in
 *  this file: a second deviating grid is drawn the day the backend
 *  registers one, and a map where nothing deviates draws nothing. */
export function variantDeviations(g: EntryMap["grids"]):
    { grid: string; variant: string }[] {
  const headline = g?.variant;
  const table = g?.variant_by_grid;
  if (!headline || !table) return [];
  return Object.keys(table).sort()
    .filter((name) => table[name] !== headline)
    .map((name) => ({ grid: name, variant: table[name] }));
}

/** The exception's own words, from wherever the payload put them.
 *
 *  THE GRIDS BLOCK FIRST, then any composed tail that carries one —
 *  they are the same string by construction (both read
 *  entry_map.FIRST_GOAL_TIMING_CLEAN_REFUSED), and taking the branch as
 *  a fallback means a payload that carries the reason only where the
 *  figures are still shows it. Returns null when NO copy is on the
 *  payload, which is a different fact from there being no exception and
 *  is drawn as one. */
export function variantExceptionWords(map: EntryMap): string | null {
  const onGrids = map.grids?.variant_exception;
  if (typeof onGrids === "string" && onGrids.trim() !== "") return onGrids;
  for (const b of Object.values(map.branches ?? {})) {
    const w = b?.reached?.clean_variant_refused;
    if (typeof w === "string" && w.trim() !== "") return w;
  }
  return null;
}

/** The circled `i` and its note — the pattern PickerColumn's
 *  `ColumnNotes` already carries, for the same reason and with the same
 *  openings.
 *
 *  HOVER IS NOT ENOUGH ON ITS OWN. There is no hover on a phone and
 *  none from a keyboard, and this is the sentence that stops the
 *  first-goal figures being read on the same basis as the map's other
 *  four grids. It opens on hover, on focus and on tap; Escape closes
 *  it; the button carries a real accessible name that says what is
 *  inside. The click is authoritative, which is the only way to close a
 *  panel a hover is holding open on a touch screen.
 *
 *  IT IS AN AFFORDANCE, NOT AN ALERT. Neutral line and ink at rest,
 *  accent only when it opens — gold is brand here, never a verdict, and
 *  the traffic light stays on the numbers. */
function VariantNote({ words, deviations }: {
  words: string;
  deviations: { grid: string; variant: string }[];
}) {
  const panelId = useId();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = pinned || hovered || focused;
  const shut = () => { setPinned(false); setHovered(false); setFocused(false); };
  return (
    <span className="inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === "Escape") shut(); }}>
      <button type="button" data-testid="watched-map-variant-open"
        aria-expanded={open}
        aria-label={`why ${deviations.map((d) => d.grid).join(" and ")} `
          + "does not read this map's clean variant"}
        aria-describedby={open ? panelId : undefined}
        data-grids={deviations.map((d) => d.grid).join("+")}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => {
          e.preventDefault(); e.stopPropagation();
          setPinned((p) => !p); setHovered(false); setFocused(false);
        }}
        // NOT `font-mono`: the mono lowercase i carries a serif at both
        // ends and reads as a FIGURE ONE at this size inside a 16px
        // circle. The sans i is a dot over a bare stem. Same reasoning,
        // and the same glyph, as PickerColumn's ColumnNotes.
        className={`inline-flex h-[16px] w-[16px] items-center justify-center self-center rounded-full border text-[11px] font-semibold leading-none transition-colors ${
          open ? "border-accent/60 text-accent"
            : "border-line-strong text-ink-low hover:border-accent/40 hover:text-accent"}`}>
        i
      </button>
      {open && (
        // A CAP AND A SCROLLBAR: this is the backend's own paragraph and
        // it is ~1,500 characters. Uncapped it runs off the bottom of
        // the viewport and the way out would be to scroll the page,
        // which drags what the panel is anchored to. The overflow lives
        // inside the panel instead, and the pointer stays within the
        // hover container while scrolling it, so reading cannot close
        // it.
        <div data-testid="watched-map-variant-note" id={panelId} role="note"
          className="absolute left-0 top-[calc(100%+7px)] z-30 max-h-[min(70vh,40rem)] w-[min(34rem,100%)] overflow-y-auto rounded-lg border border-line-strong bg-elev2 p-3 text-left font-sans text-[11px] normal-case leading-relaxed tracking-normal text-ink-mid shadow-xl">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            {deviations.map((d) => `${d.grid} · ${d.variant}`).join(" — ")}
          </p>
          {/* THE BACKEND'S OWN WORDS, whole — not summarised and not
              truncated. It is the only place on this card they appear. */}
          <p data-testid="watched-map-variant-words" className="mt-1">
            {words}
          </p>
        </div>
      )}
    </span>
  );
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
          className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-warn">
          refused · {b.refusal_code}
        </p>
      )}

      {b.reached && (
        // `data-variant` IS DATA, NOT PROSE. The tail carries the grid
        // variant it was summed out of; the operator reads that fact
        // ONCE, in the header, and a guard reads it here to prove the
        // header speaks for every figure drawn under it. Nothing is
        // printed on the row.
        <p data-testid="watched-map-reached"
          data-variant={b.reached.variant ?? ""}
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
              className="uppercase tracking-[0.1em] text-warn">
              {b.reached.refusal_code
                ? `refused · ${b.reached.refusal_code}`
                : "no measured rate for reaching this state"}
            </span>
          )}
          <span className="block font-sans text-[11px] text-ink-faint">
            {b.reached.state}
            {b.reached.composed_from?.length
              ? ` (composed from ${b.reached.composed_from.join(", ")})` : ""}
          </span>
          {b.reached.by_side?.refusal_code && (
            <span data-testid="watched-map-refusal"
              data-where={`${name}.reached.by_side`}
              data-code={b.reached.by_side.refusal_code}
              className="block text-[10px] uppercase tracking-[0.1em] text-warn">
              by side refused · {b.reached.by_side.refusal_code}
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
          className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-warn">
          refused · {b.your_contract.refusal_code}
          <span className="sr-only">
            {" "}— no number is drawn for this branch. The reason is in
            the disclosure at the foot of this card.
          </span>
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
          {/* `answers` and `note` are the payload's gloss on the
              quantity; the WORD above is derived from its own key and
              is what keeps a bound from reading as an estimate. The
              gloss rides in the card's one disclosure. */}
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
          </p>
        ) : exp.refusal_code ? (
          <p data-testid="watched-map-refusal" data-where={`${name}.expected`}
            data-code={exp.refusal_code}
            className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-warn">
            refused · {exp.refusal_code}
          </p>
        ) : (
          // NOT REFUSED — REFUSED BY TYPE. An expectation off a LOWER
          // BOUND would be the 2026-09-02 substitution in dollars, so
          // the backend never computes one and the block says why. It
          // carries no registry code because nothing was missing.
          <p data-testid="watched-map-expected-not-priced"
            className="mt-0.5 font-mono text-[10px] text-warn">
            NOT PRICED — an expectation off a LOWER BOUND would be a
            substitution in dollars
            <span className="sr-only">
              {" "}— the payload&apos;s own words are in the disclosure at
              the foot of this card. This carries no registry code
              because nothing was missing.
            </span>
          </p>
        )
      )}
      {/* BRANCHES_NOT_AVERAGES rides on every branch of every map. It
          is one rule and it is drawn once, in the card's disclosure. */}
    </li>
  );
}

/** The category rule the payload writes on every quantity that carries
 *  one — read once, so the block that draws it and the walk that must
 *  skip it can never disagree about which string it is. */
function mapCategoryRule(map: EntryMap | undefined): string | undefined {
  const branches = map?.branches ?? {};
  return Object.keys(branches).map((k) =>
    (branches[k]?.your_contract?.quantity as Record<string, unknown> | undefined)
      ?.category_rule).find((x) => typeof x === "string") as string | undefined;
}

function MapBlock({ map }: { map: EntryMap | undefined }) {
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
  const categoryRule = mapCategoryRule(map);
  // THE GRID THAT REFUSES THE CLEAN VARIANT — read once, drawn once, in
  // the header. See the block above MapBranch.
  const deviations = variantDeviations(map.grids);
  const exceptionWords = variantExceptionWords(map);

  return (
    <div data-testid="watched-entry-map" data-started={String(started)}
      className="mt-3 rounded-lg border border-line px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        the map · {map.drawn_from} · {map.version}
      </p>

      {/* WHETHER A BALL HAS BEEN KICKED IS THE PAYLOAD'S ANSWER, not a
          clock in this file. A started fixture keeps the map and says
          the map is history, in the backend's own words. */}
      <p data-testid="watched-map-when" data-started={String(started)}
        className={`mt-1 font-mono text-[10px] ${
          started ? "text-warn" : "text-ink-faint"}`}>
        {/* THE PAYLOAD'S OWN WORDS, NOT A SENTENCE WRITTEN HERE. The
            note says WHAT WAS READ to conclude the match has not begun
            — "neither the fixture row nor any state-tape row" — and a
            frontend string saying "before a ball was kicked" asserts
            the same conclusion while dropping the evidence for it. That
            substitution is the winner-first-score-string shape: a word
            rendered beside numbers it is no longer derived from. */}
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

      {/* THE BASIS OF THE WHOLE MAP, AND ITS ONE EXCEPTION, ONCE.
          `relative` because the note below anchors to THIS LINE rather
          than to the 16px button: the line is exactly the block's width,
          so `left-0` + `w-[min(34rem,100%)]` starts at its left edge and
          is at most the block wide at every width the strip is drawn at.
          Anchored to the button, `100%` would be 16px and a fixed width
          would hang off whichever edge it landed near — the bug
          PickerColumn's TierGaps was fixed for. */}
      {map.grids && (
        <p className="relative mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[10px] text-ink-faint">
          <span>
            {map.grids.variant} · floor n ≥ {map.grids.min_n_floor}
            {deviations.length > 0 ? " ·" : ""}
          </span>
          {deviations.length > 0 && (
            <>
              {/* WHICH GRID DEVIATES AND TO WHAT — derived from the
                  payload's per-grid table, so a second one appears the
                  day the backend registers it. The FIGURES are
                  untouched; this is the label that stops them being
                  read on the same basis as the other four. */}
              <span data-testid="watched-map-variant-exception"
                data-grids={deviations.map((d) => d.grid).join("+")}
                data-variants={deviations.map((d) => d.variant).join("+")}
                className="text-ink-low">
                {deviations.map((d) => `${d.grid}: ${d.variant}`).join(" · ")}
              </span>
              {/* THE REASON IS BEHIND THE CIRCLE, NOT BESIDE IT. The
                  payload carries it on fourteen nodes; an operator gets
                  it once, on demand. A payload that names the deviation
                  and carries NO reason says that instead — an absent
                  explanation is not an absent exception. */}
              {exceptionWords ? (
                <VariantNote words={exceptionWords} deviations={deviations} />
              ) : (
                <span data-testid="watched-map-variant-unexplained"
                  className="text-warn">
                  no reason on this payload
                </span>
              )}
            </>
          )}
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
          {map.red_card.withdrawal?.because
            ?? "a dismissal voids every grid-derived number on this map "
               + "from first sighting"}
          <span className="sr-only">
            {" "}— the rule that withdraws them is in the disclosure at
            the foot of this card.
          </span>
        </p>
      ) : null}

      {names.length > 0 && (
        <ul className="mt-2 space-y-2">
          {names.map((k) => (
            <MapBranch key={k} name={k} b={branches[k]} />
          ))}
        </ul>
      )}

      {/* THE MAP'S OWN CAVEATS STAY ON THE MAP. Each says something a
          reader must not receive these numbers without: that this is a
          map and not a verdict, that M0 measured no response window,
          and that the two quantities are not the same thing and cannot
          be compared — the rule that stops the 2026-09-02 substitution.
          A disclosure at the foot of the card is one click too far from
          the numbers they qualify. All four are declared as face-said,
          so the prose walk does not draw them a second time. */}
      <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-faint">
        <p data-testid="watched-map-not-a-verdict">{map.a_map_not_a_verdict}</p>
        <p data-testid="watched-map-no-window">{map.no_response_window}</p>
        {map.not_a_signal && <p>{map.not_a_signal}</p>}
        {categoryRule && (
          <p data-testid="watched-map-category-rule">{categoryRule}</p>
        )}
      </div>

      {/* THE TWO COUNTS, WHICH ARE NUMBERS AND NOT PROSE. The map's own
          tally and how many of them this surface drew, from ONE
          collector, so the printed count cannot drift from the rows
          above it. */}
      {tally != null && (
        <p data-testid="watched-map-refusal-count"
          data-total={tally} data-drawn={shown}
          className="mt-2 font-mono text-[10px] text-ink-faint">
          {tally} refusals counted on this map · {shown} drawn above
          {map.refusals?.count_by_code
            ? ` (${Object.keys(map.refusals.count_by_code).sort()
                .map((c) => `${c} ${map.refusals!.count_by_code[c]}`)
                .join(" · ")})`
            : ""}
          <span className="sr-only">
            {" "}— the rest sit inside grid subtrees this surface does not
            draw. They are counted here rather than left to be assumed
            away, and every name above is defined in the disclosure at
            the foot of this card.
          </span>
        </p>
      )}
    </div>
  );
}

// --- 7. what this surface knows it cannot draw -------------------------
//
// REGISTERED, NOT PRETENDED. B3 (a blended live rate, to be shown BESIDE
// the engine's read as a second opinion and never in its place) SHIPPED
// after this surface was built (backend 688a696, src/live/live_rates.py)
// and REFUSES EVERY BLEND: M1 published k but not the shots-to-goals
// conversion k was fitted with, so live_rates carries a registered hole
// and its table is empty. No POSITION payload carries a blended rate and
// no shape of one has been recorded off an emitter. Rather than draw a
// block against a shape nobody sends — which is how a surface certifies a
// reader that cannot read the real payload — the hole is written down
// here with the condition that closes it.
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

// --- 7a. an absence this surface cannot tell from a FAILURE -----------
//
// THE TAPE'S FAILURE IS CODED AND THE OTHER TWO READS' ARE NOT — the
// same shape, one reader over, which is this stage's whole lesson.
//
// `tapeVerdictOf` can tell "the tape read FAILED" from "there is no
// row" because the route puts a REGISTERED CODE on the payload for the
// first (`tape_unreadable`, in position.REFUSAL_CODES), and the strip
// derives the two answers from that code rather than from prose. The
// live read and the journal read fail through the same route, in the
// same request, and neither failure is coded:
//
//   read.words       api/main.py `_read` writes "THE LIVE READ COULD
//                    NOT BE READ: …" here on a failure, and
//                    live_read.read_for_fixture writes "no component
//                    read has been persisted …" here on an absence.
//                    ONE untyped key, two opposite facts.
//   positions_note   api/main.py `_positions` writes card._layer's
//                    failure sentence here when journal.held_positions
//                    threw, and journal.held_positions' own `refused`
//                    wording here when the list is legitimately empty.
//                    ONE untyped key, two opposite facts.
//
// So this surface draws both sentences VERBATIM and infers nothing
// from them: it does not colour them differently, does not fold either
// into a class, and does not sniff the prose for a keyword — matching
// on "COULD NOT BE READ" would be the venue-class failure exactly (the
// code's vocabulary standing in for the provider's), and it would go
// silently wrong the day the wording changed.
//
// IT IS REGISTERED RATHER THAN FAKED. The record below carries the
// finding and the condition that closes it, and `uncodedAbsencesClosed`
// derives — from the payload, never from a key spelled here — whether
// the block has since grown a code. The guard in
// e2e/watched-strip.spec.ts fails BOTH ways: if a third uncoded
// absence of this shape appears without a record, and if a registered
// one is closed while its record still stands.
export const UNCODED_ABSENCE_KEYS: Record<string, {
  block: "read" | "match"; finding: string; closes_when: string;
}> = {
  "read.words": {
    block: "read",
    finding: "a live read that FAILED and a fixture with no persisted "
      + "read arrive under the SAME key, as prose, with no refusal code "
      + "on the block. api/main.py `_read` and "
      + "live_read.read_for_fixture both write `words`, so this surface "
      + "cannot derive which of the two it has and renders the "
      + "payload's own sentence without classifying it. `we could not "
      + "look` and `there is nothing to look at` are different facts "
      + "and this one distinction is not available here.",
    closes_when: "the read block carries a refusal code beside its "
      + "words — any `*refusal_code` on the read whose value is in "
      + "position.REFUSAL_CODES, which is the registry the payload "
      + "already ships — the way the tape's failure carries "
      + "`tape_unreadable`; then this surface derives the two answers "
      + "the way tapeVerdictOf does and this record retires, or the "
      + "guard fails.",
  },
  "positions_note": {
    block: "match",
    finding: "a journal read that FAILED and a fixture that holds "
      + "nothing arrive under the SAME key, as prose, with no refusal "
      + "code beside it. api/main.py `_positions` returns card._layer's "
      + "failure sentence on this key and journal.held_positions' own "
      + "`refused` wording on it, and an empty `positions` list sits "
      + "beside both — so an open position nobody could read is drawn "
      + "in the same ink as a fixture with no position on it.",
    closes_when: "the match block carries a refusal code beside the "
      + "note — any `*refusal_code` on the match whose value is in "
      + "position.REFUSAL_CODES; then the two are told apart here and "
      + "this record retires, or the guard fails.",
  },
};

/** Whether a block has grown a CODE for its absence — DERIVED, never a
 *  key name typed here: any key whose name ends `refusal_code` and
 *  whose value is a name the payload's own registry defines. */
function codedRefusalOn(node: unknown, registry: Record<string, string>,
                        skip: string[] = []): boolean {
  if (!isObj(node)) return false;
  return Object.entries(node).some(([k, v]) =>
    !skip.includes(k) && k.endsWith("refusal_code")
    && typeof v === "string" && v in registry);
}

/** The registered records on THIS match whose closing condition has
 *  been met — a record that should have been retired. Empty is the
 *  healthy answer and the guard reads it either way. */
export function uncodedAbsencesClosed(
  m: WatchedMatch, registry: Record<string, string>,
): string[] {
  return Object.keys(UNCODED_ABSENCE_KEYS).filter((k) => {
    const where = UNCODED_ABSENCE_KEYS[k].block;
    const node = where === "read" ? m.read : m;
    return codedRefusalOn(node, registry, where === "read" ? ["sides"] : []);
  });
}

/** OFF THE SURFACE, LIKE EVERY OTHER RECORD ON THIS FILE. The keys the
 *  match actually carried, and any record whose condition has been met,
 *  as DATA on a hidden node — bookkeeping a guard reads, never a
 *  paragraph handed to an operator mid-match. */
function UncodedAbsences({ m, registry }: {
  m: WatchedMatch; registry: Record<string, string>;
}) {
  const present = Object.keys(UNCODED_ABSENCE_KEYS).filter((k) => {
    const r = UNCODED_ABSENCE_KEYS[k];
    const node = (r.block === "read" ? m.read : m) as
      Record<string, unknown> | undefined;
    const leaf = k.split(".").pop()!;
    return node != null && typeof node[leaf] === "string"
      && (node[leaf] as string) !== "";
  });
  const closed = uncodedAbsencesClosed(m, registry);
  if (present.length === 0 && closed.length === 0) return null;
  return (
    <div hidden data-testid="watched-uncoded-absence"
      data-keys={present.join(",")} data-closed={closed.join(",")} />
  );
}

// --- 7b. what this surface knows it cannot draw, at the ENVELOPE ------
//
// THE SAME RECORD, ONE LEVEL UP, AND FOR THE SAME REASON. B3's hole is
// registered per POSITION above; the payload's own envelope has holes
// too, and this round found one the hard way: while this file was being
// written the backend owner was adding an `in_play_not_declared` block
// to the same response — matches the tape says are under way that
// NOBODY DECLARED. That is the second half of Son's invariant and it
// has no recorded shape on this surface yet. Drawing a block against a
// shape nobody has emitted is how a surface certifies a reader that
// cannot read the real payload; dropping it silently is how a whole
// section spends its life invisible. So it is written down, with the
// condition that closes it.
//
// THE THREE SETS ARE DISJOINT AND THEY COVER THE PAYLOAD. Every
// envelope key is CONSUMED (read and drawn here), BOOKKEEPING (an
// identifier that carries no finding about any match), or REGISTERED
// (carries a finding this surface does not draw). A key in none of them
// is NAMED on the surface the moment it arrives, and a key in two of
// them fails the guard in e2e/watched-strip.spec.ts — which is what
// makes a record retire when the block that replaces it ships, instead
// of standing as prose after it stops being true.

/** Envelope keys this surface actually reads and draws. */
export const CONSUMED_ENVELOPE_KEYS: readonly string[] = [
  "generated_at", "dormant", "matches", "monitored_by_source",
  "open_positions_not_monitored", "monitored_not_described",
  "refusal_codes", "policy_codes",
];

/** Envelope keys that identify the payload rather than describe a
 *  match. Not drawn, and nothing about a fixture is lost by that. */
export const BOOKKEEPING_ENVELOPE_KEYS: readonly string[] = ["version"];

/** Envelope keys that CARRY A FINDING this surface does not draw. */
export const UNRENDERED_ENVELOPE_KEYS: Record<string, {
  finding: string; closes_when: string;
}> = {
  in_play_not_declared: {
    finding: "the tape's own list of matches that are under way and that "
      + "NOBODY DECLARED — the second half of the invariant this stage "
      + "was reported for (a match cannot be selected once it has "
      + "kicked off, because the watch toggle lives on a board whose "
      + "fixtures leave it at kickoff). It was being added to this route "
      + "while this surface was being built, so no shape of it has been "
      + "recorded off a finished emitter and NO MATCH FROM IT IS DRAWN. "
      + "ONE FIELD OF ITS `coverage` IS READ AND THE READING IS NAMED "
      + "HERE RATHER THAN LEFT IMPLICIT: `collector_folds_over`, the "
      + "state collector's own competition registry, which is the only "
      + "thing on this payload that tells `no state tape is written for "
      + "this competition` apart from `the tape read FAILED` on a "
      + "declared match with no row. It is a list of slugs and carries "
      + "no claim about any fixture; the LIST of undeclared in-play "
      + "matches, which is what this record is about, is still not "
      + "drawn.",
    closes_when: "the block's shape is recorded off this route's own "
      + "emitter and it is drawn — beside the declared set and never "
      + "mixed into it, because a set you chose and a set the tape "
      + "offered are different evidence; then retire this record.",
  },
  standing: {
    finding: "the route's own charter sentences (it shows, it does not "
      + "decide; one read not N+1; this route writes nothing; every "
      + "match is drawn). They describe the ROUTE rather than any "
      + "fixture, and this surface states its own charter in its own "
      + "prose rather than quoting the backend's at the reader.",
    closes_when: "a standing sentence stops being true of this surface, "
      + "or one of them starts carrying a per-fixture finding; then it "
      + "is drawn where that finding belongs and this record retires.",
  },
  detail: {
    finding: "the reason a DORMANT plane gave for having no watchlist. "
      + "This surface renders nothing at all when `dormant` is true, so "
      + "the reason is dropped with it — a plane that is not configured "
      + "and a board with nothing declared look identical to a reader.",
    closes_when: "the dormant answer is drawn the way a refused read now "
      + "is — as a section that says which of the two it is — and this "
      + "record retires with the guard in e2e/watched-strip.spec.ts that "
      + "pins dormant to an absent strip.",
  },
};

/** Envelope keys on THIS payload that no set above accounts for.
 *  Derived from the payload, never hand-listed. */
function unaccountedEnvelopeKeys(data: WatchedStripResponse): string[] {
  const known = new Set([
    ...CONSUMED_ENVELOPE_KEYS, ...BOOKKEEPING_ENVELOPE_KEYS,
    ...Object.keys(UNRENDERED_ENVELOPE_KEYS),
  ]);
  return Object.keys(data).filter((k) => !known.has(k)).sort();
}

// OFF THE SURFACE, AND THAT IS THE POINT.
//
// This block used to render the records above as prose at the foot of
// the Live section: the finding, and the `closes_when`, for
// `in_play_not_declared`, `standing` and `detail`. That is developer
// commentary about the payload's own unfinished business, and it was
// sitting under an operator's live matches. The operator said so.
//
// THE RECORD IS NOT WEAKENED, IT IS MOVED TO WHERE IT BELONGS. It is
// exported from this file — which is where the guard in
// e2e/watched-strip.spec.ts imports it from — and the keys the payload
// actually carried are emitted as DATA, on a hidden node, so a guard
// can still fail BOTH ways: when a key arrives that no set accounts
// for, and when a registered hole is closed without its record being
// retired. Nothing here is drawn, and `hidden` keeps it out of the
// accessible tree as well as off the screen: it is not a caveat a
// reader is being denied, it is bookkeeping a reader was being handed.
function UndrawnEnvelope({ data }: { data: WatchedStripResponse }) {
  const registered = Object.keys(UNRENDERED_ENVELOPE_KEYS)
    .filter((k) => (data as unknown as Record<string, unknown>)[k] !== undefined).sort();
  const unaccounted = unaccountedEnvelopeKeys(data);
  if (registered.length === 0 && unaccounted.length === 0) return null;
  return (
    <div hidden data-testid="watched-envelope-undrawn">
      {registered.length > 0 && (
        <span data-testid="watched-envelope-registered"
          data-keys={registered.join(",")} />
      )}
      {unaccounted.length > 0 && (
        <span data-testid="watched-envelope-unaccounted"
          data-keys={unaccounted.join(",")} />
      )}
    </div>
  );
}

// OFF THE SURFACE, FOR THE SAME REASON AS THE ENVELOPE'S RECORDS.
// A key this surface has no recorded shape for is still NOT DRAWN and
// still NOT DROPPED: it is emitted as data on a hidden node, and the
// record that names it — the finding and its `closes_when` — is
// exported above, where the guard reads it. What changed is that an
// operator watching a live match is no longer handed a paragraph about
// a measurement's unpublished constant.
function NotBuiltUpstream({ p }: { p: WatchedPosition }) {
  const present = Object.keys(UNRENDERED_PAYLOAD_KEYS)
    .filter((k) => (p as Record<string, unknown>)[k] !== undefined);
  if (present.length === 0) return null;
  return (
    <div hidden data-testid="watched-unrendered" data-keys={present.join(",")}>
      {present.map((k) => (
        <span key={k} data-testid="watched-unrendered-key" data-key={k} />
      ))}
    </div>
  );
}

// --- 8. the refusals ---------------------------------------------------
//
// There is no list component here any more. A refusal renders as a chip
// (RefusalChips, above) and its sentence and definition render once, in
// the card's one disclosure (CardNotes, above). The two share one
// collector, so a chip on the surface and a sentence behind the
// disclosure can never disagree about what fired.

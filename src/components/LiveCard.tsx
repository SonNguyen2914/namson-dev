// THE LIVE SECTION — the matches under way, above the ranked board.
//
// Fed by GET /api/bet-suggester/watched-strip, the same read
// components/WatchedStrip.tsx polls (lib/suggesterApi.ts's
// `api.watchedStrip`, operator-gated, 15s). This surface draws a CARD
// per match where the strip draws a ledger; the two answer different
// questions off one payload and neither is a rewrite of the other.
//
// WHAT THIS SECTION IS NOT: RANKED. The board below it is ranked, says
// so in its heading, and prints 01/02/03 down each column. Nothing here
// is ordered by interest, quality or size — the page order is KICKOFF —
// and the frame says so on its own rule, because a grid of cards
// underneath a ranked board is otherwise read as more of the same.
//
// ---------------------------------------------------------------------
// THE FLIP, AND WHAT IT TURNS.
//
// ONE BLOCK TURNS: `live stats`, and only that. Turning the whole card
// took the scoreboard with it, so the score and the clock vanished
// exactly while the operator was reading the other side of a match in
// play — and it forced a choice between printing the head on both faces
// or losing it. `live stats` is the one block with a prematch
// counterpart, and everything the match is doing right now stays put
// around it. Both faces share ONE grid cell, so the block is as tall as
// the taller of them and neither can be clipped.
//
// THE BACK IS THE BOARD'S OWN CARD, NOT A SECOND READ OF IT. It renders
// `PickerColumn.RowRead` — the very component the ranked columns render:
// the two team lines with their filled/hollow pips, the venue badge and
// the form strips, the sort anchor as a 20px number with its label
// beneath, the rank dumbbell, Stage 1 and Stage 2 — plus
// `PickerRead.KalshiCell` for the book. Nothing here restyles any of it.
// The first draft of this card hand-rewrote that read in bespoke CSS and
// the operator rejected exactly that, by name: two layouts for one read
// is how two surfaces begin disagreeing about one fixture, and the copy
// drifts silently because nothing ever renders them side by side.
//
// ---------------------------------------------------------------------
// WHAT THIS PAYLOAD ACTUALLY CARRIES, AND WHAT IT DOES NOT.
//
// The blocks below were designed against the draft and then measured
// against the wire. Three of them have data and three do not, and the
// three that do not REFUSE BY NAME rather than drawing a plausible
// number:
//
//   HAS IT   the tape age (derived from `state.captured_at` against the
//            envelope's `generated_at`), the score and the minute, the
//            four live-read components per side, the held position.
//   HAS IT NOT  crests and club colours (no provider on this plane sends
//            either — see lib/teamColors.clubColors); yellow and red
//            CARD COUNTS; a tilt / momentum / events-per-minute figure;
//            a model probability triple and a de-vigged market triple.
//
// A REFUSAL IS DRAWN, NEVER LEFT BLANK, and the two kinds are drawn
// differently: a ROUTINE ABSENCE is a quiet faint line, the way the
// board writes `no kalshi event` for a fixture that was simply never
// listed; a REFUSAL THAT HAD TO BE MADE gets a bordered band. A red
// card and a failed tape read are the second kind, and so is the
// composite the live read forbids by name.
//
// MISSING IS NEVER ZERO, anywhere on this card. A score the tape did
// not send is `—`, not `0`; a component not read this tick draws no bar
// at all rather than a bar at the floor; a withdrawn position figure
// carries the code that withdrew it.
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { fmtDate } from "../lib/matchday";
import { BoardRow, LeagueMeta, leagueLabel } from "../lib/pickerApi";
import {
  LiveReadComponentPayload, WatchedMatch, WatchedPosition,
  WatchedStripResponse, api,
} from "../lib/suggesterApi";
import { clubColors } from "../lib/teamColors";
import { RowRead, hueOf } from "./PickerColumn";
import { KalshiCell } from "./PickerRead";
import { useWatchToken } from "./WatchDeclaration";
import { tapeVerdictOf } from "./WatchedStrip";

const POLL_MS = 15000; // the backend's own 15s live tick, as the strip does

/** FOUR ACROSS, TWO ROWS, AND THEN A SECOND PAGE. Four because the
 *  ranked board below is four columns and a live grid on a different
 *  rhythm reads as a different page rather than the same one; two rows
 *  because past that the section stops being something taken in at once
 *  and becomes something scrolled. A ninth live match starts page two. */
export const LIVE_PAGE_SIZE = 8;

// ---------------------------------------------------------------------
// THE AGE OF THE TAPE
//
// THE ONE NUMBER THAT SAYS WHETHER ANYTHING BELOW IT IS CURRENT. The
// provider's minute keeps looking healthy long after a feed stops, so a
// card showing 67' and nothing else is making a claim it cannot support.
// It is NEVER omitted and never blank: a fixture whose tape read failed
// says so in the same slot.
//
// DERIVED, BECAUSE NO FIELD CARRIES IT. The payload sends capture
// CLOCKS, not ages — `state.captured_at` on the match and `generated_at`
// on the envelope — so the age is the distance between them. It is
// measured against the ENVELOPE and never against this browser's clock:
// a laptop whose time is off would otherwise report a stale tape on a
// current read, or worse, a fresh one on a dead feed.
// ---------------------------------------------------------------------

export function tapeAgeSeconds(
  m: WatchedMatch, generatedAt: string | undefined,
): number | null {
  const at = m.state?.captured_at;
  if (typeof at !== "string" || at === "") return null;
  if (typeof generatedAt !== "string" || generatedAt === "") return null;
  const t = Date.parse(at), g = Date.parse(generatedAt);
  if (!Number.isFinite(t) || !Number.isFinite(g)) return null;
  return Math.max(0, Math.round((g - t) / 1000));
}

/** The words for that slot, and there are ALWAYS words.
 *
 *  `dead` is not "old" — it is "this figure is not a measurement", which
 *  is why a failed read and an unreadable clock share it and a merely
 *  large age does not. Nothing here decides that 40s is too old: no
 *  ceiling for this surface has been measured, so none is asserted. */
export function tapeWords(m: WatchedMatch, generatedAt: string | undefined):
    { text: string; dead: boolean } {
  if (tapeVerdictOf(m) === "failed") {
    return { text: "tape read failed", dead: true };
  }
  const s = tapeAgeSeconds(m, generatedAt);
  if (s == null) {
    return {
      text: tapeVerdictOf(m) === "no_row" ? "no tape row" : "tape age unread",
      dead: true,
    };
  }
  return { text: `tape ${s}s`, dead: false };
}

// ---------------------------------------------------------------------
// THE CREST
//
// The provider's crest image when there is one, and a DRAWN mark when
// there is not — which today is always, because the watched-strip match
// block carries no image URL at all (backend api/main.py). The URL prop
// exists so that the day one arrives, the card takes it without being
// rebuilt, and the drawn mark becomes what it should be: the fallback
// for a crest that failed to LOAD, which is a normal night on a live
// board.
//
// THE CODE IS DRAWN, NEVER OVERLAID, and its ink is DERIVED from the
// fill's luminance rather than assumed: a yellow club and a red one need
// opposite answers, and a hard-coded white makes one of them unreadable.
// ---------------------------------------------------------------------

/** Three letters for a club, DERIVED and never claimed as its official
 *  abbreviation — nothing on this plane sends one. The full name sits
 *  beside the mark, so this only has to be stable and distinguishing. */
export function codeOf(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w !== ""
      && !["FC", "SC", "CF", "AFC", "CD", "AC", "SD", "RC", "US", "UD"]
        .includes(w.toUpperCase()));
  if (words.length === 0) return name.slice(0, 3).toUpperCase() || "—";
  if (words.length >= 3) {
    return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
  }
  return words[0].slice(0, 3).toUpperCase();
}

function inkOn(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const chan = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * chan(0) + 0.7152 * chan(2) + 0.0722 * chan(4);
  return lum > 0.42 ? "#101413" : "#ffffff";
}

function Crest({ name, fill, url }: {
  name: string; fill: string; url?: string | null;
}) {
  const [broken, setBroken] = useState(false);
  const code = codeOf(name);
  if (url && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img data-testid="live-crest" data-form="image" src={url} alt=""
        onError={() => setBroken(true)}
        className="h-[26px] w-[26px] flex-none object-contain" />
    );
  }
  return (
    <svg data-testid="live-crest" data-form="drawn" role="img"
      aria-label={name} viewBox="0 0 26 28"
      className="h-[28px] w-[26px] flex-none">
      <path d="M1.5 1.5h23v14.4c0 6.6-7.3 9.6-11.5 11.6C8.8 25.5 1.5 22.5 1.5 15.9Z"
        fill={fill} />
      <path d="M1.5 1.5h23v14.4c0 6.6-7.3 9.6-11.5 11.6C8.8 25.5 1.5 22.5 1.5 15.9Z"
        fill="none" stroke="rgba(0,0,0,.32)" strokeWidth="1" />
      <text x="13" y="15.8" fontSize="9.5" textAnchor="middle"
        fontWeight="800" fill={inkOn(fill)}
        className="[font-family:var(--font-archivo)]">{code}</text>
    </svg>
  );
}

// ---------------------------------------------------------------------
// THE SHAPES THE CARD IS MADE OF
// ---------------------------------------------------------------------

/** THE LABEL IS IN THE RULE. A heading above a line, and a line above a
 *  block, are two devices doing one job; centring the name inside the
 *  divider makes the rule and its label one object, and EVERY section on
 *  this card gets the same one — the position included, which was the
 *  only block separated by a bare border with no name on it. The flip
 *  control rides here too, on the block it turns. */
function Rule({ label, control }: { label: string; control?: React.ReactNode }) {
  return (
    <div className="my-2 flex items-center gap-2.5 font-mono text-[8.5px] uppercase leading-none tracking-[0.14em] text-ink-faint">
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span>{label}</span>
      {control}
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}

/** A ROUTINE ABSENCE — a market that was never listed, a figure this
 *  payload has never carried. The board writes `no kalshi event` in
 *  plain faint ink for exactly this, because it is a normal night. */
function Quiet({ children, testid }: {
  children: React.ReactNode; testid?: string;
}) {
  return (
    <p data-testid={testid} data-absence="routine"
      className="mt-1 font-mono text-[10.5px] leading-snug text-ink-faint">
      {children}
    </p>
  );
}

/** A REFUSAL THAT HAD TO BE MADE — a dismissal, a tape read that failed,
 *  a composite the read forbids. Bordered, because somebody decided it. */
function Refused({ children, testid }: {
  children: React.ReactNode; testid?: string;
}) {
  return (
    <p data-testid={testid} data-absence="refused"
      className="mt-1 rounded-md border border-warn/40 bg-warn/5 px-2 py-1.5 font-mono text-[10.5px] leading-snug text-warn">
      {children}
    </p>
  );
}

/** ONE THICKNESS FOR EVERY BAR, from `--bar-h` in globals.css. */
const TRACK = "flex h-[var(--bar-h)] gap-[3px]";

/** A percentage that is greater than zero but rounds to it reads `<1%`.
 *  A rounded zero and a measured zero are not the same claim. */
function pct(v: number): string {
  const r = Math.round(v);
  if (v > 0 && r === 0) return "<1%";
  if (v < 0 && r === 0) return ">-1%";
  return `${r}%`;
}

/** ONE COMPONENT, TWO SIDES. The two ends print their own numbers, so
 *  the colour never carries the meaning; the split is the two sides'
 *  share OF EACH OTHER on that one component and nothing else — the four
 *  components are never combined, which the payload forbids by name. */
function SplitBar({ label, hv, av, unit, hc, ac }: {
  label: string; hv: number | null; av: number | null;
  unit: string; hc: string; ac: string;
}) {
  const fmt = (v: number | null) =>
    v == null ? "—" : (Math.round(v * 10) / 10).toString();
  // MISSING IS NEVER ZERO: with either side unread there is no share to
  // draw, so no bar is drawn and the row says which it is.
  const both = hv != null && av != null;
  const total = both ? hv + av : 0;
  const share = both && total > 0 ? (hv / total) * 100 : 50;
  return (
    <div data-testid="live-stat" data-stat={label} className="mb-1.5">
      <div className="mb-[3px] flex justify-between font-mono text-[9px] uppercase leading-tight tracking-[0.07em] text-ink-faint">
        <b className="text-[11.5px] font-medium tabular-nums text-ink-hi">
          {fmt(hv)}
        </b>
        <span title={unit}>{label}</span>
        <b className="text-[11.5px] font-medium tabular-nums text-ink-hi">
          {fmt(av)}
        </b>
      </div>
      {both ? (
        <div className={TRACK} aria-hidden>
          <i className="block rounded-[2px]"
            style={{ width: `${share}%`, background: hc }} />
          <i className="block rounded-[2px] opacity-85"
            style={{ width: `${100 - share}%`, background: ac }} />
        </div>
      ) : (
        <p className="font-mono text-[9px] leading-tight text-ink-faint">
          not read this tick on {hv == null && av == null ? "either side"
            : hv == null ? "the home side" : "the away side"} — no share
          is drawn
        </p>
      )}
    </div>
  );
}

/** THE PRICE BAR CARRIES ITS OWN NUMBERS. Home at the left end of the
 *  track, away at the right end — each number beside the block it
 *  describes — and THE DRAW INSIDE THE GREY, at that segment's centre,
 *  so it travels with the segment as the split moves instead of sitting
 *  in a fixed column that stops describing it.
 *
 *  WHEN THE SEGMENT CANNOT HOLD ITS OWN LABEL. A 1% draw is a real
 *  late-match state and 1% of the track is about two pixels; the label
 *  would sit across both club colours and be legible on neither. It
 *  keeps its anchor — it still marks that segment's centre and still
 *  travels with it — and takes a chip in the card's own panel colour, so
 *  its contrast depends on the card rather than on whichever colour
 *  happens to be underneath.
 *
 *  WHICH FORM APPLIES IS MEASURED AFTER LAYOUT, NEVER THRESHOLDED. The
 *  same 2% is wide enough on a two-up card and far too narrow on a
 *  four-up one, so any percentage typed as a cut-off would be wrong on
 *  one of them. The label's own rendered width is compared against its
 *  own rendered segment, and re-measured whenever the track resizes.
 *  The text is measured through an inner span whose width does NOT
 *  change with the chip, so the decision cannot oscillate between the
 *  two forms it is choosing between. */
function TripleBar({ label, v, hc, ac, dim }: {
  label: string; v: [number, number, number];
  hc: string; ac: string; dim?: boolean;
}) {
  const track = useRef<HTMLDivElement | null>(null);
  const seg = useRef<HTMLElement | null>(null);
  const em = useRef<HTMLElement | null>(null);
  const text = useRef<HTMLSpanElement | null>(null);
  const centre = v[0] + v[1] / 2;
  const [chip, setChip] = useState(false);
  const [left, setLeft] = useState(centre);

  const place = useCallback(() => {
    const t = track.current, s = seg.current;
    const e = em.current, x = text.current;
    if (!t || !s || !e || !x) return;
    setChip(x.offsetWidth + 5 > s.offsetWidth);
    const w = t.offsetWidth;
    if (w <= 0) return;
    const half = e.offsetWidth / 2;
    const want = (centre / 100) * w;
    const lo = half + 1, hi = Math.max(lo, w - half - 1);
    setLeft((Math.min(Math.max(want, lo), hi) / w) * 100);
  }, [centre]);

  useEffect(() => {
    place();
    const t = track.current;
    if (!t || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", place);
      return () => window.removeEventListener("resize", place);
    }
    const ro = new ResizeObserver(place);
    ro.observe(t);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
    // `chip` is a dependency on purpose: the chip changes the label's
    // rendered WIDTH, so the clamp has to be recomputed once it lands.
    // It cannot loop — the chip decision reads the inner text's width,
    // which the chip does not change.
  }, [place, chip]);

  const o = dim ? 0.42 : 1;
  return (
    <div data-testid="live-price-bar" data-bar={label} className="mb-2">
      <span className="mb-[3px] block text-center font-mono text-[9px] uppercase leading-none tracking-[0.1em] text-ink-faint">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="min-w-[34px] flex-none font-mono text-[11.5px] font-medium tabular-nums text-ink-hi">
          {pct(v[0])}
        </span>
        <div ref={track} className={`relative min-w-0 flex-1 ${TRACK}`}
          role="img"
          aria-label={`${label}: home ${pct(v[0])}, draw ${pct(v[1])}, away ${pct(v[2])}`}>
          <i className="block rounded-[2px]"
            style={{ width: `${v[0]}%`, background: hc, opacity: o }} />
          <i ref={seg} className="block rounded-[2px] bg-line-strong"
            style={{ width: `${v[1]}%`, opacity: dim ? 0.5 : 1 }} />
          <i className="block rounded-[2px]"
            style={{ width: `${v[2]}%`, background: ac,
              opacity: dim ? 0.38 : 0.85 }} />
          <em ref={em} aria-hidden data-testid="live-draw-label"
            data-fit={chip ? "chip" : "inside"}
            style={{ left: `${left}%` }}
            className={`pointer-events-none absolute whitespace-nowrap font-mono text-[8px] font-medium not-italic tabular-nums ${
              chip
                ? "top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[4px] bg-elev2 px-1 py-px leading-none text-ink-hi shadow-[0_0_0_1px_var(--line-strong)]"
                : "top-0 -translate-x-1/2 leading-[var(--bar-h)] text-ink-hi"}`}>
            <span ref={text}>{pct(v[1])}</span>
          </em>
        </div>
        <span className="min-w-[34px] flex-none text-right font-mono text-[11.5px] font-medium tabular-nums text-ink-hi">
          {pct(v[2])}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// THE BLOCKS
// ---------------------------------------------------------------------

/** One live-read component's value for one side, READ THROUGH ITS OWN
 *  `value_key` and never through the component's name. The number used
 *  to ride under the component's own key; the payload moved it and
 *  names where it went, so a reader that spells the key itself is a
 *  reader that will silently read `undefined` the next time it moves. */
function valueOf(c: LiveReadComponentPayload | undefined): number | null {
  if (!c || typeof c.value_key !== "string") return null;
  const v = c[c.value_key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

const STAT_ROWS: { key: string; label: string }[] = [
  { key: "possession_read", label: "possession" },
  { key: "shot_read", label: "shots" },
  { key: "on_target_read", label: "on target" },
  { key: "corner_read", label: "corners" },
];

/** Has a DISMISSAL been witnessed on this match? Found by the registry
 *  code, at every site that can carry it — never by reading a count,
 *  because no count of red cards is on this payload at all. */
function dismissal(m: WatchedMatch): string | null {
  const st = (m.state?.refusals ?? [])
    .find((r) => r?.code === "dismissal");
  if (st) return st.refused;
  for (const p of m.positions ?? []) {
    const rv = p.red_card_void as { refused?: string } | undefined;
    if (rv?.refused) return rv.refused;
    const rc = p.entry_map?.red_card;
    if (rc?.withdraws || rc?.void) {
      return rc.withdrawal?.because
        ?? "a dismissal voids every grid-derived number from first sighting";
    }
  }
  return null;
}

function StatsBlock({ m, hc, ac }: {
  m: WatchedMatch; hc: string; ac: string;
}) {
  const sides = m.read?.sides ?? {};
  const home = sides.home?.components;
  const away = sides.away?.components;
  const red = dismissal(m);
  const anyRead = STAT_ROWS.some(({ key }) =>
    valueOf(home?.[key]) != null || valueOf(away?.[key]) != null);
  return (
    <>
      {anyRead ? STAT_ROWS.map(({ key, label }) => (
        <SplitBar key={key} label={label}
          hv={valueOf(home?.[key])} av={valueOf(away?.[key])}
          unit={home?.[key]?.unit ?? away?.[key]?.unit ?? ""}
          hc={hc} ac={ac} />
      )) : (
        <Quiet testid="live-stats-absent">
          {typeof m.read?.words === "string" && m.read.words !== ""
            ? m.read.words
            : "no component read has been persisted for this fixture"}
        </Quiet>
      )}
      {/* NO CARD COUNT IS ON THIS PAYLOAD, so none is drawn and none is
          inferred. The line is still here because a card row that
          disappears reads as a match with no cards in it, which is a
          claim. A DISMISSAL is different: it was witnessed, it voids
          every grid-derived number, and it gets the bordered band. */}
      {red ? (
        <Refused testid="live-dismissal">{red}</Refused>
      ) : (
        <Quiet testid="live-cards-absent">
          cards Y/R — not on this read; the tape carries no card count,
          and none is inferred from what is here
        </Quiet>
      )}
    </>
  );
}

/** DYNAMICS — the windowed read, and the number that is NOT here.
 *
 *  The four components are exponentially decayed with a published
 *  half-life, which is the closest thing on this plane to a windowed
 *  read, and the block states that window in the payload's own figures.
 *  A TILT IS A COMPOSITE OF THE FOUR AND THE PAYLOAD FORBIDS IT BY NAME
 *  — `no_composite_before_m1`: the weights have not been fitted, so a
 *  number made out of them would be a claim. That is a refusal somebody
 *  MADE, so it takes the band, and this card prints the reason in the
 *  backend's own words rather than quietly drawing no bar. */
function DynamicsBlock({ m }: { m: WatchedMatch }) {
  const side = m.read?.sides?.home ?? m.read?.sides?.away;
  const half = side?.half_life_seconds;
  const comp = side?.components
    ? Object.values(side.components)[0] : undefined;
  const forbids = comp?.no_composite_before_m1;
  return (
    <>
      {half != null && (
        <p data-testid="live-dynamics-window"
          className="font-mono text-[10.5px] leading-snug text-ink-mid">
          decaying read · half-life {Math.round(half / 60)}′
          {comp?.observed_intervals != null
            ? ` · ${comp.observed_intervals} intervals` : ""}
          {side?.observed_from_kickoff === false
            ? " · not observed from kickoff" : ""}
        </p>
      )}
      <Refused testid="live-tilt-refused">
        {forbids ?? "no tilt is drawn: no weighting of these components "
          + "has been fitted, so a single number made out of them would "
          + "be a claim rather than a reading"}
      </Refused>
    </>
  );
}

/** MODEL V MARKET.
 *
 *  THE TRIPLES ARE NOT ON THIS PAYLOAD, and this block says so rather
 *  than drawing halves of a comparison. `model_v_market` is the key it
 *  reads, declared here as the shape it needs; every recorded response
 *  off this route today carries nothing of the sort, so on the real
 *  board this block refuses on every card. It is READ DEFENSIVELY off
 *  the match rather than typed into `WatchedMatch`, because writing a
 *  plausible field into the contract is how a TS type stops matching
 *  what the backend sends.
 *
 *  THE CAVEAT IS NOT OPTIONAL AND IS NOT A FOOTNOTE. It is the literal
 *  truth of `src/live/inplay.py state_probabilities(minute, score_home,
 *  score_away, lam_h, lam_a)`: the model sees the clock and the
 *  scoreline and NOTHING ELSE — not one of the four component reads
 *  drawn above it. A reader who takes those bars as the model's inputs
 *  has been told something false by the layout, so the block states what
 *  each bar is made of every time it is drawn. */
type Triples = {
  model: [number, number, number];
  market: [number, number, number];
  side: "home" | "draw" | "away";
};

const CAVEAT = "model sees minute and score only, not the stats above · "
  + "market is the de-vigged book";

function triple(v: unknown): [number, number, number] | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const n = (k: string) => (typeof o[k] === "number" && Number.isFinite(o[k])
    ? (o[k] as number) : null);
  const h = n("home"), d = n("draw"), a = n("away");
  if (h == null || d == null || a == null) return null;
  const sum = h + d + a;
  if (sum <= 0) return null;
  // 0..1 and 0..100 both ride on this project's payloads; normalise to
  // the bar's own space rather than assuming one of them.
  const k = sum <= 1.5 ? 100 : 1;
  return [h * k, d * k, a * k];
}

export function triplesOf(m: WatchedMatch): Triples | null {
  const raw = (m as unknown as Record<string, unknown>).model_v_market;
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const model = triple(o.model), market = triple(o.market);
  if (!model || !market) return null;
  const s = o.side;
  const side = s === "home" || s === "draw" || s === "away" ? s : "home";
  return { model, market, side };
}

function ModelVMarket({ m, hc, ac }: {
  m: WatchedMatch; hc: string; ac: string;
}) {
  const t = triplesOf(m);
  if (!t) {
    return (
      <>
        <Quiet testid="live-model-absent">
          no live model on this read — it carries neither a state
          probability triple nor a de-vigged book, so neither bar is
          drawn and no gap is computed from half of them
        </Quiet>
        <p data-testid="live-caveat"
          className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
          {CAVEAT}
        </p>
      </>
    );
  }
  const i = t.side === "home" ? 0 : t.side === "draw" ? 1 : 2;
  const d = Math.round(t.model[i]) - Math.round(t.market[i]);
  return (
    <>
      <TripleBar label="model" v={t.model} hc={hc} ac={ac} />
      <TripleBar label="market" v={t.market} hc={hc} ac={ac} dim />
      {/* THE SUBTRACTION OF THE TWO NUMBERS DIRECTLY ABOVE, on the side
          held. PLAIN INK, NEVER COLOURED AND NEVER A VERDICT: an edge
          this surface has not measured must not be dressed as one. */}
      <div data-testid="live-gap"
        className="mt-0.5 flex justify-between font-mono text-[9px] uppercase leading-tight tracking-[0.06em] text-ink-faint">
        <span>gap</span>
        <b className="text-[10.5px] font-medium normal-case tabular-nums text-ink-mid">
          {d > 0 ? "+" : ""}{d} on {t.side}
        </b>
      </div>
      <p data-testid="live-caveat"
        className="mt-1 font-mono text-[9px] leading-relaxed text-ink-faint">
        {CAVEAT}
      </p>
    </>
  );
}

/** THE HAZARD LINE — the corpus rate for the state this position was
 *  bought into, with its band and its n. It is the entry map's, which is
 *  drawn AT MINUTE 0 and never re-conditioned on the live state, so the
 *  line says when it was measured. There is no live, currently
 *  conditioned hazard on this payload and none is invented. */
function HazardLine({ p }: { p: WatchedPosition | undefined }) {
  const branch = p?.entry_map?.branches
    ? Object.values(p.entry_map.branches).find((b) => b?.reached != null)
    : undefined;
  const r = branch?.reached;
  if (!r || r.p_first_goal_percent == null) {
    return (
      <Quiet testid="live-hazard-absent">
        no measured hazard on this read
      </Quiet>
    );
  }
  const band = r.p_first_goal_wilson_band_percent;
  return (
    <div data-testid="live-hazard"
      className="flex justify-between gap-2 font-mono text-[10.5px] leading-snug tabular-nums text-ink-mid">
      <span className="min-w-0 truncate text-ink-faint">
        {r.state ?? "reaching this state"} · at purchase
      </span>
      <b className="flex-none font-medium">
        {r.p_first_goal_percent.toFixed(1)}%
        {band && band.length >= 2 && band.every((x) => x != null)
          ? ` [${band[0]}, ${band[1]}]` : ""}
      </b>
      <span className="flex-none text-ink-faint">
        {r.n != null ? `n=${r.n.toLocaleString()}` : "n unstated"}
      </span>
    </div>
  );
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** HELD / WORTH NOW / BID. A withdrawn figure carries THE CODE THAT
 *  WITHDREW IT and is never a dash on its own; a position that is not
 *  held says so rather than printing zeros. */
function PositionBlock({ p }: { p: WatchedPosition | undefined }) {
  if (!p) {
    return (
      <div data-testid="live-position" data-held="false"
        className="flex justify-between font-mono text-[11.5px] leading-relaxed tabular-nums text-ink-mid">
        <span className="text-ink-faint">position</span>
        <b className="font-medium text-ink-hi">none held</b>
      </div>
    );
  }
  const pos = p.position;
  const withheld = p.exit_is_obtainable?.refusal_code ?? null;
  const bid = p.certainty_premium?.sell?.bid_cents;
  const rows: [string, string][] = [
    ["held", pos
      ? `${pos.size} ${pos.outcome_key}${
        pos.entry_price != null
          ? ` @ ${Math.round(pos.entry_price * 100)}c` : ""}`
      : "size not on the record"],
    ["worth now", p.value_now_cents != null ? money(p.value_now_cents)
      : withheld ? `withheld · ${withheld}` : "no mark to price it against"],
    ["bid", typeof bid === "number" ? `${Math.round(bid)}c`
      : "no bid on this read"],
  ];
  return (
    <div data-testid="live-position" data-held="true"
      className="font-mono text-[11.5px] leading-relaxed tabular-nums">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-2 text-ink-mid">
          <span className="flex-none text-ink-faint">{k}</span>
          <b className="min-w-0 truncate text-right font-medium text-ink-hi">
            {v}
          </b>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// THE CARD
// ---------------------------------------------------------------------

export function LiveCard({ m, generatedAt, row, clubCount }: {
  m: WatchedMatch;
  generatedAt: string | undefined;
  /** the ranked board's OWN row for this fixture, joined on
   *  `espn_event_id`; absent when the board no longer carries it (the
   *  board is upcoming fixtures, and a match in play has often left it) */
  row: BoardRow | null;
  clubCount: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const colours = clubColors(m.home, m.away);
  const tape = tapeWords(m, generatedAt);
  const st = m.state;
  const held = (m.positions ?? [])[0];
  const score = st?.score_home != null && st?.score_away != null
    ? `${st.score_home}–${st.score_away}` : "—";
  const minute = st?.clock_display && st.clock_display !== ""
    ? st.clock_display
    : st?.minute != null ? `${st.minute}'` : "no minute";
  const comp = row ? leagueLabel(row.league) : m.competition_slug;
  const slug = row ? (row.column ?? row.league) : "";

  return (
    <article data-testid="live-card"
      data-fixture={m.fixture_id}
      data-tape={tapeVerdictOf(m)}
      data-flipped={flipped ? "true" : "false"}
      style={{ ["--lg" as string]: hueOf(slug) }}
      className={`flex min-w-0 flex-col rounded-xl border bg-gradient-to-b from-elev2/60 to-elev/40 p-4 leading-tight ${
        held ? "border-accent/35" : "border-line"}`}>

      {/* 1 — THE STRIP. The competition on the left; the kickoff and THE
          AGE OF THE TAPE on the right. NO RANK: the section says nothing
          here is ranked, and a number down the grid is a number a reader
          is entitled to read as an order. */}
      <div data-testid="live-strip"
        className="mb-2 flex items-baseline justify-between gap-2 font-mono text-[9px] tracking-[0.08em] text-ink-faint">
        <span>{comp}</span>
        <span>
          {row ? `${fmtDate(row.kickoff, "short")} · ` : ""}
          <span data-testid="live-tape"
            className={tape.dead ? "text-warn" : "text-ink-mid"}>
            {tape.text}
          </span>
        </span>
      </div>

      {/* 2 — THE SCOREBOARD HEAD. Home left, away right, the score
          between them and the clock directly above it: the arrangement
          every reader already knows, so the head costs nothing to
          parse. The live dot rides beside the minute because the minute
          is the thing it is a claim about. */}
      <div data-testid="live-head"
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Crest name={m.home} fill={colours.home} />
          <span className="truncate text-[14.5px] font-semibold tracking-[-0.01em] text-ink-hi [font-family:var(--font-archivo)]"
            title={m.home}>{m.home}</span>
        </div>
        <div className="text-center font-mono leading-tight tabular-nums">
          <div className="flex items-center justify-center gap-[5px] text-[10.5px] text-ink-faint">
            {st?.in_play === true && (
              <i aria-hidden
                className="h-[6px] w-[6px] flex-none rounded-full bg-live" />
            )}
            <span data-testid="live-minute">{minute}</span>
          </div>
          <div data-testid="live-score"
            className="mt-px text-[23px] font-semibold tracking-[-0.02em] text-ink-hi">
            {score}
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-right text-[14.5px] font-semibold tracking-[-0.01em] text-ink-hi [font-family:var(--font-archivo)]"
            title={m.away}>{m.away}</span>
          <Crest name={m.away} fill={colours.away} />
        </div>
      </div>

      {/* 3 — LIVE STATS, AND THE ONLY BLOCK THAT TURNS. Both faces share
          one grid cell, so the block is as tall as the taller of them.
          The face pointing away is INERT, not merely rotated: a button
          on the hidden side stays in the tab order otherwise, which is
          the keyboard version of a card that shows one thing and does
          another. */}
      <div className="[perspective:1200px]">
        <div className={`grid transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
          flipped ? "[transform:rotateY(180deg)]" : ""}`}>
          <div inert={flipped} aria-hidden={flipped}
            data-testid="live-face-stats"
            className={`[backface-visibility:hidden] [grid-area:1/1] ${
              flipped ? "invisible" : ""}`}>
            <Rule label="live stats" control={
              <button data-testid="live-flip" onClick={() => setFlipped(true)}
                className="flex-none rounded-[5px] border border-line-strong px-[7px] py-[2px] font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint transition-colors hover:border-accent/50 hover:text-accent">
                prematch ⤺
              </button>} />
            <StatsBlock m={m} hc={colours.home} ac={colours.away} />
          </div>
          <div inert={!flipped} aria-hidden={!flipped}
            data-testid="live-face-prematch"
            className={`[backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)] ${
              flipped ? "" : "invisible"}`}>
            <Rule label="prematch" control={
              <button data-testid="live-unflip" onClick={() => setFlipped(false)}
                className="flex-none rounded-[5px] border border-line-strong px-[7px] py-[2px] font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint transition-colors hover:border-accent/50 hover:text-accent">
                live ⤻
              </button>} />
            {/* THE BOARD'S OWN CARD. `modeId` is "gdg" because this
                section has no sort of its own — it is not ranked — and
                GD/g gap is the board's default anchor. */}
            {row ? (
              <>
                <RowRead row={row} modeId="gdg" clubCount={clubCount} />
                <div className="mt-3 border-t border-line pt-3">
                  <KalshiCell quote={row.kalshi} />
                </div>
              </>
            ) : (
              <Quiet testid="live-prematch-absent">
                the ranked board carries no row for this fixture — it
                lists upcoming matches and this one has kicked off, so
                the prematch read is not available to copy from
              </Quiet>
            )}
          </div>
        </div>
      </div>

      {/* 4 — DYNAMICS */}
      <Rule label="dynamics" />
      <DynamicsBlock m={m} />

      {/* 5 — MODEL V MARKET */}
      <Rule label="model v market" />
      <ModelVMarket m={m} hc={colours.home} ac={colours.away} />

      {/* 6 — HAZARD, THEN POSITION */}
      <Rule label="hazard" />
      <HazardLine p={held} />

      <div className="mt-auto">
        <Rule label="position" />
        <PositionBlock p={held} />
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------
// THE SECTION
// ---------------------------------------------------------------------

/** Which declared matches belong in this section.
 *
 *  IN PLAY, OR A TAPE THAT COULD NOT BE READ — and the second is not an
 *  oversight. `state.in_play` is FAIL-CLOSED false on a failed read, so
 *  filtering on it alone would drop exactly the fixtures whose state is
 *  unknown, and drop them SILENTLY into a section that then reads as
 *  "these are all the live matches". "We could not look" is not "it is
 *  not running", and the card that says so is the point. */
export function isLiveish(m: WatchedMatch): boolean {
  return m.state?.in_play === true || tapeVerdictOf(m) === "failed";
}

/** PAGE ORDER IS KICKOFF, NEVER INTEREST. A match must not move between
 *  pages while it is watched, and nothing here may imply a ranking, so
 *  the key is the board's own kickoff where the join found one and the
 *  fixture id where it did not — a stable tiebreak, not a quality. */
function byKickoff(rows: Map<string, BoardRow>) {
  return (a: WatchedMatch, b: WatchedMatch) => {
    const k = (m: WatchedMatch) => {
      const r = m.espn_event_id ? rows.get(m.espn_event_id) : undefined;
      const t = r ? Date.parse(r.kickoff) : NaN;
      return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
    };
    const d = k(a) - k(b);
    if (Number.isFinite(d) && d !== 0) return d;
    return a.fixture_id - b.fixture_id;
  };
}

export default function LiveSection({ rows, leagues }: {
  rows: BoardRow[];
  leagues: Record<string, LeagueMeta>;
}) {
  const token = useWatchToken();
  const [data, setData] = useState<WatchedStripResponse | null>(null);
  const [asked, setAsked] = useState(false);
  // THE PAGE SURVIVES A POLL. It is state, not a value derived from the
  // payload, so a 15s refresh cannot walk the reader back to page one
  // mid-read. It is clamped where it is READ rather than corrected in an
  // effect: a page that no longer exists must not be rendered, and
  // setting state during render is how a poll and a clamp start fighting.
  const [page, setPage] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api.watchedStrip(token);
        if (!alive) return;
        setData(r);
        setAsked(true);
      } catch {
        if (!alive) return;
        setAsked(true);
        // A FAILED READ IS KEPT, NOT SWALLOWED — but this section is not
        // where it is DRAWN. WatchedStrip, mounted on the same page and
        // polling the same endpoint with the same token, renders that
        // refusal with its status and the backend's own sentence; a
        // second copy would say one thing twice. What must not happen
        // here is the section quietly emptying as though no match were
        // live, so the EARLIER payload is kept and stays on screen —
        // and every tape age on it keeps being measured against THAT
        // payload's own `generated_at`, so the cards age visibly rather
        // than freezing at whatever they last said.
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [token]);

  const byEvent = useMemo(() => {
    const m = new Map<string, BoardRow>();
    for (const r of rows) m.set(r.event_id, r);
    return m;
  }, [rows]);

  const live = useMemo(() => {
    const all = Array.isArray(data?.matches) ? data!.matches : [];
    return all.filter(isLiveish).sort(byKickoff(byEvent));
  }, [data, byEvent]);

  // NOTHING HAS BEEN READ YET is not a statement about the slate.
  if (!asked || live.length === 0) return null;

  const pages = Math.max(1, Math.ceil(live.length / LIVE_PAGE_SIZE));
  const at = Math.min(page, pages - 1);
  const start = at * LIVE_PAGE_SIZE;
  const shown = live.slice(start, start + LIVE_PAGE_SIZE);

  return (
    <section data-testid="live-section" data-pages={pages} data-page={at + 1}
      aria-label="matches under way"
      className="mt-8 rounded-2xl border border-line bg-elev/20 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-medium text-ink-hi">Under way</h2>
        <p data-testid="live-not-ranked"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          nothing here is ranked · page order is kickoff
        </p>
      </div>
      {pages > 1 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10.5px] text-ink-faint">
          <span data-testid="live-range">
            {live.length} live · showing {start + 1}–{start + shown.length}
            {` · page ${at + 1} of ${pages}`}
          </span>
          <nav className="flex gap-1.5" aria-label="live pages">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} data-testid="live-page"
                aria-current={i === at}
                onClick={() => setPage(i)}
                className={`rounded-[5px] border px-2.5 py-0.5 transition-colors ${
                  i === at ? "border-accent/60 text-accent"
                    : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi"}`}>
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}
      {/* THE BOARD'S OWN GRID — same columns, same gap, so a live card
          sits over the column it belongs to rather than on a rhythm of
          its own. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {shown.map((m) => {
          const row = (m.espn_event_id
            ? byEvent.get(m.espn_event_id) : undefined) ?? null;
          const slug = row ? (row.column ?? row.league) : "";
          return (
            <LiveCard key={m.fixture_id} m={m}
              generatedAt={data?.generated_at} row={row}
              clubCount={leagues[slug]?.clubs ?? 0} />
          );
        })}
      </div>
    </section>
  );
}

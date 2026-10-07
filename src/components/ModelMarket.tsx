/** THE CARD'S MODEL AND MARKET LINES, AND THE VERDICT BOX BESIDE WATCH.
 *
 *  Son's approved card, 2026-10-07 (claude.ai/artifact/FELBHkNhRZaQiXe9UyFgxw).
 *  Only the bottom of the card changed: the ask · bid · spread · size line
 *  became two lines under one small header,
 *
 *            ATM    DRAW    RMA
 *    model   42.2%  24.1%   33.7%
 *    market  27.2%  24.3%   48.5%  [WIDE]
 *    [WATCH · NEEDS TOKEN] [● MODEL · CONFLICT]
 *
 *  model first, market second, home / draw / away, ONE DECIMAL, each line's
 *  highest outcome bright. The ask, bid, spread and size moved into the
 *  market line's hover, and the book only speaks on the card when it fails
 *  the trader's own gates (a WIDE or THIN tag).
 *
 *  EVERY NUMBER AND THE VERDICT ARE THE BACKEND'S (src/picker/model_market.py):
 *  the model is the match hub's `traders_model`, the market is the three
 *  Kalshi books de-vigged the way the trader's anchor reads them, and the
 *  verdict is computed there from the unrounded values. Nothing here
 *  recomputes a probability or decides agree/conflict, and `top` tells the
 *  card which figure to brighten rather than leaving it to re-derive one
 *  from the rounded figures it prints.
 *
 *  DISPLAY ONLY. Nothing that orders a column reads this block
 *  (src/lib/pickerSort.ts never names it): the box is a read, never a pick,
 *  and it never moves a card. Shadow, not advice — said in both hovers.
 */
import type { KalshiQuote, MmOutcome, ModelVsMarket } from "../lib/pickerApi";
import { WATCH_BOX } from "./WatchDeclaration";

const OUTCOMES: MmOutcome[] = ["h", "d", "a"];

/** One decimal, the spec's precision ("42.2%"). Never called on a missing
 *  read: a missing read is words, never 0.0%. */
export const pct1 = (p: number) => `${(p * 100).toFixed(1)}%`;

/** The header's team code: the backend's (the provider's own abbreviation,
 *  else the Kalshi ticker's), else three letters off the name. */
export function teamCode(code: string | null | undefined,
                         name: string | null | undefined): string {
  if (code) return code.toUpperCase();
  const letters = (name ?? "").normalize("NFD").replace(/[^A-Za-z]/g, "");
  return letters.slice(0, 3).toUpperCase() || "—";
}

const MODEL_WHY: Record<string, string> = {
  plane_not_ready: "the trader's model store is not reachable from the board right now",
  fixture_not_keyed: "the trader has no fixture for this match",
  model_run_absent: "the trader's model has not priced this match yet",
  model_fixture_not_live: "the trader does not key this match",
  read_failed: "the model read failed",
};
const MARKET_WHY: Record<string, string> = {
  no_three_way_book: "Kalshi has not listed all three books (home, draw, away) for this match",
  a_leg_has_no_ask: "one of the three Kalshi books has no ask",
};
const words = (map: Record<string, string>, code: string | null,
               fallback: string) =>
  (code && (map[code] ?? map[code.split(":")[0]])) || fallback;

function readTime(iso: string | null | undefined): string {
  if (!iso) return "read time not stated";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "read time not stated";
  return `read ${d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "UTC", hour12: false })} UTC`;
}

function modelTitle(mm: ModelVsMarket): string {
  if (!mm.model || !mm.model_meta) {
    return `No model read for this match: ${words(MODEL_WHY, mm.model_why,
      "the trader's model has no read for it")}.`
      + (mm.model_why ? ` (${mm.model_why})` : "");
  }
  const m = mm.model_meta;
  return [m.name ?? "the trader's model",
    m.status === "tested" ? "tested, not worse" : "untested",
    readTime(m.read_at), "shadow, not advice"].join(" · ");
}

function legText(code: string, l: { ask_c: number | null; bid_c: number | null;
  spread_c: number | null; ask_size: number | null } | null | undefined) {
  if (!l) return `${code} no book`;
  const c = (v: number | null) => (v == null ? "none" : `${v}¢`);
  return `${code} ask ${c(l.ask_c)}, bid ${c(l.bid_c)}, spread ${c(l.spread_c)}, `
    + `size ${l.ask_size == null ? "not stated" : l.ask_size.toLocaleString("en-US")}`;
}

function marketTitle(mm: ModelVsMarket, codes: Record<MmOutcome, string>,
                     quote: KalshiQuote | null | undefined): string {
  if (!mm.market || !mm.market_meta) {
    const book = quote && quote.ask_c != null
      ? ` Book on the quoted side: ${legText("", quote).trim()}.` : "";
    return `No full Kalshi book for this match yet: ${words(MARKET_WHY,
      mm.market_why, "there is no three-way book to read")}.${book}`;
  }
  const legs = mm.market_meta.legs;
  const stale = mm.market_meta.stale?.age_seconds != null
    ? ` · last good read, ${mm.market_meta.stale.age_seconds}s old` : "";
  return "Kalshi, overround removed so H + D + A = 100 · "
    + OUTCOMES.map((k) => legText(codes[k], legs[k])).join(" · ") + stale;
}

function flagTitle(mm: ModelVsMarket, codes: Record<MmOutcome, string>): string {
  const leg = mm.market_meta?.book_flag_leg ?? null;
  const l = leg ? mm.market_meta?.legs[leg] : null;
  const where = leg ? ` on the ${codes[leg]} book` : "";
  if (mm.book_flag === "WIDE") {
    return `Spread ${l?.spread_c ?? "over 3"}¢${where}, wider than the 3¢ the `
      + "trader requires: the market % is less reliable.";
  }
  const size = l ? Math.min(...[l.ask_size, l.bid_size]
    .filter((v): v is number => v != null)) : null;
  return `${l?.bid_c == null ? "Nothing bid" : `Only ${Number.isFinite(size)
    ? size : "a few"} contracts`}${where}, under the 10 the trader requires: `
    + "the market % is less reliable.";
}

/** ONCE THE MATCH HAS KICKED OFF (Son, 2026-10-07, option A). The model
 *  line is the read taken BEFORE kickoff and does not move during the
 *  match, while the market line is the live book — so comparing the two
 *  would set a stale belief against a price that has seen goals. The
 *  model line therefore goes grey and says "pre-kickoff", the market line
 *  stays as it is, and the verdict box reads IN PLAY instead of AGREE or
 *  CONFLICT. Full time is the same, until the card leaves the board. */
export const PRE_KICKOFF_TITLE =
  "the model's read before kickoff; it does not update during the match";
export const IN_PLAY_TITLE = "agree/conflict compares pre-match reads only";

/** The two lines, under the one header. */
export function ModelMarketLines({ mm, home, away, quote, kickedOff = false,
  frozen = null }: {
  mm: ModelVsMarket;
  home: string;
  away: string;
  /** the card's existing quote — read only for a no-market hover */
  quote?: KalshiQuote | null;
  /** the match is under way or over — see PRE_KICKOFF_TITLE */
  kickedOff?: boolean;
  /** THE FINISHED CARD'S FROZEN COPY (Son, 2026-10-07): the sentence that
   *  says when the block was frozen, put in front of every hover. The
   *  lines are drawn exactly as the board drew them at that moment — top
   *  outcome bright — because they ARE that moment's read. */
  frozen?: string | null;
}) {
  const codes: Record<MmOutcome, string> = {
    h: teamCode(mm.codes?.h, home), d: "DRAW", a: teamCode(mm.codes?.a, away),
  };
  const at = (t: string) => (frozen ? `${frozen} ${t}` : t);
  const line = (lab: "model" | "market", p: ModelVsMarket["model"],
                top: MmOutcome[], title: string, empty: string,
                stale = false) => (
    <>
      <span data-testid={`mm-${lab}-label`} title={title}
        data-stale={stale ? "1" : undefined}
        className="text-[11px] leading-tight text-ink-low">
        {lab}
        {/* "model · pre-kickoff", on two lines inside the label column so
            the three value columns keep their width */}
        {stale && (
          <span data-testid="mm-pre-kickoff"
            className="block whitespace-nowrap text-[8.5px] tracking-[-0.02em] text-ink-faint">
            <span className="sr-only"> · </span>pre-kickoff
          </span>)}
      </span>
      {p
        ? OUTCOMES.map((k) => {
          const bright = !stale && top.includes(k);
          return (
            <span key={k} data-testid={`mm-${lab}-${k}`}
              data-top={bright ? "1" : "0"} title={title}
              className={`text-center text-[12px] ${bright
                ? "font-semibold text-ink-hi"
                : stale ? "text-ink-faint" : "text-ink-mid"}`}>
              {pct1(p[k])}
            </span>);
        })
        : (
          /* the CELL is a value's size (12px), the WORDS are smaller: the
             line box then matches a line of figures, so a card whose read
             is missing is the height of one whose read is not */
          <span data-testid={`mm-${lab}-empty`} title={title}
            className={`col-span-3 whitespace-nowrap text-[12px] ${
              stale ? "text-ink-faint" : "text-ink-low"}`}>
            <span className="text-[10.5px]">{empty}</span>
          </span>)}
    </>
  );
  return (
    <div data-testid="mm-lines" data-verdict={mm.verdict}
      data-kicked-off={kickedOff ? "1" : "0"}
      data-frozen={frozen ? "1" : undefined}
      className="grid grid-cols-[54px_repeat(3,minmax(0,1fr))_auto] items-baseline gap-x-2 gap-y-1.5 font-mono tabular-nums">
      <span aria-hidden />
      {OUTCOMES.map((k) => (
        <span key={k} data-testid={`mm-head-${k}`}
          title={k === "d" ? "draw" : k === "h" ? `${home} (home)` : `${away} (away)`}
          className="text-center text-[9px] tracking-[0.12em] text-ink-low">
          {codes[k]}
        </span>
      ))}
      <span aria-hidden />
      {line("model", mm.model, mm.top?.model ?? [],
        at(kickedOff ? `${PRE_KICKOFF_TITLE[0].toUpperCase()}${
          PRE_KICKOFF_TITLE.slice(1)}. ${modelTitle(mm)}` : modelTitle(mm)),
        "no model read", kickedOff)}
      <span aria-hidden />
      {line("market", mm.market, mm.top?.market ?? [],
        at(marketTitle(mm, codes, quote)), "no full Kalshi book")}
      {mm.market && mm.book_flag
        ? (
          <span data-testid="mm-book-flag" data-flag={mm.book_flag}
            title={at(flagTitle(mm, codes))}
            className="justify-self-start rounded border border-warn/40 px-[5px] py-[2px] text-[8.5px] tracking-[0.14em] text-warn">
            {mm.book_flag}
          </span>)
        : <span aria-hidden />}
    </div>
  );
}

const VERDICT = {
  agree: { word: "MODEL · AGREE", cls: "border-up/45 text-up",
           why: "Model and market rate the same outcome highest." },
  conflict: { word: "MODEL · CONFLICT", cls: "border-warn/45 text-warn",
              why: "Model and market rate different outcomes highest." },
  no_model: { word: "MODEL · NONE", cls: "border-line text-ink-low",
              why: "Nothing to compare: there is no model read for this match." },
  no_market: { word: "MARKET · NONE", cls: "border-line text-ink-low",
               why: "Nothing to compare: there is no full Kalshi book for this match." },
} as const;

/** The box beside WATCH, in the WATCH box's own shape. Dashed when the
 *  model has not passed its test. IN PLAY, grey and solid, once the match
 *  has kicked off — never AGREE or CONFLICT after kickoff — and FULL TIME,
 *  grey and solid, once it has ended (Son, 2026-10-07). `frozen` is the
 *  finished card's copy: the box as it stood at the T-10 lock. */
export function VerdictBox({ mm, kickedOff = false, ended = false,
  frozen = null }: {
  mm: ModelVsMarket; kickedOff?: boolean; ended?: boolean;
  frozen?: string | null;
}) {
  if (kickedOff) {
    const over = ended;
    return (
      <span data-testid="mm-verdict" data-verdict={mm.verdict}
        data-phase={over ? "full_time" : "in_play"} data-untested="0"
        title={`${IN_PLAY_TITLE[0].toUpperCase()}${IN_PLAY_TITLE.slice(1)}: `
          + (over
            ? "the match is over, and the model line is its read from before "
              + "kickoff while the market line is the book's last read. "
              + "Shadow, not advice."
            : "the match has kicked off, and the model line is its read from "
              + "before kickoff while the market line is live. Shadow, not "
              + "advice.")}
        className={`${WATCH_BOX} inline-flex flex-none items-center gap-1.5 whitespace-nowrap border-solid border-line text-ink-low`}>
        <i aria-hidden className="h-[5px] w-[5px] rounded-full bg-current" />
        {over ? "FULL TIME" : "IN PLAY"}
      </span>
    );
  }
  const v = VERDICT[mm.verdict] ?? VERDICT.no_model;
  const untested = Boolean(mm.model && mm.model_meta?.status === "untested");
  return (
    <span data-testid="mm-verdict" data-verdict={mm.verdict}
      data-phase={frozen ? "at_lock" : "pre_match"}
      data-untested={untested ? "1" : "0"}
      title={`${frozen ? `${frozen} ` : ""}${v.why}${untested
        ? " Model untested." : ""} A read, never a `
        + "pick: shadow, not advice, and it never moves a card."}
      className={`${WATCH_BOX} inline-flex flex-none items-center gap-1.5 whitespace-nowrap ${v.cls} ${
        untested ? "border-dashed" : "border-solid"}`}>
      <i aria-hidden className="h-[5px] w-[5px] rounded-full bg-current" />
      {v.word}
    </span>
  );
}

/** The block, when the row carries one. */
export const mmOf = (row: { model_vs_market?: ModelVsMarket | null }) =>
  row.model_vs_market ?? null;

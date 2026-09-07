// Live scoreboard for the landing page — the top of the showcase zone.
// Apple-Sports-style cards for matches in progress: the score is the hero
// (oversized numerals that flash when a goal lands), live clock, scorers
// split under each side, subtle radial red glow for depth.
// Polls the feed-backed /live-scores endpoint (one API-Football call covers
// every live match at once, so this is budget-cheap). Renders nothing when
// no match is live, so it never clutters the page pre-match.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, flag, pct, signedPct, LiveAutoResponse, LiveScoreEntry, LiveSignalRow, LiveStatsResponse, TeamNewsResponse } from "../lib/suggesterApi";
import { groupMarkets } from "../lib/marketGroups";
import { matchColors } from "../lib/teamColors";
import { Eyebrow, Flash, Reveal } from "./ui";
import { Collapse, toast } from "./chrome";
import LivePanel from "./LivePanel";
import TeamNewsSection from "./TeamNews";

const POLL_MS = 15000; // matches the backend's 15s live tick; snapshot reads are free

// A FAILED READ IS NOT AN EMPTY ONE — THE THREE-STATE MODEL.
//
// Every fetch on this file used to end in a bare `catch {}` with a
// comment saying the section "just shows nothing". Five of them. The
// worst was the live-signal poll: a reader looking at a card with no
// signal badges concluded there were no signals, when the truth was
// that we could not ask. That conclusion is about a set nobody counted,
// and it is the same shape the backend closed by construction with
// position.UnreadableTape ("no fold can mistake a broken read for an
// empty one").
//
// The codebase already had the move. LaligaDashboard.tsx's `settle()`
// collapses a failure to {s:"error"} — distinct from {s:"ok",d:[]} —
// with the comment "Loading, failed and empty are three different
// facts. Collapsing them is how a dead backend renders as 'no fixtures
// today'." This is that type, with the failure's own sentence kept so
// the surface can say WHICH failure it was rather than that there was
// one. It is redeclared here rather than imported because
// LaligaDashboard is another owner's file and src/lib is not this
// change's to add to; the duplication is named so a later extraction
// knows what it is collecting.
type Read<T> =
  | { s: "asking" }
  | { s: "failed"; why: string }
  | { s: "ok"; d: T };

/** The failure's own words, never a shrug. */
const why = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

/** One failed read, named, with the sentence that separates it from an
 *  empty answer. Small and plain: it is a coverage fact, not an alarm,
 *  and nothing on this surface is coloured up/neg for it. */
function ReadFailed({ what, r, testid }: {
  what: string; r: Read<unknown>; testid: string;
}) {
  if (r.s !== "failed") return null;
  return (
    <p data-testid={testid} data-what={what}
      className="rounded-md border border-warn/40 bg-warn/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-warn">
      The {what} read failed: {r.why}. That is not {what} having nothing
      to show — it is that we could not ask.
    </p>
  );
}

// ---------------------------------------------------------------------
// A STALE TYPE IS A LIE THE COMPILER AGREES WITH.
//
// `LiveScoreEntry.red_home` / `red_away` are declared `boolean` in
// src/lib/suggesterApi.ts. The backend has never sent one. The value
// comes off `MatchLiveSnapshot.red_home` / `MatchResult.red_home`, both
// `Column(Integer, default=0)`, filled by `src/live_feed.py` counting
// "red card" details (`red_home += 1`), and handed straight out by
// `live_state.scoreboard_entries()`. The rest of the codebase already
// knows: `LiveStateFetch.red_home` is typed `number | boolean` with the
// comment "count (legacy: boolean)", and LivePanel.tsx coerces with
// `Number(s.red_home) || 0`. This one file did not, and it cost two
// separate defects:
//
//   1. `{m.red_home && <marker/>}` over the integer 0 renders the
//      literal "0" as a text node beside the team's name, because
//      `0 && x` is `0` and React draws a number child. On every card
//      with no red card — which is nearly all of them.
//   2. A second dismissal was invisible. Two reds and one red drew the
//      identical single block, so a count the feed took the trouble to
//      carry was thrown away at the render.
//
// The type is not this change's to edit (src/lib is another owner's), so
// the coercion is local and the mismatch is REGISTERED below rather than
// left as a silent narrowing.
//
// An unrecognised value REFUSES. It does not fold into 0, because "no
// red card" and "we cannot read the red-card field" are different facts
// and only one of them is about the football.
function redCount(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.trunc(v);
  if (typeof v === "boolean") return v ? 1 : 0;   // the legacy shape
  return null;
}

/** Dismissals for one side. The marker is a red block, but the block is
 *  DECORATION: the count and the word ride in the accessible tree as
 *  real text, because a colour is not a caveat carrier and neither is a
 *  `title=` attribute. An unreadable field says so instead of drawing
 *  the same nothing a clean sheet draws. */
function RedCards({ team, raw }: { team: string; raw: unknown }) {
  const n = redCount(raw);
  if (n === null) {
    return (
      <span data-testid="red-unreadable"
        className="shrink-0 font-mono text-[9px] uppercase tracking-wide text-warn">
        red-card count unreadable for {team}
      </span>
    );
  }
  if (n === 0) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1" data-testid="red-cards"
      data-count={n}>
      <span aria-hidden className="inline-block h-3 w-2 rounded-[2px] bg-live" />
      {n > 1 && (
        <span aria-hidden className="font-mono text-[10px] tabular-nums text-live">
          ×{n}
        </span>
      )}
      <span className="sr-only">
        {team}: {n} red card{n === 1 ? "" : "s"}
      </span>
    </span>
  );
}

export default function LiveScoreboard() {
  const [read, setRead] = useState<Read<LiveScoreEntry[]>>({ s: "asking" });
  // A payload that arrived once is KEPT when a later poll fails, and it
  // is drawn beside a line saying the read behind it is the earlier
  // one. A scoreline 30s old is still a scoreline; a blank section is
  // not. STATE, NOT A REF: it is read during render, and a ref read
  // during render is a value React does not promise to have re-rendered
  // for (react-hooks/refs, which is an error in this repo's lint).
  const [lastOk, setLastOk] = useState<LiveScoreEntry[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await api.liveScores();
        if (!alive) return;
        setLastOk(r.live);
        setRead({ s: "ok", d: r.live });
      } catch (e) {
        if (!alive) return;
        setRead({ s: "failed", why: why(e) });
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // NOTHING HAS BEEN ASKED YET. Absence with a reason, not a claim
  // about what is being played.
  if (read.s === "asking") return null;
  // ASKED, ANSWERED, AND THE ANSWER WAS "NOTHING IS LIVE". The one
  // branch that may render nothing at all: the section exists so the
  // board is not cluttered pre-match, and this is the read that says
  // there is nothing to clutter it with.
  if (read.s === "ok" && read.d.length === 0) return null;

  const shown = read.s === "ok" ? read.d : (lastOk ?? []);

  return (
    <section className="mb-20 space-y-5">
      {read.s === "failed" && (
        <p data-testid="live-scores-failed" role="status"
          className="rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-[12px] leading-relaxed text-warn">
          The live-score read failed: {read.why}.{" "}
          {shown.length > 0
            ? "The match" + (shown.length === 1 ? "" : "es") + " below "
              + (shown.length === 1 ? "is" : "are") + " from the last read "
              + "that answered and has not been refreshed."
            : "Nothing is drawn below, and that is NOT the same as no "
              + "match being live — this surface could not ask."}
        </p>
      )}
      {shown.map((m) => (
        <Reveal key={m.match_id}>
          <LiveCard m={m} />
        </Reveal>
      ))}
    </section>
  );
}

// Lineups + the manual live read, INSIDE an in-progress match's score card.
// Both are self-contained: lineups poll the facts-only team-news endpoint
// (backend caches ESPN for 60s), the LivePanel manages its own state per
// match id. Rendered outside the score block's Link so controls don't
// navigate.
// The hands-free live read: the backend re-simulates the remainder every
// ~30s from the real state + live shot stats (levers derived, echoed, and
// capped) and prices every open market. Informational — the market already
// knows the score, so differences are a read, not a signal.
function LiveMarketStream({ a, home, away, signals }: {
  a: LiveAutoResponse; home: string; away: string;
  signals?: Map<string, LiveSignalRow>;
}) {
  const adv = a.live_advance;
  const lev = a.levers;
  // same canonical grouping as the match page's markets table; rows
  // inside each group sorted by the live model's number
  const grouped = groupMarkets(
    [...(a.markets ?? [])]
      .sort((x, y) => y.live_model_probability - x.live_model_probability),
    (r) => r.outcome_key);
  return (
    <div>
      {adv && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-bs p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">{home} advances</p>
            <p className="mt-1 font-mono text-xl tabular-nums text-ink-hi">{pct(adv.home)}</p>
          </div>
          <div className="rounded-xl border border-line bg-bs p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">{away} advances</p>
            <p className="mt-1 font-mono text-xl tabular-nums text-ink-hi">{pct(adv.away)}</p>
          </div>
        </div>
      )}
      {/* A DERIVATION ON A `title=` IS NOT IN THE ACCESSIBLE TREE, AND
          THE FOOTER USED TO INSTRUCT THE READER TO HOVER FOR IT. Two
          numbers on this block — the attack multipliers and the pattern
          share — are the model's own inputs, and everything that says
          where they came from lived on a tooltip: unreachable by
          keyboard, unreachable on touch, unread by a screen reader. The
          market page already retired this exact shape (its header names
          it as rule (b)); this is the same shape one component over.
          The derivation is real text now, in a `<details>` the reader
          can open by any means. */}
      {lev && (
        <div className="mb-1.5">
          <p className="font-mono text-[11px] text-ink-low">
            auto levers · {lev.source}: attack {home} {lev.home.toFixed(2)}× / {away} {lev.away.toFixed(2)}×
            {lev.def_home != null && lev.def_home !== 1 && (
              <> · openness {lev.def_home.toFixed(2)}×</>
            )}
          </p>
          <details data-testid="lever-basis" className="mt-1">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              where these multipliers come from
            </summary>
            {lev.basis ? (
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
                On target {lev.basis.sot_home}–{lev.basis.sot_away} · shots{" "}
                {lev.basis.shots_home}–{lev.basis.shots_away} · home share{" "}
                {lev.basis.actual_share_home} against an expected{" "}
                {lev.basis.expected_share_home} · volume{" "}
                {lev.basis.volume_actual ?? "not sent"} against an expected{" "}
                {lev.basis.volume_expected ?? "not sent"} · weight{" "}
                {lev.basis.weight}, over {lev.basis.minutes}′.
              </p>
            ) : (
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-warn">
                The read carried no basis for these multipliers, so the
                derivation cannot be shown. The numbers above are the
                model&apos;s inputs and nothing here says how they were
                reached.
              </p>
            )}
          </details>
        </div>
      )}
      {lev?.momentum && (
        <div className="mb-3">
          <p className="font-mono text-[11px] text-ink-low">
            pattern · last {lev.momentum.window_min}&apos;:{" "}
            <span className={lev.momentum.recent_share_home >= 0.5 ? "text-ink-hi" : ""}>
              {home} {Math.round(lev.momentum.recent_share_home * 100)}%
            </span>
            {" / "}
            <span className={lev.momentum.recent_share_home < 0.5 ? "text-ink-hi" : ""}>
              {away} {Math.round((1 - lev.momentum.recent_share_home) * 100)}%
            </span>
            {" of the threat"}
          </p>
          <details data-testid="momentum-basis" className="mt-1">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              what the pattern read does to the numbers above
            </summary>
            <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
              Decayed threat pressure {lev.momentum.pressure_home} against{" "}
              {lev.momentum.pressure_away} over the last{" "}
              {lev.momentum.window_min}′, read at{" "}
              {lev.momentum.as_of_minute}′. It tilts the attack levers by{" "}
              ×{lev.momentum.mult_home} / ×{lev.momentum.mult_away}, capped
              at ±12%. It is a description of the last few minutes, not a
              forecast of the next few.
            </p>
          </details>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-line">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[minmax(0,1fr)_6rem_5.5rem_5rem] items-center gap-x-3 border-b border-line bg-bs px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
            <span>Market</span>
            <span className="text-right">Live model</span>
            <span className="text-right">Market</span>
            <span className="text-right">Δ</span>
          </div>
          {grouped.map((g) => (
            <div key={g.label}>
              <div className="flex items-center gap-2.5 border-b border-line bg-elev/40 px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid">{g.label}</span>
                <span className="ml-auto font-mono text-[10px] text-ink-faint">{g.rows.length}</span>
              </div>
              {g.rows.map((r) => {
                const sg = signals?.get(r.market_id);
                return (
                <div key={r.market_id} className="grid grid-cols-[minmax(0,1fr)_6rem_5.5rem_5rem] items-center gap-x-3 border-b border-line px-4 py-2 text-sm last:border-b-0">
                  <span className="flex min-w-0 items-center gap-2 pr-2 text-ink-mid">
                    <span className="min-w-0 truncate" title={r.market_title}>{r.market_title}</span>
                    {sg && (
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                          sg.kind === "easy_win"
                            ? "bg-warn/15 text-warn"
                            : sg.side === "BUY"
                              ? "bg-accent/15 text-accent"
                              : "bg-neg/15 text-neg"}`}
                        title={`${sg.kind === "easy_win"
                          ? "Easy win — live model calls this near-certain while the price still pays"
                          : `${sg.side} signal on your watched market`} — live model ${pct(sg.live_probability)} vs market ${pct(sg.market_probability)}${sg.minute != null ? ` at ${Math.round(sg.minute)}'` : ""}`}>
                        {sg.kind === "easy_win" ? "💰 easy" : sg.side}{sg.minute != null ? ` ${Math.round(sg.minute)}'` : ""}
                        {/* "💰 easy" and a bare "BUY" carry no meaning of
                            their own; the whole of what the badge claims
                            lived on the `title=` beside them, so a
                            screen-reader user got a word and lost the
                            claim. The claim is in the accessible tree
                            now, and it is DERIVED FROM THE NUMBERS it is
                            drawn from rather than restating the label. */}
                        <span className="sr-only">
                          {" — "}
                          {sg.kind === "easy_win"
                            ? "easy win: the live model calls this near-certain while the price still pays"
                            : `${sg.side} signal on a market you are watching`}
                          {`; live model ${pct(sg.live_probability)} against a market ${pct(sg.market_probability)}`}
                          {sg.minute != null ? ` at ${Math.round(sg.minute)} minutes` : ""}
                          . Informational — the market already knows the score.
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="text-right font-mono tabular-nums text-ink-hi">{pct(r.live_model_probability)}</span>
                  <span className="text-right font-mono tabular-nums text-ink-low">
                    {r.market_probability != null ? pct(r.market_probability) : "—"}
                  </span>
                  <span className={`text-right font-mono tabular-nums ${
                    r.difference == null ? "text-ink-faint"
                      : r.difference >= 0 ? "text-accent" : "text-neg"}`}>
                    {r.difference != null ? signedPct(r.difference) : "—"}
                  </span>
                </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {(a.recent_plays?.length ?? 0) > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-bs/60 px-4 py-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
            recent threat · newest first
          </p>
          <ul className="space-y-1">
            {a.recent_plays!.map((p, i) => (
              <li key={`${p.minute}-${i}`}
                className="flex items-baseline gap-2 text-[11px] leading-snug text-ink-low">
                <span className="w-8 shrink-0 text-right font-mono tabular-nums text-ink-faint">
                  {Math.round(p.minute)}&apos;
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase text-ink-faint">
                  {p.side === "home" ? home : away}
                </span>
                <span className="min-w-0 truncate" title={p.text}>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        Re-simulated every ~30s from the live state, shot stats, and the
        play-by-play pattern (who&apos;s attacking now). The market already
        knows the score — differences are a read, not an edge. The
        derivations open above; nothing on this block needs a hover.
      </p>
    </div>
  );
}

function LiveExtras({ m }: { m: LiveScoreEntry }) {
  // FOUR READS, THREE STATES EACH. Each of these was a bare `catch {}`
  // whose comment said the section "stays hidden": a failed read and a
  // backend that answered "I have nothing for this match" rendered as
  // the identical blank. They are now kept apart, and the second is
  // kept apart from the first by the payload's own `available` flag —
  // which is a different fact again from a read that never landed.
  const [news, setNews] = useState<Read<TeamNewsResponse>>({ s: "asking" });
  const [stats, setStats] = useState<Read<LiveStatsResponse>>({ s: "asking" });
  const [auto, setAuto] = useState<Read<LiveAutoResponse>>({ s: "asking" });
  // latest BUY/SELL signal per watched market (badges); seen ids so each
  // signal toasts exactly once, and the first fetch primes silently — old
  // signals from before the page opened shouldn't greet you with a storm
  const [signals, setSignals] =
    useState<Read<Map<string, LiveSignalRow>>>({ s: "asking" });
  const seenSignals = useRef<Set<number> | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const tn = await api.teamNews(m.match_id);
        if (alive) setNews({ s: "ok", d: tn });
      } catch (e) { if (alive) setNews({ s: "failed", why: why(e) }); }
    };
    load();
    const id = setInterval(load, 300000); // squads are settled; 5 min is plenty
    // broadcast stat card — moves with the match, 30s cadence
    const loadStats = async () => {
      try {
        const st = await api.liveStats(m.match_id);
        if (alive) setStats({ s: "ok", d: st });
      } catch (e) { if (alive) setStats({ s: "failed", why: why(e) }); }
    };
    loadStats();
    const id2 = setInterval(loadStats, 30000);
    // the self-running live read: same 30s cycle as the stats
    const loadAuto = async () => {
      try {
        const la = await api.liveAuto(m.match_id);
        if (alive) setAuto({ s: "ok", d: la });
      } catch (e) { if (alive) setAuto({ s: "failed", why: why(e) }); }
    };
    loadAuto();
    const id3 = setInterval(loadAuto, 30000);
    // watched-market BUY/SELL signals — same 30s cadence as the read that
    // produces them; the backend job also pushes to Discord, this poll is
    // just the on-page mirror (toast fresh ones, badge the rows)
    const loadSignals = async () => {
      try {
        const sr = await api.liveSignals(m.match_id);
        if (!alive) return;
        const priming = seenSignals.current === null;
        if (priming) seenSignals.current = new Set();
        const seen = seenSignals.current!;
        const latest = new Map<string, LiveSignalRow>();
        // newest first from the API — keep the first row seen per market
        for (const s of sr.signals) {
          if (!latest.has(s.market_id)) latest.set(s.market_id, s);
          if (!seen.has(s.id)) {
            seen.add(s.id);
            if (!priming) {
              toast(s.kind === "easy_win"
                ? `💰 EASY WIN — ${s.market_title}: live ${pct(s.live_probability)} vs market ${pct(s.market_probability)}`
                : `${s.side === "BUY" ? "🟢 BUY" : "🔴 SELL"} signal — ${s.market_title}: live ${pct(s.live_probability)} vs market ${pct(s.market_probability)}`);
            }
          }
        }
        setSignals({ s: "ok", d: latest });
      } catch (e) {
        // THE WORST OF THE FIVE. An operator reading a card with no
        // signal badges concluded there were no signals; the truth was
        // that the read never landed. Named now, at the place the
        // absence is read.
        if (alive) setSignals({ s: "failed", why: why(e) });
      }
    };
    loadSignals();
    const id4 = setInterval(loadSignals, 30000);
    return () => { alive = false; clearInterval(id); clearInterval(id2); clearInterval(id3); clearInterval(id4); };
  }, [m.match_id]);

  const autoOk = auto.s === "ok" ? auto.d : null;
  const statsOk = stats.s === "ok" ? stats.d : null;
  const newsOk = news.s === "ok" ? news.d : null;
  const signalRows = signals.s === "ok" ? signals.d : new Map();

  return (
    <div className="mt-8 border-t border-line pt-6">
      {/* EVERY READ THAT DID NOT HAPPEN, NAMED. Grouped so four
          failures are four lines rather than four silences, and so a
          reader meets them above the blocks they are missing from. */}
      <div data-testid="live-extras-failures" className="mb-4 space-y-1.5 empty:mb-0">
        <ReadFailed what="live model" r={auto} testid="live-auto-failed" />
        <ReadFailed what="match stats" r={stats} testid="live-stats-failed" />
        <ReadFailed what="official lineups" r={news} testid="live-news-failed" />
        <ReadFailed what="live signals" r={signals} testid="live-signals-failed" />
      </div>
      {/* ANSWERED, AND THE ANSWER WAS "NOT FOR THIS MATCH". A different
          fact from the failures above, in the backend's own words where
          it supplied them. */}
      {autoOk && !autoOk.available && (
        <p data-testid="live-auto-unavailable"
          className="mb-4 text-[11px] leading-relaxed text-ink-faint">
          The live model answered and has no read for this match
          {autoOk.reason ? `: ${autoOk.reason}` : "."}
        </p>
      )}
      {statsOk && !statsOk.available && (
        <p data-testid="live-stats-unavailable"
          className="mb-4 text-[11px] leading-relaxed text-ink-faint">
          The stats read answered and has no rows for this match.
        </p>
      )}
      {autoOk && autoOk.available && (
        <Collapse eyebrow="live model" title="Live market read · auto" className="mb-6">
          <LiveMarketStream a={autoOk} home={m.home} away={m.away}
            signals={signalRows} />
        </Collapse>
      )}
      {/* AVAILABLE AND EMPTY IS A THIRD ANSWER AGAIN. `available` true
          with zero rows fell between the unavailable line above and the
          block below and drew nothing at all — the same pixels as a read
          that never happened, which is the shape this file exists to
          keep apart. */}
      {statsOk && statsOk.available && statsOk.rows.length === 0 && (
        <p data-testid="live-stats-empty"
          className="mb-4 text-[11px] leading-relaxed text-ink-faint">
          The stats read answered for this match and carried no stat rows
          in it — the broadcast feed has published none yet.
        </p>
      )}
      {statsOk && statsOk.available && statsOk.rows.length > 0 && (
        <Collapse eyebrow="live" title="Match stats" className="mb-6">
          <div className="space-y-2.5">
            {(() => {
              const colors = matchColors(statsOk.home_team || m.home,
                                         statsOk.away_team || m.away);
              return statsOk.rows.map((r) => {
                // MISSING IS NOT ZERO, AND AN UNDEFINED SHARE IS NOT 50/50.
                //
                // This was `parseFloat(r.home) || 0`, and `|| 0` swallows
                // three different facts into one number: a genuine "0", a
                // value ESPN did not send ("", null, "—"), and a value in
                // a form this parse does not understand. All three then
                // fed `tot > 0 ? … : 50`, so an unread pair drew a
                // perfect half-and-half bar — a measured dead heat, drawn
                // off nothing. The numbers beside it were the provider's
                // own strings, so the row said "—  possession  —" over a
                // bar claiming an even split.
                //
                // The bar is now DERIVED FROM THE NUMBERS BESIDE IT: it
                // is drawn only when both parse and at least one is
                // non-zero. Anything else says which of the two it is.
                const h = parseFloat(r.home);
                const a = parseFloat(r.away);
                const read = Number.isFinite(h) && Number.isFinite(a);
                const tot = read ? h + a : 0;
                const pctH = tot > 0 ? (h / tot) * 100 : 0;
                return (
                  <div key={r.key}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="w-14 shrink-0 font-mono tabular-nums text-ink-hi">{r.home}</span>
                      <span className="min-w-0 truncate text-center text-xs text-ink-low">{r.label}</span>
                      <span className="w-14 shrink-0 text-right font-mono tabular-nums text-ink-hi">{r.away}</span>
                    </div>
                    {tot > 0 ? (
                      <div className="mt-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div className="rounded-full" style={{
                          width: `${pctH}%`, background: colors.home, opacity: 0.85 }} />
                        <div className="flex-1 rounded-full" style={{
                          background: colors.away, opacity: 0.85 }} />
                      </div>
                    ) : (
                      <p data-testid="stat-share-undrawn" data-key={r.key}
                        className="mt-1 font-mono text-[9px] leading-none tracking-wide text-ink-faint">
                        {read
                          ? "both sides zero — there is no share to split"
                          : "no share drawn — one of these values is not a number"}
                      </p>
                    )}
                  </div>
                );
              });
            })()}
          </div>
          {(() => {
            const colors = matchColors(statsOk.home_team || m.home,
                                       statsOk.away_team || m.away);
            return (
              <p className="mt-3 flex items-center gap-2 text-[11px] text-ink-faint">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: colors.home }} />
                {statsOk.home_team} left
                <span className="mx-1">·</span>
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: colors.away }} />
                {statsOk.away_team} right
                <span className="mx-1">·</span> via ESPN, ~30s behind the broadcast
              </p>
            );
          })()}
        </Collapse>
      )}
      {newsOk && (
        <Collapse eyebrow="team news" title="Official lineups" className="mb-6">
          <TeamNewsSection news={newsOk} home={m.home} away={m.away} />
        </Collapse>
      )}
      <Collapse eyebrow="what-if" title="Manual override · test your own state" defaultOpen={false} className="mb-0">
        <LivePanel matchId={m.match_id}
          liveLevers={autoOk?.levers && autoOk.levers.source !== "neutral"
            ? { home: autoOk.levers.home, away: autoOk.levers.away }
            : null} />
      </Collapse>
    </div>
  );
}

function LiveCard({ m }: { m: LiveScoreEntry }) {
  const homeGoals = m.goals_list.filter((g) => g.team === "home");
  const awayGoals = m.goals_list.filter((g) => g.team === "away");
  const finished = m.is_finished === true;
  const running = !finished && m.status_short !== "HT";
  // finished shows the full-time label (FT / AET / PEN); live shows the clock.
  const clock =
    finished ? (m.status_short || "FT") :
    m.status_short === "HT" ? "HT" :
    m.minutes_elapsed != null ? `${Math.round(m.minutes_elapsed)}′` : m.status_short;

  return (
    <div className={`glow overflow-hidden rounded-3xl border bg-elev px-6 py-8 transition-colors duration-300 sm:px-10 sm:py-10 ${
      finished
        ? "border-line hover:border-line-strong"
        : "glow-live border-line hover:border-live/40"
    }`}>
      {/* the score block links to the match page; the extras below it are
          interactive and live INSIDE the same box, so they don't navigate */}
      <Link href={`/bet-suggester/market/${m.match_id}`} className="block cursor-pointer">
        {/* status badge: pulsing "live" vs quiet "final" */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {finished ? (
            <Eyebrow tone="low">{m.status_short === "AET" ? "after extra time"
              : m.status_short === "PEN" ? "after penalties" : "full time"}</Eyebrow>
          ) : (
            <>
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-live" />
              <Eyebrow tone="live">live</Eyebrow>
            </>
          )}
        </div>

        {/* score line — the hero */}
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <div className="min-w-0 flex-1 text-right">
            <span className="block text-3xl sm:text-4xl">{flag(m.home)}</span>
            <p className="mt-2 flex items-center justify-end gap-2 truncate text-sm text-ink-mid sm:text-lg">
              {m.home}
              <RedCards team={m.home} raw={m.red_home} />
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-7">
            <Flash
              value={m.home_goals}
              tone={finished ? "accent" : "live"}
              className={`text-6xl font-semibold tracking-tight tabular-nums sm:text-8xl ${
                finished ? "text-ink-mid" : "text-ink-hi"}`}
            />
            <span className="flex flex-col items-center gap-1.5">
              <span className={`font-mono text-sm tabular-nums sm:text-base ${
                running ? "text-live" : "text-ink-low"
              }`}>
                {clock}
              </span>
              {!finished && m.minutes_elapsed != null && (
                <span className="minutebar w-14" aria-hidden>
                  <div style={{ width: `${Math.min(100,
                    (m.minutes_elapsed / (["ET", "BT", "P"].includes(m.status_short) ? 120 : 90)) * 100)}%` }} />
                </span>
              )}
            </span>
            <Flash
              value={m.away_goals}
              tone={finished ? "accent" : "live"}
              className={`text-6xl font-semibold tracking-tight tabular-nums sm:text-8xl ${
                finished ? "text-ink-mid" : "text-ink-hi"}`}
            />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <span className="block text-3xl sm:text-4xl">{flag(m.away)}</span>
            <p className="mt-2 flex items-center gap-2 truncate text-sm text-ink-mid sm:text-lg">
              <RedCards team={m.away} raw={m.red_away} />
              {m.away}
            </p>
          </div>
        </div>

        {/* scorers, split under each side */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-7 flex items-start justify-center gap-8 font-mono text-xs text-ink-low sm:gap-14">
            <div className="flex-1 space-y-1 text-right">
              {homeGoals.map((g, i) => (
                <p key={i}>
                  {g.player ?? "Goal"}{" "}
                  <span className="text-ink-faint">
                    {g.minute != null ? `${g.minute}′` : ""}
                    {g.detail === "Penalty" ? " (P)" : ""}
                  </span>
                </p>
              ))}
            </div>
            <div className="flex-1 space-y-1 text-left">
              {awayGoals.map((g, i) => (
                <p key={i}>
                  <span className="text-ink-faint">
                    {g.minute != null ? `${g.minute}′` : ""}
                    {g.detail === "Penalty" ? " (P) " : " "}
                  </span>
                  {g.player ?? "Goal"}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="mt-7 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          {finished ? "final result →" : "full markets & strategy →"}
        </p>
      </Link>

      {/* lineups + live read, inside the live match box */}
      {!finished && <LiveExtras m={m} />}
    </div>
  );
}

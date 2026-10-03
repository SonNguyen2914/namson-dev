// THE THIRD SCROLL MOMENT: FULL TIME, REVIEWED.
//
// The board's review card, for the same match, unfolding as it crosses
// the reading zone (scrubbed, not pinned). It answers what the board's
// own ReviewCard answers, in the same order and with the same refusal:
// what was said before kickoff, what the market said at the same moment,
// and what happened — side by side, with NO verdict. No hit, no streak,
// no "right": one finished match cannot tell a read from luck
// (components/ReviewCard.tsx, "NO SCOREBOARD").
//
// The market column is the de-vigged three-way book from the stored
// series — the newest quote at or before the T−10 lock — in percentage
// points, because that is what the series stores. It is not an ask
// price, and it is not printed in cents.
import { useCallback, useEffect, useRef } from "react";
import {
  DERBY, FINAL, MARKET_AT_LOCK, MINUS, OUTCOMES, PRIME, fmt1,
} from "../../lib/landingData";
import type { Outcome } from "../../lib/landingData";
import { easeInOut, easeOut, span, useScrollScene } from "../../lib/useScrollScene";
import s from "./landing.module.css";

const NAME: Record<Outcome, string> = {
  home: DERBY.home.name, draw: "Draw", away: DERBY.away.name };
const utc = (iso: string) => new Date(iso).toISOString().slice(11, 16);

export default function FullTime({ enabled }: { enabled: boolean }) {
  const card = useRef<HTMLDivElement | null>(null);
  const coda = useRef<HTMLParagraphElement | null>(null);

  const draw = useCallback((p: number) => {
    const unfold = easeInOut(span(p, 0, 0.7));
    if (card.current) card.current.style.clipPath = `inset(0 0 ${(1 - unfold) * 100}% 0 round 14px)`;
    card.current?.querySelectorAll<HTMLElement>("[data-row]").forEach((el, i) => {
      const t = easeOut(span(p, 0.1 + i * 0.14, 0.42 + i * 0.14));
      el.style.opacity = String(t);
      el.style.transform = `translate3d(0, ${16 * (1 - t)}px, 0)`;
    });
    if (coda.current) coda.current.style.opacity = String(span(p, 0.75, 1));
  }, []);
  useScrollScene(card, draw, { mode: "pass", from: 0.98, to: 0.18, enabled });
  /* A STILL CARD IS A FINISHED CARD. Under reduced motion the first
     (hydration) render is the moving one — `useReducedMotion` answers
     the server's `false` until it has hydrated — so the scene's mount
     frame has already written the folded state (clip-path at 100%, every
     row and the coda at opacity 0) by the time `enabled` turns false,
     and nothing else would ever unwrite it: the whole card, and the
     why-this-match line under it, stayed invisible. Draw the end state
     whenever the scene is not moving, as FieldStage and MatchClock do
     with their fixed p. e2e/the-landing-holds-still.spec.ts. */
  useEffect(() => { if (!enabled) draw(1); }, [enabled, draw]);

  const lock = DERBY.lock, mk = MARKET_AT_LOCK;
  return (
    <section aria-labelledby="landing-ft" className={`${s.wrap} ${s.still}`}>
      <p className={s.eyebrow}>FT · the review</p>
      <h2 id="landing-ft" className={`${s.display} ${s.h2}`}>What was said, what happened.</h2>

      <div ref={card} className={s.review} data-testid="review-card">
        <div data-row className={s.reviewHead}>
          <span className={s.eyebrow}>La Liga · 20 Sep 2026</span>
          <p className={`${s.display} ${s.final}`}>
            <span>{DERBY.home.name}</span>
            <b>{FINAL ? `${FINAL.home}–${FINAL.away}` : "—"}</b>
            <span>{DERBY.away.name}</span>
          </p>
        </div>

        <div className={s.reviewCols}>
          <div data-row className={s.reviewCol}>
            <h3 className={s.colHead}>Model at T{MINUS}10</h3>
            <p className={s.colSub}>locked {utc(lock.at)} UTC · shadow · not{"\u00a0"}advice</p>
            <Triple v={lock.model} />
          </div>
          <div data-row className={s.reviewCol}>
            <h3 className={s.colHead}>Market at the lock</h3>
            <p className={s.colSub}>
              {mk ? <>last quote, {Math.round(Math.abs(mk.t))}{"\u00a0"}min before <span className={s.keep}>kick-off · de-vigged</span></> : "no stored\u00a0quote"}
            </p>
            {mk ? <Triple v={mk.market} /> : <p className={s.colSub}>—</p>}
          </div>
          <div data-row className={s.reviewCol}>
            <h3 className={s.colHead}>What happened</h3>
            <ul className={s.events}>
              {DERBY.events.map((e, i) => (
                <li key={i}>
                  <span className={s.evMin}>{e.m}{PRIME}</span>
                  <i aria-hidden className={e.type === "goal" ? s.evGoal : s.evRed} />
                  <span>
                    {e.type === "goal" ? "Goal" : e.type === "red" ? "Red card" : e.type},{" "}
                    {e.team === "home" ? DERBY.home.name : DERBY.away.name}
                    {e.score ? ` · ${e.score.home}–${e.score.away}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* WHY THIS MATCH (Son, 2026-10-03). The T−10 read happened to
          favour the winner, so the page says plainly that is not why the
          match is here: it is the one with the whole record stored —
          a model to 53′, both stand-downs, all four events. */}
      <p ref={coda} className={s.coda} data-testid="why-this-match">
        Picked for its full stored record, not its result. One match
        can&rsquo;t tell a read from luck.
      </p>
    </section>
  );
}

function Triple({ v }: { v: { home: number; draw: number; away: number } }) {
  return (
    <dl className={s.triple}>
      {OUTCOMES.map((o) => (
        <div key={o}>
          <dt>{NAME[o]}</dt>
          <dd>{fmt1(v[o])}<small>%</small></dd>
        </div>
      ))}
    </dl>
  );
}

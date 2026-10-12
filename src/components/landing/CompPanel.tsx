// THE HERO'S DETAIL PANEL — one layer per selection (All 11, then each
// competition), stacked in one grid cell by landing.module.css so the
// panel is the tallest layer's height and a pick moves nothing.
//
// It says what the planes beside it do not: how many teams, the rating
// range, the top three (leagues) or low / median / high (national
// competitions), and what the page does with a match of that competition
// before kickoff, in play and after the whistle.
//
// THE IN-PLAY WORDING IS THE REGISTRY'S, NOT A HOPE. A model is
// registered for three competitions (EPL, La Liga, MLS: INPLAY_MODEL in
// lib/landingField.ts). The other eight read their minute-by-minute line
// from the market's own T−10 price, which is not a model, and the national
// competitions have no national-team model yet — each says so, tagged
// "not yet", rather than borrowing the sentence of a competition that has
// one. Before kickoff, every hub carries a model forecast beside the
// exchange's book (the 1X2 of `traders_model`).
import Link from "next/link";
import type { ReactNode } from "react";
import {
  COMPS, INPLAY_MODEL, N_TEAMS, NC, REGION, fmtElo,
} from "../../lib/landingField";
import type { Comp } from "../../lib/landingField";
import { FIELD } from "../../lib/landingData";
import s from "./landing.module.css";

const NOT_YET = <span className={s.tag}>not yet</span>;

function Reads({ inplay }: { inplay: ReactNode }) {
  return (
    <dl className={s.reads}>
      <div><dt>Before kickoff</dt>
        <dd>Rating gap, home term and tiers; our model&rsquo;s forecast beside the exchange&rsquo;s book.</dd></div>
      <div><dt>In play</dt>{inplay}</div>
      <div><dt>After the whistle</dt>
        <dd>The review: what was said, beside what happened.</dd></div>
    </dl>
  );
}

/* U+2011 (non-breaking hyphen) in "national‑team": the word never splits
   across lines */
function inplayOf(c: Comp): ReactNode {
  if (c.half === "N") {
    return <dd className={s.gap}>{NOT_YET}Minute by minute from the market&rsquo;s own T−10 price. No national‑team model yet.</dd>;
  }
  if (INPLAY_MODEL[c.k]) return <dd>Model beside the market, minute by minute.</dd>;
  return <dd className={s.gap}>{NOT_YET}Minute by minute from the market&rsquo;s own T−10 price, not a model.</dd>;
}

function Foot({ what }: { what: string }) {
  return (
    <div className={s.cpFoot}>
      <Link className={s.go} href="/bet-suggester">
        Open the board <span aria-hidden>→</span>
        <span className="sr-only"> ({what})</span>
      </Link>
      <span className={s.chip}>shadow · not advice</span>
    </div>
  );
}

/** `i` is -1 for the overview. */
export default function CompPanel({ i }: { i: number }) {
  if (i < 0) {
    return (
      <>
        <p className={s.cpKick}><i className={s.pip} aria-hidden />Overview · two planes</p>
        <h2 className={`${s.display} ${s.cpName}`}>Eleven competitions</h2>
        <p className={s.cpMeta}>{FIELD.clubs.length + N_TEAMS} teams in all · clubs and national teams never share an axis</p>
        <p className={s.cpP}>Pick a competition to light its teams.</p>
        <Reads inplay={<>
          <dd>Model beside the market: EPL, La&nbsp;Liga, MLS.</dd>
          <dd className={s.gap}>{NOT_YET}The other eight: minute by minute from the market&rsquo;s own T−10 price, not a model.</dd>
        </>} />
        <Foot what="all eleven competitions" />
      </>
    );
  }
  const c = COMPS[i];
  return (
    <>
      <p className={s.cpKick}><i className={s.pip} aria-hidden />{c.grp} · {c.idx} / {NC} · {REGION[c.k]}</p>
      <h2 className={`${s.display} ${s.cpName}`}>{c.name}</h2>
      <p className={s.cpMeta}>{c.n} {c.pl.who} · rated {fmtElo(c.lo)}–{fmtElo(c.hi)}<br />{c.pl.plane} · {c.pl.passes} passes</p>
      {c.top
        ? <ol className={s.top3} aria-label="Top three by rating">
            {c.top.map((t, j) => (
              <li key={t.n}><b>{j + 1}</b><span>{t.n}</span><em>{fmtElo(t.v)}</em></li>
            ))}
          </ol>
        : <dl className={s.spread}>
            <div><dt>Low</dt><dd>{fmtElo(c.lo)}</dd></div>
            <div><dt>Median</dt><dd>{fmtElo(c.med)}</dd></div>
            <div><dt>High</dt><dd>{fmtElo(c.hi)}</dd></div>
          </dl>}
      <Reads inplay={inplayOf(c)} />
      <Foot what={c.name} />
    </>
  );
}

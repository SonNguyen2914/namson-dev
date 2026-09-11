// One finished match, reviewed — and the tail that stacks them under a
// league column.
//
// The operator's ask, verbatim: "once a match finished I have no way to
// access it to see where could I do better." So the card answers three
// questions, in this order, and NEVER merges them:
//
//   1. WHAT THE PICKER SAID BEFORE KICKOFF.
//   2. WHAT HAPPENED — the score, and the shot state behind it.
//   3. WHETHER IT FIT — the scoreboard verdict and the tape verdict,
//      side by side, because they disagree and the disagreement is the
//      entire value of looking back.
//
// ── THE RULE THIS FILE EXISTS TO ENFORCE ────────────────────────────────
// A CAPTURED read and a RECONSTRUCTED read are not the same evidence and
// must not be drawn the same way. A capture is what the picker actually
// said, frozen before the match. A reconstruction is the picker's own code
// re-run over a season archive rewound to that kickoff: honest, disclosed,
// and weaker — the standings have moved since, and rebuilding a read from
// today's table and presenting it as the pre-kickoff one would grade the
// picker against knowledge it did not have.
//
// The distinction is carried THREE ways, deliberately redundant:
//   - by COLOUR and BORDER: a capture is a solid accent rail; a
//     reconstruction is a dashed rail in the experimental ink;
//   - by WORD: the chip says CAPTURED or RECONSTRUCTED, and the
//     reconstruction says "NOT a capture" in a sentence;
//   - by STRUCTURE: a capture carries a `capture-clock` block (when it was
//     frozen, how long before kickoff) that a reconstruction does not
//     have, and a reconstruction carries a `recon-provenance` block (which
//     archive file, how many results were in the table, what it was
//     rewound to) that a capture does not have.
// A colour-blind reader, a screen reader and a DOM assertion each still
// see the difference.
//
// ── NO SCOREBOARD ───────────────────────────────────────────────────────
// Nothing here counts hits. There is no running win rate, no streak, no
// "you were right", and no aggregate over outcomes anywhere in this file.
// A handful of finished matches cannot separate a read from luck, and a
// tally on the screen would read as evidence that this page does not have.
// The only aggregates the tail shows are counts of EVIDENCE PROVENANCE —
// how many of the finished fixtures had a frozen read, how many had to be
// rebuilt, how many have none — and they are printed against their own n.
import Link from "next/link";
import { useId, useState } from "react";
import { fmtDate } from "../lib/matchday";
import { leagueLabel } from "../lib/pickerApi";
import {
  Checkpoint, PreKickoff, ReviewLeagueMeta, ReviewRefusal, ReviewRow,
  isRead, pct,
} from "../lib/pickerReview";
import {
  REVIEW_DEFAULT_SORT, REVIEW_SORT_MODES, ReviewSort, isDefaultReviewSort,
  loadReviewOpen, loadReviewSort, reviewModeById, saveReviewOpen,
  saveReviewSort, sortReviewRows,
} from "../lib/pickerReviewSort";
import {
  KalshiCell, SeasonWeight, TierGaps, dec, sign,
} from "./PickerRead";
import { Eyebrow } from "./ui";

// ---------------------------------------------------------------- bits

/** "2h 14m" from a second count. Whole minutes: the freeze clock is not a
 *  stopwatch, and a spurious second implies a precision the capture hook
 *  does not claim. A NEGATIVE value would mean the freeze happened after
 *  kickoff — it is shown as such rather than hidden, because a capture
 *  taken late is a defect the operator needs to see. */
function beforeKickoff(seconds: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  const late = seconds < 0;
  const s = Math.abs(Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const span = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return late ? `${span} AFTER kickoff` : `${span} before kickoff`;
}

/** en dash between the two names of a checkpoint's counts. Always both
 *  numbers: THE EVENT COUNT IS PART OF THE ANSWER, and a bare share hides
 *  that 0–0 on target and 3–1 on target are different matches. */
const duo = (a: number, b: number) => `${a}–${b}`;

const tiltTone = (label: string | null) =>
  label === "TILT_FAV" ? "border-accent/40 bg-accent/5 text-accent"
  : label === "TILT_OPP" ? "border-neg/40 bg-neg/5 text-neg"
  : label === "CONTESTED" ? "border-warn/40 bg-warn/5 text-warn"
  : "border-line text-ink-faint";

const barTone = (label: string | null) =>
  label === "TILT_FAV" ? "bg-accent"
  : label === "TILT_OPP" ? "bg-neg"
  : label === "CONTESTED" ? "bg-warn"
  : "bg-ink-faint";

/** The favourite's share of the shots, drawn. The BAR is what makes two
 *  wins read differently at a glance: a win from 44% and a win from 91%
 *  are the same word on the scoreboard and opposite pictures here. */
function ShareBar({ cp }: { cp: Checkpoint }) {
  const w = cp.shot_share == null ? 0 : Math.max(0, Math.min(100,
    Math.round(cp.shot_share * 100)));
  return (
    <div data-testid="share-bar"
      data-share={cp.shot_share == null ? "" : cp.shot_share.toFixed(4)}
      data-tilt={cp.tilt_label ?? ""}
      role="img"
      aria-label={cp.shot_share == null
        ? `${cp.checkpoint}: no shot share — nothing to read`
        : `${cp.checkpoint}: the favourite had ${pct(cp.shot_share)} of the shots`}
      className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div style={{ width: `${w}%` }}
        className={`h-full rounded-full ${barTone(cp.tilt_label)}`} />
    </div>
  );
}

/** One checkpoint of the tape. */
function CheckpointRow({ cp, slot }: { cp: Checkpoint | null; slot: string }) {
  if (!cp) {
    return (
      <div data-testid="checkpoint" data-cp={slot} data-share=""
        className="rounded-md border border-dashed border-line px-2 py-1.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {slot === "before_first_goal"
            ? "before first goal — no goal was scored"
            : "no reading at this checkpoint"}
        </p>
      </div>
    );
  }
  const favShots = cp.fav_side
    ? cp[cp.fav_side].shots : null;
  const oppShots = cp.fav_side
    ? cp[cp.fav_side === "home" ? "away" : "home"].shots : null;
  return (
    <div data-testid="checkpoint" data-cp={slot}
      data-share={cp.shot_share == null ? "" : cp.shot_share.toFixed(4)}
      className="rounded-md border border-line px-2 py-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          {cp.checkpoint}
        </span>
        {/* A share is the FAVOURITE'S share of the shots, so it needs two
            things to exist: a favourite, and a shot. Each absence gets its
            own words — "—" beside "of shots" read as a rendering fault, and
            it hid which of the two was missing. */}
        {cp.shot_share != null ? (
          <>
            <span data-testid="cp-share"
              className="font-mono text-sm font-semibold tabular-nums text-ink-hi">
              {pct(cp.shot_share)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              of shots
            </span>
          </>
        ) : (
          <span data-testid="cp-share"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {cp.fav_side ? "no shots yet" : "no favourite · raw counts only"}
          </span>
        )}
        {/* The tilt chip is a favourite-relative reading. With no
            favourite there is nothing for it to be relative TO, and a
            second chip saying so beside the first is repetition, not
            disclosure — the row already says it once. */}
        {cp.fav_side && (
          <span data-testid="cp-tilt" data-tilt={cp.tilt_label ?? ""}
            title={cp.tilt == null
              ? "no tilt yet — an empty tape is not a 50/50 contest"
              : `threat tilt ${cp.tilt.toFixed(2)} · band ${cp.tilt_band} · ${cp.tilt_note}`}
            className={`ml-auto rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${tiltTone(cp.tilt_label)}`}>
            {cp.tilt_label ?? "no tape"}
          </span>
        )}
      </div>
      {/* No favourite, no bar: a share bar is the FAVOURITE'S share, and
          an empty track under a row that has no favourite reads as a
          measured zero. A favourite with no shots yet DOES get the empty
          track — that one really is a zero. */}
      {cp.fav_side && <ShareBar cp={cp} />}
      <p className="mt-1 font-mono text-[10px] tabular-nums text-ink-low">
        {/* Favourite-first when a favourite is known; otherwise HOME–AWAY,
            named as such. The page never invents a side to be right
            about, and it never leaves the reader guessing which is which. */}
        {cp.fav_side
          ? <>fav–opp · shots {duo(favShots!, oppShots!)}</>
          : <>home–away · shots {duo(cp.home.shots, cp.away.shots)}</>}
        {" · on target "}
        {cp.on_target
          ? duo(cp.on_target.fav, cp.on_target.opp)
          : duo(cp.home.on_target, cp.away.on_target)}
        {" · score "}{duo(cp.score.home, cp.score.away)}
      </p>
    </div>
  );
}

/** The one sentence that separates a win from dominance from a win from
 *  nothing. DERIVED, never authored per match: the same template runs over
 *  every fixture, so it cannot flatter one and bury another. */
function tapeSentence(row: ReviewRow): string {
  const s = row.shot_state;
  if (s.error) return `The tape could not be read — ${s.error}`;
  const g = s.before_first_goal;
  const fgm = s.first_goal_minute;
  if (!g || fgm == null) {
    const ft = s.full_time;
    if (!ft) return "No shot state is available for this fixture.";
    if (!ft.fav_side || ft.shot_share == null) {
      return `No goal to stand before. At full time the shots were ${
        duo(ft.home.shots, ft.away.shots)} home–away.`;
    }
    return `No goal to stand before. At full time the favourite had ${
      pct(ft.shot_share)} of the shots (${duo(ft[ft.fav_side].shots,
        ft[ft.fav_side === "home" ? "away" : "home"].shots)}).`;
  }
  if (!g.fav_side || g.tilt_label == null) {
    return `Before the ${fgm}' opener the shots were ${
      duo(g.home.shots, g.away.shots)} home–away, on target ${
      duo(g.home.on_target, g.away.on_target)}.`;
  }
  // NO SHOTS, NO SENTENCE ABOUT SHOTS. The threat tilt also counts corners,
  // so a lone corner can label a goalless opening quarter TILT_FAV — and
  // "the tape was already tilted their way" off one corner and no shots is
  // a claim the tape does not support. The counts still render in the
  // checkpoint below; only the narration stops.
  if (g.shot_share == null) {
    return `Before the ${fgm}' opener neither side had had a shot`
      + ` (on target ${duo(g.on_target!.fav, g.on_target!.opp)}).`;
  }
  const word =
    g.tilt_label === "TILT_FAV" ? "the tape was already tilted their way"
    : g.tilt_label === "TILT_OPP" ? "the tape was tilted against them"
    : "the tape was level";
  const favShots = g[g.fav_side].shots;
  const oppShots = g[g.fav_side === "home" ? "away" : "home"].shots;
  return `Before the ${fgm}' opener the favourite had ${pct(g.shot_share)}`
    + ` of the shots (${duo(favShots, oppShots)}), on target ${
      duo(g.on_target!.fav, g.on_target!.opp)} — ${word}.`;
}

// ------------------------------------------------------- pre-kickoff

/** CAPTURED. The strong case: a frozen board row, with the clock of the
 *  freeze. Solid accent rail, and a `capture-clock` block a reconstruction
 *  structurally cannot have. */
function CaptureBanner({ pre }: { pre: PreKickoff }) {
  const span = beforeKickoff(pre.captured_seconds_before_kickoff);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span data-testid="origin-chip" data-origin="captured"
          className="rounded-md border border-accent/60 bg-accent/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          captured
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          what the picker actually said
        </span>
      </div>
      <div data-testid="capture-clock"
        className="mt-2 font-mono text-[10px] leading-relaxed tabular-nums text-ink-low">
        frozen {pre.captured_at ? fmtDate(pre.captured_at, "short") : "—"}
        {span ? ` · ${span}` : ""}
        {pre.board_date ? ` · board ${pre.board_date}` : ""}
      </div>
    </>
  );
}

/** RECONSTRUCTED. The weaker case, and it must look weaker: dashed rail,
 *  experimental ink, the words "NOT a capture", and a provenance block
 *  naming the archive file, the number of results that were in the table
 *  and the instant it was rewound to. Disclosure is part of the answer —
 *  a rebuild the reader cannot audit is just an assertion. */
function ReconBanner({ pre }: { pre: PreKickoff }) {
  const [open, setOpen] = useState(false);
  const src = pre.reconstructed_from;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span data-testid="origin-chip" data-origin="reconstructed"
          className="rounded-md border border-dashed border-skylive/60 bg-skylive/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-skylive">
          reconstructed
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          rebuilt after the fact
        </span>
      </div>
      {/* One line, not a paragraph. The full argument lives once in the
          page's legend; repeating it under every rebuilt card buried the
          numbers it was supposed to qualify. What must stay on EVERY card
          is the word and the fact — so both are here. */}
      <p data-testid="recon-warning"
        className="mt-2 text-[11px] leading-relaxed text-skylive">
        NOT a capture — rebuilt from the season archive rewound to this
        kickoff. Weaker evidence than a frozen read.
      </p>
      <div data-testid="recon-provenance" className="mt-2">
        <button type="button" onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:border-line-strong hover:text-ink-mid">
          {open ? "hide provenance" : "provenance"}
        </button>
        {open && (
          <dl className="mt-2 space-y-1 font-mono text-[10px] leading-relaxed text-ink-low">
            <div>
              <dt className="inline text-ink-faint">archive · </dt>
              <dd className="inline break-all">{src?.season_file ?? "—"}</dd>
            </div>
            <div>
              <dt className="inline text-ink-faint">rewound to · </dt>
              <dd className="inline tabular-nums">{src?.rewound_to ?? "—"}</dd>
            </div>
            <div>
              <dt className="inline text-ink-faint">results in table · </dt>
              <dd className="inline tabular-nums">
                {src?.results_in_table ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="inline text-ink-faint">table source · </dt>
              <dd className="inline">
                {src?.src ?? "—"}
                {src?.min_current_gp != null
                  ? ` · min ${src.min_current_gp} GP` : ""}
              </dd>
            </div>
            {src?.prior_file && (
              <div>
                <dt className="inline text-ink-faint">prior season · </dt>
                <dd className="inline break-all">{src.prior_file}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </>
  );
}

/** NO READ AT ALL. Neither a capture nor a rebuild — and this is a third
 *  state, not an empty version of the other two. The reason is named, and
 *  so are the archive files that were looked at, because
 *  "fixture_not_in_archive" nearly always means "the archive stops before
 *  this match", which is fixable and invisible otherwise. */
function NoReadBanner({ pre }: { pre: PreKickoff }) {
  const considered = pre.reconstructed_from?.considered ?? [];
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span data-testid="origin-chip" data-origin="unavailable"
          className="rounded-md border border-line-strong bg-elev2 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          no pre-kickoff read
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-low">
        Nothing was frozen for this fixture and the archive cannot rebuild
        one{pre.unavailable_reason
          ? <> — <span className="font-mono text-warn">{pre.unavailable_reason}</span></>
          : ""}. The match is still here with its result and its tape; the
        missing half is named rather than guessed at.
      </p>
      {considered.length > 0 && (
        <ul data-testid="recon-considered"
          className="mt-2 space-y-0.5 font-mono text-[10px] leading-relaxed text-ink-faint">
          {considered.map((c) => (
            <li key={c.path} className="break-all">
              looked in {c.path} — last fixture {c.last_fixture ?? "unknown"}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// -------------------------------------------------------------- verdict

/** The backend's reason strings, in words. ONLY the closed set of tokens
 *  it enumerates is glossed; anything else — the `winner=… fav_side=…` and
 *  `tilt_label=… on_target …` forms, or a token added later — renders
 *  VERBATIM. A gloss table that guessed at unknown strings would be free to
 *  say something the payload never said, which is the opposite of what a
 *  reason line is for. */
const REASON_WORDS: Record<string, string> = {
  no_pre_kickoff_favourite:
    "no pre-kickoff read, so there is no favourite to judge this against",
  no_result: "no final score was reported",
  no_shot_state: "the tape could not be read",
  empty_tape_at_checkpoint:
    "nothing had happened by then — an empty tape is not a failure to confirm",
};

const reasonWords = (r: string | null) =>
  r == null ? null : (REASON_WORDS[r] ?? r);

function Verdict({ testid, label, value, yes, no, reason }: {
  testid: string; label: string; value: boolean | null;
  yes: string; no: string; reason: string | null;
}) {
  const state = value == null ? "unknown" : value ? "yes" : "no";
  const tone =
    state === "yes" ? "border-accent/50 bg-accent/10 text-accent"
    : state === "no" ? "border-neg/50 bg-neg/10 text-neg"
    : "border-dashed border-line-strong text-ink-faint";
  return (
    <div data-testid={testid} data-value={state}
      className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${tone}`}>
        {/* NOT KNOWN is its own word. A missing verdict is not a "no", and
            rendering it as one would invent a failure. */}
        {state === "unknown" ? "not known" : state === "yes" ? yes : no}
      </span>
      {reason && (
        <span title={reason}
          className="w-full font-mono text-[10px] leading-relaxed text-ink-faint">
          {reasonWords(reason)}
        </span>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- card

export function ReviewCard({ row, rank }: { row: ReviewRow; rank: number }) {
  const pre = row.pre_kickoff;
  const state = pre.state;
  const read = isRead(state) ? state : null;
  // `stages.compare` can refuse a fixture outright (a promoted club with no
  // row in the table in use). That is a READ THAT DOES NOT EXIST, not a
  // read of zero, and it gets its own branch rather than an empty card.
  // Today's backend converts a reconstruction's refusal into `state: null`
  // with a `picker_refused:` reason and the capture hook never freezes a
  // refusal at all — so this branch is currently unreached. It stays
  // because the payload type admits the shape, and an unhandled shape here
  // would render a card with a blank middle and no word for why.
  const refusedRead = state && state.refused === true ? state : null;
  // "unavailable" is a third origin for the reader even though the payload
  // stamps such rows "reconstructed" — an origin with no state is an
  // ABSENCE, and counting it as a rebuild would overstate the evidence.
  const origin = read ? pre.origin : "unavailable";
  const res = row.result;
  const favSide = read?.fav_side ?? null;
  const ft = row.shot_state.full_time;
  const fit = row.fit;

  /* A CAPTURE MADE BY A RULE THAT HAS SINCE BEEN CORRECTED
     (2026-09-10).

     The cross-league favourite used to be chosen by comparing
     WITHIN-LEAGUE tier tuples across leagues and breaking ties on the
     club's NAME. Sabah FK, top of the Azerbaijani Premyer Liqa, beat
     Manchester United on that rule; Slavia Prague beat Lens; Viking FK
     beat VfB Stuttgart. Backend 8dfa813 replaced it with the 36-club
     field and flipped 50 of 113 rated fixtures.

     A CAPTURE CANNOT BE RE-TAKEN AND MUST NOT BE REWRITTEN. It is
     "what the picker actually said", the match is over so there is no
     pre-kickoff board left to read, and a cup has no season archive to
     rewind (`cup_has_no_season_archive`). Silently restating it with
     today's answer would destroy the only record of what was shown.

     So it is MARKED, and the mark has to be loud, because this is not
     a footnote on one figure: every signed field below is oriented from
     that favourite — the tier gaps, the shape, and the whole "whether
     it fit" verdict. `FAVOURITE WON: NO` on Liverpool 2-1 Atlético is
     answering about the wrong club.

     THE SIGNAL IS EXACT, not a date comparison. The current rule emits
     `fav_source: "field"` and carries a `field` block on a
     cross-league row; the superseded one emitted `"rank"` and carried
     none. A row that is not cross-league never used either rule. */
  const favRuleSuperseded = Boolean(
    read?.cross_league && read?.fav_source === "rank" && !read?.field);

  const winner = res?.winner ?? null;
/** THE FAVOURITE, AS A SHAPE RATHER THAN A COLOUR.
 *
 *  Filled = the picker's favourite before kickoff; hollow = the
 *  opponent. The board's upcoming card draws exactly this pair on its
 *  two club lines, so a reader who knows one surface knows this one.
 *
 *  NOTHING IS DRAWN WHEN NO FAVOURITE IS KNOWN. A row whose capture was
 *  unavailable has no favourite, and a hollow ring on both sides would
 *  say "we picked neither" — which is a claim. Absent says the
 *  question was never answered, which is the truth. */
function FavPip({ side, favSide }: {
  side: "home" | "away"; favSide: "home" | "away" | null | undefined;
}) {
  if (!favSide) return null;
  const isFav = favSide === side;
  return (
    <span data-testid="fav-mark" data-side={side}
      data-fav={isFav ? "yes" : "no"} aria-hidden
      title={isFav
        ? "the picker's favourite before kickoff"
        : "not the picker's favourite"}
      className={isFav
        ? "h-2 w-2 flex-none self-center rounded-full bg-ink-hi"
        : "h-[7px] w-[7px] flex-none self-center rounded-full border border-ink-low bg-bs"} />
  );
}

  const scoreTone = (side: "home" | "away") =>
    winner === side ? "text-ink-hi font-semibold" : "text-ink-mid";

  return (
    <article
      data-testid="review-row"
      data-league={row.league}
      data-event={row.event_id}
      data-origin={origin}
      data-shape={read?.shape ?? ""}
      data-fav-won={fit.favourite_won == null ? "unknown"
        : fit.favourite_won ? "yes" : "no"}
      data-confirmed={fit.confirmed_at_20 == null ? "unknown"
        : fit.confirmed_at_20 ? "yes" : "no"}
      data-share-ft={ft?.shot_share == null ? "" : ft.shot_share.toFixed(4)}
      className="min-w-0 rounded-xl border border-line bg-elev/25 p-4 transition-colors hover:border-line-strong"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span data-testid="review-rank"
          className="font-mono text-[11px] tabular-nums text-ink-faint">
          {String(rank).padStart(2, "0")}
        </span>
        <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          {row.status_detail || "finished"}
        </span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-faint">
          {fmtDate(row.kickoff ?? undefined, "short")}
        </span>
      </div>

      {/* The way IN — the same affordance the upcoming card has, into the
          same id space. A finished match you cannot open is a line of text. */}
      <Link
        href={`/bet-suggester/${row.league}/${row.event_id}`}
        aria-label={`review ${row.home} versus ${row.away}`}
        data-testid="review-link"
        className="mt-2 block rounded-md outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs">
        <div data-testid="review-score"
          className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {/* TWO FACTS, TWO CHANNELS, AND THEY USED TO FIGHT (2026-09-10).
              WEIGHT says who WON — `scoreTone` gives the winner
              `text-ink-hi font-semibold` and the loser `text-ink-mid`.
              A trailing gold `fav` chip said who we PICKED. On Liverpool
              2-1 Atlético the winner was Liverpool and the favourite was
              Atlético, so the row read "**Liverpool** 2–1 Atlético
              Madrid [FAV] →": the brightest word and the gold chip
              belonged to different clubs, and the operator read them as
              one statement. "no, I saw Liverpool was the fav" — and the
              card had told him so.

              Gold was the wrong channel besides. The design rule is that
              gold is the brand and never a verdict, and "this is the one
              we picked" is a verdict.

              SO THE MARK IS THE SHAPE THE BOARD ALREADY USES: a filled
              pip on the favourite, a hollow ring on the opponent, drawn
              BEFORE each name where a reader meets it first. Same idiom
              as the upcoming card's two club lines, so one convention
              covers both surfaces and neither has to be learned twice.
              Weight still says who won; nothing competes for it. */}
          <FavPip side="home" favSide={favSide} />
          <span className={`text-sm ${scoreTone("home")}`}>{row.home}</span>
          <span className="font-mono text-lg font-semibold tabular-nums text-ink-hi">
            {res ? `${res.home}–${res.away}` : "—"}
          </span>
          <FavPip side="away" favSide={favSide} />
          <span className={`text-sm ${scoreTone("away")}`}>{row.away}</span>
          <span aria-hidden className="text-ink-faint">→</span>
        </div>
      </Link>

      {/* THE FAVOURITE ON THIS CARD WAS NAMED BY A RULE SINCE
          CORRECTED, SAID BEFORE ANYTHING SIGNED FROM IT.

          It sits above the capture rather than inside it because it
          does not qualify one figure — it qualifies the ORIENTATION of
          every signed field below, the shape, and the "whether it fit"
          verdict, all of which are computed from the favourite. A note
          beside the tier row would have read as a caveat on the tiers.

          `warn`, not `neg`: the capture is not broken and not a failed
          read. It is a faithful record of what the board said, and what
          the board said has since been corrected. Those are different
          claims and the traffic light keeps them apart. */}
      {favRuleSuperseded && (
        <div data-testid="fav-rule-superseded"
          className="mt-3 rounded-lg border border-warn/40 bg-warn/5 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
            favourite named by a superseded rule
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-mid">
            This capture was frozen before the cross-league favourite was
            fixed. The old rule compared each club&rsquo;s standing{" "}
            <em className="not-italic text-ink-hi">within its own league</em>{" "}
            and broke ties on the club&rsquo;s name, so a club top of a
            weak league outranked a stronger club mid-table in a strong
            one. It named{" "}
            <span className="text-ink-hi">{read?.favourite}</span>{" "}
            here. The board now rates both clubs on the competition&rsquo;s
            own 36-club field.
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-low">
            Everything signed below &mdash; the gaps, the tier reading,
            the shape and whether the favourite won &mdash; is oriented
            from that favourite, so read it as the record of what was
            shown, not as the current reading. The capture is kept
            unrewritten on purpose: it is what the picker actually said.
          </p>
        </div>
      )}
      {/* ─────────────── 1 · what the picker said before kickoff ─────────── */}
      <section data-testid="pre-kickoff" data-origin={origin}
        className={`mt-3 rounded-lg border-l-2 py-2 pl-3 ${
          origin === "captured"
            ? "border-l-accent bg-accent/[0.03]"
            : origin === "reconstructed"
              ? "border-l-skylive border-dashed bg-skylive/[0.03]"
              : "border-l-line-strong border-dashed"}`}>
        <Eyebrow className="mb-1.5">before kickoff</Eyebrow>
        {origin === "captured" ? <CaptureBanner pre={pre} />
          : origin === "reconstructed" ? <ReconBanner pre={pre} />
          : <NoReadBanner pre={pre} />}

        {read ? (
          <div className="mt-3">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="text-ink-hi">{read.favourite}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                fav · rank {read.ranks.fav}
              </span>
              <span className="text-ink-faint">over</span>
              <span className="text-ink-mid">{read.opponent}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                rank {read.ranks.opp}
              </span>
              {/* the SAME chip the board draws, so a read below the
                  divider is the read above it — with the pre-blend
                  badge kept as the fallback for a reconstruction, which
                  carries no weight by design */}
              {read.weights ? <SeasonWeight w={read.weights} />
                : read.src === "prior" && (
                <span
                  title="rated on last season's final table — this season had too few games played at kickoff"
                  className="rounded border border-warn/40 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn">
                  prior szn
                </span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[11px] tabular-nums">
              <span className="text-ink-low">
                GD/g gap{" "}
                <span className="font-semibold text-ink-hi">
                  {dec(read.gdg_gap)}
                </span>
              </span>
              <span className="text-ink-low">
                ppg gap <span className="text-ink-hi">{dec(read.ppg_gap)}</span>
              </span>
              <span className="text-ink-low">
                rank gap <span className="text-ink-hi">{sign(read.rank_gap)}</span>
              </span>
              <span className="text-ink-faint">
                gp {read.gp_current.home ?? "—"}/{read.gp_current.away ?? "—"}
              </span>
            </div>
            <div className="mt-3">
              <TierGaps read={read} />
            </div>
            {/* A reconstruction has NO BOOK. That absence is a property of
                rebuilding, not a missing quote, and saying so is the
                difference between an honest gap and a blank cell — but it
                is one line, not a block with a heading over it. */}
            <div className="mt-3 border-t border-line pt-2">
              {origin === "captured" ? (
                <>
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                    price at capture
                  </p>
                  <KalshiCell quote={read.kalshi} />
                </>
              ) : (
                <span data-testid="no-price"
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  price at capture · none — a rebuilt read has no book snapshot
                </span>
              )}
            </div>
          </div>
        ) : refusedRead ? (
          <p data-testid="read-refused"
            className="mt-3 font-mono text-[11px] leading-relaxed text-warn">
            {refusedRead.club} — {refusedRead.reason}. The picker refuses a club with no
            row in the table in use rather than imputing a number, so there
            is no read to compare against.
          </p>
        ) : null}
      </section>

      {/* ─────────────────────── 2 · what happened ───────────────────────── */}
      <section data-testid="what-happened" className="mt-3">
        <Eyebrow className="mb-1.5">what happened</Eyebrow>
        <p data-testid="tape-sentence"
          className="text-xs leading-relaxed text-ink-mid">
          {tapeSentence(row)}
        </p>
        {row.shot_state.error ? (
          <p data-testid="shot-error"
            className="mt-2 font-mono text-[11px] leading-relaxed text-warn">
            shot state unavailable — {row.shot_state.error}. The score above
            is the scoreboard&apos;s, and it stands on its own.
          </p>
        ) : (
          <div className="mt-2 space-y-1.5">
            <CheckpointRow cp={row.shot_state.at_20} slot="at_20" />
            <CheckpointRow cp={row.shot_state.before_first_goal}
              slot="before_first_goal" />
            <CheckpointRow cp={row.shot_state.full_time} slot="full_time" />
          </div>
        )}
      </section>

      {/* ─────────────────────── 3 · whether it fit ──────────────────────── */}
      <section data-testid="fit" className="mt-3 border-t border-line pt-3">
        <Eyebrow className="mb-1.5">whether it fit</Eyebrow>
        <div className="space-y-2">
          <Verdict testid="fit-result" label="favourite won"
            value={fit.favourite_won} yes="yes" no="no"
            reason={fit.favourite_won_reason} />
          <Verdict testid="fit-read"
            label={`in-play read at ${fit.checkpoint_minute}'`}
            value={fit.confirmed_at_20} yes="confirmed" no="did not confirm"
            reason={fit.confirm_reason} />
        </div>
        {/* THE METHOD PARAGRAPH USED TO STAND HERE (moved 2026-09-09).
            It said "Two answers, never one…" on EVERY finished row. That
            is a fact about the fit block's METHOD — why this section
            prints two verdicts rather than one — and not a fact about
            this fixture, so by the operator's rule (commit 302f19a, "A
            fact about the whole column is not a fact about a card") it
            belongs to the tail, once. It is FIT_METHOD_NOTE now, behind
            the `i` in the tail's header.

            WHAT DID NOT MOVE: `confirm-note` below. The comment on it
            records a decision-safety decision that the exploratory label
            rides every row, and that rule is not this one. */}
        {/* The exploratory label rides on EVERY row — that is not
            negotiable, the rule was written after looking at three
            fixtures. What does not need to ride on every row is the whole
            paragraph: it repeated five deep in a narrow column and buried
            the numbers it qualifies. The claim stays here in full words,
            the reasoning is one hover away and is printed once, verbatim
            from the payload, at the foot of the tail. */}
        <p data-testid="confirm-note" title={fit.confirm_note}
          className="mt-1.5 font-mono text-[9px] leading-relaxed text-warn">
          EXPLORATORY — NOT VALIDATED, NOT PREREGISTERED, NO LEDGER ROW.
          This rule was written after looking at three fixtures; it
          describes a row and forecasts nothing.
        </p>
      </section>
    </article>
  );
}

// ----------------------------------------------------------------- tail

function ReviewRefusalRow({ r }: { r: ReviewRefusal }) {
  return (
    <li data-testid="review-refusal"
      className="rounded-lg border border-line bg-elev/30 px-3 py-2.5">
      <p className="text-sm text-ink-hi">
        {r.home} <span className="text-ink-faint">vs</span> {r.away}
      </p>
      <p className="mt-1 font-mono text-[11px] text-warn">
        {r.reason}{r.status_detail ? ` — ${r.status_detail}` : ""}
      </p>
    </li>
  );
}

/** The finished tail, below one league column's upcoming fixtures.
 *
 *  It is INSIDE the column on purpose: the league column is where the
 *  operator already looks, and keeping the finished matches there keeps a
 *  league's story continuous instead of sending him to a second page to
 *  find out how the first one turned out. */
/** WHY THIS SECTION PRINTS TWO VERDICTS AND NOT ONE.
 *
 *  A fact about the fit block's METHOD, so it is the tail's and not a
 *  card's — the operator's rule, given three times now (the season
 *  share 2026-09-08, the Champions League cross-league warning
 *  2026-09-09, and this). It stood on every finished row, five deep in
 *  a narrow column, above the numbers it qualifies.
 *
 *  A LITERAL, unlike `confirm_note` at the foot, which is read off the
 *  payload precisely because it states the backend's own rule. This one
 *  states what THIS COMPONENT draws, so this component is its source. */
const FIT_METHOD_NOTE =
  "Two answers, never one. The scoreboard and the tape can disagree, "
  + "and when they do that is the thing worth looking at.";

/** The tail's method note, said once, behind the letter `i`.
 *
 *  MODELLED ON `ColumnNotes` in PickerColumn.tsx and deliberately the
 *  same object: same 16px circle, same neutral-at-rest treatment with
 *  the accent only on hover/focus/open, hover + focus + tap-to-pin,
 *  Escape to shut. A reader who has learnt it on the board does not
 *  learn it again here.
 *
 *  THE PANEL IS NOT ANCHORED TO THE BUTTON. Its positioning context is
 *  the header ROW, which is the full width of the tail, so
 *  `w-[min(30rem,100%)]` resolves against the section and never against
 *  a 16px circle. That matters under `html { overflow-x: clip }`
 *  (globals.css) — a panel sized off the trigger cannot be scrolled to
 *  and cannot be seen. */
function FitMethodNote() {
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
      <button type="button" data-testid="fit-method-open"
        aria-expanded={open} aria-label="why this section prints two verdicts"
        aria-describedby={open ? panelId : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => {
          // authoritative, so a second tap closes what hover is holding
          // open — the only way out on a touch screen
          e.preventDefault(); e.stopPropagation();
          setPinned((v) => !v); setHovered(false); setFocused(false);
        }}
        // sans, not mono: the mono lowercase i is serifed at both ends
        // and reads as a figure one at this size — see ColumnNotes
        className={`inline-flex h-[16px] w-[16px] items-center justify-center self-center rounded-full border text-[11px] font-semibold leading-none transition-colors ${
          open ? "border-accent/60 text-accent"
            : "border-line-strong text-ink-low hover:border-accent/40 hover:text-accent"}`}>
        i
      </button>
      {open && (
        <div data-testid="fit-method-note" id={panelId} role="note"
          className="absolute right-0 top-[calc(100%+7px)] z-30 w-[min(30rem,100%)] rounded-lg border border-line-strong bg-elev2 p-3 text-left text-[11px] leading-relaxed text-ink-mid shadow-xl">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            how to read &ldquo;whether it fit&rdquo;
          </p>
          <p className="mt-1">{FIT_METHOD_NOTE}</p>
        </div>
      )}
    </span>
  );
}

export function ReviewTail({
  slug, rows, refusals, meta, back, loading, error, read, unreadWhy,
  storeNote,
}: {
  slug: string;
  rows: ReviewRow[];
  refusals: ReviewRefusal[];
  meta?: ReviewLeagueMeta;
  back: number;
  loading: boolean;
  error: string;
  /** DID THE SWEEP COVER THIS COMPETITION? See the three states below. */
  read: boolean;
  /** why it did not, when the page knows; null otherwise */
  unreadWhy: string | null;
  /** set when NOTHING is being frozen anywhere — every read below is a
   *  rebuild, and that is a property of the deployment, not a coincidence */
  storeNote: string | null;
}) {
  const [sort, setSort] = useState<ReviewSort>(() => loadReviewSort(slug));
  /* COLLAPSED UNTIL ASKED FOR (operator, 2026-09-07). The column's
     forward story is what the board is for; the finished list was
     spending the height of every past match under it before anyone had
     asked to see one. Remembered per league, same as the sort. */
  const [open, setOpen] = useState<boolean>(() => loadReviewOpen(slug));
  const toggle = () => setOpen((o) => { saveReviewOpen(slug, !o); return !o; });
  const mode = reviewModeById(sort.mode)
    ?? reviewModeById(REVIEW_DEFAULT_SORT.mode)!;
  const sorted = sortReviewRows(rows, sort);
  // read off a row rather than restated here: the note is the backend's
  // own sentence about its own rule, and a copy in this file would be a
  // second claim free to fall out of step with the first
  const confirmNote = rows.find((r) => r.fit?.confirm_note)?.fit.confirm_note
    ?? null;

  const apply = (next: ReviewSort) => {
    setSort(next);
    saveReviewSort(slug, next);
  };

  /* IS THE NUMBER OF FINISHED MATCHES KNOWN AT ALL? `rows.length` is 0
     while the request is in flight, after it failed, after THIS
     league's own tail failed, AND WHEN THE SWEEP NEVER COVERED THIS
     COMPETITION — for exactly the same reason it is 0 on a league that
     genuinely played nothing. Four facts, one number, and the header
     must not fold them together.

     `read` WAS THE MISSING FOURTH (2026-09-10), and it is the one that
     did damage. The other three were caught; a competition the payload
     has no key for fell through every guard here, `known` came out
     true, and the tail printed "0 matches" and "No Champions League
     fixtures finished in the last 7 days" over six that were played.
     `review_competitions()` in the backend records that same night and
     rules on it: a competition this surface never read must never be
     rendered as one it read and found empty. This is that rule, on the
     surface that renders it. */
  const known = !loading && !error && read && !meta?.error;

  return (
    <section data-testid="review-tail" data-league={slug}
      aria-label={`${leagueLabel(slug)} finished matches`}
      className="mt-8 border-t-2 border-dashed border-line-strong pt-4">
      {/* THE HEADER IS THE CONTROL, and it keeps saying how much is behind
          it while closed: "finished · 12 matches · last 7d" is the whole
          point of a collapsed section — a reader must be able to decide
          whether to open it without opening it. The count is therefore
          NOT hidden with the body.

          AND A LOADED CONTROL MUST NOT LOOK LIKE AN EMPTY ONE (operator,
          2026-09-08). Every part of this row was drawn in the faintest
          ink on the ladder, so "4 matches" and "0 matches" were the same
          object at a glance — and on a column whose ONLY content is
          behind this control, that made a column holding four matches
          read as a broken empty one. `data-has` says which it is; the
          ink follows it, and it goes no further than one step up the
          gray ladder. A count is not a verdict and gets no colour.

          NOR MAY IT COUNT A READ THAT DID NOT HAPPEN. Printing "0
          matches" while the request is still out, or after it failed, is
          a failed read rendered as a measured absence — on the one
          control a reader uses to decide whether to look. Three states,
          three words: a number, "reading", "not read". */}
      {/* THE HEADER IS A ROW, NOT JUST THE BUTTON (2026-09-09), and it
          is `relative` on purpose: it is the positioning context the
          method note's panel measures its `100%` against. Anchored to
          the 16px circle instead, the panel would be 16px wide and
          unreachable under `html { overflow-x: clip }`. A button cannot
          nest inside a button either, so the affordance is a sibling of
          the toggle rather than a child of it. */}
      <div className="relative flex w-full items-baseline gap-2">
      <button type="button" data-testid="review-toggle"
        /* FOUR VALUES, NOT THREE. "unasked" is a competition this
           sweep never covered and "unread" is one it tried and could
           not — both are honestly "not read" to the eye, and neither
           claims a zero, but they are different facts and a test that
           cannot tell them apart cannot guard the difference. */
        data-has={known ? (rows.length > 0 ? "matches" : "none")
                        : !loading && !error && !read ? "unasked" : "unread"}
        onClick={toggle} aria-expanded={open}
        aria-controls={`review-body-${slug}`}
        title={!known
          ? (loading
              ? `still reading the last ${back} day${back === 1 ? "" : "s"} — how many finished is not known yet`
              : !error && !read
                ? `the finished-matches read did not cover ${leagueLabel(slug)}, so how many finished is not known — open this for what that means`
                : `the last ${back} day${back === 1 ? "" : "s"} could not be read, so how many finished is not known — open this for the reason`)
          : rows.length > 0
            ? `${rows.length} match${rows.length === 1 ? "" : "es"} finished in the last ${back} day${back === 1 ? "" : "s"} — press to ${open ? "put them away" : "read them"}`
            : `nothing finished in the last ${back} day${back === 1 ? "" : "s"}`}
        className="group flex flex-1 items-baseline gap-2 text-left">
        <span aria-hidden
          className={`font-mono text-[10px] transition-transform ${
            known && rows.length > 0 ? "text-ink-mid" : "text-ink-faint"} ${
            open ? "rotate-90" : ""}`}>▸</span>
        <h4 className={`font-mono text-[11px] uppercase tracking-[0.22em] transition-colors group-hover:text-accent ${
          known && rows.length > 0 ? "text-ink-hi" : "text-ink-mid"}`}>
          finished
        </h4>
        <span data-testid="review-count"
          className={`ml-auto font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums ${
            known && rows.length > 0 ? "text-ink-mid" : "text-ink-faint"}`}>
          {known
            ? `${rows.length} match${rows.length === 1 ? "" : "es"}`
            : loading ? "reading" : "not read"}
          {" · last "}{back}d
        </span>
      </button>
      {/* DRAWN WHEN THE CARDS IT DESCRIBES EXIST, and not otherwise: an
          explainer for a "whether it fit" block that no row is drawing
          explains nothing. It stays put whether the section is open or
          shut, so it does not appear and disappear under the reader's
          cursor as they toggle. */}
      {rows.length > 0 && <FitMethodNote />}
      </div>

      {open && (
      <div id={`review-body-${slug}`} data-testid="review-body">

      {/* EVIDENCE PROVENANCE, not a scorecard. These three numbers say how
          many of the finished fixtures have a frozen read behind them, and
          they sum to the count printed beside them. No outcome is tallied
          on this page. */}
      {meta && meta.finished > 0 && (
        <p data-testid="review-provenance"
          className="mt-1.5 font-mono text-[10px] leading-relaxed tabular-nums text-ink-faint">
          of {meta.finished}: {meta.captured} captured · {meta.reconstructed}{" "}
          reconstructed · {meta.unavailable} with no read
        </p>
      )}

      {storeNote && (
        <p data-testid="review-store-note"
          className="mt-2 rounded-md border border-skylive/30 bg-skylive/5 px-2.5 py-2 text-[11px] leading-relaxed text-skylive">
          {storeNote}
        </p>
      )}

      {/* The tail's OWN sort — independent of the column above it. Picking
          a book key up there must not reorder the matches down here. */}
      {rows.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide">
          <label htmlFor={`review-sort-${slug}`} className="text-ink-faint">
            sort
          </label>
          <select id={`review-sort-${slug}`} data-testid="review-sort"
            value={sort.mode}
            onChange={(e) => {
              const m = reviewModeById(e.target.value)
                ?? reviewModeById(REVIEW_DEFAULT_SORT.mode)!;
              apply({ mode: m.id, dir: m.defaultDir });
            }}
            className="min-w-0 flex-1 rounded-md border border-line bg-bs px-1.5 py-1 uppercase text-ink-mid outline-none transition-colors hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent">
            {REVIEW_SORT_MODES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <button data-testid="review-dir" data-dir={sort.dir}
            onClick={() => apply({ ...sort, dir: sort.dir === "asc" ? "desc" : "asc" })}
            aria-label={`finished sort direction ${sort.dir === "asc" ? "ascending" : "descending"} — press to flip`}
            className="shrink-0 rounded-md border border-line px-2 py-1 text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi">
            {sort.dir === "asc" ? "↑ asc" : "↓ desc"}
          </button>
          {!isDefaultReviewSort(sort) && (
            <button data-testid="review-reset"
              onClick={() => apply(REVIEW_DEFAULT_SORT)}
              title="back to the tail's default order — most recent kickoff first"
              className="shrink-0 rounded-md border border-line px-2 py-1 text-ink-faint transition-colors hover:border-line-strong hover:text-ink-mid">
              reset
            </button>
          )}
        </div>
      )}
      {rows.length > 0 && mode.nullNote && (
        <p data-testid="review-null-note"
          className="mt-1.5 font-mono text-[10px] tracking-wide text-ink-faint">
          {mode.nullNote}
        </p>
      )}

      {loading ? (
        <p data-testid="review-loading"
          className="mt-3 font-mono text-[11px] text-ink-faint">
          reading the last {back} days…
        </p>
      ) : error ? (
        <div data-testid="review-error"
          className="mt-3 rounded-lg border border-live/30 bg-live/5 px-3 py-2.5">
          <p className="font-mono text-[11px] leading-relaxed text-live">{error}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-low">
            The finished matches could not be loaded. Nothing is being shown
            from an earlier request.
          </p>
        </div>
      ) : !read ? (
        /* STATE 2 OF THREE, AND THE ONE WITH NO BRANCH UNTIL NOW.
           The payload carries no key for this competition, so nothing
           about its window was measured. It is NOT the empty state
           below — that state is a finding ("we looked; none finished")
           and this is the absence of one. Six Champions League ties
           finished on the night the difference was drawn as the same
           sentence.

           WHY THE KEY IS THE RIGHT SIGNAL: `assemble_review` writes a
           competition's meta BEFORE it fetches anything, so a
           competition that was read and failed still has a key (and
           lands in the branch below this one). A missing key means the
           sweep never covered it, and means nothing else. */
        <div data-testid="review-unasked"
          className="mt-3 rounded-xl border border-dashed border-line-strong bg-elev p-4">
          <Eyebrow>not read — not zero</Eyebrow>
          <p className="mt-2 text-sm leading-relaxed text-ink-mid">
            The finished-matches read did not cover {leagueLabel(slug)}.
            No window was measured for this competition, so nothing here
            says how many of its fixtures finished — least of all that
            none did.
          </p>
          {/* The reason, WHEN THE PAGE HAS ONE. A blank where a reason
              would go is honest; an invented reason is not. */}
          {unreadWhy && (
            <p data-testid="review-unasked-why"
              className="mt-2 text-[11px] leading-relaxed text-ink-low">
              {unreadWhy}
            </p>
          )}
        </div>
      ) : meta?.error ? (
        <div data-testid="review-league-error"
          className="mt-3 rounded-lg border border-live/30 bg-live/5 px-3 py-2.5">
          <p className="font-mono text-[11px] leading-relaxed text-live">
            {meta.error}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-low">
            This league&apos;s finished fixtures could not be read. The
            failure costs this tail, not the page.
          </p>
        </div>
      ) : sorted.length > 0 ? (
        <div className="mt-3 space-y-3">
          {sorted.map((r, i) => (
            <ReviewCard key={`${r.league}-${r.event_id}`} row={r} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div data-testid="review-empty"
          className="mt-3 rounded-xl border border-dashed border-line p-4">
          <p className="text-sm text-ink-mid">
            No {leagueLabel(slug)} fixtures finished in the last {back}{" "}
            day{back === 1 ? "" : "s"}.
          </p>
        </div>
      )}

      {refusals.length > 0 && (
        <div data-testid="review-refusals"
          className="mt-4 rounded-xl border border-warn/25 bg-warn/5 p-3">
          <Eyebrow tone="warn">
            not played · {refusals.length} fixture
            {refusals.length === 1 ? "" : "s"}
          </Eyebrow>
          <ul className="mt-2 space-y-2">
            {refusals.map((r) => (
              <ReviewRefusalRow key={r.event_id} r={r} />
            ))}
          </ul>
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-low">
            A fixture the provider files as over that never actually
            completed — postponed or abandoned. It is listed rather than
            counted as a nil-nil, because reading one as a result would
            invent a match nobody played.
          </p>
        </div>
      )}

      {/* WHY THERE IS NO SCORE ON THIS PAGE. Said out loud, because its
          absence is a decision and an unexplained absence reads as an
          oversight someone will later "fix". */}
      <p data-testid="no-tally-note"
        className="mt-4 text-[11px] leading-relaxed text-ink-faint">
        No tally is kept here, and none will be. A handful of finished
        matches cannot tell a real read apart from luck, so a count of how
        often the favourite won would look like evidence this page does not
        have. Each match says what happened and whether the two verdicts
        agreed; the reading is yours.
      </p>

      {/* The confirm rule, once, VERBATIM from the payload — not retyped
          here, so it cannot drift from the rule the backend actually
          applied. Every card above carries the exploratory label; this is
          where the label's reasoning is written out. */}
      {confirmNote && (
        <p data-testid="confirm-rule-note"
          className="mt-3 border-t border-line pt-3 font-mono text-[10px] leading-relaxed text-warn">
          {confirmNote}
        </p>
      )}
      </div>
      )}
    </section>
  );
}

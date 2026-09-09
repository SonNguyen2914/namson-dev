// One archived cup season, drawn as a bracket.
//
// A FINISHED COMPETITION, SO THERE IS NO MODEL ON THIS SURFACE. No
// probability, no edge, no countdown, no "alert fires at" — the
// tournament is over and the only honest content is what happened.
// That also settles the palette: gold is BRAND here (the eyebrow, the
// champion's glow, the active season tab) and never a verdict on a
// match, and the up/warn/neg traffic light is not used to say who won,
// because who won is a fact and not a judgement. Winners take ink-hi,
// losers ink-faint — the same greyscale verdict BracketView.tsx uses
// for a finished match.
//
// THE ONE PLACE COLOUR CARRIES MEANING is `warn` (amber), on the two
// things that are caveats rather than results:
//   * a tie that went to PENALTIES — "this did not settle at ninety";
//   * the round the derivation REFUSED to reconstruct.
// That is the ink family this repo reserves for refusals, and both of
// these are refusals: one of the scoreline to settle, one of ours.
//
// WON AND ADVANCED ARE DRAWN AS TWO DIFFERENT THINGS, because they are
// two different things. This repo settles "won" as AHEAD AT NINETY PLUS
// STOPPAGE — Kalshi pays a three-way on ninety and a shootout pays
// nothing, which cost real money on bet 42 — and a shootout still sends
// a club to the next round. 24 of 77 ties in 2024 and 18 of 62 in 2025
// ended level, so this is most of the bracket and not a footnote. A
// level tie therefore leaves BOTH names on the middle ink (nobody was
// ahead) and marks the club that went through with a THROUGH tag and a
// line saying it was penalties. Where nobody plays again — a final or a
// third-place match decided on penalties — the archive cannot say who
// lifted it, and the card says exactly that rather than picking one.
//
// WIDTH. Every round is a wrapping grid, so nothing here can push the
// page sideways at any viewport; the one genuinely wide thing, the
// unreconstructed-phase fixture table, gets its own `overflow-x-auto`.
import { useState } from "react";
import { Eyebrow } from "./ui";

export type Tie = {
  fixture_id: number;
  date: string;
  home: string;
  away: string;
  ft_home: number;
  ft_away: number;
  /** ahead at ninety plus stoppage — null means level, which is a real
   *  outcome and not a missing one */
  ft_winner: string | null;
  went_to_penalties: boolean;
  /** who went through, which is a different question from who won */
  advanced: string | null;
  decided_by: "full_time" | "penalties";
  advanced_known_by: string;
  source: string;
};

export type Round = {
  name: string;
  size?: number;
  derived_by: string | null;
  ties: Tie[];
};

export type Season = {
  season: number;
  n_fixtures: number;
  champion: string | null;
  champion_known_by: string;
  went_to_penalties_count: number;
  rounds: Round[];
  third_place: Round;
  refusal: { check: string; at: string; why: string; clubs: string[] } | null;
  notes: { what: string; why: string }[];
  sources: { path: string; provider: string | null; n: number }[];
  unreconstructed: {
    n: number;
    first_date: string | null;
    last_date: string | null;
    clubs: string[];
    why: string;
    fixtures: Tie[];
  };
};

const DAY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
});
const day = (iso: string) => DAY.format(new Date(iso));

/** How this tie's `advanced` was settled: a short line on the card, the
 *  provenance on hover.
 *
 *  MEASURED, NOT STYLED DOWN. The first version put the whole sentence —
 *  "(they are the club that appears in the next round)" — on the card,
 *  and a screenshot of the 2024 round of 32 showed sixteen cards of four
 *  lines of amber prose each, with the club names truncated to initials
 *  beside them. The provenance still matters and still ships; it moved
 *  to the title, and to the explainer panel at the top of the page. */
function advancedLine(t: Tie): { short: string; full: string } | null {
  if (!t.went_to_penalties) return null;
  if (t.advanced == null) {
    return {
      short: "level at 90 · shootout winner not recorded",
      full: "The tie was level at 90 and decided on penalties, and nobody "
        + "plays again — so no later round can say who went through, and "
        + "neither source records the shootout itself.",
    };
  }
  return {
    short: `level at 90 · ${t.advanced} advanced on penalties`,
    full: t.advanced_known_by.startsWith("progression")
      ? `${t.advanced} is the club that appears in the next round, which is `
        + "how the shootout winner is known — the record carries a "
        + "went_to_penalties flag and no shootout score."
      : `${t.advanced} advanced.`,
  };
}

function Side({ name, goals, tie, big }: {
  name: string; goals: number; tie: Tie; big: boolean;
}) {
  const through = tie.advanced === name;
  // NOBODY IS TINTED WHITE ON A LEVEL TIE. `ft_winner` is null exactly
  // when the score was level, and putting the winner's ink on the club
  // that went through would render a shootout as a win — the one thing
  // this surface exists not to do.
  const ink =
    tie.ft_winner === name ? "text-ink-hi font-medium"
    : tie.ft_winner != null ? "text-ink-faint"
    : "text-ink-mid";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`min-w-0 flex-1 truncate ${big ? "text-[15px]" : "text-[13px]"} ${ink}`}>
        {name}
      </span>
      {through && (
        <span
          title="advanced to the next round"
          className="shrink-0 rounded border border-line-strong px-1 py-px font-mono text-[8px] uppercase leading-none tracking-[0.14em] text-ink-hi"
        >
          through
        </span>
      )}
      <span className={`shrink-0 font-mono tabular-nums ${big ? "text-[15px]" : "text-[13px]"} ${ink}`}>
        {goals}
      </span>
    </div>
  );
}

export function TieCard({ t, big = false }: { t: Tie; big?: boolean }) {
  const note = advancedLine(t);
  return (
    <div
      data-testid="lc-tie"
      data-fixture={t.fixture_id}
      // The two facts, out where a guard can read them without reading a
      // colour. A tint cannot be asserted on honestly, and these two are
      // the whole point of the surface.
      data-ft-winner={t.ft_winner ?? ""}
      data-advanced={t.advanced ?? ""}
      data-pens={t.went_to_penalties ? "true" : "false"}
      className={`rounded-xl border bg-elev p-2.5 ${
        big ? "border-accent/30" : "border-line"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
          {day(t.date)}
        </span>
        {t.went_to_penalties && (
          <span
            data-testid="lc-pens-chip"
            className="shrink-0 rounded border border-warn/40 bg-warn/10 px-1 py-px font-mono text-[8px] uppercase leading-none tracking-[0.16em] text-warn"
          >
            pens
          </span>
        )}
      </div>
      <Side name={t.home} goals={t.ft_home} tie={t} big={big} />
      <div className="my-1 h-px bg-line" />
      <Side name={t.away} goals={t.ft_away} tie={t} big={big} />
      {note && (
        <p data-testid="lc-pens-note" title={note.full}
          className="mt-1.5 text-[10px] leading-snug text-warn/90">
          {note.short}
        </p>
      )}
    </div>
  );
}

function RoundLabel({ children, derivedBy }: {
  children: React.ReactNode; derivedBy: string | null;
}) {
  return (
    // ink-LOW, not ink-faint. The round name is the load-bearing fact on
    // a bracket whose rounds were derived rather than read, and at
    // #4b4b54 on #050507 "ROUND OF 32" was barely legible in a
    // screenshot at every width.
    <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low"
      title={derivedBy ?? undefined}>
      {children}
    </p>
  );
}

function Drop() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <div className="h-4 w-px bg-line" />
    </div>
  );
}

/** Round n's grid — never more than FOUR abreast, at any width.
 *
 *  Eight tracks was the first attempt, and a 1440px screenshot of 2024's
 *  round of 32 settled it: at ~110px a card cannot hold a club name, and
 *  sixteen ties rendered as "S… THROUGH 4" over "U.N.A.M. - P… 0". A
 *  bracket whose clubs are initials is not a bracket. Four tracks give
 *  every card ~240px inside `max-w-5xl`, which fits the longest name in
 *  the corpus ("New England Revolution") beside its tag and its score.
 *  Rounds simply wrap to more rows, which costs height on a page that
 *  has height to spend. */
function grid(n: number): string {
  if (n <= 2) return "mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2";
  if (n <= 4) return "mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";
  return "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";
}

function ChampionBox({ s }: { s: Season }) {
  const known = s.champion != null;
  return (
    <div className="mx-auto max-w-xs">
      <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        Champion
      </p>
      <div
        data-testid="lc-champion"
        data-champion={s.champion ?? ""}
        className={`rounded-xl border p-4 text-center ${
          known ? "glow glow-accent border-accent/40 bg-elev"
                : "border-warn/40 bg-warn/5"
        }`}
      >
        {known ? (
          <p className="text-lg font-semibold tracking-tight text-ink-hi">
            {s.champion}
          </p>
        ) : (
          // NOT AN EMPTY BOX. A final decided on penalties leaves nobody
          // playing again, so the archive genuinely does not carry who
          // lifted it — which is a different thing from "we did not look".
          <p className="text-[11px] leading-snug text-warn">
            The final was level at 90 and decided on penalties. Nobody plays
            again, so neither source records who lifted it — this is not a
            gap we can close by looking harder.
          </p>
        )}
      </div>
    </div>
  );
}

function Refusal({ s }: { s: Season }) {
  const u = s.unreconstructed;
  const [open, setOpen] = useState(false);
  if (u.n === 0) return null;
  return (
    <section className="mt-10">
      <div
        data-testid="lc-refusal"
        data-refused-count={u.n}
        className="rounded-xl border border-warn/40 bg-warn/5 p-4"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warn">
          {u.n} fixtures before the bracket — no round could be derived
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-mid">
          {u.why}
        </p>
        {s.refusal && (
          <p className="mt-2 text-[12px] leading-relaxed text-ink-low">
            The walk stopped at <span className="text-warn">{s.refusal.check}</span>,
            on {s.refusal.at}: {s.refusal.why}
            {s.refusal.clubs.length > 0 && <> ({s.refusal.clubs.join(", ")})</>}.
          </p>
        )}
        <p className="mt-2 font-mono text-[10px] tracking-wide text-ink-faint">
          {u.first_date?.slice(0, 10)} — {u.last_date?.slice(0, 10)} ·{" "}
          {u.clubs.length} clubs
        </p>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi"
        >
          {open ? "hide" : "show"} the {u.n} fixtures
        </button>
        {open && (
          // THE FIXTURES ARE MEASURED EVEN THOUGH THE ROUND IS NOT.
          // Who played whom, the score, and whether it went to
          // penalties are all in the archive; only the round label is
          // absent. So they are listed — as fixtures, in date order,
          // under a heading that says no round is claimed for them.
          // The table is the one wide thing on this page and scrolls
          // inside itself.
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-[12px]">
              <thead>
                <tr className="text-left font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                  <th className="py-1 pr-3 font-normal">date</th>
                  <th className="py-1 pr-3 font-normal">home</th>
                  <th className="py-1 pr-2 text-right font-normal">ft</th>
                  <th className="py-1 pl-3 font-normal">away</th>
                </tr>
              </thead>
              <tbody>
                {u.fixtures.map((f) => (
                  <tr key={f.fixture_id} data-testid="lc-phase-row"
                    className="border-t border-line/60">
                    <td className="whitespace-nowrap py-1 pr-3 font-mono text-[10px] text-ink-faint">
                      {day(f.date)}
                    </td>
                    <td className="py-1 pr-3 text-ink-mid">{f.home}</td>
                    <td className="whitespace-nowrap py-1 pr-2 text-right font-mono tabular-nums text-ink-mid">
                      {f.ft_home}–{f.ft_away}
                      {f.went_to_penalties && (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wider text-warn">
                          pens
                        </span>
                      )}
                    </td>
                    <td className="py-1 pl-3 text-ink-mid">{f.away}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CupBracket({ s }: { s: Season }) {
  const third = s.third_place.ties[0] ?? null;
  // NO `Reveal` AROUND THIS SECTION, deliberately.
  //
  // It had one, and a 390px screenshot showed the whole bracket — the
  // champion, five rounds and the refusal panel — as blank page.
  // `.reveal` starts at `opacity: 0` and is only lifted when an
  // IntersectionObserver sees the wrapper's top edge, so wrapping a
  // 3,000px block in ONE of them hides all 3,000px until its first pixel
  // crosses the fold. On a phone that is a long scroll through nothing.
  // The effect is built for a card, not for a page's whole content, and
  // an archive of finished results has nothing to reveal anyway.
  return (
    <section aria-label={`${s.season} bracket`}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Eyebrow tone="accent">{s.season} bracket</Eyebrow>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {s.n_fixtures} fixtures · {s.went_to_penalties_count} went to
          penalties
        </p>
      </div>

      <ChampionBox s={s} />
      <Drop />

      {s.rounds.map((r, i) => (
        <div key={r.name}>
          {i > 0 && <Drop />}
          {r.name === "Final" ? (
            // The final centred, the third-place match beside it — a
            // grid with symmetric side columns RESERVES the space, so
            // the two can never overlap at any width.
            //
            // BOTH LABELS LIVE INSIDE THE GRID. With "Final" above it
            // and "Third place" inside it, the two headings sat a line
            // apart and the two cards started at different heights —
            // visible in the first 1440px screenshot as a bracket that
            // looked accidentally ragged rather than deliberately
            // asymmetric.
            <div className="mx-auto max-w-4xl lg:grid lg:grid-cols-[1fr_minmax(0,22rem)_1fr] lg:items-start lg:gap-4">
              <div className="hidden lg:block" aria-hidden />
              <div className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none">
                <RoundLabel derivedBy={r.derived_by}>{r.name}</RoundLabel>
                {r.ties.map((t) => <TieCard key={t.fixture_id} t={t} big />)}
              </div>
              {third ? (
                <div className="mx-auto mt-6 w-full max-w-xs lg:mx-0 lg:mt-0 lg:max-w-none">
                  <RoundLabel derivedBy={s.third_place.derived_by}>
                    Third place
                  </RoundLabel>
                  <TieCard t={third} />
                </div>
              ) : (
                <div className="hidden lg:block" aria-hidden />
              )}
            </div>
          ) : (
            <>
              <RoundLabel derivedBy={r.derived_by}>{r.name}</RoundLabel>
              <div className={grid(r.ties.length)}>
                {r.ties.map((t) => <TieCard key={t.fixture_id} t={t} />)}
              </div>
            </>
          )}
        </div>
      ))}

      <Refusal s={s} />

      <p className="mt-6 font-mono text-[9px] leading-relaxed tracking-wide text-ink-low">
        {s.sources.map((src) => (
          <span key={src.path} className="mr-3 inline-block">
            {src.n} fixtures · {src.path}
            {src.provider ? ` · ${src.provider}` : ""}
          </span>
        ))}
      </p>
    </section>
  );
}

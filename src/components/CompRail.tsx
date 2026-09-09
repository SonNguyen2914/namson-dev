// THE LIVE-COMPETITION CHIPS IN THE TOP BAR, and the one thing they are
// allowed to say beyond their own name: WHEN the competition next plays.
//
// ─── WHAT THIS RAIL MEANS ────────────────────────────────────────────
// A chip here says "this competition is live and has a page". It is not
// the picker board's column set and never was: the Champions League left
// `tables.BOARD_COLUMNS` on 2026-09-09 on the operator's instruction
// ("remove UCL from the landing page, we have it in its own cup page is
// enough") and KEPT its chip, its label, its cards and its page. Removing
// a column is not deleting a competition — the two lists answer two
// different questions and this file is the second one.
//
// It lives here rather than as a literal in each page because it was a
// literal in each page: /bet-suggester and /bet-suggester/leagues carried
// the same one-entry array with the same comment, and the day one of them
// gained the glow the other would have kept a chip that could not.
//
// ─── THE GLOW (operator, 2026-09-09) ─────────────────────────────────
// "When a match of that competition is today or the next day, make its
// box glow."
//
// IT SAYS WHEN. IT DOES NOT SAY WHETHER. The charter is IT SHOWS; IT DOES
// NOT DECIDE — the backend pins the same rule in words at
// tests/test_position.py:230, where "you should", "cash out now" and
// "sell now" are forbidden strings — so the whole vocabulary here is four
// phrases long and every one of them names a day: "a match today", "a
// match tomorrow", their plurals, and "matches today and tomorrow". No
// urgency, no count of value, no verb the reader could act on. See
// lib/compSoon.soonLabel, which is the only place those words exist.
//
// DERIVED FROM FIXTURES, NOT FROM A DATE OR A SLUG. The competition's own
// fixture feed is read and its kickoffs are bucketed by the board's own
// `localDay`. Nothing here knows what "ucl" is; a competition added to
// LIVE_COMPETITIONS below gets the same behaviour with no edit.
//
// MISSING IS NEVER ZERO. The read has three states and the third is the
// default: until the fetch lands — and forever, if it fails — the chip is
// an ORDINARY chip. It does not glow, and it also does not say anything
// about there being no match: an unlit chip is silence, not a claim, and
// the only sentence this component ever adds is the one that names a day
// it actually counted. See lib/compSoon.SoonRead.
import { useEffect, useState } from "react";
import { NavChip } from "./chrome";
import { SoonRead, UNKNOWN, fetchSoon, isSoon, soonLabel } from "../lib/compSoon";

export type LiveCompetition = {
  /** the rail's own key, and the competition key the fixture feed is
   *  asked for at /api/comp/{key}/fixtures */
  key: string;
  href: string;
  label: string;
  /** the competition's own light, as a CSS custom property NAME. The
   *  same token its board column, its rails and its favourite pips use
   *  (see globals.css, "league identity — WAYFINDING ONLY"), so the chip
   *  and the pages it opens are lit alike and a competition cannot end
   *  up with two identities. */
  hue: string;
};

/* WHICH COMPETITIONS ARE LIVE ENOUGH FOR A CHIP, and the test that
   settles it: does the competition still have fixtures to come. It is a
   question the data answers and a guess gets wrong, which is why
   components/ArchiveMenu.tsx records the check each time it is made.

   ASEAN left on 2026-08-30 (0 upcoming, 28 played) and the Leagues Cup
   on 2026-09-09 (Toluca 2-0 Monterrey, 09-07, 62 events all final);
   both are in the Archive dropdown at the top-left, and both viewers
   still work. UCL stays: its league phase opened 2026-09-08 and it has
   eighteen matches in this window — leaving the picker BOARD on
   2026-09-09 changed which page ranks it, not whether it is being
   played.

   AND THE CHIP POINTS AT THE VIEWER, NOT AT `/bet-suggester/ucl`
   (2026-09-09). That path is the BOARD narrowed to one column
   (`only={["ucl"]}`), served by `/api/picker/board`, which takes `days`
   and `date` and no `leagues`. So the moment the operator took the
   Champions League off the board the page behind this chip held ZERO
   rows — a live link to an empty shell, verified on namson.dev. His
   sentence was "we have it in its own cup page is enough", and the cup
   page is the competition viewer: it reads `src.competitions.VIEWERS`,
   is untouched by `BOARD_COLUMNS`, and answers today with 12 upcoming,
   7 carrying a strength read and 12 tradeable on Kalshi. */
export const LIVE_COMPETITIONS: readonly LiveCompetition[] = [
  { key: "ucl", href: "/bet-suggester/comp/ucl", label: "UCL",
    hue: "--lg-ucl" },
];

/** ONE COMPETITION'S NEXT-TWO-DAYS READ, on the client only.
 *
 *  The fetch is in an effect, not in render, for two reasons that are
 *  the same reason: the first paint must not depend on a clock. Server
 *  rendering runs in the container's zone and at the container's
 *  instant, so a glow decided during render could differ between the
 *  server's HTML and the browser's rehydration — the exact hazard the
 *  fixed TZ in lib/matchday exists to close. The chip therefore starts
 *  UNKNOWN everywhere, which is also the honest state before a read.
 *
 *  It is a single request per mount with no polling. The window is two
 *  calendar days wide; a chip that re-fetched on a timer would spend the
 *  operator's backend budget to change its mind at most once a day. */
export function useCompSoon(key: string): SoonRead {
  const [read, setRead] = useState<SoonRead>(UNKNOWN);
  useEffect(() => {
    const ac = new AbortController();
    let alive = true;
    void fetchSoon(key, ac.signal).then((r) => { if (alive) setRead(r); });
    return () => { alive = false; ac.abort(); };
  }, [key]);
  return read;
}

/** One chip. Exported so a page that builds its own rail can still get
 *  the glow, and so a test can mount it alone. */
export function CompChip({ comp }: { comp: LiveCompetition }) {
  const read = useCompSoon(comp.key);
  /* THE THREE STATES, HANDED OVER AS THREE. `isSoon` is deliberately not
     enough on its own: "we looked and there is nothing in the window"
     and "we never got an answer" are both an unlit chip, they look
     identical on screen forever, and folding them here is precisely how
     a failed read starts meaning "nothing on". The chip carries the
     state in `data-soon` so the difference is observable — see NavChip.
     `isSoon` still decides the GLOW, so the two can never disagree about
     which state lights up. */
  const state = !read.known ? "unknown" as const
    : isSoon(read) ? "soon" as const
    : "none" as const;
  return (
    <NavChip
      href={comp.href}
      active={false}
      soon={{ state, hue: comp.hue, note: soonLabel(read) ?? undefined }}
    >
      {comp.label}
    </NavChip>
  );
}

/** The rail: every live competition, in declaration order. */
export function CompRail() {
  return (
    <>
      {LIVE_COMPETITIONS.map((c) => <CompChip key={c.key} comp={c} />)}
    </>
  );
}

export default CompRail;

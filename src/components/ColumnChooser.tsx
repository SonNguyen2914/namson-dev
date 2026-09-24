import { useMemo } from "react";

import { PICKER_COLUMN_ORDER, leagueLabel } from "../lib/pickerApi";
import { VIEW, boardLoops } from "./LeagueRibbon";
import { hueOf } from "./PickerColumn";

/** WHICH OF THE DECLARED COLUMNS THE BOARD DRAWS (operator, 2026-09-22).
 *
 *  WHY IT EXISTS. The ribbon carries eight leagues past a four-column
 *  window, so every league is REACHABLE and no four of them are
 *  CHOOSABLE: "put the EPL, La Liga, MLS and Liga MX side by side" is a
 *  question the board could not answer, because the four in front of you
 *  are whichever four the declared order happens to park there. This is
 *  the control that answers it.
 *
 *  IT FILTERS; IT NEVER ORDERS AND NEVER ADMITS. Every set it hands back
 *  is built by filtering `slugs` — the page's `boardColumns(...)`, the
 *  one door — so a slug this control has never been given cannot appear
 *  in its output and two slugs cannot swap places. The operator's
 *  reading order survives every press: choosing La Liga and the EPL
 *  draws them EPL-first, because that is the order he declared.
 *
 *  ABSENT BY DESIGN IS NOT VANISHED. A league the board is not currently
 *  drawing is named in the summary line while this panel is shut, named
 *  again with its fixture count when it is open, and one press from
 *  coming back. It never becomes a hole, and its count is never a `0` —
 *  a competition with no fixtures on the board says so in words.
 *
 *  AND THE BOARD KEEPS A COLUMN. The last drawn league refuses to be
 *  taken off: a board drawing nothing is not a narrower board, it is a
 *  blank page that looks exactly like a broken one. The refusal is in
 *  the chip's own accessible name rather than in a message that appears
 *  after you press it.
 *
 *  IT SHOWS; IT DOES NOT DECIDE. Nothing here ranks a competition, and
 *  nothing here is an opinion about which leagues are worth drawing. */

/** THE TWO LEAGUES THAT WERE GIVEN THE SAME LIGHT, DERIVED RATHER THAN
 *  RESTATED.
 *
 *  Four of the board's eight hues are deliberate REPEATS. There was no
 *  separable range left for four more leagues, so each new hue was
 *  picked as the shadow of the league sitting exactly `VIEW` places away
 *  in `PICKER_COLUMN_ORDER` — the one distance at which the window can
 *  never show both at once. Under the declared order those pairs are
 *  epl/ligue1, laliga/eredivisie, bundesliga/mls and seriea/ligamx, and
 *  globals.css names each one beside the hue it defines.
 *
 *  THIS CONTROL IS THE FIRST THING THAT CAN PUT A PAIR TOGETHER. The
 *  guarantee was never a property of the colours — it was a property of
 *  the distance — and choosing a subset changes the distances. Drawing
 *  the EPL and Ligue 1 as neighbours is a perfectly reasonable thing for
 *  the operator to ask for; what would not be reasonable is the board
 *  doing it and saying nothing, because the failure arrives as "these
 *  two columns are hard to tell apart" a long way from the press that
 *  caused it. So the pair is NAMED, and nothing is refused.
 *
 *  Derived from `PICKER_COLUMN_ORDER` and `VIEW` — the declaration and
 *  the readable-column count, both of them already the only copy of
 *  themselves. A ninth league, or a different `VIEW`, moves these pairs
 *  without an edit here. */
export function sharesLight(a: string, b: string): boolean {
  const i = PICKER_COLUMN_ORDER.indexOf(a);
  const j = PICKER_COLUMN_ORDER.indexOf(b);
  /* A competition the order has never heard of is drawn in `--lg-cup`
     by `hueOf`, and so shares its light with every other such one — but
     that is the palette having no answer for it rather than a designed
     pair, and it is not this function's claim to make. */
  return i >= 0 && j >= 0 && Math.abs(i - j) === VIEW;
}

/** CAN THESE TWO DRAWN COLUMNS BE ON SCREEN TOGETHER? Position in the
 *  DRAWN list, not in the declaration — that is the whole point of the
 *  control. A looped board measures the distance the short way round,
 *  because its first and last columns are neighbours; a bounded one
 *  cannot wrap and measures it straight. `boardLoops` is the loop's own
 *  test, imported rather than re-derived. */
function coVisible(i: number, j: number, n: number, view: number): boolean {
  const d = Math.abs(i - j);
  return (boardLoops(n, view) ? Math.min(d, n - d) : d) < view;
}

/** A count as the sentence the chip should say. MISSING IS NEVER ZERO:
 *  a column the board holds no fixtures for says so in words. */
const fixturePhrase = (n: number) =>
  n === 0 ? "no fixtures on the board"
    : `${n} fixture${n === 1 ? "" : "s"} on the board`;

export function ColumnChooser({ slugs, drawn, counts, view, onChange }: {
  /** every column the board declares, in the operator's reading order */
  slugs: readonly string[];
  /** …and the ones currently on the track, a subset of it in that order */
  drawn: readonly string[];
  /** fixtures per declared column — NAMED when there are none */
  counts: Record<string, number>;
  /** how many drawn columns are on screen at once at this width */
  view: number;
  /** hands back a filtered `slugs`; never a reordered or widened one */
  onChange: (next: readonly string[]) => void;
}) {
  const on = useMemo(() => new Set(drawn), [drawn]);

  /** THE DRAWN LEAGUES WHOSE SHADOW PARTNER IS DRAWN NEAR ENOUGH TO SIT
   *  BESIDE THEM. Computed over the drawn order, so the default — every
   *  declared column, every pair exactly `VIEW` apart — flags nothing,
   *  which is the board as it has always been. */
  const sharing = useMemo(() => {
    const out = new Map<string, string>();
    drawn.forEach((a, i) => {
      const b = drawn.find((s, j) =>
        j !== i && sharesLight(a, s) && coVisible(i, j, drawn.length, view));
      if (b) out.set(a, b);
    });
    return out;
  }, [drawn, view]);

  const undrawn = slugs.filter((s) => !on.has(s));
  const only = drawn.length === 1;

  /* EVERY ANSWER IS A FILTER OF `slugs`. Not a splice of `drawn`, not a
     push: the output cannot contain a slug the declaration does not, and
     cannot put two of them in an order the operator did not choose. */
  const toggle = (slug: string) => {
    if (!on.has(slug)) {
      onChange(slugs.filter((s) => s === slug || on.has(s)));
      return;
    }
    if (only) return;          /* the board keeps a column — see above */
    onChange(slugs.filter((s) => s !== slug && on.has(s)));
  };

  return (
    /* SHUT BY DEFAULT, AND THE BOARD IT OPENS OVER IS UNCHANGED. Every
       declared column is drawn until somebody presses something here, so
       a reader who never opens this panel is looking at exactly the
       board that shipped. */
    <details data-testid="column-chooser" className="group">
      <summary data-testid="column-chooser-summary"
        className="flex cursor-pointer list-none items-center gap-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] text-ink-faint hover:text-ink-mid [&::-webkit-details-marker]:hidden">
        {/* THE ONE THING ON THIS CONTROL THAT MOVES, and it opts out
            explicitly — there is no blanket reduced-motion rule in
            globals.css, each animated thing turns itself off. The caret
            still TURNS when the panel opens; what goes is the travel
            between the two states. Same `motion-reduce:transition-none`
            the live card's flip uses. */}
        <i aria-hidden
          className="inline-block transition-transform group-open:rotate-90 motion-reduce:transition-none">
          &rsaquo;
        </i>
        <span>
          columns — {drawn.length} of {slugs.length} drawn
        </span>
        {/* NAMED WHILE THE PANEL IS SHUT. A league that is not being
            drawn has not left the board and must not read as though it
            had, so the ones that are off are listed here rather than
            only inside a panel the reader has to open to discover they
            exist. Their counts are on the chips; this is the roll
            call. */}
        {undrawn.length > 0 && (
          <span data-testid="column-chooser-undrawn"
            className="min-w-0 truncate normal-case tracking-normal text-ink-low">
            not drawn: {undrawn.map(leagueLabel).join(" · ")}
          </span>
        )}
      </summary>

      {/* A GROUP OF TOGGLES, NOT A TABLIST. Each chip is a two-state
          button over its own league and any number of them may be on at
          once, which is neither what `tab` means nor what `radio` does.
          `aria-pressed` is the role that says so. */}
      <div role="group" data-testid="column-chooser-list"
        aria-label={`which of the ${slugs.length} declared columns the board draws`}
        className="flex flex-wrap items-center gap-3 pt-2 pb-0.5">
        {slugs.map((slug) => {
          const drawing = on.has(slug);
          const n = counts[slug] ?? 0;
          const shares = sharing.get(slug);
          /* THE LAST COLUMN REFUSES, AND SAYS SO BEFORE IT IS PRESSED.
             `aria-disabled` rather than `disabled`: a disabled button is
             not hit-tested at all, so it would answer a thumb with
             nothing and drop out of the touch-floor audit at the same
             time. This one still takes the press and still declines. */
          const held = drawing && only;
          return (
            <button key={slug} type="button" data-testid="column-chip"
              data-slug={slug} data-drawn={drawing ? "yes" : "no"}
              {...(shares ? { "data-shares-light": shares } : {})}
              aria-pressed={drawing}
              {...(held ? { "aria-disabled": true } : {})}
              onClick={() => toggle(slug)}
              /* ONE HUE LOOKUP. `hueOf` answers for every slug the board
                 can declare, including one the palette does not name;
                 a `var(--lg-${slug})` built here would be right for the
                 eight and silently empty for the ninth. */
              style={{ ["--h" as string]: hueOf(slug) }}
              className={`flex flex-none items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase leading-none tracking-[0.06em] whitespace-nowrap transition-colors ${
                drawing
                  ? "border-[var(--h)] bg-[color-mix(in_srgb,var(--h)_12%,transparent)] text-ink-hi"
                  : "border-line bg-bs-elev2 text-ink-low hover:border-line-strong hover:text-ink-mid"}`}>
              <i aria-hidden
                className="h-2 w-2 flex-none rounded-full bg-[var(--h)] transition-opacity"
                style={{ opacity: drawing ? 1 : 0.42 }} />
              <span data-testid="column-chip-name">{leagueLabel(slug)}</span>
              {/* THE SHARED LIGHT, ON THE CHIP THAT CAUSES IT. Visible
                  because a reader choosing columns is the only person
                  who can act on it, and the sighted reader is the one
                  who will otherwise meet it as two columns they cannot
                  tell apart. */}
              {shares && (
                <i aria-hidden data-testid="column-chip-shares"
                  className="font-normal not-italic text-ink-faint">&asymp;</i>
              )}
              {/* EVERYTHING THE CHIP MEANS, IN WORDS. The pressed state
                  is carried by `aria-pressed`; what it cannot carry is
                  the count, the refusal and the shared hue. */}
              <span className="sr-only">
                {` — ${fixturePhrase(n)}`}
                {held
                  ? " — the board's last drawn column; it cannot be taken off"
                  : drawing ? " — drawn; press to take it off the board"
                    : " — not drawn; press to put it back on the board"}
                {shares
                  ? ` — shares its colour with ${leagueLabel(shares)}, `
                    + "which is drawn near enough to sit beside it"
                  : ""}
              </span>
            </button>
          );
        })}

        {/* BACK TO THE DECLARATION, IN ONE PRESS. Drawn only when there
            is something to undo, so the default board carries no control
            that does nothing. */}
        {undrawn.length > 0 && (
          <button type="button" data-testid="column-chooser-reset"
            onClick={() => onChange(slugs)}
            className="flex flex-none items-center rounded-full border border-dashed border-line px-3 py-1.5 font-mono text-[11px] uppercase leading-none tracking-[0.06em] whitespace-nowrap text-ink-low transition-colors hover:border-line-strong hover:text-ink-mid">
            draw all {slugs.length}
          </button>
        )}
      </div>
    </details>
  );
}

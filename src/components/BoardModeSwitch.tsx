/** THE BOARD'S MODE SWITCH — Leagues | Cups | Nations (2026-10-12).
 *
 *  It was Leagues | Championships from 2026-09-24. Son's naming decision
 *  of 2026-10-07 (roadmap 05b) made it three: "Championships" reads
 *  "Nations" — IN THE UI ONLY: the national board is still fetched from
 *  `/api/championships/*` and the backend routes keep their names — and a
 *  Cups tab sits between the two. Cups is a separate TAB, not columns on
 *  the Leagues board: the board's columns stay Son's declaration
 *  (memory `board-columns-are-declared`).
 *
 *  The field page's Leagues | Cups switch (components/PinnedPassField.tsx
 *  `ModeSwitch`), part for part: the board's filled ground, its hairline,
 *  gold for the live choice, 10px outer and 7px inner radius. It is a
 *  sibling rather than a reuse because the two switch different things —
 *  that one what a page RATES, this one which BOARD the landing page is —
 *  and a shared component would have to be told which sentence to say
 *  about itself.
 *
 *  `aria-pressed`, not a tablist: the two modes are two boards with two
 *  reads behind them, not two panels of one, exactly as on the field
 *  page. */
export type BoardMode = "leagues" | "cups" | "nations";

export const BOARD_MODES: readonly BoardMode[] = ["leagues", "cups", "nations"];

const LABEL: Record<BoardMode, string> = {
  leagues: "Leagues",
  cups: "Cups",
  nations: "Nations",
};

/** A REMEMBERED CHOICE, READ BACK. "championships" is what this switch
 *  wrote to storage until 2026-10-12; a viewer who left on that board
 *  comes back to it under its new name rather than being dropped on
 *  Leagues. Anything unrecognised is Leagues. */
export function boardModeFrom(stored: string | null): BoardMode {
  if (stored === "championships" || stored === "nations") return "nations";
  if (stored === "cups") return "cups";
  return "leagues";
}

export function BoardModeSwitch({ mode, onChange }: {
  mode: BoardMode; onChange: (m: BoardMode) => void;
}) {
  return (
    <div data-testid="board-mode" className="mt-4 flex justify-center max-md:mt-3">
      <div role="group" aria-label="which board this page shows"
        className="inline-flex gap-[3px] rounded-[10px] border border-line bg-bs-elev2 p-[3px]">
        {BOARD_MODES.map((m) => (
          <button key={m} type="button" data-testid={`board-mode-${m}`}
            data-mode={m} aria-pressed={mode === m} onClick={() => onChange(m)}
            className={`rounded-[7px] border px-[18px] py-[9px] font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              mode === m ? "border-accent bg-bs text-ink-hi"
                // ink-mid, not ink-low (2026-10-03): 11px on bs-elev2 was
                // ~4.3:1, under AA, and the unpressed label is the only
                // cue that the other board exists
                : "border-transparent text-ink-mid hover:text-ink-hi"}`}>
            {LABEL[m]}
          </button>
        ))}
      </div>
    </div>
  );
}

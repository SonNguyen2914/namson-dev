/** THE BOARD'S MODE SWITCH — Leagues | Championships (2026-09-24).
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
export type BoardMode = "leagues" | "championships";

export const BOARD_MODES: readonly BoardMode[] = ["leagues", "championships"];

const LABEL: Record<BoardMode, string> = {
  leagues: "Leagues",
  championships: "Championships",
};

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
                : "border-transparent text-ink-low hover:text-ink-hi"}`}>
            {LABEL[m]}
          </button>
        ))}
      </div>
    </div>
  );
}

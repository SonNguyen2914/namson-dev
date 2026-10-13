// THE BOARD'S CUPS TAB — Continental | Domestic (cups plan Phase A,
// 2026-10-12).
//
// A BOARD SINCE 2026-10-12, NOT A LIST. Son: "make the cup page the same
// as the Nation and Leagues page". The cups the backend builds are drawn
// by the landing page's OWN board (pages/bet-suggester/index.tsx): the
// same columns, cards, model-vs-market lines, finished tail and hub links
// as Leagues and Nations, read from `GET /api/picker/board?leagues=…`.
// This file keeps the two parts that belong to the tab alone:
//
//  - the Continental | Domestic switch. It chooses which cup COLUMNS the
//    board draws and asks for nothing. Both halves come from one read.
//  - the COMING list: cups the backend does not build yet. Each is named,
//    and that is all: no count, no date, never a zero (lib/cupsTab.ts
//    says why).
//
// The switch is the board's own mode switch, part for part, one size
// down. `aria-pressed`, as on both other switches.
import { CupScope, comingCups } from "../lib/cupsTab";

const SCOPES: ReadonlyArray<readonly [CupScope, string]> = [
  ["continental", "Continental"], ["domestic", "Domestic"],
];

export function CupsScopeSwitch({ scope, onChange }: {
  scope: CupScope; onChange: (s: CupScope) => void;
}) {
  return (
    <div data-testid="cups-tab" data-scope={scope}
      className="mt-3 flex justify-center max-md:mt-2">
      <div role="group" aria-label="which cups this tab shows"
        className="inline-flex gap-[3px] rounded-[9px] border border-line bg-bs-elev2 p-[3px]">
        {SCOPES.map(([s, word]) => (
          <button key={s} type="button" data-testid={`cups-scope-${s}`}
            aria-pressed={scope === s} onClick={() => onChange(s)}
            className={`rounded-[6px] border px-[14px] py-[7px] font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
              scope === s ? "border-accent bg-bs text-ink-hi"
                : "border-transparent text-ink-mid hover:text-ink-hi"}`}>
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The cups of one half that have no board data yet: named, nothing else. */
export function CupsComing({ scope }: { scope: CupScope }) {
  const coming = comingCups(scope);
  if (coming.length === 0) return null;
  return (
    <div data-testid="cups-coming-block" className="mx-auto mt-8 max-w-5xl">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        coming · no board data yet
      </h2>
      <ul data-testid="cups-coming"
        className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {coming.map((c) => (
          <li key={c.key} data-testid="cup-coming" data-cup={c.key}
            className="flex min-w-0 items-center gap-2.5 rounded-lg border border-dashed border-line px-3.5 py-2.5">
            <i aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full border border-ink-faint" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] text-ink-mid">{c.name}</span>
              <span className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                {c.region}
              </span>
            </span>
            <span className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
              coming
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

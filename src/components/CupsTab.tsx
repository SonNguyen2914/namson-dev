// THE BOARD'S CUPS TAB — Continental | Domestic (cups plan Phase A,
// 2026-10-12).
//
// A list, not a board. Each cup that already has pages links to them;
// every other cup is named as "coming" and carries nothing else — no
// count, no date, and never a zero (lib/cupsTab.ts says why). Nothing on
// this tab is fetched, so opening it costs the backend nothing.
//
// The Continental | Domestic switch is the board's own mode switch, part
// for part, one size down: it chooses which half of THIS tab is shown,
// not which board the page is. `aria-pressed`, as on both other switches.
import Link from "next/link";
import { useState } from "react";
import { hueOf } from "../lib/leagueHue";
import { CUPS, CupEntry, CupScope } from "../lib/cupsTab";

const SCOPES: ReadonlyArray<readonly [CupScope, string]> = [
  ["continental", "Continental"], ["domestic", "Domestic"],
];

export function CupsTab() {
  const [scope, setScope] = useState<CupScope>("continental");
  const list = CUPS[scope];
  const live = list.filter((c) => c.links?.length);
  const coming = list.filter((c) => !c.links?.length);
  return (
    <section data-testid="cups-tab" data-scope={scope} className="mt-6 max-md:mt-4">
      <div className="flex justify-center">
        <div role="group" aria-label="which cups this tab shows"
          className="inline-flex gap-[3px] rounded-[9px] border border-line bg-bs-elev2 p-[3px]">
          {SCOPES.map(([s, word]) => (
            <button key={s} type="button" data-testid={`cups-scope-${s}`}
              aria-pressed={scope === s} onClick={() => setScope(s)}
              className={`rounded-[6px] border px-[14px] py-[7px] font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                scope === s ? "border-accent bg-bs text-ink-hi"
                  : "border-transparent text-ink-mid hover:text-ink-hi"}`}>
              {word}
            </button>
          ))}
        </div>
      </div>

      <ul data-testid="cups-live"
        className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((c) => <LiveCup key={c.key} cup={c} />)}
      </ul>

      {coming.length > 0 && (
        <div className="mx-auto mt-8 max-w-5xl">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
            coming · no page or data yet
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
      )}

      <p className="mx-auto mt-8 max-w-3xl text-center text-[12px] leading-relaxed text-ink-low">
        Each cup with a page is read there. No model ranks a cup on this
        site yet, and nothing here is a recommendation: a read, not a
        signal · shadow · not advice.
      </p>
    </section>
  );
}

function LiveCup({ cup }: { cup: CupEntry }) {
  const links = cup.links ?? [];
  return (
    <li data-testid="cup-live" data-cup={cup.key}
      className="flex min-w-0 flex-col gap-3 rounded-[10px] border border-line bg-bs-elev2 p-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <i aria-hidden className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: hueOf(cup.key) }} />
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink-hi">
          {cup.name}
        </span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        {cup.region}
      </span>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} data-testid="cup-link"
            className="inline-flex items-center rounded-md border border-line px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid hover:border-accent hover:text-ink-hi"
            style={{ minHeight: "var(--tap-floor)" }}>
            {l.label} →
          </Link>
        ))}
      </div>
    </li>
  );
}

// One verified piece of Analyst text: plain words, numbers rendered from the
// fact sheet with a ✓ and their source in the tooltip, and anything that
// failed verification shown as a flag, never as a number.
import type { Rendered } from "../../lib/analyst/analyst";
import type { Fact } from "../../lib/analyst/factSheet";
import { displayValue } from "../../lib/analyst/factSheet";

export const sourceTip = (label: string, source: string, id: string) =>
  `Verified ✓ ${label} · source: ${source} (${id})`;

export function Checked({ text, tip }: { text: string; tip: string }) {
  return (
    <span data-testid="analyst-fact" title={tip}
      className="cursor-help whitespace-nowrap tabular-nums text-ink-hi underline decoration-accent/40 decoration-dotted underline-offset-2">
      {text}<span aria-hidden className="ml-0.5 align-[0.15em] font-mono text-[9px] text-accent">✓</span>
    </span>
  );
}

export function Verified({ r }: { r: Rendered }) {
  return (
    <>
      {r.segments.map((s, i) =>
        s.type === "text" ? <span key={i}>{s.text}</span>
        : s.type === "fact" ? <Checked key={i} text={s.text} tip={sourceTip(s.label, s.source, s.factId)} />
        : <span key={i} data-testid="analyst-flag" title={s.reason}
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-warn">{s.text}</span>)}
    </>
  );
}

/** Trivela's own numbers, for when the written read is not there. */
export function RawFacts({ facts, limit = 8 }: { facts: Fact[]; limit?: number }) {
  if (facts.length === 0) {
    return <p className="text-[13px] text-ink-low">Trivela has no model numbers for this match yet.</p>;
  }
  return (
    <ul data-testid="analyst-raw" className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
      {facts.slice(0, limit).map((f) => (
        <li key={f.id} className="flex items-baseline justify-between gap-3 border-b border-line pb-1.5 text-[13px]">
          <span className="min-w-0 text-ink-low">{f.label}</span>
          <Checked text={displayValue(f)} tip={sourceTip(f.label, f.source, f.id)} />
        </li>
      ))}
    </ul>
  );
}

// HOW THE ANALYST WORKS — the prompt-engineering view, on
// /bet-suggester/analyst only: the five steps, the fact sheet the model was
// given (Source A), each attempt it made and what the verifier said about
// it, and the system prompt exactly as it was sent.
import type { PreviewOut } from "../../lib/analyst/analyst";
import { displayValue } from "../../lib/analyst/factSheet";

const STEPS: [string, string][] = [
  ["1 · Fact sheet", "Every number Trivela has for the match, each with an id (F1, F2…)."],
  ["2 · Persona", "A plain-spoken analyst for fans. Analysis, never betting advice."],
  ["3 · Template + example", "Strict JSON in a fixed shape, with one worked example."],
  ["4 · Verification ladder", "Numbers only as {{F#}} ids. The server renders and checks every one."],
  ["5 · Refine once", "Failures go back to the model for one rewrite; anything left is removed and flagged."],
];

const H = "mt-5 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low";

export default function HowItWorks({ preview }: { preview: PreviewOut | null }) {
  const trace = preview?.trace ?? [];
  return (
    <details data-testid="how-it-works" className="mt-5 rounded-xl border border-line bg-elev2">
      <summary className="cursor-pointer px-4 py-3 text-[15px] font-medium text-ink-hi transition-colors hover:text-accent">
        <span className="mr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">prompt engineering</span>
        How the Analyst works
      </summary>
      <div className="border-t border-line px-4 pb-4 pt-3">
        <ol className="grid gap-2 sm:grid-cols-5">
          {STEPS.map(([t, d]) => (
            <li key={t} className="rounded-lg border border-line bg-bs p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{t}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-mid">{d}</p>
            </li>
          ))}
        </ol>
        {!preview && <p className="mt-4 text-[13px] text-ink-low">Pick a match to see its fact sheet, the prompt and the checks.</p>}
        {preview && (
          <>
            <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
              provider {preview.provider || "—"} {preview.model} · attempts {trace.length} · flagged after checks {trace.at(-1)?.violations.length ?? 0}
              {preview.cached ? " · served from cache" : ""}
            </p>
            {trace.map((t) => (
              <div key={t.attempt}>
                <p className={H}>
                  Attempt {t.attempt}: {t.violations.length
                    ? `${t.violations.length} unverified → ${t.attempt === 1 ? "sent back for a rewrite" : "removed and flagged"}`
                    : "all numbers verified"}
                </p>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-bs p-3 font-mono text-[11px] leading-relaxed text-ink-mid">{t.raw}</pre>
              </div>
            ))}
            <p className={H}>Fact sheet (Source A) · {preview.sheet.facts.length} numbers</p>
            <div className="max-h-80 overflow-auto rounded-lg border border-line">
              <table className="w-full text-left text-[12px]">
                <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-low">
                  <tr><th className="px-2 py-1.5">Id</th><th className="px-2 py-1.5">Fact</th><th className="px-2 py-1.5">Value</th><th className="px-2 py-1.5">Source</th></tr>
                </thead>
                <tbody>
                  {preview.sheet.facts.map((f) => (
                    <tr key={f.id} className="border-t border-line">
                      <td className="px-2 py-1 font-mono text-ink-faint">{f.id}</td>
                      <td className="px-2 py-1 text-ink-mid">{f.label}</td>
                      <td className="px-2 py-1 font-mono tabular-nums text-ink-hi">{displayValue(f)}</td>
                      <td className="px-2 py-1 text-ink-low">{f.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.system && (
              <>
                <p className={H}>System prompt sent to the model</p>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-bs p-3 font-mono text-[11px] leading-relaxed text-ink-mid">{preview.system}</pre>
              </>
            )}
          </>
        )}
      </div>
    </details>
  );
}

import { FormEvent, useState } from "react";

export function QuizletExport({ courseSlug, configured }: { courseSlug: string; configured: boolean }) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(20);
  const [title, setTitle] = useState("");
  const [importText, setImportText] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async (event: FormEvent) => {
    event.preventDefault(); setWorking(true); setError(""); setCopied(false);
    try {
      const response = await fetch("/api/study-hub/quizlet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, topic: topic.trim(), count }),
      });
      const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
      if (!response.ok || typeof payload?.importText !== "string" || typeof payload.title !== "string") {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Could not create the Quizlet set");
      }
      setTitle(payload.title); setImportText(payload.importText);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not create the Quizlet set"); }
    finally { setWorking(false); }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(importText); setCopied(true);
  };

  return (
    <section className="mt-12 rounded-2xl border border-line bg-elev p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Quizlet export</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-ink-hi">Turn indexed sources into a set</h2>
        </div>
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low">Review first</span>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-mid">
        Generate source-grounded term/definition cards, copy them, then use Quizlet&apos;s supported website import. Study Hub never publishes to your account without your review.
      </p>
      <form onSubmit={generate} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={200}
          disabled={!configured || working} aria-label="Quizlet set topic" placeholder="Topic (optional)"
          className="rounded-lg border border-line bg-bs px-3 py-2.5 text-sm text-ink-hi outline-none placeholder:text-ink-faint focus:border-accent/60 disabled:opacity-50" />
        <select value={count} onChange={(event) => setCount(Number(event.target.value))} disabled={!configured || working}
          aria-label="Number of cards" className="rounded-lg border border-line bg-bs px-3 py-2.5 text-sm text-ink-mid outline-none disabled:opacity-50">
          {[10, 20, 30, 50].map((value) => <option key={value} value={value}>{value} cards</option>)}
        </select>
        <button type="submit" disabled={!configured || working}
          className="rounded-lg bg-accent px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bs disabled:opacity-40">
          {working ? "Generating…" : "Generate"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-neg" role="alert">{error}</p>}
      {importText && (
        <div className="mt-6 rounded-xl border border-line bg-bs p-4">
          <p className="text-sm font-medium text-ink-hi">{title}</p>
          <p className="mt-1 text-xs text-ink-low">One tab-separated card per line. Review the text before publishing.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="rounded-lg border border-accent/30 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.13em] text-accent">
              {copied ? "Copied" : "Copy cards"}
            </button>
            <a href="https://quizlet.new" target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.13em] text-ink-mid hover:text-ink-hi">
              Open Quizlet import ↗
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

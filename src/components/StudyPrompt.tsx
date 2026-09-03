import { FormEvent, useState } from "react";

type Draft = {
  id: number;
  prompt: string;
  answer: string;
  provider: string;
};

export function StudyPrompt({
  courseSlug,
  configured,
}: {
  courseSlug: string;
  configured: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || !configured) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/study-hub/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, prompt: cleanPrompt }),
      });
      const payload = await response.json().catch(() => null) as
        | { answer?: unknown; provider?: unknown; error?: unknown }
        | null;
      const answer = payload?.answer;
      const provider = payload?.provider;
      if (
        !response.ok ||
        typeof answer !== "string" ||
        typeof provider !== "string"
      ) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "The study draft could not be generated",
        );
      }

      setDrafts((current) => [
        ...current,
        {
          id: Date.now(),
          prompt: cleanPrompt,
          answer,
          provider,
        },
      ]);
      setPrompt("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The study draft could not be generated",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-elev p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Live prompt
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-ink-hi">
            Work through a question
          </h2>
        </div>
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low">
          {configured ? "Draft mode" : "Not configured"}
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-mid">
        This assistant does not automatically read Drive, NotebookLM, or private notes. Include the context you want it to use, then verify the response against your course sources.
      </p>

      {drafts.length > 0 && (
        <div className="mt-8 space-y-4" aria-live="polite">
          {drafts.map((draft) => (
            <article key={draft.id} className="rounded-xl border border-line bg-bs p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                Question
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-mid">{draft.prompt}</p>
              <div className="my-5 h-px bg-line" />
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                  Unreviewed draft
                </p>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                  {draft.provider}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-hi">
                {draft.answer}
              </p>
            </article>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="mt-8">
        <label
          htmlFor="study-prompt"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low"
        >
          Prompt
        </label>
        <textarea
          id="study-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={!configured || submitting}
          maxLength={4_000}
          rows={5}
          placeholder={
            configured
              ? "Explain a concept, compare two ideas, or check your reasoning…"
              : "Configure a server-side provider to enable prompting."
          }
          className="mt-3 w-full resize-y rounded-xl border border-line bg-bs px-4 py-3 text-sm leading-6 text-ink-hi outline-none transition-colors placeholder:text-ink-faint focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-low">
            Responses stay in this browser session and are never written to notes automatically.
          </p>
          <button
            type="submit"
            disabled={!configured || submitting || !prompt.trim()}
            className="rounded-lg bg-accent px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-bs transition-opacity disabled:opacity-40"
          >
            {submitting ? "Thinking…" : "Create draft"}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-neg" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}

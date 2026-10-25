// ASK THE ANALYST: one question about one match, answered from Trivela's
// fact sheet for it and verified the same way as the preview. Public and
// capped on the server (5 per visitor per hour, 300 LLM calls a day); at a
// cap the server's own sentence is shown as it is (a 429), never an error.
import { useState } from "react";
import type { AskOut } from "../../lib/analyst/analyst";
import { Verified } from "./Verified";

export const SUGGESTED = [
  "Why does the model lean this way?",
  "How likely is a draw?",
  "Does the market agree with Trivela?",
  "Will both teams score?",
];

export default function AskAnalyst({ league, eventId, demo }: {
  league: string; eventId?: string | null; demo?: string;
}) {
  const [q, setQ] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<{ q: string; out: AskOut } | null>(null);
  const [note, setNote] = useState<{ text: string; cap: boolean } | null>(null);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || asking) return;
    setAsking(true); setNote(null);
    try {
      const r = await fetch("/api/analyst/ask", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ league, id: eventId ?? "", demo, question: text }),
      });
      const d = await r.json().catch(() => null);
      if (r.status === 429) {
        setNote({ text: typeof d?.error === "string" ? d.error : "VAR has answered a lot this hour. Try again later.", cap: true });
      } else if (!r.ok || !d) {
        setNote({ text: typeof d?.error === "string" ? d.error.slice(0, 160) : "VAR could not answer just now.", cap: false });
      } else {
        setAnswer({ q: text, out: d as AskOut }); setQ("");
      }
    } catch {
      setNote({ text: "VAR could not be reached just now.", cap: false });
    } finally {
      setAsking(false);
    }
  }

  return (
    <section data-testid="ask-analyst" aria-label="Ask VAR" className="mt-5 rounded-xl border border-line bg-elev2 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Ask VAR</p>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={300}
          aria-label="Your question about this match" placeholder="Ask VAR about this match…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-bs px-3 py-2 text-[14px] text-ink-hi placeholder:text-ink-faint focus:border-accent/50 focus:outline-none" />
        <button type="submit" disabled={asking || !q.trim()}
          className="shrink-0 rounded-md border border-accent/50 bg-accent/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20 disabled:opacity-50">
          {asking ? "Thinking…" : "Ask"}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button key={s} type="button" disabled={asking} onClick={() => { setQ(s); ask(s); }}
            className="rounded-md border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi disabled:opacity-50">
            {s}
          </button>
        ))}
      </div>
      {note && (
        <p data-testid={note.cap ? "ask-cap" : "ask-note"} role="status"
          className={`mt-3 text-[13px] ${note.cap ? "text-accent" : "text-ink-low"}`}>{note.text}</p>
      )}
      {answer && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">you asked · {answer.q}</p>
          <p data-testid="ask-answer" className="mt-1.5 text-[14px] leading-relaxed text-ink-mid">
            {answer.out.answer ? <Verified r={answer.out.answer} />
              : <span className="text-ink-low">No answer this time ({answer.out.fallbackReason ?? "try again"}).</span>}
          </p>
        </div>
      )}
      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
        questions are capped per hour · answers use only Trivela&apos;s numbers · not betting advice
      </p>
    </section>
  );
}

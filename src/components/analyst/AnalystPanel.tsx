// THE TRIVELA VAR PANEL (Verified Analyst Read; the code keeps its
// Analyst names): an AI-written read of one match, under the model's
// win/draw/loss on the match hub and at the centre of /bet-suggester/var.
//
// IT NEVER HOLDS THE PAGE UP. Nothing is fetched until the page has drawn
// (an effect, after an idle tick), the switch is read first and the panel
// draws nothing at all while it is off, and every failure ends in words or
// in Trivela's raw numbers — never a blank card and never an error dump.
// The match hub mounts it inside its own error boundary as well.
//
// Every number in the written read was rendered from the fact sheet or
// checked against it on the server (lib/analyst/verify.ts); each carries a
// ✓ and its source in the tooltip. Display only: nothing here is wired to
// an order, and the label says so.
import Link from "next/link";
import { useEffect, useState } from "react";
import type { PreviewOut } from "../../lib/analyst/analyst";
import { isAnalystLeague } from "../../lib/analyst/demos";
import { RawFacts, Verified } from "./Verified";
import { useAnalystStatus } from "./useAnalystStatus";

export const ANALYST_FOOTER = "Match prediction and analysis, not betting advice";

type Load =
  | { s: "loading" }
  | { s: "done"; out: PreviewOut }
  | { s: "failed"; why: string };

const CONF_TONE: Record<string, string> = {
  high: "border-accent/50 text-accent",
  medium: "border-line-strong text-ink-mid",
  low: "border-line text-ink-low",
};

export default function AnalystPanel({ league, eventId, demo, defaultOpen = false, askLink = false, onPreview }: {
  league: string;
  eventId?: string | null;
  demo?: string;
  defaultOpen?: boolean;
  /** show "ask about this match →" (the match hub; /var has Ask inline) */
  askLink?: boolean;
  onPreview?: (out: PreviewOut | null) => void;
}) {
  const status = useAnalystStatus();
  // the read is held WITH the query it answered, so a new match shows
  // "reading" until its own answer lands (no stale card, no reset effect)
  const [held, setLoad] = useState<Load & { qs?: string }>({ s: "loading" });
  const [open, setOpen] = useState(defaultOpen);
  const supported = isAnalystLeague(league) && (!!demo || !!eventId);
  const qs = demo ? `demo=${encodeURIComponent(demo)}`
    : `league=${encodeURIComponent(league)}&id=${encodeURIComponent(eventId ?? "")}`;

  useEffect(() => {
    if (status !== "on" || !supported) return;
    const ctl = new AbortController();
    let cancelled = false;
    // after the page: one idle tick, so the hub's own reads go first
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/analyst/preview?${qs}`, { signal: ctl.signal });
        const d = await r.json().catch(() => null);
        if (cancelled) return;
        if (!r.ok || !d || !d.sheet) {
          setLoad({ qs, s: "failed", why: r.status === 404 ? "VAR is switched off"
            : typeof d?.error === "string" ? d.error.slice(0, 140) : `it answered ${r.status}` });
          return;
        }
        setLoad({ qs, s: "done", out: d as PreviewOut });
        onPreview?.(d as PreviewOut);
      } catch (e) {
        if (!cancelled) setLoad({ qs, s: "failed", why: e instanceof Error && e.name === "AbortError" ? "it was stopped" : "it could not be reached" });
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); ctl.abort(); };
    // onPreview is a callback prop; re-reading on its identity would refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, supported, qs]);

  if (status !== "on" || !supported) return null;
  const load: Load = held.qs === qs ? held : { s: "loading" };

  const out = load.s === "done" ? load.out : null;
  const p = out?.ok ? out.preview : undefined;
  const fallback = out && !out.ok;

  return (
    <section data-testid="analyst-panel" data-state={load.s === "loading" ? "loading" : p ? "preview" : fallback ? "fallback" : "failed"}
      aria-label="Trivela VAR" className="mt-5 rounded-xl border border-line bg-elev2">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        data-testid="analyst-toggle"
        className="group flex w-full items-start gap-3 px-4 py-3 text-left">
        <span aria-hidden className={`mt-0.5 text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Trivela VAR</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">· verified analyst read · shadow · not advice</span>
            {/* VAR v2: after kickoff the read is the saved pre-kickoff rung, and says so */}
            {out?.sheet?.basis && (
              <span data-testid="analyst-basis" title={`The ${out.sheet.basis.rung} rung Trivela's archive saved before kickoff`}
                className="font-mono text-[9px] uppercase tracking-[0.14em] text-warn">· {out.sheet.basis.label}</span>
            )}
          </span>
          <span data-testid="analyst-headline" className="mt-1.5 block text-[15px] leading-snug text-ink-hi">
            {load.s === "loading" && <span className="text-ink-low">VAR is checking Trivela&apos;s numbers…</span>}
            {load.s === "failed" && <span className="text-ink-low">VAR could not read this match just now ({load.why}). The model&apos;s numbers above are unaffected.</span>}
            {fallback && <span className="text-ink-low">The written read is unavailable ({out.fallbackReason ?? "no reply"}). Here are Trivela&apos;s own numbers.</span>}
            {p && <Verified r={p.headline} />}
          </span>
        </span>
        {!open && (
          <span aria-hidden className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">show</span>
        )}
      </button>

      {open && (
        <div data-testid="analyst-body" className="border-t border-line px-4 pb-4 pt-3">
          {load.s === "loading" && (
            <div className="space-y-2" role="status" aria-label="loading">
              <div className="skel h-4 w-3/4" aria-hidden />
              <div className="skel h-4 w-2/3" aria-hidden />
            </div>
          )}
          {p && (
            <div className="space-y-4 text-[14px] leading-relaxed text-ink-mid">
              {p.why.length > 0 && (
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">why</p>
                  <ul className="space-y-1.5">{p.why.map((r, i) => <li key={i} className="flex gap-2"><span aria-hidden className="text-accent">·</span><span><Verified r={r} /></span></li>)}</ul>
                </div>
              )}
              {p.risks.length > 0 && (
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">what could make it wrong</p>
                  <ul className="space-y-1.5">{p.risks.map((r, i) => <li key={i} className="flex gap-2"><span aria-hidden className="text-ink-faint">·</span><span><Verified r={r} /></span></li>)}</ul>
                </div>
              )}
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">model vs market</p>
                <p><Verified r={p.market_view} /></p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">confidence</span>
                <span data-testid="analyst-confidence"
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${CONF_TONE[p.confidence] ?? CONF_TONE.low}`}>
                  {p.confidence}
                </span>
                {(p.why.concat(p.risks, [p.headline, p.market_view]).some((r) => r.flagged > 0)) && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-warn">some text could not be verified and was removed</span>
                )}
              </div>
            </div>
          )}
          {fallback && <RawFacts facts={out.sheet.facts} />}
          {load.s === "failed" && (
            <p className="text-[13px] text-ink-low">Nothing here is a claim about the match. Try again later.</p>
          )}
          <p className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
            <span data-testid="analyst-footer">{ANALYST_FOOTER} · ✓ = VAR-checked against Trivela&apos;s data{out?.cached ? " · cached" : ""}</span>
            {askLink && !demo && eventId && (
              <Link href={`/bet-suggester/var?league=${encodeURIComponent(league)}&id=${encodeURIComponent(eventId)}`}
                className="text-ink-low transition-colors hover:text-accent">ask VAR about this match →</Link>
            )}
          </p>
        </div>
      )}
    </section>
  );
}

// MLS match stat page — live per-event view (ESPN summary, 30s poll).
// Data-only like the rest of the MLS mode: stats and timeline, honestly
// labeled, no model overlay. Theme pinned to the MLS red regardless of
// the dashboard's currently-selected league mode.
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Eyebrow, Reveal } from "../../../components/ui";

type Side = { name?: string; abbrev?: string; logo?: string; score?: string };
type StatRow = { key: string; label: string; home?: string; away?: string };
type Ev = { minute?: string; type?: string; team?: string; text?: string;
  scoring?: boolean };
type Match = { id: string; date?: string; state?: string; detail?: string;
  minute?: string; venue?: string; home: Side; away: Side;
  stats: StatRow[]; events: Ev[] };

// the MLS mode theme, pinned locally (matches LEAGUES config on index)
const MLS_VARS = {
  "--accent": "#d50032",
  "--accent-dim": "rgba(213,0,50,0.35)",
  "--accent-faint": "rgba(213,0,50,0.10)",
  "--accent-ambient": "rgba(213,0,50,0.07)",
} as React.CSSProperties;

export default function MlsMatchPage() {
  const router = useRouter();
  const eventId = typeof router.query.eventId === "string"
    ? router.query.eventId : null;
  const [m, setM] = useState<Match | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    let alive = true;
    const load = () =>
      fetch(`/api/mls/match/${eventId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => { if (alive) { setM(d.match); setErr(false); } })
        .catch(() => alive && setErr(true));
    load();
    const poll = setInterval(load, 30000);
    return () => { alive = false; clearInterval(poll); };
  }, [eventId]);

  const live = m?.state === "in";
  return (
    <div style={MLS_VARS} className="min-h-screen bg-canvas px-4 py-10">
      <Head><title>
        {m ? `${m.home.abbrev} ${m.home.score}–${m.away.score} ${m.away.abbrev} · MLS` : "MLS match"}
      </title></Head>
      <div className="mx-auto max-w-2xl">
        <Link href="/bet-suggester"
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint hover:text-accent">
          ← mls dashboard
        </Link>

        {err && (
          <p className="mt-10 rounded-2xl border border-dashed border-line px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            match feed unavailable — retrying every 30s
          </p>
        )}

        {m && (
          <>
            <Reveal>
              <section className="mt-8 rounded-3xl border border-line bg-elev p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Eyebrow tone="accent">
                    {live ? `live · ${m.minute ?? ""}` : m.detail}
                  </Eyebrow>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                    {m.venue}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <TeamBlock s={m.home} />
                  <div className={`text-center font-mono text-3xl tabular-nums ${
                    live ? "text-accent" : "text-ink-hi"}`}>
                    {m.home.score}–{m.away.score}
                  </div>
                  <TeamBlock s={m.away} right />
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section className="mt-8">
                <Eyebrow className="mb-4" tone="accent">match stats · espn live</Eyebrow>
                {m.stats.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                    stats populate after kickoff
                  </p>
                ) : (
                  <div className="space-y-3">
                    {m.stats.map((s) => <StatBar key={s.key} s={s} />)}
                  </div>
                )}
              </section>
            </Reveal>

            <Reveal>
              <section className="mt-10">
                <Eyebrow className="mb-4" tone="accent">timeline</Eyebrow>
                {m.events.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                    no key events yet
                  </p>
                ) : (
                  <div className="divide-y divide-line rounded-2xl border border-line">
                    {m.events.map((e, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                        <span className="w-10 shrink-0 font-mono text-[11px] text-ink-faint">
                          {e.minute}
                        </span>
                        <span className={`shrink-0 font-mono text-[11px] uppercase tracking-wide ${
                          e.scoring ? "text-accent" : "text-ink-low"}`}>
                          {e.scoring ? "⚽ " : ""}{e.type}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-ink-low">
                          {e.text || e.team}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </Reveal>

            <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
              data only · no model overlay — the engine adaptation is gated
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function TeamBlock({ s, right = false }: { s: Side; right?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${right ? "flex-row-reverse text-right" : ""}`}>
      {s.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink-hi">{s.name}</p>
        <p className="font-mono text-[10px] uppercase text-ink-faint">{s.abbrev}</p>
      </div>
    </div>
  );
}

function StatBar({ s }: { s: StatRow }) {
  const h = parseFloat(s.home ?? "");
  const a = parseFloat(s.away ?? "");
  const ok = Number.isFinite(h) && Number.isFinite(a) && h + a > 0;
  const hw = ok ? (h / (h + a)) * 100 : 50;
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[11px] tabular-nums">
        <span className="text-ink-hi">{s.home ?? "—"}</span>
        <span className="text-[10px] uppercase tracking-[0.15em] text-ink-faint">{s.label}</span>
        <span className="text-ink-hi">{s.away ?? "—"}</span>
      </div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        <div className="rounded-full bg-accent/75" style={{ width: `${hw}%` }} />
        <div className="flex-1 rounded-full bg-elev2" />
      </div>
    </div>
  );
}

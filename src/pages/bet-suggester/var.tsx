// /bet-suggester/var — TRIVELA VAR'S OWN PAGE (2026-10-24; renamed from
// the Trivela Analyst and /bet-suggester/analyst on 2026-10-25. The old
// address is a permanent redirect in next.config.ts, query string kept).
//
// The page used in class: a league picker with the three saved demo
// matches, VAR's panel opened, Ask, and the full "How it works"
// view (the fact sheet, each attempt and the prompt). The same panel sits
// collapsed under the model's win/draw/loss on the four league match hubs.
//
// SWITCHED BY ONE FLAG. /api/analyst/status reads ANALYST_ENABLED on the
// server; while it is off this page says so and reads nothing else.
//
// The upcoming fixtures for a league come through the site's existing
// league proxy (/api/<league>/schedule, LEAGUE_PROXY_ALLOWED) — no new
// proxy route. A demo match reads nothing but the saved payload.
//
// DECISION SAFETY (AGENTS.md §2): analysis, never advice. Every surface
// here carries the label, and nothing on it is wired to an order.
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { TopBar } from "../../components/chrome";
import { Eyebrow } from "../../components/ui";
import AnalystPanel, { ANALYST_FOOTER } from "../../components/analyst/AnalystPanel";
import AskAnalyst from "../../components/analyst/AskAnalyst";
import HowItWorks from "../../components/analyst/HowItWorks";
import { useAnalystStatus } from "../../components/analyst/useAnalystStatus";
import type { PreviewOut } from "../../lib/analyst/analyst";
import {
  ANALYST_LEAGUES, ANALYST_LEAGUE_NAMES, DEMO_MATCHES, isAnalystLeague,
  type AnalystLeague,
} from "../../lib/analyst/demos";

type Tab = "demo" | AnalystLeague;
type Sel = { league: AnalystLeague; id: string; demo?: string; home: string; away: string; date?: string };
type Fx = { id: string; date: string; home: string; away: string };
type Fixtures = { s: "loading" } | { s: "ok"; rows: Fx[] } | { s: "failed"; why: string };

const TABS: Tab[] = ["demo", ...ANALYST_LEAGUES];
const tabName = (t: Tab) => (t === "demo" ? "Demo" : ANALYST_LEAGUE_NAMES[t]);
// a fixed, viewer-independent date: the same on the server and the client
const day = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : "");

/** Upcoming fixtures out of a schedule payload, read defensively: the
 *  league planes send a list, or an object holding one. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function upcoming(d: any): Fx[] | null {
  const rows = Array.isArray(d) ? d
    : d && typeof d === "object" ? Object.values(d).find(Array.isArray) : null;
  if (!Array.isArray(rows)) return null;
  return rows
    .filter((x) => x && x.state === "pre" && /^\d{1,12}$/.test(String(x.id ?? "")))
    .slice(0, 10)
    .map((x) => ({ id: String(x.id), date: String(x.date ?? ""), home: String(x.home?.name ?? "Home"), away: String(x.away?.name ?? "Away") }));
}

export default function VarPage() {
  const router = useRouter();
  const status = useAnalystStatus();
  const [picked, setTab] = useState<Tab | null>(null);
  const [chosen, setSel] = useState<Sel | null>(null);
  const [fixtures, setFixtures] = useState<Record<string, Fixtures>>({});
  const [preview, setPreview] = useState<PreviewOut | null>(null);
  const asked = useRef(new Set<string>());

  // a deep link from a match hub (?league=epl&id=…) opens that match;
  // otherwise the first demo match. Derived, so nothing resets in an effect.
  const lg = router.query.league, qid = router.query.id;
  const deep: Sel | null = router.isReady && isAnalystLeague(lg)
    && typeof qid === "string" && /^\d{1,12}$/.test(qid)
    ? { league: lg, id: qid, home: "", away: "" } : null;
  const first = DEMO_MATCHES[0];
  const sel: Sel | null = status !== "on" || !router.isReady ? null
    : chosen ?? deep ?? { league: first.league, id: first.eventId, demo: first.slug, home: first.home, away: first.away, date: first.date };
  const tab: Tab = picked ?? (deep ? deep.league : "demo");

  // a league tab reads that league's upcoming fixtures, once; until the
  // answer lands the tab reads as loading
  useEffect(() => {
    if (status !== "on" || tab === "demo" || asked.current.has(tab)) return;
    asked.current.add(tab);
    const lgTab = tab;
    fetch(`/api/${lgTab}/schedule`)
      .then(async (r) => {
        const d = await r.json().catch(() => null);
        const rows = r.ok ? upcoming(d) : null;
        setFixtures((f) => ({ ...f, [lgTab]: rows ? { s: "ok", rows }
          : { s: "failed", why: r.ok ? "the schedule was not a fixture list" : `the schedule answered ${r.status}` } }));
      })
      .catch(() => setFixtures((f) => ({ ...f, [lgTab]: { s: "failed", why: "the schedule could not be reached" } })));
  }, [tab, status]);

  const list: { s: Sel; key: string }[] = tab === "demo"
    ? DEMO_MATCHES.map((d) => ({ key: `demo:${d.slug}`, s: { league: d.league, id: d.eventId, demo: d.slug, home: d.home, away: d.away, date: d.date } }))
    : (() => { const f = fixtures[tab]; return f?.s === "ok" ? f.rows.map((x) => ({ key: `${tab}:${x.id}`, s: { league: tab, id: x.id, home: x.home, away: x.away, date: x.date } })) : []; })();
  const fx: Fixtures | null = tab === "demo" ? null : fixtures[tab] ?? { s: "loading" };
  const selKey = sel ? (sel.demo ? `demo:${sel.demo}` : `${sel.league}:${sel.id}`) : "";
  const home = sel?.home || preview?.sheet.match.home || "";
  const away = sel?.away || preview?.sheet.match.away || "";

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head>
        <title>Trivela VAR · namson.dev</title>
        <meta name="description" content="Trivela VAR (Verified Analyst Read): an AI soccer analyst that explains Trivela's match predictions in plain English. Every number goes to VAR: each one is checked against Trivela's data." />
      </Head>
      <TopBar back={{ href: "/bet-suggester", label: "board" }} title="var" />

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10">
        <Eyebrow tone="accent">AI · shadow · not advice</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-tight text-ink-hi [font-family:var(--font-archivo)] [font-stretch:80%] sm:text-4xl">
          Trivela VAR
        </h1>
        <p data-testid="var-expansion" className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
          Verified Analyst Read
        </p>
        <p data-testid="var-tagline" className="mt-3 text-base font-medium text-ink-hi">
          Every number goes to VAR.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-low">
          An AI analyst that explains Trivela&apos;s match predictions in plain
          English, and proves every number it says: each one is checked
          against Trivela&apos;s own data and carries a ✓ with its source.
        </p>

        {status === "unknown" && <div className="skel mt-8 h-40 w-full" aria-hidden />}

        {status === "off" && (
          <div data-testid="analyst-off" className="mt-8 rounded-xl border border-dashed border-line px-4 py-4">
            <p className="text-sm text-ink-mid">VAR is switched off right now.</p>
            <p className="mt-3">
              <Link href="/bet-suggester" className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                go to the picker board →
              </Link>
            </p>
          </div>
        )}

        {status === "on" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside aria-label="Pick a match">
              <div role="group" aria-label="League" className="flex flex-wrap gap-1.5">
                {TABS.map((t) => (
                  <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${tab === t
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi"}`}>
                    {tabName(t)}
                  </button>
                ))}
              </div>
              <div data-testid="analyst-matches" className="mt-3 flex flex-col gap-1.5">
                {fx?.s === "loading" && <div className="skel h-12 w-full" aria-hidden />}
                {fx?.s === "failed" && <p className="text-[12.5px] text-ink-low">Could not list upcoming matches ({fx.why}). The demo matches always work.</p>}
                {fx?.s === "ok" && fx.rows.length === 0 && <p className="text-[12.5px] text-ink-low">No upcoming {tabName(tab)} matches in the schedule.</p>}
                {list.map(({ s, key }) => (
                  <button key={key} type="button" aria-pressed={selKey === key} onClick={() => { setSel(s); setPreview(null); }}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${selKey === key
                      ? "border-accent/50 bg-accent/5" : "border-line hover:border-line-strong"}`}>
                    <span className="block text-[13.5px] font-semibold text-ink-hi [font-family:var(--font-archivo)] [font-stretch:95%]">{s.home} vs {s.away}</span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-low">
                      {ANALYST_LEAGUE_NAMES[s.league]}{day(s.date) ? ` · ${day(s.date)}` : ""}{s.demo ? " · saved snapshot" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section aria-live="polite" className="min-w-0">
              {sel && (
                <>
                  <h2 data-testid="analyst-match" className="text-xl font-semibold uppercase text-ink-hi [font-family:var(--font-archivo)] [font-stretch:85%]">
                    {home && away ? `${home} vs ${away}` : "Match"}
                  </h2>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                    {ANALYST_LEAGUE_NAMES[sel.league]}{preview?.sheet.match.venue ? ` · ${preview.sheet.match.venue}` : ""}
                    {sel.demo ? " · saved pre-match snapshot" : ""}
                  </p>
                  <AnalystPanel key={selKey} league={sel.league} eventId={sel.id} demo={sel.demo}
                    defaultOpen onPreview={setPreview} />
                  <AskAnalyst key={`ask:${selKey}`} league={sel.league} eventId={sel.id} demo={sel.demo} />
                </>
              )}
              <HowItWorks preview={preview} />
            </section>
          </div>
        )}

        <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
          {ANALYST_FOOTER} · data: Trivela model runs, Kalshi prices and ESPN results
        </p>
      </main>
    </div>
  );
}

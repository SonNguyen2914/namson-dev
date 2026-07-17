// The Bot Arena — the paper-trading bots, each a betting philosophy,
// scored against the same real Kalshi books the model prices. Hypothetical
// money by design: this page is a strategy laboratory, not a broker.
// Ledger polls every 60s (the backend bot tick's cadence).
import Head from "next/head";
import { useEffect, useState } from "react";
import { api, pct, BotLedger, BotsResponse } from "../../lib/suggesterApi";
import { Eyebrow, Reveal } from "../../components/ui";
import { RouteProgress, TopBar } from "../../components/chrome";

const POLL_MS = 60 * 1000;

function money(v: number): string {
  const sign = v < 0 ? "−" : "";
  return `${sign}$${Math.abs(v).toFixed(2)}`;
}

function BotCard({ b, start }: { b: BotLedger; start: number }) {
  const net = b.net_pnl;
  const tone = net > 0.005 ? "text-accent" : net < -0.005 ? "text-neg" : "text-ink-mid";
  return (
    <Reveal>
      <section className="rounded-2xl border border-line bg-elev p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xl">{b.emoji} <span className="ml-1 text-xl font-semibold tracking-tight text-ink-hi">{b.name}</span></p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">{b.style}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`font-mono text-2xl tabular-nums ${tone}`}>{net >= 0 ? "+" : ""}{money(net).replace("−$", "-$")}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">net P&amp;L</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-low">{b.tagline}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-line bg-bs p-3 text-center">
          <div>
            <p className="font-mono text-sm tabular-nums text-ink-hi">{money(b.equity)}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">equity</p>
          </div>
          <div>
            <p className="font-mono text-sm tabular-nums text-ink-hi">{money(b.bankroll)}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">cash</p>
          </div>
          <div>
            <p className="font-mono text-sm tabular-nums text-ink-hi">{b.wins}–{b.trades - b.wins}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">record</p>
          </div>
        </div>

        {b.open.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
              holding · {b.open.length}
            </p>
            <ul className="space-y-1.5">
              {b.open.map((p) => (
                <li key={p.market_id} className="flex items-baseline gap-2 text-xs text-ink-mid">
                  <span className="min-w-0 flex-1 truncate" title={`${p.market_title} — ${p.note ?? ""}`}>{p.market_title}</span>
                  <span className="shrink-0 font-mono tabular-nums text-ink-low"
                    title={`${p.contracts} contracts bought at the ${pct(p.entry_price)} ask — each pays $1 if YES`}>
                    {money(p.cost)} → {money(p.contracts)} @ {pct(p.entry_price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {b.closed.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
              last trades
            </p>
            <ul className="space-y-1.5">
              {b.closed.slice(0, 5).map((p) => (
                <li key={`${p.market_id}-${p.closed_at}`} className="flex items-baseline gap-2 text-xs text-ink-mid">
                  <span className="min-w-0 flex-1 truncate" title={`${p.market_title} — ${p.close_reason}`}>{p.market_title}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase text-ink-faint">{p.close_reason}</span>
                  <span className={`shrink-0 font-mono tabular-nums ${(p.net ?? 0) > 0 ? "text-accent" : (p.net ?? 0) < 0 ? "text-neg" : "text-ink-low"}`}>
                    {(p.net ?? 0) >= 0 ? "+" : ""}{money(p.net ?? 0).replace("−$", "-$")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {b.open.length === 0 && b.closed.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-line px-3 py-4 text-center font-mono text-[11px] text-ink-faint">
            no positions yet — waiting for a market that fits
          </p>
        )}
      </section>
    </Reveal>
  );
}

export default function BotArena() {
  const [data, setData] = useState<BotsResponse | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const d = await api.bots();
        if (alive) { setData(d); setErr(""); }
      } catch {
        if (alive && !data) setErr("Couldn't reach the bot ledger.");
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bots = data?.bots ?? [];
  const ranked = [...bots].sort((a, b) => b.net_pnl - a.net_pnl);

  return (
    <>
      <Head><title>Bot Arena · WC26 Bet Suggester</title></Head>
      <RouteProgress />
      <TopBar back={{ href: "/bet-suggester", label: "dashboard" }}
        title="WC26 · Bot Arena" />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10">
        <Eyebrow>strategy laboratory</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-hi">
          Seven bots, seven philosophies
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-low">
          Paper money, real markets. Each bot bets the same Kalshi books the
          model prices — pre-match value, favourites, longshots, live
          momentum, live contrarian, and two exact-score recipes — with the
          same fee model as the strategy page. Every position starts from a ${data?.start_bankroll ?? 1000}
          {" "}bankroll. Nothing here is real money or advice; it&apos;s a
          scoreboard for instincts.
        </p>

        {err && <p className="mt-8 text-sm text-neg">{err}</p>}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {ranked.map((b) => (
            <BotCard key={b.bot} b={b} start={data?.start_bankroll ?? 1000} />
          ))}
        </div>
      </main>
    </>
  );
}

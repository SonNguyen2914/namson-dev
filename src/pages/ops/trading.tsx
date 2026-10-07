// /ops/trading — THE OPERATOR'S TRADING CONSOLE.
//
// Son, 2026-10-03: "I need to track what the trader doing." Redesigned
// 2026-10-07 from one long stack of sections into an operator application:
// a persistent status rail (the three-second answer — can it trade, is it
// killed or halted, is it ticking, is the feed healthy) and seven views —
// Overview, Trading, Portfolio, Trades, Performance, Model, System — under
// /ops/trading with a bare hash (`#trading`); the default view carries no
// hash. components/console/* holds the views; this file holds the token
// and the status read, exactly as before.
//
// THE TOKEN (option A). Typed into a password field and held in React
// state ONLY — never localStorage, sessionStorage, a cookie, an env var,
// the URL or the bundle. A reload forgets it. Without one the page shows
// the field and makes no request at all.
//
// ONE TOKEN PER VISIT (2026-10-03). The state is the tab's, held in
// components/OperatorToken.tsx above every page, so the token typed into
// the board's watch panel is already here after the Trading chip's
// client-side hop: it is used at once, with no debounce wait.
//
// THE POLL. The status every 15 s while a token is held, through
// lib/usePoll: no overlap, nothing while the tab is hidden, backoff after
// failures. A 403 stops the poll until the token changes. The last good
// read stays on screen after a failed one, with its age, never presented
// as current. The book, the candidates and the ledger are read only once
// the status has answered (components/console/useConsoleData.tsx).
//
// LINKED FOR THE OPERATOR ONLY. The header's Trading chip points here, and
// it is drawn only while the tab holds a token; a visitor's pages carry no
// link to it. noindex.
//
// EXPERIMENTAL, UNPROVEN. The agent's numbers are its own bookkeeping of a
// small, capped experiment. Nothing on this page is advice and nothing
// here is evidence of an edge.
import Head from "next/head";
import { useEffect, useState } from "react";
import { NavChip, RouteProgress, TopBar } from "../../components/chrome";
import { useOperatorToken } from "../../components/OperatorToken";
import { ConsoleApp } from "../../components/console/ConsoleApp";
import { ago } from "../../components/console/primitives";
import { useNow, useStatusRead } from "../../components/console/useConsoleData";

const TOKEN_DEBOUNCE_MS = 600;
const STALE_MS = 45_000;

export default function TradingConsole() {
  // the TAB's token, shared with the board (components/OperatorToken.tsx)
  const [token, setToken] = useOperatorToken();
  const typed = token.trim();
  // ARRIVING WITH A TOKEN IS NOT TYPING ONE: armed from the first render
  const [armed, setArmed] = useState(typed);
  const status = useStatusRead(armed);
  const read = status.source.read;
  const last = status.source.last;
  const now = useNow(last !== null, 1_000);

  // A REAL DEBOUNCE: every keystroke restarts the clock, so a half-typed
  // token is never sent. Clearing the field disarms at once and drops what
  // was read with the old token.
  useEffect(() => {
    if (typed === "") return;
    const t = setTimeout(() => setArmed(typed), TOKEN_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [typed]);
  const onToken = (v: string) => {
    setToken(v);
    if (v.trim() === "") {
      setArmed("");
      status.clear();
    }
  };

  const age = last ? now - last.at : 0;
  const stale = last !== null && (read.kind !== "ok" || age > STALE_MS);

  const tokenField = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <label htmlFor="watch-token" className="flex items-center gap-2">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low">
          operator token
        </span>
        <input id="watch-token" type="password" value={token}
          autoComplete="off" spellCheck={false}
          onChange={(e) => onToken(e.target.value)}
          className="h-7 w-44 max-w-full rounded-md border border-tc-line-strong bg-tc-raised px-2 font-mono text-[12px] text-ink-hi outline-none transition-colors hover:border-ink-faint focus-visible:ring-2 focus-visible:ring-accent" />
      </label>
      <span data-testid="ops-state" data-stale={stale || undefined}
        title={armed === "" ? "held in this tab only — a reload forgets it" : undefined}
        className={`tc-num text-[11.5px] ${stale ? "text-warn" : "text-ink-low"}`}>
        {armed === "" ? "this tab only"
          : read.kind === "idle" && !last ? "reading…"
          : last ? `last updated ${new Date(last.at).toLocaleTimeString()}`
            + (stale ? ` · stale, ${ago(age)} old` : "")
          : ""}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-tc-app font-sans text-ink-mid">
      <Head>
        <title>Trading console · namson.dev</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <RouteProgress />
      {/* THE WAY BACK TO EVERYTHING (Son, 2026-10-03): the logo goes home,
          the back arrow and the chips go to the board, the leagues and the
          field. The Trading chip itself is TopBar's, drawn — and lit as
          this page — only while the tab holds a token. */}
      {/* "← board" goes TO THE BOARD, the BOARD chip's own target — never
          history.back() (Son, 2026-10-07: it stepped back through every
          console view he had visited before reaching the board) */}
      <TopBar back={{ href: "/bet-suggester", label: "board", direct: true }}
        title="trading console" inner="max-w-[1760px] px-4 sm:px-6">
        <NavChip href="/bet-suggester">board</NavChip>
        <NavChip href="/bet-suggester/leagues">leagues</NavChip>
        <NavChip href="/bet-suggester/ratings">field</NavChip>
      </TopBar>

      {last ? (
        <ConsoleApp d={last.data} statusAt={last.at} statusRead={read}
          statusStale={stale} now={now} token={armed} bumpStatus={status.bump}
          tokenField={tokenField} />
      ) : (
        <main className="mx-auto max-w-[1760px] px-4 pb-24 pt-8 sm:px-6">
          <div className="max-w-xl">
            <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-ink-hi">Trading console</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-ink-low">
              Operator only
              <span title="What the trading agent is doing, from its own journal, and every open position and order on the account. No edge is claimed."
                className="rounded-[4px] border border-warn/30 px-1.5 py-[1px] text-[10.5px] font-medium uppercase tracking-[0.08em] text-warn/90">
                experimental · unproven · not advice
              </span>
            </p>
            <div className="mt-5 rounded-lg border border-tc-line bg-tc-panel px-4 py-4">
              {tokenField}
              {read.kind === "refused" && (
                <p data-testid="ops-refused" role="alert"
                  className="mt-3 rounded-md border border-neg/40 bg-neg/[0.06] px-3 py-2 text-[12.5px] text-neg">
                  token rejected — the backend refused it ({read.detail})
                </p>
              )}
              {read.kind === "not_ready" && (
                <p data-testid="ops-not-ready" role="alert"
                  className="mt-3 rounded-md border border-warn/40 px-3 py-2 text-[12.5px] text-warn">
                  trading plane not ready — {read.detail}
                </p>
              )}
              {read.kind === "error" && (
                <p data-testid="ops-error" role="alert"
                  className="mt-3 rounded-md border border-warn/40 px-3 py-2 text-[12.5px] text-warn">
                  the status read failed (HTTP {read.status}) — {read.detail}
                </p>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// THE CONSOLE'S SHELL (redesign, 2026-10-07): the operator status rail —
// the three-second answer — and the view navigation, both persistent
// above every view.
//
// THE RAIL IS CALM WHEN NORMAL. A normal state is a grey dot and ink text;
// only an abnormal one takes amber or red, and always with a word and a
// distinct dot shape (degraded ◆, broken ■, off ○). Each item is a link to
// where it is looked into.
import { type ReactNode, useEffect, useRef } from "react";
import type { AttentionItem } from "../../lib/consoleModel";
import { isObj, num, str } from "../../lib/tradingConsole";
import { Dot, StatusPill, type State, agoIso } from "./primitives";
import { VIEWS, type ViewKey, hrefOf } from "./route";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (isObj(v) ? v : null);

export interface RailItem {
  key: string; label: string; value: string; state: State; title: string; href?: string;
}

/** The rail's items, from the status read alone. */
export function railItems(d: Obj, now: number): RailItem[] {
  const halt = obj(d.halt);
  const ip = obj(d.in_play_trading);
  const learning = obj(d.learning);
  const last = obj(d.last_tick);
  const killed = d.kill === true;
  const halted = halt?.active === true;
  const items: RailItem[] = [];
  // TRADING: what stops it first
  let trading: [string, State, string];
  if (killed) trading = ["KILLED", "bad", "A kill is in force: nothing is placed."];
  else if (halted) trading = ["HALTED", "bad", `A loss halt holds (${str(halt?.reason) ?? "reason not sent"}).`];
  else if (d.enabled === false) trading = ["DISABLED", "warn", "TRADING_ENABLED is not true: the cancel-first pass only."];
  else if (d.paper_only === true) trading = ["PAPER ONLY", "warn", "TRADING_PAPER_ONLY: it runs and learns and sends no real order."];
  else if (d.enabled === true) trading = ["LIVE", "info", "Real orders may be placed inside the caps."];
  else trading = ["NOT STATED", "warn", "The status route did not say whether trading is enabled."];
  items.push({ key: "trading", label: "Trading", value: trading[0], state: trading[1], title: trading[2],
    href: hrefOf("overview", { focus: "safety" }) });
  // AGENT: is it ticking
  const lastAt = str(last?.at);
  const age = lastAt ? now - Date.parse(lastAt) : NaN;
  items.push(!last ? { key: "agent", label: "Agent", value: "NO TICK", state: "bad",
    title: "No tick on record.", href: hrefOf("system") }
    : !Number.isFinite(age) ? { key: "agent", label: "Agent", value: "CLOCK NOT SENT", state: "warn",
      title: "The newest tick has no readable time.", href: hrefOf("system") }
      : { key: "agent", label: "Agent", value: age > 120_000 ? "NOT TICKING" : "RUNNING",
        state: age > 120_000 ? "warn" : "info",
        title: "From the newest tick's clock: the loop ticks every 15 s; past 2 minutes this says not ticking.",
        href: hrefOf("system") });
  items.push({ key: "env", label: "Env", value: (str(d.env) ?? "not stated").toUpperCase(),
    state: str(d.env) ? "info" : "warn", title: "TRADING_ENV on the backend service" });
  // FEED (in play)
  const fh = ip?.feed_healthy;
  items.push({ key: "feed", label: "Feed", value: fh === true ? "HEALTHY" : fh === false ? "UNHEALTHY" : "—",
    state: fh === false ? (ip?.enabled === true ? "warn" : "off") : fh === true ? "info" : "off",
    title: "The live Kalshi price feed, as the newest in-play tick read it", href: hrefOf("trading", { tab: "inplay" }) });
  items.push({ key: "inplay", label: "In-play",
    value: ip?.enabled === true ? (ip.active === true ? "ACTIVE" : "ENABLED · IDLE") : ip?.enabled === false ? "OFF" : "—",
    state: ip?.enabled === true ? "info" : "off",
    title: "TRADING_INPLAY_ENABLED, and whether the newest in-play tick was active", href: hrefOf("trading", { tab: "inplay" }) });
  items.push({ key: "learning", label: "Learning",
    value: !learning ? "not on this backend" : typeof learning.error === "string" ? "READ FAILED"
      : learning.enabled === true ? "ON" : learning.enabled === false ? "OFF" : "—",
    state: learning && typeof learning.error === "string" ? "warn" : learning?.enabled === true ? "info" : "off",
    title: "TRADING_LEARNING_ENABLED — the learner's arms (experimental)", href: hrefOf("model") });
  items.push({ key: "tick", label: "Last tick", value: lastAt ? `${agoIso(lastAt, now)} ago` : "—",
    state: !lastAt ? "warn" : age > 120_000 ? "warn" : "info",
    title: lastAt ? `${lastAt}${num(last?.elapsed_s) !== null ? ` · took ${num(last?.elapsed_s)!.toFixed(1)} s` : ""} · outcome ${str(last?.outcome) ?? "not sent"}` : "no tick",
    href: hrefOf("system") });
  items.push({ key: "kill", label: "Kill", value: killed ? "ACTIVE" : d.kill === false ? "OFF" : "—",
    state: killed ? "bad" : d.kill === false ? "info" : "warn",
    title: killed ? "A kill is in force (TRADING_KILL or an operator kill — the status route does not say which)." : "No kill in force.",
    href: hrefOf("overview", { focus: "safety" }) });
  items.push({ key: "halt", label: "Halt", value: halted ? (str(halt?.reason) ?? "ACTIVE").replace(/_/g, " ").toUpperCase() : halt?.active === false ? "NONE" : "—",
    state: halted ? "bad" : halt?.active === false ? "info" : "warn",
    title: halted ? (str(halt?.rearm) ?? "") : "No loss halt holds.", href: hrefOf("overview", { focus: "safety" }) });
  return items;
}

/** THE RAIL'S CONTROLS MENU (quiet pass): while Safety & control is folded
 *  into the rail, its lift control and its how-to-stop words live here — a
 *  small disclosure, apart from the filters and the nav. Never drawn while
 *  the unfolded panel is on screen (one lift control on the page). */
function ControlsMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && ref.current?.open) ref.current.open = false; };
    const onDown = (e: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onDown); };
  }, []);
  return (
    <details ref={ref} data-testid="rail-controls" className="relative shrink-0">
      <summary className="flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-md border border-tc-line-strong px-2 py-1 text-[11.5px] text-ink-mid outline-none hover:bg-tc-hover hover:text-ink-hi focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
        Controls <span aria-hidden className="text-[9px] text-ink-faint">▾</span>
      </summary>
      <div className="absolute right-0 top-full z-50 mt-1 w-[min(380px,calc(100vw-32px))] space-y-2.5 rounded-lg border border-tc-line-strong bg-tc-panel p-3 shadow-2xl">
        {children}
      </div>
    </details>
  );
}

export function OperatorStatusBar({ d, now, attention, freshness, controls }: {
  d: Obj; now: number; attention: AttentionItem[]; freshness: ReactNode;
  /** the folded safety controls; null while the Safety panel is unfolded on screen */
  controls?: ReactNode;
}) {
  const items = railItems(d, now);
  const crit = attention.filter((a) => a.severity === "critical").length;
  const warn = attention.filter((a) => a.severity === "warning").length;
  return (
    <div data-testid="ops-strip" className="border-b border-tc-line bg-tc-app/95">
      <div className="mx-auto flex max-w-[1760px] items-center gap-3 px-4 py-1.5 sm:px-6">
        <div className="tc-scroll tap-floor-room flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" role="list" aria-label="operator status">
          {items.map((it) => (
            <span role="listitem" key={it.key}>
              <StatusPill testid={`rail-${it.key}`} state={it.state} label={it.label} value={it.value}
                title={it.title} href={it.href} />
            </span>
          ))}
        </div>
        {controls && <ControlsMenu>{controls}</ControlsMenu>}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <a href={hrefOf("overview", { focus: "attention" })} data-testid="rail-attention"
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[12px] outline-none hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent ${
              crit ? "text-neg" : warn ? "text-warn" : "text-ink-low"}`}>
            <Dot state={crit ? "bad" : warn ? "warn" : "info"} />
            {crit + warn === 0 ? "all clear" : `${crit + warn} attention`}
          </a>
          {freshness}
        </div>
      </div>
      <span className="sr-only">experimental, unproven · {str(d.label) ?? ""} · strategy {str(d.strategy) ?? "not stated"}</span>
    </div>
  );
}

export function ViewNav({ view, counts }: { view: ViewKey; counts: Partial<Record<ViewKey, ReactNode>> }) {
  return (
    <nav aria-label="console views" className="tc-scroll tap-floor-room -mb-px flex min-w-0 items-end gap-1 overflow-x-auto">
      {VIEWS.map((v) => {
        const on = v.key === view;
        return (
          <a key={v.key} href={hrefOf(v.key)} data-testid={`nav-${v.key}`} aria-current={on ? "page" : undefined}
            className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 pb-2.5 pt-2 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
              on ? "font-semibold text-ink-hi" : "text-ink-mid hover:text-ink-hi"}`}>
            {v.label}
            {counts[v.key] !== undefined && counts[v.key] !== null && (
              <span className="tc-num text-[11px] font-normal text-ink-low">{counts[v.key]}</span>
            )}
            <span aria-hidden className={`absolute inset-x-2 bottom-0 h-[2px] rounded-full ${on ? "bg-accent" : "bg-transparent"}`} />
          </a>
        );
      })}
    </nav>
  );
}

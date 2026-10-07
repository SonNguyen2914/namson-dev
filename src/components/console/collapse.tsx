// COLLAPSIBLE SECTIONS (Son, 2026-10-07: "sometimes I don't need all of
// that info").
//
// Every panel can fold to its header, and a folded header keeps a one-line
// summary of its key figures — so folding never hides a problem:
//
//   - the summary carries every amber or red state inside the section, with
//     its word and its shape (◆ degraded, ■ broken);
//   - a folded section whose amber/red state CHANGES unfolds itself. The
//     state it was folded under is remembered ("acknowledged"), so a
//     section the operator folds while an alarm holds stays folded until
//     that alarm changes — escalates, clears and returns, or a new one
//     appears;
//   - the unfolded Safety & control panel cannot fold while its alarm holds
//     (`lockOpen`), and the status rail is never foldable.
//
// The state is the VIEWER's: one map per browser, in localStorage, keyed
// `<view>:<section>`; every read and write is wrapped (a private window, a
// blocked store or a full quota leaves everything expanded, the default).
// Folding hides the body with `hidden` — nothing unmounts, so no read is
// repeated and no filter, sort, inline edit or drawer is lost.
import {
  type ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState,
} from "react";

export interface SumItem {
  /** the words (a figure, or a state) */
  t: ReactNode;
  /** an amber or red state: drawn with its shape, and it is an alarm */
  tone?: "warn" | "bad";
  /** what makes two alarms the SAME state (no counts or clocks in it):
   *  defaults to the text */
  key?: string;
}

/** the alarm a summary carries, as a stable signature ("" = none) */
export function alarmOf(items: SumItem[] | undefined): string {
  return (items ?? []).filter((i) => i.tone)
    .map((i) => `${i.tone}:${i.key ?? (typeof i.t === "string" ? i.t : "")}`)
    .sort().join("|");
}

interface Entry { c: boolean; a: string | null }
type Store = Record<string, Entry>;

const KEY = "trivela.console.collapsed.v1";

function load(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object" || Array.isArray(o)) return {};
    const out: Store = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (v && typeof v === "object" && typeof (v as Entry).c === "boolean") {
        const a = (v as Entry).a;
        out[k] = { c: (v as Entry).c, a: typeof a === "string" ? a : null };
      }
    }
    return out;
  } catch {
    /* SWALLOWED(console-collapse:load) — a viewer convenience: an
       unreadable store means every section is expanded, the default. */
    return {};
  }
}
function save(s: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* SWALLOWED(console-collapse:save) — a viewer convenience: a store
       that refuses the write only forgets the folds on reload. */
  }
}

interface Reg { lock: boolean; alarm: string }
interface Ctx {
  view: string;
  get: (id: string) => Entry | undefined;
  set: (id: string, e: Entry) => void;
  register: (id: string, r: Reg) => () => void;
  collapseAll: () => void;
  expandAll: () => void;
}
const CollapseCtx = createContext<Ctx | null>(null);

export function CollapseProvider({ view, children }: { view: string; children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => (typeof window === "undefined" ? {} : load()));
  const reg = useRef(new Map<string, Reg>());
  const write = useCallback((f: (s: Store) => Store) => {
    setStore((s) => {
      const n = f(s);
      save(n);
      return n;
    });
  }, []);
  const ctx = useMemo<Ctx>(() => ({
    view,
    get: (id) => store[id],
    set: (id, e) => write((s) => ({ ...s, [id]: e })),
    register: (id, r) => {
      reg.current.set(id, r);
      return () => { if (reg.current.get(id) === r) reg.current.delete(id); };
    },
    collapseAll: () => write((s) => {
      const n = { ...s };
      for (const [id, r] of reg.current) if (!r.lock) n[id] = { c: true, a: r.alarm || null };
      return n;
    }),
    expandAll: () => write((s) => {
      const n = { ...s };
      for (const id of reg.current.keys()) n[id] = { c: false, a: null };
      return n;
    }),
  }), [view, store, write]);
  return <CollapseCtx.Provider value={ctx}>{children}</CollapseCtx.Provider>;
}

export const useCollapseCtx = () => useContext(CollapseCtx);

/** "Collapse all · Expand all" for the view the provider holds */
export function CollapseAllControls() {
  const ctx = useCollapseCtx();
  if (!ctx) return null;
  const cls = "rounded px-1 text-[11.5px] text-ink-low outline-none hover:text-ink-hi focus-visible:ring-2 focus-visible:ring-accent";
  return (
    <div data-testid="collapse-controls" className="flex items-center gap-1">
      <button type="button" data-testid="collapse-all" className={cls} onClick={ctx.collapseAll}>Collapse all</button>
      <span aria-hidden className="text-[11px] text-ink-faint">·</span>
      <button type="button" data-testid="expand-all" className={cls} onClick={ctx.expandAll}>Expand all</button>
    </div>
  );
}

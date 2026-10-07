// SORTABLE TABLES (Son, 2026-10-07: "the console trade board need to be
// sortable").
//
// Every data table in the console sorts by its columns, the same way:
//
//   - a header is a button (Enter / Space); the first press sorts (text
//     A→Z, numbers and times largest / newest first), the second reverses,
//     the third returns to the BACKEND'S ORDER;
//   - the active header carries `aria-sort` and a small ▲ / ▼;
//   - rows sort by the underlying VALUE, never the display string: money
//     and counts as numbers, times as timestamps; a value that is missing
//     ("—", not sent, unsettled) sorts LAST in both directions and is never
//     read as 0;
//   - the sort is stable: ties keep the backend's order;
//   - the state lives above the views (ConsoleApp), so a poll, a view switch
//     or a fold never loses it, and a refresh re-sorts the new rows by the
//     same key; it is remembered per table, per viewer, in localStorage
//     (wrapped — a store that throws means the backend's order, the
//     default).
import {
  type ReactNode, createContext, useCallback, useContext, useMemo, useState,
} from "react";

export type SortVal = number | string | null;
export type ColType = "num" | "time" | "text";
export interface SortState { key: string; dir: "asc" | "desc" }

/** the value a time column sorts by: a timestamp, or null */
export const timeVal = (iso: unknown): number | null => {
  if (typeof iso !== "string" || iso === "") return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
};
/** the value a number column sorts by: a finite number, or null */
export const numVal = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
/** the value a text column sorts by: a non-empty string, or null */
export const textVal = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

/** STABLE, MISSING-LAST: the rows by one column's value. The backend's
 *  order breaks every tie (the index is the last key). */
export function sortRows<T>(rows: T[], sort: SortState | null,
  value: (r: T, key: string) => SortVal): T[] {
  if (!sort) return rows;
  const m = sort.dir === "asc" ? 1 : -1;
  return rows.map((r, i) => ({ r, i, v: value(r, sort.key) }))
    .sort((a, b) => {
      const an = a.v === null || (typeof a.v === "number" && !Number.isFinite(a.v));
      const bn = b.v === null || (typeof b.v === "number" && !Number.isFinite(b.v));
      if (an && bn) return a.i - b.i;
      if (an) return 1;            // missing last, whichever the direction
      if (bn) return -1;
      let c: number;
      if (typeof a.v === "number" && typeof b.v === "number") c = a.v - b.v;
      else c = collator.compare(String(a.v), String(b.v));
      return c !== 0 ? c * m : a.i - b.i;
    })
    .map((x) => x.r);
}

/** the next state of a header press: first → second (reversed) → none */
export function nextSort(cur: SortState | null, key: string, type: ColType): SortState | null {
  const first: SortState["dir"] = type === "text" ? "asc" : "desc";
  if (!cur || cur.key !== key) return { key, dir: first };
  if (cur.dir === first) return { key, dir: first === "asc" ? "desc" : "asc" };
  return null;
}

// ------------------------------------------------------------ the store

const KEY = "trivela.console.sort.v1";
type Store = Record<string, SortState>;

function load(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object" || Array.isArray(o)) return {};
    const out: Store = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      const s = v as SortState | null;
      if (s && typeof s.key === "string" && (s.dir === "asc" || s.dir === "desc")) out[k] = { key: s.key, dir: s.dir };
    }
    return out;
  } catch {
    /* SWALLOWED(console-sort:load) — a viewer convenience: an unreadable
       store means every table in the backend's order, the default. */
    return {};
  }
}
function save(s: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* SWALLOWED(console-sort:save) — a viewer convenience: a store that
       refuses the write only forgets the sorts on reload. */
  }
}

interface Ctx {
  get: (table: string) => SortState | null;
  set: (table: string, s: SortState | null) => void;
}
const SortCtx = createContext<Ctx | null>(null);

export function SortProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => (typeof window === "undefined" ? {} : load()));
  const set = useCallback((table: string, s: SortState | null) => {
    setStore((cur) => {
      // nothing changed: the same object, so nothing re-renders (an effect
      // that mirrors a sort here must never loop)
      const was = cur[table];
      if ((!s && !was) || (s && was && s.key === was.key && s.dir === was.dir)) return cur;
      const n = { ...cur };
      if (s) n[table] = s; else delete n[table];
      save(n);
      return n;
    });
  }, []);
  const ctx = useMemo<Ctx>(() => ({ get: (t) => store[t] ?? null, set }), [store, set]);
  return <SortCtx.Provider value={ctx}>{children}</SortCtx.Provider>;
}

/** one table's sort: its state, a press on a header, and a setter */
export function useTableSort(table: string) {
  const ctx = useContext(SortCtx);
  const [local, setLocal] = useState<SortState | null>(null);   // outside a provider
  const sort = ctx ? ctx.get(table) : local;
  // stable across store changes (ctx.set is), so an effect may depend on it
  const ctxSet = ctx?.set;
  const set = useCallback((s: SortState | null) => (ctxSet ? ctxSet(table, s) : setLocal(s)), [ctxSet, table]);
  const press = useCallback((key: string, type: ColType) => set(nextSort(sort, key, type)), [set, sort]);
  return { sort, press, set };
}

// ----------------------------------------------------------- the header

/** A SORTABLE HEADER CELL: a button inside the <th>, `aria-sort` on the
 *  <th> while it is the active column, ▲ / ▼ beside the word. */
export function SortTh({ label, k, type, sort, onSort, right = false, className = "", testid, title }: {
  label: ReactNode; k: string; type: ColType; sort: SortState | null;
  onSort: (key: string, type: ColType) => void; right?: boolean; className?: string;
  testid?: string; title?: string;
}) {
  const on = sort?.key === k;
  return (
    <th scope="col" aria-sort={on ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
      className={`${className} ${right ? "text-right" : "text-left"}`}>
      <button type="button" data-testid={testid} data-sort-key={k} onClick={() => onSort(k, type)} title={title}
        className={`inline-flex items-center gap-1 whitespace-nowrap uppercase outline-none hover:text-ink-hi focus-visible:text-ink-hi focus-visible:ring-1 focus-visible:ring-accent ${
          right ? "flex-row-reverse" : ""} ${on ? "text-ink-hi" : ""}`}>
        <span>{label}</span>
        <span aria-hidden className={`text-[8px] ${on ? "text-accent" : "text-ink-faint/60"}`}>
          {on ? (sort!.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

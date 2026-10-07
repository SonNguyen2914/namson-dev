// THE CONSOLE'S FOUR READS, IN ONE PLACE (redesign, 2026-10-07).
//
// The status, the book, the candidates and the ledger used to be polled
// by their own sections, so a section that unmounted stopped its read and
// lost what it had. The redesigned console is an app of views; a view
// switch must never drop a read, a filter or an open drawer. So the four
// pollers live here, above every view, and the views draw what they hold.
//
// EVERY RULE THE SECTIONS HAD IS KEPT, read for read (moved, not rewritten):
//
//   * STATUS, every 15 s while a token is armed (lib/usePoll: no overlap,
//     nothing while hidden, backoff after failures). 403 stops the poll
//     and drops what was read with the token; 503 is "not ready"; any
//     other failure is named by its status; a body that is not JSON is
//     named as exactly that. The last good read stays, with its age.
//   * BOOK, CANDIDATES, LEDGER are asked only ONCE A STATUS READ HAS
//     SUCCEEDED — a refused or not-ready plane is never asked for its book
//     — and stop again when that read is dropped (a 403). 404 or
//     {available:false} is "not available yet" (a definite answer: keep
//     asking at the cadence). 15 s, 15 s and 60 s.
//   * The book is read again at once after a hand-over POST (`bumpBook`),
//     the status after a kill lift (`bumpStatus`).
//   * The ledger's server filters are named query parameters; changing
//     one resets its pages and reads again. "Load older" asks for the next
//     OFFSET; a page that arrives after the filters changed is dropped.
import { useCallback, useEffect, useRef, useState } from "react";
import { type Candidates, isObj, parseCandidates } from "../../lib/tradingConsole";
import {
  type Ledger, type LedgerRow, LEDGER_PHASES, parseLedger,
} from "../../lib/tradingLedger";
import { FOCUS_COMPETITIONS } from "../../lib/tradingConsole";
import { usePoll, type PollOutcome } from "../../lib/usePoll";
import { type Book, parseBook } from "../TradingBook";

type Obj = Record<string, unknown>;

export const STATUS_POLL_MS = 15_000;
export const BOOK_POLL_MS = 15_000;
export const CANDIDATES_POLL_MS = 15_000;
export const LEDGER_POLL_MS = 60_000;

export type Read =
  | { kind: "idle" }
  | { kind: "ok" }
  | { kind: "unavailable" }
  | { kind: "refused"; detail: string }
  | { kind: "not_ready"; detail: string }
  | { kind: "error"; status: number; detail: string };

export interface Source<T> {
  read: Read;
  last: { data: T; at: number } | null;
  /** the poll's cadence, so freshness can say "stale" after three */
  cadenceMs: number;
}

export interface LedgerFilters { competition: string; phase: string; since: string; until: string }
export const NO_LEDGER_FILTERS: LedgerFilters = { competition: "", phase: "", since: "", until: "" };

/** the ledger query the page asks with — the named filters only. A day
 *  is sent as the bare date: the backend reads `since` from that day's
 *  start and `until` to that day's END. */
export function ledgerQueryOf(f: LedgerFilters, offset?: number): string {
  const q = new URLSearchParams();
  if (f.since && /^\d{4}-\d{2}-\d{2}$/.test(f.since)) q.set("since", f.since);
  if (f.until && /^\d{4}-\d{2}-\d{2}$/.test(f.until)) q.set("until", f.until);
  if (f.competition) q.set("competition", f.competition);
  if (f.phase) q.set("phase", f.phase);
  if (offset) q.set("offset", String(offset));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export interface LedgerSource extends Source<Ledger> {
  /** newest first as sent, then the older pages, a row never drawn twice */
  rows: LedgerRow[];
  nextOffset: number | null;
  more: { busy: boolean; error: string | null };
  loadOlder: () => Promise<void>;
  filters: LedgerFilters;
  setFilter: (k: keyof LedgerFilters, v: string) => void;
  clearFilters: () => void;
  known: { comps: string[]; phases: string[] };
}

function useStatus(armed: string, bump: number) {
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ data: Obj; at: number } | null>(null);
  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch("/api/ops/trading-status", {
      headers: { "x-admin-token": armed }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try {
      body = await r.json();
    } catch (err) {
      // a 403 or a 503 is named by its status alone; any other answer
      // that is not JSON is named as exactly that
      if (r.status !== 403 && r.status !== 503) {
        setRead({ kind: "error", status: r.status,
          detail: `the answer was not JSON (${String(err)})` });
        return "failed";
      }
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body)) {
      setRead({ kind: "ok" });
      setLast({ data: body, at: Date.now() });
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    if (r.status === 503) {
      setRead({ kind: "not_ready", detail });
      return "failed";
    }
    setRead({ kind: "error", status: r.status, detail });
    return "failed";
  }, STATUS_POLL_MS, [armed, bump], armed !== "");
  return { read, last, setRead, setLast };
}

function useBook(token: string, enabled: boolean, bump: number) {
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ data: Book; at: number } | null>(null);
  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch("/api/ops/trading-book", {
      headers: { "x-admin-token": token }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try { body = await r.json(); } catch {
      /* SWALLOWED(tradingbook:book-body-parse) — registered in
         e2e/missing-is-not-zero.spec.ts with its closes_when. */
    }
    if (r.status === 404 || (isObj(body) && body.available === false)) {
      // a definite answer: keep asking at the usual cadence, so the
      // section fills in once the backend has the route
      setRead({ kind: "unavailable" });
      setLast(null);
      return "ok";
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body)) {
      setRead({ kind: "ok" });
      setLast({ data: parseBook(body), at: Date.now() });
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    setRead({ kind: "error", status: r.status, detail });
    return "failed";
  }, BOOK_POLL_MS, [token, bump], enabled && token !== "");
  return { read, last };
}

function useCandidates(token: string, enabled: boolean) {
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ data: Candidates; at: number } | null>(null);
  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch("/api/ops/trading-candidates", {
      headers: { "x-admin-token": token }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try {
      body = await r.json();
    } catch (err) {
      // NAMED, NEVER AN EMPTY TABLE: an answer that is not JSON is said
      // by its status — a 404 is the missing route, a 403 the refusal,
      // anything else an error naming that it was not JSON
      if (r.status === 404) {
        setRead({ kind: "unavailable" });
        setLast(null);
        return "ok";
      }
      if (r.status === 403) {
        setRead({ kind: "refused", detail: "HTTP 403" });
        setLast(null);
        return "stop";
      }
      setRead({ kind: "error", status: r.status,
        detail: `the answer was not JSON (${String(err)})` });
      return "failed";
    }
    if (r.status === 404 || (isObj(body) && body.available === false)) {
      setRead({ kind: "unavailable" });
      setLast(null);
      return "ok";
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body)) {
      setRead({ kind: "ok" });
      setLast({ data: parseCandidates(body), at: Date.now() });
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    setRead({ kind: "error", status: r.status,
      detail: r.ok ? "the answer was not an object, so there is no table to draw"
        : detail });
    return "failed";
  }, CANDIDATES_POLL_MS, [token], enabled && token !== "");
  return { read, last };
}

function useLedger(token: string, enabled: boolean): LedgerSource {
  const [read, setRead] = useState<Read>({ kind: "idle" });
  const [last, setLast] = useState<{ data: Ledger; at: number } | null>(null);
  const [older, setOlder] = useState<LedgerRow[]>([]);
  /** the offset after the older pages; undefined until one is loaded */
  const [olderNext, setOlderNext] = useState<number | null | undefined>(undefined);
  const [more, setMore] = useState<{ busy: boolean; error: string | null }>(
    { busy: false, error: null });
  const [filters, setFilters] = useState<LedgerFilters>(NO_LEDGER_FILTERS);
  const [known, setKnown] = useState<{ comps: string[]; phases: string[] }>(
    { comps: [...FOCUS_COMPETITIONS], phases: [...LEDGER_PHASES] });
  const gen = useRef(0);
  const q = ledgerQueryOf(filters);

  usePoll(async (signal): Promise<PollOutcome> => {
    const r = await fetch(`/api/ops/trading-ledger${q}`, {
      headers: { "x-admin-token": token }, cache: "no-store", signal,
    });
    let body: unknown = null;
    try {
      body = await r.json();
    } catch (err) {
      if (signal.aborted) return "ok";
      // NAMED, NEVER AN EMPTY LEDGER: an answer that is not JSON is said
      // by its status
      if (r.status === 404) {
        setRead({ kind: "unavailable" });
        setLast(null);
        return "ok";
      }
      if (r.status === 403) {
        setRead({ kind: "refused", detail: "HTTP 403" });
        setLast(null);
        return "stop";
      }
      setRead({ kind: "error", status: r.status,
        detail: `the answer was not JSON (${String(err)})` });
      return "failed";
    }
    if (signal.aborted) return "ok";
    if (r.status === 404 || (isObj(body) && body.available === false)) {
      setRead({ kind: "unavailable" });
      setLast(null);
      return "ok";
    }
    const detail = isObj(body) && typeof body.detail === "string"
      ? body.detail : `HTTP ${r.status}`;
    if (r.ok && isObj(body) && Array.isArray(body.rows)) {
      const l = parseLedger(body);
      setRead({ kind: "ok" });
      setLast({ data: l, at: Date.now() });
      // the backend's own phase keys are the filter's options; every
      // competition ever named stays one
      const vocab = Object.keys(l.vocab.phases);
      setKnown((k) => ({
        comps: [...new Set([...k.comps,
          ...(l.summary?.by_competition ?? []).map((g) => g.key).filter((c) => c !== "unknown"),
          ...l.rows.map((x) => x.competition).filter((c): c is string => !!c)])],
        phases: vocab.length ? vocab : k.phases,
      }));
      return "ok";
    }
    if (r.status === 403) {
      setRead({ kind: "refused", detail });
      setLast(null);
      return "stop";
    }
    setRead({ kind: "error", status: r.status,
      detail: !r.ok ? detail : !isObj(body)
        ? "the answer was not an object, so there is no ledger to draw"
        : "the answer carried no rows list, so there is no ledger to draw" });
    return "failed";
  }, LEDGER_POLL_MS, [token, q], enabled && token !== "");

  const reset = () => {
    gen.current += 1;
    setOlder([]);
    setOlderNext(undefined);
    setMore({ busy: false, error: null });
    setLast(null);
    setRead({ kind: "idle" });
  };
  const setFilter = (k: keyof LedgerFilters, v: string) => {
    setFilters((f) => ({ ...f, [k]: v }));
    reset();
  };
  const clearFilters = () => {
    setFilters(NO_LEDGER_FILTERS);
    reset();
  };

  const l = last?.data ?? null;
  const rows: LedgerRow[] = [];
  if (l) {
    const seen = new Set<number>();
    for (const r of [...l.rows, ...older]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      rows.push(r);
    }
  }
  const nextOffset = olderNext === undefined ? l?.next_offset ?? null : olderNext;

  // AN OLDER PAGE, by the backend's offset. Every failure is put on the
  // page by name; a page that arrives after the filters changed is
  // dropped, not appended to another window.
  const loadOlder = async () => {
    if (nextOffset === null) return;
    const mine = gen.current;
    const current = () => gen.current === mine;
    setMore({ busy: true, error: null });
    let r: Response;
    try {
      r = await fetch(`/api/ops/trading-ledger${ledgerQueryOf(filters, nextOffset)}`, {
        headers: { "x-admin-token": token }, cache: "no-store",
      });
    } catch (err) {
      if (current()) setMore({ busy: false, error: `no answer came back (${String(err)})` });
      return;
    }
    let body: unknown;
    try {
      body = await r.json();
    } catch (err) {
      if (current()) {
        setMore({ busy: false,
          error: `HTTP ${r.status} — the answer was not JSON (${String(err)})` });
      }
      return;
    }
    if (!current()) return;
    if (r.ok && isObj(body) && Array.isArray(body.rows)) {
      const page = parseLedger(body);
      setOlder((o) => [...o, ...page.rows]);
      setOlderNext(page.next_offset);
      setMore({ busy: false, error: null });
      return;
    }
    setMore({ busy: false, error: `HTTP ${r.status}${isObj(body)
      && typeof body.detail === "string" ? ` — ${body.detail}` : ""}` });
  };

  return { read, last, cadenceMs: LEDGER_POLL_MS, rows, nextOffset, more,
    loadOlder, filters, setFilter, clearFilters, known };
}

/** THE STATUS READ, held by the page above the console: the console (and
 *  with it the three section reads) mounts only once a status read has
 *  succeeded, and unmounts — dropping what was read — when it is dropped
 *  (a 403, or the token field cleared). */
export function useStatusRead(armed: string) {
  const [bump, setBump] = useState(0);
  const status = useStatus(armed, bump);
  const { setRead, setLast } = status;
  const clear = useCallback(() => {
    setRead({ kind: "idle" });
    setLast(null);
  }, [setRead, setLast]);
  return {
    source: { read: status.read, last: status.last, cadenceMs: STATUS_POLL_MS } as Source<Obj>,
    bump: useCallback(() => setBump((b) => b + 1), []),
    clear,
  };
}

export interface SectionReads {
  book: Source<Book>;
  candidates: Source<Candidates>;
  ledger: LedgerSource;
  bumpBook: () => void;
}

/** THE BOOK, THE CANDIDATES AND THE LEDGER — asked only while mounted,
 *  i.e. only once the status has answered. */
export function useSectionReads(token: string): SectionReads {
  const [bookBump, setBookBump] = useState(0);
  const book = useBook(token, true, bookBump);
  const candidates = useCandidates(token, true);
  const ledger = useLedger(token, true);
  return {
    book: { ...book, cadenceMs: BOOK_POLL_MS },
    candidates: { ...candidates, cadenceMs: CANDIDATES_POLL_MS },
    ledger,
    bumpBook: useCallback(() => setBookBump((b) => b + 1), []),
  };
}

/** A clock that ticks every `ms` while `on`, for "updated 7s ago". */
export function useNow(on: boolean, ms = 1_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [on, ms]);
  return now;
}

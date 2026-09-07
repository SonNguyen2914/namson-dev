// SELECTING MATCHES TO WATCH, from the picker board.
//
// B0c (docs/HOLD-EXIT-DESIGN.md) declares which matches the live read
// runs on. It is a PREREGISTRATION: declared before the evidence,
// append-only, and a removal after kickoff is refused with the refusal
// written down. Until now the only way to declare one was a curl.
//
// ---------------------------------------------------------------------
// THE RULE THAT DECIDED THE DESIGN
// ---------------------------------------------------------------------
// The backend requires `actor` on every declaration and never defaults
// it — "a declaration with nobody's name on it cannot be held to
// anything" — and all three verbs are operator-gated. namson.dev is
// public and lib/suggesterProxy.ts injects no credentials, so a public
// button could not satisfy either rule. So:
//
//   - the operator's token and the operator's NAME are both typed in,
//     by a person, into this panel. Neither is baked into the bundle,
//     read from an env var, or written to localStorage/sessionStorage:
//     they live in this component's state for as long as the tab does,
//     and the panel says so;
//   - the name rides as `actor`. Never "web", never a default. A blank
//     name is forwarded blank so the BACKEND refuses it in the sentence
//     that owns the rule, rather than this file paraphrasing it;
//   - with no token every control still RENDERS and says what it needs.
//     Pressing one opens this panel — it is never a silent no-op.
//
// ---------------------------------------------------------------------
// IDENTITY IS RESOLVED, NEVER GUESSED
// ---------------------------------------------------------------------
// The board keys fixtures by ESPN event id and the watchlist keys them
// by the live plane's internal fixture id. The join is the public
// resolver behind pages/api/bet-suggester/live-watchlist/resolve.ts. A
// row that resolves to no fixture says so and offers nothing to press —
// it is not silently treated as undeclared, because "not in the set" and
// "not a fixture the live plane holds" are different facts.
//
// ---------------------------------------------------------------------
// INK
// ---------------------------------------------------------------------
// Floodlit: gold is brand, never a verdict, and there is one traffic
// light. A declared match is drawn in plain ink with a filled marker —
// declaring a match is not a good outcome and must not read as one.
// `warn` is used for exactly one thing on this surface: a refusal, in
// the backend's own words. Nothing here is coloured up/neg.
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import {
  WatchlistDeclareResponse, WatchlistResolveResponse, WatchlistState,
  WatchlistSyncResult, watchlistApi,
} from "../lib/suggesterApi";

type ActResult =
  | { ok: true; res: WatchlistDeclareResponse }
  | { ok: false; error: string };

interface Ctx {
  token: string;
  setToken: (v: string) => void;
  actor: string;
  setActor: (v: string) => void;
  hasToken: boolean;
  /** the backend refuses an anonymous declaration; so this page does not
   *  pretend a nameless operator can act */
  canAct: boolean;
  state: WatchlistState | null;
  /** the live plane is not configured — no set exists to be in or out of */
  planeDormant: boolean;
  /** the payload actually carried the declared set. A non-dormant answer
   *  that omits it is NOT an empty set, and `0 declared` would be this
   *  surface inventing the one number it exists to report. */
  setIsReadable: boolean;
  stateError: string;
  loadingState: boolean;
  resolved: WatchlistResolveResponse | null;
  resolveError: string;
  results: Record<string, ActResult>;
  busy: string | null;
  declaredFixtureIds: Set<number>;
  act: (eventId: string, action: "add" | "remove") => void;
  openPanel: () => void;
  panelOpen: boolean;
  setPanelOpen: (b: boolean) => void;
  sync: WatchlistSyncResult | null;
  syncError: string;
  syncing: boolean;
  /** ARMED, NOT FIRED. Pressing "watch everything I hold" opens the
   *  confirmation and writes nothing; only `runSync` writes. */
  syncArmed: boolean;
  armSync: () => void;
  disarmSync: () => void;
  runSync: () => void;
  reload: () => void;
  boardEventCount: number;
}

const WatchCtx = createContext<Ctx | null>(null);

/** The id of the one paragraph that says what the controls need. Every
 *  row's control points at it with aria-describedby instead of
 *  repeating the sentence sixty times — the explanation exists once, in
 *  the accessible tree, beside the fields that answer it. */
const NEEDS_ID = "watch-declare-needs";

/** The token field's id. Named once so `openPanel` can put the caret in
 *  it without a ref travelling through context. */
const TOKEN_FIELD_ID = "watch-token";

/** Unit separator. Cannot occur in an ESPN event reference. */
const SEP = "\u001f";

export function WatchDeclarationProvider({ eventIds, children }: {
  /** every ESPN reference on the board right now, so the declared set
   *  can be joined to the rows in ONE request rather than sixty */
  eventIds: string[];
  children: React.ReactNode;
}) {
  const [token, setToken] = useState("");
  const [actor, setActor] = useState("");
  const [state, setState] = useState<WatchlistState | null>(null);
  const [stateError, setStateError] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [resolved, setResolved] = useState<WatchlistResolveResponse | null>(null);
  const [resolveError, setResolveError] = useState("");
  const [results, setResults] = useState<Record<string, ActResult>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [sync, setSync] = useState<WatchlistSyncResult | null>(null);
  const [syncError, setSyncError] = useState("");
  const [syncing, setSyncing] = useState(false);
  // THE BUTTON THAT WROTE 37 PERMANENT RECORDS ON ONE CLICK.
  // "watch everything I hold" used to call sync-positions straight from
  // its onClick. One press declared 37 fixtures into an append-only
  // preregistration in which a removal after kickoff is REFUSED BY
  // DESIGN, and the only place any count appeared was the result line
  // afterwards. Son pressed it, did not expect that, and said so: "I
  // didnt declared those as watching". So the press ARMS a confirmation
  // and writes nothing; `runSync` is reachable only from the control
  // inside that confirmation, and the confirmation says what is about
  // to be declared, every count this surface can actually read, what it
  // cannot read and why, and that the record cannot be taken back once
  // a match starts.
  const [armed, setArmed] = useState(false);
  const [open, setOpen] = useState(false);

  const hasToken = token.trim().length > 0;
  const canAct = hasToken && actor.trim().length > 0;
  // One stable key for "which fixtures are on the board", and the list
  // itself recovered from it. The separator is US (U+001F) rather than a
  // comma: an id that contained the separator would silently split into
  // two references, and this list is what the declared set is joined to.
  const idsKey = useMemo(
    () => [...new Set(eventIds)].sort().join(SEP), [eventIds]);

  const readState = useCallback(async (signal?: AbortSignal) => {
    if (!hasToken) return;
    setLoadingState(true);
    try {
      const s = await watchlistApi.state(token.trim(), signal);
      if (signal?.aborted) return;
      setState(s);
      setStateError("");
    } catch (e) {
      if (signal?.aborted) return;
      // The previous payload is DROPPED. A declared set from a request
      // that has since failed, standing beside live rows, is exactly the
      // stale-dressed-as-current state the board refuses everywhere.
      setState(null);
      setStateError(e instanceof Error ? e.message : String(e));
    } finally {
      if (!signal?.aborted) setLoadingState(false);
    }
  }, [hasToken, token]);

  useEffect(() => {
    if (!hasToken) {
      setState(null); setStateError(""); setResolved(null); setResolveError("");
      return;
    }
    const ac = new AbortController();
    const t = setTimeout(() => { void readState(ac.signal); }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, [hasToken, readState]);

  useEffect(() => {
    if (!hasToken || !idsKey) { setResolved(null); return; }
    const ac = new AbortController();
    const t = setTimeout(() => {
      void (async () => {
        try {
          const r = await watchlistApi.resolve(
            token.trim(), idsKey.split(SEP), ac.signal);
          if (ac.signal.aborted) return;
          setResolved(r);
          setResolveError("");
        } catch (e) {
          if (ac.signal.aborted) return;
          setResolved(null);
          setResolveError(e instanceof Error ? e.message : String(e));
        }
      })();
    }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, [hasToken, token, idsKey]);

  const declaredFixtureIds = useMemo(
    () => new Set(state?.monitored_fixture_ids ?? []), [state]);
  // A DORMANT PLANE IS NOT AN EMPTY SET. The payload carries `dormant`
  // and words and NO ids at all, so every row must say "the plane is not
  // configured" rather than "not watched" — the second is a claim about
  // the set, and there is no set to claim anything about.
  const planeDormant = state?.dormant === true;
  // DERIVED FROM THE PAYLOAD'S OWN SHAPE, not from its truthiness. The
  // same fold one layer over: `state !== null` was being read as "the
  // set is known", and a non-dormant answer missing the array would have
  // rendered as an empty set on the chip and as "not watched" on every
  // row. Absence of the list is not a list of nothing.
  const setIsReadable = Array.isArray(state?.monitored_fixture_ids);

  // NO REF CROSSES THE CONTEXT. The disclosure is CONTROLLED by
  // `open`, so opening it is a setState; the focus is a getElementById
  // in an event handler, on the id the field already carries for its own
  // <label>. A ref handed through context is a value read during render,
  // which is both a lint error here and the wrong shape.
  const openPanel = useCallback(() => {
    setOpen(true);
    // focus, not just scroll: the reader pressed a control that said it
    // needed something, so put the caret in the field that supplies it
    setTimeout(() => {
      const el = typeof document !== "undefined"
        ? document.getElementById(TOKEN_FIELD_ID) : null;
      if (el instanceof HTMLInputElement) el.focus();
    }, 0);
  }, []);

  const act = useCallback((eventId: string, action: "add" | "remove") => {
    if (!hasToken) { openPanel(); return; }
    setBusy(eventId);
    void (async () => {
      try {
        const res = await watchlistApi.declare(
          token.trim(), eventId, action, actor);
        setResults((p) => ({ ...p, [eventId]: { ok: true, res } }));
      } catch (e) {
        setResults((p) => ({ ...p, [eventId]: {
          ok: false, error: e instanceof Error ? e.message : String(e) } }));
      } finally {
        setBusy(null);
        await readState();
      }
    })();
  }, [hasToken, token, actor, readState, openPanel]);

  // ARMING IS NOT WRITING. With no token this still opens the panel —
  // the control is never a silent no-op — and with one it opens the
  // confirmation. Nothing reaches the backend from here.
  const armSync = useCallback(() => {
    if (!hasToken) { openPanel(); return; }
    setOpen(true);
    setArmed(true);
  }, [hasToken, openPanel]);

  const disarmSync = useCallback(() => setArmed(false), []);

  const runSync = useCallback(() => {
    if (!hasToken) { openPanel(); return; }
    setArmed(false);
    setSyncing(true);
    void (async () => {
      try {
        const out = await watchlistApi.syncPositions(token.trim());
        setSync(out); setSyncError("");
      } catch (e) {
        setSync(null);
        setSyncError(e instanceof Error ? e.message : String(e));
      } finally {
        setSyncing(false);
        await readState();
      }
    })();
  }, [hasToken, token, readState, openPanel]);

  const ctx: Ctx = {
    token, setToken, actor, setActor, hasToken, canAct,
    state, planeDormant, setIsReadable, stateError, loadingState,
    resolved, resolveError,
    results, busy, declaredFixtureIds, act, openPanel,
    panelOpen: open, setPanelOpen: setOpen,
    sync, syncError, syncing, runSync,
    syncArmed: armed, armSync, disarmSync,
    reload: () => { void readState(); },
    boardEventCount: eventIds.length,
  };

  return (
    <WatchCtx.Provider value={ctx}>{children}</WatchCtx.Provider>
  );
}

// --------------------------------------------------------------- panel

function Field({ id, label, type = "text", value, onChange, inputRef, hint }: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  hint?: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <input id={id} ref={inputRef} type={type} value={value}
        autoComplete="off" spellCheck={false} placeholder={hint}
        onChange={(e) => onChange(e.target.value)}
        className="w-40 rounded-md border border-line bg-bs px-2 py-1 font-mono text-[11px] text-ink-hi outline-none transition-colors placeholder:text-ink-faint hover:border-line-strong focus-visible:ring-2 focus-visible:ring-accent" />
    </label>
  );
}

/** A count off the payload, or the words for its absence.
 *
 *  THE SAME FOLD, EVERY FIELD. `st.open_positions_not_monitored.length`
 *  on a payload that did not carry the key is a crash; `?? 0` in its
 *  place is worse — it is this surface reporting "no position is
 *  unwatched" off an answer that said nothing at all. One reader for
 *  every number here, so a field added later cannot be the one that
 *  forgets. */
function countOf(v: unknown): number | null {
  return typeof v === "number" ? v : Array.isArray(v) ? v.length : null;
}

const NOT_ON_PAYLOAD = "not on the payload";

function Count({ label, value, warnWhenOver = false }: {
  label: string; value: unknown; warnWhenOver?: boolean;
}) {
  const n = countOf(value);
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-ink-faint">{label}</dt>
      <dd className={n === null || (warnWhenOver && n > 0)
        ? "text-warn" : "text-ink-mid"}>
        {n === null ? NOT_ON_PAYLOAD : n}
      </dd>
    </div>
  );
}

// ------------------------------------------- "watch everything I hold"
//
// WHAT THE BUTTON DOES, SAID BEFORE IT DOES IT.
// POST /api/admin/live/watchlist/sync-positions declares EVERY fixture
// the journal holds an open position on, from the source
// `open_position`, into the append-only preregistration. It is
// idempotent per source and it removes nothing. The half nobody was
// told is the half that matters: the record is APPEND-ONLY, and once a
// fixture has started, a removal is REFUSED and the attempt is itself
// written as an event (watchlist.ONCE_STARTED_IT_STAYS). A press of
// this button is therefore a hard-to-reverse, outward-facing action
// behind a small label, and it is treated as one.
//
// THE SENTENCES ARE THE BACKEND'S OWN RULES, PARAPHRASED ONCE AND
// NAMED. They are not quoted from a payload because the sync route
// returns nothing until it has already written; the module and the
// constant each sentence comes from is cited beside it so a reader can
// check this file against the rule rather than trust it.
const SYNC_DECLARES = (
  "every fixture your journal still holds an open position on — not "
  + "the fixtures on the board, and not the ones you have looked at. "
  + "They are declared from the source `open_position`, which is "
  + "counted apart from the ones you chose by hand and never added to "
  + "them (watchlist.SOURCES_ARE_NOT_MERGED).");

const SYNC_CANNOT_BE_TAKEN_BACK = (
  "The declared set is APPEND-ONLY and a declaration is not a "
  + "preference you can revise. Before kickoff you may ask for a "
  + "removal, and that request is itself written as an event rather "
  + "than deleting anything. ONCE A MATCH HAS STARTED THE REMOVAL IS "
  + "REFUSED — the wish is recorded, the watch stands, and the fixture "
  + "is in the sample for good (watchlist.ONCE_STARTED_IT_STAYS). That "
  + "is what makes anything later found on this set worth arguing "
  + "from, and it is why this asks first.");

/** WHAT THIS SURFACE CANNOT KNOW BEFORE THE WRITE, WRITTEN DOWN.
 *
 *  The exact number of records the sweep will append is decided inside
 *  the backend: it declares `watchlist.open_position_fixture_ids(s)`,
 *  skips any fixture already declared FROM THAT SOURCE
 *  (`once_per_source=True`), and refuses a fixture nothing tapes by
 *  name. None of those three sets is on any payload this panel reads.
 *  The counts below are therefore the ones that ARE readable, each
 *  named for exactly what it is, and this record says plainly which
 *  number is missing rather than letting a plausible one stand in for
 *  it — the same discipline as `countOf` returning null instead of 0.
 *
 *  Guarded BOTH WAYS in e2e/watch-declaration.spec.ts: the guard fails
 *  if a record here is not printed inside the confirmation, and it
 *  fails the day the watchlist payload starts carrying the key that
 *  closes one while the record still stands. */
export const SYNC_PREVIEW_OPEN: Record<string, {
  finding: string; closes_when: string; closed_by_state_key: string;
}> = {
  exact_write_count_unreadable: {
    finding: "the exact number of rows this sweep will append cannot be "
      + "read before it runs. `GET /api/admin/live/watchlist` carries "
      + "the declared set and the open positions that are NOT in it, "
      + "but not the list of open positions itself and not which of "
      + "them were already declared from the `open_position` source — "
      + "so the total the sweep reports as `checked` has no counterpart "
      + "on any payload this panel can read. The counts shown are the "
      + "readable ones and are labelled as what they are; none of them "
      + "is presented as the write count.",
    closes_when: "the watchlist state payload carries "
      + "`open_position_fixture_ids` (or the sync route grows a "
      + "dry-run that returns its own `checked`/`declared` without "
      + "writing); then this panel states the number it is about to "
      + "write and this record retires — or the guard fails.",
    closed_by_state_key: "open_position_fixture_ids",
  },
};

/** Registered holes whose closing key HAS arrived on this payload.
 *  Derived from the payload, never hand-listed: the day the backend
 *  starts carrying `open_position_fixture_ids`, this returns the
 *  record that should have been retired and the guard goes red. */
export function syncPreviewHolesClosed(st: WatchlistState | null): string[] {
  if (!st) return [];
  return Object.keys(SYNC_PREVIEW_OPEN).filter((k) =>
    (st as Record<string, unknown>)[
      SYNC_PREVIEW_OPEN[k].closed_by_state_key] !== undefined);
}

/** The confirmation. It writes nothing; it says what pressing the
 *  control below will write, how many of that this surface can count,
 *  and that the record cannot be taken back once a match starts. */
function SyncConfirm() {
  const p = useContext(WatchCtx);
  if (!p || !p.syncArmed) return null;
  const st = p.state;
  const bySource = st?.monitored_by_source ?? {};
  const closed = syncPreviewHolesClosed(st);
  return (
    <div data-testid="watch-sync-confirm" role="group"
      aria-labelledby="watch-sync-confirm-h"
      className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-3">
      <p id="watch-sync-confirm-h"
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-warn">
        this writes a permanent record — nothing has been written yet
      </p>
      <p data-testid="watch-sync-what"
        className="mt-2 max-w-3xl text-[12px] leading-relaxed text-ink-low">
        It will declare {SYNC_DECLARES}
      </p>
      <p data-testid="watch-sync-irreversible"
        className="mt-2 max-w-3xl text-[12px] leading-relaxed text-warn">
        {SYNC_CANNOT_BE_TAKEN_BACK}
      </p>

      {/* HOW MANY — every count this panel can actually read, each
          labelled as the thing it is. A dl rather than a sentence so no
          two of them can be mistaken for one another, and `Count`
          prints "not on the payload" rather than 0 for any that is
          missing. */}
      {st && !st.dormant ? (
        <dl data-testid="watch-sync-counts"
          className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 font-mono text-[11px] tabular-nums text-ink-low sm:grid-cols-2">
          <Count label="held, and not in the set right now" warnWhenOver
            value={st.open_positions_not_monitored} />
          <Count label="already declared from open positions"
            value={bySource["open_position"]} />
          <Count label="in the set right now, every source"
            value={st.monitored_fixture_ids} />
          <Count label="declared ever" value={st.declared_ever_count} />
        </dl>
      ) : (
        <p data-testid="watch-sync-uncounted"
          className="mt-3 max-w-3xl text-[12px] leading-relaxed text-warn">
          {st?.dormant
            ? (st.detail ?? "The live plane is not configured.")
            : "The declared set has not been read on this tab, so this "
              + "panel can state no count at all — not zero. Re-read the "
              + "set first if you want a number beside this."}
        </p>
      )}

      {/* THE NUMBER THAT IS MISSING, NAMED — AND ONLY THAT.
          THE SAME SHAPE THE LIVE CARD WAS REPORTED FOR, ONE SURFACE
          OVER. This used to print the record's `closes_when` beside its
          finding, on a confirmation an operator reads before writing a
          permanent record. The FINDING is operator-facing — it says
          which number this panel cannot show them before they press —
          and it stays. The `closes_when` is bookkeeping about this
          repo's own unfinished business; it is exported in
          SYNC_PREVIEW_OPEN above, which is where the guard in
          e2e/watch-declaration.spec.ts reads it, and it is emitted here
          as data rather than as prose. */}
      {Object.keys(SYNC_PREVIEW_OPEN).map((k) => (
        <p key={k} data-testid="watch-sync-open" data-key={k}
          data-closes-when-key={SYNC_PREVIEW_OPEN[k].closed_by_state_key}
          className="mt-2 max-w-3xl text-[11px] leading-relaxed text-ink-faint">
          Not shown, and known to be missing — {k}:{" "}
          {SYNC_PREVIEW_OPEN[k].finding}
        </p>
      ))}
      {closed.length > 0 && (
        <p data-testid="watch-sync-open-stale" data-keys={closed.join(",")}
          className="mt-2 max-w-3xl text-[11px] leading-relaxed text-warn">
          This payload now carries{" "}
          <span className="font-mono">
            {closed.map((k) => SYNC_PREVIEW_OPEN[k].closed_by_state_key)
              .join(", ")}
          </span>
          , which closes {closed.join(", ")} — the record above is stale
          and has not been retired. It is named here rather than left to
          read as current.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={p.runSync} disabled={p.syncing}
          data-testid="watch-sync-go"
          className="rounded-md border border-warn/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-warn transition-colors hover:border-warn disabled:opacity-40">
          {p.syncing ? "declaring…" : "declare them — this cannot be undone"}
        </button>
        <button type="button" onClick={p.disarmSync} disabled={p.syncing}
          data-testid="watch-sync-cancel"
          className="rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi disabled:opacity-40">
          cancel — write nothing
        </button>
      </div>
    </div>
  );
}

/** READ-ONLY access to the operator token this provider already holds.
 *
 *  ONE TOKEN, TWO SURFACES. The watch toggle declares a match and the
 *  HOLD/EXIT strip reads it back; both are gated by the same
 *  `_admin_ok` on the same backend, so asking the operator to type the
 *  credential twice would be this page inventing a second secret. The
 *  strip therefore reads it from HERE rather than holding one of its
 *  own — components/WatchedStrip.tsx is mounted inside this provider by
 *  pages/bet-suggester/index.tsx.
 *
 *  IT ADDS NO STORAGE AND NO WRITE. This returns the state the panel
 *  already keeps for the life of the tab; nothing is persisted by this
 *  hook, no caller may set the token through it, and outside the
 *  provider it returns "" — which the strip renders as "no token is
 *  held", never as an error and never as an empty watchlist. */
export function useWatchToken(): string {
  return useContext(WatchCtx)?.token ?? "";
}

/** The operator panel. A DISCLOSURE, closed on arrival: the board is a
 *  place to look and this is a place to declare, so it costs one line
 *  until it is wanted. Rendered by the page, not by the provider, so it
 *  sits where the page puts it. */
export function WatchPanel() {
  const p = useContext(WatchCtx);
  if (!p) return null;
  const st = p.state;
  const bySource = st?.monitored_by_source ?? {};
  // Counted, never totalled: a human-selected set and one that follows
  // open positions are different evidence, and the backend keeps them
  // apart for a reason no later work could undo.
  const sources = Object.entries(bySource);
  const unresolved = p.resolved
    ? Object.entries(p.resolved.resolved).filter(([, v]) => v === null)
    : [];
  // ONE note for all of them: the resolver's sentence is the same
  // sentence every time, so it is printed once rather than per row.
  const unresolvedNote = p.resolved
    ? Object.entries(p.resolved.notes)[0]?.[1] ?? null
    : null;

  return (
    <details data-testid="watch-panel"
      open={p.panelOpen}
      onToggle={(e) => p.setPanelOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="mt-3 rounded-lg border border-line bg-elev/30">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
        <span aria-hidden className="text-ink-faint">▸</span>
        <span>matches to watch</span>
        <span data-testid="watch-panel-chip"
          className={p.hasToken ? "text-ink-mid" : "text-ink-faint"}>
          {!p.hasToken ? "operator only"
            : p.planeDormant ? "plane dormant"
            : st && p.setIsReadable
              ? `${st.monitored_fixture_ids.length} declared`
            : st ? "set not on the payload"
            : p.loadingState ? "reading…" : "unread"}
        </span>
      </summary>

      <div className="border-t border-line px-3 pb-3 pt-3">
        <div className="flex flex-wrap items-center gap-3">
          <Field id={TOKEN_FIELD_ID} label="operator token" type="password"
            value={p.token} onChange={p.setToken} />
          <Field id="watch-actor" label="your name" value={p.actor}
            onChange={p.setActor} hint="who is declaring" />
          <button type="button" onClick={p.reload} disabled={!p.hasToken}
            data-testid="watch-reload"
            className="rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi disabled:opacity-40">
            re-read the set
          </button>
          {/* ARMS THE CONFIRMATION; IT DOES NOT WRITE. The label says
              so and the accessible name says so, because the label
              itself is small and the action behind it is permanent. */}
          <button type="button" onClick={p.armSync}
            disabled={p.syncing}
            data-testid="watch-sync"
            aria-expanded={p.syncArmed}
            aria-describedby={p.hasToken ? undefined : NEEDS_ID}
            aria-label={p.hasToken
              ? "watch everything I hold — shows what would be declared "
                + "and asks before writing anything"
              : "watch everything I hold — needs the operator token; "
                + "opens the panel that asks for it"}
            className="rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi disabled:opacity-40">
            {p.syncing ? "declaring…"
              : p.hasToken ? "watch everything I hold…"
              : "watch everything I hold · needs token"}
          </button>
        </div>

        <p id={NEEDS_ID} data-testid="watch-needs"
          className="mt-2 max-w-3xl text-[12px] leading-relaxed text-ink-low">
          The declared set is operator-only, so this page can neither read
          it nor add to it without a token. Both fields live in this tab
          and nowhere else — a reload clears them. Your name is written
          on the record as the <code className="text-ink-mid">actor</code>;
          a declaration with nobody’s name on it is refused.
        </p>

        {/* THE READ. Split by source, never totalled. */}
        {p.hasToken && st && !st.dormant && (
          <dl data-testid="watch-state"
            className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] tabular-nums text-ink-low sm:grid-cols-3">
            {/* THE SPLIT BY SOURCE, OR THE WORDS FOR ITS ABSENCE.
                `st?.monitored_by_source ?? {}` renders NO ROWS when the
                payload carried no split, which reads as "there are no
                sources" beside four counts that did arrive — the same
                fold `countOf` refuses one field over, and the same one
                WatchedStrip states as "no source counts on this
                payload". A missing block is named, never drawn as an
                empty one. */}
            {sources.length === 0 ? (
              <div data-testid="watch-sources-absent"
                className="flex items-baseline gap-2">
                <dt className="text-ink-faint">by source</dt>
                <dd className="text-warn">{NOT_ON_PAYLOAD}</dd>
              </div>
            ) : sources.map(([name, ids]) => (
              <div key={name} className="flex items-baseline gap-2">
                <dt className="text-ink-faint">{name}</dt>
                <dd className="text-ink-mid">{ids.length}</dd>
              </div>
            ))}
            <Count label="declared ever" value={st.declared_ever_count} />
            <Count label="removed pre-kickoff"
              value={st.removed_before_kickoff_count} />
            <Count label="removals refused" warnWhenOver
              value={st.removal_attempts_refused_count} />
            <Count label="held, undeclared" warnWhenOver
              value={st.open_positions_not_monitored} />
          </dl>
        )}

        {/* The live plane is not configured: WORDS, never a plausible
            empty set. */}
        {p.hasToken && st?.dormant && (
          <p data-testid="watch-dormant"
            className="mt-3 font-mono text-[11px] leading-relaxed text-warn">
            {st.detail}
          </p>
        )}

        {p.hasToken && st?.log_truncated && st.log_truncation && (
          <p className="mt-2 font-mono text-[10px] text-ink-faint">
            {st.log_truncation}
          </p>
        )}

        {p.hasToken && p.stateError && (
          <p data-testid="watch-state-error"
            className="mt-3 font-mono text-[11px] leading-relaxed text-warn">
            {p.stateError}
          </p>
        )}

        {/* A BOARD ROW THAT IS NOT A LIVE-PLANE FIXTURE. Counted once,
            with the resolver’s own sentence once, rather than a line
            of prose on every card it applies to. */}
        {p.hasToken && p.resolved && unresolved.length > 0 && (
          <p data-testid="watch-unresolved"
            className="mt-3 max-w-3xl text-[12px] leading-relaxed text-ink-low">
            <span className="font-mono text-warn">
              {unresolved.length} of {p.resolved.asked}
            </span>{" "}
            board fixtures resolve to no live-plane fixture, so nothing can
            be declared about them.{unresolvedNote ? ` ${unresolvedNote}` : ""}
          </p>
        )}
        {p.hasToken && p.resolveError && (
          <p data-testid="watch-resolve-error"
            className="mt-2 font-mono text-[11px] leading-relaxed text-warn">
            {p.resolveError}
          </p>
        )}

        {/* WHAT IT WOULD WRITE, BEFORE IT WRITES IT. */}
        <SyncConfirm />

        {/* THE SYNC’s own answer, in its own numbers. */}
        {p.sync && (
          <p data-testid="watch-sync-result"
            className="mt-3 max-w-3xl font-mono text-[11px] leading-relaxed text-ink-low">
            {p.sync.dormant ? p.sync.detail : (
              <>
                checked {countOf(p.sync.checked) ?? NOT_ON_PAYLOAD}
                {" "}· declared {countOf(p.sync.declared) ?? NOT_ON_PAYLOAD}
                {" "}· already declared{" "}
                {countOf(p.sync.already_declared) ?? NOT_ON_PAYLOAD}
                {Array.isArray(p.sync.open_positions_not_monitored)
                  && p.sync.open_positions_not_monitored.length > 0 && (
                  <span className="text-warn">
                    {" "}· held but undeclared{" "}
                    {p.sync.open_positions_not_monitored.join(", ")}
                  </span>
                )}
              </>
            )}
          </p>
        )}
        {p.syncError && (
          <p data-testid="watch-sync-error"
            className="mt-2 font-mono text-[11px] leading-relaxed text-warn">
            {p.syncError}
          </p>
        )}
      </div>
    </details>
  );
}

// ----------------------------------------------------------- the toggle

const btn = "rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase "
  + "tracking-[0.14em] transition-colors";

/** The per-row control. SEVEN states, and every one of them says which
 *  it is on screen, in words, rather than by colour alone. */
export function WatchToggle({ eventId, label }: {
  eventId: string;
  /** the fixture in words, for the control's accessible name */
  label: string;
}) {
  const ctx = useContext(WatchCtx);
  if (!ctx) return null;                 // the board is the only mount
  const { hasToken, canAct, resolved, declaredFixtureIds, results, busy } = ctx;
  const result = results[eventId];
  const fx = resolved?.resolved?.[eventId] ?? null;
  const declared = fx ? declaredFixtureIds.has(fx.fixture_id) : false;
  const inFlight = busy === eventId;

  // SIX STATES, AND NONE OF THEM IS A GUESS. In particular the three
  // ways this control can carry no answer stay apart: the plane is not
  // configured, the read failed, and the read has not come back yet.
  // Folding any of them into "not watched" would be this surface
  // claiming a set it has not read.
  const state = !hasToken ? "needs-token"
    : ctx.planeDormant ? "dormant"
    : (ctx.stateError || ctx.resolveError) ? "unread"
    : (!resolved || !ctx.state) ? "resolving"
    : !ctx.setIsReadable ? "unread"
    : fx === null ? "no-fixture"
    : declared ? "declared" : "undeclared";

  return (
    <div data-testid="watch-toggle" data-event={eventId} data-state={state}
      className="mt-2 flex flex-wrap items-center gap-2">
      {state === "needs-token" && (
        <button type="button" onClick={ctx.openPanel}
          aria-describedby={NEEDS_ID}
          aria-label={`declare ${label} watched — needs the operator token; opens the panel that asks for it`}
          className={`${btn} border-line text-ink-faint hover:border-line-strong hover:text-ink-low`}>
          watch · needs token
        </button>
      )}

      {state === "resolving" && (
        <span className={`${btn} border-line text-ink-faint`}>
          watch · resolving
        </span>
      )}

      {state === "dormant" && (
        <span data-testid="watch-row-dormant"
          className={`${btn} border-warn/40 text-warn`}>
          live plane not configured
        </span>
      )}

      {state === "unread" && (
        <span data-testid="watch-row-unread"
          className={`${btn} border-warn/40 text-warn`}>
          declared set unread
        </span>
      )}

      {state === "no-fixture" && (
        <span data-testid="watch-no-fixture"
          className={`${btn} border-warn/40 text-warn`}>
          not a live-plane fixture
        </span>
      )}

      {state === "declared" && (
        <>
          <span data-testid="watch-mark"
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-mid">
            <i aria-hidden className="h-2 w-2 rounded-[1px] bg-ink-mid" />
            watching
          </span>
          <button type="button" disabled={!canAct || inFlight}
            onClick={() => ctx.act(eventId, "remove")}
            aria-describedby={canAct ? undefined : NEEDS_ID}
            aria-label={`ask for ${label} to leave the watched set`}
            className={`${btn} border-line text-ink-faint hover:border-line-strong hover:text-ink-low disabled:opacity-40`}>
            {inFlight ? "asking…" : "ask to remove"}
          </button>
        </>
      )}

      {state === "undeclared" && (
        <>
          <span data-testid="watch-mark"
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            <i aria-hidden className="h-2 w-2 rounded-[1px] border border-line-strong" />
            not watched
          </span>
          <button type="button" disabled={!canAct || inFlight}
            onClick={() => ctx.act(eventId, "add")}
            aria-describedby={canAct ? undefined : NEEDS_ID}
            aria-label={`declare ${label} watched`}
            className={`${btn} border-line text-ink-low hover:border-line-strong hover:text-ink-hi disabled:opacity-40`}>
            {inFlight ? "declaring…" : "watch"}
          </button>
        </>
      )}

      {result && <ActRecord result={result} />}
    </div>
  );
}

/** The backend's answer, VERBATIM.
 *
 *  A refused removal is not an error state — it is the record working,
 *  and the row that carries it is the only proof the sample stayed fair.
 *  So the tone is derived from the payload beside it, never from a
 *  hand-typed list of codes: the backend writes `action:
 *  "remove_refused"` on a refusal and `recorded: false` on a request
 *  that wrote nothing at all. */
function ActRecord({ result }: { result: ActResult }) {
  if (!result.ok) {
    return (
      <p data-testid="watch-error"
        className="basis-full font-mono text-[10px] leading-relaxed text-warn">
        {result.error}
      </p>
    );
  }
  const w = result.res.watchlist;
  if (w.dormant) {
    return (
      <p data-testid="watch-result" data-code="dormant"
        className="basis-full font-mono text-[10px] leading-relaxed text-warn">
        {w.detail}
      </p>
    );
  }
  const refused = w.action === "remove_refused" || w.recorded === false;
  return (
    <p data-testid="watch-result" data-code={w.policy_code}
      data-recorded={w.recorded ? "true" : "false"}
      className={`basis-full font-mono text-[10px] leading-relaxed ${
        refused ? "text-warn" : "text-ink-low"}`}>
      {w.policy}
      {w.recorded && (
        <span className="text-ink-faint">
          {" "}— written as event {w.event_id}, actor {w.actor}, on fixture{" "}
          {result.res.resolved_fixture.fixture_id}
          {result.res.resolved_fixture.competition
            ? ` (${result.res.resolved_fixture.competition})` : ""}
        </span>
      )}
    </p>
  );
}

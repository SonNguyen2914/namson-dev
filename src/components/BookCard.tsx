// THE LEAGUE BOOK CARD (MLS, EPL, La Liga, Liga MX dashboards) — one card,
// lifted out of the four dashboards that each carried an identical copy.
//
// Raw exchange prices in cents, ask / bid, never turned into a
// probability. Backend #277 (A7, E2) added two facts this card now says:
//
//   - `thin_book` + `thin_reasons` on a book: a leg's spread over 20¢, a
//     leg missing a side, or a three-way book whose asks sum past 1.15.
//     The prices are still drawn — they are what the exchange shows — but
//     under a THIN tag in the THIN/WIDE chip style, with the reasons on its
//     hover, so a stub book is never read as a real one.
//   - `unavailable` on the grid: events whose markets could not be read
//     (the series read failed, or the quiet window after a failure). They
//     are NAMED, never dropped as if settled, and never drawn as an empty
//     book.
//
// Display only. Nothing here is a recommendation (AGENTS.md §2).

export type BookRow = {
  ticker: string; label?: string; yes_ask?: string; yes_bid?: string;
  status?: string; spread?: number | null;
};
export type GameBook = {
  event_ticker: string; title?: string; markets: BookRow[];
  ask_sum?: number | null; thin_book?: boolean; thin_reasons?: string[];
};
export type UnavailableBook = { event_ticker: string; title?: string | null; reason?: string };

/** `unavailable` off a markets payload, read defensively. */
export function unavailableOf(d: unknown): UnavailableBook[] {
  const u = d && typeof d === "object" ? (d as { unavailable?: unknown }).unavailable : null;
  return Array.isArray(u)
    ? u.filter((x): x is UnavailableBook => !!x && typeof x === "object" && typeof x.event_ticker === "string")
    : [];
}

/** THE BACKEND'S THIN-BOOK REASONS IN WORDS (src/mls.py book_quality). */
export const THIN_REASON_WORDS: Record<string, string> = {
  wide_spread: "a leg's ask − bid spread is over 20¢",
  missing_quote: "a leg is missing its ask or its bid",
  ask_sum_high: "the three asks sum to more than 115¢",
};
export const UNAVAILABLE_WORDS: Record<string, string> = {
  series_markets_read_failed: "the exchange's market read failed; asked again on the next poll",
};

/** The THIN/WIDE chip's own shape (ModelMarket's `mm-book-flag`). */
export const FLAG_TAG = "rounded border border-warn/40 px-[5px] py-[2px] font-mono text-[8.5px] uppercase tracking-[0.14em] text-warn";

export function cents(v?: string) {
  const n = v ? Math.round(parseFloat(v) * 100) : NaN;
  return Number.isFinite(n) ? `${n}¢` : "—";
}

export function thinTitle(reasons: string[] | undefined, askSum?: number | null) {
  const rs = (reasons ?? []).map((r) => THIN_REASON_WORDS[r] ?? r);
  return `Thin book: ${rs.length ? rs.join("; ") : "the backend flagged it thin"}.`
    + (typeof askSum === "number" ? ` Asks sum to ${Math.round(askSum * 100)}¢.` : "")
    + " The prices are the exchange's own, but too thin to read as a probability.";
}

export function ThinTag({ reasons, askSum }: { reasons?: string[]; askSum?: number | null }) {
  return (
    <span data-testid="book-thin" data-reasons={(reasons ?? []).join(",")}
      title={thinTitle(reasons, askSum)}
      className={`${FLAG_TAG} flex-none`}>
      thin
    </span>
  );
}

export function BookCard({ g }: { g: GameBook }) {
  return (
    <div data-testid="book-card" data-event={g.event_ticker}
      data-thin={g.thin_book ? "true" : "false"}
      className="rounded-xl border border-line p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-sm text-ink-hi">{g.title}</p>
        {g.thin_book && <ThinTag reasons={g.thin_reasons} askSum={g.ask_sum} />}
      </div>
      <div className="space-y-1">
        {g.markets.map((m) => (
          <div key={m.ticker}
            className="flex items-center justify-between font-mono text-[11px]">
            <span className="truncate text-ink-low">{m.label}</span>
            <span className="tabular-nums">
              <span className="text-ink-hi">{cents(m.yes_ask)}</span>
              <span className="text-ink-faint"> / {cents(m.yes_bid)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Events whose book could not be read, named with the reason. */
export function UnavailableBooks({ rows }: { rows: UnavailableBook[] }) {
  if (rows.length === 0) return null;
  return (
    <div data-testid="books-unavailable" className="mt-3 rounded-xl border border-dashed border-warn/40 p-3">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-warn">
        {rows.length} {rows.length === 1 ? "book" : "books"} unavailable
      </p>
      <ul className="space-y-0.5 text-[12px] text-ink-low">
        {rows.map((u) => (
          <li key={u.event_ticker} data-testid="book-unavailable" data-event={u.event_ticker}
            title={u.reason ? `${UNAVAILABLE_WORDS[u.reason] ?? u.reason} (${u.reason})` : undefined}
            className="truncate">
            <span className="text-ink-mid">{u.title || u.event_ticker}</span>
            {" "}— could not be read{u.reason ? `: ${UNAVAILABLE_WORDS[u.reason]?.split(";")[0] ?? u.reason}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The grid of books plus the unavailable ones under it. */
export function BookGrid({ games, unavailable }: { games: GameBook[]; unavailable: UnavailableBook[] }) {
  return (
    <>
      {games.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => <BookCard key={g.event_ticker} g={g} />)}
        </div>
      )}
      <UnavailableBooks rows={unavailable} />
    </>
  );
}

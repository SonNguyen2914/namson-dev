// "AS OF <LAST FINISHED MATCH>" — every displayed rating says how current
// it is (Son, 2026-10-14: "rebuild and make the stats up to date
// constantly whenever they finish a match").
//
// The backend (TRIVELA src/picker/display_source.as_of_block) sends one
// block per field: where the ratings were read from — `live` (rebuilt by
// the producers' own estimators after finished matches) or `frozen` (the
// committed research bundle, with the named reason it is not live) — and
// `as_of`, the date of the LAST FINISHED MATCH the ratings include. The
// label is a statement about evidence, never about a clock: a live build
// that added no new match carries its frozen corpus's last match date.
// An absent block draws nothing — never a guessed date.

export interface RatingsAsOfPart {
  path?: string;
  source?: "live" | "frozen";
  /** why a frozen part is not live, in the backend's own vocabulary */
  reason?: string | null;
  field?: string | null;
  build_id?: number | null;
  as_of?: string | null;
  as_of_match?: string | null;
  built_at?: string | null;
  results_added?: number | null;
  pinned_passes?: number | string | null;
  bridges?: number | null;
}

export interface RatingsAsOf {
  /** YYYY-MM-DD of the last finished match included; null when a part
   *  could not say */
  as_of?: string | null;
  source?: "live" | "frozen" | "mixed";
  parts?: RatingsAsOfPart[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
                "Sep", "Oct", "Nov", "Dec"];

/** "12 Oct 2026" from "2026-10-12" — the date as written, no timezone
 *  arithmetic (it is a match DATE, not an instant). */
export function asOfDate(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return null;
  const mo = MONTHS[Number(m[2]) - 1];
  return mo ? `${Number(m[3])} ${mo} ${m[1]}` : null;
}

const REASON_WORDS: Record<string, string> = {
  no_live_build_yet: "no live rebuild yet",
  not_a_live_field: "not rebuilt live",
  live_store_unreachable: "live store unreachable",
  live_doc_digest_mismatch: "live copy failed its checksum",
  live_doc_unparseable: "live copy unreadable",
  forced_frozen: "frozen by design",
  live_display_off_in_this_process: "live rebuild off",
};

/** The short label: "as of 12 Oct 2026". Null when nothing was sent. */
export function asOfLabel(a: RatingsAsOf | null | undefined): string | null {
  const d = asOfDate(a?.as_of);
  return d ? `as of ${d}` : null;
}

/** The full sentence for a tooltip or a lede line: what the date is, and
 *  whether the ratings were rebuilt live or read from the frozen bundle
 *  (with why). */
export function asOfSentence(a: RatingsAsOf | null | undefined): string | null {
  if (!a) return null;
  const d = asOfDate(a.as_of);
  const parts = a.parts ?? [];
  const live = parts.filter((p) => p.source === "live");
  const frozen = parts.filter((p) => p.source === "frozen");
  const why = [...new Set(frozen.map((p) => REASON_WORDS[p.reason ?? ""]
    ?? p.reason).filter(Boolean))].join("; ");
  const last = live.map((p) => p.as_of_match).filter(Boolean)[0];
  const head = d ? `Ratings as of ${d}, the last finished match they include`
    : "Ratings date not stated";
  if (a.source === "live")
    return `${head}${last ? ` (${last})` : ""} — rebuilt after finished matches by the same estimators as the frozen measurement.`;
  if (a.source === "frozen")
    return `${head} — the frozen measurement${why ? ` (${why})` : ""}.`;
  return `${head} — partly rebuilt live, partly the frozen measurement${why ? ` (${why})` : ""}; the date is the older part's.`;
}

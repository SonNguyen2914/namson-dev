// A READER IS SHOWN A SENTENCE, NEVER AN INTERNAL TOKEN.
//
// THE DEFECT, ON THE LIVE BOARD (2026-09-14). The La Liga column printed
// this to a reader, as body text on a public page:
//
//     kalshi unavailable — 429 Client Error: Too Many Requests for url:
//     https://api.elections.kalshi.com/trade-api/v2/markets?
//
// That is a raw Python exception string. Two separate things are wrong
// with it and fixing one does not fix the other:
//
//   1. THE READER IS HANDED MACHINE TEXT THEY CANNOT ACT ON. "429 Client
//      Error" is a `requests` repr, not a sentence; the query fragment is
//      not even a complete one.
//   2. AN INTERNAL ENDPOINT IS PUBLISHED. The provider's host, its API
//      path and the parameters we send it all went onto the page.
//
// THIS IS NOT "HIDE THE ERROR". The board genuinely could not read the
// book and must still say so — THE ABSENCE IS NAMED, with the provider
// named and the reason in plain language. The status code is a fact and
// stays: 429 tells the operator something a shrug does not. What must
// not reach the page is the URL, the query string and the exception's
// own formatting.
//
// THE RULE ALREADY EXISTS HERE for its neighbouring case — a slug is an
// internal key and must never reach the operator
// (`e2e/no-raw-slug-reaches-the-reader.spec.ts`, and `LOOKS_LIKE_A_SLUG`
// in `e2e/live-surface-audit.spec.ts`). `restructure.spec.ts` keeps the
// same rule against the browser's own vocabulary: "a dead network
// renders a sentence, not the browser's raw string". This module is that
// one rule extended to the third source of machine text — the provider's
// exception, which arrives through the backend rather than from the
// browser, and which nothing screened until now.
//
// WHAT THIS MODULE IS NOT. It is not a sanitiser that edits a string
// until it looks presentable. A string either survives as PROSE — the
// backend's own honest sentence, "picker board unavailable", "standings
// fetch failed" — or it does not, and then the reader is given a
// sentence written HERE, in this file's own words, composed of nothing
// taken from the raw text but the status number. There is no path by
// which a fragment of an unrecognised provider string reaches the page.

/** One provider failure, as a reader may be shown it. */
export interface ProviderFailure {
  /** THE SENTENCE. Either the source's own surviving words, when they
   *  are prose, or this module's classification of the failure when they
   *  are not. Never a fragment of machine text. */
  said: string;
  /** The HTTP status the raw text carried, when it carried one in a
   *  shape that MEANS a status. A fact, and the one piece of a machine
   *  string a reader can act on. Null when there was none to read. */
  status: number | null;
  /** True when the raw text was changed on its way to `said` — anything
   *  stripped, or the whole of it replaced by a classification. */
  redacted: boolean;
  /** The untouched original. FOR THE OPERATOR, never for the page:
   *  `announceFailure` is the only thing that should read it. */
  raw: string;
}

/* ── what gets taken out, and what marks a string as machine text ──── */

/** `scheme://anything-not-space`. */
const URL_ANYWHERE = /\b[a-z][a-z0-9+.-]*:\/\/\S+/gi;
/** A bare host, with or without a port and path — `api.example.com/v2`.
 *  Deliberately a TLD LIST rather than `\.[a-z]{2,}`: the latter also
 *  eats `requests.exceptions.HTTPError`, and a prefix we strip silently
 *  is a prefix nothing can notice has gone wrong. Anything host-shaped
 *  that this misses still cannot reach the page — it fails the prose
 *  test below and the whole string is replaced. */
const HOSTISH =
  /\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|dev|app|co|us|uk|eu|ai|xyz|cloud|sh|me|tv|gg|info|biz|edu|gov|int|local|internal|localhost)\b(?::\d+)?(?:\/\S*)?/gi;
/** `requests`' own tail: ` for url: <the endpoint we called>`. Removed
 *  before the URL patterns so the words go with the address. */
const FOR_URL_TAIL = /\s*\bfor\s+url\s*:?\s*\S*/gi;
/** `requests`' own head: `429 Client Error: `. */
const REQUESTS_HTTP = /^\s*\d{3}\s+(?:client|server)\s+error\s*:\s*/i;
/** One or more Python exception classes at the front:
 *  `ConnectionError: `, `requests.exceptions.HTTPError: `. */
const EXC_PREFIX =
  /^\s*(?:[A-Za-z_][A-Za-z0-9_.]*(?:Error|Exception|Warning|Timeout|Failure|Fault)\s*:\s*)+/;

/** MACHINE TEXT SPLICED INTO A SENTENCE, IN PARENTHESES. The backend
 *  composes several notes this way — `"the snapshot store could not be
 *  read (" + store_error + "), so this is not a finding that none was
 *  captured"` (src/picker/review.py:426, :451, :472) — and the sentence
 *  around it is a good one worth keeping. A head-strip cannot reach an
 *  exception in the middle of a line, so the parenthetical comes out
 *  whole and the prose closes over the gap. */
const PARENTHETICAL_MACHINE =
  /\s*\((?=[^)]*(?:\b[A-Za-z_][A-Za-z0-9_.]*(?:Error|Exception|Warning|Timeout)\b|:\/\/))[^)]*\)/g;

/** Shapes that are machine text wherever they appear. */
const TRACEBACK = /Traceback \(most recent call last\)|File "[^"]*", line \d+/;
/** An exception class left ANYWHERE after the strips above — the
 *  backstop for a splice this module did not anticipate the shape of.
 *  Whatever reaches here is replaced whole rather than half-cleaned. */
const INLINE_EXC = /\b[A-Za-z_][A-Za-z0-9_.]*(?:Error|Exception)\s*:/;
const MARKUP = /<[^>]+>/;
const JSONISH = /[{}]|\[['"]/;
const QUERY_STRING = /[?&][A-Za-z_][\w.-]*=/;
/** A URL PATH, not "and/or" or "24/7": a token that starts with a slash
 *  and carries another one. `/trade-api/v2/markets` matches; the two
 *  ordinary uses of a slash in English do not. */
const PATHISH = /(?:^|\s)\/[\w.~%-]+(?:\/[\w.~%-]*)+/;
/** HOW `OSError` NAMES THE FILE IT COULD NOT OPEN, and the one shape
 *  that was walking past every test above (found 2026-09-16, not in the
 *  audit that prompted this file's other change).
 *
 *      FileNotFoundError: [Errno 2] No such file or directory:
 *      'research_archive/goals_cross_league_2026-09-09/league_levels.json'
 *
 *  Strip the exception class and what is left has spaces, no braces, no
 *  query string, no host, and a path that PATHISH does not see because
 *  it is RELATIVE and opens against a quote rather than a space. So the
 *  whole line survived the prose test and an internal repository path
 *  and a C errno went onto the page — the same defect this module was
 *  written for, arriving through the one door it had left open.
 *
 *  Two shapes rather than one broadened PATHISH, because they are two
 *  facts: a quoted token carrying a slash is a path wherever it appears,
 *  and `[Errno 12]` is a number out of errno.h that no reader can act
 *  on. Neither can occur in a sentence the backend composed — those are
 *  screened by `provider_failure` before they are served. */
const QUOTED_PATH = /['"][^'"\s]*\/[^'"\s]*['"]/;
const ERRNO = /\[Errno \d+\]/i;

/** An HTTP reason phrase is NOT a sentence. "Too Many Requests" is the
 *  wire's word for 429 — it survives every strip above intact and looks
 *  like prose, which is exactly how the original defect would have
 *  half-escaped the fix. Classified instead. */
const BARE_REASON = new Set([
  "bad request", "unauthorized", "payment required", "forbidden",
  "not found", "method not allowed", "not acceptable",
  "proxy authentication required", "request timeout", "conflict", "gone",
  "length required", "precondition failed", "payload too large",
  "uri too long", "unsupported media type", "range not satisfiable",
  "expectation failed", "unprocessable entity", "too many requests",
  "request header fields too large", "internal server error",
  "not implemented", "bad gateway", "service unavailable",
  "gateway timeout", "http version not supported",
]);

/** The status, read ONLY from a shape that means one. A bare three-digit
 *  number inside a sentence ("104 clubs") is not an HTTP status, and
 *  reporting it as one would be this codebase's own recurring bug —
 *  a field taken to mean what a requirement assumed it meant. */
function statusIn(s: string): number | null {
  const m = /\b(\d{3})\s+(?:client|server)\s+error\b/i.exec(s)
    ?? /\b(?:http|https|status(?:\s+code)?|code|answered|returned|responded(?:\s+with)?)\b\W{0,4}(\d{3})\b/i.exec(s)
    ?? /\b(\d{3})\b(?=\s+(?:from|for)\b)/i.exec(s);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 100 && n <= 599 ? n : null;
}

/* ── the four failures with no status, and what each one is called ────
 *
 * THE BACKEND IS THE PRODUCER AND ITS SPELLING WINS. These are
 * `src/picker/provider_failure._NO_STATUS`'s `reason()` column, word for
 * word — that module's own header says this file is "word for word the
 * frontend's `classify()`", and until 2026-09-16 it was not: this file
 * had THREE of the four and spelt one of those differently. A sentence
 * composed there and a sentence composed here are shown in the same
 * places, so two dialects read as two different failures.
 *
 * WHY THIS COPY CANNOT BE DERIVED AWAY. `classify` runs exactly when the
 * backend's sentence did NOT survive the prose test above — there is no
 * payload left to read the words off. A process boundary and two
 * languages sit between the two lists, and the frontend is a static
 * build that cannot import Python. So the copy stays and is pinned
 * instead: `e2e/a-missing-file-is-not-an-answer.spec.ts` on this side,
 * and the backend's own cross-repo suite is where the two files can
 * actually be read against each other. */
const NO_STATUS = {
  timeout: "no answer in time",
  /** NOT "the provider could not be reached". The subject came off on
   *  2026-09-16: the backend carries none here, every caller already
   *  names what it was reading, and a sentence that names the provider
   *  itself says it twice — or names the wrong one on `api/main.py`'s
   *  four-provider column, which passes "its upstream" precisely
   *  because it does not know which provider failed. */
  unreachable: "could not be reached",
  /** MISSING IS NOT UNREACHABLE, AND THAT DISTINCTION IS THE WHOLE
   *  BRANCH. A frozen artifact that is simply not on disk is not a
   *  provider that would not answer: one is a file to go and put back,
   *  the other is a network to go and look at, and they send an
   *  operator to different places. The backend learnt this inside the
   *  fix for the same class of bug; this file did not learn it at all,
   *  and reported a file that was never there as "no answer we could
   *  read" — which ASSERTS the provider answered. */
  missing: "nothing was there to read",
  unreadable: "no answer we could read",
} as const;

/** A file that was never there, in the words the messages use. The
 *  backend decides this from the exception TYPE (`FileNotFoundError`,
 *  `NotADirectoryError`); nothing crosses the wire but text, so this
 *  side reads the type NAME and the phrase those types carry. */
const MISSING_WORDS =
  /\bFileNotFoundError\b|\bNotADirectoryError\b|\bno such file or directory\b|\bnot a directory\b/i;
/** A provider that would not answer. Deliberately tested AFTER
 *  `MISSING_WORDS`: this list is broad enough for a filesystem message
 *  to wander into it — a path under `/Volumes/network-share/` carries
 *  "network" — and folding a missing file into a network outage is the
 *  exact mistake the branch above exists to stop. */
const UNREACHABLE_WORDS =
  /\b(?:connection|unreachable|refused|resolve|dns|network|max retries|ssl|certificate)\b/i;
const TIMEOUT_WORDS = /\btimed?\s*out\b|\btimeout\b/i;

/** THIS MODULE'S OWN WORDS FOR A FAILURE IT COULD NOT READ A SENTENCE
 *  OUT OF. Subject-less wherever the backend's is: every caller already
 *  names the provider it was talking to ("Kalshi prices could not be
 *  read — …"), and a reason that named one too would say it twice or,
 *  worse, name the wrong one. */
function classify(status: number | null, raw: string): string {
  if (status === 429) return "too many requests too quickly";
  if (status === 401 || status === 403) return "our credentials were refused";
  if (status === 404) return "nothing at the address we asked for";
  if (status === 408 || status === 504) return "no answer in time";
  if (status != null && status >= 500) return "the provider's own service failed";
  if (status != null && status >= 400) return "the request was refused";
  if (TIMEOUT_WORDS.test(raw)) return NO_STATUS.timeout;
  if (MISSING_WORDS.test(raw)) return NO_STATUS.missing;
  if (UNREACHABLE_WORDS.test(raw)) return NO_STATUS.unreachable;
  return NO_STATUS.unreadable;
}

/** The four no-status sentences, for a guard that has to name them.
 *  Exported so `e2e/a-missing-file-is-not-an-answer.spec.ts` asserts the
 *  SET rather than a hand-typed subset of it — a guard that enumerates
 *  three of four is how this drift survived in the first place. */
export const NO_STATUS_REASONS = NO_STATUS;

/** Read a provider failure into something a reader may be shown.
 *
 *  Returns null for an empty string, so a caller cannot draw a failure
 *  box over nothing — an empty reason is not a reason. */
export function readFailure(
  rawIn: string | null | undefined,
): ProviderFailure | null {
  const raw = (rawIn ?? "").trim();
  if (!raw) return null;
  const status = statusIn(raw);
  const flat = raw.replace(/\s+/g, " ").trim();
  let head = flat
    .replace(PARENTHETICAL_MACHINE, "")
    .replace(FOR_URL_TAIL, " ")
    .replace(URL_ANYWHERE, " ")
    .replace(HOSTISH, " ")
    .replace(/\s+/g, " ")
    .trim();
  /* THE HEADS COME OFF IN A LOOP, not in one pass each. They nest:
     `requests.exceptions.HTTPError: 404 Client Error: Not Found` is an
     exception class in front of a `requests` status line, and a single
     ordered pass leaves whichever one was second — which is how "404
     Client Error: Not Found" would have reached the page looking as
     though it had been cleaned. */
  for (let i = 0; i < 6; i += 1) {
    const next = head.replace(REQUESTS_HTTP, "").replace(EXC_PREFIX, "");
    if (next === head) break;
    head = next;
  }
  const stripped = head
    .replace(/\s+/g, " ")
    .replace(/^[\s:;,.—–-]+/, "")
    .replace(/[\s:;,—–-]+$/, "")
    .trim();
  /* IS WHAT SURVIVED A SENTENCE? Everything here is a reason to REFUSE
     it; nothing here edits it further. A string that fails any one of
     these is replaced wholesale, so no unrecognised fragment can reach
     the page through a gap between two patterns. */
  const machine = stripped.length === 0
    || stripped.length > 240
    || !/\s/.test(stripped)              // one token is a token, not prose
    || TRACEBACK.test(stripped)
    || INLINE_EXC.test(stripped)
    || MARKUP.test(stripped)
    || JSONISH.test(stripped)
    || QUERY_STRING.test(stripped)
    || PATHISH.test(stripped)
    || QUOTED_PATH.test(stripped)
    || ERRNO.test(stripped)
    || BARE_REASON.has(stripped.toLowerCase());
  return {
    said: machine ? classify(status, raw) : stripped,
    status,
    redacted: machine || stripped !== flat,
    raw,
  };
}

/** THE READER'S HALF OF THE NOTE, ASSEMBLED ONCE.
 *
 *  `{said}` plus the status, and the status only when the sentence does
 *  not already carry that number — "plays feed 502 (HTTP 502)" says it
 *  twice and reads as two facts. */
export function failureSentence(f: ProviderFailure): string {
  if (f.status == null) return f.said;
  if (f.said.includes(String(f.status))) return f.said;
  return `${f.said} (HTTP ${f.status})`;
}

/** WHERE THE RAW TEXT GOES INSTEAD.
 *
 *  The operator does sometimes need the provider's own string — which
 *  endpoint, which parameters — and the answer to that is NOT to print
 *  it in the column body. It goes to the console, which is where an
 *  operator debugging a column already looks and where a reader of the
 *  board does not. Same treatment `ErrorBoundary` already gives the
 *  error it catches.
 *
 *  Once per distinct (site, string): a column re-renders on every sort
 *  change and a warning per render is a console nobody reads. */
const announced = new Set<string>();
export function announceFailure(
  where: string, f: ProviderFailure | null | undefined,
): void {
  if (!f || typeof window === "undefined") return;
  const key = `${where} ${f.raw}`;
  if (announced.has(key)) return;
  announced.add(key);
  console.warn(`[trivela] ${where} — the provider said:`, f.raw);
}

// A FAILED READ, NAMED — the status and the backend's own sentence.
//
// Written 2026-09-25 for the surfaces that used to throw both away: the
// match hubs and the friendly page reduced every failure to
// `Promise.reject(r.status)` then `.catch(() => setErr(true))` and said
// only "unavailable"; the Hunter page called every non-404 "backend
// unreachable", a 503 from a backend that plainly answered included. The
// landing board has always carried the backend's `detail` forward
// (pickerApi `readBoard`), and this is that rule, shared.
//
// The sentence goes through `readFailure`, so a Python repr or a URL in
// `detail` is replaced by a plain one rather than printed on the page.
import { readFailure } from "./providerFailure";

/** "HTTP 503 — <the backend's sentence>", or "HTTP 503" when it sent none. */
export async function failureOf(r: Response): Promise<string> {
  let said = "";
  try {
    const b = await r.json();
    const pick = b?.detail ?? b?.error;
    if (typeof pick === "string") said = pick;
  } catch { /* not JSON: the status is all there is */ }
  const f = readFailure(said);
  return f ? `HTTP ${r.status} — ${f.said}` : `HTTP ${r.status}`;
}

/** The sentence for a fetch that threw: the request never got an answer.
 *  Kept apart from `failureOf` on purpose — "never answered" and
 *  "answered 503" are different facts. */
export const NEVER_ANSWERED =
  "the request never got an answer — the connection failed or the server "
  + "did not respond";

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

/** WHERE THE PARAMETER WAS (FastAPI's `loc`): `["query", "leagues"]`
 *  reads "leagues", the request part dropped. */
const LOC_PART = new Set(["query", "body", "path", "header", "cookie"]);

function locText(loc: unknown): string {
  if (!Array.isArray(loc)) return "";
  const parts = loc.filter((x) => typeof x === "string" || typeof x === "number")
    .map(String);
  if (parts.length > 1 && LOC_PART.has(parts[0])) parts.shift();
  return parts.join(".");
}

/** THE BACKEND'S REASON, AS TEXT — NEVER "[object Object]".
 *
 *  The live Cups tab, 2026-10-13: the backend refused the board's
 *  `?leagues=` with a 422 whose `detail` was FastAPI's validation ARRAY
 *  (`[{type, loc, msg, input, ctx}]`), and the board's failure card
 *  printed `${detail}` — "[object Object]". FastAPI sends `detail` in
 *  two shapes and both are read here:
 *
 *    - a string (`HTTPException(422, "date must be YYYYMMDD …")`):
 *      returned as it is;
 *    - an array of validation errors: "the server refused the request
 *      (HTTP 422) — " then each one "<where>: <msg>", joined with "; ".
 *      A pattern mismatch's `msg` carries the raw regex, which is machine
 *      text (providerFailure would replace the whole line); it reads "the
 *      value is not in a form the server accepts" instead.
 *
 *  Falls back to `error` (this site's own proxies answer `{error}`), and
 *  to "" when neither holds a readable sentence — the caller then names
 *  the status. Recorded bodies of both shapes:
 *  e2e/board-422-recorded.ts, held by e2e/a-refusal-names-its-reason.spec.ts. */
export function detailText(body: unknown, status?: number): string {
  if (body === null || typeof body !== "object") return "";
  const b = body as { detail?: unknown; error?: unknown };
  for (const pick of [b.detail, b.error]) {
    const t = reasonText(pick);
    if (!t) continue;
    if (typeof pick === "string") return t;
    return `the server refused the request${status ? ` (HTTP ${status})` : ""} — ${t}`;
  }
  return "";
}

function reasonText(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) {
    return v.map((x) => reasonText(x)).filter(Boolean).join("; ");
  }
  if (v !== null && typeof v === "object") {
    const o = v as { loc?: unknown; msg?: unknown; message?: unknown;
                     type?: unknown };
    let msg = typeof o.msg === "string" ? o.msg.trim()
      : typeof o.message === "string" ? o.message.trim() : "";
    if (o.type === "string_pattern_mismatch" || /should match pattern/i.test(msg)) {
      msg = "the value is not in a form the server accepts";
    }
    if (!msg) return "";
    const where = locText(o.loc);
    return where ? `${where}: ${msg}` : msg;
  }
  return "";
}

/** "HTTP 503 — <the backend's sentence>", or "HTTP 503" when it sent none. */
export async function failureOf(r: Response): Promise<string> {
  let said = "";
  try {
    said = detailText(await r.json());
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

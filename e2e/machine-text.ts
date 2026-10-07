import { expect } from "@playwright/test";

// A READER IS SHOWN A SENTENCE, NEVER AN INTERNAL TOKEN — the shapes.
//
// Moved here verbatim from e2e/no-machine-text-reaches-the-reader.spec.ts
// on 2026-10-07, whose header carries the defect and the reasoning, so a
// second surface screens with the SAME list: Playwright will not let one
// spec file import another, and a hand-typed copy is how two guards that
// name one rule drift apart. (Not a .spec.ts, so the runner does not
// collect it.)

/** Every shape that is machine text wherever it appears, with the words
 *  a failure message should use instead. Derived from what the providers
 *  actually emit — `requests`' `HTTPError` repr, `urllib3`'s pool
 *  errors, an upstream HTML error page — not from a list of strings a
 *  spec happens to send. */
export const MACHINE_TEXT: readonly (readonly [RegExp, string])[] = [
  [/[a-z][a-z0-9+.-]*:\/\//i, "a URL scheme"],
  [/\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|dev|app|co|uk|ai)\b/i, "a hostname"],
  [/\bfor\s+url\b/i, "`requests`' own `for url:` tail"],
  [/[?&][A-Za-z_][\w.-]*=/, "a query string"],
  [/\b[A-Za-z_][A-Za-z0-9_.]*(?:Error|Exception)\s*:/,
    "a Python exception class"],
  [/\b\d{3}\s+(?:Client|Server)\s+Error\b/i, "a `requests` status line"],
  [/Traceback \(most recent call last\)/, "a traceback"],
  [/File "[^"]*", line \d+/, "a stack frame"],
  [/<\s*\/?\s*(?:html|body|head|h1|title|pre|div)\b/i, "raw HTML"],
  // What the BACKEND emits, not a provider: the live-state refusal ends
  // on `(live_feed._fail_until)` — the route citing its own module. None
  // of the shapes above sees it (no scheme, no TLD, no exception class).
  [/\(\s*[a-z_][a-z0-9_]*(?:\.[A-Za-z_]\w*)+\s*\)/, "a source-code pointer"],
];

export function assertNoMachineText(where: string, text: string) {
  for (const [shape, what] of MACHINE_TEXT) {
    const hit = shape.exec(text);
    expect(hit, `${where} shows ${what} — "${hit?.[0]}" — to a reader. `
      + "A reader is shown a sentence, never an internal token.")
      .toBeNull();
  }
}

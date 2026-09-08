import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

// EVERY READER OF AN HTTP BODY IN suggesterApi.ts MUST REFUSE THE SAME
// THINGS (2026-09-07).
//
// There are three, and they drifted. `fetchWatchedStrip` and `wlJson`
// both refuse `body === null || typeof body !== "object"`, with the
// reason written out beside them: a 200 that is not a payload must not
// reach a caller that will read it as a record, because
// `body.matches` on a non-record is `undefined` and `undefined`
// renders as the empty state — "nothing is declared", off an answer
// nobody could read.
//
// `getJson`, the reader every one of the twenty-odd endpoints in `api`
// goes through, guarded `null` and `undefined` ONLY. So a 200 carrying
// `0`, `false`, `"error"` or a bare number was cast straight to T.
//
// THE SET IS DERIVED, NOT TYPED. A reader is any function in that file
// that parses the response body; the spec finds them by their parse and
// asserts the refusal, so a FOURTH reader added tomorrow is held to the
// same rule on the day it is written — which is exactly what a
// hand-listed pair could not do, and why these three came apart.

const SRC = readFileSync(
  join(__dirname, "..", "src", "lib", "suggesterApi.ts"), "utf8");

/** name -> source, for every function in suggesterApi.ts that parses an
 *  HTTP body. Bodies are cut at the next top-level `function` or
 *  `export`, which is how this file is laid out. */
function bodyReaders(): Record<string, string> {
  const starts = [...SRC.matchAll(
    /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)];
  const out: Record<string, string> = {};
  starts.forEach((m, i) => {
    const from = m.index ?? 0;
    const to = i + 1 < starts.length ? (starts[i + 1].index ?? SRC.length)
      : SRC.length;
    const body = SRC.slice(from, to);
    if (/JSON\.parse\(\s*raw\s*\)/.test(body)) out[m[1]] = body;
  });
  return out;
}

test.describe("every body reader refuses the same non-payloads", () => {
  test("the derivation actually found the readers", () => {
    const readers = bodyReaders();
    const names = Object.keys(readers).sort();
    // A parse that matched nothing would make every assertion below
    // vacuously true — the failure mode this whole spec is about.
    expect(names.length).toBeGreaterThanOrEqual(3);
    expect(names).toContain("getJson");
    expect(names).toContain("fetchWatchedStrip");
    expect(names).toContain("wlJson");
  });

  for (const [name, body] of Object.entries(bodyReaders())) {
    test(`${name} refuses a body that is not an object`, () => {
      expect(body, `${name} parses an HTTP body but never refuses a `
        + "non-object one, so a 200 carrying a JSON scalar reaches its "
        + "caller cast to the payload type — where every field read off "
        + "it is `undefined` and renders as the empty state")
        .toMatch(/typeof\s+body\s*!==\s*["']object["']/);
    });

    test(`${name} refuses a null body`, () => {
      expect(body).toMatch(/body\s*===\s*null/);
    });

    test(`${name} throws on the refusal rather than returning`, () => {
      // The refusal must not be a log or a default. Each of these
      // functions ends in `return body as <Type>`; the guard is only
      // worth anything if it stops that line being reached, so the
      // throw must come BETWEEN the guard and the cast.
      const guardAt = body.search(/typeof\s+body\s*!==\s*["']object["']/);
      const castAt = body.search(/return\s+body\s+as\s/);
      const throwAt = body.indexOf("throw new", guardAt);
      expect(guardAt).toBeGreaterThan(-1);
      expect(castAt).toBeGreaterThan(-1);
      expect(throwAt).toBeGreaterThan(guardAt);
      expect(throwAt).toBeLessThan(castAt);
    });
  }

  test("a JSON scalar is not JSON-parse-proof, so the guard is the only "
    + "thing standing between it and a caller", () => {
    // Stated as a fact about the runtime, not about our code: these all
    // parse successfully, which is why the try/catch above the guard
    // cannot catch them.
    for (const raw of ["0", "false", '"error"', "12.5", "null"]) {
      expect(() => JSON.parse(raw)).not.toThrow();
      expect(typeof JSON.parse(raw)).not.toBe("undefined");
    }
    expect(typeof JSON.parse("[]")).toBe("object");   // arrays still pass
  });
});

import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_DAYS } from "../src/lib/pickerApi";
import { DEFAULT_BACK, MAX_BACK, REVIEW_WINDOWS } from "../src/lib/pickerReview";

/* ONE WINDOW, READ IN TWO DIRECTIONS.
 *
 * A league column tells one continuous story: the fixtures above the
 * divider and the finished tail below it open at the SAME length, or the
 * tail reads as a separate page about somebody else's week. That has been
 * the rule since the tail was built.
 *
 * WHAT IT WAS ENFORCED BY UNTIL 2026-09-16: a comment. `DEFAULT_DAYS = 8`
 * was a private constant of pages/bet-suggester/index.tsx and
 * `DEFAULT_BACK = 8` was a second literal in lib/pickerReview.ts, three
 * lines under a comment reading
 *
 *     "7 is the default because it MATCHES THE BOARD'S FORWARD WINDOW"
 *
 * Both halves of that sentence were false at once. The value was not 7,
 * and the forward window was not 7 either — the operator moved both
 * windows to 8 on 2026-09-15 and only one of the two copies knew.
 * `REVIEW_WINDOWS` did not contain 7 at all. A comment that documents a
 * value the code does not hold is worse than no comment, because it is
 * read as a check somebody performed.
 *
 * SO THE NUMBER IS DERIVED NOW AND THIS ASSERTS THE DERIVATION, NOT THE
 * EQUALITY. `DEFAULT_BACK === DEFAULT_DAYS` passes against BOTH the old
 * source and the new one — both literals read 8 on the day the drift was
 * found — so a runtime check alone would be exactly the guard that let
 * this happen. The test that fails without the fix is the SOURCE one
 * below: the back window may not be a number of its own.
 *
 * THE BACKEND'S 7 IS A DIFFERENT NUMBER FOR A DIFFERENT CALLER, and is
 * not a drift. `picker/review.DEFAULT_BACK_DAYS = 7` is what
 * GET /api/picker/review answers somebody who names no window; this
 * frontend names one on every request, so that default is never the
 * tail's length. Verified rather than assumed: the request assertions in
 * picker.spec.ts ("both windows open at 8 days") read the query string
 * off the wire.
 */

const SRC = (p: string) =>
  readFileSync(join(__dirname, "..", "src", p), "utf8");

// ══ 1. THE DERIVATION, WHICH IS THE PART THAT CAN ROT ════════════════

test("the back window is DERIVED from the forward one, not a second number",
  () => {
    const src = SRC("lib/pickerReview.ts");
    const line = /^\s*export const DEFAULT_BACK\s*=\s*(.+?);\s*$/m.exec(src);
    expect(line, "DEFAULT_BACK is not declared where this guard can read it")
      .not.toBeNull();
    const rhs = line![1].trim();
    /* A NUMBER HERE IS THE BUG, whatever number it is. `DEFAULT_BACK = 7`
       and `DEFAULT_BACK = 8` are the same defect one day apart. */
    expect(rhs, "the back window is a literal again — it must be read from "
      + "the forward window, or the two are free to disagree and only a "
      + "comment will say they do not")
      .not.toMatch(/^-?\d+(\.\d+)?$/);
    expect(rhs).toBe("DEFAULT_DAYS");
    expect(src, "pickerReview must import the forward window rather than "
      + "restate it").toMatch(/import\s*\{[^}]*\bDEFAULT_DAYS\b[^}]*\}\s*from\s*"\.\/pickerApi"/);
  });

test("the forward window is declared ONCE, in the lib, and the page reads it",
  () => {
    /* THE OTHER HALF OF THE FORK. Deriving the back window is worth
       nothing if a page re-declares the forward one: two boards would
       then ask for two lengths and the tail would follow whichever lib
       it imported. */
    const lib = SRC("lib/pickerApi.ts");
    expect(lib).toMatch(/^export const DEFAULT_DAYS\s*=\s*\d+;\s*$/m);
    const page = SRC("pages/bet-suggester/index.tsx");
    expect(page, "the landing page declares a forward window of its own")
      .not.toMatch(/^\s*const DEFAULT_DAYS\s*=/m);
    expect(page, "the landing page must import the one constant")
      .toMatch(/import\s*\{[^}]*\bDEFAULT_DAYS\b[^}]*\}\s*from\s*"\.\.\/\.\.\/lib\/pickerApi"/);
  });

// ══ 2. AND THE VALUES STILL AGREE, WHICH IS WHAT IT IS ALL FOR ═══════

test("both directions open at the same length, and the endpoint would accept it",
  () => {
    expect(DEFAULT_BACK).toBe(DEFAULT_DAYS);
    /* NON-VACUOUS: 0 would satisfy "they are equal" and show a reader an
       empty board and an empty tail. */
    expect(DEFAULT_DAYS).toBeGreaterThan(0);
    /* THE ENDPOINT 422s OUTSIDE 1..30 RATHER THAN CLAMPING, so a default
       past the ceiling is not a shorter tail, it is no tail at all. */
    expect(DEFAULT_BACK).toBeLessThanOrEqual(MAX_BACK);
  });

test("the window list offers the default and stays in order", () => {
  /* IT DID NOT. `REVIEW_WINDOWS` read [1, 3, 8, 14, 30] under a comment
     about 7 — the one value the comment named was the one value the list
     omitted. It is built from the default now, so it cannot omit it. */
  expect(REVIEW_WINDOWS).toContain(DEFAULT_BACK);
  expect([...REVIEW_WINDOWS].sort((a, b) => a - b)).toEqual([...REVIEW_WINDOWS]);
  expect(new Set(REVIEW_WINDOWS).size).toBe(REVIEW_WINDOWS.length);
  for (const w of REVIEW_WINDOWS) {
    expect(w, "the endpoint 422s outside 1..30").toBeGreaterThanOrEqual(1);
    expect(w).toBeLessThanOrEqual(MAX_BACK);
  }
});

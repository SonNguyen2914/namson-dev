/** THE COLUMN ORDER AND THE PALETTE ARE ONE DECISION.
 *
 *  The board holds eight columns and draws four, so any two leagues can
 *  appear side by side EXCEPT a pair sitting exactly four apart in the
 *  reading order — the window can never hold both. That is the whole
 *  reason four more leagues could be given hues at all: the palette had
 *  already spent its separable range, so each new league took the
 *  colour of the one league it can never be seen beside.
 *
 *  Which makes the reading order load-bearing in a way nothing on the
 *  page says out loud. Reorder it and the impossible pairs move; two
 *  hues designed never to be co-visible become co-visible, and the
 *  symptom — "these two leagues look the same" — points at the palette,
 *  which is fine, instead of at a list in a different file, which is
 *  where the change was.
 *
 *  So this reads BOTH sources and asserts they still describe the same
 *  four pairs. It is a source-level guard on purpose: the drift it
 *  catches is invisible on screen until the window happens to land on
 *  the pair, which on an eight-column loop may be a while. */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PICKER_COLUMN_ORDER } from "../src/lib/pickerApi";

const VIEW = 4; // mirrors index.tsx — four drawn of eight held

/** The pairs the window can NEVER show together, from the order alone. */
function impossiblePairs(order: readonly string[]) {
  const n = order.length;
  const out = new Set<string>();
  for (let i = 0; i < n; i++) {
    out.add([order[i], order[(i + VIEW) % n]].sort().join("|"));
  }
  return out;
}

/** The pairs globals.css CLAIMS, read out of the hue comments. */
function claimedPairs() {
  // __dirname, not import.meta: playwright transpiles these specs to
  // CommonJS, where import.meta is a syntax error at load time — the
  // whole file fails to parse, so nothing in it runs.
  const css = readFileSync(
    join(__dirname, "..", "src", "styles", "globals.css"), "utf8");
  // e.g. `--lg-ligue1: #c86ef5;  /* orchid — shadow of the EPL */`
  const NAME: Record<string, string> = {
    "mls": "mls", "liga mx": "ligamx", "the epl": "epl", "epl": "epl",
    "la liga": "laliga", "bundesliga": "bundesliga", "serie a": "seriea",
    "ligue 1": "ligue1", "eredivisie": "eredivisie",
  };
  const out = new Set<string>();
  const re = /--lg-([a-z0-9]+):[^;]+;\s*\/\*[^*]*?shadow of (?:the )?([a-z ]+?)\s*\*\//gi;
  for (const m of css.matchAll(re)) {
    const partner = NAME[m[2].trim().toLowerCase()];
    expect(partner,
      `globals.css names "${m[2]}" as a shadow partner and this test does `
      + `not know that league — add it to NAME rather than loosening the regex`)
      .toBeTruthy();
    out.add([m[1], partner].sort().join("|"));
  }
  return out;
}

test.describe("the reading order is a declaration, and the palette depends on it", () => {
  test("every hue's stated shadow partner is a pair the window cannot show",
    async () => {
      const claimed = claimedPairs();
      // NON-VACUITY: if the regex ever stops matching, an empty set would
      // be a subset of anything and this guard would pass forever.
      expect(claimed.size).toBe(4);
      const impossible = impossiblePairs(PICKER_COLUMN_ORDER);
      for (const p of claimed) {
        expect([...impossible], `globals.css claims ${p.replace("|", " / ")} `
          + `can never be co-visible, but PICKER_COLUMN_ORDER `
          + `(${PICKER_COLUMN_ORDER.join(", ")}) puts them within one window`)
          .toContain(p);
      }
    });

  test("and the order is exactly the eight the operator declared, in his order",
    async () => {
      /* Spelled out rather than derived. This is the one place the
         operator's sentence of 2026-09-14 is written as code — "the top
         five, then Eredivisie, then MLS, then Liga MX" — and a test that
         re-derived it from the source it is checking would assert
         nothing. If this line has to change, it is because he said so. */
      expect(PICKER_COLUMN_ORDER).toEqual([
        "epl", "laliga", "bundesliga", "seriea", "ligue1", "eredivisie",
        "mls", "ligamx",
      ]);
    });

  test("a shuffled order WOULD break the palette — the guard can fail",
    async () => {
      /* The first test's whole value is that it goes red when the order
         moves. Proving that here means the guard cannot quietly become
         a tautology if `impossiblePairs` is ever broken. */
      const shuffled = [...PICKER_COLUMN_ORDER];
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      const impossible = impossiblePairs(shuffled);
      const claimed = claimedPairs();
      const kept = [...claimed].filter((p) => impossible.has(p));
      expect(kept.length,
        "swapping two adjacent columns left every shadow pair intact, which "
        + "means impossiblePairs() is not reading the order at all")
        .toBeLessThan(claimed.size);
    });
});

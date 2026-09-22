/** ONE HUE LOOKUP, AND IT IS A TEST RATHER THAN A CONVENTION
 *  (2026-09-22).
 *
 *  `hueOf` in components/PickerColumn.tsx is the single place a league
 *  slug becomes a colour. The rule has been written down since the tab
 *  strip shipped — LeagueTabs.tsx's header calls building
 *  `var(--lg-${slug})` by concatenation "how a colourless pill shipped
 *  on 2026-09-15: it is right for eight slugs and silently empty for the
 *  ninth" — and on 2026-09-22 the board's own hero was still doing
 *  exactly that, four lights built by interpolation, one file away from
 *  the paragraph explaining why not.
 *
 *  ── WHY A RULE IN PROSE WAS NOT ENOUGH ──────────────────────────────
 *
 *  Because the defect it prevents is INVISIBLE at the moment it is
 *  written. `background: var(--lg-nope)` is not a CSS error and not a
 *  runtime error; an undeclared custom property resolves to nothing and
 *  the declaration is simply dropped. A 1.5px dot that failed to paint
 *  and a 1.5px dot that painted are the same screenshot. So the
 *  interpolation is correct on the day it is written — for the slugs
 *  that exist that day — and turns into a colourless control the first
 *  time a competition joins the board without a token, which is a
 *  different commit, in a different file, by a different author.
 *
 *  `hueOf` cannot fail that way: a slug it does not know leaves it
 *  wearing `--lg-cup`, which paints, which is wrong LOUDLY. The
 *  fallback's own audit lives in nothing-ahead-is-not-nothing.spec.ts
 *  ("no league column is painted in the brand gold"), and that check
 *  only has jurisdiction over colours that went through the door.
 *
 *  ── WHY AN AST WALK AND NOT A GREP ──────────────────────────────────
 *
 *  The two best-informed lines in this tree on the subject are the two
 *  that spell the defective construction out in full: LeagueTabs.tsx's
 *  header, and the note left at the call site this test was written for.
 *  A regex over the file bytes reports both, so the guard would begin
 *  life needing an allowlist of the very comments that teach the rule —
 *  and an allowlist keyed to line numbers or file names is the thing
 *  that quietly stops covering the case it was named for.
 *
 *  So the check parses. TypeScript's own scanner decides what is code
 *  and what is commentary, which is not a judgement this file is
 *  qualified to make about `.tsx` anyway, and comments simply are not
 *  nodes. Prose may say `var(--lg-${slug})` as often as it is useful;
 *  only an expression that BUILDS one fails.
 *
 *  THE FILE SET IS WALKED, NOT LISTED. A guard that names a rule and
 *  then enumerates a hand-typed subset of the files it applies to stays
 *  green while the omitted file drifts — this tree has already paid for
 *  that once, with a boot-time check that listed two of three planes.
 *  Every `.ts`/`.tsx` under src/ is read, and the walk asserts it found
 *  the file the rule is actually about.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

import { expect, test } from "@playwright/test";
import ts from "typescript";

import { hueOf } from "../src/components/PickerColumn";
import { PICKER_COLUMN_ORDER } from "../src/lib/pickerApi";
import { serveEight, BOARD_EIGHT } from "./eight-columns";

const SRC = join(__dirname, "..", "src");

/** every TypeScript source under src/, derived from the tree. */
function sources(dir = SRC, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) sources(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

/** A NAME BUILT AT RUNTIME, wherever the pieces come from. Two shapes
 *  reach a `--lg-*` property name from a value:
 *    - a template with a substitution, `` `var(--lg-${slug})` `` — and
 *      the Tailwind arbitrary-value spelling `bg-[var(--lg-${slug})]`
 *      is the same node;
 *    - string concatenation, `"var(--lg-" + slug + ")"`, which is what
 *      the same mistake looks like after a lint rule bans templates.
 *  Both are caught at the point the token PREFIX meets a value; what
 *  the result is then handed to (a style prop, setProperty, a class)
 *  does not change what it is. */
function builtHueNames(file: string): { line: number; text: string }[] {
  const src = ts.createSourceFile(
    file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true,
    /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const hits: { line: number; text: string }[] = [];

  const at = (n: ts.Node) => ({
    line: src.getLineAndCharacterOfPosition(n.getStart(src)).line + 1,
    text: n.getText(src).replace(/\s+/g, " ").slice(0, 120),
  });

  const walk = (n: ts.Node) => {
    /* A template literal that has substitutions AND whose static halves
       mention the token prefix. `head` is the part before the first
       `${`, so `--lg-${slug}` puts the prefix at the end of a chunk;
       testing every chunk keeps it honest about `${a}--lg-${b}` too. */
    if (ts.isTemplateExpression(n)) {
      const chunks = [n.head.text, ...n.templateSpans.map((s) => s.literal.text)];
      if (chunks.some((c) => c.includes("--lg-"))) hits.push(at(n));
    }
    /* `"…--lg-" + something`. Only the LEFT side is asked about: a
       literal ending in the prefix is the half that makes the next
       value a token name. */
    if (ts.isBinaryExpression(n)
      && n.operatorToken.kind === ts.SyntaxKind.PlusToken
      && ts.isStringLiteralLike(n.left)
      && n.left.text.includes("--lg-")
      && !ts.isStringLiteralLike(n.right)) hits.push(at(n));
    ts.forEachChild(n, walk);
  };
  walk(src);
  return hits;
}

test("no file under src/ builds a --lg-* token name from a value — the "
   + "one door a slug becomes a colour through is hueOf()", () => {
  const files = sources();
  /* THE WALK FOUND THE FILES THE RULE IS ABOUT. A `sources()` that
     returned nothing, or that missed the page this guard was written
     for, would pass the assertion below without reading a line. */
  expect(files.length).toBeGreaterThan(20);
  const rel = files.map((f) => relative(SRC, f));
  expect(rel).toContain(join("pages", "bet-suggester", "index.tsx"));
  expect(rel).toContain(join("components", "LeagueTabs.tsx"));
  expect(rel).toContain(join("components", "PickerColumn.tsx"));

  const offences = files.flatMap((f) =>
    builtHueNames(f).map((h) => `${relative(SRC, f)}:${h.line}  ${h.text}`));

  expect(offences, "these build a league-hue custom property name from a "
    + "runtime value. An undeclared --lg-* resolves to nothing and the "
    + "declaration is dropped in silence, so the control paints as an "
    + "empty box the first time a slug arrives without a token. Call "
    + "hueOf(slug) instead — it is the single lookup, and an unmapped "
    + "slug comes back wearing the cup fallback, which is visibly wrong "
    + `rather than invisibly absent:\n  ${offences.join("\n  ")}`)
    .toEqual([]);
});

test("hueOf answers the same token the interpolation used to build, for "
   + "every slug the board can declare", () => {
  /* THE SUBSTITUTION IS AN IDENTITY, PROVEN RATHER THAN ASSERTED IN A
     COMMIT MESSAGE. Replacing `var(--lg-${s})` with `hueOf(s)` is only
     a no-op for slugs `hueOf` has an entry for; for any other it swaps
     an empty declaration for the cup gold, which is a CHANGE — the
     right one, and still one nobody should discover from a screenshot.
     So the two are compared over every column the board can declare
     (PICKER_COLUMN_ORDER, the operator's order) plus the cups that join
     it from `board.leagues`, and the four lights of the hero. */
  const hero = ["mls", "epl", "laliga", "ligamx"];
  const cups = ["ucl", "eflcup"];
  const every = [...new Set([...PICKER_COLUMN_ORDER, ...cups, ...hero])];
  expect(every.length).toBeGreaterThanOrEqual(10);

  const moved = every.filter((s) => hueOf(s) !== `var(--lg-${s})`);
  expect(moved, `hueOf answers something other than the token the old `
    + `interpolation built for: ${moved.map((s) => `${s} -> ${hueOf(s)}`)
      .join(", ")}. The four hero lights and every board column must be `
    + `the colour they were before the lookup moved.`).toEqual([]);

  /* AND THE FALLBACK IS STILL THE FALLBACK — the half of `hueOf` that
     makes it safe. A slug with no entry does not come back empty. */
  expect(hueOf("a-competition-nobody-has-mapped")).toBe("var(--lg-cup)");
});

test("the hero's four league lights are painted, and each is its own "
   + "league's ink", async ({ page }) => {
  /* READ OFF THE PAINT, NOT THE PROP. The whole defect this guard is
     about resolves to a dropped declaration rather than to a wrong
     value, so an assertion on the style attribute would have passed on
     the broken version too. `getComputedStyle` is where an unresolved
     custom property becomes visible: `rgba(0, 0, 0, 0)`. */
  await serveEight(page);
  const lights = await page.getByTestId("hero-light").evaluateAll((els) =>
    els.map((e) => [e.getAttribute("data-slug")!,
      getComputedStyle(e).backgroundColor] as const));

  expect(lights.map(([s]) => s)).toEqual(["mls", "epl", "laliga", "ligamx"]);

  const seen = new Map<string, string>();
  for (const [slug, ink] of lights) {
    expect(ink, `the hero's ${slug} light is unpainted — its custom `
      + "property resolved to nothing").toMatch(/^rgba?\((?!0, 0, 0, 0\))/);
    expect(seen.get(ink), `${slug} and ${seen.get(ink)} light the hero in `
      + `one ink (${ink})`).toBeUndefined();
    seen.set(ink, slug);
  }

  /* AND THE SAME INK THE COLUMN USES. A hero light that agreed with
     nothing below it would be decoration; these four are the board's
     own wayfinding, read twice on one page. */
  const rails = await page.getByTestId("league-col").evaluateAll((els) =>
    els.map((e) => [e.getAttribute("data-league")!,
      getComputedStyle(e).getPropertyValue("--lg").trim()] as const));
  const byCol = new Map(rails);
  for (const [slug, ink] of lights) {
    const col = byCol.get(slug);
    if (!col) continue;   // a light for a league this board did not send
    const resolved = await page.evaluate((v) => {
      const probe = document.createElement("i");
      probe.style.color = v;
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, col);
    expect(ink, `the hero's ${slug} light and its column's rail are two `
      + "different inks for one league").toBe(resolved);
  }
  expect(Object.keys((BOARD_EIGHT as { leagues: object }).leagues).length)
    .toBeGreaterThan(0);
});

/** every slug `hueOf` has an ENTRY for, read off the map itself rather
 *  than typed here. A hand-written list would be the second copy of
 *  LEAGUE_HUE and would go stale the first time a competition was added
 *  to the real one — which is the exact week this check matters. */
function mappedSlugs(): string[] {
  const file = join(SRC, "components", "PickerColumn.tsx");
  const src = ts.createSourceFile(
    file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true,
    ts.ScriptKind.TSX);
  let slugs: string[] = [];
  const walk = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && n.name.getText(src) === "LEAGUE_HUE"
      && n.initializer && ts.isObjectLiteralExpression(n.initializer)) {
      slugs = n.initializer.properties.flatMap((p) =>
        ts.isPropertyAssignment(p) ? [p.name.getText(src).replace(/["']/g, "")]
          : []);
    }
    ts.forEachChild(n, walk);
  };
  walk(src);
  return slugs;
}

test("every colour hueOf can answer resolves to a real one — a map entry "
   + "is not the same thing as a declared token", async ({ page }) => {
  /* THE GAP THE OTHER HALF OF THIS FILE DOES NOT COVER, found on
     2026-09-22 while proving the guard above fires.
     `hueOf` is safe against an UNMAPPED slug: it falls through to
     `--lg-cup` and the control paints gold, wrong and loud. It is NOT
     safe against a mapped slug whose token has gone — `seriea` was
     given its entry and its token in one commit, and deleting the
     token alone puts the silent-empty defect right back, on the inside
     of the one door, where the AST check above has no jurisdiction and
     the brand-gold audit in nothing-ahead-is-not-nothing.spec.ts sees
     an ink that is not gold and passes it.
     So the map's ANSWERS are resolved, in a browser, one probe each:
     the only place a `var()` that names nothing becomes visible. */
  const slugs = mappedSlugs();
  expect(slugs.length, "LEAGUE_HUE was not found in PickerColumn.tsx — this "
    + "check read an empty map and would pass on anything")
    .toBeGreaterThanOrEqual(10);
  expect(slugs).toContain("seriea");

  await serveEight(page);
  /* …and the fallback itself, which no slug in the map points at and
     which every unmapped one lands on. */
  const answers = [...slugs, "a-competition-nobody-has-mapped"]
    .map((s) => [s, hueOf(s)] as const);

  const dead = await page.evaluate((pairs) => {
    const out: string[] = [];
    for (const [slug, value] of pairs) {
      const probe = document.createElement("i");
      probe.style.backgroundColor = "rgb(1, 2, 3)";   // a sentinel
      probe.style.backgroundColor = value;
      document.body.append(probe);
      const got = getComputedStyle(probe).backgroundColor;
      probe.remove();
      /* Two ways a token that names nothing shows up: the declaration
         is dropped (the sentinel survives) or it resolves transparent. */
      if (got === "rgb(1, 2, 3)" || got === "rgba(0, 0, 0, 0)") {
        out.push(`${slug} -> ${value} -> ${got}`);
      }
    }
    return out;
  }, answers as unknown as [string, string][]);

  expect(dead, "hueOf answers these slugs with a custom property that "
    + "resolves to nothing, so the control they paint is invisible rather "
    + `than wrong: ${dead.join(", ")}`).toEqual([]);
});

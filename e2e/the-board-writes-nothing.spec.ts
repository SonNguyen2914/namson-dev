import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
import { HOLDOUT_URL, BOARD_HOLDOUT, UPSTREAM_URL } from "./backend";

// THE BOARD IS THE ONE ROUTE ON THE BACKEND THAT WRITES.
//
// `GET /api/picker/board` calls `snapshots.capture_rows` on every
// assembly: it freezes a pre-kickoff row for every fixture on the board,
// first-write-wins, on a table with no delete path and no intention of
// ever having one. A capture taken at the wrong moment is that fixture's
// pre-kickoff read for ever — on 2026-09-14 three stray requests froze
// Champions League matchday 2 twenty-nine days out and it took a
// migration to correct, not to remove. `pickerApi.ts` says the same
// thing from this side: "snapshots.capture_rows freezes the whole row on
// every production assembly".
//
// This suite pointed at that backend by default and ran on every PR.
//
// TWO GUARDS, DOING TWO DIFFERENT JOBS. They are not redundant and
// neither one alone is enough.
//
//   THE HOLD-OUT (e2e/board-holdout.mjs) is the one that actually stops
//   it. It sits on the single socket between the app under test and the
//   backend, so it catches every way the board can be reached — a
//   `goto`, a CLICK on the "MLS board" link that no reading of a spec
//   file will ever see, a server render, a spec's own `request.get`, a
//   redirect. The first test below is that hold-out being MEASURED
//   rather than assumed.
//
//   THE STATIC GUARD (the rest of this file) is about authoring
//   hygiene, and it is the reason a spec keeps owning its own fixture
//   instead of leaning on the hold-out's refusal. It reads the spec
//   files and reports any test that can reach the board without routing
//   it.
//
// WHY THE LIST IS DERIVED AND NOT TYPED. A guard that names a rule and
// then enumerates the files it applies to stays green while the file it
// forgot drifts — this project has already lost a league to exactly
// that, for as long as a test called "both planes" listed two of three.
// So the file set is `fs.readdirSync` over e2e/, the call graph is real,
// and a new spec is inside this guard the moment it is saved.

const E2E_DIR = __dirname;

// WHICH NAVIGATIONS ACTUALLY FETCH A BOARD. Two conditions, both read
// off `src/pages/bet-suggester/index.tsx`, which is the only caller of
// `fetchBoard` in the whole app:
//
//   1. the pathname is exactly /bet-suggester. A match page under
//      /bet-suggester/mls/<id>, or /bet-suggester/leagues, fetches none.
//
//   2. there is NO `league` query parameter. `?league=<anything>` — an
//      empty value and a wrong-case "WC26" included — is the legacy
//      deep link, and index.tsx redirects it: `if (deepLink !== null)
//      return; // redirecting; do not fetch`. The board read never
//      happens on that load.
//
// CONDITION 2 IS MEASURED, NOT READ OFF THE SOURCE AND HOPED FOR. The
// first draft of this guard had only condition 1 and reported 44 tests,
// most of them `?league=` deep links that fetch nothing. What caught it
// was running the suite against a counting stand-in for the backend
// WITH THE HOLD-OUT TAKEN OUT OF THE PATH: the board counter stayed at
// zero, which is not a hold-out working, it is a probe that never asked
// for a board. A control that cannot go red measures nothing.
const BOARD_PATHNAME = "/bet-suggester";

/** Does this query string carry a `league` parameter at all? PRESENCE,
 *  not truthiness — index.tsx is explicit that "?league=" with an empty
 *  value is still a deep link. */
const hasLeagueParam = (query: string): boolean =>
  query.split("&").some((kv) => kv === "league" || kv.startsWith("league="));

// A concrete board request, used to decide whether a route pattern
// would have caught one. Patterns are tested against a real URL rather
// than compared as strings, so `**/api/**` counts and a typo does not.
const BOARD_REQUEST = "http://localhost:3123/api/picker/board?days=8";

/** Playwright's URL-glob semantics: `**` spans separators, `*` does not,
 *  `?` is one character. Written out rather than approximated with
 *  `includes("picker/board")`, which would call a comment a mock. */
function globToRegExp(glob: string): RegExp {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") { out += ".*"; i++; } else { out += "[^/]*"; }
    } else if (c === "?") {
      out += ".";
    } else if ("\\^$+.()|{}[]".includes(c)) {
      out += "\\" + c;
    } else {
      out += c;
    }
  }
  return new RegExp("^" + out + "$");
}

type Ref = { file: string; name: string };
type Summary = {
  navigatesBoard: boolean;
  routesBoard: boolean;
  calls: Ref[];
};
const empty = (): Summary =>
  ({ navigatesBoard: false, routesBoard: false, calls: [] });
const merge = (a: Summary, b: Summary): Summary => ({
  navigatesBoard: a.navigatesBoard || b.navigatesBoard,
  routesBoard: a.routesBoard || b.routesBoard,
  calls: [...a.calls, ...b.calls],
});

/** THE ONE WAY TO SAY "THIS TEST READS THE BOARD FOR REAL".
 *
 *  Written above the test (or above the loop that generates it) as
 *
 *      // board-live-read: <why this test must not mock the board>
 *
 *  THE ESCAPE HATCH CANNOT CAUSE A WRITE, and that is what makes it a
 *  reasonable thing to have. It exempts a test from the MOCK rule only;
 *  the hold-out still refuses the request, so an opted-in test reads the
 *  hold-out's named 503 rather than a board assembly. What it buys is a
 *  spec like a-cold-load-is-not-a-skeleton, whose entire claim is that
 *  the BUILT app and the real proxy route still ask for a board on
 *  mount — a claim a `page.route` mock would answer on the app's behalf
 *  and turn into a tautology.
 *
 *  A REASON IS REQUIRED, and asserted below. A bare marker is a way to
 *  silence a guard; a marker with a sentence is a decision someone can
 *  disagree with later. */
const LIVE_READ = /\/\/\s*board-live-read:\s*(\S.*)/;

type FileFacts = {
  file: string;
  funcs: Map<string, Summary>;
  imports: Map<string, Ref>;
  hooks: Summary;
  tests: {
    title: string; line: number; summary: Summary; liveRead: string | null;
  }[];
};

/** Does this navigation argument land on the board page?
 *  `null` means "could not be read statically", which is treated as a
 *  board navigation: a target this guard cannot resolve is a target it
 *  cannot clear, and the safe direction is to ask for a mock. */
function navTargetIsBoard(
  arg: ts.Expression, consts: Map<string, string>,
): boolean {
  let text: string | null = null;
  if (ts.isStringLiteralLike(arg)) {
    text = arg.text;
  } else if (ts.isTemplateExpression(arg)) {
    // Only the static head is knowable. `/bet-suggester/mls/${id}` is
    // decided by it; `${base}/x` is not.
    text = arg.head.text || null;
    if (text === "") text = null;
  } else if (ts.isNoSubstitutionTemplateLiteral(arg)) {
    text = arg.text;
  } else if (ts.isIdentifier(arg) && consts.has(arg.text)) {
    text = consts.get(arg.text)!;
  }
  if (text === null) return true;           // unreadable -> conservative
  const withoutHash = text.split("#")[0];
  const pathname = withoutHash.split("?")[0];
  if (pathname !== BOARD_PATHNAME) return false;
  const query = withoutHash.includes("?")
    ? withoutHash.slice(withoutHash.indexOf("?") + 1) : "";
  if (hasLeagueParam(query)) return false;  // deep link: redirects, no fetch
  // A template whose static head stops at "/bet-suggester" may still be
  // interpolating "?league=..." after it, and this guard cannot know.
  // Unreadable resolves to "reaches the board", as everywhere else here.
  if (ts.isTemplateExpression(arg) && query === "") return true;
  return true;
}

/** Would this `page.route(...)` pattern have caught a board request?
 *
 *  BOTH UNREADABLE CASES ANSWER "NO", AND THE FIRST DRAFT ANSWERED
 *  "YES". Letting an unparsed pattern count as a board mock read as the
 *  generous choice — never invent an offender out of a spec you failed
 *  to parse — and it silently cleared three files that mock no board at
 *  all: `page.route(BRACKET_URL, ...)` in missing-is-not-zero,
 *  `page.route(path, ...)` in suggestion-card, and every template-literal
 *  pattern in friendlies. A guard whose unknowns resolve to "fine" is
 *  the guard that stays green while the case it forgot drifts, which is
 *  the failure this file is written against. So unknowns resolve to
 *  "not a board mock", and the answer to a false alarm is to teach the
 *  reader below another shape rather than to widen the escape hatch. */
function routePatternHitsBoard(
  arg: ts.Expression, consts: Map<string, string>,
): boolean {
  if (ts.isStringLiteralLike(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
    return globToRegExp(arg.text).test(BOARD_REQUEST);
  }
  // `**/api/comp/${COMP}` — the static spans are known and each hole
  // could be anything, so the hole is `.*` and the spans still decide it.
  if (ts.isTemplateExpression(arg)) {
    let src = globToRegExp(arg.head.text).source.replace(/^\^|\$$/g, "");
    for (const span of arg.templateSpans) {
      src += ".*" + globToRegExp(span.literal.text).source.replace(/^\^|\$$/g, "");
    }
    return new RegExp("^" + src + "$").test(BOARD_REQUEST);
  }
  if (ts.isIdentifier(arg) && consts.has(arg.text)) {
    return globToRegExp(consts.get(arg.text)!).test(BOARD_REQUEST);
  }
  if (ts.isRegularExpressionLiteral(arg)) {
    const m = /^\/(.*)\/([a-z]*)$/.exec(arg.text);
    if (!m) return false;
    try { return new RegExp(m[1], m[2]).test(BOARD_REQUEST); } catch { return false; }
  }
  return false;
}

const calleeName = (e: ts.CallExpression): string | null => {
  if (ts.isPropertyAccessExpression(e.expression)) return e.expression.name.text;
  if (ts.isIdentifier(e.expression)) return e.expression.text;
  return null;
};

function readFile(file: string): FileFacts {
  // PER FILE, NOT SHARED. One map across the suite let a `PAGE` or a
  // `BRACKET_URL` in one spec answer for the same name in another.
  const consts = new Map<string, string>();
  const src = ts.createSourceFile(
    file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const facts: FileFacts = {
    file, funcs: new Map(), imports: new Map(), hooks: empty(), tests: [],
  };

  // File-level string constants, so `page.goto(PAGE)` is readable.
  const collectConsts = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const init = n.initializer;
      if (ts.isStringLiteralLike(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
        consts.set(n.name.text, init.text);
      }
    }
    ts.forEachChild(n, collectConsts);
  };
  collectConsts(src);

  for (const st of src.statements) {
    if (ts.isImportDeclaration(st) && st.importClause?.namedBindings
        && ts.isNamedImports(st.importClause.namedBindings)
        && ts.isStringLiteral(st.moduleSpecifier)
        && st.moduleSpecifier.text.startsWith(".")) {
      const target = path.resolve(path.dirname(file),
        st.moduleSpecifier.text.replace(/\.js$/, "") + ".ts");
      for (const el of st.importClause.namedBindings.elements) {
        facts.imports.set(el.name.text, {
          file: target, name: (el.propertyName ?? el.name).text,
        });
      }
    }
  }

  /** Everything this subtree does, INCLUDING nested arrow bodies — a
   *  `page.route` handler written inline is still a route this scope
   *  installed. Nested named functions get their own entry too, so a
   *  helper defined beside the tests is resolvable by name. */
  const summarize = (node: ts.Node): Summary => {
    const out = empty();
    const walk = (n: ts.Node) => {
      if (ts.isCallExpression(n)) {
        const name = calleeName(n);
        if (name === "goto" && n.arguments.length > 0
            && navTargetIsBoard(n.arguments[0], consts)) {
          out.navigatesBoard = true;
        }
        if (name === "route" && n.arguments.length > 0
            && routePatternHitsBoard(n.arguments[0], consts)) {
          out.routesBoard = true;
        }
        if (name && !["goto", "route"].includes(name)) out.calls.push({ file, name });
      }
      ts.forEachChild(n, walk);
    };
    ts.forEachChild(node, walk);
    return out;
  };

  const isTestCall = (n: ts.CallExpression): string | null => {
    const e = n.expression;
    const isTest = (ts.isIdentifier(e) && e.text === "test")
      || (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression)
          && e.expression.text === "test"
          && ["only", "fail", "fixme"].includes(e.name.text));
    if (!isTest) return null;
    const [title, fn] = n.arguments;
    if (!title || !fn) return null;
    if (!ts.isFunctionLike(fn)) return null;
    return ts.isStringLiteralLike(title) ? title.text : "<computed title>";
  };

  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n)) {
      const title = isTestCall(n);
      if (title !== null) {
        const { line } = src.getLineAndCharacterOfPosition(n.getStart());
        // Up through the enclosing statements, so the directive may sit
        // above a `for` loop that generates several tests rather than
        // having to be repeated inside it.
        let liveRead: string | null = null;
        for (let up: ts.Node | undefined = n; up && !liveRead; up = up.parent) {
          const ranges = ts.getLeadingCommentRanges(src.text, up.getFullStart()) ?? [];
          const at = ranges.findIndex((r) =>
            LIVE_READ.test(src.text.slice(r.pos, r.end)));
          if (at !== -1) {
            // `//` trivia arrives one line per range, so the reason is
            // the marker line plus the lines under it — the whole
            // sentence, not the first forty characters of it.
            liveRead = ranges.slice(at)
              .map((r) => src.text.slice(r.pos, r.end))
              .join(" ")
              .replace(LIVE_READ, "$1")
              .replace(/\/\//g, " ")
              .replace(/\s+/g, " ")
              .trim();
          }
          if (ts.isSourceFile(up)) break;
        }
        facts.tests.push({
          title, line: line + 1, summary: summarize(n.arguments[1]), liveRead,
        });
      }
      const name = calleeName(n);
      if (["beforeEach", "beforeAll"].includes(name ?? "")
          && ts.isPropertyAccessExpression(n.expression)) {
        facts.hooks = merge(facts.hooks, summarize(n));
      }
    }
    // Named helpers, so a call to one resolves to what it does.
    if (ts.isFunctionDeclaration(n) && n.name) {
      facts.funcs.set(n.name.text, summarize(n));
    }
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer
        && ts.isFunctionLike(n.initializer)) {
      facts.funcs.set(n.name.text, summarize(n.initializer));
    }
    ts.forEachChild(n, visit);
  };
  visit(src);
  return facts;
}

// ---------------------------------------------------------------------
// THE FILE SET IS READ, NOT LISTED.
const files = fs.readdirSync(E2E_DIR)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => path.join(E2E_DIR, f))
  .sort();

const byFile = new Map<string, FileFacts>();
for (const f of files) byFile.set(f, readFile(f));

/** Resolve a call to what the called thing does, across files, to a
 *  fixed point. `serveEight(page)` routes the board and then navigates
 *  to it; a spec that calls it has done both, and must not be reported
 *  for the navigation it delegated. */
function resolve(summary: Summary, file: string, seen = new Set<string>()): Summary {
  let out = { ...summary, calls: [] as Ref[] };
  for (const call of summary.calls) {
    const facts = byFile.get(file);
    const ref = facts?.imports.get(call.name)
      ?? (facts?.funcs.has(call.name) ? { file, name: call.name } : null);
    if (!ref) continue;
    const key = `${ref.file}#${ref.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const target = byFile.get(ref.file)?.funcs.get(ref.name);
    if (!target) continue;
    out = merge(out, resolve(target, ref.file, seen));
  }
  return out;
}

type Offender = { file: string; title: string; line: number };
const offenders: Offender[] = [];
const liveReaders: (Offender & { reason: string })[] = [];
for (const [file, facts] of byFile) {
  if (!file.endsWith(".spec.ts")) continue;
  if (path.basename(file) === path.basename(__filename).replace(/\.js$/, ".ts")) continue;
  const hooks = resolve(facts.hooks, file);
  for (const t of facts.tests) {
    const eff = merge(resolve(t.summary, file), hooks);
    if (!eff.navigatesBoard || eff.routesBoard) continue;
    const where = { file: path.basename(file), title: t.title, line: t.line };
    if (t.liveRead) liveReaders.push({ ...where, reason: t.liveRead });
    else offenders.push(where);
  }
}

test("the app under test cannot reach the production board at all", async ({ request }) => {
  test.skip(!BOARD_HOLDOUT,
    "SUGGESTER_E2E_BOARD=live was set deliberately — the hold-out is out "
    + "of the path by request, and this assertion has nothing to hold");

  // THE PROBE GOES THROUGH THE APP, not to the hold-out directly.
  // Reaching the hold-out only proves the hold-out is running; what has
  // to be true is that the APP is talking to it. A server adopted by
  // `reuseExistingServer` keeps whatever backend it booted with, so
  // "the hold-out is up" and "the hold-out is in the path" are
  // genuinely different claims and only the second one is protection.
  // The `request` fixture carries the config's own baseURL, so this
  // asks the app the suite actually started rather than a port typed in
  // here — SUGGESTER_E2E_PORT exists precisely so a second checkout can
  // move it.
  const probe = await request.get("/api/mls/schedule?days=1&__holdout_probe=1");
  const body = await probe.json().catch(() => ({}));
  expect(body, `the app under test answered a hold-out probe without the `
    + `hold-out's sentinel, so it is NOT talking to the hold-out — it is `
    + `talking to ${UPSTREAM_URL} directly, and a board GET from this run `
    + `would write a permanent snapshot there. A stale 'npm start' on port `
    + `3123 adopted by reuseExistingServer is the usual cause: kill it and `
    + `re-run.`).toHaveProperty("__board_holdout", true);

  // And the hold-out's own count of what it let through.
  const ledger = await (await request.get(`${HOLDOUT_URL}/__holdout/ledger`)).json();
  expect(ledger.forwarded_board,
    "the hold-out forwarded a board request upstream").toBe(0);
});

test("every spec that can reach the board also mocks it", async () => {
  // The offenders are printed in full rather than counted: the failure
  // has to name the test to fix, or it becomes a number someone raises.
  const report = offenders
    .map((o) => `  ${o.file}:${o.line}  "${o.title}"`).join("\n");
  expect(offenders, "These tests navigate to the board without routing "
    + "**/api/picker/board**. Each one is a live board assembly on "
    + "whatever backend the suite is pointed at, and a board assembly "
    + "WRITES a permanent pre-kickoff snapshot. Mock it — "
    + "page.route(\"**/api/picker/board**\", ...) or serveEight(page) "
    + `from e2e/eight-columns.ts:\n${report}\n`).toEqual([]);
});

test("every live board read is declared, with a reason", async () => {
  // THE OPT-INS ARE PRINTED, NOT JUST COUNTED. A list of exemptions
  // nobody ever sees becomes the list nobody ever shortens, so the set
  // is stated on every run and each entry has to carry a sentence
  // saying why a mock would not do.
  const shown = liveReaders
    .map((o) => `  ${o.file}:${o.line}  "${o.title}"\n      ${o.reason}`)
    .join("\n");
  console.log(`board-live-read declarations (${liveReaders.length}):\n${shown}`);
  const thin = liveReaders.filter((o) => o.reason.length < 20);
  expect(thin, "a board-live-read directive needs a reason, not a token: "
    + "it is the one marker in this suite that turns a guard off, and the "
    + "next reader has to be able to disagree with it").toEqual([]);
});

test("the guard can see the specs it claims to read", async () => {
  // A derived list that silently derives NOTHING is the failure mode
  // this whole file exists to avoid: an analyzer that parses no tests
  // reports no offenders and looks exactly like a clean suite. So the
  // guard states what it found, and fails if the answer is implausible.
  const specs = files.filter((f) => f.endsWith(".spec.ts"));
  const tests = [...byFile.values()].reduce((n, f) => n + f.tests.length, 0);
  const navs = [...byFile.entries()].filter(([f, facts]) =>
    f.endsWith(".spec.ts")
    && facts.tests.some((t) => resolve(t.summary, f).navigatesBoard)).length;
  expect(specs.length, "no spec files were read").toBeGreaterThan(30);
  expect(tests, "no tests were parsed out of the spec files").toBeGreaterThan(200);
  expect(navs, "no board navigation was found anywhere in the suite, which "
    + "means this guard is reading something other than the specs")
    .toBeGreaterThan(5);
});

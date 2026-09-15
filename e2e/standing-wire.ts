// THE EMITTER'S OWN DECLARATION, RECORDED — KEY NAMES, NOTHING ELSE.
//
// WHAT WAS WRONG. `DECLARED` in e2e/standing.ts mirrors
// `api/main.py::watched_strip_standing_blocks()` in the other
// repository, and its own header names it "the one thing here that can
// go stale". The guard it pointed at — "the hoist moves exactly the
// keys this recorded payload carries" — catches a MISSPELLED key: a
// misspelling matches nothing, the block it belongs to moves nothing,
// and the block drops out of the result. It does not catch a MISSING
// one. Sixteen keys moving satisfies "every block moved something"
// exactly as well as seventeen do, and the seventeenth goes on riding
// on every match, unnoticed, forever.
//
// `read` was short by `a_rate_needs_time` — the second-largest hoisted
// key at 3,818 bytes/match — from the day the mirror was written. No
// spec failed, because no spec was looking.
//
// That is the shape this codebase found five times in one day: a guard
// that asserts a SUBSET moved and therefore stops LOOKING at the entry
// left out. `standing.book_is_per_fixture` had no guard at all until
// 2026-09-13. This file is the answer for this one.
//
// WHY COMPLETENESS NEEDS A SOURCE OUTSIDE THE LOOP. The v2 fixtures are
// produced BY `toV2()` FROM `DECLARED`, so no fixture can testify about
// `DECLARED`: checking one against the other only proves the mirror
// agrees with itself, and a key absent from both is absent from the
// question. `WIRE` below is that outside source, and the guard in
// watched-strip.spec.ts asserts SET EQUALITY against it in BOTH
// directions — per block, and over the block names themselves. A key
// MISSING from the mirror is red. A key the mirror INVENTS is red. A
// block missing or invented is red.
//
// ============ WHERE `WIRE` CAME FROM
//
// OFF THE WIRE, from production's own `standing_blocks`. Probed
// 2026-09-14, GET /api/bet-suggester/watched-strip with the operator
// credential:
//
//     HTTP 200, version "watched-strip-v2", 27 matches
//     standing_blocks.blocks: 6 blocks, 33 keys
//     standing_blocks.where:  33 entries, agreeing key for key
//     /api/ready code_revision 6eb14a1 — backend #129, the change
//       that emits v2
//
// AND THE ENVELOPE CARRIES THE DECLARATION, NOT THE SUBSET THAT MOVED,
// which is the fact that makes this recording COMPLETE rather than one
// more subset. api/main.py builds the envelope as
//
//     standing_blocks = watched_strip_standing_blocks()
//     ... "where": watched_strip_standing_where(standing_blocks),
//         "blocks": standing_blocks,
//
// — the registry verbatim, before any match is walked. `_hoisted()`
// consults it per match and drops what it matches, but nothing filters
// `blocks` by what any match happened to carry. So a key the route
// declares and no fixture sends is STILL on the envelope, and reading
// key names off it is reading the declaration itself. Had `blocks`
// been assembled from what moved, this recording would have inherited
// the very blindness it exists to close.
//
// NAMES ONLY, AND THAT IS A RULE RATHER THAN A TIDINESS. The strip is
// operator-only because it carries POSITIONS — stated size and price
// paid, the two fields the journal's public projection redacts. The
// payload may never be committed, printed, or written to disk. What is
// recorded here is thirty-three identifiers and no value of any kind.
// Re-record the same way: fetch the envelope, take
// `Object.keys(standing_blocks.blocks)` and the key names under each,
// keep nothing else.
//
// CROSS-CHECKED AGAINST THE SOURCE, because one reading is a
// transcription and two readings are a check. An AST walk of backend
// `origin/main` — `api/main.py::watched_strip_standing_blocks()` with
// `**live_read.STANDING` expanded from src/live/live_read.py — returned
// the same 33 keys over the same 6 blocks, key for key. That walk is
// not a one-off: `readBackendDeclaration()` below re-runs it, and the
// second guard in watched-strip.spec.ts runs it whenever a backend
// checkout resolves.
//
// ============ WHAT EACH GUARD CAN AND CANNOT SEE
//
// The two are not redundant and neither subsumes the other:
//
//   `DECLARED` vs `WIRE` is HERMETIC. It runs on every runner, every
//     time, and it is the guard that catches the defect. What it
//     cannot see is `WIRE` itself going stale — both halves are in
//     this repository, so the day the emitter declares a
//     thirty-fourth key, nothing here knows.
//
//   `WIRE` vs the BACKEND SOURCE is the freshness check, and it is the
//     only thing that can see that. It needs the other repository on
//     the tree, so it does not run everywhere.
//
// A SKIP IS NOT A PASS, and it is stated rather than left to be
// discovered: this repository's CI checks out no backend and cannot —
// SonNguyen2914/TRIVELA is private, so there is no credential-free
// mirror of the pinned public checkout the backend's own CI uses in
// the other direction. Wiring one would mean putting a token in this
// repository's workflow, which is a decision for whoever owns the
// token and not one to take inside a test file. So the cross-repo
// check reports SKIPPED WITH ITS REASON — never green, never a quiet
// early return, which is the exact failure this repo fixed on
// 2026-09-13 — and the guard that catches the defect does not depend
// on it having run.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** `api/main.py::watched_strip_standing_blocks()` as production emits
 *  it — block by block, KEY NAMES ONLY. 33 keys over six blocks.
 *
 *  DO NOT DERIVE THIS FROM `DECLARED`, and do not answer a failure by
 *  copying one into the other. They are two independent readings of one
 *  declaration and the whole value is that they can disagree. If they
 *  do, the question is which one the EMITTER agrees with — the
 *  cross-repo guard below answers it. */
export const WIRE: Record<string, readonly string[]> = {
  // `**live_read.STANDING` (14) expanded at the call site, then the
  // three registries the route names one by one
  read: [
    "read_is_a_description", "every_name_is_counted_and_said",
    "no_composite_before_m1", "the_wall_has_a_limit",
    "baseline_is_joined", "the_join_is_not_state_partitioned",
    "the_favourite_flag_is_price_native", "a_rate_needs_time",
    "possession_is_distrusted", "persisted_at_the_time",
    "the_clock_is_the_match_clock",
    "a_counter_that_falls_is_a_revision",
    "a_dismissal_does_not_void_a_description",
    "no_history_is_not_quiet",
    "components_registry", "kinds", "registered_holes",
  ],
  model_live: ["line", "basis", "not_the_number", "coverage_rule"],
  states: [
    "axes", "chances_basis", "score_basis", "contest_basis",
    "conventions", "shows_not_decides", "vocabulary",
  ],
  shared_exit_book: ["rule", "consult_rule"],
  coverage: ["coverage_is_anchored", "no_history_is_not_quiet"],
  // RE-RECORDED 2026-09-15 against backend `origin/main` d213631, which
  // added `stale_row_is_not_a_verdict` in TRIVELA #137 — a row older
  // than the window stops being evidence about now, which is true of
  // the SURFACE and of no single fixture, so the route hoists it beside
  // `period_stays_on_the_strip`.
  //
  // RECORDED FROM origin/main AND NOT FROM PRODUCTION, deliberately, and
  // this is the first time the two have disagreed. #137 is merged and
  // not yet deployed, so production still serves the older set — and the
  // freshness guard compares this recording against the backend's
  // CURRENT declaration, not against what is deployed. Recording what
  // production happens to be serving would make this file track a
  // deploy queue rather than a contract, and it would go red on every
  // gap between a merge and its release.
  state: ["period_stays_on_the_strip", "stale_row_is_not_a_verdict"],
};

// ============ re-deriving it from a backend checkout

/** The file whose presence proves a real backend checkout rather than
 *  an empty directory left by a half-failed clone. */
const CONTRACT = "api/main.py";

/** READ AT `origin/main`, NEVER OFF THE WORKING TREE, and the reason is
 *  a fact about this machine on the day it was written: the backend
 *  checkout beside this repo was on a feature branch that does not
 *  carry #129 at all — `WATCHED_STRIP_VERSION` there is still
 *  `watched-strip-v1`. A check that read the working tree would have
 *  gone red because of whose branch was out — a red build about
 *  nothing — or, worse, would have been "fixed" by excusing an absent
 *  function, which is how a RENAME hides.
 *
 *  What moves under this is `origin/main` itself: the day the emitter
 *  declares a thirty-fourth key, this check goes red in a developer
 *  tree and `WIRE` is what has to change. That is the freshness this
 *  file is for. */
const REF = "origin/main";

const CANDIDATES = (): [string, string][] => {
  const out: [string, string][] = [];
  const env = process.env.TRIVELA_BACKEND;
  if (env) out.push(["$TRIVELA_BACKEND", env]);
  out.push(["../backend beside this frontend",
            join(process.cwd(), "..", "backend")]);
  out.push(["~/dev/TRIVELA/backend",
            join(process.env.HOME ?? "", "dev", "TRIVELA", "backend")]);
  return out;
};

/** The backend checkout, or `null` with every path that was tried. */
export function resolveBackend(): { root: string | null; tried: string } {
  const tried: string[] = [];
  for (const [label, root] of CANDIDATES()) {
    if (existsSync(join(root, CONTRACT))) return { root, tried: label };
    tried.push(`${label} (${root})`);
  }
  return { root: null, tried: tried.join("; ") };
}

/** The reason the cross-repo check states when it cannot run. It names
 *  the condition, every location tried, and the remedy — so a skipped
 *  line in the report is a fact a reader can act on rather than a
 *  shrug. */
export function backendSkipReason(tried: string): string {
  return `the backend emitter is not on this tree — no ${CONTRACT} at: `
    + tried + ". Clone SonNguyen2914/TRIVELA beside this repo as "
    + "../backend, or set $TRIVELA_BACKEND. This repo's CI never "
    + "resolves it (private repo, no credentialed checkout), which is "
    + "why the WIRE-vs-DECLARED guard beside this one is hermetic and "
    + "does NOT depend on this check running. A SKIP IS NOT A PASS.";
}

/** One tracked file at `origin/main`, out of the backend's object
 *  store. A failure here THROWS: an unreadable ref is a broken
 *  arrangement to be looked at, never a reason to report success. */
function atMain(root: string, path: string): string {
  try {
    return execFileSync("git", ["show", `${REF}:${path}`],
      { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    throw new Error(`cannot read ${REF}:${path} from ${root} — fetch `
      + `the backend remote first. (${String(e).slice(0, 200)})`);
  }
}

/** THE EXTRACTOR, IN PYTHON'S OWN `ast`, and deliberately brittle.
 *
 *  It walks the syntax tree rather than matching lines, because the
 *  declaration it reads wraps values onto their own line, carries
 *  comments between entries, and expands a `**` — three shapes a
 *  regex reader gets wrong quietly. A shape it does NOT recognise
 *  exits non-zero with what it saw, and `readBackendDeclaration()`
 *  turns that into a thrown error: "the emitter changed, come look" is
 *  the answer, never a short list.
 *
 *  It never returns a subset quietly. The one `**` it accepts is
 *  `live_read.STANDING`, matched by name; any other expansion is an
 *  error, so the day the route folds in a second registry this stops
 *  rather than under-reports. */
const EXTRACTOR = String.raw`
import ast, json, sys

FN = "watched_strip_standing_blocks"

def die(msg):
    sys.stderr.write("declext: " + msg + "\n"); sys.exit(2)

def dict_keys(node, where):
    if not isinstance(node, ast.Dict):
        die("%s is not a dict literal (%s)" % (where, type(node).__name__))
    out = []
    for k in node.keys:
        if k is None:
            die("%s carries a ** this extractor cannot expand" % where)
        if not isinstance(k, ast.Constant) or not isinstance(k.value, str):
            die("%s has a non-string key" % where)
        out.append(k.value)
    return out

main_src = open(sys.argv[1]).read()
live_read_src = open(sys.argv[2]).read()

standing = None
for n in ast.parse(live_read_src).body:
    if isinstance(n, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == "STANDING" for t in n.targets):
        standing = dict_keys(n.value, "live_read.STANDING")
if standing is None:
    die("live_read.py declares no module-level STANDING")
if len(standing) < 2:
    die("live_read.STANDING parsed to %d keys - its shape changed" % len(standing))

fn = None
for n in ast.walk(ast.parse(main_src)):
    if isinstance(n, ast.FunctionDef) and n.name == FN:
        fn = n
if fn is None:
    die("this ref declares no %s() - renamed, or predates #129" % FN)
rets = [n for n in ast.walk(fn) if isinstance(n, ast.Return)]
if len(rets) != 1:
    die("%s() has %d returns, expected exactly 1" % (FN, len(rets)))
top = rets[0].value
if not isinstance(top, ast.Dict):
    die("%s() does not return a dict literal" % FN)

out = {}
for bk, bv in zip(top.keys, top.values):
    if bk is None:
        die("%s() returns a ** at block level" % FN)
    if not isinstance(bk, ast.Constant) or not isinstance(bk.value, str):
        die("%s() has a non-string block name" % FN)
    block = bk.value
    if not isinstance(bv, ast.Dict):
        die("block %r is not a dict literal" % block)
    keys = []
    for k, v in zip(bv.keys, bv.values):
        if k is None:
            if (isinstance(v, ast.Attribute) and v.attr == "STANDING"
                    and isinstance(v.value, ast.Name)
                    and v.value.id == "live_read"):
                keys.extend(standing)
                continue
            die("block %r expands a ** this extractor does not know: %s"
                % (block, ast.dump(v)[:120]))
        if not isinstance(k, ast.Constant) or not isinstance(k.value, str):
            die("block %r has a non-string key" % block)
        keys.append(k.value)
    if not keys:
        die("block %r declares no keys" % block)
    out[block] = keys
if not out:
    die("%s() returned no blocks at all" % FN)
json.dump(out, sys.stdout, sort_keys=True)
`;

/** `block -> [key names]` as backend `origin/main` declares them, by
 *  AST. THROWS on anything it cannot read — an absent checkout is the
 *  caller's business (see `resolveBackend`), and everything else is a
 *  finding. */
export function readBackendDeclaration(
  root: string,
): Record<string, string[]> {
  const dir = mkdtempSync(join(tmpdir(), "trivela-decl-"));
  try {
    const main = join(dir, "main.py");
    const live = join(dir, "live_read.py");
    writeFileSync(main, atMain(root, CONTRACT));
    writeFileSync(live, atMain(root, "src/live/live_read.py"));
    let raw: string;
    try {
      raw = execFileSync("python3", ["-c", EXTRACTOR, main, live],
        { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    } catch (e) {
      const err = e as { stderr?: string; message?: string };
      throw new Error("the backend declaration would not parse: "
        + String(err.stderr || err.message || e).trim().slice(0, 400));
    }
    const out = JSON.parse(raw) as Record<string, string[]>;
    if (Object.keys(out).length === 0) {
      throw new Error("the extractor returned no blocks at all");
    }
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

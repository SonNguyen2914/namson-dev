import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

// MISSING IS NOT ZERO, A FAILED READ IS NOT AN EMPTY ONE, AND A CAVEAT
// ON A `title=` IS NOT IN THE ACCESSIBLE TREE — round five (2026-09-07).
//
// Four rounds each fixed the site they were handed and the same shape
// stood one function over. This file is written to the rule that came
// out of that: either the thing is impossible by absence or by
// construction, or it is REGISTERED with the condition that closes it —
// and the guard fails BOTH if a new hole appears unregistered AND if a
// registered one is closed without retiring its record.
//
// Three shapes are pinned here, each with its non-vacuity half — the
// same surface served the OTHER fact, asserted not to render the same
// words. A test that only pinned the failure copy would stay green
// against a surface that printed it for a measured value too, which is
// the same collapse pointing the other way.
//
//   1. THE BRACKET. `.catch(() => {})` over `useState(null)` and then
//      `if (!b || b.quarterfinals.length === 0) return null` on the very
//      next line: a 503 and "the knockout draw has not been made" were
//      the identical vanished section.
//   2. THE TOURNAMENT. `setT(null)` on every non-200, and the header
//      says the 404 is the feature switch — so a 500 borrowed the
//      switch and rendered as "this competition has no tournament".
//   3. THE LIVE STAT BARS. `parseFloat(r.home) || 0` then
//      `tot > 0 ? h/tot : 50`: a value the feed never sent drew a
//      perfect half-and-half bar, a measured dead heat off nothing.
//
// Plus the source-derived registry guard at the foot of the file.
//
// 2026-10-21 (cleanup C1): shapes 1 and 3, the red-card marker and the
// LivePanel field guards were retired with the surfaces they pinned. The
// WC26 bracket now renders a frozen file (src/data/wc26/bracket.json)
// and makes no read that could fail; LiveScoreboard and LivePanel were
// deleted with the WC26 live routes. Their registry records went too.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});
type Page = import("@playwright/test").Page;

const words = async (page: Page): Promise<string> =>
  (await page.locator("body").innerText()).replace(/\s+/g, " ");

// ------------------------------------------------------ the tournament

const COMP = "asean";
const TOURNAMENT_URL = `**/api/comp/${COMP}/tournament`;

async function compShell(page: Page) {
  // everything else the /comp/[key] page reads, answered, so the
  // assertion is about the tournament read alone
  await page.route(`**/api/comp/${COMP}`, (r) => r.fulfill(json({
    key: COMP, display: "ASEAN", available: true,
  })));
}

test("a tournament read that answered 500 is named — a competition with no "
   + "tournament answers 404, and that is the only silence the switch buys",
  async ({ page }) => {
    await compShell(page);
    await page.route(TOURNAMENT_URL,
      (r) => r.fulfill(json({ error: "sim crashed" }, 500)));
    await page.goto(`/bet-suggester/comp/${COMP}`);
    const notice = page.getByTestId("tournament-read-failed");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("answers 404, and this did not");
  });

test("a 404 tournament read stays silent — the feature switch still "
   + "switches", async ({ page }) => {
    // The non-vacuity half, and the one the header of TournamentView
    // depends on: /comp/[key] mounts the component unconditionally and
    // relies on the 404 to render nothing at all.
    await compShell(page);
    const answered = page.waitForResponse((r) => r.url().includes("/tournament"));
    await page.route(TOURNAMENT_URL,
      (r) => r.fulfill(json({ detail: "no tournament" }, 404)));
    await page.goto(`/bet-suggester/comp/${COMP}`);
    await answered;
    await page.waitForTimeout(500);
    await expect(page.getByTestId("tournament-read-failed")).toHaveCount(0);
    await expect(page.getByTestId("tournament-read-stale")).toHaveCount(0);
    expect(await words(page)).not.toContain("could not ask");
  });

test("a competition the backend flags with no tournament is never asked "
   + "(live smoke 2026-10-26: a 404 console error on every ucl load)",
  async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (q) => {
      if (q.url().includes("/tournament")) asked.push(q.url());
    });
    await page.route("**/api/comp/ucl/fixtures*", (r) => r.fulfill(json({
      competition: "ucl", display: "Champions League", fixtures: [],
      count: 0, tournament_surface: false,
    })));
    const listed = page.waitForResponse((r) => r.url().includes("/fixtures"));
    await page.goto("/bet-suggester/comp/ucl");
    await listed;
    await page.waitForTimeout(800);
    expect(asked).toEqual([]);
  });

test("a flagged competition is still asked — the flag gates, it does not "
   + "switch the surface off", async ({ page }) => {
    await compShell(page);
    await page.route(`**/api/comp/${COMP}/fixtures*`, (r) => r.fulfill(json({
      competition: COMP, display: "ASEAN", fixtures: [], count: 0,
      tournament_surface: true,
    })));
    const answered = page.waitForRequest((q) => q.url().includes("/tournament"));
    await page.route(TOURNAMENT_URL,
      (r) => r.fulfill(json({ detail: "no tournament" }, 404)));
    await page.goto(`/bet-suggester/comp/${COMP}`);
    await answered;
  });

// ================================================================
// THE REGISTER — every read on the owned surfaces that still ends in
// a swallow, with the condition that closes it.
// ================================================================
//
// A payload is not a wall and this registry does not pretend to be one.
// It is the honest, finite, converging alternative: the sites are
// DERIVED from the source on every run, so a new swallow appears here
// as a failure rather than as a silence — and a registered one that is
// closed also fails, because a stale record is how a hand-typed `sites`
// tuple went stale on the backend and hid the only remaining route to a
// fee-inclusive edge.

type Swallow = { finding: string; closes_when: string };

/** Catches on the owned surfaces that discard the failure ON PURPOSE,
 *  each with why it is judged safe and what would close it. Keyed by
 *  the marker written into the source at the site. */
export const REGISTERED_SWALLOWS: Record<string, Swallow> = {
  "landing:io-document-root": {
    finding:
      "The home page (pages/index.tsx, landing/FieldStage.tsx, "
      + "landing/LandingIndex.tsx) builds its IntersectionObservers with "
      + "`root: document` and, where a browser rejects a Document root, "
      + "builds the same observer on the viewport instead. Nothing is "
      + "read: it is feature detection, and both branches observe.",
    closes_when:
      "the fallback ever leaves a scene without an observer, or a catch "
      + "here starts wrapping a network read.",
  },
  "landing:focus-visible-probe": {
    finding:
      "landing/FieldStage.tsx asks `el.matches(':focus-visible')` to tell "
      + "a keyboard focus from a pointer one; an engine without the "
      + "selector throws, and the probe answers with the safe default "
      + "(not keyboard / keep the keyboard path). Nothing is read.",
    closes_when:
      "the probe's default ever hides a control from a keyboard reader.",
  },
  "tradingbook:book-body-parse": {
    finding:
      "TradingBook's poll folds a book response whose body is not JSON to "
      + "null, then names the read by its HTTP status: 404 shows 'Book not "
      + "available yet', 403 shows the refusal, any other non-2xx shows "
      + "'HTTP <status>', and a 2xx with no object is not drawn as a book. "
      + "Nothing renders an unparsed body as an empty book.",
    closes_when:
      "a 2xx with an unparseable body is ever drawn as an empty book "
      + "rather than as an error state.",
  },
  "tradingbook:post-body-parse": {
    finding:
      "A hand-over or take-back answer whose body is not JSON is folded "
      + "to null and described by describe() from its HTTP status, so the "
      + "operator always reads a sentence that names the failure "
      + "(token rejected, not available, no answer in time, HTTP <n>).",
    closes_when:
      "a non-2xx answer is ever reported as a success, or the outcome "
      + "sentence stops naming the status.",
  },
  "tradingbook:post-no-answer": {
    finding:
      "A hand-over or take-back POST that throws (network, abort) is "
      + "NAMED in the outcome line ('failed: no answer came back') and the "
      + "book is read again at once to show whether it went through; "
      + "nothing claims success.",
    closes_when:
      "the outcome line stops printing the failure, or the book re-read "
      + "after a failed POST is removed.",
  },
  "killlift:post-body-parse": {
    finding:
      "A kill-lift answer whose body is not JSON is folded to null and "
      + "described by describeLift() from its HTTP status, so the operator "
      + "always reads a sentence naming the failure (token rejected, not "
      + "available, no answer in time, HTTP <n>); a 2xx without a boolean "
      + "`lifted` is never reported as lifted.",
    closes_when:
      "a non-2xx or unparseable answer is ever reported as a lift, or the "
      + "result line stops naming the status.",
  },
  "killlift:post-no-answer": {
    finding:
      "A kill-lift POST that throws (network, abort) is NAMED in the result "
      + "line ('Lift failed: no answer came back') and the status is read "
      + "again at once; nothing claims the kill was lifted.",
    closes_when:
      "the result line stops printing the failure, or the status re-read "
      + "after a failed POST is removed.",
  },
  "field:mode-read": {
    finding:
      "The field page reads which view (Leagues or Cups) the viewer last "
      + "had open from localStorage, and swallows a storage that throws "
      + "(private mode, blocked site data). Nothing is drawn from the "
      + "read's failure: the page opens on Leagues, which is exactly what "
      + "a first visit does, and no figure depends on it.",
    closes_when:
      "the remembered view carries anything a reader is told about — at "
      + "which point a failed read must say so rather than fall back.",
  },
  "emergency:post-body-parse": {
    finding:
      "A KILL or HALT answer whose body is not JSON is folded to null and "
      + "described by describeEmergency() from its HTTP status, so the "
      + "operator always reads a sentence naming what happened (set until, "
      + "not on this backend, no token, token rejected, no answer in time, "
      + "HTTP <n>); a non-2xx is never reported as set.",
    closes_when:
      "a non-2xx or unparseable answer is ever reported as set, or the "
      + "result line stops naming the status.",
  },
  "emergency:post-no-answer": {
    finding:
      "A KILL or HALT POST that throws (network, abort) is NAMED in the "
      + "result line ('no answer came back') and the status is read again at "
      + "once to show whether it went through; nothing claims it was set.",
    closes_when:
      "the result line stops printing the failure, or the status re-read "
      + "after a failed POST is removed.",
  },
  "emergency:lift-body-parse": {
    finding:
      "A halt-lift answer whose body is not JSON is folded to null and "
      + "described from its HTTP status; a non-2xx is never reported as a "
      + "lift.",
    closes_when:
      "a non-2xx or unparseable answer is ever reported as lifted.",
  },
  "emergency:lift-no-answer": {
    finding:
      "A halt-lift POST that throws is NAMED in the result line and the "
      + "status is read again; nothing claims the halt was lifted.",
    closes_when:
      "the result line stops printing the failure, or the status re-read "
      + "after a failed POST is removed.",
  },
  "console-sort:load": {
    finding:
      "The trading console reads which column each of its tables was last "
      + "sorted by from localStorage, and swallows a storage that throws or "
      + "holds junk. Nothing is drawn from the failure: every table opens "
      + "in the backend's own order, the default, and no figure changes.",
    closes_when:
      "the page ever claims a remembered sort is in force, which would then "
      + "have to be derived from the read succeeding.",
  },
  "console-sort:save": {
    finding:
      "The trading console remembers a table's sort and swallows a storage "
      + "write that throws. The sort has already happened in state; only "
      + "the next visit's sort is lost, and that table opens in the "
      + "backend's order.",
    closes_when:
      "the page tells the reader their sort was saved, which would then "
      + "have to be derived from the write succeeding.",
  },
  "console-collapse:load": {
    finding:
      "The trading console reads which of its sections this viewer folded "
      + "from localStorage, and swallows a storage that throws or holds "
      + "junk (private mode, blocked site data, a hand-edited value). "
      + "Nothing is drawn from the failure: every section opens expanded, "
      + "which is the default and shows MORE, never less; no figure "
      + "depends on it.",
    closes_when:
      "a folded section is ever relied on to hide something, or the page "
      + "claims a fold was remembered — then the read's failure must be said.",
  },
  "console-collapse:save": {
    finding:
      "The trading console remembers a viewer's folded sections and "
      + "swallows a storage write that throws. The fold has already "
      + "happened in state; only the next visit's folds are lost, and they "
      + "open expanded — more, never less.",
    closes_when:
      "the page tells the reader their folds were saved, which would then "
      + "have to be derived from the write succeeding.",
  },
  "field:mode-write": {
    finding:
      "The field page remembers the view the viewer switched to, and "
      + "swallows a storage write that throws. The switch itself has "
      + "already happened in state; only the NEXT visit's default is lost, "
      + "and the page promises nothing about it.",
    closes_when:
      "the page tells the reader their choice was remembered, which would "
      + "then have to be derived from the write succeeding.",
  },
  "board:mode-read": {
    finding:
      "The landing page reads which board (Leagues or Championships) the "
      + "viewer last had open from localStorage, and swallows a storage "
      + "that throws (private mode, blocked site data). Nothing is drawn "
      + "from the read's failure: the page opens on Leagues, which is "
      + "exactly what a first visit does, and no figure depends on it.",
    closes_when:
      "the remembered board carries anything a reader is told about — at "
      + "which point a failed read must say so rather than fall back.",
  },
  "board:mode-write": {
    finding:
      "The landing page remembers the board the viewer switched to, and "
      + "swallows a storage write that throws. The switch itself has "
      + "already happened in state; only the NEXT visit's default is lost, "
      + "and the page promises nothing about it.",
    closes_when:
      "the page tells the reader their choice was remembered, which would "
      + "then have to be derived from the write succeeding.",
  },
  "comp:kalshi-market-counts": {
    finding:
      "The competition page's /markets read adds a ' · N tradeable on "
      + "kalshi' suffix and one footnote sentence, both rendered only "
      + "when the fields are non-null. A failure drops the suffix, which "
      + "is silence about Kalshi rather than a claim of zero — the "
      + "count is never zero-filled.",
    closes_when:
      "any number derived from this read is drawn with a default, or "
      + "the read starts backing a sentence about what Kalshi lists.",
  },
};

/** Every file this round owns. Derived by walking the tree, minus the
 *  four components another agent held open in the same checkout — named
 *  rather than silently skipped, with the condition that retires the
 *  exclusion. */
const NOT_MINE_THIS_ROUND = new Set([
  "SuggestionCard.tsx", "MatchHub.tsx", "WatchedStrip.tsx",
  "WatchDeclaration.tsx",
]);
const NOT_MINE_CLOSES_WHEN =
  "this round's four-agent ownership split ends; then delete "
  + "NOT_MINE_THIS_ROUND and let the walk cover every component.";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx") && !NOT_MINE_THIS_ROUND.has(name)) out.push(p);
  }
  return out;
}

const SRC = join(__dirname, "..", "src");
const OWNED = [
  ...walk(join(SRC, "components")).filter((p) => !p.includes("/pages/")),
  ...walk(join(SRC, "pages")),
];

/** Blank every comment and string literal, preserving length so an
 *  offset into the result is the same offset into the original. Without
 *  this the scan reads its OWN prose: three files carry the sentence
 *  "used to end in `.catch(() => {})`", and a guard that fires on a
 *  comment describing the fix is a guard nobody can keep green.
 *
 *  A NESTED TEMPLATE LITERAL IS WHY THIS IS NOT A REGEX. LiveScoreboard
 *  builds a signal tooltip as `${cond ? "a" : `${x} b`}` — a template
 *  inside a `${}` inside a template. A scanner that ends a template at
 *  the next backtick desynchronises there and treats the whole rest of
 *  the file as inverted: prose becomes code and code becomes prose, and
 *  the guard then fires on a comment 380 lines later. It did, before
 *  this was written properly. `${}` bodies are scanned as CODE.
 */
function codeOnly(src: string): string {
  const out = src.split("");
  const blank = (a: number, b: number) => {
    for (let k = Math.max(a, 0); k < b && k < out.length; k += 1) {
      if (out[k] !== "\n") out[k] = " ";
    }
  };
  /** returns the index just past the construct starting at i, or -1 if
   *  nothing at i opens one */
  const skip = (i: number): number => {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") {
      const e = src.indexOf("\n", i);
      const end = e === -1 ? src.length : e;
      blank(i, end);
      return end;
    }
    if (c === "/" && d === "*") {
      const e = src.indexOf("*/", i + 2);
      const end = e === -1 ? src.length : e + 2;
      blank(i, end);
      return end;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === c) { j += 1; break; }
        j += 1;
      }
      blank(i + 1, j - 1);
      return j;
    }
    if (c === "`") {
      let lit = i + 1, j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === "`") { blank(lit, j); return j + 1; }
        if (src[j] === "$" && src[j + 1] === "{") {
          blank(lit, j);
          let depth = 1, k = j + 2;
          while (k < src.length && depth > 0) {
            const n = skip(k);
            if (n > k) { k = n; continue; }
            if (src[k] === "{") depth += 1;
            else if (src[k] === "}") depth -= 1;
            k += 1;
          }
          j = k; lit = k;
          continue;
        }
        j += 1;
      }
      blank(lit, j);
      return j;
    }
    return -1;
  };
  let i = 0;
  while (i < src.length) {
    const n = skip(i);
    i = n > i ? n : i + 1;
  }
  return out.join("");
}

/** A `catch` whose block neither binds the error into something the
 *  surface can say, nor rethrows. The scan is deliberately crude and
 *  deliberately over-eager: a false positive costs one registry entry
 *  with a reason, which is exactly the artefact this round wants.
 *
 *  Detection runs on the comment-blanked source; the MARKER is read back
 *  out of the original at the same offsets, because the marker lives in
 *  a comment on purpose — it is a note to the next reader, not code. */
function swallows(source: string): { marker: string | null; body: string }[] {
  const code = codeOnly(source);
  const found: { marker: string | null; body: string }[] = [];
  const re = /catch\s*(?:\(([^)]*)\)\s*)?\{/g;
  while (re.exec(code) !== null) {
    // read to the matching close brace
    let depth = 1, i = re.lastIndex;
    while (i < code.length && depth > 0) {
      if (code[i] === "{") depth += 1;
      else if (code[i] === "}") depth -= 1;
      i += 1;
    }
    const body = code.slice(re.lastIndex, i - 1);
    // "names the failure" = the failure reaches the surface: a state
    // write the render reads, a toast the reader sees, or a rethrow that
    // hands the decision up. Nothing else counts.
    const named =
      /\bset[A-Z]\w*\s*\(/.test(body) || /\bthrow\b/.test(body)
      || /\btoast\s*\(/.test(body);
    if (named) continue;
    const marker = source.slice(re.lastIndex, i - 1)
      .match(/SWALLOWED\(([^)]+)\)/)?.[1] ?? null;
    found.push({ marker, body });
  }
  // arrow-form `.catch(() => {})` — nothing at all reaches the surface.
  // The body is blank in `code` whether it held nothing or held only a
  // comment, so the MARKER is read back out of the original span.
  const arrow = /\.catch\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/g;
  for (const a of code.matchAll(arrow)) {
    const span = source.slice(a.index!, a.index! + a[0].length);
    found.push({ marker: span.match(/SWALLOWED\(([^)]+)\)/)?.[1] ?? null,
                 body: a[0] });
  }
  return found;
}

test("no read on an owned surface swallows a failure without a record",
  () => {
    expect(OWNED.length).toBeGreaterThan(10);   // never vacuous
    const unregistered: string[] = [];
    const seen = new Set<string>();
    for (const file of OWNED) {
      for (const s of swallows(readFileSync(file, "utf8"))) {
        if (s.marker && REGISTERED_SWALLOWS[s.marker]) { seen.add(s.marker); continue; }
        unregistered.push(
          `${file.slice(SRC.length + 1)} :: ${s.marker
            ? `marker ${s.marker} is not in REGISTERED_SWALLOWS`
            : `unmarked catch — ${s.body.trim().slice(0, 90)}`}`);
      }
    }
    expect(unregistered,
      "A failed read that renders as an empty one is this repo's most "
      + "repeated defect. Either name the failure (route it into state "
      + "the surface prints) or add a `/* SWALLOWED(key) */` marker and "
      + "a REGISTERED_SWALLOWS entry saying why it is safe and what "
      + "closes it.").toEqual([]);

    // …AND THE OTHER DIRECTION. A registered hole that no longer exists
    // is a stale record, which is how the backend's hand-typed `sites`
    // tuple hid the only remaining route to a fee-inclusive edge.
    const stale = Object.keys(REGISTERED_SWALLOWS).filter((k) => !seen.has(k));
    expect(stale,
      "These swallows are registered but no longer present. Retire the "
      + "record — a register that outlives its holes stops being read.")
      .toEqual([]);
  });

test("the ownership exclusion is a record, not a habit", () => {
  // The one hand-listed set in this file, named so it cannot go quiet.
  expect(NOT_MINE_CLOSES_WHEN).toContain("delete NOT_MINE_THIS_ROUND");
  expect(NOT_MINE_THIS_ROUND.size).toBe(4);
});

// =====================================================================
// MISSING IS NOT ZERO — THE SEVEN-DAY SHADOW CHIP ON ALL FOUR HUBS
// =====================================================================
//
// The twin, found by searching for the shape rather than the site.
//
// Each league hub draws a model's three-way probabilities in two
// places. `OddsChip`, on the fixture card, was written with the rule on
// it — "dark model: no chip at all — never a zero bar" — and its own
// local formatter that prints an em dash for a key the backend did not
// send. The SEVEN-DAY LIST, in the same file, a hundred-odd lines up,
// carried an inline copy that read
//
//     {Math.round((oddsMap[f.id].outcomes!.home_win ?? 0) * 100)}
//     /{Math.round((oddsMap[f.id].outcomes!.draw ?? 0) * 100)}
//     /{Math.round((oddsMap[f.id].outcomes!.away_win ?? 0) * 100)}
//
// on all three legs, in all four files. A payload carrying home_win and
// away_win but no `draw` rendered "45/0/30": the model saying this
// fixture cannot be drawn, printed off a number nobody computed. The
// row's only label — whose odds these are, and that they are not advice
// — rode on a `title=`, so a reader of the accessible tree met three
// bare numbers with nothing attached.
//
// Both halves are closed by CONSTRUCTION rather than policed: there is
// now exactly one `outcomePct` per file and both call sites go through
// it, and the label is real text. The scan below is the guard that the
// second formatter does not grow back.
//
// THE LIST OF FILES IS DERIVED FROM THE PAGE'S OWN DISPATCH, NOT TYPED.
// leagues.tsx names the component it mounts per league id on the same
// lines it gates them with `BUILT_LEAGUES`, and both are read here: a
// league added to the registry without a dashboard row, or a dashboard
// renamed, fails this file loudly instead of quietly dropping a hub —
// which is exactly how La Liga was the one hub left carrying the defect
// the last time a guard hand-listed three of four.

const LEAGUES_TSX = readFileSync(
  join(SRC, "pages", "bet-suggester", "leagues.tsx"), "utf8");

const REGISTERED_LEAGUES: string[] = (() => {
  const m = LEAGUES_TSX.match(/const BUILT_LEAGUES = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) {
    throw new Error(
      "leagues.tsx no longer declares `const BUILT_LEAGUES = new Set([...])`. "
      + "This spec derives its hub list from that registry on purpose — "
      + "point it at the new one, do not re-type the league ids.");
  }
  return [...m[1].matchAll(/"([a-z0-9_-]+)"/g)].map((x) => x[1]);
})();

const HUB_DASHBOARDS: { league: string; component: string; file: string }[] =
  [...LEAGUES_TSX.matchAll(/league\.id === "([a-z0-9_-]+)" && <(\w+) \/>/g)]
    .map((m) => ({
      league: m[1], component: m[2],
      file: join(SRC, "components", `${m[2]}.tsx`),
    }));

test("the hub list this file scans is the one the page dispatches", () => {
  expect(REGISTERED_LEAGUES.length).toBeGreaterThan(0);
  expect(HUB_DASHBOARDS.map((h) => h.league).sort())
    .toEqual([...REGISTERED_LEAGUES].sort());
});

for (const h of HUB_DASHBOARDS) {
  test(`${h.league}: one outcome formatter, and no zero-filled outcome`,
    () => {
      const src = readFileSync(h.file, "utf8");
      const code = codeOnly(src);   // its own prose quotes the defect

      // ONE FORMATTER. Two is how the fixed one and the broken one sat
      // in the same file for four rounds without disagreeing loudly.
      expect((code.match(/function outcomePct\(/g) ?? []).length,
        `${h.component} must declare exactly one outcomePct`).toBe(1);
      expect((code.match(/outcomePct\(/g) ?? []).length,
        `${h.component} declares outcomePct but nothing calls it — an `
        + "unused formatter is not a fix").toBeGreaterThan(2);

      // AND NO SECOND ONE, ANYWHERE. Any `?? 0` or `|| 0` reached from
      // an `outcomes` read is a probability defaulted to a measured
      // zero; that is the defect, spelled however it is spelled.
      const zeroFilled = [...code.matchAll(/outcomes[^;\n]{0,140}?(\?\?|\|\|)\s*0\b/g)]
        .map((m) => m[0].trim());
      expect(zeroFilled,
        `${h.component}: a model outcome is being defaulted to 0. "0%" is `
        + "a claim that the model gave this result no chance; a key the "
        + "backend never sent was never measured. Route it through "
        + "outcomePct, which prints an em dash.").toEqual([]);
    });
}

/** The reads a hub makes, all answered, with `odds` supplied by the
 *  caller so the two halves differ in exactly one payload. */
async function hubWithOdds(page: Page, league: string, odds: unknown) {
  const fx = {
    id: "wk1", date: "2030-05-01T19:00:00Z", state: "pre",
    venue: "Somewhere", home: { name: "Home FC", short: "HOM" },
    away: { name: "Away FC", short: "AWY" },
  };
  const ok: Record<string, unknown> = {
    scoreboard: { fixtures: [] },
    "schedule**": { fixtures: [fx] },
    standings: { tables: [], conferences: [] },
    markets: { games: [] },
    status: {},
    "markets/discovery": {},
  };
  for (const [path, body] of Object.entries(ok)) {
    await page.route(`**/api/${league}/${path}`, (r) => r.fulfill(json(body)));
  }
  await page.route(`**/api/${league}/odds`, (r) => r.fulfill(json(odds)));
}

const PARTIAL = { odds: [{ espn_event_id: "wk1", locked: false,
  outcomes: { home_win: 0.45, away_win: 0.3 } }] };
const WHOLE = { odds: [{ espn_event_id: "wk1", locked: false,
  outcomes: { home_win: 0.45, draw: 0.25, away_win: 0.3 } }] };

for (const h of HUB_DASHBOARDS) {
  test(`${h.league}: an outcome the backend did not send is a dash, not 0`,
    async ({ page }) => {
      await hubWithOdds(page, h.league, PARTIAL);
      await page.goto(`/bet-suggester?league=${h.league}`);
      const chip = page.getByTestId("week-odds").first();
      await expect(chip).toBeVisible();
      const text = (await chip.innerText()).replace(/\s+/g, " ");
      // EXACTLY where the dash is. The two legs that WERE sent still
      // read, so this pins the dash to the missing one rather than to
      // a chip that gave up wholesale — and nothing renders a 0.
      expect(text).toMatch(/45\/—\/30/);
      expect(text).not.toMatch(/\b0\b/);
    });

  test(`${h.league}: a whole outcome set draws three numbers and no dash`,
    async ({ page }) => {
      // THE NON-VACUITY HALF. A chip that printed a dash for everything
      // would pass the test above and say nothing true.
      await hubWithOdds(page, h.league, WHOLE);
      await page.goto(`/bet-suggester?league=${h.league}`);
      const chip = page.getByTestId("week-odds").first();
      await expect(chip).toBeVisible();
      const text = (await chip.innerText()).replace(/\s+/g, " ");
      expect(text).toMatch(/45\/25\/30/);
      // and no dash anywhere in the chip: inside it an em dash means
      // "this leg was not measured" and nothing else, which is why the
      // spoken label beside it carries none.
      expect(text).not.toContain("—");
    });

  test(`${h.league}: the seven-day chip says whose numbers these are`,
    async ({ page }) => {
      // A CAVEAT ON A `title=` IS NOT IN THE ACCESSIBLE TREE. This row
      // used to carry "<model> shadow odds — not advice" on a title
      // attribute and nothing else; three bare numbers reached a screen
      // reader with no owner and no disclaimer.
      await hubWithOdds(page, h.league, WHOLE);
      await page.goto(`/bet-suggester?league=${h.league}`);
      const chip = page.getByTestId("week-odds").first();
      await expect(chip).toBeVisible();
      // innerText excludes `title` attributes and includes sr-only text
      const text = (await chip.innerText()).replace(/\s+/g, " ");
      expect(text).toMatch(/not advice/i);
      expect(text).toMatch(/-2026-v0/);
    });
}

// =====================================================================
// LA LIGA'S MODEL-STATE READS — THE THIRD COLLAPSE IN THE FILE THAT
// INVENTED `settle()`
// =====================================================================
//
// `/api/laliga/odds` and `/api/laliga/status` were both
// `.catch(() => null)`-ed into `model` and `status`, and every sentence
// the model section prints is derived from those two: the heading
// ("Dark — no approval decision exists" / "State unavailable"), the
// blocker chips (`status?.counts?.blockers ?? []`), the xG note, and
// the model version in the eyebrow, which falls back to a literal
// "laliga-2026-v0" this page carries itself. A 503 therefore produced
// the same pixels as a backend that answered and had nothing to add —
// a claim about a model, made off a read that never happened, in the
// one file whose own header says "Loading, failed and empty are three
// different facts."
//
// `odds` was closed in the round before this one. These two are the
// same shape one state over.

const LALIGA_OK: Record<string, unknown> = {
  scoreboard: { fixtures: [] },
  "schedule**": { fixtures: [] },
  standings: { tables: [], conferences: [] },
  markets: { games: [] },
  odds: { odds: [], model_state: "dark", model_version: "laliga-2026-v0" },
  status: { model_dark: true, model_version: "laliga-2026-v0",
            model_dark_note: "no approval decision exists",
            xg_note: "xg join is thin", counts: { blockers: ["needs-results"] } },
};

async function laliga(page: Page, dead: string[] = []) {
  for (const [path, body] of Object.entries(LALIGA_OK)) {
    await page.route(`**/api/laliga/${path}`, (r) => r.fulfill(json(body)));
  }
  for (const path of dead) {
    await page.route(`**/api/laliga/${path}`,
      (r) => r.fulfill(json({ error: "upstream is down" }, 503)));
  }
}

for (const dead of [["status"], ["odds"], ["status", "odds"]]) {
  test(`la liga: a dead ${dead.join(" + ")} read is named, not drawn as a `
     + "model with nothing to say", async ({ page }) => {
      await laliga(page, dead);
      await page.goto("/bet-suggester?league=laliga");
      const notice = page.getByTestId("model-state-read-failed");
      await expect(notice).toBeVisible();
      await expect(notice).toContainText("did not land");
      // the blockers and the note are things this read CARRIES, so the
      // line has to say their absence is unread — not print them empty
      await expect(notice).toContainText("unread rather than unstated");
    });
}

test("la liga: two healthy model-state reads print no failure line, and the "
   + "section says what they said", async ({ page }) => {
    // THE NON-VACUITY HALF. A page that always printed the warning would
    // pass all three tests above and mean nothing.
    await laliga(page);
    await page.goto("/bet-suggester?league=laliga");
    await expect(page.locator("body")).toContainText("no approval decision");
    await expect(page.getByTestId("model-state-read-failed")).toHaveCount(0);
    await expect(page.locator("body")).toContainText("needs-results");
    await expect(page.locator("body")).toContainText("xg join is thin");
  });

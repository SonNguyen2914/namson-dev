// THE FIELD PAGE — /bet-suggester/ratings, rebuilt 2026-09-23 to the
// design the operator approved ("The Pinned-Pass Field").
//
// HERMETIC. Both reads are served from `field-page-recorded.ts`, which is
// the backend's own output trimmed only by dropping rows; every other
// /api/ read on the page is answered with a named 503, so nothing here
// reaches a backend and nothing here depends on live data.
//
// WHAT IS UNDER GUARD, one block per rule the review settled — several
// of them bugs the approved draft found in itself:
//
//   2  Leagues / Cups switch, remembered; the pills are the ribbon's pill,
//      one strip, the ribbon's constants, a reveal token PER PILL
//   3  ladder is DATA: one ladder, one table; two, two tables and no
//      single ranking
//   4  one table, one axis: every bar on the span of the rows shown
//   5  ranked by value, never in the bundle's (name) order
//   6  bridges read first; zero bridges = hollow ring and NO bar
//   7  one league = a within-league read
//   8  a straddling tier shows its set's range, min–max
//   9  a fact true of a whole section is said once, in its header
//   10 cups multi-select and NEVER merged: one table per cup, each with
//      its own heading, axis and rank; the incomparability stated with a
//      worked example (and a note at two or more); an axis live while any
//      selected cup carries it, the others named; no bridges column
//   12 select all / deselect all: an action, not a toggle
//   11 missing is never zero; no decide vocabulary
//
// Variants the recording does not contain (two ladders, a section wholly
// below the floor, absent figures) are DERIVED from recorded rows below,
// each by a named function, so a reader can see exactly what was changed.
//
// Regenerating the recording: serve the backend branch locally
// (`uvicorn api.main:app --port 8765`) and re-run the trimming snippet
// recorded in this branch's commit message.
import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { CUPS, LEAGUES } from "./field-page-recorded";
import { expectForwarded } from "./proxy-forwarding";
import { auditFloor } from "./the-touch-floor";

type Row = Record<string, unknown> & { club: string; column: string;
  value?: number | null };
type Payload = typeof LEAGUES;

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

async function serve(page: Page, leagues: unknown = LEAGUES,
                     cups: unknown = CUPS,
                     opts: { leaguesStatus?: number; raw?: string } = {}) {
  // Everything else the page's chrome reads is answered here, named, so
  // no test in this file reaches a backend. Registered FIRST: Playwright
  // prefers the handler registered later, so the two field routes win.
  await page.route("**/api/**", (r) => r.fulfill(json({
    detail: "the-field-page answers every non-field read itself",
  }, 503)));
  await page.route("**/api/field/leagues", (r) => opts.raw !== undefined
    ? r.fulfill({ status: opts.leaguesStatus ?? 200,
                  contentType: "text/html", body: opts.raw })
    : r.fulfill(json(leagues, opts.leaguesStatus ?? 200)));
  await page.route("**/api/field/cups", (r) => r.fulfill(json(cups)));
}

async function open(page: Page, leagues: unknown = LEAGUES,
                    cups: unknown = CUPS, url = "/bet-suggester/ratings") {
  await serve(page, leagues, cups);
  await page.goto(url);
  await expect(page.getByTestId("field-table").first()).toBeVisible();
}

const rowsOf = (p: Payload, axis = "overall") =>
  (p.axes as Record<string, { rows: Row[] }>)[axis].rows;

/** The value order the page must draw: highest first, name breaking a
 *  tie, a missing value last. Computed here from the payload, not read
 *  back off the page. */
const valueOrder = (rows: Row[]) => [...rows].sort((a, b) => {
  const x = a.value, y = b.value;
  if (x == null) return 1;
  if (y == null) return -1;
  return y - x || a.club.localeCompare(b.club);
});

// ── derived variants, each named ────────────────────────────────────────

/** MLS and Liga MX moved onto a second ladder — the 2026-09-09 corpus's
 *  shape, where Europe and North America were two components. */
function twoLadders() {
  const p = clone(LEAGUES) as Payload;
  for (const a of Object.values(p.axes) as { rows: Row[] }[]) {
    for (const r of a.rows) {
      if (r.column === "mls" || r.column === "ligamx") {
        r.ladder = "B"; r.component = 1;
      }
    }
  }
  return p;
}

/** Every club below the floor — a fact of the whole section. */
function allBelowFloor() {
  const p = clone(LEAGUES) as Payload;
  for (const r of rowsOf(p)) {
    r.below_floor = true;
    r.floor_refusal = "the league fails C2 at this pass count";
    r.floor_failing_condition = "C2";
  }
  return p;
}

/** The first recorded row of each of three clubs with figures REMOVED —
 *  absent from the wire, which the page must name, never zero. */
const STRIPPED = ["value", "half_width_95", "bridge_fixtures",
  "games_played", "tier", "tier_set", "lo", "hi"];
function withAbsences() {
  const p = clone(LEAGUES) as Payload;
  const rows = rowsOf(p);
  const hit = rows.filter((r) => (r.bridge_fixtures as number) > 0).slice(0, 3);
  for (const r of hit) for (const k of STRIPPED) delete r[k];
  return { p, clubs: hit.map((r) => r.club) };
}

/** Every cup but the FIRST with its attack and defence REMOVED — the
 *  shape of the first recording (2026-09-23), when the Leagues Cup ·
 *  Campeones Cup and EFL Cup fields were overall-only. Since backend
 *  #183 every recorded cup carries all three axes, so the "a cup
 *  without the axis is NAMED" rule has no real subject left on the wire
 *  and is proven on this variant instead. Only whole axes are dropped;
 *  no row, value or sentence is touched. */
function goalAxesOnFirstCupOnly() {
  const c = clone(CUPS);
  for (const cup of c.cups.slice(1)) {
    const axes = cup.axes as Record<string, unknown>;
    delete axes.attack;
    delete axes.defence;
    cup.axes_measured = ["overall"];
  }
  return c;
}

// ═════════════════════════ 3 · 5 · the ranked table ═════════════════════

test("the page opens on the league field: every recorded row, one ladder, "
   + "one table", async ({ page }) => {
  await open(page);
  const rows = rowsOf(LEAGUES);
  const ladders = new Set(rows.map((r) => String(r.ladder)));
  expect(ladders.size, "the recording is the union corpus: one ladder")
    .toBe(1);
  await expect(page.getByTestId("ladder-section")).toHaveCount(1);
  await expect(page.getByTestId("field-table")).toHaveCount(1);
  await expect(page.getByTestId("field-row")).toHaveCount(rows.length);
  await expect(page.locator('[data-testid="field-notice"][data-kind="split"]'))
    .toHaveCount(0);
  // the section says which columns it ACTUALLY holds, read off its rows
  await expect(page.getByTestId("section-note"))
    .toContainText("all eight columns");
  await expect(page.getByTestId("section-note"))
    .toContainText("one connected component");
  await expect(page.getByTestId("field-count"))
    .toHaveText(`${rows.length} of ${rows.length} clubs`);
});

test("rows are ranked by VALUE, never in the bundle's name order",
  async ({ page }) => {
    const rows = rowsOf(LEAGUES);
    const want = valueOrder(rows).map((r) => r.club);
    // NON-VACUITY: the recording arrives in an order that is NOT the
    // value order, so drawing in data order would fail this.
    expect(rows.map((r) => r.club)).not.toEqual(want);
    await open(page);
    const got = await page.getByTestId("field-row")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-club")));
    expect(got).toEqual(want);
    const ranks = await page.getByTestId("field-row")
      .evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-rank"))));
    expect(ranks).toEqual(want.map((_, i) => i + 1));
  });

test("the sort headers are buttons a keyboard reaches, and aria-sort says "
  + "which column sorts and which way", async ({ page }) => {
    // AUDIT F13 (2026-09-25): they were `<th onClick>`, which Tab never
    // reaches and a screen reader never announces as a control.
    await open(page);
    const table = page.getByTestId("field-table").first();
    const clubTh = table.locator('th[data-sort="club"]');
    const clubBtn = clubTh.getByRole("button", { name: /club/i });
    await expect(clubBtn).toHaveCount(1);
    // every sortable header has exactly one button; the others have none
    const sortable = await table.locator("th[data-sort]").count();
    expect(sortable).toBeGreaterThan(2);
    await expect(table.locator("th[data-sort] button")).toHaveCount(sortable);
    await expect(table.locator("th:not([data-sort]) button")).toHaveCount(0);
    await expect(clubTh).toHaveAttribute("aria-sort", "none");

    // THE KEYBOARD, not a click: focus it and press Enter, then Space
    await clubBtn.focus();
    await expect(clubBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(clubTh).toHaveAttribute("aria-sort", "ascending");
    const first = await page.getByTestId("field-row").first()
      .getAttribute("data-club");
    const names = await page.getByTestId("field-row")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-club") ?? ""));
    expect(first).toBe([...names].sort((a, b) => a.localeCompare(b))[0]);
    await page.keyboard.press("Space");
    await expect(clubTh).toHaveAttribute("aria-sort", "descending");
  });

test("a search FINDS a club without renumbering it", async ({ page }) => {
  const want = valueOrder(rowsOf(LEAGUES));
  const pick = want[Math.floor(want.length / 2)];
  await open(page);
  await page.getByLabel("find a club").fill(pick.club);
  const row = page.locator(`[data-testid="field-row"][data-club="${pick.club}"]`);
  await expect(row).toHaveAttribute("data-rank",
    String(want.indexOf(pick) + 1));
});

test("TWO LADDERS SELECTED: two tables and a refusal of a single ranking",
  async ({ page }) => {
    const p = twoLadders();
    await open(page, p);
    await expect(page.getByTestId("ladder-section")).toHaveCount(2);
    await expect(page.locator('[data-testid="field-notice"][data-kind="split"]'))
      .toContainText("no single ranking");
    const b = page.locator('[data-testid="ladder-section"][data-ladder="B"]');
    // the label lists the columns the ladder ACTUALLY holds
    await expect(b.getByTestId("section-note")).toContainText("MLS, Liga MX");
    await expect(b.getByTestId("section-note")).toContainText("a separate component");
    // each ladder is ranked from 1 on its own
    for (const lad of ["A", "B"]) {
      const s = page.locator(`[data-testid="ladder-section"][data-ladder="${lad}"]`);
      await expect(s.getByTestId("field-row").first())
        .toHaveAttribute("data-rank", "1");
      const n = rowsOf(p).filter((r) => r.ladder === lad).length;
      await expect(s.getByTestId("field-row")).toHaveCount(n);
    }
    // and deselecting ladder B's columns folds it back to ONE table —
    // the split is a property of the selection, not of the page
    for (const k of ["mls", "ligamx"]) {
      await page.locator(`[data-testid="league-pill"][data-key="${k}"]`).click();
    }
    await expect(page.getByTestId("ladder-section")).toHaveCount(1);
    await expect(page.locator('[data-testid="field-notice"][data-kind="split"]'))
      .toHaveCount(0);
  });

// ═════════════════════════ 6 · bridges read first ═══════════════════════

test("zero bridges ⟺ hollow ring ⟺ no bar, on every row of every axis",
  async ({ page }) => {
    await open(page);
    for (const axis of ["overall", "attack", "defence"]) {
      await page.locator(`[data-testid="axis-button"][data-axis="${axis}"]`).click();
      const rows = rowsOf(LEAGUES, axis);
      const zero = rows.filter((r) => r.bridge_fixtures === 0);
      expect(zero.length, `${axis}: the recording carries zero-bridge rows`)
        .toBeGreaterThan(0);
      await expect(page.getByTestId("field-row")).toHaveCount(rows.length);
      for (const r of rows) {
        const tr = page.locator(`[data-testid="field-row"][data-club="${r.club}"]`
          + `[data-column="${r.column}"]`);
        const z = r.bridge_fixtures === 0;
        await expect(tr.locator('[data-testid="pip"][data-hollow="yes"]'),
          `${axis}/${r.club}`).toHaveCount(z ? 1 : 0);
        await expect(tr.getByTestId("bar-refused"), `${axis}/${r.club}`)
          .toHaveCount(z ? 1 : 0);
        await expect(tr.getByTestId("bar"), `${axis}/${r.club}`)
          .toHaveCount(z ? 0 : 1);
        await expect(tr.getByTestId("bridge-count"))
          .toHaveText(String(r.bridge_fixtures));
      }
    }
  });

test("the bridge count is LEFT of the interval", async ({ page }) => {
  await open(page);
  const heads = await page.locator('[data-testid="field-table"] thead th')
    .allInnerTexts();
  const h = heads.map((t) => t.toLowerCase());
  const b = h.findIndex((t) => t.startsWith("bridges"));
  const i = h.findIndex((t) => t.startsWith("interval"));
  expect(b).toBeGreaterThan(-1);
  expect(i).toBeGreaterThan(b);
});

// ═════════════════════════ 4 · one table, one axis ══════════════════════

test("every bar in the table is drawn on ONE axis — the span of the rows "
   + "shown", async ({ page }) => {
  await open(page);
  const rows = rowsOf(LEAGUES).filter((r) => r.bridge_fixtures !== 0);
  const lo = Math.min(...rows.map((r) => r.lo as number));
  const hi = Math.max(...rows.map((r) => r.hi as number));
  // NON-VACUITY: two columns whose own scales differ, so a per-column
  // scale would draw at least one of these points somewhere else.
  const cols = new Set(rows.map((r) => r.column));
  expect(cols.size).toBeGreaterThan(1);
  for (const r of rows) {
    const tr = page.locator(`[data-testid="field-row"][data-club="${r.club}"]`
      + `[data-column="${r.column}"]`);
    const left = await tr.getByTestId("bar").locator("i").nth(1)
      .evaluate((e) => parseFloat((e as HTMLElement).style.left));
    const want = ((r.value as number) - lo) / (hi - lo) * 100;
    expect(left, r.club).toBeCloseTo(want, 1);
  }
});

// ═════════════════════════ 7 · one league ════════════════════════════════

test("ONE LEAGUE SELECTED is a within-league read: played and spans of its "
   + "league replace bridges and the band", async ({ page }) => {
  await open(page);
  const keep = "eredivisie";
  const cols = LEAGUES.columns.map((c) => c.key);
  for (const k of cols) {
    if (k !== keep) {
      await page.locator(`[data-testid="league-pill"][data-key="${k}"]`).click();
    }
  }
  await expect(page.locator('[data-testid="field-notice"][data-kind="solo"]'))
    .toContainText("within-league read");
  const heads = (await page.locator('[data-testid="field-table"] thead th')
    .allInnerTexts()).map((t) => t.toLowerCase());
  expect(heads.some((t) => t.startsWith("played"))).toBe(true);
  expect(heads.some((t) => t.startsWith("spans of its league"))).toBe(true);
  expect(heads.some((t) => t.startsWith("bridges"))).toBe(false);
  expect(heads.some((t) => t.startsWith("95% band"))).toBe(false);
  const rows = rowsOf(LEAGUES).filter((r) => r.column === keep);
  // this column carries zero-bridge clubs, and here they are USABLE:
  // their league's light, not the ring
  expect(rows.some((r) => r.bridge_fixtures === 0)).toBe(true);
  await expect(page.locator('[data-testid="pip"][data-hollow="yes"]'))
    .toHaveCount(0);
  await expect(page.getByTestId("own-span")).toHaveCount(
    rows.filter((r) => r.quintiles_spanned_own_league != null).length);
  for (const r of rows) {
    const tr = page.locator(`[data-testid="field-row"][data-club="${r.club}"]`);
    const span = tr.getByTestId("own-span");
    await expect(span).toHaveAttribute("data-placeable",
      r.placeable_in_a_quintile_of_its_own_league === true ? "yes" : "no");
  }
});

// ═════════════════════════ 8 · 9 · tiers and hoisting ═══════════════════

test("a straddling tier shows its SET's range, never point + max",
  async ({ page }) => {
    const p = clone(LEAGUES) as Payload;
    const r = rowsOf(p)[0];
    r.tier = 2; r.tier_set = [2, 3]; r.straddles = true;
    const s = rowsOf(p)[1];
    s.tier = 2; s.tier_set = [1, 2]; s.straddles = true;
    await open(page, p);
    await expect(page.locator(`[data-testid="field-row"][data-club="${r.club}"] `
      + '[data-testid="tier-chip"]')).toHaveText("2–3");
    // point tier 2, set 1–2: the range is 1–2, NOT "2–2"
    await expect(page.locator(`[data-testid="field-row"][data-club="${s.club}"] `
      + '[data-testid="tier-chip"]')).toHaveText("1–2");
  });

test("a fact true of the whole section is said ONCE, in its header",
  async ({ page }) => {
    await open(page, allBelowFloor());
    await expect(page.getByTestId("section-note"))
      .toContainText("every club below the floor");
    await expect(page.getByTestId("floor-chip")).toHaveCount(0);
  });

test("…and a fact true of one row stays on that row", async ({ page }) => {
  const p = clone(LEAGUES) as Payload;
  const r = rowsOf(p)[4];
  r.below_floor = true; r.floor_failing_condition = "C3";
  await open(page, p);
  await expect(page.getByTestId("floor-chip")).toHaveCount(1);
  await expect(page.locator(`[data-testid="field-row"][data-club="${r.club}"] `
    + '[data-testid="floor-chip"]')).toHaveAttribute("title", /C3/);
  await expect(page.getByTestId("section-note")).toContainText("1 below the floor");
});

// ═════════════════════════ 11 · missing is never zero ═══════════════════

test("MISSING IS NEVER ZERO: an absent figure is named, never 0, 0.00, 0% "
   + "or a dash", async ({ page }) => {
  const { p, clubs } = withAbsences();
  await open(page, p);
  for (const club of clubs) {
    const tr = page.locator(`[data-testid="field-row"][data-club="${club}"]`);
    await expect(tr).toHaveCount(1);
    // no attribute claiming a count the payload never sent
    await expect(tr).not.toHaveAttribute("data-bridge-fixtures", /.*/);
    const cells = await tr.locator("td").allInnerTexts();
    for (const c of cells) {
      expect(c.trim(), `${club}: a cell reads as a number nobody measured`)
        .not.toMatch(/^(0|0\.0+|±0\.0+|0%|—|-|–)$/);
    }
    // each absence is NAMED
    await expect(tr.getByTestId("named-absence").first()).toBeVisible();
    await expect(tr).toContainText("not measured");
    await expect(tr).toContainText("not reported");
    await expect(tr).toContainText("not cut");
    await expect(tr.getByTestId("bar-refused")).toHaveCount(1);
  }
  // an absent value is ranked LAST, never as zero
  const last = page.getByTestId("field-row").last();
  expect(clubs).toContain(await last.getAttribute("data-club"));
  await expect(last).not.toHaveAttribute("data-rank", /.*/);
  await expect(last).toContainText("unranked");
});

// ═════════════════════════ 10 · cups ════════════════════════════════════

async function toCups(page: Page) {
  await page.getByTestId("mode-cups").click();
  await expect(page.getByTestId("cup-table")).toBeVisible();
}

test("CUPS ARE MULTI-SELECT, NEVER MERGED: the Champions League alone is "
   + "lit at first, and a pill toggles its own table", async ({ page }) => {
    await open(page);
    await toCups(page);
    const pills = page.getByTestId("cup-pill");
    await expect(pills).toHaveCount(CUPS.cups.length);
    await expect(page.locator('[data-testid="cup-pill"][aria-pressed="true"]'))
      .toHaveCount(1);
    await expect(page.locator(`[data-testid="cup-pill"][data-key="${CUPS.cups[0].key}"]`))
      .toHaveAttribute("aria-pressed", "true");
    // lighting the others ADDS a table each — nothing is replaced
    for (const [i, c] of CUPS.cups.entries()) {
      if (i > 0) await page.locator(`[data-testid="cup-pill"][data-key="${c.key}"]`).click();
      await expect(page.locator('[data-testid="cup-pill"][aria-pressed="true"]'))
        .toHaveCount(i + 1);
      await expect(page.getByTestId("cup-section")).toHaveCount(i + 1);
    }
    // one table per cup, in the payload's cup order, each its OWN fit
    expect(await page.getByTestId("cup-section").evaluateAll(
      (els) => els.map((e) => e.getAttribute("data-cup"))))
      .toEqual(CUPS.cups.map((c) => c.key));
    await expect(page.getByTestId("cup-table")).toHaveCount(CUPS.cups.length);
    for (const c of CUPS.cups) {
      const s = page.locator(`[data-testid="cup-section"][data-cup="${c.key}"]`);
      await expect(s.getByTestId("cup-note")).toContainText(`${c.passes} passes`);
      await expect(s.getByTestId("cup-note"))
        .toContainText(`corpus ${c.corpus_sha256.slice(0, 8)}`);
      // ranked by value, WITHIN the cup, from 1
      const want = valueOrder(c.axes.overall.rows as unknown as Row[]).map((r) => r.club);
      expect(await s.getByTestId("cup-row").evaluateAll(
        (els) => els.map((e) => e.getAttribute("data-club")))).toEqual(want);
      expect(await s.getByTestId("cup-row").evaluateAll(
        (els) => els.map((e) => Number(e.getAttribute("data-rank")))))
        .toEqual(want.map((_, i) => i + 1));
    }
    // the count is the sum across the tables shown
    const total = CUPS.cups.reduce((n, c) => n + c.axes.overall.rows.length, 0);
    await expect(page.getByTestId("cup-count")).toHaveText(`${total} of ${total} clubs`);
    // and un-lighting one takes only its own table away
    await page.locator(`[data-testid="cup-pill"][data-key="${CUPS.cups[0].key}"]`).click();
    expect(await page.getByTestId("cup-section").evaluateAll(
      (els) => els.map((e) => e.getAttribute("data-cup"))))
      .toEqual(CUPS.cups.slice(1).map((c) => c.key));
  });

test("the incomparability note is there only at TWO OR MORE cups",
  async ({ page }) => {
    await open(page);
    await toCups(page);
    const note = page.getByTestId("cups-split-note");
    await expect(note).toHaveCount(0);
    const [, second, third] = CUPS.cups;
    await page.locator(`[data-testid="cup-pill"][data-key="${second.key}"]`).click();
    await expect(note).toContainText("2 cups, 2 separate measurements.");
    await expect(note).toContainText("Each table has its own corpus, pass count, "
      + "axis and rank. A club’s figure in one says nothing about its figure in "
      + "another, so the tables are never merged or sorted against each other.");
    await page.locator(`[data-testid="cup-pill"][data-key="${third.key}"]`).click();
    await expect(note).toContainText("3 cups, 3 separate measurements.");
    await page.locator(`[data-testid="cup-pill"][data-key="${second.key}"]`).click();
    await page.locator(`[data-testid="cup-pill"][data-key="${third.key}"]`).click();
    await expect(note).toHaveCount(0);
  });

test("EACH CUP ITS OWN AXIS: every bar in a cup's table is drawn on that "
   + "cup's rows, never on the span of all the cups shown", async ({ page }) => {
    await open(page);
    await toCups(page);
    await page.getByTestId("cup-select-all").click();
    const spans = CUPS.cups.map((c) => {
      const rs = c.axes.overall.rows as unknown as Row[];
      return { lo: Math.min(...rs.map((r) => r.lo as number)),
               hi: Math.max(...rs.map((r) => r.hi as number)) };
    });
    // NON-VACUITY: the cups' own spans differ, so one shared axis would
    // draw at least one point somewhere else
    expect(new Set(spans.map((x) => `${x.lo}:${x.hi}`)).size).toBeGreaterThan(1);
    for (const [i, c] of CUPS.cups.entries()) {
      const { lo, hi } = spans[i];
      const s = page.locator(`[data-testid="cup-section"][data-cup="${c.key}"]`);
      for (const r of c.axes.overall.rows as unknown as Row[]) {
        if (r.lo == null || r.hi == null || r.value == null) continue;
        const left = await s.locator(`[data-testid="cup-row"][data-club="${r.club}"]`)
          .getByTestId("bar").locator("i").nth(1)
          .evaluate((e) => parseFloat((e as HTMLElement).style.left));
        expect(left, `${c.key}/${r.club}`)
          .toBeCloseTo(((r.value as number) - lo) / (hi - lo) * 100, 1);
      }
    }
  });

test("a search across the selected cups FINDS a club in each without "
   + "renumbering it", async ({ page }) => {
    await open(page);
    await toCups(page);
    await page.getByTestId("cup-select-all").click();
    await page.getByLabel("find a club in the selected cups").fill("Arsenal");
    const has = CUPS.cups.filter((c) => c.axes.overall.rows.some((r) => r.club === "Arsenal"));
    expect(has.length, "the recording has Arsenal in two fields").toBe(2);
    for (const c of has) {
      const rank = valueOrder(c.axes.overall.rows as unknown as Row[])
        .findIndex((r) => r.club === "Arsenal") + 1;
      await expect(page.locator(`[data-testid="cup-section"][data-cup="${c.key}"] `
        + '[data-testid="cup-row"][data-club="Arsenal"]'))
        .toHaveAttribute("data-rank", String(rank));
    }
    await expect(page.getByTestId("cup-count")).toHaveText(
      `2 of ${CUPS.cups.reduce((n, c) => n + c.axes.overall.rows.length, 0)} clubs`);
  });

test("the incomparability is STATED, with a worked example read off the "
   + "fields", async ({ page }) => {
  await open(page);
  await toCups(page);
  const note = page.getByTestId("cups-incomparable");
  await expect(note).toContainText("So every cup gets its own table. Select one "
    + "or all of them, but no two share both a corpus and a pass count, and a "
    + "number is only comparable to another on the same one — so the tables are "
    + "never merged, ranked or scaled against each other: ");
  await expect(note).not.toContainText("one at a time");
  await expect(page.getByTestId("field-tag"))
    .toHaveText("one table per cup · each on its own corpus");
  const [ucl, , efl] = CUPS.cups;
  const a = ucl.axes.overall.rows.find((r) => r.club === "Arsenal")!;
  const b = efl.axes.overall.rows.find((r) => r.club === "Arsenal")!;
  await expect(page.getByTestId("cups-example")).toContainText(
    `Arsenal is ${a.value.toFixed(1)} in the ${ucl.display} field and `
    + `${b.value.toFixed(1)} in the ${efl.display} field`);
  // and the no-bridges column is SAID rather than drawn empty
  await expect(note).toContainText("no bridges column rather than an empty one");
  const heads = (await page.locator('[data-testid="cup-table"] thead th')
    .allInnerTexts()).map((t) => t.toLowerCase());
  expect(heads.some((t) => t.includes("bridge"))).toBe(false);
  await expect(page.getByTestId("bridge-count")).toHaveCount(0);
});

test("an axis stays live while ANY selected cup carries it; a cup without "
   + "it is NAMED, never drawn from another fit", async ({ page }) => {
  /* RESTATED 2026-09-25. This read the RECORDING's two overall-only
     fields; the re-recording has none (every cup carries three axes
     since backend #183), so the rule is proven on a named derived
     variant — every cup but the first stripped of its goal axes — and
     the assertions are the same ones, over three bare cups, not two. */
  const cups = goalAxesOnFirstCupOnly();
  expect(CUPS.cups.every((c) => "attack" in c.axes),
    "the recording has an overall-only cup again: read it, not the variant")
    .toBe(true);
  await open(page, LEAGUES, cups);
  await toCups(page);
  const one = cups.cups.find((c) => !("attack" in c.axes))!;
  const three = cups.cups.find((c) => "attack" in c.axes)!;
  const bare = cups.cups.filter((c) => !("attack" in c.axes));
  expect(bare.length, "the variant has every cup but one overall-only")
    .toBe(CUPS.cups.length - 1);
  expect(bare.length).toBeGreaterThanOrEqual(2);
  const axisBtn = (ax: string) =>
    page.locator(`[data-testid="cup-axis-button"][data-axis="${ax}"]`);
  await page.getByTestId("cup-select-all").click();
  // every cup lit: attack is live, because one of them carries it
  for (const ax of ["overall", "attack", "defence"]) await expect(axisBtn(ax)).toBeEnabled();
  for (const [ax, unit] of [["attack", "goals scored / match"],
                            ["defence", "goals conceded / match"]] as const) {
    await axisBtn(ax).click();
    await expect(axisBtn(ax)).toHaveAttribute("aria-pressed", "true");
    // only the cup that carries it gets a table, ranked from 1 on its own
    await expect(page.getByTestId("cup-section")).toHaveCount(1);
    await expect(page.getByTestId("cup-section")).toHaveAttribute("data-cup", three.key);
    await expect(page.getByTestId("cup-row").first()).toHaveAttribute("data-rank", "1");
    const n = (three.axes as Record<string, { rows: unknown[] }>)[ax].rows.length;
    await expect(page.getByTestId("cup-count")).toHaveText(`${n} of ${n} clubs`);
    // and the others are named in ONE line
    const absent = page.getByTestId("cup-axis-absent");
    await expect(absent).toHaveCount(1);
    await expect(absent).toHaveText(`${unit} is not measured for `
      + `${bare.map((c) => c.display).join(" or ")}. These fields carry the overall `
      + "axis only — named, not filled from another fit.");
  }
  // un-light the cup that carries it: attack and defence go dead, with the
  // reason, and the view falls back to the axis the fields HAVE
  await page.locator(`[data-testid="cup-pill"][data-key="${three.key}"]`).click();
  for (const ax of ["attack", "defence"]) {
    await expect(axisBtn(ax)).toBeDisabled();
    await expect(axisBtn(ax)).toHaveAttribute("title", `${ax} is not measured for `
      + `${bare.map((c) => c.display).join(" or ")} — these fields carry the overall axis only`);
  }
  await expect(axisBtn("overall")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("cup-axis-absent")).toHaveCount(0);
  // one field alone says it in the singular
  for (const c of bare.slice(1)) {
    await page.locator(`[data-testid="cup-pill"][data-key="${c.key}"]`).click();
  }
  await expect(axisBtn("attack")).toHaveAttribute("title",
    new RegExp(`attack is not measured for ${one.display.replace(/[·]/g, ".")} `
      + "— this field carries the overall axis only"));
});

test("the Leagues/Cups choice is remembered, and ?comp= opens a cup",
  async ({ page }) => {
    await open(page);
    await toCups(page);
    await page.reload();
    await expect(page.getByTestId("cup-table")).toBeVisible();
    await expect(page.getByTestId("mode-cups")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("mode-leagues").click();
    await page.reload();
    await expect(page.getByTestId("field-table")).toBeVisible();
    // an alias opens the field it shares
    await page.goto("/bet-suggester/ratings?comp=leaguescup");
    await expect(page.getByTestId("cup-section")).toHaveCount(1);
    await expect(page.getByTestId("cup-section")).toHaveAttribute("data-cup", "campeones");
    // EXACTLY that cup is lit — not it and the default
    await expect(page.locator('[data-testid="cup-pill"][aria-pressed="true"]'))
      .toHaveCount(1);
    await expect(page.locator('[data-testid="cup-pill"][data-key="campeones"]'))
      .toHaveAttribute("aria-pressed", "true");
  });

// ═════════════════════════ 11 · it shows, it does not decide ═══════════

test("no decide vocabulary on either view, and the charter is there",
  async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("field-charter"))
      .toContainText(/nothing here is a recommendation/i);
    for (const view of ["leagues", "cups"]) {
      if (view === "cups") await toCups(page);
      const body = (await page.locator("main").innerText()).toLowerCase();
      for (const banned of ["you should", "cash out", "sell", "buy now",
        "bet on", "back the", "best pick", "take this", "value bet"]) {
        expect(body, `${view}: "${banned}"`).not.toContain(banned);
      }
    }
  });

test("the page states its fit: corpus and pass count, and no 'not yet live' "
   + "caveat", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("field-fit"))
    .toContainText(LEAGUES.corpus_sha256.slice(0, 8));
  await expect(page.getByTestId("field-fit"))
    .toContainText(`${LEAGUES.passes} passes`);
  await expect(page.getByTestId("same-fit")).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/not yet live/i);
});

test("…and where the live panel is on another fit, it says THAT instead",
  async ({ page }) => {
    const p = clone(LEAGUES) as Payload;
    p.live_ucl_field = { corpus_sha256: "00b3d0a3" + "0".repeat(56),
                         passes: "3", same_fit: false };
    await open(page, p);
    await expect(page.getByTestId("same-fit")).toHaveCount(0);
    await expect(page.getByTestId("field-fit")).toContainText("not the same measurement");
  });

test("clubs in season and not in the fit are LISTED, never ranked",
  async ({ page }) => {
    await open(page);
    const prov = LEAGUES.provisional;
    expect(prov.length).toBeGreaterThan(0);
    await expect(page.getByTestId("provisional-row")).toHaveCount(prov.length);
    for (const p of prov) {
      await expect(page.locator(`[data-testid="field-row"][data-club="${p.club}"]`))
        .toHaveCount(0);
    }
  });

test("a failed read is NAMED — the backend's sentence, or its status",
  async ({ page }) => {
    await serve(page, { detail: "league field unavailable: bytes refused" },
                CUPS, { leaguesStatus: 503 });
    await page.goto("/bet-suggester/ratings");
    await expect(page.getByTestId("field-read-error"))
      .toContainText("league field unavailable: bytes refused");
    await expect(page.getByTestId("field-table")).toHaveCount(0);
  });

test("…and a failure with nothing to say still says its status",
  async ({ page }) => {
    await serve(page, null, CUPS, { leaguesStatus: 502, raw: "<h1>bad</h1>" });
    await page.goto("/bet-suggester/ratings");
    await expect(page.getByTestId("field-read-error")).toContainText("502");
    await expect(page.getByTestId("field-table")).toHaveCount(0);
  });

// ═════════════════════════ the proxy forwards both reads ════════════════

/* A ROUTE THE PROXY DROPS IS A 404 THE PAGE WOULD BLAME ON DATA. Every
   test above mocks the two reads in the browser, which is exactly why
   none of them can see the Next proxy between the page and the backend
   (the `tournament` and `markets/discovery` holes each shipped past
   green hermetic specs that way). So these two go through the real
   handler, unmocked, and read the rewritten URL off the hold-out. */
for (const resource of ["leagues", "cups"]) {
  test(`the proxy forwards /api/field/${resource} — unmocked on purpose`,
    async ({ request }) => {
      await expectForwarded(request, "field", resource);
    });
}

// ═════════════════════════ 2 · the pills ════════════════════════════════

const RIBBON = readFileSync(path.join(__dirname, "..", "src", "components",
  "LeagueRibbon.tsx"), "utf8");
const PILLS = readFileSync(path.join(__dirname, "..", "src", "components",
  "FieldPills.tsx"), "utf8");

test("the reveal's constants ARE the ribbon's", () => {
  for (const k of ["CHURN", "CHURN_MS", "REVEAL_MS", "STAGGER_MS", "RGAP"]) {
    const re = new RegExp(`const ${k} = ([^;]+);`);
    const a = RIBBON.match(re)?.[1];
    const b = PILLS.match(re)?.[1];
    expect(a, `LeagueRibbon declares ${k}`).toBeTruthy();
    expect(b, `${k} differs from the ribbon's`).toBe(a);
  }
});

test("the eight pills are the ribbon's pill, in ONE strip, lit and unlit as "
   + "the ribbon lights them", async ({ page }) => {
  await page.setViewportSize({ width: 1160, height: 900 });
  await open(page);
  const pills = page.getByTestId("league-pill");
  await expect(pills).toHaveCount(LEAGUES.columns.length);
  // the operator's declared order, from the payload
  expect(await pills.evaluateAll((els) => els.map((e) => e.getAttribute("data-key"))))
    .toEqual(LEAGUES.columns.map((c) => c.key));
  // one row: every pill on the same line, one width (the slot)
  const boxes = await pills.evaluateAll((els) => els.map((e) => {
    const b = e.getBoundingClientRect(); return { y: b.top, w: b.width };
  }));
  expect(new Set(boxes.map((b) => Math.round(b.y))).size).toBe(1);
  expect(new Set(boxes.map((b) => Math.round(b.w))).size).toBe(1);
  const cls = await pills.first().getAttribute("class");
  for (const c of ["rounded-lg", "bg-bs-elev2", "tracking-[0.08em]", "border-line"]) {
    expect(cls).toContain(c);
  }
  const dot = pills.first().getByTestId("pill-dot");
  await expect(dot).toHaveCSS("opacity", "1");
  expect(await dot.evaluate((e) => (e as HTMLElement).style.boxShadow))
    .toMatch(/color-mix\(in srgb, .+ 22%, transparent\)/);
  await pills.first().click();
  await expect(pills.first()).toHaveAttribute("aria-pressed", "false");
  await expect(dot).toHaveCSS("opacity", "0.3");
});

test("A TOKEN PER PILL: toggling seven pills in a row strands none mid-churn",
  async ({ page }) => {
    await open(page);
    const pills = page.getByTestId("league-pill");
    const n = await pills.count();
    for (let i = 0; i < n - 1; i++) await pills.nth(i).click({ delay: 0 });
    await page.waitForTimeout(1500);
    const texts = await pills.evaluateAll((els) => els.map((e) =>
      Array.from(e.querySelectorAll("[data-cell]")).map((c) => c.textContent).join("")));
    expect(texts).toEqual(LEAGUES.columns.map((c) => c.display));
    await expect(page.locator('[data-churn="1"]')).toHaveCount(0);
  });

test("under reduced motion the reveal is silent", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await open(page);
  const pill = page.getByTestId("league-pill").first();
  await pill.click();
  const churned = await page.evaluate(() =>
    document.querySelectorAll('[data-churn="1"]').length);
  expect(churned).toBe(0);
  await ctx.close();
});

test("the coarse-pointer 44px floor holds on this page", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
    deviceScaleFactor: 3, reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await open(page);
  const a = await auditFloor(page);
  expect(a.census).toBeGreaterThan(10);
  expect(a.examples).toEqual([]);
  expect(a.pressFail).toBe(0);
  expect(a.theft).toBe(0);
  await ctx.close();
});

// ═════════════════════════ 12 · select all / deselect all ═══════════════

/* WHICH PILLS CHURNED. A MutationObserver on the strip records every pill
   a reveal touched, so "only the pills that changed" is read off the DOM
   rather than timed against a frame. */
async function watchChurn(page: Page, strip: string) {
  // any reveal already running (the strip's arrival) settles first
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-churn="1"]')).toHaveCount(0);
  await page.evaluate((id) => {
    const w = window as unknown as { __churned: Set<string> };
    w.__churned = new Set();
    const el = document.querySelector(`[data-testid="${id}"]`)!;
    new MutationObserver((ms) => {
      for (const m of ms) {
        const t = m.target as HTMLElement;
        if (t.getAttribute("data-churn") !== "1") continue;
        const k = t.closest("[data-pill]")?.getAttribute("data-key");
        if (k) w.__churned.add(k);
      }
    }).observe(el, { subtree: true, attributes: true, attributeFilter: ["data-churn"] });
  }, strip);
}
const churned = (page: Page) => page.evaluate(() =>
  [...(window as unknown as { __churned: Set<string> }).__churned].sort());

test("LEAGUES: select all / deselect all is an ACTION — it says what a press "
   + "will do, and empties or fills the strip", async ({ page }) => {
  await open(page);
  const all = page.getByTestId("league-select-all");
  const pills = page.getByTestId("league-pill");
  const n = LEAGUES.columns.length;
  const total = rowsOf(LEAGUES).length;
  // it sits in the first control row, right after "with evidence only"
  expect(await page.getByTestId("evidence-only").evaluate(
    (e) => e.nextElementSibling?.getAttribute("data-testid"))).toBe("league-select-all");
  // an action, not a state: never pressed, never the lit gold border
  await expect(all).not.toHaveAttribute("aria-pressed", /.*/);
  const cls = (await all.getAttribute("class")) ?? "";
  for (const c of ["border-dashed", "text-ink-low", "hover:text-ink-hi"]) {
    expect(cls).toContain(c);
  }
  expect(cls).not.toContain("border-accent");
  // every league lit, so a press would empty the strip
  await expect(page.locator('[data-testid="league-pill"][aria-pressed="true"]')).toHaveCount(n);
  await expect(all).toHaveText("deselect all");
  await expect(all).toHaveAttribute("aria-label", "deselect every league");
  await all.click();
  await expect(page.locator('[data-testid="league-pill"][aria-pressed="false"]')).toHaveCount(n);
  await expect(all).toHaveText("select all");
  await expect(all).toHaveAttribute("aria-label", "select every league");
  await expect(page.getByTestId("field-row")).toHaveCount(0);
  await expect(page.getByTestId("field-empty"))
    .toHaveText("No league selected — pick one above, or select all.");
  await expect(page.getByTestId("field-count")).toHaveText(`0 of ${total} clubs`);
  await expect(all).not.toHaveClass(/border-accent/);
  // …and fills it again
  await all.click();
  await expect(page.locator('[data-testid="league-pill"][aria-pressed="true"]')).toHaveCount(n);
  await expect(page.getByTestId("field-row")).toHaveCount(total);
  await expect(page.getByTestId("field-empty")).toHaveCount(0);
  // a HALF-lit strip fills in on the first press rather than emptying
  await pills.nth(2).click();
  await expect(all).toHaveText("select all");
  await all.click();
  await expect(page.locator('[data-testid="league-pill"][aria-pressed="true"]')).toHaveCount(n);
  await expect(all).toHaveText("deselect all");
});

test("LEAGUES: a filter miss still says so — 'no league selected' is only "
   + "for an empty strip", async ({ page }) => {
  await open(page);
  await page.getByLabel("find a club", { exact: true }).fill("zzzz no such club");
  await expect(page.getByTestId("field-table")).toContainText("No club matches this filter.");
  await expect(page.locator("main")).not.toContainText("No league selected");
});

test("LEAGUES: select all replays the reveal on the pills it CHANGED, and "
   + "on no other", async ({ page }) => {
  await open(page);
  const moved = [LEAGUES.columns[0].key, LEAGUES.columns[5].key];
  for (const k of moved) {
    await page.locator(`[data-testid="league-pill"][data-key="${k}"]`).click();
  }
  await watchChurn(page, "league-strip");
  await page.getByTestId("league-select-all").click();
  await page.waitForTimeout(1200);
  expect(await churned(page)).toEqual([...moved].sort());
  await expect(page.locator('[data-churn="1"]')).toHaveCount(0);
});

test("CUPS: select all draws three tables, each ranked from 1; deselect all "
   + "empties the view and says how to fill it", async ({ page }) => {
  await open(page);
  await toCups(page);
  const all = page.getByTestId("cup-select-all");
  await expect(page.getByLabel("find a club in the selected cups")).toBeVisible();
  await expect(all).not.toHaveAttribute("aria-pressed", /.*/);
  expect((await all.getAttribute("class")) ?? "").toContain("border-dashed");
  // only the Champions League is lit, so a press would fill the strip
  await expect(all).toHaveText("select all");
  await expect(all).toHaveAttribute("aria-label", "select every cup");
  await all.click();
  await expect(page.locator('[data-testid="cup-pill"][aria-pressed="true"]'))
    .toHaveCount(CUPS.cups.length);
  await expect(page.getByTestId("cup-table")).toHaveCount(CUPS.cups.length);
  for (const c of CUPS.cups) {
    const s = page.locator(`[data-testid="cup-section"][data-cup="${c.key}"]`);
    await expect(s.locator("h2")).toHaveText(c.display);
    await expect(s.getByTestId("cup-row").first()).toHaveAttribute("data-rank", "1");
    await expect(s.getByTestId("cup-row")).toHaveCount(c.axes.overall.rows.length);
  }
  await expect(page.getByTestId("cups-split-note"))
    .toContainText(`${CUPS.cups.length} cups, ${CUPS.cups.length} separate measurements.`);
  await expect(all).toHaveText("deselect all");
  await expect(all).toHaveAttribute("aria-label", "deselect every cup");
  await all.click();
  await expect(page.locator('[data-testid="cup-pill"][aria-pressed="true"]')).toHaveCount(0);
  await expect(page.getByTestId("cup-section")).toHaveCount(0);
  await expect(page.getByTestId("cups-split-note")).toHaveCount(0);
  await expect(page.getByTestId("cup-empty"))
    .toHaveText("No cup selected — pick one above, or select all.");
  await expect(page.getByTestId("cup-count")).toHaveText("0 of 0 clubs");
  await expect(all).toHaveText("select all");
});

test("CUPS: select all replays the reveal on the pills it CHANGED, and on "
   + "no other", async ({ page }) => {
  await open(page);
  await toCups(page);
  await watchChurn(page, "cup-strip");
  await page.getByTestId("cup-select-all").click();
  await page.waitForTimeout(1200);
  expect(await churned(page)).toEqual(CUPS.cups.slice(1).map((c) => c.key).sort());
});

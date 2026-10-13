/** THE DRAWN COLUMNS FILL THE TRACK, ON EVERY TAB, AT ANY COUNT
 *  (Son, 2026-10-12: "a visible gap between the two drawn columns").
 *
 *  Nations at 1440 with UEFA Nations League folded into the off-season line
 *  drew 2 of 3 columns, each squeezed to two thirds of its track with the
 *  finished tail in the remaining third — a hole where the Leagues tab, at
 *  the same count, draws two full-width columns. The cause was inside the
 *  column, not the track: with no matchday bands on the board, a resting
 *  column's rest-day card and its finished tail were BOTH placed on row 3
 *  of the column's single-column subgrid, so the tail was auto-placed into
 *  an implicit second column (components/PickerColumn.tsx).
 *
 *  So this measures what the reader sees, for 1, 2 and 3 drawn columns on
 *  Leagues, Cups and Nations, on a board with matchday bands and on one
 *  with none:
 *    - the track has exactly as many tracks as columns drawn, all equal;
 *    - the columns tile it edge to edge with only the 24px gutter — no
 *      empty track, no gap wider than the gutter;
 *    - every column lays out as ONE column (no implicit track inside it),
 *      and its header and every child span the column's full width.
 *  Hermetic: every board is a recorded payload served by page.route. */
import { test, expect, type Page } from "@playwright/test";
import { CHAMP_BOARD } from "./championships-recorded";
import {
  CUPS_RULES_BOARD, CUPS_RULES_REVIEW, LEAGUES_RULES_BOARD,
  LEAGUES_RULES_REVIEW, RULES_CLOCK,
} from "./cups-rules-recorded";

type Obj = Record<string, unknown>;
const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
const GAP = 24;

/** The recorded Nations board with UEFA Nations League between windows and
 *  not yet started (so it folds into the off-season line): 2 of 3 drawn. */
function nationsFolded(): Obj {
  const b = clone(CHAMP_BOARD) as unknown as Obj;
  b.rows = (b.rows as Obj[]).filter((r) => r.league !== "unl");
  b.refusals = (b.refusals as Obj[]).filter((r) => r.league !== "unl");
  ((b.competitions as Obj).unl as Obj).teams =
    { belgium: { next_fixture: { kickoff: "2026-11-12T19:45Z" } } };
  return b;
}
/** …and the 2026-10-12 shape: nothing in the window anywhere, so the board
 *  draws no matchday band and every drawn column is a rest-day card. */
function nationsQuiet(): Obj {
  const b = nationsFolded();
  b.rows = [];
  b.refusals = [];
  ((b.competitions as Obj).cnl as Obj).teams =
    { mexico: { next_fixture: { kickoff: "2026-11-12T23:00Z" } } };
  return b;
}
/** All three drawn: UNL played (a "next" fixture, not a "starts" one). */
function nationsAll(quietToo: boolean): Obj {
  const b = quietToo ? nationsQuiet() : nationsFolded();
  if (!quietToo) {
    const full = clone(CHAMP_BOARD) as unknown as Obj;
    b.rows = full.rows;
    b.refusals = full.refusals;
  }
  const unl = (b.competitions as Obj).unl as Obj;
  const groups = (unl.standings as Obj).derived as Record<string, Obj[]>;
  Object.values(groups)[0][0].gp = 1;
  return b;
}
/** A club board with nothing in its window: no bands, rest-day cards. */
function quiet(board: unknown): Obj {
  const b = clone(board) as Obj;
  b.rows = [];
  b.refusals = [];
  return b;
}

interface Boards { leagues: unknown; cups: unknown; nations: unknown }
const BANDED: Boards = {
  leagues: LEAGUES_RULES_BOARD, cups: CUPS_RULES_BOARD, nations: nationsFolded(),
};
const QUIET: Boards = {
  leagues: quiet(LEAGUES_RULES_BOARD), cups: quiet(CUPS_RULES_BOARD),
  nations: nationsQuiet(),
};

async function open(page: Page, mode: string, boards: Boards) {
  await page.clock.install({ time: new Date(RULES_CLOCK) });
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, mode);
  await page.route("**/api/picker/board**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? boards.cups : boards.leagues));
  });
  await page.route("**/api/picker/review**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? CUPS_RULES_REVIEW : LEAGUES_RULES_REVIEW));
  });
  await page.route("**/api/championships/**", (r) => r.fulfill(json(boards.nations)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
}

const drawn = (page: Page) => page.locator('[data-testid="league-col"]')
  .evaluateAll((e) => e.map((x) => x.getAttribute("data-league")!));

/** Narrow the board to its first `n` drawn columns with the chooser. */
async function drawFirst(page: Page, n: number) {
  const now = await drawn(page);
  expect(now.length, "the board draws at least this many columns").toBeGreaterThanOrEqual(n);
  if (now.length === n) return;
  await page.getByTestId("column-chooser-summary").click();
  for (const slug of now.slice(n)) {
    await page.locator(`[data-testid="column-chip"][data-slug="${slug}"]`).click();
  }
  await expect.poll(() => drawn(page)).toEqual(now.slice(0, n));
  await page.getByTestId("column-chooser-summary").click();
}

/** Everything the assertions need, read in one pass once layout settles. */
async function measure(page: Page) {
  return page.evaluate(() => {
    const track = document.querySelector<HTMLElement>('[data-testid="board-track"]')!;
    const tr = track.getBoundingClientRect();
    const cs = getComputedStyle(track);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    return {
      tracks: cs.gridTemplateColumns.split(" ").map(parseFloat),
      inner: { left: tr.left + parseFloat(cs.paddingLeft), width: track.clientWidth - pad },
      cols: [...track.querySelectorAll<HTMLElement>('[data-testid="league-col"]')].map((c) => {
        const r = c.getBoundingClientRect();
        return {
          slug: c.getAttribute("data-league"),
          x: r.left, w: r.width,
          inner: getComputedStyle(c).gridTemplateColumns.split(" ").length,
          kids: [...c.children].filter((k) => getComputedStyle(k).display !== "none")
            .map((k) => {
              const kr = k.getBoundingClientRect();
              return { what: k.getAttribute("data-testid") ?? k.getAttribute("data-slot") ?? k.tagName,
                x: kr.left, w: kr.width };
            }),
        };
      }),
    };
  });
}

for (const [shape, boards] of [["with matchday bands", BANDED], ["with no band (nothing in the window)", QUIET]] as const) {
  for (const mode of ["leagues", "cups", "nations"]) {
    for (const n of [1, 2, 3]) {
      test(`${mode}, ${shape}: ${n} drawn fill the track with no gap`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        const all = mode === "nations" && n === 3;
        await open(page, mode, all ? { ...boards, nations: nationsAll(boards === QUIET) } : boards);
        if (mode === "nations" && !all) {
          // the fold this was reported on: UNL in the line, 2 of 3 drawn
          await expect(page.getByTestId("off-season-line")).toContainText("UEFA Nations League");
        }
        await drawFirst(page, n);
        await expect.poll(async () => (await measure(page)).tracks.length).toBe(n);
        const m = await measure(page);
        const want = (m.inner.width - GAP * (n - 1)) / n;
        // n equal tracks, each 1/n of the track less the gutters
        for (const t of m.tracks) expect(t).toBeCloseTo(want, 0);
        expect(m.cols).toHaveLength(n);
        m.cols.forEach((c, i) => {
          const at = `${c.slug} (#${i + 1})`;
          // tiled edge to edge: track i starts where i-1 ended + the gutter
          expect(c.x, `${at} starts on its track`).toBeCloseTo(m.inner.left + i * (want + GAP), 0);
          expect(c.w, `${at} fills its track`).toBeCloseTo(want, 0);
          // ONE column inside the column: no implicit track beside it
          expect(c.inner, `${at} lays out as a single column`).toBe(1);
          for (const k of c.kids) {
            expect(k.x, `${at} › ${k.what} starts at the column's edge`).toBeCloseTo(c.x, 0);
            expect(k.w, `${at} › ${k.what} spans the column`).toBeCloseTo(c.w, 0);
          }
        });
        // the last column ends at the track's own edge: no empty slot after it
        const last = m.cols[n - 1];
        expect(last.x + last.w).toBeCloseTo(m.inner.left + m.inner.width, 0);
      });
    }
  }
}

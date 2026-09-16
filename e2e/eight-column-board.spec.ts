/** THE BOARD THAT CARRIES MORE COLUMNS THAN IT DRAWS.
 *
 *  Four is MEASURED, not chosen — the track is max-w-[96rem], so a card
 *  stops growing at 1536px and eight leagues cannot sit side by side at
 *  any width. These pin the window, the loop, and the two properties the
 *  design turns on: the lit four never move, and a league that is not
 *  drawn is still NAMED rather than vanished. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT, serveEight } from "./eight-columns";
// the SAME day-key and label functions the board groups and writes by,
// so this file cannot disagree with the page about which band a kickoff
// belongs to or what that band should read
import { dayLabel, localDay as localDayOf } from "../src/lib/matchday";
// …and the SAME reader that decides the column order the window rotates
// through, so a reordering of the board moves these guards with it
import { boardColumns } from "../src/lib/pickerApi";

/** THE FOUR COLUMNS IN FRONT OF YOU — RESTATED 2026-09-15.
 *
 *  "Drawn" used to mean "mounted": the page rendered four columns and no
 *  others. The board the operator approved is a continuously scrolling
 *  looped TRACK, so every declared column is mounted and which four you
 *  are looking at is a SCROLL POSITION. Every guard below that meant
 *  "the four on screen" now asks the track where it is, rather than
 *  counting elements — and that is a stricter question, not a looser
 *  one: a board that mounted four columns and never moved satisfied the
 *  old count perfectly, which is how it shipped. */
const onScreen = (page: Page) => page.evaluate(() => {
  const t = document.querySelector<HTMLElement>('[data-testid="board-track"]')!;
  const box = t.getBoundingClientRect();
  return [...t.querySelectorAll<HTMLElement>('[data-testid="league-col"]')]
    .map((c) => ({ slug: c.dataset.league!,
                   x: c.getBoundingClientRect().left - box.left }))
    .filter((c) => c.x > -4 && c.x < box.width - 4)
    .sort((a, b) => a.x - b.x).map((c) => c.slug);
});

test.describe("eight columns on a four-column board", () => {
  test("mounts all eight, shows four, and every league keeps a pill",
    async ({ page }) => {
      await serveEight(page);
      const cols = page.locator('[data-testid="league-col"]');
      /* RESTATED: eight on the track, four in the scrollport. The old
         `toHaveCount(4)` was a claim about the RENDER, and the render is
         no longer where the answer lives. */
      await expect(cols).toHaveCount(8);
      expect(await onScreen(page)).toHaveLength(4);
      await expect(page.locator('[data-testid="ribbon-pill"]')).toHaveCount(8);
      const lit = page.locator('[data-testid="ribbon-pill"][aria-selected="true"]');
      await expect(lit).toHaveCount(4);
    });

  test("the header names exactly what the board shows", async ({ page }) => {
    await serveEight(page);
    // RESTATED: against the four in the SCROLLPORT rather than the eight
    // on the track — the rail's claim is "these are on screen".
    const shown = await onScreen(page);
    expect(shown).toHaveLength(4);
    const litNames = await page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug));
    expect(litNames.slice().sort()).toEqual(shown.slice().sort());
  });

  test("it LOOPS — stepping past the last column reaches the first", async ({ page }) => {
    await serveEight(page);
    const lit = () => page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug).join(","));
    const start = await lit();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(140);
    }
    /* eight columns, eight steps: all the way round and back.
       RESTATED: the wave now takes real time. The reveal is staggered
       across the slots — the furthest is `SLOTS-1` × 26ms behind the
       first — and a pill takes its new identity when its own leg of the
       wave STARTS. Reading 90ms after the last keypress caught the rail
       mid-wave and compared a half-arrived set. The LOOP is what this
       guard is about; the latency is not, so it is waited out rather
       than asserted away. */
    await page.waitForTimeout(700);
    expect(await lit()).toBe(start);
  });

  test("a pill jumps to its league, and the board follows", async ({ page }) => {
    await serveEight(page);
    for (const slug of ["eredivisie", "ligamx", "epl"]) {
      await page.locator(`[data-testid="ribbon-pill"][data-slug="${slug}"]`).click();
      await page.waitForTimeout(250);
      /* RESTATED: the LEFTMOST ON SCREEN, not the first in the DOM. All
         eight are mounted and their DOM order never changes — what the
         jump moves is the grid position and the scroll. */
      expect((await onScreen(page))[0]).toBe(slug);
    }
  });

  test("THE LIT FOUR NEVER MOVE — what travels is the content", async ({ page }) => {
    await serveEight(page);
    const boxes = async () => page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => Math.round(e.getBoundingClientRect().left)));
    const before = await boxes();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(700);
    expect(await boxes()).toEqual(before);
  });

  test("a league that is not drawn is NAMED, never hidden", async ({ page }) => {
    await serveEight(page);
    const dim = page.locator('[data-testid="ribbon-pill"][aria-selected="false"]');
    await expect(dim).toHaveCount(4);
    for (const t of await dim.allInnerTexts()) expect(t.trim().length).toBeGreaterThan(0);
  });

  test("every column's ink is its own, and none is the brand gold", async ({ page }) => {
    await serveEight(page);
    const inks = await page.evaluate(() => {
      const out: Record<string, string> = {};
      document.querySelectorAll('[data-testid="ribbon-pill"]').forEach((b) => {
        const slug = (b as HTMLElement).dataset.slug!;
        out[slug] = getComputedStyle(document.documentElement)
          .getPropertyValue(`--lg-${slug}`).trim();
      });
      return { inks: out,
        cup: getComputedStyle(document.documentElement).getPropertyValue("--lg-cup").trim() };
    });
    const vals = Object.values(inks.inks);
    expect(vals.filter(Boolean)).toHaveLength(8);
    expect(new Set(vals).size).toBe(8);
    expect(vals).not.toContain(inks.cup);
  });

  test("the window is a NO-OP at four columns — today's board is untouched",
    async ({ page }) => {
      const four = { ...BOARD_EIGHT, leagues: Object.fromEntries(
        Object.entries(BOARD_EIGHT.leagues).slice(0, 4)) };
      await serveEight(page, four);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(4);
      await expect(page.locator('[data-testid="league-ribbon"]')).toHaveCount(0);
    });
});

/* ══ THE DATE RAIL AND THE WINDOW UNDER IT ══════════════════════════
 *
 *  A matchday band is a full-width date drawn ONCE on the rail, with a
 *  shared subgrid track under it in every column that plays that day and
 *  a `rest-day` ghost in every column that does not. The union of dates
 *  used to be taken over EVERY row the board holds, so a Thursday only
 *  Serie A plays still produced a rail entry — and whenever Serie A sat
 *  outside the drawn four, a date announcing four rest days and nothing
 *  else. The rail is a promise that the columns beneath it have
 *  something at that date; over an undrawn league it is a promise about
 *  a column the reader cannot see.
 *
 *  These five pin the property from both sides: no band without a
 *  fixture under it, and — the half that keeps the first one honest —
 *  the band DOES appear the moment the window reaches the league that
 *  plays it.
 *
 *  NOTHING BELOW ASSUMES WHICH FOUR COLUMNS OPEN. The declared order
 *  changed under this file once already (the operator's reading order,
 *  2026-09-15), and every guard that had quietly meant "at
 *  `windowStart = 0`" lost its premise with it. So each premise — a day
 *  one league owns, a band made only of kickoffs that cross midnight,
 *  two matchdays holding more than one card — is SEARCHED FOR, bounded
 *  by one lap of the window, and says so loudly when the fixture can no
 *  longer put it on screen. A guard whose premise has evaporated must
 *  fail, not pass. */

/** The declared column order, which is what the window rotates through.
 *  Derived from the same reader the board uses, so a reordering of the
 *  operator's list moves these guards with it. */
const COLUMNS = boardColumns(Object.keys(BOARD_EIGHT.leagues));
const VIEW = 4;

/** Every dated thing the board was handed, rows and refusals alike — a
 *  refusal is a fixture too and lands in a band like any other. */
type Dated = { league: string; column?: string | null; kickoff?: string | null };
const FIXTURES: readonly Dated[] = [...BOARD_EIGHT.rows, ...BOARD_EIGHT.refusals];
const colOfFixture = (f: Dated) => f.column ?? f.league;

/** THE PAYLOAD'S OWN BANDS, for a given set of drawn columns: which
 *  fixtures each LA day would draw if those four were on screen. */
function bandsOf(cols: readonly string[]) {
  const by = new Map<string, Dated[]>();
  for (const f of FIXTURES) {
    if (!f.kickoff || !cols.includes(colOfFixture(f))) continue;
    const day = localDayOf(f.kickoff);
    if (day) by.set(day, [...(by.get(day) ?? []), f]);
  }
  return by;
}

/** THE DAY ONE LEAGUE OWNS — derived from the payload, never typed as a
 *  date. A hardcoded "2026-09-17" would keep this file green through a
 *  fixture edit that removed the very row the guard turns on: the
 *  absence would still hold, for the wrong reason. */
function loneDay() {
  const days = [...bandsOf(COLUMNS)].sort(([a], [b]) => a.localeCompare(b));
  for (const [day, fs] of days) {
    const leagues = new Set(fs.map(colOfFixture));
    if (leagues.size === 1) return { day, league: [...leagues][0], fixtures: fs };
  }
  throw new Error("BOARD_EIGHT no longer contains a day played by exactly "
    + "one league — the band-window guards have nothing to measure and must "
    + "not be read as green");
}

interface BoardState {
  /** every column MOUNTED on the track, in DOM order — which since
   *  2026-09-15 is all of them and never changes. The bands below are the
   *  union over these, because a shared row track that omitted a day
   *  would leave that day's fixtures nowhere to sit. */
  cols: string[];
  /** the four in the SCROLLPORT, left to right. This is what "drawn"
   *  used to mean when the page mounted four columns and no others. */
  onScreen: string[];
  bands: { day: string; label: string }[];
  tracks: { col: string; day: string; cards: number }[];
  rests: { col: string; day: string }[];
}

const readBoard = (page: Page): Promise<BoardState> => page.evaluate(() => {
  const colOf = (e: Element) => e.closest('[data-testid="league-col"]')
    ?.getAttribute("data-league") ?? "";
  const all = (sel: string) => [...document.querySelectorAll(sel)];
  const track = document.querySelector('[data-testid="board-track"]');
  const box = track?.getBoundingClientRect();
  return {
    cols: all('[data-testid="league-col"]')
      .map((e) => e.getAttribute("data-league") ?? ""),
    onScreen: !box ? [] : all('[data-testid="league-col"]')
      .map((e) => ({ slug: e.getAttribute("data-league") ?? "",
                     x: e.getBoundingClientRect().left - box.left }))
      .filter((c) => c.x > -4 && c.x < box.width - 4)
      .sort((a, b) => a.x - b.x).map((c) => c.slug),
    bands: all('[data-testid="day-band"]').map((e) => ({
      day: e.getAttribute("data-day") ?? "",
      label: e.querySelector("span")?.textContent?.trim() ?? "",
    })),
    tracks: all('[data-testid="day-track"]').map((e) => ({
      col: colOf(e), day: e.getAttribute("data-day") ?? "",
      cards: e.querySelectorAll(
        '[data-testid="picker-row"],[data-testid="picker-refusal"]').length,
    })),
    rests: all('[data-testid="rest-day"]').map((e) => ({
      col: colOf(e), day: e.getAttribute("data-day") ?? "",
    })),
  };
});

/** TWO AGREEING READS BEFORE A VALUE IS BELIEVED.
 *
 *  `evaluateAll` and `page.evaluate` do NOT auto-wait: one read can land
 *  between React committing the columns and committing the rail, and a
 *  set-equality taken there is a fiction. `expect.poll` is no cure — it
 *  retries until the assertion passes, which is exactly how a momentary
 *  state gets certified. So the board is read twice and the two reads
 *  must agree before anything is asserted about them. */
async function settledBoard(page: Page) {
  let prev = await readBoard(page);
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(60);
    const next = await readBoard(page);
    if (JSON.stringify(next) === JSON.stringify(prev)) return next;
    prev = next;
  }
  throw new Error("the board never settled: no two consecutive reads agreed");
}

/** ArrowRight, then a settled read. Focus is dropped first: the page
 *  ignores arrow keys whose target is a form control, so a test that has
 *  just touched a `band-sort` select would otherwise step nothing and
 *  silently change the select instead. */
async function stepRight(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("ArrowRight");
  return settledBoard(page);
}

/** THE FIRST WINDOW POSITION THAT SATISFIES `want`, within ONE LAP.
 *
 *  Bounded and loud. The window wraps modulo eight, so an unbounded
 *  "step until" is a test that spins to its own deadline and reports a
 *  timeout instead of the thing that went wrong — and a premise the
 *  fixture can no longer put on screen has to be an error, never a
 *  quietly skipped assertion. */
async function windowWhere(
  page: Page, want: (s: BoardState) => boolean, what: string,
) {
  let state = await settledBoard(page);
  for (let steps = 0; steps < COLUMNS.length; steps++) {
    if (want(state)) return { state, steps };
    state = await stepRight(page);
  }
  throw new Error(`no position in one lap of the window ${what} — the last `
    + `four tried were ${state.onScreen.join(", ")}`);
}

/** RESTATED 2026-09-15: "drawn" is now "in the scrollport". Every column
 *  is mounted, so `cols.includes` would be true at every position and
 *  every search built on it would return at step 0 without moving. */
const drawing = (slug: string) => (s: BoardState) => s.onScreen.includes(slug);

const band = (page: Page, day: string) =>
  page.locator(`[data-testid="day-band"][data-day="${day}"]`);
const trackIn = (page: Page, col: string, day: string) =>
  page.locator(`[data-testid="league-col"][data-league="${col}"] `
    + `[data-testid="day-track"][data-day="${day}"]`);
const eventsIn = (page: Page, col: string, day: string) =>
  trackIn(page, col, day).locator('[data-testid="picker-row"]')
    .evaluateAll((es) => es.map((e) => e.getAttribute("data-event") ?? ""));

test.describe("the date rail keeps the window's promise", () => {
  test("every band on the rail is a day a column ON THE TRACK plays",
    async ({ page }) => {
      /* THE DEFECT ITSELF. A rail entry with a rest-day box under EVERY
         column is a date announcing that nothing happens anywhere — a
         promise about a fixture that is not on this board at all.
         RESTATED 2026-09-15: the qualifier used to be "the four DRAWN
         columns", which was a question about the render. It is a
         question about the TRACK now, because every declared column is
         mounted and the bands are the union over all of them — and a
         band the reader can scroll to is still a kept promise, while a
         band over nothing is still the defect. Checked at all eight
         positions of the loop, because the board is a different four
         columns at each and a rail that is right at the opening
         position and wrong elsewhere is what a single read cannot
         see. */
      await serveEight(page);
      /* RESTATED 2026-09-15: every declared column is MOUNTED on the
         track now, and four of them are in the scrollport. `VIEW` is
         still what the scrollport holds — see `onScreen` above. */
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);
      const seen = new Set<string>();
      for (let i = 0; i < COLUMNS.length; i++) {
        const s = i === 0 ? await settledBoard(page) : await stepRight(page);
        const where = `board showing ${s.onScreen.join(", ")}`;
        // NON-VACUOUS: a board drawing no bands at all would satisfy
        // every claim below without meaning any of them.
        expect(s.bands.length, `${where}: no bands drawn at all`)
          .toBeGreaterThan(0);
        for (const b of s.bands) {
          seen.add(b.day);
          const carrying = s.tracks.filter((t) => t.day === b.day && t.cards > 0);
          const resting = s.rests.filter((r) => r.day === b.day).map((r) => r.col);
          expect(carrying.map((t) => t.col),
            `${where}: "${b.label}" heads a full-width band, but no column `
            + `on the track has a fixture under it — `
            + `${resting.join(", ")} all show a rest day`)
            .not.toEqual([]);
        }
      }
      // and the eight positions between them showed every date the
      // payload carries, so the sweep above was not eight narrow looks
      expect([...seen].sort()).toEqual([...bandsOf(COLUMNS).keys()].sort());
    });

  test("a day ONE league plays keeps its band, its own label, and the league "
    + "that plays it can be scrolled to", async ({ page }) => {
      /* RESTATED 2026-09-15, and this is the one guard the scroller
         genuinely moved rather than merely renamed.

         WHAT IT USED TO SAY. A date played only by an UNDRAWN league
         drew no band, because a rail entry with four rest-day boxes
         under it announces a day on which nothing on screen happens.
         That held while the page MOUNTED four columns and no others.

         WHY IT CANNOT SAY IT ANY MORE. Every declared column is on the
         track, so there is no undrawn league to exclude — and excluding
         one would now be WORSE than the defect it prevented: the columns
         are subgrids over SHARED row tracks, so a day missing from the
         union has no row for its fixtures to sit in and the column that
         plays it would silently lose them. A fixture dropped is the one
         outcome this whole surface refuses.

         WHAT SURVIVES, AND IS ASSERTED. A date is still a promise about
         a column the reader can REACH: the band is there, it carries
         that league's own day label over that league's own fixture, and
         the league is brought into the scrollport by the loop rather
         than being a rumour about somewhere off the page. The
         rest-of-the-board half is asserted too — every OTHER column
         genuinely rests that day, so this remains a claim about a lone
         fixture and not about a busy one. */
      const lone = loneDay();
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);

      const state = await settledBoard(page);
      expect(state.bands.map((b) => b.day),
        `${lone.day} is played by ${lone.league} and belongs on the rail`)
        .toContain(lone.day);
      await expect(band(page, lone.day)).toHaveCount(1);
      await expect(band(page, lone.day).locator("span").first())
        .toHaveText(dayLabel(lone.fixtures[0].kickoff!));
      // over a real fixture in that league's own column, not an empty rail
      await expect(trackIn(page, lone.league, lone.day)
        .locator('[data-testid="picker-row"],[data-testid="picker-refusal"]'))
        .not.toHaveCount(0);
      // …and it is genuinely LONE: every other column rests that day
      expect(state.tracks.filter((t) => t.day === lone.day && t.cards > 0)
        .map((t) => t.col)).toEqual([lone.league]);
      expect(state.rests.filter((r) => r.day === lone.day).map((r) => r.col)
        .sort(), `${lone.day} must be a rest day in every other column`)
        .toEqual(COLUMNS.filter((c) => c !== lone.league).slice().sort());

      /* AND THE READER CAN GET TO IT. The promise the rail makes is only
         honest if the column is reachable, so the loop is stepped until
         that league is in the scrollport — bounded by one lap, and loud
         when it cannot. */
      const home = await windowWhere(page, drawing(lone.league),
        `brought ${lone.league} on screen`);
      expect(home.state.onScreen).toContain(lone.league);
      await expect(band(page, lone.day)).toHaveCount(1);
    });

  test("the rail and the tracks agree — no date over nothing, no fixture under no date",
    async ({ page }) => {
      /* BOTH DIRECTIONS, at every window position. A track with no rail
         entry is a fixture nobody dated; a rail entry with no track is
         the empty band. They are one property read from two ends, and
         the second end is the one the fix was for. */
      await serveEight(page);
      /* RESTATED 2026-09-15: every declared column is MOUNTED on the
         track now, and four of them are in the scrollport. `VIEW` is
         still what the scrollport holds — see `onScreen` above. */
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);
      for (let i = 0; i < COLUMNS.length; i++) {
        const s = i === 0 ? await settledBoard(page) : await stepRight(page);
        const where = `window on ${s.cols.join(", ")}`;
        const rail = [...new Set(s.bands.map((b) => b.day))].sort();
        const tracked = [...new Set(s.tracks.map((t) => t.day))].sort();
        expect(rail.length, `${where}: nothing on the rail`).toBeGreaterThan(0);
        expect(tracked.length, `${where}: no tracks drawn`).toBeGreaterThan(0);
        expect(rail, `${where}: the rail and the tracks name different days`)
          .toEqual(tracked);
        /* …and EVERY drawn column accounts for EVERY band — a track
           where it plays, a rest-day box where it does not. That is what
           makes the shared subgrid line up: a column silently missing a
           band slides every date below it out of register with its
           neighbours. (A column the window draws with nothing at all in
           it keeps its own louder empty state instead, and is skipped.) */
        for (const c of s.cols) {
          const mine = [...new Set([
            ...s.tracks.filter((t) => t.col === c).map((t) => t.day),
            ...s.rests.filter((r) => r.col === c).map((r) => r.day),
          ])].sort();
          if (!mine.length) continue;
          expect(mine, `${where}: ${c} does not account for every band`)
            .toEqual(rail);
        }
      }
    });

  test("a band's date is the fixture's OWN LA day, on the rail and on the compact divider",
    async ({ page }) => {
      /* THE DATE DISPLAY ITSELF. The board files a kickoff under its
         LOCAL day, never under the ISO date, and the heading over a band
         has to be the same day the cards under it were filed by.

         MEASURED WHERE THE TWO CANNOT AGREE BY LUCK: on a ranked row
         that kicks off after midnight UTC, so its wire date and its LA
         day are two different dates. A board reading
         `kickoff.slice(0, 10)` would file that card a day late under a
         matching heading and look perfectly consistent doing it.

         Every expectation is DERIVED — from the ISO the board was served
         and the `dayLabel` the page renders with. A typed "Friday, Sep
         18" would go quietly wrong the day `TZ` changes, which is a
         thing that has happened on this site. */
      /* RESTATED 2026-09-15. The isolation used to be a BAND made
         entirely of crossing kickoffs, found by stepping the window
         until one was drawn. With every column on the track the bands
         are the union over all eight, and this payload has no band whose
         every fixture crosses — the premise evaporated, and a guard
         whose premise has evaporated must be re-derived rather than left
         to pass for the wrong reason.

         SO THE ISOLATION MOVED TO THE ROW, which is where it was always
         strongest. A crossing row's card is required to sit under its
         LOCAL day; a board reading `kickoff.slice(0, 10)` would file it
         under the WIRE's date, which is a different band, and the
         placement assertion below catches that directly rather than
         inferring it from a heading. The heading is then required to be
         the LOCAL day's label and NOT the wire date's — two different
         dates for this row — so the "could have been copied from a
         same-day kickoff" loophole is closed on the row rather than on
         the band. */
      const crossingRow = BOARD_EIGHT.rows.find((r) =>
        COLUMNS.includes(r.column)
        && localDayOf(r.kickoff) !== r.kickoff.slice(0, 10));

      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);
      expect(crossingRow, "BOARD_EIGHT no longer holds a ranked row whose "
        + "wire date differs from its LA day — this guard has nothing to "
        + "measure and must not be read as green").toBeTruthy();
      const state = await settledBoard(page);
      const row = crossingRow!;
      const day = localDayOf(row.kickoff);
      const label = dayLabel(row.kickoff);

      // the card sits under the LOCAL day, not under the wire's date
      await expect(trackIn(page, row.column, day)
        .locator(`[data-testid="picker-row"][data-event="${row.event_id}"]`))
        .toHaveCount(1);
      expect(day).not.toBe(row.kickoff.slice(0, 10));

      // EVERY band on the rail reads its own day, in the board's own
      // words — weekday, short month, numeric day
      const drawn = bandsOf(state.cols);
      expect(state.bands.length).toBeGreaterThan(0);
      for (const b of state.bands) {
        const fs = drawn.get(b.day);
        expect(fs, `the rail carries ${b.day}, which no column on the track `
          + `(${state.cols.join(", ")}) plays anything on`).toBeTruthy();
        expect(b.label, `the band over ${b.day}`)
          .toBe(dayLabel(fs![0].kickoff!));
        expect(b.label).toMatch(/^[A-Z][a-z]+, [A-Z][a-z]{2} \d{1,2}$/);
      }

      // …and the band this crossing row sits under says its LOCAL day
      // rather than the wire's, which for this row are two different
      // dates: a `slice(0, 10)` board would agree with itself and be a
      // day out
      await expect(band(page, day).locator("span").first()).toHaveText(label);
      expect(label).not.toBe(dayLabel(`${row.kickoff.slice(0, 10)}T12:00Z`));

      // …and below xl, where the full-width rail does not exist, the
      // column's own compact divider carries the same date
      await expect(band(page, day)).toBeVisible();
      await page.setViewportSize({ width: 1024, height: 900 });
      await expect(band(page, day)).toBeHidden();
      const divider = trackIn(page, row.column, day).getByTestId("day-divider");
      await expect(divider).toBeVisible();
      await expect(divider).toHaveText(label);
    });

  test("a matchday's own sort survives the window moving, and never touches another day",
    async ({ page }) => {
      /* THE PER-DAY CONTROL, ACROSS A RE-CUT. Each band carries its own
         sort, an override on the board default, and the override is
         keyed by DAY — so it must reorder its own band in the drawn
         columns, leave the other bands alone, and still be there after
         the window rotates and the bands are cut again.

         THE NEW ORDER IS ASSERTED EXACTLY, not merely as "it changed":
         `ask` ascending is the mode's whole definition, so the ask
         prices in the payload say what the band must look like
         afterwards. And the band picked is one the page is currently
         drawing in a DIFFERENT order from that, because a mode that
         happens to agree with the default would make a passing
         assertion out of a control that does nothing. */
      const askOf = new Map<string, number>();
      for (const r of BOARD_EIGHT.rows) {
        const ask = r.kalshi?.ask_c;
        if (typeof ask === "number") askOf.set(r.event_id, ask);
      }
      /** The order `ask` ascending must produce, or null when these cards
       *  cannot say: a missing quote sorts last by a separate rule, and
       *  a tie is decided by a tiebreak this test does not model. */
      const askOrder = (events: string[]) => {
        const asks = events.map((e) => askOf.get(e));
        if (asks.some((a) => a === undefined)) return null;
        if (new Set(asks).size !== asks.length) return null;
        return [...events].sort((a, b) => askOf.get(a)! - askOf.get(b)!);
      };

      await serveEight(page);
      /* RESTATED 2026-09-15: every declared column is MOUNTED on the
         track now, and four of them are in the scrollport. `VIEW` is
         still what the scrollport holds — see `onScreen` above. */
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);

      // a window drawing two matchdays that each hold more than one card
      // in some column, so "order" means something on both
      const { state } = await windowWhere(page, (s) => {
        const m = s.tracks.filter((t) => t.cards > 1);
        return m.length > 1 && new Set(m.map((t) => t.day)).size > 1;
      }, "drew two matchdays each holding more than one card in a column");
      const multi = state.tracks.filter((t) => t.cards > 1);

      // the band to override: one `ask` would visibly move
      let target: { col: string; day: string; drawn: string[]; wanted: string[] }
        | null = null;
      for (const t of multi) {
        const drawn = await eventsIn(page, t.col, t.day);
        const wanted = askOrder(drawn);
        if (wanted && wanted.join() !== drawn.join()) {
          target = { col: t.col, day: t.day, drawn, wanted };
          break;
        }
      }
      expect(target, "no drawn matchday holds cards whose ask prices are "
        + "distinct AND in a different order from the one they are drawn in, "
        + "so picking a sort could not be told from picking nothing")
        .toBeTruthy();
      const other = multi.find((t) => t.day !== target!.day)!;
      const otherBefore = await eventsIn(page, other.col, other.day);
      expect(otherBefore.length).toBeGreaterThan(1);

      // untouched: both bands read the board default and say so
      for (const d of [target!.day, other.day]) {
        await expect(band(page, d).getByTestId("band-sort")).toHaveValue("kickoff");
        await expect(band(page, d).getByText("sort", { exact: true }))
          .toHaveCount(1);
      }

      // ONE band changes
      await band(page, target!.day).getByTestId("band-sort").selectOption("ask");

      // …its cards land in ask order, which is not the order they were in
      await expect.poll(() => eventsIn(page, target!.col, target!.day))
        .toEqual(target!.wanted);
      expect(target!.wanted).not.toEqual(target!.drawn);

      /* …and it is MARKED as carrying an override. Asserted as the new
         word present AND the default word gone: a retrying matcher will
         happily wait out a transient, so a state change is only believed
         when the state it replaced has left. */
      await expect(band(page, target!.day).getByText("this day", { exact: true }))
        .toHaveCount(1);
      await expect(band(page, target!.day).getByText("sort", { exact: true }))
        .toHaveCount(0);

      // …while the other band keeps both its order and its default
      expect(await eventsIn(page, other.col, other.day)).toEqual(otherBefore);
      await expect(band(page, other.day).getByTestId("band-sort"))
        .toHaveValue("kickoff");
      await expect(band(page, other.day).getByText("this day", { exact: true }))
        .toHaveCount(0);

      /* NOW MOVE THE WINDOW, under a live override. The bands are cut
         again: the page must survive it, every band must still have a
         fixture under it, and the override must have stayed on its own
         DAY rather than on a position in a list. */
      const lone = loneDay();
      const moved = await windowWhere(page, drawing(lone.league),
        `drew ${lone.league}`);
      expect(moved.state.cols).toContain(lone.league);
      /* RESTATED 2026-09-15: every declared column is MOUNTED on the
         track now, and four of them are in the scrollport. `VIEW` is
         still what the scrollport holds — see `onScreen` above. */
      await expect(page.locator('[data-testid="league-col"]'))
        .toHaveCount(COLUMNS.length);
      expect(moved.state.bands.map((b) => b.day)).toContain(lone.day);
      for (const b of moved.state.bands) {
        expect(moved.state.tracks.filter((t) => t.day === b.day && t.cards > 0)
          .length, `"${b.label}" survived the re-cut with nothing under it`)
          .toBeGreaterThan(0);
      }
      if (moved.state.bands.some((b) => b.day === target!.day)) {
        await expect(band(page, target!.day).getByTestId("band-sort"))
          .toHaveValue("ask");
        await expect(band(page, target!.day).getByText("this day", { exact: true }))
          .toHaveCount(1);
      }
      await expect(band(page, lone.day).getByTestId("band-sort"))
        .toHaveValue("kickoff");
      // and the board is whole — the ribbon still names all eight
      await expect(page.locator('[data-testid="ribbon-pill"]')).toHaveCount(8);
    });
});

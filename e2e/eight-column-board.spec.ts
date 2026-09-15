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

test.describe("eight columns on a four-column board", () => {
  test("draws four of eight, and every league keeps a pill", async ({ page }) => {
    await serveEight(page);
    const cols = page.locator('[data-testid="league-col"]');
    await expect(cols).toHaveCount(4);
    await expect(page.locator('[data-testid="ribbon-pill"]')).toHaveCount(8);
    const lit = page.locator('[data-testid="ribbon-pill"][aria-selected="true"]');
    await expect(lit).toHaveCount(4);
  });

  test("the header names exactly what the board draws", async ({ page }) => {
    await serveEight(page);
    const drawn = await page.locator('[data-testid="league-col"]')
      .evaluateAll((es) => es.map((e) => e.getAttribute("data-league")));
    const litNames = await page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug));
    expect(litNames.slice().sort()).toEqual(drawn.slice().sort());
  });

  test("it LOOPS — stepping past the last column reaches the first", async ({ page }) => {
    await serveEight(page);
    const lit = () => page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')
      .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug).join(","));
    const start = await lit();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(90);
    }
    // eight columns, eight steps: all the way round and back
    expect(await lit()).toBe(start);
  });

  test("a pill jumps to its league, and the board follows", async ({ page }) => {
    await serveEight(page);
    for (const slug of ["eredivisie", "ligamx", "epl"]) {
      await page.locator(`[data-testid="ribbon-pill"][data-slug="${slug}"]`).click();
      await page.waitForTimeout(150);
      const first = await page.locator('[data-testid="league-col"]').first()
        .getAttribute("data-league");
      expect(first).toBe(slug);
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
 *  Serie A plays still produced a rail entry — and with Serie A outside
 *  the drawn four, a date announcing four rest days and nothing else.
 *  The rail is a promise that the columns beneath it have something at
 *  that date; over an undrawn league it is a promise about a column the
 *  reader cannot see.
 *
 *  These five pin the property from both sides: no band without a
 *  fixture under it, and — the half that keeps the first one honest —
 *  the band DOES appear the moment the window reaches the league that
 *  plays it. */

/** The declared column order, which is what the window rotates through:
 *  `boardColumns` puts the four original leagues first and leaves the
 *  rest in declaration order. Derived, not typed, so a reordering of
 *  either list moves these guards with it. */
const COLUMNS = boardColumns(Object.keys(BOARD_EIGHT.leagues));
const VIEW = 4;

/** Every dated thing the board was handed, rows and refusals alike — a
 *  refusal is a fixture too and lands in a band like any other. */
type Dated = { league: string; column?: string | null; kickoff?: string | null };
const FIXTURES: readonly Dated[] = [...BOARD_EIGHT.rows, ...BOARD_EIGHT.refusals];

/** WHICH LEAGUES PLAY EACH LA DAY, off the payload itself. */
function leaguesByDay() {
  const by = new Map<string, Set<string>>();
  for (const f of FIXTURES) {
    const k = f.kickoff ? localDayOf(f.kickoff) : "";
    if (!k) continue;
    const s = by.get(k) ?? new Set<string>();
    s.add(f.column ?? f.league);
    by.set(k, s);
  }
  return by;
}

/** THE DAY ONE LEAGUE OWNS, and that league outside the opening window.
 *
 *  DERIVED FROM THE FIXTURE, never typed as a date. A hardcoded
 *  "2026-09-17" would keep this file green through a fixture edit that
 *  removed the very row the guard turns on — the absence would still
 *  hold, for the wrong reason. It throws instead: a guard whose premise
 *  has evaporated must say so, not pass. */
function loneDayOutsideTheWindow() {
  const opening = COLUMNS.slice(0, VIEW);
  const days = [...leaguesByDay()].sort(([a], [b]) => a.localeCompare(b));
  for (const [day, leagues] of days) {
    if (leagues.size !== 1) continue;
    const only = [...leagues][0];
    if (!opening.includes(only)) return { day, league: only };
  }
  throw new Error(
    "BOARD_EIGHT no longer contains a day played by exactly one league "
    + `outside the opening window ${opening.join(", ")} — the band-window `
    + "guards below have nothing to measure and must not be read as green");
}

interface BoardState {
  cols: string[];
  bands: { day: string; label: string }[];
  tracks: { col: string; day: string; cards: number }[];
  rests: { col: string; day: string }[];
}

const readBoard = (page: Page): Promise<BoardState> => page.evaluate(() => {
  const colOf = (e: Element) => e.closest('[data-testid="league-col"]')
    ?.getAttribute("data-league") ?? "";
  const all = (sel: string) => [...document.querySelectorAll(sel)];
  return {
    cols: all('[data-testid="league-col"]')
      .map((e) => e.getAttribute("data-league") ?? ""),
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
 *  set-equality taken there is a fiction. `expect.poll` is no cure —
 *  it retries until the assertion passes, which is exactly how a
 *  momentary state gets certified. So the board is read twice and the
 *  reads must agree before anything is asserted about them. */
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

/** ArrowRight, then a settled read. Focus is put on the document first:
 *  the page ignores arrow keys whose target is a form control, so a test
 *  that has just touched a `band-sort` select would otherwise step
 *  nothing and silently change the select instead. */
async function stepRight(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("ArrowRight");
  return settledBoard(page);
}

/** Step until `slug` is drawn, BOUNDED by the number of columns and loud
 *  when it never arrives: an unbounded "wait until" on a window that
 *  wraps is a test that hangs for its whole timeout and reports a
 *  deadline instead of the defect. */
async function stepUntilDrawn(page: Page, slug: string) {
  let state = await settledBoard(page);
  for (let i = 0; i <= COLUMNS.length; i++) {
    if (state.cols.includes(slug)) return { state, steps: i };
    state = await stepRight(page);
  }
  throw new Error(`${COLUMNS.length} steps of the window never drew ${slug} `
    + `— last drawn: ${state.cols.join(", ")}`);
}

const band = (page: Page, day: string) =>
  page.locator(`[data-testid="day-band"][data-day="${day}"]`);
const trackIn = (page: Page, col: string, day: string) =>
  page.locator(`[data-testid="league-col"][data-league="${col}"] `
    + `[data-testid="day-track"][data-day="${day}"]`);
const eventsIn = (page: Page, col: string, day: string) =>
  trackIn(page, col, day).locator('[data-testid="picker-row"]')
    .evaluateAll((es) => es.map((e) => e.getAttribute("data-event")));

test.describe("the date rail keeps the window's promise", () => {
  test("every band on the rail is a day one of the FOUR drawn columns plays",
    async ({ page }) => {
      /* THE DEFECT ITSELF. A rail entry whose every drawn column shows a
         rest-day box is a date announcing that nothing on screen happens
         — which is what eight leagues on a four-wide board produced at
         every window position where a league's private matchday sat
         outside the four. Checked at ALL eight positions, because the
         bands re-cut on every step and only some of the eight are
         wrong. */
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);
      const seen = new Set<string>();
      for (let i = 0; i < COLUMNS.length; i++) {
        const s = i === 0 ? await settledBoard(page) : await stepRight(page);
        const where = `window on ${s.cols.join(", ")}`;
        // NON-VACUOUS: a board drawing no bands at all would satisfy
        // every claim below without meaning any of them.
        expect(s.bands.length, `${where}: no bands drawn at all`)
          .toBeGreaterThan(0);
        for (const b of s.bands) {
          seen.add(b.day);
          const carrying = s.tracks.filter((t) => t.day === b.day && t.cards > 0);
          const resting = s.rests.filter((r) => r.day === b.day).map((r) => r.col);
          expect(carrying.map((t) => t.col),
            `${where}: "${b.label}" heads a full-width band, but no drawn `
            + `column has a fixture under it — ${resting.join(", ")} all show `
            + "a rest day")
            .not.toEqual([]);
        }
      }
      // and the eight positions between them showed every date the
      // payload carries, so the sweep above was not four narrow looks
      expect([...seen].sort()).toEqual([...leaguesByDay().keys()].sort());
    });

  test("a day only an UNDRAWN league plays draws no band — and draws one the moment it is drawn",
    async ({ page }) => {
      /* THE NON-VACUITY HALF. The guard above is an absence, and an
         absence passes for free on a board that never draws the thing.
         So the same date is followed across the window: missing while
         its league is out of view, present — with its own label, over
         its own fixture — the moment the window reaches it. */
      const lone = loneDayOutsideTheWindow();
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);

      // …absent, and absent because the league is genuinely undrawn
      // rather than because nothing is drawn at all
      const opening = await settledBoard(page);
      expect(opening.cols).not.toContain(lone.league);
      expect(opening.bands.map((b) => b.day),
        `${lone.day} is played only by ${lone.league}, which is not drawn`)
        .not.toContain(lone.day);
      await expect(band(page, lone.day)).toHaveCount(0);
      expect(opening.bands.length).toBeGreaterThan(0);

      // …and present once the window reaches that league
      const { state, steps } = await stepUntilDrawn(page, lone.league);
      expect(steps, `${lone.league} should be reachable inside one lap`)
        .toBeLessThanOrEqual(COLUMNS.length);
      expect(state.cols).toContain(lone.league);
      await expect(band(page, lone.day)).toHaveCount(1);
      const row = FIXTURES.find((f) => f.kickoff && localDayOf(f.kickoff) === lone.day)!;
      await expect(band(page, lone.day).locator("span").first())
        .toHaveText(dayLabel(row.kickoff!));
      // over a real fixture in that league's own column, not an empty rail
      await expect(trackIn(page, lone.league, lone.day)
        .locator('[data-testid="picker-row"],[data-testid="picker-refusal"]'))
        .not.toHaveCount(0);
    });

  test("the rail and the tracks agree — no date over nothing, no fixture under no date",
    async ({ page }) => {
      /* BOTH DIRECTIONS, at every window position. A track with no rail
         entry is a fixture nobody dated; a rail entry with no track is
         the empty band. They are one property read from two ends, and
         the second is the one the fix was for. */
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);
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

  /** The fixtures the opening window draws, grouped by the LA day the
   *  board files them under. */
  function openingBands() {
    const opening = COLUMNS.slice(0, VIEW);
    const by = new Map<string, Dated[]>();
    for (const f of FIXTURES) {
      if (!f.kickoff || !opening.includes(f.column ?? f.league)) continue;
      by.set(localDayOf(f.kickoff), [...(by.get(localDayOf(f.kickoff)) ?? []), f]);
    }
    return by;
  }

  test("a band's date is the fixture's OWN LA day, on the rail and on the compact divider",
    async ({ page }) => {
      /* THE DATE DISPLAY ITSELF. The board files a kickoff under its
         LOCAL day, never under the ISO date, and the label over the band
         has to be the same day the card underneath it was filed by.
         Every expectation here is DERIVED from the ISO the board was
         served, through the same `dayLabel` the page renders with: a
         typed "Friday, Sep 18" would go quietly wrong the day `TZ`
         changes, which is a thing that has happened on this site.

         TWO FIXTURES CARRY IT, both chosen because the wire date and the
         LA day DISAGREE — a board reading `kickoff.slice(0, 10)` would
         file them a day late under a matching heading and look perfectly
         consistent while doing it. */
      const bands = openingBands();

      /* (1) THE BAND WHOSE EVERY DRAWN FIXTURE CROSSES MIDNIGHT UTC. Its
         heading cannot have been copied from a same-day kickoff, because
         it has none: the only date it could be written from is the local
         one. */
      const crossing = [...bands].find(([day, fs]) =>
        fs.every((f) => f.kickoff!.slice(0, 10) !== day));
      expect(crossing, "no band the opening window draws is made ENTIRELY of "
        + "kickoffs whose wire date differs from their LA day, so this guard "
        + "cannot tell one from the other").toBeTruthy();
      const [crossDay, crossFixtures] = crossing!;
      const crossLabel = dayLabel(crossFixtures[0].kickoff!);

      /* (2) A CARD ADDRESSABLE BY EVENT, to pin the PLACEMENT as well as
         the wording: the MLS fixture that kicks off at 00:30Z, which is
         Saturday evening in LA and Sunday on the wire. */
      const row = BOARD_EIGHT.rows.find((r) => r.column === "mls"
        && localDayOf(r.kickoff) !== r.kickoff.slice(0, 10))!;
      expect(row, "no MLS fixture in BOARD_EIGHT crosses midnight UTC")
        .toBeTruthy();
      const day = localDayOf(row.kickoff);
      const label = dayLabel(row.kickoff);

      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);

      // the card sits under the LOCAL day, not under the wire's date
      await expect(trackIn(page, "mls", day)
        .locator(`[data-testid="picker-row"][data-event="${row.event_id}"]`))
        .toHaveCount(1);
      expect(day).not.toBe(row.kickoff.slice(0, 10));

      // EVERY band on the rail reads its own day, in the board's own
      // words — weekday, short month, numeric day
      const rail = await settledBoard(page);
      expect(rail.bands.length).toBeGreaterThan(0);
      for (const b of rail.bands) {
        const fs = bands.get(b.day);
        expect(fs, `the rail carries ${b.day}, which the opening window `
          + "plays nothing on").toBeTruthy();
        expect(b.label, `the band over ${b.day}`)
          .toBe(dayLabel(fs![0].kickoff!));
        expect(b.label).toMatch(/^[A-Z][a-z]+, [A-Z][a-z]{2} \d{1,2}$/);
      }

      // …and the all-crossing band says the LOCAL day rather than the
      // wire's, which for that band are two different dates
      await expect(band(page, crossDay).locator("span").first())
        .toHaveText(crossLabel);
      expect(crossLabel)
        .not.toBe(dayLabel(`${crossFixtures[0].kickoff!.slice(0, 10)}T12:00Z`));

      // …and below xl, where the full-width rail does not exist, the
      // column's own compact divider carries the same date
      await expect(band(page, day)).toBeVisible();
      await page.setViewportSize({ width: 1024, height: 900 });
      await expect(band(page, day)).toBeHidden();
      const divider = trackIn(page, "mls", day).getByTestId("day-divider");
      await expect(divider).toBeVisible();
      await expect(divider).toHaveText(label);
    });


  test("a matchday's own sort survives the window moving, and never touches another day",
    async ({ page }) => {
      /* THE PER-DAY CONTROL, ACROSS A RE-CUT. Each band carries its own
         sort, an override on the board default, and the override is
         keyed by DAY — so it must reorder its own band in every drawn
         column, leave the other bands alone, and still be there after
         the window rotates and the bands are cut again. */
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);

      // two bands, each with a drawn column holding more than one card,
      // so "order" means something on both
      const opening = await settledBoard(page);
      const multi = opening.tracks.filter((t) => t.cards > 1);
      expect(multi.length, "no drawn column holds two cards on one day, so "
        + "no reordering could be observed").toBeGreaterThan(1);
      const [target, other] = [multi[0], multi.find((t) => t.day !== multi[0].day)!];
      expect(other, "every multi-card track is on the same day, so this "
        + "guard cannot tell a per-day sort from a board-wide one").toBeTruthy();

      const targetBefore = await eventsIn(page, target.col, target.day);
      const otherBefore = await eventsIn(page, other.col, other.day);
      expect(targetBefore.length).toBeGreaterThan(1);
      expect(otherBefore.length).toBeGreaterThan(1);

      // untouched: both bands read the board default and say so
      for (const d of [target.day, other.day]) {
        await expect(band(page, d).getByTestId("band-sort")).toHaveValue("kickoff");
        await expect(band(page, d).getByText("sort", { exact: true })).toHaveCount(1);
      }

      // ONE band changes
      await band(page, target.day).getByTestId("band-sort").selectOption("ask");

      // …its cards reorder…
      await expect.poll(() => eventsIn(page, target.col, target.day))
        .not.toEqual(targetBefore);
      expect((await eventsIn(page, target.col, target.day)).slice().sort())
        .toEqual(targetBefore.slice().sort());

      /* …and it is MARKED as carrying an override. Asserted as the new
         word present AND the default word gone: `toHaveAttribute`-style
         retries will happily wait out a transient, so a state change is
         only believed when the state it replaced has left. */
      await expect(band(page, target.day).getByText("this day", { exact: true }))
        .toHaveCount(1);
      await expect(band(page, target.day).getByText("sort", { exact: true }))
        .toHaveCount(0);

      // …while the other band keeps both its order and its default
      expect(await eventsIn(page, other.col, other.day)).toEqual(otherBefore);
      await expect(band(page, other.day).getByTestId("band-sort"))
        .toHaveValue("kickoff");
      await expect(band(page, other.day).getByText("this day", { exact: true }))
        .toHaveCount(0);

      // NOW MOVE THE WINDOW. The bands are re-cut under a live override:
      // the page must survive it, the override must still be on its own
      // day, and the rail must still name only days that are played.
      const lone = loneDayOutsideTheWindow();
      const { state } = await stepUntilDrawn(page, lone.league);
      expect(state.cols).toContain(lone.league);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);
      // the bands genuinely re-cut — a date that was not on the rail is
      // on it now
      expect(state.bands.map((b) => b.day)).toContain(lone.day);
      expect(opening.bands.map((b) => b.day)).not.toContain(lone.day);
      // …every band still has a fixture under it…
      for (const b of state.bands) {
        expect(state.tracks.filter((t) => t.day === b.day && t.cards > 0)
          .length, `"${b.label}" survived the re-cut with nothing under it`)
          .toBeGreaterThan(0);
      }
      // …and the override travelled with its day, not with a position
      if (state.bands.some((b) => b.day === target.day)) {
        await expect(band(page, target.day).getByTestId("band-sort"))
          .toHaveValue("ask");
        await expect(band(page, target.day).getByText("this day", { exact: true }))
          .toHaveCount(1);
      }
      await expect(band(page, lone.day).getByTestId("band-sort"))
        .toHaveValue("kickoff");
      // no console crash took the board with it
      await expect(page.locator('[data-testid="ribbon-pill"]')).toHaveCount(8);
    });
});

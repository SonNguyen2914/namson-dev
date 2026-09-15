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
    + `four tried were ${state.cols.join(", ")}`);
}

const drawing = (slug: string) => (s: BoardState) => s.cols.includes(slug);

const band = (page: Page, day: string) =>
  page.locator(`[data-testid="day-band"][data-day="${day}"]`);
const trackIn = (page: Page, col: string, day: string) =>
  page.locator(`[data-testid="league-col"][data-league="${col}"] `
    + `[data-testid="day-track"][data-day="${day}"]`);
const eventsIn = (page: Page, col: string, day: string) =>
  trackIn(page, col, day).locator('[data-testid="picker-row"]')
    .evaluateAll((es) => es.map((e) => e.getAttribute("data-event") ?? ""));

test.describe("the date rail keeps the window's promise", () => {
  test("every band on the rail is a day one of the FOUR drawn columns plays",
    async ({ page }) => {
      /* THE DEFECT ITSELF. A rail entry whose every drawn column shows a
         rest-day box is a date announcing that nothing on screen
         happens. Checked at ALL eight positions, because the bands
         re-cut on every step and only some positions are wrong. */
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
      // payload carries, so the sweep above was not eight narrow looks
      expect([...seen].sort()).toEqual([...bandsOf(COLUMNS).keys()].sort());
    });

  test("a day only an UNDRAWN league plays draws no band — and draws one the moment it is drawn",
    async ({ page }) => {
      /* THE NON-VACUITY HALF. The guard above is an absence, and an
         absence passes for free on a board that never draws the thing.
         So one date is followed around the window: missing while the one
         league that plays it is out of view, present — with its own
         label, over its own fixture — as soon as the window reaches it.
         Which way round that is depends on where the league sits in the
         operator's order, so both positions are searched for rather than
         assumed. */
      const lone = loneDay();
      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);

      // …absent, and absent because that league is genuinely undrawn
      // rather than because nothing is drawn at all
      const away = await windowWhere(page, (s) => !s.cols.includes(lone.league),
        `left ${lone.league} undrawn`);
      expect(away.state.cols).not.toContain(lone.league);
      expect(away.state.bands.length).toBeGreaterThan(0);
      expect(away.state.bands.map((b) => b.day),
        `${lone.day} is played only by ${lone.league}, which is not drawn`)
        .not.toContain(lone.day);
      await expect(band(page, lone.day)).toHaveCount(0);

      // …and present once the window reaches it
      const home = await windowWhere(page, drawing(lone.league),
        `drew ${lone.league}`);
      expect(home.state.cols).toContain(lone.league);
      await expect(band(page, lone.day)).toHaveCount(1);
      await expect(band(page, lone.day).locator("span").first())
        .toHaveText(dayLabel(lone.fixtures[0].kickoff!));
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
         the second end is the one the fix was for. */
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

  test("a band's date is the fixture's OWN LA day, on the rail and on the compact divider",
    async ({ page }) => {
      /* THE DATE DISPLAY ITSELF. The board files a kickoff under its
         LOCAL day, never under the ISO date, and the heading over a band
         has to be the same day the cards under it were filed by.

         MEASURED WHERE THE TWO CANNOT AGREE BY LUCK: the window is
         stepped to a position drawing a band whose every fixture kicks
         off after midnight UTC, so its heading has no same-day kickoff
         it could have been copied from. A board reading
         `kickoff.slice(0, 10)` would file that band a day late under a
         matching heading and look perfectly consistent doing it.

         Every expectation is DERIVED — from the ISO the board was served
         and the `dayLabel` the page renders with. A typed "Friday, Sep
         18" would go quietly wrong the day `TZ` changes, which is a
         thing that has happened on this site. */
      const crossingBand = (s: BoardState) => {
        for (const [day, fs] of bandsOf(s.cols)) {
          if (!s.bands.some((b) => b.day === day)) continue;
          if (fs.every((f) => f.kickoff!.slice(0, 10) !== day)) return { day, fs };
        }
        return null;
      };
      // a ROW (not a refusal) that crosses, so the card is addressable
      // by event and the PLACEMENT can be pinned as well as the wording
      const crossingRow = (s: BoardState) => BOARD_EIGHT.rows.find((r) =>
        s.cols.includes(r.column) && localDayOf(r.kickoff) !== r.kickoff.slice(0, 10));

      await serveEight(page);
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);
      const { state } = await windowWhere(page,
        (s) => Boolean(crossingBand(s)) && Boolean(crossingRow(s)),
        "drew a band made ENTIRELY of kickoffs whose wire date differs from "
        + "their LA day, alongside a ranked row that crosses too");
      const cross = crossingBand(state)!;
      const row = crossingRow(state)!;
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
        expect(fs, `the rail carries ${b.day}, which the drawn columns `
          + `(${state.cols.join(", ")}) play nothing on`).toBeTruthy();
        expect(b.label, `the band over ${b.day}`)
          .toBe(dayLabel(fs![0].kickoff!));
        expect(b.label).toMatch(/^[A-Z][a-z]+, [A-Z][a-z]{2} \d{1,2}$/);
      }

      // …and the all-crossing band says the LOCAL day rather than the
      // wire's, which for that band are two different dates
      const crossLabel = dayLabel(cross.fs[0].kickoff!);
      await expect(band(page, cross.day).locator("span").first())
        .toHaveText(crossLabel);
      expect(crossLabel)
        .not.toBe(dayLabel(`${cross.fs[0].kickoff!.slice(0, 10)}T12:00Z`));

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
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);

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
      await expect(page.locator('[data-testid="league-col"]')).toHaveCount(VIEW);
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

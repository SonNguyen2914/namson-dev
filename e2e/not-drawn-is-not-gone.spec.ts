/** THE OPERATOR CHOOSES WHICH COLUMNS THE BOARD DRAWS — AND EVERYTHING
 *  HE DOES NOT CHOOSE IS STILL THERE.
 *
 *  The ribbon made all eight leagues REACHABLE and none of them
 *  CHOOSABLE: the four in front of you were whichever four the declared
 *  order parked in the window. `ColumnChooser` answers "show me these
 *  four together", and these guards pin the four ways that can go wrong.
 *
 *  1. THE LOOP. `useBoardLoop` looks every slug it is handed up in the
 *     track's DOM and returns — binding nothing, reporting nothing — if
 *     one is missing. An earlier attempt at this feature narrowed the
 *     track while the loop still read the whole declaration, so the
 *     guard fired on every press and took the rotation, the letter
 *     reveal and the header rail with it. SILENTLY: the board looked
 *     like a board. The witness here is the pill TEXT, because the loop
 *     is the only thing that writes it — React renders empty slots on
 *     purpose — so a bailed loop is a ribbon of blank boxes and nothing
 *     else on the page says so.
 *
 *  2. THE ORDER. The chooser may FILTER the operator's declared order
 *     and may never reorder it or add to it. Pressed in reverse, the
 *     board must still come out in the order he declared.
 *
 *  3. NOT DRAWN IS NOT GONE. A league he is not drawing is named while
 *     the panel is shut, counted when it is open, and one press from
 *     coming back — and its count is words, never a `0`.
 *
 *  4. THE WAY BACK. Narrowing to four stops the track scrolling, which
 *     takes the ribbon away. If the chooser lived with the ribbon it
 *     would go too, and the reader would be locked into the selection
 *     they had just made.
 *
 *  Hermetic: the board is mocked through `serveEight`. A real GET of
 *  /api/picker/board is a board ASSEMBLY, which freezes a permanent
 *  pre-kickoff snapshot row for every fixture on it and has no delete
 *  path (e2e/board-holdout.mjs).
 */
import { devices, expect, test, type Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT, serveEight } from "./eight-columns";
import { boardColumns, leagueLabel } from "../src/lib/pickerApi";
import { auditFloor } from "./the-touch-floor";

/** The declaration, through the one door that orders it. */
const COLUMNS = boardColumns(Object.keys(BOARD_EIGHT.leagues));
/** How many columns are readable at once — `LeagueRibbon.VIEW`, restated
 *  as the number this spec's arithmetic is written against. */
const VIEW = 4;

const chip = (page: Page, slug: string) =>
  page.locator(`[data-testid="column-chip"][data-slug="${slug}"]`);

/** The columns the track is MOUNTING, in the order it renders them —
 *  read off the track rather than off the chooser, which is the thing
 *  under test and cannot be its own witness. */
const onTrack = (page: Page) =>
  page.locator('[data-testid="league-col"]').evaluateAll(
    (els) => els.map((e) => (e as HTMLElement).dataset.league!));

/** Is `got` the cycle `want`, entered at some point? The ribbon's slots
 *  are fixed and its content rotates, so the strip's reading order is
 *  the declared one turned by however many columns the board has
 *  scrolled. */
function rotationOf(got: readonly string[], want: readonly string[]) {
  if (got.length !== want.length) return false;
  const at = got.indexOf(want[0]);
  if (at < 0) return false;
  return want.every((s, i) => got[(at + i) % got.length] === s);
}

async function openChooser(page: Page, board: unknown = BOARD_EIGHT) {
  await serveEight(page, board);
  await expect(page.locator('[data-testid="league-col"]'))
    .toHaveCount(COLUMNS.length);
  await page.getByTestId("column-chooser-summary").click();
  await expect(page.getByTestId("column-chooser-list")).toBeVisible();
}

/** Press the chooser into naming exactly `want`. ADDS BEFORE IT REMOVES,
 *  so the board is never asked to pass through the empty set on the way
 *  — the last drawn column refuses to come off, and a helper that walked
 *  into that refusal would be testing its own route rather than the
 *  control. */
async function setDrawn(page: Page, want: readonly string[]) {
  const target = new Set(want);
  for (const s of COLUMNS) {
    if (target.has(s) && await chip(page, s).getAttribute("data-drawn") === "no")
      await chip(page, s).click();
  }
  for (const s of COLUMNS) {
    if (!target.has(s) && await chip(page, s).getAttribute("data-drawn") === "yes")
      await chip(page, s).click();
  }
  await expect(page.locator('[data-testid="league-col"]'))
    .toHaveCount(want.length);
}

test.describe("the board draws the columns the operator chooses", () => {
  test("the default board is the board that shipped — every declared "
    + "column drawn, and the chooser shut over it", async ({ page }) => {
      await serveEight(page);
      const cols = await onTrack(page);
      expect(cols, "every declared column is on the track").toEqual(COLUMNS);
      await expect(page.getByTestId("column-chooser-summary"))
        .toContainText(`${COLUMNS.length} of ${COLUMNS.length} drawn`);
      /* Nothing is undrawn, so there is no roll call and no reset: a
         default board carries no control that would do nothing. */
      await expect(page.getByTestId("column-chooser-undrawn"))
        .toHaveCount(0);
      await expect(page.getByTestId("column-chooser-reset")).toHaveCount(0);
      await expect(page.getByTestId("league-ribbon")).toBeVisible();
    });

  test("choosing four draws exactly those four, side by side",
    async ({ page }) => {
      await openChooser(page);
      const want = ["epl", "laliga", "mls", "ligamx"];
      await setDrawn(page, want);
      expect(await onTrack(page)).toEqual(want);
      /* AND THEY ARE ALL ON SCREEN AT ONCE, which is the whole request.
         Four columns in a four-column scrollport have nothing to scroll
         to, so the track stops overflowing — the same four-column board
         this page has always known how to draw. */
      const t = await page.getByTestId("board-track").evaluate((el) => ({
        over: el.scrollWidth - el.clientWidth,
        seen: [...el.querySelectorAll<HTMLElement>('[data-testid="league-col"]')]
          .filter((c) => {
            const r = c.getBoundingClientRect();
            const b = el.getBoundingClientRect();
            return r.left >= b.left - 4 && r.right <= b.right + 4;
          }).length,
      }));
      expect(t.seen, "all four are in the scrollport together").toBe(VIEW);
      expect(t.over).toBeLessThanOrEqual(4);
    });

  test("THE ORDER IS THE OPERATOR'S: pressed in reverse, the board still "
    + "comes out in the order he declared", async ({ page }) => {
      await openChooser(page);
      /* Down to one, then back up in REVERSE declared order. If the
         control appended presses — or sorted by anything of its own —
         this is where it would show. */
      await setDrawn(page, ["ligamx"]);
      for (const s of ["mls", "laliga", "epl"]) await chip(page, s).click();
      const cols = await onTrack(page);
      expect(cols, "filtered out of the declaration, never re-sorted")
        .toEqual(["epl", "laliga", "mls", "ligamx"]);
      /* And the declaration itself is untouched: every league is still
         offered, so nothing here has taken a competition off the board. */
      await expect(page.getByTestId("column-chip"))
        .toHaveCount(COLUMNS.length);
    });

  test("THE LOOP SURVIVES A NARROWED TRACK — the ribbon still names its "
    + "leagues and the board still moves", async ({ page }) => {
      await openChooser(page);
      /* SIX, not four: still more columns than the window draws, so the
         board is still a scroller and the loop still has work to do.
         This is the case the old branch broke. */
      const want = ["epl", "laliga", "bundesliga", "seriea", "mls", "ligamx"];
      await setDrawn(page, want);
      await expect(page.getByTestId("league-ribbon")).toBeVisible();

      const pills = page.locator('[data-testid="ribbon-pill"]');
      await expect(pills, "one pill per drawn column").toHaveCount(want.length);
      /* THE WITNESS. Pill text is written by `useBoardLoop` and by
         nothing else, so a loop that bailed leaves every one of these
         empty while the page around it looks entirely healthy. */
      await expect
        .poll(async () => (await page.locator('[data-testid="ribbon-pill"] '
          + '[data-testid="ribbon-name"]').allInnerTexts())
          .filter((t) => t.trim() !== "").length,
          { message: "the loop filled every pill" })
        .toBe(want.length);
      const named = await pills.evaluateAll(
        (els) => els.map((e) => (e as HTMLElement).dataset.slug!));
      expect([...named].sort(),
        "it named the drawn columns and nothing else — no slug invented, "
        + "none lost").toEqual([...want].sort());
      /* A ROTATION OF THE DRAWN ORDER, not the order itself: the strip's
         SLOTS hold still and their names travel through them, so where
         the sequence starts is the board's scroll position. What must
         not change is the cycle — the league that follows the EPL is the
         league that follows it on the track, wherever the strip is
         resting. */
      expect(rotationOf(named, want),
        `${named.join(",")} is the drawn order, read from somewhere in it`)
        .toBe(true);

      /* THE HEADER RAIL IS BUILT ON THE LOOP'S OWN MEASUREMENT, so it is
         a second, independent witness that the loop is running. */
      await expect(page.getByTestId("board-head-rail")).toBeVisible();

      /* AND THE LOOP AND THE TRACK AGREE ABOUT HOW BIG THE BOARD IS.
         This is the witness the pills cannot be, and the reason it is
         here: hand the loop the whole declaration over a narrowed track
         and its effect key never changes, so it does not re-read the
         DOM, does not hit its own missing-column guard and simply keeps
         running against the board it captured at mount. The ribbon goes
         on naming leagues and the rail goes on following — measured, all
         of it still looked healthy — while the grid is left with one
         track per DECLARED column and only the drawn ones to put in
         them. The reader scrolls the board off into two empty columns of
         nothing. */
      const geo = await page.getByTestId("board-track").evaluate((el) => {
        const box = el.getBoundingClientRect();
        const cols = [...el.querySelectorAll<HTMLElement>(
          '[data-testid="league-col"]')];
        return {
          tracks: Number(el.style.getPropertyValue("--cols")),
          seats: cols.map((c) => Number(c.style.getPropertyValue("--col")))
            .sort((a, b) => a - b),
          scrollWidth: el.scrollWidth,
          lastEdge: Math.max(...cols.map((c) =>
            c.getBoundingClientRect().right - box.left + el.scrollLeft)),
        };
      });
      expect(geo.tracks, "one grid track per column actually mounted")
        .toBe(want.length);
      expect(geo.seats, "and each column on a track of its own")
        .toEqual(want.map((_, i) => i + 1));
      expect(geo.scrollWidth - geo.lastEdge,
        "the track ends where its last column ends — there is no empty "
        + "grid beyond the board to scroll into").toBeLessThanOrEqual(4);

      /* …AND THE BOARD ACTUALLY MOVES. */
      const lead = () => page.getByTestId("board-track").evaluate((el) => {
        const b = el.getBoundingClientRect();
        return [...el.querySelectorAll<HTMLElement>('[data-testid="league-col"]')]
          .map((c) => ({ s: c.dataset.league!,
                         x: c.getBoundingClientRect().left - b.left }))
          .sort((a, z) => Math.abs(a.x) - Math.abs(z.x))[0].s;
      });
      const before = await lead();
      await page.keyboard.press("ArrowRight");
      await expect.poll(lead, { message: "a step moved the board" })
        .not.toBe(before);
    });

  test("NOT DRAWN IS NOT GONE — named while the panel is shut, counted "
    + "when it is open, one press from coming back", async ({ page }) => {
      await openChooser(page);
      const want = ["epl", "laliga", "mls", "ligamx"];
      await setDrawn(page, want);
      const off = COLUMNS.filter((s) => !want.includes(s));

      /* SHUT, and every undrawn league still named on the summary line. */
      await page.getByTestId("column-chooser-summary").click();
      await expect(page.getByTestId("column-chooser-list")).toBeHidden();
      const roll = page.getByTestId("column-chooser-undrawn");
      for (const s of off) await expect(roll).toContainText(leagueLabel(s));
      await expect(page.getByTestId("column-chooser-summary"))
        .toContainText(`${want.length} of ${COLUMNS.length} drawn`);

      /* OPEN, and each of them still carries its own fixture count. */
      await page.getByTestId("column-chooser-summary").click();
      for (const s of off) {
        const c = chip(page, s);
        await expect(c).toHaveAttribute("aria-pressed", "false");
        await expect(c).toContainText(leagueLabel(s));
        /* MISSING IS NEVER ZERO. Every chip says its count in words. */
        const said = (await c.innerText()) + " "
          + (await c.evaluate((e) => e.textContent ?? ""));
        expect(said, `${s} names its fixtures rather than wearing a digit`)
          .toMatch(/no fixtures on the board|\d+ fixtures? on the board/);
      }

      /* ONE PRESS BACK. */
      await chip(page, off[0]).click();
      expect(await onTrack(page))
        .toEqual(COLUMNS.filter((s) => want.includes(s) || s === off[0]));

      /* …and one press back to the whole declaration. */
      await page.getByTestId("column-chooser-reset").click();
      expect(await onTrack(page)).toEqual(COLUMNS);
    });

  test("THE CHOOSER OUTLIVES THE RIBBON: a board narrowed past the "
    + "scroller can still be widened again", async ({ page }) => {
      await openChooser(page);
      await setDrawn(page, ["epl", "laliga", "mls", "ligamx"]);
      /* Four columns do not scroll, so there is nothing to page through:
         RESTATED 2026-09-24 — the strip no longer goes with the loop, it
         goes STATIC (every pill lit, nothing to step to), the same strip
         a four-column board of either mode now carries. */
      await expect(page.getByTestId("ribbon-pill")).toHaveCount(4);
      await expect(page.locator('[data-testid="ribbon-pill"][aria-selected="true"]'))
        .toHaveCount(4);
      /* If the chooser had gone with it, this is where the reader would
         be stranded. */
      await expect(page.getByTestId("column-chooser")).toBeVisible();
      await page.getByTestId("column-chooser-reset").click();
      expect(await onTrack(page)).toEqual(COLUMNS);
      await expect(page.getByTestId("league-ribbon")).toBeVisible();
    });

  test("THE BOARD KEEPS A COLUMN — the last one refuses, and says so "
    + "before it is pressed", async ({ page }) => {
      await openChooser(page);
      await setDrawn(page, ["mls"]);
      const last = chip(page, "mls");
      await expect(last).toHaveAttribute("aria-disabled", "true");
      await expect(last).toContainText("cannot be taken off");
      /* `force`, because Playwright's actionability check treats
         `aria-disabled` as disabled and would refuse the press itself —
         and the press is the claim. The browser does not: unlike a
         `disabled` button this one is hit-tested and really is pressed,
         which is the whole reason it is marked this way rather than
         disabled (see ColumnChooser, and the touch-floor audit's note on
         controls that answer nothing). */
      await last.click({ force: true });
      /* A blank board looks exactly like a broken one. */
      expect(await onTrack(page)).toEqual(["mls"]);
      await expect(last).toHaveAttribute("data-drawn", "yes");
    });

  test("A SHARED HUE IS NAMED when the choice puts a designed pair side "
    + "by side — and stays quiet when it does not", async ({ page }) => {
      await openChooser(page);
      /* Four of the eight hues are deliberate REPEATS of the league
         exactly VIEW places away, which the window could never show
         alongside them. On the full board that guarantee holds, so
         nothing is flagged. */
      await expect(page.locator("[data-shares-light]")).toHaveCount(0);

      /* The EPL and Ligue 1 are one such pair — orchid is the EPL's
         violet. Drawn together they are co-visible, and the board says
         so rather than leaving the reader to meet two columns they
         cannot tell apart. */
      await setDrawn(page, ["epl", "ligue1", "mls", "ligamx"]);
      await expect(chip(page, "epl"))
        .toHaveAttribute("data-shares-light", "ligue1");
      await expect(chip(page, "ligue1"))
        .toHaveAttribute("data-shares-light", "epl");
      await expect(chip(page, "epl")).toContainText("shares its colour with");
      /* Nothing is refused: the pair is drawn, because it is what the
         operator asked for. */
      expect(await onTrack(page)).toEqual(["epl", "ligue1", "mls", "ligamx"]);
      /* And a league whose partner is not drawn is not flagged. */
      await expect(chip(page, "mls")).not.toHaveAttribute("data-shares-light");
    });

  test("a column the board holds no fixtures for says so in WORDS",
    async ({ page }) => {
      /* The recorded board has rows for all eight, so the empty case is
         made rather than waited for — an absent count is the thing this
         rule is about and it must not go untested for want of one. */
      const board = { ...BOARD_EIGHT,
        rows: BOARD_EIGHT.rows.filter((r) => r.league !== "epl") };
      await openChooser(page, board);
      const c = chip(page, "epl");
      await expect(c).toContainText("no fixtures on the board");
      const said = await c.evaluate((e) => e.textContent ?? "");
      expect(said, "never a bare 0").not.toMatch(/(^|\D)0(\D|$)/);
    });

  /** THE FLOOR, ON CONTROLS THE PAGE-WIDE AUDIT CANNOT REACH.
   *
   *  `the-floor-is-the-pointer-not-the-width` sweeps every control on
   *  the board and it is the authority — but it sweeps the page AS
   *  LOADED, and this panel is shut when the board loads. A closed
   *  `<details>` hides its contents with `content-visibility: hidden`,
   *  which that audit correctly skips: those chips are not rendered, not
   *  hit-testable and not pressable by anyone. So they would never be
   *  measured at all, and a control nobody audits is a control with no
   *  floor. This opens the panel and runs the SAME audit over it —
   *  imported, not reimplemented, so the definition of the floor stays
   *  in one place. */
  test("a thumb can work the chooser — every chip answers a press at the "
    + "floor", async ({ browser }) => {
      const ctx = await browser.newContext({
        ...devices["iPad (gen 7) landscape"], reducedMotion: "reduce" });
      const page = await ctx.newPage();
      const json = (body: unknown) => ({ status: 200,
        contentType: "application/json", body: JSON.stringify(body) });
      await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD_EIGHT)));
      await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW_EIGHT)));
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"]');

      const shut = await auditFloor(page);
      await page.getByTestId("column-chooser-summary").click();
      await expect(page.getByTestId("column-chip").first()).toBeVisible();
      const open = await auditFloor(page);

      /* NON-VACUITY. Opening the panel really did put this control's
         chips in front of the audit — without this the assertions below
         would pass over a page that never drew one. */
      expect(open.census - shut.census,
        "the chooser's chips reached the audit").toBeGreaterThanOrEqual(
          COLUMNS.length);
      /* …and they are SMALL INK with a grown hit area, which is the
         floor doing its work rather than padding inflating the chip. */
      expect(open.smallInk).toBeGreaterThan(shut.smallInk);

      expect(open.examples,
        `controls under ${open.floor}px, or that did not answer a press`)
        .toEqual([]);
      expect(open.small, "controls under the floor").toBe(0);
      expect(open.pressFail, "controls that did not answer a press").toBe(0);
      /* A ROW OF CHIPS IS EXACTLY WHERE A 44px BOX REACHES OVER ITS
         NEIGHBOUR — the press aimed at Serie A answered by Ligue 1. */
      expect(open.thefts).toEqual([]);
      expect(open.theft, "presses answered by the wrong chip").toBe(0);
      expect(open.doc, "and the page still does not scroll sideways")
        .toBeLessThanOrEqual(open.vw + 1);
      await ctx.close();
    });
});

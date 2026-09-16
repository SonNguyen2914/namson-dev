import { expect, test } from "@playwright/test";
import { COMPETITIONS, LIVE_COMPETITION_COUNT } from "./liveCompetitions";

/* A FIXTURE THAT LEFT THE BOARD IS NAMED, NEVER JUST GONE.
 *
 * 2026-09-10, the first Champions League matchday. Two ties kicked off
 * at 16:45; the board went from six cards to four; the page said
 * nothing. The operator: "live matches disappeared."
 *
 * NOTHING WAS BROKEN. The backend removed them, gave each a `code` and
 * a `why` in its own words, and counted them by code. The frontend
 * contained ZERO references to `off_board`. The whole answer was in the
 * payload and nothing read it.
 *
 * So this file asserts the sentence the codebase repeats everywhere
 * else and did not honour on its own board: absent-by-design must not
 * read as vanished.
 *
 * THE FIXTURE MOVED ON 2026-09-14, and the strip did not. Widening
 * `board.BOARD_STATES` to ("pre", "in") means a match that kicks off
 * KEEPS its card, so `kicked_off` can no longer fire on the declared
 * board and `finished` is the only departure left. The fixtures below
 * therefore lead with `finished` — the code the wire actually carries —
 * and the sentences are the backend's CURRENT ones, read off
 * `board.OFF_BOARD_CODES` rather than left as the words it emitted a
 * week ago. THIS STRIP IS NOT DEAD: it still draws finished
 * departures, and a caller that narrows `states` can still produce
 * `kicked_off`, which is why that case is kept below. The component
 * needed no edit for either change, which is the property this file
 * exists to protect — it prints whatever the payload names.
 *
 * ONE BOARD PAGE OR ALL OF THEM (2026-09-15). Every test below opened
 * `/bet-suggester/ucl` and typed `ucl` into the payload it served it.
 * The EFL Cup landed the same week with the same narrowed board at
 * `/bet-suggester/efl-cup` — the same component, the same off-board
 * strip, and not one assertion reaching it. The competition now comes
 * from the registry and the registry's LENGTH is asserted, so the page
 * that ships next is walked by this file on the day it ships rather
 * than on the day somebody notices. */

/** The backend's own sentence for each code, VERBATIM off
 *  `src/picker/board.OFF_BOARD_CODES`. Abbreviated only by truncation,
 *  never paraphrased: a fixture in the guard's own words would let the
 *  surface and the test agree while both drifted from the emitter. */
const FINISHED_WHY =
  "the provider's own status says this match is OVER. This is now the "
  + "ONLY way a fixture leaves the board, and it is the one departure "
  + "that hands the reader a surface needing no token: a finished "
  + "fixture is read on the picker REVIEW surface "
  + "(GET /api/picker/review).";

const KICKED_OFF_WHY =
  "the provider's own status says this match is UNDER WAY, and this "
  + "caller asked for a narrower window than the board's. CANNOT FIRE "
  + "ON THE BOARD ITSELF, whose `states` IS ('pre', 'in'): since "
  + "2026-09-14 an in-play match KEEPS ITS PLACE.";

const WHY_FOR: Record<string, string> = {
  finished: FINISHED_WHY, kicked_off: KICKED_OFF_WHY,
};

const off = (id: string, home: string, away: string, code = "finished",
             why = WHY_FOR[code] ?? FINISHED_WHY) => ({
  event_id: id, competition_id: id, kickoff: "2026-09-10T16:45Z",
  home, away, state: code === "finished" ? "post" : "in", code, why,
});

/** The board as this competition's own narrowed page receives it. The
 *  league key and `narrowed_to` are the registry's, never a literal:
 *  a payload keyed `ucl` handed to the EFL Cup's page is a board with
 *  no column at all, which would pass the "draws nothing" tests for
 *  entirely the wrong reason. */
const BOARD = (key: string, offBoard: unknown[] | null | undefined) => ({
  generated_at: "2026-09-10T17:36:00Z", date: "20260910", days: 7,
  leagues: { [key]: { src: "current", min_current_gp: 4, clubs: 36,
                      kind: "cup", rated_on: ["epl"], reg_time_note: null,
                      table_notes: {} } },
  rows: [], refusals: [], folded: {},
  ...(offBoard === undefined ? {} : { off_board: offBoard }),
  off_board_counts: { finished: (offBoard || []).length },
  narrowed_to: [key],
});

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b) });

type Comp = (typeof COMPETITIONS)[number];

async function open(page: import("@playwright/test").Page,
                    comp: Comp,
                    offBoard: unknown[] | null | undefined) {
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json(BOARD(comp.key, offBoard))));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json({ finished: [], refusals: [], leagues: {}, store: null })));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json({ detail: "not needed" })));
  await page.route("**/api/comp/*/fixtures**", (r) =>
    r.fulfill(json({ detail: "not this file's subject" }, 503)));
  await page.goto(comp.href);
  await expect(page.getByTestId("board-framing")).toBeVisible();
}

test("every competition page this file walks is in the registry",
  () => {
    /* THE LENGTH ASSERTION, and it is the whole mechanism: the suite
       below is generated from `COMPETITIONS`, so a competition added
       without this count moving turns this red rather than silently
       leaving its board unguarded. */
    expect(COMPETITIONS.length).toBe(LIVE_COMPETITION_COUNT);
    for (const c of COMPETITIONS) expect(c.href).toMatch(/^\/bet-suggester\//);
  });

for (const comp of COMPETITIONS) {
  test.describe(`${comp.label} (${comp.key})`, () => {
    test("two ties that LEFT the board are NAMED on the page, not silently gone",
      async ({ page }) => {
        await open(page, comp, [off("1", "Fenerbahce", "AS Roma"),
                          off("2", "PSV Eindhoven", "Shakhtar Donetsk")]);
        const strip = page.getByTestId("board-off-board");
        await expect(strip).toBeVisible();
        await expect(page.getByTestId("off-board-row")).toHaveCount(2);
        // by name, because "2 fixtures left" is not an answer to "where did
        // my match go"
        await expect(strip).toContainText("Fenerbahce");
        await expect(strip).toContainText("AS Roma");
        await expect(strip).toContainText("PSV Eindhoven");
        await expect(strip).toContainText("Shakhtar Donetsk");
      });

    test(`${comp.label}` + " · the reason is the BACKEND'S sentence, printed once per code",
      async ({ page }) => {
        /* Printed, not restated: a reason that changes upstream must not go
           on being described here in words that stopped being true. And
           once — two matches that left for the same reason share one
           finding; twice would read as two.

           RESTATED 2026-09-15. The strip was a full panel — four named
           fixtures and a six-line paragraph — standing between the reader
           and the board every time a match finished; the operator collapsed
           it to one line, with the names in a disclosure and the prose
           behind the hover `i` the cards already use. The SENTENCE has not
           moved and the once-per-code rule has not moved; what moved is
           whether it is rendered before anyone asks for it. So the count is
           taken over the strip's text rather than over its rendered ink —
           and the half that keeps that honest is asserted right after it:
           the affordance is opened and the sentence must actually arrive. A
           fact behind a door nobody can open is a fact that is gone. */
        await open(page, comp, [off("1", "Fenerbahce", "AS Roma"),
                          off("2", "PSV Eindhoven", "Shakhtar Donetsk")]);
        const strip = page.getByTestId("board-off-board");
        await expect(strip).toContainText("the picker REVIEW surface");
        expect(((await strip.textContent()) ?? "")
          .split("the picker REVIEW surface").length - 1,
          "one sentence, not one per row").toBe(1);
        await expect(strip).toHaveAttribute("data-codes", "finished");

        // …and it is REACHABLE: the panel is shut until it is asked for, and
        // says the backend's words when it is
        const panel = page.getByTestId("off-board-why-panel");
        await expect(panel).toBeHidden();
        await page.getByTestId("off-board-why").click();
        await expect(panel).toBeVisible();
        await expect(panel).toContainText("the picker REVIEW surface");
      });

    test(`${comp.label}` + " · different codes each keep their own words", async ({ page }) => {
        /* BOTH CODES ON ONE STRIP — which the DECLARED board cannot
           produce any more, and a narrowed caller can. The pairing is the
           point: two departures for two different reasons must not collapse
           into one sentence. */
        await open(page, comp, [
          off("1", "Fenerbahce", "AS Roma", "kicked_off"),
          off("2", "Lens", "Slavia Prague", "finished"),
        ]);
        const strip = page.getByTestId("board-off-board");
        await expect(strip).toContainText("KEEPS ITS PLACE");
        await expect(strip).toContainText("the picker REVIEW surface");
        await expect(strip).toHaveAttribute("data-codes", "finished,kicked_off");
      });

    test(`${comp.label}` + " · an empty list draws NOTHING — the strip is not a permanent fixture",
      async ({ page }) => {
        await open(page, comp, []);
        await expect(page.getByTestId("board-off-board")).toHaveCount(0);
      });

    test(`${comp.label}` + " · a payload with NO off_board key draws nothing either, and does not "
       + "claim nothing left", async ({ page }) => {
        /* MISSING IS NEVER ZERO. A board built before this key existed has
           no answer to the question; turning that into "nothing left the
           board" would assert a measurement off a payload that was never
           asked. Absent stays absent. */
        await open(page, comp, undefined);
        await expect(page.getByTestId("board-off-board")).toHaveCount(0);
      });

    test(`${comp.label}` + " · it is ONE LINE until it is asked for, and every departed fixture is "
       + "named behind it", async ({ page }) => {
        /* THE PROPORTION CHANGED, THE INFORMATION DID NOT (operator,
           2026-09-15). Live drew this as a large panel with four fixtures
           and a six-line paragraph, above the board; the approved draft has
           nothing there at all. A one-line disclosure is the middle: the
           COUNT and the CODES are permanently on the page, so a reader
           cannot miss that something left, and the names are one click
           away rather than one paragraph in the way.

           BOTH HALVES. Collapsed-by-default is an absence and would pass on
           a strip that rendered nothing at all, so the same test opens it
           and requires all four names to arrive. */
        await open(page, comp, [off("1", "Fenerbahce", "AS Roma"),
                          off("2", "PSV Eindhoven", "Shakhtar Donetsk"),
                          off("3", "Lens", "Slavia Prague"),
                          off("4", "Ajax", "Inter Milan")]);
        const strip = page.getByTestId("board-off-board");
        const rows = page.getByTestId("off-board-row");
        const disclosure = page.getByTestId("off-board-disclosure");

        // the line itself says how many left and why, in one row of text
        await expect(strip).toBeVisible();
        await expect(strip).toContainText("4 fixtures left the board");
        await expect(strip).toContainText("finished");
        const box = await strip.boundingBox();
        expect(box!.height, "the strip is a panel again, not a line")
          .toBeLessThan(72);

        // shut: the names are in the page but none of them is drawn
        await expect(disclosure).not.toHaveAttribute("open", /.*/);
        await expect(rows).toHaveCount(4);
        await expect(rows.first()).toBeHidden();

        // opened: every one of them is drawn, by name
        await disclosure.locator("summary").click();
        await expect(rows.first()).toBeVisible();
        for (const club of ["Fenerbahce", "AS Roma", "PSV Eindhoven",
                            "Shakhtar Donetsk", "Lens", "Slavia Prague",
                            "Ajax", "Inter Milan"]) {
          await expect(disclosure, `${club} left the board and is not named`)
            .toContainText(club);
        }
        await expect(rows).toHaveCount(4);
      });
  });
}

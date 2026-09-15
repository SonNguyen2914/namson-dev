import { expect, test } from "@playwright/test";

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
 * exists to protect — it prints whatever the payload names. */

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

const BOARD = (offBoard: unknown[] | null | undefined) => ({
  generated_at: "2026-09-10T17:36:00Z", date: "20260910", days: 7,
  leagues: { ucl: { src: "current", min_current_gp: 4, clubs: 36,
                    kind: "cup", rated_on: ["epl"], reg_time_note: null,
                    table_notes: {} } },
  rows: [], refusals: [], folded: {},
  ...(offBoard === undefined ? {} : { off_board: offBoard }),
  off_board_counts: { finished: (offBoard || []).length },
  narrowed_to: ["ucl"],
});

const json = (b: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(b) });

async function open(page: import("@playwright/test").Page,
                    offBoard: unknown[] | null | undefined) {
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json(BOARD(offBoard))));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json({ finished: [], refusals: [], leagues: {}, store: null })));
  await page.route("**/api/comp/*/ratings", (r) =>
    r.fulfill(json({ detail: "not needed" })));
  await page.goto("/bet-suggester/ucl");
  await expect(page.getByTestId("board-framing")).toBeVisible();
}

test("two ties that LEFT the board are NAMED on the page, not silently gone",
  async ({ page }) => {
    await open(page, [off("1", "Fenerbahce", "AS Roma"),
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

test("the reason is the BACKEND'S sentence, printed once per code",
  async ({ page }) => {
    /* Printed, not restated: a reason that changes upstream must not go
       on being described here in words that stopped being true. And
       once — two matches that left for the same reason share one
       finding; twice would read as two. */
    await open(page, [off("1", "Fenerbahce", "AS Roma"),
                      off("2", "PSV Eindhoven", "Shakhtar Donetsk")]);
    const strip = page.getByTestId("board-off-board");
    await expect(strip).toContainText("the picker REVIEW surface");
    expect((await strip.innerText()).split("the picker REVIEW surface")
      .length - 1, "one sentence, not one per row").toBe(1);
    await expect(strip).toHaveAttribute("data-codes", "finished");
  });

test("different codes each keep their own words", async ({ page }) => {
    /* BOTH CODES ON ONE STRIP — which the DECLARED board cannot
       produce any more, and a narrowed caller can. The pairing is the
       point: two departures for two different reasons must not collapse
       into one sentence. */
    await open(page, [
      off("1", "Fenerbahce", "AS Roma", "kicked_off"),
      off("2", "Lens", "Slavia Prague", "finished"),
    ]);
    const strip = page.getByTestId("board-off-board");
    await expect(strip).toContainText("KEEPS ITS PLACE");
    await expect(strip).toContainText("the picker REVIEW surface");
    await expect(strip).toHaveAttribute("data-codes", "finished,kicked_off");
  });

test("an empty list draws NOTHING — the strip is not a permanent fixture",
  async ({ page }) => {
    await open(page, []);
    await expect(page.getByTestId("board-off-board")).toHaveCount(0);
  });

test("a payload with NO off_board key draws nothing either, and does not "
   + "claim nothing left", async ({ page }) => {
    /* MISSING IS NEVER ZERO. A board built before this key existed has
       no answer to the question; turning that into "nothing left the
       board" would assert a measurement off a payload that was never
       asked. Absent stays absent. */
    await open(page, undefined);
    await expect(page.getByTestId("board-off-board")).toHaveCount(0);
  });

import { expect, test } from "@playwright/test";

/* A FIXTURE THAT LEFT THE BOARD IS NAMED, NEVER JUST GONE.
 *
 * 2026-09-10, the first Champions League matchday. Two ties kicked off
 * at 16:45; the board went from six cards to four; the page said
 * nothing. The operator: "live matches disappeared."
 *
 * NOTHING WAS BROKEN. The picker is a pre-kickoff surface by design —
 * every number on a card is about a match that has not started — so the
 * backend removed them, gave each a `code` and a `why` in its own
 * words, and counted them by code. The frontend contained ZERO
 * references to `off_board`. The whole answer was in the payload and
 * nothing read it.
 *
 * So this file asserts the sentence the codebase repeats everywhere
 * else and did not honour on its own board: absent-by-design must not
 * read as vanished. */

const KICKED_OFF_WHY =
  "the provider's own status says this match is UNDER WAY. The picker "
  + "is a pre-kickoff board by design — every number on it is about a "
  + "match that has not started.";

const off = (id: string, home: string, away: string, code = "kicked_off",
             why = KICKED_OFF_WHY) => ({
  event_id: id, competition_id: id, kickoff: "2026-09-10T16:45Z",
  home, away, state: "in", code, why,
});

const BOARD = (offBoard: unknown[] | null | undefined) => ({
  generated_at: "2026-09-10T17:36:00Z", date: "20260910", days: 7,
  leagues: { ucl: { src: "current", min_current_gp: 4, clubs: 36,
                    kind: "cup", rated_on: ["epl"], reg_time_note: null,
                    table_notes: {} } },
  rows: [], refusals: [], folded: {},
  ...(offBoard === undefined ? {} : { off_board: offBoard }),
  off_board_counts: { kicked_off: (offBoard || []).length },
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

test("two ties that kicked off are NAMED on the page, not silently gone",
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
    await expect(strip).toContainText("pre-kickoff board by design");
    expect((await strip.innerText()).split("pre-kickoff board by design")
      .length - 1, "one sentence, not one per row").toBe(1);
    await expect(strip).toHaveAttribute("data-codes", "kicked_off");
  });

test("different codes each keep their own words", async ({ page }) => {
    await open(page, [
      off("1", "Fenerbahce", "AS Roma"),
      off("2", "Lens", "Slavia Prague", "finished",
          "this match is over; the board ranks fixtures that have not "
          + "been played."),
    ]);
    const strip = page.getByTestId("board-off-board");
    await expect(strip).toContainText("pre-kickoff board by design");
    await expect(strip).toContainText("this match is over");
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

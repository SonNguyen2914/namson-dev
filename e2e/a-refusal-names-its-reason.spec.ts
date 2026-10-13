/** A REFUSAL NAMES ITS REASON — NEVER "[object Object]" (2026-10-13).
 *
 *  The live Cups tab, 2026-10-13: the backend answered the board's read
 *  with a 422 whose `detail` was FastAPI's validation ARRAY, and the
 *  failure card printed `${detail}`, i.e. "[object Object]". The readers
 *  now format both shapes FastAPI sends (src/lib/httpFailure.ts
 *  `detailText`): an array of {loc, msg} reads "<where>: <msg>" behind
 *  "the server refused the request (HTTP 422)"; a string reads as it is.
 *
 *  Both bodies are real: e2e/board-422-recorded.ts, recorded in process
 *  against the backend's own app. Hermetic: every read is page.route. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_422_ARRAY, BOARD_422_STRING } from "./board-422-recorded";
import { CHAMP_BOARD } from "./championships-recorded";

const body = (b: unknown, status: number) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

async function open(page: Page, mode: string, refusal: unknown) {
  await page.addInitScript((m) => {
    try { window.localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, mode);
  await page.route("**/api/picker/board**", (r) => r.fulfill(body(refusal, 422)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(body(refusal, 422)));
  await page.route("**/api/championships/**", (r) => r.fulfill(body(CHAMP_BOARD, 200)));
  await page.route("**/api/comp/**", (r) => r.fulfill(body(refusal, 422)));
  await page.goto("/bet-suggester");
}

test.describe("the board's failure card", () => {
  test("Cups tab, FastAPI's validation array: the parameter and why",
    async ({ page }) => {
      await open(page, "cups", BOARD_422_ARRAY);
      const card = page.getByTestId("board-error");
      await expect(card).toBeVisible();
      await expect(card).toContainText(
        "the server refused the request (HTTP 422) — leagues: the value is "
        + "not in a form the server accepts");
      await expect(page.locator("body")).not.toContainText("[object Object]");
      await expect(page.locator("body")).not.toContainText("object Object");
    });

  test("Leagues tab, a string detail: the backend's sentence as it is",
    async ({ page }) => {
      await open(page, "leagues", BOARD_422_STRING);
      const card = page.getByTestId("board-error");
      await expect(card).toBeVisible();
      await expect(card).toContainText("date must be YYYYMMDD (a US-Eastern day)");
      await expect(page.locator("body")).not.toContainText("[object Object]");
    });

  test("the recorded bodies are the two shapes, not one relabelled",
    () => {
      expect(Array.isArray(BOARD_422_ARRAY.detail)).toBe(true);
      expect(BOARD_422_ARRAY.detail[0].loc).toEqual(["query", "leagues"]);
      expect(typeof BOARD_422_STRING.detail).toBe("string");
    });
});

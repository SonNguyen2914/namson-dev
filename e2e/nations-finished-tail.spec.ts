/** THE NATIONAL FINISHED TAIL — the Championships board's columns render
 *  their finished matches exactly as the league columns do.
 *
 *  Until 2026-09-27 every national tail read "NOT READ — NOT ZERO: The
 *  finished-matches read did not cover UEFA Nations League…", because no
 *  finished-match read was served for a national competition. The backend
 *  now serves GET /api/championships/review off its match archive, in
 *  /api/picker/review's shape, and the page asks it on the Championships
 *  board the way it asks the club review on the Leagues board.
 *
 *  HERMETIC: both boards and the review are served by page.route from
 *  recordings (e2e/championships-recorded.ts, and the backend-generated
 *  e2e/nations-review-recorded.ts); anything unrouted reaches only the
 *  stand-in backend. */
import { test, expect, type Page } from "@playwright/test";
import { routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { NATIONS_REVIEW } from "./nations-review-recorded";

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

type Seen = { champReview: string[]; clubReview: number };

async function openChampionships(
  page: Page, review: { status: number; body: unknown } | null,
): Promise<Seen> {
  const seen: Seen = { champReview: [], clubReview: 0 };
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname === "/api/championships/review") {
      seen.champReview.push(u.search);
    }
    if (u.pathname.startsWith("/api/picker/review")) seen.clubReview += 1;
  });
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  await routeEight(page);
  await page.route("**/api/championships/board**",
    (r) => r.fulfill(json(CHAMP_BOARD)));
  if (review) {
    await page.route("**/api/championships/review**",
      (r) => r.fulfill(json(review.body, review.status)));
  }
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
  return seen;
}

const tail = (page: Page, slug: string) =>
  page.locator(`[data-testid="review-tail"][data-league="${slug}"]`);

test("the Championships board asks the national review, and not the club one",
  async ({ page }) => {
    const seen = await openChampionships(page,
      { status: 200, body: NATIONS_REVIEW });
    await expect(tail(page, "unl").getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "matches");
    expect(seen.champReview.length).toBeGreaterThan(0);
    expect(seen.champReview[0]).toMatch(/^\?back=\d+$/);
    expect(seen.clubReview).toBe(0);
  });

test("a read column counts its matches and draws them like a league column",
  async ({ page }) => {
    await openChampionships(page, { status: 200, body: NATIONS_REVIEW });
    const unl = tail(page, "unl");
    const n = NATIONS_REVIEW.leagues.unl.finished;
    await expect(unl.getByTestId("review-count"))
      .toContainText(`${n} matches`);
    // no column says it was never asked any more
    await expect(page.getByTestId("review-unasked")).toHaveCount(0);
    if (await unl.getByTestId("review-body").count() === 0) {
      await unl.getByTestId("review-toggle").click();
    }
    await expect(unl.getByTestId("review-row")).toHaveCount(n);
    // England 2-3 Spain, finalized by the archive
    await expect(unl.getByTestId("review-row").filter({ hasText: "England" })
      .getByTestId("review-score")).toContainText("2");
    // where the rows came from, in the backend's own words
    const note = unl.getByTestId("review-source-note");
    await expect(note).toHaveAttribute("data-source", "archive+espn_fallback");
    await expect(note).toHaveText(NATIONS_REVIEW.leagues.unl.source_note);
    await expect(unl.getByTestId("review-provenance"))
      .toContainText(`of ${n}: 1 captured`);
  });

test("read and none finished is a measured zero; read and failed is not",
  async ({ page }) => {
    await openChampionships(page, { status: 200, body: NATIONS_REVIEW });
    await expect(tail(page, "cnl").getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "none");
    await expect(tail(page, "cnl").getByTestId("review-count"))
      .toContainText("0 matches");
    const afcon = tail(page, "afcon");
    await expect(afcon.getByTestId("review-toggle"))
      .toHaveAttribute("data-has", "unread");
    await expect(afcon.getByTestId("review-count")).toContainText("not read");
    await expect(afcon.getByTestId("review-count")).not.toContainText("0");
  });

test("a backend without the route is a failed read, never an empty tail",
  async ({ page }) => {
    await openChampionships(page,
      { status: 404, body: { detail: "Not Found" } });
    for (const slug of ["unl", "cnl", "afcon"]) {
      const t = tail(page, slug);
      await expect(t.getByTestId("review-toggle"))
        .toHaveAttribute("data-has", "unread");
      await expect(t.getByTestId("review-count")).toContainText("not read");
    }
    await expect(page.getByTestId("review-empty")).toHaveCount(0);
  });

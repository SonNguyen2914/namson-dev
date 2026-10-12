import { test, expect } from "@playwright/test";
import { DERBY, GAP, MARKET_AT_LOCK, FINAL } from "../src/lib/landingData";
import { FALLBACK, mergeStats } from "../src/lib/siteStats";

/* THE HOME PAGE'S RECORD NUMBERS ARE READ LIVE, AND NEVER LEFT BLANK
   (landing v8, 2026-10-12).

   The four counts come from GET /api/site/stats (site-stats-v1). The
   backend can be down — Railway had no active deployment the day this
   shipped — and the page then shows the figures the approved draft
   baked from the same route: 45,500 / 11 / 98,000+ / 12,000+, under
   their own labels. These specs pin both paths, and that the baked path
   is also what a backend that answers with something that is not a
   payload gets. The hermetic stand-in answers every /api/ read with a
   named 503, so the default (unmocked) run IS the failure path. */

const figures = (page: import("@playwright/test").Page) =>
  page.getByTestId("record-figures");

async function shown(page: import("@playwright/test").Page) {
  return page.evaluate(() => [...document.querySelectorAll(
    '[data-testid="record-figures"] > div')].map((d) => ({
    key: (d as HTMLElement).dataset.figure,
    label: d.querySelector("dt")!.textContent,
    value: d.querySelector("dd")!.textContent,
  })));
}

const BAKED = [
  { key: "matches", label: "matches studied49 competitions since 2010", value: "45,500" },
  { key: "competitions", label: "competitions", value: "11" },
  { key: "markets", label: "Kalshi markets tracked", value: "98,000+" },
  { key: "tests", label: "backend test functions", value: "12,000+" },
];

test("with the backend answering 503 the record shows the baked figures", async ({ page }) => {
  // the stand-in's own answer, unmocked: this is the real failure path
  await page.goto("/");
  await expect(figures(page)).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(await shown(page)).toEqual(BAKED);
  await expect(figures(page)).toHaveAttribute("data-source", "baked");
});

for (const [name, answer] of [
  ["a gateway that never reached the backend", { status: 502, body: { error: "backend unreachable" } }],
  ["a 200 that is HTML", { status: 200, contentType: "text/html", body: "<!doctype html><title>x</title>" }],
  ["a 200 that is some other schema", { status: 200, body: { schema: "other-v1", figures: {} } }],
  ["a payload whose figures are all uncounted", { status: 200, body: { schema: "site-stats-v1", figures: {
    corpus_matches: { raw: null, display: null }, competitions: { raw: null, display: null },
    markets: { raw: null, display: null }, tests: { raw: null, display: null } } } }],
] as const) {
  test(`${name} leaves the baked figures standing`, async ({ page }) => {
    await page.route("**/api/site/stats", (r) => r.fulfill({
      status: answer.status,
      contentType: "contentType" in answer ? answer.contentType : "application/json",
      body: typeof answer.body === "string" ? answer.body : JSON.stringify(answer.body) }));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(await shown(page)).toEqual(BAKED);
    await expect(figures(page)).toHaveAttribute("data-source", "baked");
  });
}

test("a good answer replaces the figures, label and all; an uncounted one stays baked", async ({ page }) => {
  await page.route("**/api/site/stats", (r) => r.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ schema: "site-stats-v1", as_of: "2026-10-12T00:00:00+00:00", pending: ["tests"],
      figures: {
        corpus_matches: { raw: 46_010, display: "46,000+", label: "matches studied", sublabel: "50 competitions since 2010" },
        competitions: { raw: 12, display: "12", label: "competitions" },
        markets: { raw: 101_234, display: "100,000+", label: "Kalshi markets tracked" },
        tests: { raw: null, display: null, label: "backend test functions", unavailable: "counting" },
      } }) }));
  await page.goto("/");
  await expect(figures(page)).toHaveAttribute("data-source", "live");
  expect(await shown(page)).toEqual([
    { key: "matches", label: "matches studied50 competitions since 2010", value: "46,000+" },
    { key: "competitions", label: "competitions", value: "12" },
    { key: "markets", label: "Kalshi markets tracked", value: "100,000+" },
    BAKED[3], // tests: not counted yet, so its baked figure — never zero
  ]);
});

test("mergeStats refuses a figure that is not a count", () => {
  const bad = mergeStats({ schema: "site-stats-v1", figures: {
    competitions: { raw: 12, display: "twelve" },
    markets: { raw: -1, display: "1" },
    tests: { raw: 5, display: "<b>5</b>" } } });
  expect(bad.source).toBe("baked");
  expect(bad.figures).toEqual(FALLBACK.map((f) => ({ ...f })));
});

test("a zero is never shown for a figure: raw 0 or a display of 0 stays baked", () => {
  const z = mergeStats({ schema: "site-stats-v1", figures: {
    corpus_matches: { raw: 0, display: "0", label: "matches studied" },
    competitions: { raw: 11, display: "0" },
    markets: { raw: 0, display: "1,600+" },
    tests: { raw: null, display: null } } });
  expect(z.source).toBe("baked");
  expect(z.figures.map((f) => f.display)).toEqual(["45,500", "11", "98,000+", "12,000+"]);
});

/* TODAY'S PAYLOAD, AS THE ROUTE SERVED IT ON 2026-10-12 (trimmed to the
   fields the page reads): the route's own extra `matches` figure is not
   one of the page's four and is ignored; markets has dropped to a
   1,600+ floor and is shown as served; tests is not counted yet, so its
   baked figure stands under its own label. */
test("the route's real 12 Oct shape: three live, tests on its baked figure", async ({ page }) => {
  await page.route("**/api/site/stats", (r) => r.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ schema: "site-stats-v1", as_of: "2026-10-12T15:15:26+00:00", figures: {
      matches: { raw: 325, display: "325", label: "matches archived" },
      corpus_matches: { raw: 45_500, display: "45,500", label: "matches studied", sublabel: "49 competitions since 2010" },
      competitions: { raw: 11, display: "11", label: "competitions" },
      markets: { raw: 1_688, display: "1,600+", label: "Kalshi markets tracked" },
      tests: { raw: null, display: null, label: "backend test functions" },
    } }) }));
  await page.goto("/");
  await expect(figures(page)).toHaveAttribute("data-source", "live");
  expect(await shown(page)).toEqual([
    BAKED[0], BAKED[1],
    { key: "markets", label: "Kalshi markets tracked", value: "1,600+" },
    BAKED[3],
  ]);
  for (const f of await shown(page)) expect(f.value, f.key).not.toMatch(/^[0,]+\+?$/);
});

/* THE REVIEW'S SENTENCE IS TRUE OF THE DATA. "The model leaned Atlético,
   the market and the board leaned Real, and Atlético won." is typed in
   components/landing/FullTime.tsx; each clause is derived here from the
   baked series and the field, and the typed sentence must match them. */
test("the review's one sentence agrees with the baked series", async ({ page }) => {
  const lean = (t: { home: number; draw: number; away: number }) =>
    (Object.keys(t) as (keyof typeof t)[]).sort((a, b) => t[b] - t[a])[0];
  const name = { home: "Atlético", away: "Real", draw: "the draw" } as const;
  expect(lean(DERBY.lock.model)).toBe("home");        // the model leaned Atlético
  expect(lean(MARKET_AT_LOCK!.market)).toBe("away");  // the market leaned Real
  expect(GAP.net).toBeGreaterThan(0);                 // the board's gap: Real
  expect(FINAL!.home).toBeGreaterThan(FINAL!.away);   // Atlético won
  await page.goto("/");
  const text = (await page.getByTestId("why-this-match").textContent())!.replace(/\s+/g, " ");
  expect(text).toContain(`The model leaned ${name.home}, the market and the board leaned ${name.away}, and ${name.home} won.`);
});

import { expect, test } from "@playwright/test";

// A COLD LOAD IS NOT A SKELETON (2026-09-10).
//
// WHAT HAPPENED. `/bet-suggester/ucl` was seen on production rendering
// its full chrome — header, sort control, finished-window control,
// legend — over skeleton placeholders that never resolved. Thirty
// seconds in: no cards, and `performance.getEntriesByType("resource")`
// holding fifteen entries with NOT ONE of them a picker request. The
// change on the page at the time was reverted for it.
//
// 742 SPECS WERE GREEN ON THAT COMMIT, TWICE. They could not have been
// otherwise, and this file is the hole they were green through:
//
//   - EVERY spec that asserts a card on a board route installs
//     `page.route("**/api/picker/board**")` FIRST — field-on-the-card,
//     asking-is-not-declaring, picker-ucl-column, picker-prose,
//     picker-blend-cup, venue-favourite-declared. A route handler is an
//     answer, not a load: those specs prove the COMPONENT draws a
//     payload, and say nothing about whether the deployed page ever
//     asks for one.
//   - The one spec that opens these routes UNMOCKED — layout-audit —
//     measures boxes. It walks nine routes at five widths asserting no
//     sideways scroll, no text in a zero box, no covered sticky header,
//     and it records a route that would not load as `unreachable`
//     rather than failing on it. A page holding nothing but chrome and
//     four skeleton blocks satisfies every geometry it checks.
//
// So the suite had no assertion of this shape anywhere: OPEN A BOARD
// ROUTE WITH NOTHING MOCKED, TOUCH NOTHING, AND SOMETHING RENDERED.
//
// THE FIRST ASSERTION IS THE LOAD-BEARING ONE, and it is deliberately
// about the REQUEST rather than about the cards. "No cards" has two
// causes that fail in opposite directions and must never be folded: a
// board that was asked for and came back empty is a fact about the
// slate, and a board that was never asked for is a page that is not
// running. Only the second is this defect, and the request is the one
// place they are distinguishable — it is also, on a client-rendered
// board, the cheapest available proof that the bundle booted at all.
//
// WHAT IT CANNOT SEE, said here so nobody reads more into a green than
// it carries: the runner builds and serves the app itself, so a CDN
// that hands a browser one deployment's HTML and another's chunk URLs
// is out of its reach. What it does catch is every way the BUILT APP
// can stop asking — a mount effect that does not fire, a dependency
// that is never satisfied, a guard that returns early, a proxy route
// that stops forwarding, a bundle that throws before it mounts.
//
// UNMOCKED, AND THEREFORE CAREFUL ABOUT WHAT IT BLAMES. A live backend
// that refuses is not a rendering defect and this must not go red for
// one: a non-2xx answer is asserted to be NAMED on the page instead,
// which is the board's own rule ("a stale board dressed as a current
// one is worse than none") and is the same finding stated honestly.

/** The routes PickerBoard actually serves. `ask` is what the route is
 *  required to name in its own request — null for the landing board,
 *  which asks for nothing by name and must keep the request string, and
 *  the backend cache slot, it has always had. */
const BOARDS = [
  { path: "/bet-suggester", ask: null },
  { path: "/bet-suggester/ucl", ask: "ucl" },
] as const;

// board-live-read: this test's whole claim is that the BUILT app and the
// real proxy route still ask for a board on mount — a page.route mock
// would answer that request on the app's behalf and turn the assertion
// into a tautology. The read is safe because e2e/board-holdout.mjs
// refuses it before it can reach a backend and write a snapshot; what
// arrives is the hold-out's named 503, which is exactly the non-2xx case
// this file already says it must render as a NAMED refusal rather than a
// skeleton.
for (const { path, ask } of BOARDS) {
  test(`${path} asks for its board ON MOUNT and settles — nothing touched`,
    async ({ page }) => {
      // one unmocked navigation against a live backend, plus its own
      // settle; the default 45s budget is not sized for a cold read
      test.setTimeout(90_000);

      const asked: string[] = [];
      const answered: { status: number; rows: number | null;
        rowCols: string[][] | null }[] = [];
      page.on("request", (r) => {
        if (/\/api\/picker\/board/.test(r.url())) asked.push(r.url());
      });
      page.on("response", async (r) => {
        if (!/\/api\/picker\/board/.test(r.url())) return;
        let rows: number | null = null;
        let rowCols: string[][] | null = null;
        try {
          const b = await r.json();
          rows = Array.isArray(b?.rows) ? b.rows.length : null;
          /* WHICH COLUMNS THE PAYLOAD DECLARED. The board DRAWS four of
             them at a time once there are more than four (see the window
             in bet-suggester/index.tsx), so the payload's total row count
             stopped being the number of cards on screen the day an eight
             league board shipped. Counting the rows that belong to the
             DRAWN columns is the same claim — "it drew what it held" —
             measured against what it actually undertook to draw. */
          rowCols = Array.isArray(b?.rows)
            ? b.rows.map((r: Record<string, unknown>) =>
                (r.columns as string[] | undefined)
                  ?? [r.column ?? r.league] as string[])
            : null;
        } catch { /* not JSON; the status is the finding */ }
        answered.push({ status: r.status(), rows, rowCols });
      });

      await page.goto(path);

      /* ── 1. THE REQUEST WENT OUT, WITH NO HELP FROM ANYBODY ──────────
         Nothing above this line clicks, types, reloads or seeds state.
         A board that never asks is the defect this file exists for, and
         it is the one failure a card assertion reports in the same
         words as an empty slate. */
      await expect.poll(() => asked.length,
        { message: `${path} issued NO /api/picker/board request on a cold `
          + "load — the page is not asking for its own board",
          timeout: 30_000 }).toBeGreaterThan(0);

      /* ── 2. AND IT ASKED THE RIGHT QUESTION ──────────────────────────
         A narrowed route names its competition; the landing board names
         nothing, because naming one there would put it on the board. */
      for (const u of asked) {
        if (ask) expect(u).toContain(`leagues=${ask}`);
        else expect(u).not.toContain("leagues=");
      }

      // ── 3. IT ANSWERED ────────────────────────────────────────────
      await expect.poll(() => answered.length,
        { message: `${path}: the board request was issued but never `
          + "answered", timeout: 30_000 }).toBeGreaterThan(0);
      const last = answered[answered.length - 1];

      /* ── 4. THE PAGE SETTLED ONTO THAT ANSWER ────────────────────────
         Whichever answer it was. The skeletons are `role="status"`
         aria-labelled "loading" (components/chrome.SkeletonRows), so
         "still loading" is a state this can ask about by name rather
         than inferring from an absence — and "chrome over skeletons
         forever" is exactly the reading that was reverted. */
      const skeletons = page.getByRole("status", { name: "loading" });
      await expect(skeletons, `${path} is still drawing skeletons after `
        + "its board answered — the read landed and the page did not")
        .toHaveCount(0, { timeout: 30_000 });

      if (last.status !== 200) {
        /* A BACKEND THAT REFUSED IS NOT A PAGE THAT BROKE, and this
           guard says so in the page's own words rather than going red
           for something it does not measure. What it still insists on
           is that the refusal was NAMED: a failed read drawn as an
           empty board is the one outcome the board promises never to
           show. */
        await expect(page.getByTestId("board-error"),
          `${path}: the board answered ${last.status} and the page did `
          + "not name it").toBeVisible();
        return;
      }

      /* ── 5. AND IT DREW WHAT THE PAYLOAD HELD ────────────────────────
         DERIVED FROM THE ANSWER, NEVER TYPED. A hard-coded count is a
         claim about a live slate that changes every day; the payload's
         own `rows.length` is the only number that is true whenever this
         runs, and equality is what separates "drew the board" from
         "drew part of it". */
      expect(last.rows, `${path}: the board answered 200 with no rows array`)
        .not.toBeNull();
      /* THE COLUMNS THE PAGE ACTUALLY DREW, read off the page rather than
         assumed — four when the board is windowed, all of them when it is
         not, and exactly the narrowed one on a competition page. */
      const drawn = await page.getByTestId("league-col")
        .evaluateAll((es) => es.map((e) => e.getAttribute("data-league")));
      expect(drawn.length, `${path}: no column was drawn at all`)
        .toBeGreaterThan(0);
      /* ONE CARD PER ROW PER COLUMN IT RIDES IN. A folded fixture — the
         Campeones Cup is drawn in BOTH MLS and Liga MX — is one row in
         the payload and TWO cards on the board, so counting rows would
         be short by exactly the folds. */
      const owed = (last.rowCols ?? []).reduce(
        (n, cols) => n + cols.filter((c) => drawn.includes(c)).length, 0);
      await expect(page.getByTestId("picker-row"),
        `${path}: the board answered with ${last.rows} rows, ${owed} of them `
        + `in the ${drawn.length} column(s) it drew, and the page drew a `
        + "different number of cards")
        .toHaveCount(owed, { timeout: 30_000 });
      await expect(page.getByTestId("league-col").first(),
        `${path}: no column was drawn at all`).toBeAttached();
    });
}

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

for (const { path, ask } of BOARDS) {
  test(`${path} asks for its board ON MOUNT and settles — nothing touched`,
    async ({ page }) => {
      // one unmocked navigation against a live backend, plus its own
      // settle; the default 45s budget is not sized for a cold read
      test.setTimeout(90_000);

      const asked: string[] = [];
      const answered: { status: number; rows: number | null }[] = [];
      page.on("request", (r) => {
        if (/\/api\/picker\/board/.test(r.url())) asked.push(r.url());
      });
      page.on("response", async (r) => {
        if (!/\/api\/picker\/board/.test(r.url())) return;
        let rows: number | null = null;
        try {
          const b = await r.json();
          rows = Array.isArray(b?.rows) ? b.rows.length : null;
        } catch { /* not JSON; the status is the finding */ }
        answered.push({ status: r.status(), rows });
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
      await expect(page.getByTestId("picker-row"),
        `${path}: the board answered with ${last.rows} rows and the page `
        + `drew a different number of cards`)
        .toHaveCount(last.rows as number, { timeout: 30_000 });
      await expect(page.getByTestId("league-col").first(),
        `${path}: no column was drawn at all`).toBeAttached();
    });
}

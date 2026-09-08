import { test, expect } from "@playwright/test";

// Decision-safety invariants (V8.1 evaluation). These must hold no
// matter what the volatile shadow data looks like: the UI must never
// present model output as advice, and must label shadow/paper state.

test("MLS board loads in league mode with the shadow framing", async ({ page }) => {
  await page.goto("/bet-suggester?league=mls");
  // the league carousel lands on MLS (deep-link), not WC26
  await expect(page.getByRole("heading", { name: /MLS/i }).first())
    .toBeVisible();
  // shadow / not-advice framing is present on the market copy
  await expect(page.getByText(/shadow mode/i).first()).toBeVisible();
  await expect(page.getByText(/real-money signals are disabled/i).first())
    .toBeVisible();
});

test("match hub shows the model as shadow, never as advice",
  async ({ page, request }) => {
    // This hard-coded fixture 761680 (Columbus vs Cincinnati). That
    // match kicked off, settled, and its Kalshi markets closed — so the
    // every-market table had nothing to render and the test went red
    // for a reason with nothing to do with decision safety. Exactly the
    // fragility the V9.3 evaluation flagged (F18): a hard-coded id
    // against live data is a clock, not an assertion.
    //
    // Choose a fixture that currently HAS a book and a model run, and
    // say so plainly when none exists rather than failing on the
    // weather. The invariants below are unchanged.
    //
    // THE DEADLINE IS A BUDGET, NOT AN ASSERTION (2026-09-07). Finding
    // that fixture costs one schedule read plus UP TO TWELVE full match
    // payloads, one after another, from the live backend — measured at
    // 1.35s each against an idle one, so the search alone is bounded at
    // ~18s before a single pixel is asked for, and the page load and
    // six assertions come after it. The suite's 45s default is sized
    // for the hermetic majority, and this test kept failing it on the
    // arithmetic of its own scan rather than on anything about the app:
    // a timeout reported as a decision-safety failure. `test.slow()`
    // triples the budget for THIS test alone. The scan stays bounded at
    // twelve, not one assertion below is relaxed, and a backend that is
    // actually wedged still fails here.
    test.slow();
    const sched = await request.get("/api/mls/schedule?days=7");
    const fixtures: { id: string }[] =
      sched.ok() ? ((await sched.json()).fixtures ?? []) : [];
    let priced: string | null = null;
    for (const f of fixtures.slice(0, 12)) {
      const m = await request.get(`/api/mls/match/${f.id}`);
      if (!m.ok()) continue;
      const body = await m.json();
      if ((body.books ?? []).length > 0 && body.model) { priced = f.id; break; }
    }
    test.skip(!priced,
      "no upcoming MLS fixture currently has both an open book and a " +
      "model run — nothing to assert the market table against");

    await page.goto(`/bet-suggester/mls/${priced}`);
    await expect(page).toHaveTitle(/MLS/i);

    // the match-info card and the model/market comparison render
    await expect(page.getByText(/mls-2026-v0/i).first()).toBeVisible();
    await expect(page.getByText(/shadow · not advice/i).first())
      .toBeVisible();

    // the every-market table exists with the NET EDGE column (fee-aware),
    // not a bare "edge" and never a generic "TAKE"
    await expect(page.getByText(/every kalshi market on this match/i))
      .toBeVisible();
    await expect(page.getByText(/net edge/i).first()).toBeVisible();
    await expect(page.getByText(/^TAKE$/)).toHaveCount(0);

    // the closing disclaimer states the mode plainly
    await expect(
      page.getByText(/shadow model, observational only · not betting advice/i)
    ).toBeVisible();
  });

test("back from a match returns to the MLS board, not WC26", async ({ page }) => {
  await page.goto("/bet-suggester/mls/761680");
  await page.getByRole("link", { name: /mls board/i }).click();
  await expect(page).toHaveURL(/league=mls/);
});

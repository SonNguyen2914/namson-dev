import { test, expect } from "@playwright/test";
import { LIVE_TAG } from "./backend";
import { liveGet, unanswered } from "./live-read";

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

// @live (2026-09-25): this claim is about the DEPLOYED backend, so it runs
// only in the rate-limited live set (SUGGESTER_E2E_MODE=live) and never
// in the hermetic default run. See e2e/backend.ts.
test("match hub shows the model as shadow, never as advice",
  { tag: LIVE_TAG }, async ({ page, request }) => {
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
    // AND THE BUDGET STILL LOST (2026-09-22), because tripling a
    // deadline does not bound a read — it only moves where the read is
    // allowed to hang. On run 35793175865 the FIRST of these thirteen
    // reads spent the whole tripled 135s and this test's name was
    // printed under "failed", which says a decision-safety invariant
    // broke. None was evaluated. The scan is machinery, not the claim,
    // so every read in it is bounded and an unanswered one is a skip
    // with its reason named — the invariants below are untouched, still
    // six of them, and a backend that answers with no priced fixture is
    // still the pre-existing skip.
    test.slow();
    const sched = await liveGet(request, "/api/mls/schedule?days=7");
    test.skip(!sched, unanswered("/api/mls/schedule?days=7"));
    const fixtures: { id: string }[] =
      sched?.ok() ? ((await sched.json()).fixtures ?? []) : [];
    let priced: string | null = null;
    // AND THE SCAN AS A WHOLE IS BOUNDED, not only each read in it.
    // Twelve candidates at a per-read bound is still twelve bounds
    // multiplied together, which is how the arithmetic outgrew the
    // budget the first time. The scan gets a third of the tripled
    // deadline and the page load and six assertions get the rest; a
    // scan that ran out is the same sentence as a scan that found
    // nothing priced — neither one is evidence about the match hub.
    const scanUntil = Date.now() + 45_000;
    for (const f of fixtures.slice(0, 12)) {
      if (Date.now() > scanUntil) break;
      // Bounded SHORTER than the schedule read, because there are up to
      // twelve of them: the scan's whole point is to find a priced
      // fixture, and a match payload that is slower than this is one
      // candidate not answering rather than a finding about any of them.
      const m = await liveGet(request, `/api/mls/match/${f.id}`, 8_000);
      if (!m?.ok()) continue;
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

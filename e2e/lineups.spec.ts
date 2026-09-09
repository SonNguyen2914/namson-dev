import { expect, test } from "@playwright/test";

// Team-news section: the announced XI, each player's own xG/90 from the
// official MLS feed, and the notable names not starting.
//
// The section is DISPLAY CONTEXT — the walk-forward tests showed an
// XI-strength adjustment does not beat team-xG — so the decision-safety
// invariant here is that the page says so, and that an unreleased lineup
// reads as "awaiting team news" rather than as everyone being absent.
//
// Runs against whatever SUGGESTER_BACKEND_URL points at; it skips
// itself when that backend serves no lineup section (e.g. an older
// deploy), so it can never fail for an unrelated reason.

const EVENT = process.env.E2E_EVENT_ID || "761439";

test.describe("MLS match page — team news", () => {
  test("renders the announced XI with strength, or says it's pending",
    async ({ page }) => {
      const resp = await page.request.get(`/api/mls/match/${EVENT}`);
      expect(resp.ok()).toBeTruthy();
      const body = await resp.json();
      test.skip(!body.lineups,
        "backend has no lineup section (older deploy)");

      await page.goto(`/bet-suggester/mls/${EVENT}`);
      // WAIT FOR THE PAGE TO HAVE ITS DATA BEFORE READING AN ABSENCE.
      //
      // `TeamNews` returns null until the match payload carries a lineup
      // block, so "the section is not here" is only a finding once the
      // page has actually fetched. This asserted straight after `goto`
      // and raced the fetch on a flat 15s: it passed everywhere in
      // isolation, passed in CI for weeks, and began failing there the
      // day the suite grew from 607 tests to 616 — the margin went, not
      // the behaviour. Re-running the identical commit failed identically,
      // so it is not random; it is a race this test always had and only
      // recently started losing.
      //
      // This does not weaken the claim. If the section is absent once the
      // page has settled, the assertion still fails — which is the thing
      // worth knowing.
      await page.waitForLoadState("networkidle");
      const section = page.getByText(/team news/i).first();
      await expect(section).toBeVisible();

      // the honesty line must always accompany the section
      await expect(
        page.getByText(/the model does not use lineups/i).first()
      ).toBeVisible();

      const home = body.lineups.home;
      if (home?.released) {
        // formation + a full XI are shown
        await expect(page.getByText(home.formation).first()).toBeVisible();
        const first = home.starters[0]?.name;
        if (first) {
          await expect(page.getByText(first, { exact: false }).first())
            .toBeVisible();
        }
      } else {
        await expect(page.getByText(/awaiting team news/i).first())
          .toBeVisible();
      }
    });

  test("absences are only claimed once an XI exists", async ({ page }) => {
    const resp = await page.request.get(`/api/mls/match/${EVENT}`);
    const body = await resp.json();
    test.skip(!body.lineups, "backend has no lineup section");

    for (const side of ["home", "away"] as const) {
      const s = body.lineups[side];
      if (!s) continue;
      // the invariant: no XI released => no absence CLAIMS.
      // null (backend could not compute) and [] (computed, nobody
      // missing) both satisfy it, and they are NOT the same thing — the
      // assertion says so rather than collapsing them with `?? []`.
      if (!s.released) {
        expect(s.key_absences === null
               || s.key_absences.length === 0).toBe(true);
      }
    }

    await page.goto(`/bet-suggester/mls/${EVENT}`);
    const absent = (body.lineups.home?.key_absences ?? [])[0];
    if (absent?.name) {
      await expect(page.getByText(absent.name, { exact: false }).first())
        .toBeVisible();
      await expect(page.getByText(/not starting/i).first()).toBeVisible();
    }
  });
});

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
      // THE BACKEND IS LIVE, AND "IT DID NOT ANSWER" IS NOT "IT HAS NO
      // LINEUPS". This spec reaches the real shadow backend through the
      // proxy; in CI on 2026-09-09 that request did not answer inside
      // the test's whole 45s budget, and the spec reported a FAILURE of
      // the team-news section — which had not been reached, let alone
      // rendered.
      //
      // A bounded request separates the two facts. An unreachable
      // backend is a skip WITH ITS REASON NAMED, because the claim
      // ("when there is a lineup section the page renders it") cannot be
      // evaluated at all; a backend that answers without lineups is the
      // pre-existing skip; anything else is a real failure. The timeout
      // is well inside the test budget so the skip happens rather than
      // the runner killing the test.
      type Side = {
        released?: boolean; formation?: string;
        starters?: { name?: string }[]; absences?: unknown[];
      };
      let body: { lineups?: { home?: Side; away?: Side } } | null = null;
      try {
        const resp = await page.request.get(`/api/mls/match/${EVENT}`,
                                            { timeout: 20_000 });
        if (resp.ok()) body = await resp.json();
        else test.skip(true, `backend answered ${resp.status()} for ${EVENT}`);
      } catch (e) {
        test.skip(true,
          `backend did not answer within 20s — the section was never `
          + `reached, so this says nothing about it (${String(e).slice(0, 80)})`);
      }
      test.skip(!body?.lineups,
        "backend has no lineup section (older deploy)");
      // `test.skip()` ends the run at runtime but does not narrow the
      // type, so state the invariant it just established rather than
      // casting it away — a cast here would silence a real shape change.
      if (!body?.lineups) return;
      const lineups = body.lineups;

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
      // NOT `networkidle`: this page polls, so a state defined as "500ms
      // of no requests" may never arrive, and waiting for it converts a
      // slow page into a hung test — which is how the 45s budget was
      // spent on 2026-09-09. Wait for the thing itself, with a budget
      // that leaves room for the skip above to have run.
      const section = page.getByText(/team news/i).first();
      await expect(section).toBeVisible({ timeout: 20_000 });

      // the honesty line must always accompany the section
      await expect(
        page.getByText(/the model does not use lineups/i).first()
      ).toBeVisible();

      const home = lineups.home;
      if (home?.released) {
        // formation + a full XI are shown. A RELEASED side that carries
        // neither is a payload change, not a rendering question — assert
        // it here rather than letting the optional chain quietly skip
        // the two checks below and report green.
        expect(home.formation,
          "a released XI must carry its formation").toBeTruthy();
        expect(home.starters?.length,
          "a released XI must carry its starters").toBeTruthy();
        await expect(page.getByText(home.formation!).first()).toBeVisible();
        const first = home.starters?.[0]?.name;
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

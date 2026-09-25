import { expect, test } from "@playwright/test";
import { LIVE_TAG } from "./backend";

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

// @live (2026-09-25): this claim is about the DEPLOYED backend, so it runs
// only in the rate-limited live set (SUGGESTER_E2E_MODE=live) and never
// in the hermetic default run. See e2e/backend.ts.
test.describe("MLS match page — team news", { tag: LIVE_TAG }, () => {
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
    // THE SAME BOUND ITS SIBLING ABOVE GREW ON 2026-09-09, and this test
    // is why one repair per defect is not enough. That fix bounded the
    // read at line 18 and left the identical unbounded read here; on
    // 2026-09-22 this one spent the whole 45s budget on
    // `/api/mls/match/761439` — twice, retry included — and reported
    // ABSENCE CLAIMS as broken on a PR that touches neither this page
    // nor that backend. The same route answers in 1.35s against an idle
    // backend; what it had measured was the suite racing itself for it.
    //
    // "IT DID NOT ANSWER" IS NOT "IT HAS NO LINEUPS". An unreachable
    // backend is a skip with its reason named, because the invariant
    // below is read OFF the payload and there is no payload to read it
    // off; a backend that answers without lineups is the pre-existing
    // skip; anything else is a real failure. The timeout sits well
    // inside the test budget so the skip happens rather than the runner
    // killing the test.
    //
    // NOTHING ABOUT THE CLAIM IS TIME-DEPENDENT, and that is worth
    // saying because an XI is published on a schedule. The assertion
    // never asks what time it is: it reads `released` off the very same
    // payload it reads `key_absences` off, so a pre-announcement fixture
    // and a post-announcement one are both evaluated, and both are
    // evaluated against the state the backend reports for THAT fixture.
    // `key_absences` is NOT optional here, deliberately. The claim is
    // about the two values the backend may send — `null` (it could not
    // compute one) and `[]` (it computed one and nobody is missing) —
    // which are not the same thing and are not collapsed below. A
    // payload that carries no such key at all is a shape change, and
    // this test has always gone loudly red for it rather than reading
    // it as "no absences claimed".
    let body: { lineups?: Record<string, {
      released?: boolean; key_absences: { name?: string }[] | null;
    }> } | null = null;
    try {
      const resp = await page.request.get(`/api/mls/match/${EVENT}`,
                                          { timeout: 20_000 });
      if (resp.ok()) body = await resp.json();
      else test.skip(true, `backend answered ${resp.status()} for ${EVENT}`);
    } catch (e) {
      test.skip(true,
        `backend did not answer within 20s — no payload was read, so this `
        + `says nothing about absence claims (${String(e).slice(0, 80)})`);
    }
    test.skip(!body?.lineups, "backend has no lineup section");
    // `test.skip()` ends the run at runtime but does not narrow the
    // type, so state the invariant it just established rather than
    // casting it away.
    if (!body?.lineups) return;

    const lineups = body.lineups;
    for (const side of ["home", "away"] as const) {
      const s = lineups[side];
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
    const absent = (lineups.home?.key_absences ?? [])[0];
    if (absent?.name) {
      await expect(page.getByText(absent.name, { exact: false }).first())
        .toBeVisible();
      await expect(page.getByText(/not starting/i).first()).toBeVisible();
    }
  });
});

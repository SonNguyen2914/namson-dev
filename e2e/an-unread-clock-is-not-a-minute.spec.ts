import { expect, test } from "@playwright/test";

import { openManualOverride } from "./live-panel-autofill";
import {
  LIVE_SCORES, LIVE_SCORES_MINUTE_UNREAD, LIVE_SCORES_MINUTE_UNREAD_1H,
  LIVE_STATE_KEYLESS, LIVE_STATE_MINUTE_UNREAD, LIVE_STATE_MINUTE_UNREAD_1H,
} from "./live-state-recorded";

// AN UNREAD CLOCK IS NOT A MINUTE (found 2026-09-28 on the audit branch
// `audit-0928-display-labels`, fixed 2026-10-07).
//
// THE DEFECT. When the provider sends no clock, the backend's live-state
// route still sends `minutes_elapsed`: `float(None or 0.0)` run through
// `sim_minutes`, which launders it into the period floor — 45.0 under
// 2H, 0.0 under 1H. It says so, `minute_unread: true`, "disclosed rather
// than silently repaired" (backend api/main.py `fetch_live_state`).
// LivePanel.autoFill read only `minutes_elapsed != null`, so it put that
// floor into the operator's form over whatever they had set, and the
// next "Compute live read" simulated the rest of the match from a
// minute nobody observed. The file's own rule — MISSING IS NEVER ZERO,
// AND A PREDICTION RUNS ON THESE NUMBERS — broken by a number that
// arrived WITH its own disclaimer.
//
// HERMETIC: every body is the backend route's own output, run in process
// (e2e/live-state-recorded.ts).

test("2H with no clock: the operator's 63' stays, and the fill names "
   + "the minute as not carried", async ({ page }) => {
    // the wire, read first — the fold, and its disclosure beside it
    expect(LIVE_STATE_MINUTE_UNREAD.minute_unread).toBe(true);
    expect(LIVE_STATE_MINUTE_UNREAD.minutes_elapsed).toBe(45);
    expect(LIVE_STATE_MINUTE_UNREAD.status_short).toBe("2H");

    const p = await openManualOverride(
      page, LIVE_SCORES_MINUTE_UNREAD, LIVE_STATE_MINUTE_UNREAD);
    // THE OPERATOR, WATCHING: second half, 63 minutes. Set through the
    // controls, so the value under test is one a person entered.
    await p.panel.getByRole("button", { name: "2nd half", exact: true })
      .click();
    await p.minute.focus();
    for (let i = 0; i < 18; i += 1) await page.keyboard.press("ArrowRight");
    await expect(p.minute).toHaveValue("63");

    await p.fill.click();
    await expect(p.msg).toContainText(/^Filled from live feed: 1-0/);
    // the score still fills — an unread clock does not refuse the state
    await expect(p.msg).toContainText("did not carry minute");
    await expect(p.msg, "no minute was filled from the feed")
      .not.toContainText(/\d+'/);
    await expect(p.minute, "the operator's minute, not the backend's 45 floor")
      .toHaveValue("63");
    await expect(p.minute, "and the operator's phase").toHaveAttribute("min", "45");
  });

test("1H with no clock: the fold is a ZERO, and it does not reach the form",
  async ({ page }) => {
    // The sharper half of the same fold: under 1H, `sim_minutes(0.0)` is
    // 0.0, so the feed would have said "kick-off" about a match that is
    // under way. The form's own default (45', first half) is what the
    // operator left, so it is what must still be there.
    expect(LIVE_STATE_MINUTE_UNREAD_1H.minute_unread).toBe(true);
    expect(LIVE_STATE_MINUTE_UNREAD_1H.minutes_elapsed).toBe(0);

    const p = await openManualOverride(
      page, LIVE_SCORES_MINUTE_UNREAD_1H, LIVE_STATE_MINUTE_UNREAD_1H);
    const before = await p.minute.inputValue();
    expect(before, "the form's untouched default").not.toBe("0");

    await p.fill.click();
    await expect(p.msg).toContainText(/^Filled from live feed: 1-0/);
    await expect(p.msg).toContainText("did not carry minute");
    await expect(p.msg).not.toContainText(/\d+'/);
    await expect(p.minute).toHaveValue(before);
  });

test("a clock the provider DID send still fills — the control", async ({ page }) => {
    // THE NON-VACUITY HALF. A panel that never filled a minute would pass
    // both tests above; a read clock has one to fill.
    expect(LIVE_STATE_KEYLESS.minute_unread).toBe(false);
    expect(LIVE_STATE_KEYLESS.minutes_elapsed).toBe(55);

    const p = await openManualOverride(page, LIVE_SCORES, LIVE_STATE_KEYLESS);
    await p.fill.click();
    await expect(p.msg).toContainText("Filled from live feed: 1-0, 55'");
    await expect(p.msg).not.toContainText("did not carry");
    await expect(p.minute).toHaveValue("55");
  });

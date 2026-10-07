import { expect, test } from "@playwright/test";

import { openManualOverride } from "./live-panel-autofill";
import {
  LIVE_SCORES, LIVE_STATE_REFUSED_KEYED, LIVE_STATE_REFUSED_KEYLESS,
} from "./live-state-recorded";
import { assertNoMachineText } from "./machine-text";

// A REFUSAL SAYS WHICH FEED RAN (found 2026-09-28 on the audit branch
// `audit-0928-display-labels`, fixed 2026-10-07).
//
// THE DEFECT. LivePanel.autoFill branched on
// `s.reason === "feed not configured"`. The backend stopped sending that
// on 2026-09-09: with no API-Football key it no longer declines to read,
// it reads the KEYLESS ESPN scoreboard, and its refusal now says which
// provider ran — written precisely because an operator could not tell a
// keyless deployment from a switched-off feed. The panel's branch never
// matched again, so every refusal read "No live match found right now"
// and that sentence never reached the person it was written for.
//
// THE FIX RENDERS THE BACKEND'S REASON rather than matching it — the
// match is how it broke — and screens it with the same machine-text
// shapes as the board (e2e/machine-text.ts). The one token in it, the
// route citing its own module in parentheses, comes out whole.
//
// The scoreboard still shows the match: the snapshot store holds a live
// card through a feed gap (backend live_state GAP_GRACE), and the panel
// asks the feed itself, which is the read that found nothing.
//
// HERMETIC: both refusals are the backend route's own output, keyless
// and keyed, run in process (e2e/live-state-recorded.ts).

/** The backend's sentences, off the wire, without the trailing source
 *  pointer — each one must reach the reader. */
const sentences = (reason: string) =>
  reason.replace(/\s*\([^)]*\)\s*$/, "").split(/\.\s+/).filter(Boolean);

// Two deployments, two different reasons (keyless names the ESPN
// scoreboard; keyed names API-Football first, ESPN second), so a fixed
// sentence cannot pass both.
for (const [name, body] of [
  ["keyless", LIVE_STATE_REFUSED_KEYLESS],
  ["keyed", LIVE_STATE_REFUSED_KEYED],
] as const) {
  test(`a ${name} refusal renders the backend's own sentence, screened`,
    async ({ page }) => {
      expect(body.available).toBe(false);
      expect(body.budget.key_configured).toBe(name === "keyed");
      const said = sentences(body.reason);
      expect(said.length, "the wire's reason has sentences to carry")
        .toBeGreaterThan(1);

      const p = await openManualOverride(page, LIVE_SCORES, body);
      await p.fill.click();
      await expect(p.msg).toBeVisible();
      for (const s of said) await expect(p.msg).toContainText(s);
      // the dead branch's fall-through, which every refusal used to read
      await expect(p.msg).not.toContainText("No live match found right now");
      // and what reaches the reader is a sentence: the backend's own
      // source pointer does not (the test below proves this screen sees it)
      assertNoMachineText(`the live panel's ${name} refusal`,
        (await p.msg.textContent()) ?? "");
    });
}

test("the screen sees the token the panel removes — the raw reason fails it",
  async () => {
    // A machine-text guard that passes because it cannot see the token
    // would let the panel render the reason raw and stay green. The raw
    // wire text must FAIL the same screen the rendered text passes.
    for (const body of [LIVE_STATE_REFUSED_KEYLESS, LIVE_STATE_REFUSED_KEYED]) {
      expect(body.reason).toMatch(/\(live_feed\._fail_until\)/);
      expect(() => assertNoMachineText("the raw reason", body.reason))
        .toThrow(/a source-code pointer/);
    }
  });

/** RUN A FAILED READ'S BOUNDED RETRY TO ITS END (audit C-19, 2026-11-15).
 *
 *  Since C-19 a board or review read that fails retryably (network, or
 *  any 5xx) with nothing on screen yet is asked again on
 *  REFRESH_BACKOFF_MS (15s, 30s, 60s) under a retrying line, and only
 *  then named as a failure. A spec about the NAMED failure installs the
 *  page clock before it opens the page and calls this to fast-forward
 *  through the retries until `settled` is in the DOM. Each step jumps
 *  past the longest backoff and then gives the re-ask a moment of real
 *  time to land, because the next wait is only scheduled once it has. */
import type { Locator, Page } from "@playwright/test";

export async function runOutRetries(page: Page, settled: Locator, steps = 8) {
  for (let i = 0; i < steps; i += 1) {
    if (await settled.count() > 0) return;
    await page.clock.fastForward(61_000);
    await page.waitForTimeout(300);
  }
}

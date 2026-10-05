import { expect, type Page } from "@playwright/test";

// THE CONSOLE'S TOKEN FIELD IS TYPED INTO ONLY ONCE THE PAGE HAS HYDRATED
// (2026-10-05).
//
// A value typed into `#watch-token` before React has hydrated the page is
// never seen by its onChange, so the console never opens. Whether the
// type lands before or after hydration depended on the ORDER tests ran in
// a worker (a page whose scripts the worker's browser already cached
// hydrates later relative to the type than a cold first load), so the
// fake-clock tests passed when first in their worker and failed when not
// — e.g. `ops-trading-live` "the live value moves with the book" failed
// with --workers=1 on the build before this file, and passed alone.
//
// React marks a hydrated element with its `__reactProps$…` key; this
// waits for it, polling from the TEST's clock (never the page's, which
// may be fake) and, under an installed fake clock, advancing the page's.
export async function hydrated(page: Page, fakeClock = false) {
  await expect.poll(async () => {
    if (fakeClock) await page.clock.runFor(100);
    return page.locator("#watch-token").evaluate((el) =>
      Object.keys(el).some((k) => k.startsWith("__reactProps")));
  }, "the console page has hydrated").toBe(true);
}

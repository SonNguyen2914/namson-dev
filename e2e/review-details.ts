import type { Locator, Page } from "@playwright/test";

/** OPEN EVERY FINISHED CARD'S "Details" (2026-10-07). The quiet pass put
 *  everything but the header, the model · market block, the one-line
 *  board read and the verdict chips behind one native disclosure per
 *  card; a spec that asserts on what moved inside opens it first, so its
 *  claim follows the words to where they now live. Sets `open` on the
 *  <details> elements present once the first card has drawn.
 *  The keyboard path is proved separately
 *  (e2e/finished-card-model-market.spec.ts). Not a .spec.ts. */
export async function openDetails(scope: Page | Locator) {
  // the cards draw after the review arrives: wait for the first one
  await scope.locator('[data-testid="review-details"]').first().waitFor({
    state: "attached" });
  await scope.locator('[data-testid="review-details"]').evaluateAll((ds) =>
    ds.forEach((d) => { (d as HTMLDetailsElement).open = true; }));
}

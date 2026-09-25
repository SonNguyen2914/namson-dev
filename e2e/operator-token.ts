// THE OPERATOR TOKEN, TYPED THE WAY A PERSON TYPES IT (2026-09-25).
//
// The watched strip is operator-only: the backend refuses it with a 403
// unless `x-admin-token` is right. Since audit F4 the frontend no longer
// asks for it at all without a token — every anonymous tab used to poll
// it every 15s for a certain 403 — so a spec that wants the live section
// on screen must hold a token, exactly as the operator does. This types
// one into the watch panel's own field, the only place the secret is
// ever entered. Idempotent: the panel is opened only if it is shut.
// (Not a .spec.ts, so the runner does not collect it.)
import type { Page } from "@playwright/test";

export const E2E_OPERATOR_TOKEN = "operator-token-typed-by-a-person";

export async function armToken(page: Page, token = E2E_OPERATOR_TOKEN) {
  const panel = page.getByTestId("watch-panel");
  await panel.waitFor();
  const open = await panel.evaluate((d) => (d as HTMLDetailsElement).open);
  if (!open) await panel.locator("summary").click();
  await page.locator("#watch-token").fill(token);
}

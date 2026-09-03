import { expect, test } from "@playwright/test";

test.describe("Study Hub shell", () => {
  test("is reachable from the existing picker board", async ({ page }) => {
    await page.goto("/bet-suggester");

    const link = page.getByRole("link", { name: "Study Hub" });
    await expect(link).toHaveAttribute("href", "/study-hub");
    await link.click();
    await expect(page).toHaveURL(/\/study-hub$/);
  });

  test("renders the empty Fall 2026 dashboard without inventing courses", async ({
    page,
  }) => {
    await page.goto("/study-hub");

    await expect(page).toHaveTitle("Study Hub — namson.dev");
    await expect(
      page.getByRole("heading", { name: "One quiet place to begin." }),
    ).toBeVisible();
    await expect(page.getByText("Fall 2026 · Read-only dashboard")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Course list pending" }),
    ).toBeVisible();
    await expect(page.getByText("Nothing is missing or guessed.")).toBeVisible();
  });

  test("states the three knowledge boundaries and links to private notes", async ({
    page,
  }) => {
    await page.goto("/study-hub");

    await expect(page.getByRole("heading", { name: "Google Drive" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "NotebookLM" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Curated notes" })).toBeVisible();

    const notes = page.getByRole("link", { name: /Open repository/ });
    await expect(notes).toHaveAttribute(
      "href",
      "https://github.com/SonNguyen2914/study-hub-notes",
    );
    await expect(notes).toHaveAttribute("target", "_blank");
  });

  test("fits a phone viewport without page-level horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/study-hub");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole("navigation", { name: "Study Hub" })).toBeVisible();
  });
});

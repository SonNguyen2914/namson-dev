import { expect, test } from "@playwright/test";
import { serveEight } from "./eight-columns";

/* THE SHAPE IS LABELLED DISPLAY-ONLY (D31, Son 2026-10-25: "add the
 * display-only shape label; keep return dates; no live player ratings
 * yet").
 *
 * CLEAN / SPLIT / HOLLOW is read off the three tier gaps and nothing acts
 * on it — no model, no trader gate, no figure on the card — so every
 * shape chip says so on its hover, after the card's own sentence for its
 * shape. The face is unchanged: the same word in the same chip, in the
 * tiers row (AGENTS.md §8.4). Hermetic: the recorded eight-column board. */

test("every shape chip on the board says it is display-only, after its own sentence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await serveEight(page);
  const chips = page.getByTestId("picker-row").getByTestId("shape-chip");
  const n = await chips.count();
  expect(n).toBeGreaterThan(0);
  const seen = new Set<string>();
  for (let i = 0; i < n; i += 1) {
    const chip = chips.nth(i);
    const word = (await chip.innerText()).trim().toUpperCase();
    expect(["CLEAN", "SPLIT", "HOLLOW"]).toContain(word);
    seen.add(word);
    await expect(chip).toHaveAttribute("data-display-only", "1");
    const title = (await chip.getAttribute("title")) ?? "";
    // the chip's own reading first, in words, then the label
    expect(title, word).toMatch(new RegExp(`^${word[0]}${word.slice(1).toLowerCase()} — `));
    expect(title).toContain("Display only");
    expect(title).toContain("neither the model nor the trader acts on it");
    expect(title).toContain("not a tested edge");
  }
  // the recording carries more than one shape, so this is not one case
  expect(seen.size).toBeGreaterThan(1);
});

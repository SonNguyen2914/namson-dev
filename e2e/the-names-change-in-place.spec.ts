/** THE RIBBON'S SLOTS HOLD STILL AND THEIR NAMES CHANGE.
 *
 *  That sentence is the whole design, and the page shipped doing the
 *  opposite. Keyed by slug, React reconciles a rotation by MOVING each
 *  pill's node to its new position with its text still attached; the
 *  reveal animates on a `text` prop CHANGE, so nothing ever animated and
 *  the ribbon slid sideways instead. It looked deliberate, which is why
 *  it survived — every existing guard asserts the lit SET, and the lit
 *  set is identical either way.
 *
 *  So these watch what the lit-set guards cannot see: what happens
 *  BETWEEN two settled states, and whether a slot still owns its node
 *  afterwards. */
import { test, expect } from "@playwright/test";
import { BOARD_EIGHT, serveEight } from "./eight-columns";

const pills = (p: import("@playwright/test").Page) =>
  p.locator('[data-testid="ribbon-pill"]');

/** Every pill's visible text, in DOM order, as one string. */
const say = (p: import("@playwright/test").Page) =>
  pills(p).evaluateAll((es) => es.map((e) => (e.textContent || "").trim()).join("|"));

test.describe("the ribbon's names change in place", () => {
  test("a step passes through text that is NEITHER the before nor the after "
    + "— which is the scramble actually running", async ({ page }) => {
      await serveEight(page);
      await expect(pills(page)).toHaveCount(8);
      await page.waitForTimeout(1400);          // let the first reveal settle
      const before = await say(page);

      // Sample fast enough to catch a ~430ms reveal with a ~77ms churn.
      const seen: string[] = [];
      await page.keyboard.press("ArrowRight");
      for (let i = 0; i < 14; i++) {
        seen.push(await say(page));
        await page.waitForTimeout(55);
      }
      await page.waitForTimeout(1400);
      const after = await say(page);

      expect(after, "the window did not move at all").not.toBe(before);
      const between = seen.filter((s) => s !== before && s !== after);
      expect(between.length,
        `the ribbon went straight from one settled name set to the other with `
        + `no frame in between, so no scramble ran. before=${before} after=${after}`)
        .toBeGreaterThan(0);

      // and what it passed through must be CHURN, not a half-drawn label:
      // at least one sampled frame carries a character the final text does
      // not, rather than merely being a prefix of it.
      const finals = new Set(after.replace(/\|/g, "").split(""));
      const churned = between.some((s) =>
        s.replace(/\|/g, "").split("").some((c) => !finals.has(c)));
      expect(churned,
        "the in-between frames held only characters from the final names, so "
        + "this is a fade or a slide rather than a letter churn").toBe(true);
    });

  test("a slot keeps its OWN node across a step — the pills do not slide",
    async ({ page }) => {
      await serveEight(page);
      await expect(pills(page)).toHaveCount(8);
      await page.waitForTimeout(1200);
      /* Stamp each node so we can tell "same node, new text" from
         "a different node moved here". A slug attribute cannot answer
         this: it changes under BOTH designs. */
      await pills(page).evaluateAll((es) =>
        es.forEach((e, i) => ((e as HTMLElement).dataset.stamp = String(i))));
      const xBefore = await pills(page).evaluateAll((es) =>
        es.map((e) => Math.round(e.getBoundingClientRect().x)));

      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(1500);

      const stamps = await pills(page).evaluateAll((es) =>
        es.map((e) => (e as HTMLElement).dataset.stamp ?? "gone"));
      const xAfter = await pills(page).evaluateAll((es) =>
        es.map((e) => Math.round(e.getBoundingClientRect().x)));

      expect(stamps, "the nodes were reordered, so React moved pills rather "
        + "than handing each slot a new name — this is the slug-keyed bug")
        .toEqual(stamps.map((_, i) => String(i)));
      expect(xAfter, "the slots moved horizontally").toEqual(xBefore);
    });

  test("every pill draws a REAL colour, including a column with no hue of "
    + "its own", async ({ page }) => {
      /* THE NINTH COLUMN IS THE POINT. On the eight-league board every
         slug has a `--lg-<slug>` declared for it, so building the
         variable name by concatenation and reading it through a shared
         lookup are indistinguishable — which is exactly why this shipped
         broken and no guard noticed. The Campeones Cup joined the board
         on 2026-09-15 with no hue of its own, `var(--lg-campeones)`
         resolved to nothing, and the pill drew with no border colour and
         an invisible dot.

         So the board served here carries that ninth column. A cup is the
         general case of "a column the palette does not name", and the
         page must give it the cup ink rather than a hole. */
      const board = JSON.parse(JSON.stringify(BOARD_EIGHT));
      board.leagues.campeones = {
        src: null, min_current_gp: null, clubs: 0, kind: "cup",
      };
      await serveEight(page, board);
      await expect(pills(page)).toHaveCount(9);
      const dots = await pills(page).evaluateAll((es) => es.map((e) => {
        const i = e.querySelector("i");
        return { slug: (e as HTMLElement).dataset.slug,
                 bg: i ? getComputedStyle(i).backgroundColor : "" };
      }));
      expect(dots.map((d) => d.slug)).toContain("campeones");
      for (const d of dots) {
        expect(d.bg, `${d.slug}'s dot resolved to "${d.bg}" — an undeclared `
          + `custom property with no fallback paints nothing`)
          .toMatch(/^rgba?\(/);
        expect(d.bg, `${d.slug}'s dot is fully transparent`)
          .not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
      }
      /* NON-VACUITY: prove it is the FALLBACK saving the cup and not a hue
         someone has since declared for it. */
      const own = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--lg-campeones").trim());
      expect(own, "--lg-campeones is declared now, so this test no longer "
        + "exercises the missing-hue path — point it at another unnamed "
        + "column rather than deleting it").toBe("");
    });
});

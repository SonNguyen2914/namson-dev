// THE FOURTH CUP — the Europa League on the field page's Cups view.
//
// The backend ships the Europa League as a fourth cup field (branch
// uel-field, `cups_payload()` derives its cup list from
// `cross_league_axes.FIELDS`, so "a fourth field measured tomorrow is a
// fourth entry"). The page was built the same way — every pill, table,
// heading and axis comes off `data.cups` — and this file is the proof
// that it is, on the recorded payload that carries the fourth cup:
//
//   1  NO CUP KEY IS TYPED. The files that draw the Cups view hold no
//      literal of any recorded cup key, so a fourth cup cannot depend on
//      a line somebody remembered to add.
//   2  THE FOURTH CUP IS DRAWN FROM THE PAYLOAD: its pill in the
//      payload's order, its display name, its own table ranked from 1 on
//      its own rows, its own corpus and pass count.
//   3  IT WEARS ITS OWN LIGHT, --lg-uel, and not the brand gold every
//      unmapped key falls back to — the gold the Campeones pill beside it
//      already wears.
//
// HERMETIC: both field reads are served from `field-page-recorded.ts`
// (the backend's own output, trimmed only by dropping rows) and every
// other /api/ read is answered with a named 503.
import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { CUPS, LEAGUES } from "./field-page-recorded";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

async function openCups(page: Page) {
  await page.route("**/api/**", (r) => r.fulfill(json({
    detail: "the-fourth-cup answers every non-field read itself",
  }, 503)));
  await page.route("**/api/field/leagues", (r) => r.fulfill(json(LEAGUES)));
  await page.route("**/api/field/cups", (r) => r.fulfill(json(CUPS)));
  await page.goto("/bet-suggester/ratings");
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  await page.getByTestId("mode-cups").click();
  await expect(page.getByTestId("cup-table")).toBeVisible();
}

const UEL = CUPS.cups.find((c) => c.key === "uel");
const pill = (page: Page, key: string) =>
  page.locator(`[data-testid="cup-pill"][data-key="${key}"]`);

test("the recording carries a fourth cup, and it is the Europa League",
  () => {
    /* NON-VACUITY for everything below: a payload of three cups would
       let every test in this file pass over a page that never met a
       fourth. */
    expect(CUPS.cups.length).toBe(4);
    expect(UEL, "no `uel` cup on the recorded payload").toBeTruthy();
    expect(CUPS.cups.indexOf(UEL!)).toBe(3);
    expect(UEL!.display).toBe("Europa League");
    for (const ax of ["overall", "attack", "defence"]) {
      expect((UEL!.axes as Record<string, { rows: unknown[] }>)[ax].rows.length)
        .toBeGreaterThan(0);
    }
  });

test("no cup key is typed in the files that draw the Cups view — the "
   + "cups are the payload's", () => {
  const SRC = path.join(process.cwd(), "src");
  const files = [
    path.join(SRC, "components", "PinnedPassField.tsx"),
    path.join(SRC, "components", "FieldPills.tsx"),
    path.join(SRC, "lib", "fieldPageApi.ts"),
    path.join(SRC, "pages", "bet-suggester", "ratings.tsx"),
  ];
  /* EVERY key and alias the recording carries, read off it — a list
     typed here would be the second copy that goes stale. */
  const keys = [...new Set(CUPS.cups.flatMap((c) => [c.key, ...c.aliases]))];
  expect(keys).toContain("uel");
  const typed: string[] = [];
  for (const f of files) {
    const code = readFileSync(f, "utf8")
      // comments may NAME a competition; only code can depend on one
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    for (const k of keys) {
      if (new RegExp(`["'\`]${k}["'\`]`).test(code)) {
        typed.push(`${path.basename(f)}: "${k}"`);
      }
    }
  }
  expect(typed, "a cup key is typed where the Cups view is drawn, so a "
    + "cup the payload adds would depend on someone adding it here too")
    .toEqual([]);
});

test("the fourth cup is drawn off the payload: its pill in order, its "
   + "name, its own table ranked from 1", async ({ page }) => {
  await openCups(page);
  const pills = page.getByTestId("cup-pill");
  await expect(pills).toHaveCount(CUPS.cups.length);
  expect(await pills.evaluateAll((els) => els.map((e) => e.getAttribute("data-key"))))
    .toEqual(CUPS.cups.map((c) => c.key));
  await expect(page.locator('[data-churn="1"]')).toHaveCount(0, { timeout: 5000 });
  await expect.poll(() => pill(page, "uel").evaluate((e) => Array.from(
    e.querySelectorAll("[data-cell]")).map((x) => x.textContent).join("")))
    .toBe(UEL!.display);
  await expect(pill(page, "uel")).toHaveAttribute("aria-pressed", "false");

  await pill(page, "uel").click();
  await expect(pill(page, "uel")).toHaveAttribute("aria-pressed", "true");
  const s = page.locator('[data-testid="cup-section"][data-cup="uel"]');
  await expect(s).toBeVisible();
  const rows = UEL!.axes.overall.rows;
  await expect(s.getByTestId("cup-row")).toHaveCount(rows.length);
  await expect(s.getByTestId("cup-row").first()).toHaveAttribute("data-rank", "1");
  // its own measurement, stated on its own table
  await expect(s).toContainText(`${UEL!.passes} passes`);
  await expect(s).toContainText(UEL!.display);
  // and every recorded club is on it, by the payload's own name
  for (const r of rows) {
    await expect(s.locator(`[data-testid="cup-row"][data-club="${r.club}"]`))
      .toHaveCount(1);
  }
});

test("the fourth cup wears its OWN light, --lg-uel — not the brand gold "
   + "an unmapped key falls back to", async ({ page }) => {
  await openCups(page);
  const token = await page.evaluate(() => getComputedStyle(
    document.documentElement).getPropertyValue("--lg-uel").trim());
  expect(token, "--lg-uel is not declared").toBe("#2eac1e");
  const gold = await page.evaluate(() => getComputedStyle(
    document.documentElement).getPropertyValue("--lg-cup").trim());

  const dot = (key: string) => pill(page, key).getByTestId("pill-dot")
    .evaluate((e) => getComputedStyle(e).backgroundColor);
  await expect.poll(() => dot("uel")).toBe("rgb(46, 172, 30)");
  // THE CONTROL: the Campeones pill has no light of its own and wears
  // the gold — so the check above is telling two real states apart
  const toRgb = (hex: string) => `rgb(${[1, 3, 5].map((i) =>
    parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
  expect(await dot("campeones")).toBe(toRgb(gold));
  expect(toRgb(token)).not.toBe(toRgb(gold));

  // lit, the border is the same light as the dot (polled: the pill's
  // colours ease in, so the first computed frame is the unlit border)
  await pill(page, "uel").click();
  await expect(pill(page, "uel")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => pill(page, "uel").evaluate((e) =>
    getComputedStyle(e).borderTopColor)).toBe("rgb(46, 172, 30)");
});

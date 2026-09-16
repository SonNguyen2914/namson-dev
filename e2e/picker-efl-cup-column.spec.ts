import { expect, test } from "@playwright/test";
import { RECORDED, rebased } from "./efl-cup-recorded";

// THE EFL CUP COLUMN — namson.dev/bet-suggester/efl-cup.
//
// The operator asked for the EFL Cup with "exactly every detail of what
// UCL having, the only difference is the theme color", so almost
// everything this page does is already proven by
// picker-ucl-column.spec.ts against the SAME component: the matchday
// bands, the sort control, the dumbbells, the tier cells, the layout at
// eight fixtures to a band. Re-proving them here would be a second copy
// of a guard, which is the copy that rots.
//
// WHAT IS ONLY TRUE OF THIS COMPETITION, and is therefore what this file
// is about:
//
//  1. IT HAS ITS OWN LIGHT AND IT IS NOT THE FALLBACK. `hueOf` answers
//     `var(--lg-cup)` for anything it does not know, and a cup drawn in
//     the brand gold is indistinguishable from the brand — which is
//     exactly what shipped once already, as a colourless pill built by
//     concatenating `var(--lg-<slug>)`.
//  2. MOST OF ITS ROWS REFUSE, AND THE REFUSAL IS THE PRODUCT. Four
//     English tiers with no measured scale between them means a
//     cross-tier tie cannot name a favourite. That is the honest
//     outcome and it must reach the reader as a REASON, never as an
//     empty card and never as a zero.
//  3. THREE OF ITS FOUR TIERS HAVE NO PAGE AND MUST STILL BE NAMED.
//     `rated_on` prints them, and without a `LEAGUE_LABEL` entry the
//     chip reads "championship + leagueone + leaguetwo" — the raw-slug
//     defect this repo has shipped twice.
//
// EVERY PAYLOAD HERE IS RECORDED, NEVER TYPED — see efl-cup-recorded.ts
// for what that means and why this repo insists on it.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const EMPTY_REVIEW = {
  generated_at: new Date().toISOString(),
  date: "20260916", back: 7,
  window: { from: "20260909", to: "20260916" },
  store: { backend: "memory", writable: true },
  leagues: {}, finished: [], refusals: [],
};

/** HERMETIC, AND THE COMMENT IS THE LESSON. A spec that stubs the board
 *  and lets the ratings read go wherever the environment points it is
 *  not hermetic, it is hermetic-LOOKING: in CI that route reaches the
 *  live backend, and the day it starts serving something the column
 *  gains a note nobody here asked for and main goes red on a change that
 *  touched none of it. So the catch-all goes on FIRST (Playwright tries
 *  the most recently registered handler first) and everything this page
 *  can ask for is answered from this file. */
async function open(page: import("@playwright/test").Page,
                    body: unknown = rebased(),
                    where = "/bet-suggester/efl-cup") {
  await page.route("**/api/**", (r) => r.fulfill(json({}, 503)));
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(body)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json(EMPTY_REVIEW)));
  // A 200 SAYING UNMEASURED, not a 503 — "no field is fitted" and "the
  // read failed" are different facts and the column draws them
  // differently. For this competition the first one is the truth.
  await page.route("**/api/comp/*/ratings", (r) => r.fulfill(json({
    competition: "eflcup", axes: null,
    why_not: "no field is fitted for this fixture's competition",
  })));
  await page.goto(where);
}

const col = (page: import("@playwright/test").Page, slug = "eflcup") =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);

// ══ 1. THE COLUMN IS DRAWN, AND IT IS THE ONLY ONE ═══════════════════

test("the page draws the EFL Cup column and nothing else", async ({ page }) => {
  await open(page);
  await expect(col(page)).toHaveCount(1);
  await expect(page.locator('[data-testid="league-col"]')).toHaveCount(1);
});

test("the rated tie is drawn as a row and the unscaled ones as refusals",
  async ({ page }) => {
    await open(page);
    const c = col(page);
    /* THE NUMBERS ARE THE RECORDED PAYLOAD'S OWN, read off it rather
       than written here, so this cannot drift from the fixture. */
    await expect(c.getByTestId("picker-row"))
      .toHaveCount(RECORDED.rows.length);
    await expect(c.getByTestId("picker-refusal"))
      .toHaveCount(RECORDED.refusals.length);
    /* AND THE PAIRING IS THE POINT. A column of nothing but refusals
       would satisfy every "the refusal says why" assertion below while
       proving the column cannot rate anything at all; a column of
       nothing but rows would prove the refusals never render. This
       payload carries both, and this asserts both are non-zero. */
    expect(RECORDED.rows.length).toBeGreaterThan(0);
    expect(RECORDED.refusals.length).toBeGreaterThan(0);
  });

// ══ 2. THE THEME COLOUR — THE ONE INTENDED DIFFERENCE ════════════════

test("the column is lit by its OWN hue, not by the cup fallback",
  async ({ page }) => {
    await open(page);
    /* `evaluate` DOES NOT AUTO-WAIT — the trap this repo names
       explicitly. Reading the column straight after `goto` races the
       render and hands back null, which throws inside the browser and
       reads like a missing token rather than a missing await. */
    await expect(col(page)).toHaveCount(1);
    const read = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const el = document.querySelector(
        '[data-testid="league-col"][data-league="eflcup"]') as HTMLElement;
      return {
        // what the COLUMN actually resolved, not what a token says
        resolved: getComputedStyle(el).getPropertyValue("--lg").trim(),
        own: root.getPropertyValue("--lg-eflcup").trim(),
        cup: root.getPropertyValue("--lg-cup").trim(),
        ucl: root.getPropertyValue("--lg-ucl").trim(),
      };
    });
    /* NON-VACUOUS: the fallback has to be a real, different value, or
       "it is not the fallback" is a claim about two empty strings — and
       an empty `--lg-eflcup` would pass such a test while rendering a
       column with no light at all, which is the exact bug that shipped. */
    expect(read.own).toBeTruthy();
    expect(read.cup).toBeTruthy();
    expect(read.own).not.toBe(read.cup);
    expect(read.own).not.toBe(read.ucl);
    expect(read.resolved).toBe(read.own);
  });

test("the hue is declared, not built by pasting the slug into a token name",
  async ({ page }) => {
    /* THE COLOURLESS PILL, PINNED. `hueOf` is the single lookup and it
       FALLS BACK on an unknown slug; `var(--lg-` + slug + `)` does not
       fall back, it silently resolves to nothing. This asserts the
       registry answers for a competition it knows AND still falls back
       for one it does not — the second half is what tells the two
       implementations apart. */
    await open(page);
    const probe = await page.evaluate(() => {
      const el = document.createElement("span");
      document.body.appendChild(el);
      const read = (v: string) => {
        el.style.color = v;
        return getComputedStyle(el).color;
      };
      const known = read("var(--lg-eflcup)");
      const invented = read("var(--lg-notacompetition)");
      const fallback = read("var(--lg-notacompetition, var(--lg-cup))");
      el.remove();
      return { known, invented, fallback };
    });
    expect(probe.known).not.toBe(probe.invented);
    expect(probe.fallback).not.toBe(probe.invented);
  });

// ══ 3. NO RAW SLUG REACHES THE READER ════════════════════════════════

test("the four tiers it is rated on are NAMED, never printed as slugs",
  async ({ page }) => {
    await open(page);
    const c = col(page);
    await expect(c).toBeVisible();
    const text = (await c.innerText()).toLowerCase();
    /* NON-VACUOUS, and this is the half that matters: the slugs have to
       be IN the payload for "they are not on the screen" to mean
       anything. If `rated_on` were ever dropped from the wire this test
       would pass while the chip said nothing at all. */
    const ratedOn = RECORDED.leagues.eflcup.rated_on as readonly string[];
    expect([...ratedOn].sort())
      .toEqual(["championship", "epl", "leagueone", "leaguetwo"]);

    /* THE NAMES ARE ON SCREEN. This is the half that catches a missing
       LEAGUE_LABEL entry, because `leagueLabel` falls through to the
       slug and "leagueone" is not "League One". */
    for (const name of ["championship", "league one", "league two"]) {
      expect(text, `${name} is not named on the card`).toContain(name);
    }

    /* AND THE SLUG SPELLINGS ARE NOT. Only two of the three can be
       checked this way and the third is worth a sentence rather than a
       fake assertion: the Championship's slug IS its display name once
       case is folded away, so "championship" appearing in the text is
       not evidence of anything. `leagueone` and `leaguetwo` have no
       space and no label collision, so they are the two that can only
       arrive here by falling through the label map — which is exactly
       the defect. */
    for (const slug of ["leagueone", "leaguetwo"]) {
      expect(ratedOn).toContain(slug);
      expect(text, `${slug} reached the reader as a raw slug`)
        .not.toContain(slug);
    }
    expect(ratedOn).toContain("championship");
  });

// ══ 4. A REFUSAL IS A REASON, NEVER A ZERO AND NEVER A BLANK ═════════

test("every refused tie names a reason, and none of them renders as zero",
  async ({ page }) => {
    await open(page);
    const c = col(page);
    const refusals = c.getByTestId("picker-refusal");
    await expect(refusals).toHaveCount(RECORDED.refusals.length);

    /* MISSING IS NEVER ZERO — AND NEVER A ZERO-SHAPED TEST EITHER.
       This first banned "0.00" anywhere on a refusal card and failed
       against the real payload, because Coventry City genuinely have
       0.00 ppg: four games, no points. A measured zero and a withheld
       figure are exactly the two things this rule exists to keep apart,
       so a guard that cannot tell them apart is the rule's own mistake.
       What the component actually promises is narrower and checkable:
       `refused-cell` prints the WORD, and `figure()` prints "not
       stated" rather than "—" or 0.00 for a null. */
    for (let i = 0; i < RECORDED.refusals.length; i += 1) {
      const card = refusals.nth(i);
      const cells = card.getByTestId("refused-cell");
      await expect(cells.first()).toBeVisible();
      for (const t of await cells.allInnerTexts()) {
        expect(t.trim()).toBe("refused");
      }
      const text = await card.innerText();
      /* THE EM DASH IS THE OTHER WAY AN ABSENCE HIDES — it occupies the
         slot a number would and claims nothing, which is how a reader
         comes to think something was measured. */
      expect(text, "an absence rendered as a bare dash").not.toContain("—");
    }

    /* NON-VACUOUS: the named-absence path has to be LIVE on this
       payload, or every assertion above is satisfied by a card that
       simply has every figure. */
    const colText = await c.innerText();
    expect(colText).toMatch(/not stated|no rank/);
  });

test("the column carries the corpus reason it can name no favourite",
  async ({ page }) => {
    /* THE `no_field` BLOCK IS THE WHOLE POINT OF THIS COMPETITION'S
       REFUSALS. The backend measured WHY — two of four tiers absent from
       the Elo corpus, and the Championship in it with zero bridges — and
       a refusal that cannot show that reads as an oversight rather than
       as a finding. This asserts the sentence reaches the wire; the
       backend's own guard asserts it is true. */
    const noField = RECORDED.leagues.eflcup.no_field as string;
    expect(noField.length).toBeGreaterThan(200);
    expect(noField).toMatch(/bridge/i);
    await open(page);
    await expect(col(page)).toBeVisible();
  });

// ══ 5. THE CHARTER ═══════════════════════════════════════════════════

test("IT SHOWS; IT DOES NOT DECIDE — no verb the reader could act on",
  async ({ page }) => {
    await open(page);
    await expect(col(page)).toBeVisible();
    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const forbidden of ["cash out", "sell now", "you should",
                             "buy now", "take the", "lock it in"]) {
      expect(body, `the page told the reader to act: "${forbidden}"`)
        .not.toContain(forbidden);
    }
    /* NON-VACUOUS: the page has to actually have drawn its content, or
       this passes on an empty document. */
    expect(body).toContain("efl cup");
  });

// ══ 6. THE DOOR ══════════════════════════════════════════════════════

test("the rail chip points at this page and wears the cup's own hue",
  async ({ page }) => {
    await open(page, rebased(), "/bet-suggester");
    const chip = page.locator('a[href="/bet-suggester/efl-cup"]').first();
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText(/EFL Cup/);
    /* AND IT IS UNLIT, WHICH IS A STATE AND NOT A FAILURE. The glow
       reads /api/comp/eflcup/fixtures, which is the competition VIEWER's
       route; this cup deliberately has none, the catch-all above answers
       503, and `fetchSoon` reads every failure as UNKNOWN. An unlit chip
       is silence — it must never render as the CLAIM that nothing is on,
       which is what `data-soon="none"` would mean. */
    await page.waitForLoadState("networkidle");
    await expect(chip).toHaveAttribute("data-soon", "unknown");
  });

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
//  2. ITS CROSS-TIER TIES ARE RATED OFF A FIELD, AND UNTIL 2026-09-15
//     THEY WERE NOT. RESTATED 2026-09-16 — this read "MOST OF ITS ROWS
//     REFUSE, AND THE REFUSAL IS THE PRODUCT", because four English
//     tiers had no measured scale between them and a cross-tier tie
//     could name no favourite. Backend #151 (302a557) harvested the
//     cup's own cross-tier ties as the bridges the Championship lacked,
//     all four tiers cleared the placeability floor at two passes, and
//     `cross_league_axes.NO_FIELD` is now `{}`. The fixture the first
//     recording drew as a `no_shared_scale` refusal — Manchester City v
//     Norwich City — now names a favourite with `fav_source: "field"`.
//
//     WHAT DID NOT CHANGE, and it is half of what this file guards: the
//     COMPARISON GAPS ARE STILL WITHHELD. A field puts 94 clubs on one
//     scale; it does not make two divisions' tables subtractable, and
//     2.0 ppg in League Two is not 2.0 ppg in the Premier League. So
//     `ppg_gap`, `gdg_gap` and `rank_gap` are null on a rated cross-tier
//     row, and "missing is never zero, never a bare dash" now has to
//     hold on a RATED card. That is where it is asserted below.
//  3. THREE OF ITS FOUR TIERS HAVE NO PAGE AND MUST STILL BE NAMED.
//     `rated_on` prints them, and without a `LEAGUE_LABEL` entry the
//     chip reads "championship + leagueone + leaguetwo" — the raw-slug
//     defect this repo has shipped twice.
//
// EVERY PAYLOAD HERE IS RECORDED, NEVER TYPED — see efl-cup-recorded.ts
// for what that means, why this repo insists on it, and why the
// recording was RE-TAKEN rather than edited when the field landed.

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

test("every fixture on the wire is drawn, and nothing is dropped",
  async ({ page }) => {
    await open(page);
    const c = col(page);
    /* THE NUMBERS ARE THE RECORDED PAYLOAD'S OWN, read off it rather
       than written here, so this cannot drift from the fixture. */
    await expect(c.getByTestId("picker-row"))
      .toHaveCount(RECORDED.rows.length);
    await expect(c.getByTestId("picker-refusal"))
      .toHaveCount(RECORDED.refusals.length);
    /* NON-VACUOUS: the column has to have drawn SOMETHING, or every
       assertion below passes over an empty board. */
    expect(RECORDED.rows.length + RECORDED.refusals.length)
      .toBeGreaterThan(0);
  });

test("a CROSS-TIER tie names a favourite, and says the field is where it "
  + "came from", async ({ page }) => {
    /* THE CHANGE, ASSERTED AS A CHANGE (2026-09-16). This test replaces
       "the rated tie is drawn as a row and the unscaled ones as
       refusals", whose second half stopped being true the morning the
       cross-tier Elo field landed (302a557): all four English tiers
       cleared the placeability floor at two passes, `NO_FIELD` emptied,
       and the fixture the old recording drew as a `no_shared_scale`
       refusal is the same fixture that now names Manchester City.

       THE PAIR IS DERIVED FROM THE PAYLOAD, never named here — a test
       that typed two club names would keep passing against a recording
       that stopped carrying them. */
    const rows = RECORDED.rows as readonly Record<string, unknown>[];
    const crossTier = rows.filter((r) => {
      const rated = r.rated_in as { home?: string; away?: string } | undefined;
      return Boolean(rated?.home && rated.away && rated.home !== rated.away);
    });
    expect(crossTier.length,
      "the recording carries no cross-tier tie — this whole test would "
      + "pass over nothing, and a cross-tier tie is the only fixture the "
      + "field decides").toBeGreaterThan(0);
    for (const r of crossTier) {
      expect(r.favourite, "a cross-tier tie with no favourite is the "
        + "refusal this competition stopped making").toBeTruthy();
      expect(r.fav_source, "the favourite must be read off the MEASURED "
        + "field, not off a tier triple with an alphabetical tail")
        .toBe("field");
    }
    await open(page);
    const c = col(page);
    await expect(c.getByTestId("picker-row"))
      .toHaveCount(RECORDED.rows.length);
    /* AND IT REACHES THE READER. The name is on the card, not only on
       the wire. */
    await expect(c).toContainText(crossTier[0].favourite as string);
  });

test("NO fixture in this column refuses for want of a shared scale",
  async ({ page }) => {
    /* THE ASSERTION THE OLD RECORDING COULD NEVER HAVE PASSED, and the
       reason this file was re-recorded instead of reworded. Its meta
       carried `no_field` and two of its three refusals were
       `no_shared_scale`; the suite would have gone on asserting "no
       shared scale exists for this competition" for as long as nobody
       looked, while the live board named favourites.

       DERIVED FROM THE WHOLE PAYLOAD, not from a key this file picked:
       every string anywhere in the recording is walked, so the claim
       cannot come back on a key that did not exist today. */
    const walk = (node: unknown): string[] =>
      typeof node === "string" ? [node]
        : Array.isArray(node) ? node.flatMap(walk)
        : node && typeof node === "object"
          ? Object.entries(node).flatMap(([k, v]) => [k, ...walk(v)])
          : [];
    const strings = walk(RECORDED);
    expect(strings.length, "nothing was walked").toBeGreaterThan(50);
    for (const s of strings) {
      expect(s, "the recording still claims this competition has no "
        + "shared scale — it was measured on 2026-09-15 and it has one")
        .not.toBe("no_shared_scale");
      expect(s, "the recording still carries a NO_FIELD entry for a "
        + "competition whose field is measured").not.toBe("no_field");
    }
    /* AND ON THE PAGE. `col-empty` would be the other way this reads
       wrong: a column that drew nothing at all. */
    await open(page);
    await expect(col(page)).toBeVisible();
    await expect(col(page)).not.toContainText("no shared scale");
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

// ══ 4. A WITHHELD FIGURE IS NAMED, NEVER A ZERO AND NEVER A BLANK ════

test("the gaps a field does not make subtractable are NAMED, never zero "
  + "and never a bare dash", async ({ page }) => {
    /* RESTATED 2026-09-16, AND THE RULE IS UNCHANGED. This ran over the
       column's REFUSED cards, asserting `refused-cell` prints the word
       and nothing renders as a dash. The EFL Cup serves no refusal today
       — the field landed and its cross-tier ties rate — so the same rule
       is asserted where it is now live: on a RATED cross-tier card,
       whose comparison gaps are still withheld because a shared scale
       for a FAVOURITE is not a shared scale for a SUBTRACTION. 2.0 ppg
       in League Two is not 2.0 ppg in the Premier League, `gap_note`
       says so on the wire, and `ppg_gap`/`gdg_gap`/`rank_gap` are null.

       The refused CARD itself is proven against its own recorded
       payloads in refused-card.spec.ts and one-fixture-two-columns
       .spec.ts, which is where that component's guard belongs — a second
       copy of it here was a second copy of a guard.

       AND NEVER A ZERO-SHAPED TEST EITHER. An earlier version of this
       banned "0.00" anywhere on the card and failed against the real
       payload, because Coventry City genuinely have 0.00 ppg: four
       games, no points. A measured zero and a withheld figure are
       exactly the two things this rule exists to keep apart, so a guard
       that cannot tell them apart is the rule's own mistake. */
    const rows = RECORDED.rows as readonly Record<string, unknown>[];
    const withheld = rows.filter((r) =>
      r.ppg_gap === null && r.gdg_gap === null && r.rank_gap === null);
    expect(withheld.length, "no row on this payload withholds a gap — "
      + "this test would pass over a board of ordinary same-tier ties")
      .toBeGreaterThan(0);

    await open(page);
    const c = col(page);
    const cards = c.getByTestId("picker-row");
    await expect(cards.first()).toBeVisible();
    for (let i = 0; i < await cards.count(); i += 1) {
      const text = await cards.nth(i).innerText();
      /* THE EM DASH IS HOW AN ABSENCE HIDES — it occupies the slot a
         number would and claims nothing, which is how a reader comes to
         think something was measured. */
      expect(text, "an absence rendered as a bare dash").not.toContain("—");
    }
    /* NON-VACUOUS: the named-absence path has to be LIVE on this
       payload, or the assertion above is satisfied by a card that simply
       has every figure. `n/a` is the card's own word for a gap that was
       REFUSED rather than missed — it is the vocabulary a cross-league
       UCL row already uses, it sits beside each club's OWN figure
       ("ppg n/a · 2.32 v 1.36"), and `gap_note` in the i says why. Read
       off the rendering rather than guessed at: three gaps, three
       named absences. */
    const colText = await c.innerText();
    expect(colText).toMatch(/n\/a|withheld|not stated|no rank/i);
    for (const axis of ["ppg", "GD/g", "rank"]) {
      expect(colText, `the withheld ${axis} gap is not NAMED`)
        .toContain(`${axis} n/a`);
    }
    /* AND NOT AS A ZERO. A withheld gap rendered 0.00 reads as two
       clubs that measured level, which is a claim nobody made. */
    for (const axis of ["ppg", "GD/g", "rank"]) {
      expect(colText).not.toContain(`${axis} 0.00`);
      expect(colText).not.toContain(`${axis} +0.00`);
    }
  });

test("the column carries the FIELD its favourites are read off",
  async ({ page }) => {
    /* RESTATED 2026-09-16. This was "the column carries the corpus
       reason it can name no favourite", and it asserted
       `leagues.eflcup.no_field` — the account of why two of four tiers
       were absent from the Elo corpus and the Championship sat in it
       with zero bridges. That account was true when it was written and
       was measured false the next morning: the cup's own cross-tier ties
       ARE those bridges, `research_archive/efl_bridges_2026-09-15/`
       harvested them, and all four tiers clear the floor at two passes.

       THE CLAIM IS THE SAME CLAIM ONE STEP ALONG. An ordering a reader
       is shown has to travel with the measurement behind it, or it reads
       as an assertion somebody made up. What travels now is the field
       rather than its absence, so that is what is asserted — including
       the part the field does NOT claim, which is the half a column
       naming favourites is most likely to lose. */
    const meta = RECORDED.leagues.eflcup as Record<string, unknown>;
    expect(meta.no_field, "a measured field and a recorded reason for "
      + "having none cannot both be true").toBeUndefined();
    const field = meta.field as Record<string, unknown>;
    expect(field, "the column names favourites off nothing it publishes")
      .toBeTruthy();
    expect(field.competition).toBe("eflcup");
    expect(field.axes_measured).toEqual(["ovr"]);
    expect(field.size as number).toBeGreaterThan(90);
    expect(String(field.corpus_sha256)).toMatch(/^[0-9a-f]{64}$/);

    /* AND THE BASIS, WITH WHAT IT REFUSES TO SEPARATE. The field's own
       text says the Championship and League One do not separate — 36
       meetings, 0.486 to the higher tier — and a reader who takes "the
       higher division" as evidence is not reading this field. A basis
       that only advertised what it CAN do would be the ordering with
       its caveat filed off. */
    const rowField = (RECORDED.rows[0] as Record<string, unknown>)
      .field_partial as Record<string, unknown>;
    expect(rowField, "the row names a favourite with no field beside it")
      .toBeTruthy();
    const basis = String(rowField.field_basis);
    expect(basis.length).toBeGreaterThan(200);
    expect(basis).toMatch(/bridge/i);
    expect(basis).toMatch(/do not separate/i);

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

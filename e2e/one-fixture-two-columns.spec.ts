import { expect, test } from "@playwright/test";
import { CAMPEONES_BOARD } from "./campeones-board";

/* ONE FIXTURE, TWO COLUMNS, AND A FAVOURITE REFUSED BY NAME.
 *
 *   "looks good, do it. Also Campeones Cup is coming up, put that one in
 *    both MLS and Liga MX since it is Miami vs Cruz Azul"
 *
 * Backend #136 registers the Campeones Cup in `tables.FOLDED_INTO_COLUMNS`
 * — a THIRD declaration beside `BOARD_COLUMNS` (draw a column) and
 * `OFF_BOARD_BY_DECISION` (draw nothing): a competition with rows and no
 * column. Inter Miami CF v Cruz Azul therefore arrives carrying
 * `columns: ["mls", "ligamx"]`, and there is no sixth column.
 *
 * WHAT THIS SPEC IS FOR — four properties, each of which was broken:
 *
 *   1. THE ROW IS IN BOTH COLUMNS. `colOf` returned `r.column`, the
 *      FIRST of them, and four filters compared it with `===`, so the
 *      fixture appeared in MLS and was silently dropped from Liga MX.
 *      The column SET is untouched: `campeones` draws no column.
 *   2. IT READS AS ONE FIXTURE. Two cards with the same two club names,
 *      four columns apart, otherwise read as two matches. The card says
 *      which columns it is in, in words, and both carry the SAME
 *      `data-event`.
 *   3. NO RAW NULL REACHES THE READER. `club` is null on this shape —
 *      no single club was refused — and `${r.club}` put the literal
 *      string "null" into the rank slot's title while the reason line
 *      lost its subject entirely. Same class as a raw slug
 *      (`no-raw-slug-reaches-the-reader.spec.ts`) and a provider
 *      exception (`lib/providerFailure.ts`).
 *   4. THE FAVOURITE IS REFUSED BY NAME, AND BOTH CLUBS' OWN FIGURES
 *      ARE DRAWN. The precedent is the promoted-club card of
 *      2026-09-11 (`refused-card.spec.ts`): the skeleton stays, the
 *      comparison cells print `refused`, and what was MEASURED is
 *      filled. `sides` is what makes that possible here.
 *
 * 2026-10-12 — CUP TIES LEFT THE LEAGUE COLUMNS. Son's naming decision
 * of 2026-10-07 (roadmap 05b) reversed property 1: the landing page no
 * longer draws a cup tie inside a league column, so this fixture is now
 * drawn in NEITHER, and the page says how many cup ties it left out
 * (e2e/board-cups-tab.spec.ts). The tests that pinned the fold itself —
 * one card per declared column, its `+1` chip, "also in", the same event
 * twice — went with it. Properties 3 and 4 are about the CARD, which is
 * still drawn wherever a cup row has a column of its own, so they run on
 * the narrowed board (`/bet-suggester/ucl`) with the recorded refusal
 * re-columned into that one column; the refusal itself is the
 * recording's.
 *
 * Hermetic: the payload is the backend's own, recorded in
 * `campeones-board.ts`, and every route is served below. An unmatched
 * `/api/` request fails the test rather than reaching production.
 */

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const REVIEW = { back: 7, leagues: {}, finished: [], refusals: [],
                 store: null };
const STRIP = {
  version: "watched-strip-v1", generated_at: "2026-12-10T12:00:00Z",
  matches: [], monitored_by_source: { manual: [], open_position: [] },
  open_positions_not_monitored: [], refusal_codes: {}, policy_codes: {},
};

/** THE ROW UNDER TEST, read off the payload rather than named here. A
 *  test that typed "the campeones row" would keep passing against a
 *  payload that stopped carrying one. */
const ROW = CAMPEONES_BOARD.refusals[0];
/** ITS DECLARED COLUMNS, DERIVED. Every expectation below iterates this
 *  — the seven subset-blind guards found in three days were all a list
 *  typed beside the thing it was supposed to be checking. */
const FOLDED_COLS: readonly string[] = ROW.columns;
/** The one column the CARD tests draw it in — see the header. */
const ONE_COLUMN = "ucl";
const COLS: readonly string[] = [ONE_COLUMN];

/** THE CARD, on the narrowed board: every recorded row and refusal
 *  re-columned into the one column, and the board saying it answered
 *  the narrowed ask. */
const CARD_BOARD = (() => {
  const into = (r: Record<string, unknown>) =>
    ({ ...r, column: ONE_COLUMN, columns: [ONE_COLUMN] });
  const b = CAMPEONES_BOARD as unknown as {
    leagues: Record<string, unknown>; rows: Record<string, unknown>[];
    refusals: Record<string, unknown>[];
  };
  return { ...CAMPEONES_BOARD, narrowed_to: [ONE_COLUMN],
           leagues: { [ONE_COLUMN]: b.leagues.mls },
           rows: b.rows.map(into), refusals: b.refusals.map(into) };
})();

async function open(page: import("@playwright/test").Page,
                    landing = false) {
  const stray: string[] = [];
  await page.route("**/api/**", (r) => {
    stray.push(r.request().url());
    return r.fulfill(json({ detail: "unmocked route" }, 599));
  });
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json(landing ? CAMPEONES_BOARD : CARD_BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/comp/**", (r) => r.fulfill(json({ fixtures: [] })));
  await page.route("**/api/bet-suggester/watched-strip**", (r) =>
    r.fulfill(json(STRIP)));
  await page.goto(landing ? "/bet-suggester" : "/bet-suggester/ucl");
  // the board has rendered before anything is asserted about it
  await expect(page.getByTestId("picker-row").first()).toBeVisible();
  return () => stray;
}

const col = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="league-col"][data-league="${slug}"]`);
/** the refused card AS DRAWN IN one column */
const cardIn = (page: import("@playwright/test").Page, slug: string) =>
  col(page, slug).getByTestId("picker-refusal");

// ─────────────── 1. the row is in NO league column (2026-10-12) ──────

test("the cup tie is drawn in none of the league columns it was folded "
  + "into, and the page says it left one out", async ({ page }) => {
    await open(page, true);
    for (const slug of FOLDED_COLS) {
      await expect(col(page, slug), `the ${slug} column is drawn`).toHaveCount(1);
      await expect(cardIn(page, slug),
        `the cup tie is still drawn in the ${slug} column`).toHaveCount(0);
    }
    await expect(page.locator(`[data-event="${ROW.event_id}"]`)).toHaveCount(0);
    // the league fixtures beside it are untouched
    await expect(page.getByTestId("picker-row").first()).toBeVisible();
    await expect(page.getByTestId("cup-ties-left")).toContainText("1 cup tie");
  });

test("a folded competition draws NO column of its own", async ({ page }) => {
  await open(page, true);
  /* `campeones` is in neither `BOARD_COLUMNS` nor the payload's
     `leagues` map, which IS the column set. A fifth column here would
     be the page inventing a declaration the operator did not make
     (AGENTS.md: the board's columns are his, never derived). */
  await expect(col(page, ROW.league)).toHaveCount(0);
  const drawn = await page.locator('[data-testid="league-col"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-league")));
  expect(drawn.sort()).toEqual(Object.keys(CAMPEONES_BOARD.leagues).sort());
});

// ──────────────────────────── 3. no raw null reaches the reader ──────

test("no card, and no title on it, says the word null", async ({ page }) => {
  await open(page);
  /* `club` IS null on this shape — the refusal names no club, because
     no single one was refused. Interpolation turned that into the
     four-letter string in the rank slot's hover text. The check is over
     the card's TEXT and over every title on it, because the defect was
     in a title and a body-text-only sweep would have missed it. */
  for (const slug of COLS) {
    const card = cardIn(page, slug);
    expect(await card.textContent() ?? "",
      `the card in the ${slug} column prints "null"`).not.toMatch(/\bnull\b/i);
    const titles = await card.locator("[title]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("title") ?? ""));
    expect(titles.length,
      "no titles were read — the sweep proved nothing").toBeGreaterThan(0);
    for (const t of titles) {
      expect(t, `a title on the ${slug} card contains "null": ${t}`)
        .not.toMatch(/\bnull\b/i);
    }
    // …and the same for aria-labels, which a screen reader is handed
    const labels = await card.locator("[aria-label]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""));
    for (const l of labels) expect(l).not.toMatch(/\bnull\b/i);
  }
});

test("the reason line keeps its subject when no club was refused",
  async ({ page }) => {
    await open(page);
    /* `{r.club} — {r.reason}` rendered as " — no_shared_scale": React
       drops a null child, so the line lost its subject and read as a
       card that had failed to load one. A refusal of a PAIRING has a
       subject, and it is the pairing. */
    /* IT STANDS WHERE THE RANK NUMBER WOULD GO NOW (2026-09-15), which
       is the slot a reader's eye already goes to, and it is the only
       copy: the header used to read "rank refused" over this line, and
       the `#refused` tag and the axes row both say that too.
       THE LINE ITSELF IS THE REASON. Its SUBJECT — the pairing, on a
       refusal that names no club — travels in `data-subject` and in the
       title, because the slot it now occupies is one line wide and a
       full sentence would push the chip row onto a second line, which is
       the exact cost this rebuild was undoing. What must never happen is
       the old defect: `{r.club} — {r.reason}` rendering as
       " — no_shared_scale", a reason with no subject at all. */
    const line = cardIn(page, COLS[0]).getByTestId("refusal-reason");
    await expect(line).toHaveAttribute("data-subject", "pairing");
    // the reason in a reader's words (2026-10-07); the subject and the
    // backend's code ride the title
    await expect(line).toHaveText(/no shared ladder/i);
    expect(await line.getAttribute("title"))
      .toBe(`${ROW.home} v ${ROW.away} — not ranked (${ROW.reason})`);
    expect((await line.textContent() ?? "").trim())
      .not.toMatch(/^[\s—-]/);
    expect((await line.getAttribute("title") ?? "").trim())
      .not.toMatch(/^[\s—-]/);
  });

test("the rank slot's hover says why there is no position, and says it "
  + "TRUTHFULLY", async ({ page }) => {
    await open(page);
    const slot = cardIn(page, COLS[0]).getByTestId("refused-rank");
    const title = await slot.getAttribute("title");
    expect(title).toContain("no position in the day's ladder");
    /* NOT THE CLUB SENTENCE. "has no row in the table this column ranks
       on" is FALSE here — both clubs have rows, in two tables nobody has
       measured against each other. Substituting a different subject into
       a false sentence would have hidden the defect instead of fixing
       it. */
    expect(title).not.toContain("has no row in the table");
    expect(title).toContain("both are");
    expect(title).toContain("rated");
  });

test("EVERY SENTENCE IN THE PANEL IS THE PAYLOAD'S — the card authors no "
  + "general rule of its own", async ({ page }) => {
    /* THE DRIFT THIS PINS (2026-09-16). `REFUSAL_GENERAL` — a paragraph
       written in PickerColumn.tsx — hung unconditionally as the FIRST
       section of every refused card's panel, saying that a club with no
       row in the table in use cannot be ranked against one that has a
       row. On THIS card both clubs have rows: the refusal is that their
       two orderings have never met. So a reader opening the i met a
       false general sentence sitting directly above the true specific
       one, which is worse than either alone.

       The backend had already hit this and rewritten its own general
       sentence on 2026-09-14 — `stages.REFUSAL_WITHHELD` now names BOTH
       shapes and points at `case` — and that rewrite was on the payload,
       in this same panel, the whole time. The second copy was the one
       that rotted, so it was deleted rather than synced.

       WHY THIS IS NOT A LIST OF BANNED PHRASES. A guard that named the
       four words of the deleted paragraph would pass the day somebody
       writes a fifth. This asserts the PROPERTY instead: every body in
       the panel must be traceable to a string the backend sent. A
       section the frontend composes fails here whatever it says. */
    await open(page);
    const card = cardIn(page, COLS[0]);
    await card.getByTestId("refusal-why-open").click();
    await expect(card.getByTestId("refusal-notes")).toBeVisible();

    /* THE EMITTER'S SENTENCES, DERIVED FROM THE PAYLOAD — never typed
       here, so a key the backend adds is inside this check on the day it
       is written. */
    const flat = (s: string) => s.replace(/\s+/g, " ").trim();
    /* `flatMap` RATHER THAN A FILTERING TYPE PREDICATE: the fixture is
       `as const`, so every one of these is its own string LITERAL type
       and `s is string` widens the parameter, which tsc rejects
       (TS2677). Widening to `unknown[]` first would work too and would
       throw away the very thing the `as const` is for. */
    const fromTheWire: string[] = ([
      ROW.refusal.withheld,
      ROW.refusal.why,
      ...Object.values(ROW.refusal.absent ?? {}),
      ...Object.values(ROW.refusal.detail ?? {}),
      ...(ROW.reg_time_note ? [ROW.reg_time_note] : []),
    ] as unknown[]).flatMap((s) =>
      typeof s === "string" && s.length > 0 ? [flat(s)] : []);
    expect(fromTheWire.length,
      "the payload carries no prose — this check would pass over nothing")
      .toBeGreaterThan(2);

    /* ANCHORED ON A VISIBLE FIRST MATCH BEFORE `evaluateAll`, which does
       NOT auto-wait. */
    const bodies = card.locator(
      '[data-testid="refusal-notes"] p[data-testid]');
    await expect(bodies.first()).toBeVisible();
    const drawn = (await bodies.evaluateAll(
      (els) => els.map((e) => ({
        id: e.getAttribute("data-testid") ?? "?",
        text: e.textContent ?? "",
      })))).map((b) => ({ id: b.id, text: flat(b.text) }));
    expect(drawn.length, "the panel drew no sections at all")
      .toBeGreaterThan(2);

    for (const { id, text } of drawn) {
      const traced = fromTheWire.some((w) => text.includes(w));
      expect(traced,
        `the "${id}" section is prose this frontend wrote, not the `
        + `backend's: ${JSON.stringify(text.slice(0, 160))}. A second `
        + "author for one fact is the author that rots — this card said "
        + "one club had no row, over a refusal where both clubs have one.")
        .toBe(true);
    }

    /* AND THE DELETED SECTION IS GONE BY NAME, so a reader of this file
       can see WHICH copy went. `refusal-rule-general` was its id. */
    await expect(card.getByTestId("refusal-rule-general")).toHaveCount(0);
  });

// ───────────── 4. the favourite is refused BY NAME, the rest is drawn ─

test("no club is named favourite — the card says so in the backend's "
  + "words and carries no cue that would name one", async ({ page }) => {
    await open(page);
    /* THE WORD ITSELF IS ON THE CARD, and must be: `refusal.withheld`
       lists "the favourite" among the figures no refusal carries, and
       `refusal.why` says "the favourite is not" reported. Asserting the
       word is absent would therefore fail on the very sentence that
       makes the refusal legible. What must be absent is every CUE that
       attaches the idea to a club. */
    for (const slug of COLS) {
      const card = cardIn(page, slug);
      /* THE REFUSAL, STATED, IN THE MODULE'S OWN WORDS — behind the
         circled i since 2026-09-15, with `data-source` replaced by
         something a reader can see: the section quoting the payload
         opens with `Withheld —`, and this file's fallback opens
         "REFUSED, not missing". */
      await expect(card.getByTestId("refused-rule"))
        .toContainText("Withheld —");
      await expect(card.getByTestId("refused-rule"))
        .toContainText(ROW.refusal.withheld);
      await expect(card.getByTestId("refused-rule"))
        .toContainText("the favourite");
      // the anchor — the one figure the board is ordered by — is refused
      await expect(card.getByTestId("anchor-block")).toContainText("refused");
      // and so is the ladder the favourite would have been read off
      await expect(card.getByTestId("refused-dumbbell"))
        .toContainText("no shared ladder");
      /* NO FAVOURITE-BEARING CUE. `home-badge` is the ranked card's
         "is the FAVOURITE at home" badge — a different fact gets a
         different testid, so counting it is exactly the check. The
         venue badge this card DOES draw is `refused-venue`. */
      await expect(card.getByTestId("home-badge")).toHaveCount(0);
      await expect(card.getByTestId("refused-venue")).toHaveCount(1);
      // and the two clubs are drawn HOME then AWAY, the fixture's own
      // order, never favourite-then-opponent
      const clubs = (await card.textContent()) ?? "";
      expect(clubs.indexOf(ROW.home)).toBeLessThan(clubs.indexOf(ROW.away));
    }
  });

test("the refusal is named in the BACKEND's words, with the measurement "
  + "behind it", async ({ page }) => {
    await open(page);
    const card = cardIn(page, COLS[0]);
    /* ALL OF IT IS BEHIND THE CIRCLED i NOW, as sections of one panel —
       so it is OPENED before being read, which is what a reader does.
       `data-case`, `data-keys` and the per-key `data-detail` elements
       went with the markup; what replaced them is the emitter's own
       sentences, which is the fact that matters and the one a drifting
       frontend would stop quoting. */
    await card.getByTestId("refusal-why-open").click();
    await expect(card.getByTestId("refusal-notes")).toBeVisible();

    // the case, and the registry's sentence for it
    await expect(card.getByTestId("refused-case"))
      .toContainText(ROW.refusal.why);
    await expect(card.getByTestId("refused-case"))
      .toContainText("no field has been measured");
    /* AND THE CORPUS NUMBERS. An absence that DECIDES a favourite has
       to travel with its evidence, or "no field" is indistinguishable
       from "nobody looked". DERIVED from the payload's own keys: each
       key is NAMED and each key's sentence is printed under it. */
    const detail = card.getByTestId("refused-detail");
    const keys = Object.keys(ROW.refusal.detail);
    expect(keys.length, "the payload carries no detail to check")
      .toBeGreaterThan(0);
    for (const k of keys) {
      await expect(detail, `${k} is named`).toContainText(k);
      await expect(detail, `${k} carries its own measurement`)
        .toContainText(ROW.refusal.detail[k as keyof typeof ROW.refusal.detail]);
    }
    await expect(detail).toContainText("NO MEASURED FIELD");
  });

test("the blocks a pairing refusal cannot carry are named, one sentence "
  + "each, off the payload", async ({ page }) => {
    await open(page);
    const card = cardIn(page, COLS[0]);
    await card.getByTestId("refusal-why-open").click();
    await expect(card.getByTestId("refusal-notes")).toBeVisible();
    const absent = card.getByTestId("refused-absent");
    const blocks = Object.entries(ROW.refusal.absent);
    expect(blocks.length).toBeGreaterThan(0);
    /* ONE SENTENCE EACH, NAMED. They were `li`s with `data-block` until
       the prose moved into the panel; the names and the sentences are
       the claim and both are still printed, so a block the emitter adds
       arrives here rather than being silently dropped — the keys are
       read off the payload, never typed beside the check. */
    for (const [b, words] of blocks) {
      await expect(absent, `${b} is named as absent`).toContainText(b);
      await expect(absent, `${b} carries the backend's own sentence`)
        .toContainText(words as string);
    }
  });

test("both clubs' OWN figures are drawn — rank out of its own ordering, "
  + "rate, count — and nothing is differenced", async ({ page }) => {
    await open(page);
    const s = ROW.sides;
    for (const slug of COLS) {
      const card = cardIn(page, slug);

      /* THE RANKS. Two positions in two orderings, each printed WITH
         the size of the ordering it is in — which is what makes them
         read as incommensurable rather than comparable, and is why the
         backend ships `of` at all. */
      const pair = card.getByTestId("refused-rank-pair");
      await expect(pair).toHaveText(
        `ranks H #${s.home.rank} of ${s.home.of} · A #${s.away.rank} of ${s.away.of}`);
      // and the SIZE of each ordering rides with the position, which is
      // what makes them read as incommensurable rather than comparable
      expect(await pair.getAttribute("title"))
        .toContain("NOT differenced");
      await expect(pair).toHaveAttribute("data-home-rank", String(s.home.rank));
      await expect(pair).toHaveAttribute("data-away-rank", String(s.away.rank));

      /* THE RATES, side by side and NOT subtracted. A signed figure in
         this cell would be the cross-scale subtraction the whole card
         refuses. */
      /* `ppg H 2.80 · A 1.90` BECAME `ppg 2.80/1.90` (2026-09-15) — the
         same two measured rates in the same home-then-away order, in
         half the width, with the labels moved to the title where both
         club names are spelt out rather than abbreviated. */
      const ppg = card.getByTestId("refused-ppg");
      await expect(ppg).toHaveAttribute("data-home-ppg", String(s.home.ppg));
      await expect(ppg).toHaveAttribute("data-away-ppg", String(s.away.ppg));
      await expect(ppg).toHaveText(
        `ppg ${s.home.ppg.toFixed(2)}/${s.away.ppg.toFixed(2)}`);
      const labelled = (await ppg.getAttribute("title")) ?? "";
      expect(labelled).toContain(`${ROW.home} ${s.home.ppg.toFixed(2)} points per game`);
      expect(labelled).toContain(`${ROW.away} ${s.away.ppg.toFixed(2)} points per game`);
      const ppgText = (await ppg.innerText());
      expect(ppgText).not.toMatch(/[+−-]\s*\d/);

      // THE COUNTS. A count crosses no scale, so it is simply drawn —
      // and it must never read "not stated" over a number the payload
      // carried, which is what happened before `sides` was read.
      const gp = card.getByTestId("refused-gp");
      await expect(gp).toHaveText(
        `gp ${s.home.gp_current}/${s.away.gp_current}`);
      expect(await gp.innerText()).not.toContain("not stated");

      /* THE GAP BETWEEN ANY TWO OF THEM IS STILL REFUSED — the figures
         are drawn, the comparison is not. The card said "rank refused"
         in its header until 2026-09-15 and that slot carries the REASON
         now; the refusal is still marked in every slot where a
         comparison would stand, and the SET is read off the card rather
         than typed here. */
      await expect(card.locator("[data-refused]").first()).toBeAttached();
      const marks = await card.locator("[data-refused]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-refused")!));
      expect([...marks].sort())
        .toEqual(["anchor", "dumbbell", "rank-pair", "tiers"]);
      for (const what of ["anchor", "dumbbell", "tiers"]) {
        await expect(card.locator(`[data-refused="${what}"]`),
          `the ${what} slot says refused`).toContainText("refused");
      }
      // and every axis is still NAMED, in the one span that replaced the
      // stacked trio and the separate shape chip
      for (const axis of ["ovr", "atk", "def", "shape"]) {
        await expect(card.getByTestId("refused-tiers")).toContainText(axis);
      }
      await expect(card.getByTestId("refused-shape")).toHaveCount(0);
    }
  });

test("MISSING IS NEVER ZERO: no measured cell renders 0, a dash, or "
  + "nothing", async ({ page }) => {
    await open(page);
    const card = cardIn(page, COLS[0]);
    for (const id of ["refused-rank-pair", "refused-ppg", "refused-gp"]) {
      const t = (await card.getByTestId(id).innerText()).trim();
      expect(t, `${id} is empty`).not.toBe("");
      expect(t, `${id} renders an em-dash for a figure it has`)
        .not.toContain("—");
      expect(t, `${id} renders a bare zero`).not.toMatch(/(?:^|\s)0(?:\.00)?(?:\s|$)/);
    }
  });

test("the absent market is NAMED as absent, not as a failed look",
  async ({ page }) => {
    await open(page);
    /* There is no Kalshi series for this competition at all — probed
       across the whole Sports listing — so no book was fetched and
       `kalshi` is null. The settlement note is the backend's own
       sentence saying exactly that, and it rides the refusal because
       `annotate_row` attaches it to refusals. Without it the card shows
       only "no kalshi event", which reads as a search that came back
       empty rather than a market that does not exist. */
    const note = cardIn(page, COLS[0]).getByTestId("refused-reg-time");
    await expect(note).toHaveCount(1);
    await expect(note).toContainText("NO KALSHI MARKET");
    /* AND NOT UNDER THE LEAGUES CUP HEADLINE. `RegTimeNote` asserts
       "regulation time only — the price is 90 minutes", which this
       note's own words decline to claim. */
    expect(await note.textContent() ?? "")
      .not.toContain("regulation time only");
  });

test("no league slug reaches the reader where this card names a "
  + "competition", async ({ page }) => {
    await open(page);
    /* `campeones` had no LEAGUE_LABEL entry, and `leagueLabel` falls
       through to the slug — the same defect that printed CZECHLIGA at
       the operator on 2026-09-09. Checked over the slugs the ROW names,
       not over a list typed here.

       SCOPED TO WHAT THE FRONTEND COMPOSES. The card also carries the
       backend's verbatim paragraphs, and one of them QUOTES a slug on
       purpose — the settlement note reports that no Kalshi ticker "
       contains \"campeones\"", which is the probe it ran, not a key
       that escaped. Sweeping those would make this guard fail on the
       evidence it exists to keep. Every element below is one this file's
       own code builds out of `leagueLabel`. */
    const slugs = [ROW.league, ...FOLDED_COLS,
                   ROW.sides.home.rated_in, ROW.sides.away.rated_in];
    for (const slug of COLS) {
      const card = cardIn(page, slug);
      const parts: string[] = [];
      for (const id of ["competition-badge", "refused-rank-pair"]) {
        const el = card.getByTestId(id);
        await expect(el, `${id} is missing`).toHaveCount(1);
        parts.push((await el.textContent()) ?? "");
        parts.push((await el.getAttribute("title")) ?? "");
      }
      expect(parts.join("").length,
        "nothing was read — the sweep proved nothing").toBeGreaterThan(0);
      for (const s of slugs) {
        expect(parts.join(" | "),
          `the raw slug "${s}" is on the ${slug} card`).not.toContain(s);
      }
    }
  });

test("no request left the mocks", async ({ page }) => {
  const stray = await open(page);
  await page.waitForTimeout(500);
  expect(stray()).toEqual([]);
});

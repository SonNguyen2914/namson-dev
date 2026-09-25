/** THE CHAMPIONSHIPS BOARD — the landing page's second board.
 *
 *  `/bet-suggester` carries two boards behind one switch: the club board
 *  it has always been (GET /api/picker/board) and the four national-team
 *  competitions (GET /api/championships/board). Everything here runs on
 *  a RECORDED payload off the real route (e2e/championships-recorded.ts),
 *  so the cards are measured on the provider's own vocabulary, never on
 *  a shape written from a brief.
 *
 *  TWO GUARDS ARE ABOUT REQUESTS, NOT PIXELS, and they are the reason
 *  this file exists before any of the rendering ones:
 *    - the Leagues board makes ZERO calls to the championships route;
 *    - the Championships board makes ZERO calls to the club board — which
 *      matters more, because every club-board GET freezes a pre-kickoff
 *      snapshot row on the backend (e2e/board-holdout.mjs), and a viewer
 *      who left the page on Championships must not cost it one on the
 *      way back. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, routeEight } from "./eight-columns";
import {
  CHAMP_BOARD, CHAMP_CLOCK, INTERIM_CLOCK, INTERIM_DR_NIC, SAMPLE_REFUSAL, XI_LINEUPS,
} from "./championships-recorded";
import { SORT_MODES } from "../src/lib/pickerSort";

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

type Calls = { board: number; review: number; champ: number };

/** Route BOTH boards, and count every request to each. */
async function routeBoth(page: Page, champ: unknown = CHAMP_BOARD): Promise<Calls> {
  const calls: Calls = { board: 0, review: 0, champ: 0 };
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith("/api/picker/board")) calls.board += 1;
    if (u.pathname.startsWith("/api/picker/review")) calls.review += 1;
    if (u.pathname.startsWith("/api/championships")) calls.champ += 1;
  });
  await routeEight(page);
  await page.route("**/api/championships/**",
    (r) => r.fulfill(json(champ)));
  return calls;
}

/** Open the landing page on the Championships board, the way a returning
 *  viewer arrives: the choice already remembered. */
async function openChampionships(page: Page, champ: unknown = CHAMP_BOARD,
                                 clock: string = CHAMP_CLOCK) {
  await page.clock.install({ time: new Date(clock) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  const calls = await routeBoth(page, champ);
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
  return calls;
}

const COLUMNS = CHAMP_BOARD.columns as readonly string[];

test.describe("the Championships board", () => {
  test("the Leagues board makes no call to the championships route",
    async ({ page }) => {
      const calls = await routeBoth(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"]');
      await expect(page.locator('[data-testid="board-mode-leagues"]'))
        .toHaveAttribute("aria-pressed", "true");
      // the board moved and the page settled: still nothing
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(700);
      expect(calls.board).toBeGreaterThan(0);
      expect(calls.champ).toBe(0);
    });

  test("the Championships board makes no call to the club board",
    async ({ page }) => {
      const calls = await openChampionships(page);
      await page.waitForTimeout(700);
      expect(calls.champ).toBeGreaterThan(0);
      expect(calls.board, "a club-board GET freezes snapshot rows").toBe(0);
      expect(calls.review).toBe(0);
    });

  test("the switch flips the board, each way, one route per mode",
    async ({ page }) => {
      const calls = await routeBoth(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"][data-league="epl"]');
      const boardBefore = calls.board;
      await page.click('[data-testid="board-mode-championships"]');
      await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
      await expect(page.locator('[data-testid="league-col"][data-league="epl"]'))
        .toHaveCount(0);
      expect(calls.champ).toBeGreaterThan(0);
      expect(calls.board).toBe(boardBefore);
      await page.click('[data-testid="board-mode-leagues"]');
      await page.waitForSelector('[data-testid="league-col"][data-league="epl"]');
      await expect(page.locator('[data-testid="league-col"][data-league="unl"]'))
        .toHaveCount(0);
    });

  test("the choice is remembered across a reload", async ({ page }) => {
    await routeBoth(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    await page.click('[data-testid="board-mode-championships"]');
    await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
    await page.reload();
    await page.waitForSelector('[data-testid="league-col"][data-league="unl"]');
    await expect(page.locator('[data-testid="board-mode-championships"]'))
      .toHaveAttribute("aria-pressed", "true");
  });

  test("the columns are the payload's `columns`, in its order",
    async ({ page }) => {
      await openChampionships(page);
      const drawn = await page.locator('[data-testid="league-col"]')
        .evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.league));
      expect(drawn).toEqual([...COLUMNS]);
    });

  test("every column wears its own light, and none is the brand gold",
    async ({ page }) => {
      await openChampionships(page);
      const got = await page.evaluate((cols) => {
        const root = getComputedStyle(document.documentElement);
        const probe = document.createElement("i");
        document.body.appendChild(probe);
        const ink = (v: string) => { probe.style.color = v; return getComputedStyle(probe).color; };
        const out = cols.map((c) => {
          const rail = document.querySelector(
            `[data-testid="col-head"][data-league="${c}"] [data-testid="col-rail"]`) as HTMLElement | null;
          return { slug: c, token: root.getPropertyValue(`--lg-${c}`).trim(),
                   rail: rail ? getComputedStyle(rail).backgroundColor : null,
                   want: ink(`var(--lg-${c})`) };
        });
        const gold = ink("var(--accent)");
        probe.remove();
        return { out, gold };
      }, [...COLUMNS]);
      for (const c of got.out) {
        expect(c.token, `--lg-${c.slug} is declared`).not.toBe("");
        expect(c.rail, `${c.slug}'s rail`).toBe(c.want);
        expect(c.rail).not.toBe(got.gold);
      }
      expect(new Set(got.out.map((c) => c.rail)).size).toBe(COLUMNS.length);
    });

  test("a ranked national card reads the field: favourite, tiers, the # panel",
    async ({ page }) => {
      await openChampionships(page);
      const ranked = page.locator('[data-testid="picker-row"]');
      await expect(ranked).toHaveCount(CHAMP_BOARD.rows.length);
      // the field block is the one a club cup card draws, values behind `#`
      expect(await page.locator('[data-testid="picker-row"] [data-testid="field-ranks-open"]').count())
        .toBe(CHAMP_BOARD.rows.length);
    });

  test("a side without a rating is a refusal, listed with its reason",
    async ({ page }) => {
      // the merged recording rates every side in its window; the route's
      // own refused card for one of its fixtures stands in for that
      // fixture's ranked row (see championships-recorded.ts)
      await openChampionships(page, { ...CHAMP_BOARD,
        rows: CHAMP_BOARD.rows.filter((r) => r.event_id !== SAMPLE_REFUSAL.event_id),
        refusals: [...CHAMP_BOARD.refusals, SAMPLE_REFUSAL] });
      const refused = page.locator('[data-testid="picker-refusal"]');
      await expect(refused).toHaveCount(1);
      await expect(refused.locator('[data-testid="refusal-reason"]'))
        .toHaveText("no_national_rating");
      // a refused card's price has no favourite to belong to, so it is
      // named — by the book's own code for the side
      await expect(refused.locator('[data-testid="price-side"]')).toHaveText("GEO");
      await expect(refused).toContainText("ask 53¢");
    });
});

/* ══ THE SAME OBJECT AS A LEAGUES CARD (operator, 2026-09-24) ══════════
 *
 *  "A Championships card that reads as the SAME object as a Leagues card,
 *  with national-team analogues in the same slots and nothing extra." Each
 *  test below is one slot: what the club card draws there, and what the
 *  national card draws instead — never beside it. */
test.describe("a national card is a league card with national facts in its slots", () => {
  test("no second form block: the form cells mark friendlies, hollow",
    async ({ page }) => {
      await openChampionships(page);
      await expect(page.locator('[data-testid="national-read"]')).toHaveCount(0);
      expect(await page.locator('[data-testid="form-strip"] [data-friendly="1"]').count())
        .toBeGreaterThan(0);
      // …and the key to the mark is in the legend, once, not on each card
      await page.getByRole("button", { name: /how to read a row/i }).click();
      await expect(page.locator('[data-testid="legend-national"]')).toContainText(/friendly/);
    });

  test("the stats line carries no club stat, and never an n/a", async ({ page }) => {
    await openChampionships(page);
    const cards = page.locator('[data-testid="picker-row"]');
    for (const t of await cards.allInnerTexts()) {
      expect(t, "no club stat on a national card").not.toMatch(/\bGD\/g\b|\bppg\b|\brank [+−-]/);
      expect(t).not.toContain("n/a");
    }
    // the group-table slots, drawn once a group has started
    expect(await page.locator('[data-testid="national-pts"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[data-testid="national-gp"]').count()).toBeGreaterThan(0);
  });

  test("the headline is the overall Elo gap, not the tier the OVR row already shows",
    async ({ page }) => {
      await openChampionships(page);
      const anchors = page.locator('[data-testid="picker-row"] [data-testid="row-anchor"]');
      const ids = await anchors.evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.anchor));
      expect(new Set(ids)).toEqual(new Set(["headline"]));
      await expect(page.locator('[data-testid="picker-row"] [data-testid="anchor-key"]').first())
        .toHaveText(/elo gap/i);
    });

  test("tiers only on the card: the value ± half-width stays behind the #",
    async ({ page }) => {
      await openChampionships(page);
      await expect(page.locator('[data-testid="picker-row"] [data-measure]')).toHaveCount(0);
    });

  test("a below-floor verdict every side shares is said ONCE, in the column header",
    async ({ page }) => {
      await openChampionships(page);
      for (const col of ["unl", "cnl", "afcon"]) {
        await expect(page.locator(`[data-testid="col-head"][data-league="${col}"] [data-testid="col-floor"]`))
          .toHaveAttribute("data-axes", "atk,def");
      }
      await expect(page.locator('[data-testid="picker-row"] [data-tier="atk"] [data-testid="field-floor-mark"]'))
        .toHaveCount(0);
      await expect(page.locator('[data-testid="picker-row"] [data-tier="def"] [data-testid="field-floor-mark"]'))
        .toHaveCount(0);
    });

  test("…and it is DERIVED: one side clearing the floor brings the per-cell marks back",
    async ({ page }) => {
      // the v2 ratings may clear the floor for some fields; this is that
      // case, made by editing ONE side of ONE recorded row
      const board = JSON.parse(JSON.stringify(CHAMP_BOARD));
      const row = board.rows.find((r: { league: string; field?: unknown }) =>
        r.league === "unl" && r.field);
      /* attack is DRAWN at its licensed count, so the verdict that counts
         is that cut's own (pickerApi.licensedRead) — and the five-band
         side's too, so the edit holds on either reading */
      row.field.axes.atk.fav.below_floor = false;
      if (row.field.axes.atk.licensed) row.field.axes.atk.licensed.below_floor = false;
      await openChampionships(page, board);
      await expect(page.locator('[data-testid="col-head"][data-league="unl"] [data-testid="col-floor"]'))
        .toHaveAttribute("data-axes", "def");
      expect(await page.locator('[data-testid="league-col"][data-league="unl"] [data-tier="atk"] [data-testid="field-floor-mark"]').count())
        .toBeGreaterThan(0);
      // the other columns are untouched by one column's evidence
      await expect(page.locator('[data-testid="col-head"][data-league="cnl"] [data-testid="col-floor"]'))
        .toHaveAttribute("data-axes", "atk,def");
    });

  test("the shape chip is the club card's: a SPLIT is torn, as on the Leagues board",
    async ({ page }) => {
      /* REVERSED 2026-09-25. From 2026-09-24 the tear was withheld on an
         axis the column header calls indicative; the operator: "I told
         you to copy everything and some of them are still behind like
         the clean/split/hollow design". The header's "atk/def †" still
         says it once. Per-row expectations: e2e/card-parity.spec.ts. */
      await openChampionships(page);
      expect(await page.locator('[data-testid="picker-row"] [data-testid="shape-chip"]:not([data-cut="none"])').count())
        .toBeGreaterThan(0);
      await expect(page.locator('[data-testid="picker-row"] [data-cut-withheld]')).toHaveCount(0);
    });

  test("the price row is the club row: the favourite's quote is not relabelled",
    async ({ page }) => {
      await openChampionships(page);
      await expect(page.locator('[data-testid="national-price-side"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="picker-row"] [data-testid="price-side"]')).toHaveCount(0);
      expect(await page.locator('[data-testid="picker-row"]', { hasText: /ask \d+¢/ }).count())
        .toBeGreaterThan(0);
    });

  test("XI: nothing until both are announced, then one chip", async ({ page }) => {
    /* the recording's own announced XIs; where it holds none, one row
       carries the recorded 2026-09-24 block that had (XI_LINEUPS) */
    const board = JSON.parse(JSON.stringify(CHAMP_BOARD));
    const own = board.rows.filter((r: { national?: { lineups?: { announced?: boolean } } }) =>
      r.national?.lineups?.announced).length;
    if (own === 0) board.rows[0].national.lineups = XI_LINEUPS;
    await openChampionships(page, board);
    const announced = own || 1;
    await expect(page.locator('[data-testid="xi-chip"]')).toHaveCount(announced);
    await expect(page.locator('[data-testid="national-lineups"]')).toHaveCount(0);
    for (const t of await page.locator('[data-testid="picker-row"]').allInnerTexts()) {
      expect(t).not.toMatch(/not announced/i);
    }
  });

  test("head-to-head: one compact item, ESPN's record or our corpus's, said as such",
    async ({ page }) => {
      await openChampionships(page);
      type H = { source: string; available: boolean; reason?: string | null;
                 window?: { label?: string } | null;
                 tally: { home: number; draw: number; away: number } };
      const rows = (CHAMP_BOARD.rows as unknown as Array<{ event_id: string;
        favourite: string; fav_side: "home" | "away"; national: { head_to_head: H } }>);
      const kinds = rows.map((r) => r.national.head_to_head);
      // the recording holds all three: ESPN, a corpus meeting, a corpus absence
      expect(kinds.some((h) => h.source === "seasonseries")).toBe(true);
      expect(kinds.some((h) => h.source === "corpus_since_2018" && h.available)).toBe(true);
      expect(kinds.some((h) => h.source === "corpus_since_2018" && !h.available)).toBe(true);
      for (const r of rows) {
        const h = r.national.head_to_head;
        const item = page.locator(`[data-testid="picker-row"][data-event="${r.event_id}"] [data-testid="h2h"]`);
        const met = h.tally.home + h.tally.draw + h.tally.away;
        if (met > 0) {
          const opp = r.fav_side === "home" ? "away" : "home";
          await expect(item).toHaveText(`h2h ${h.tally[r.fav_side]}-${h.tally.draw}-${h.tally[opp]}`);
          await expect(item).toHaveAttribute("title", h.source === "corpus_since_2018"
            ? new RegExp(`our match corpus, ${h.window!.label}`) : /ESPN's seasonseries record/);
        } else {
          // a measured absence over a named window, and the backend's own
          // sentence for it verbatim — which never says "never met"
          await expect(item).toHaveText("h2h none since 2018");
          await expect(item).toHaveAttribute("title", h.reason!);
          expect(h.reason).toMatch(/a measured absence over that window, not a claim/i);
        }
      }
    });
});

/* ══ THE VENUE-ADJUSTED FAVOURITE (operator, 2026-09-24) ══════════════
 *
 *  Dominican Republic (home, Santiago) v Nicaragua, recorded at
 *  2026-09-24T23:32Z: overall Elo DR 1439, Nicaragua 1474 — a raw gap that
 *  named Nicaragua and quoted its 19¢ leg while the market had the DR at
 *  62¢. The DR won 3–2. With the home term (+65 to the side at home in
 *  its own country) the DR is the favourite by 29. */
/* EVERY CARD IN THE CURRENT RECORDING CARRIES THE SERVED HEADLINE, so the
   interim fallback is proved on the row it was built for: the 2026-09-24
   recording's DR v Nicaragua, served before the backend sent a headline
   (INTERIM_DR_NIC), dropped into this board at its own clock. */
const DR_NIC = INTERIM_DR_NIC;
const WITH_DR = { ...CHAMP_BOARD, rows: [...CHAMP_BOARD.rows, INTERIM_DR_NIC] };
const openInterim = (page: Page, board: unknown = WITH_DR) =>
  openChampionships(page, board, INTERIM_CLOCK);
const card = (page: Page) =>
  page.locator(`[data-testid="picker-row"][data-event="${DR_NIC.event_id}"]`);

test.describe("the national favourite is venue-adjusted", () => {
  test("the home term names the Dominican Republic, and prices its leg",
    async ({ page }) => {
      expect(DR_NIC.favourite, "the recording named Nicaragua").toBe("Nicaragua");
      await openInterim(page);
      const c = card(page);
      // a national card has no match page to open (rowHref), so the order is
      // read off the favourite's own name line, whose title is "fav v opp"
      await expect(c.locator('[title="Dominican Republic v Nicaragua"]')).toHaveCount(1);
      await expect(c.locator('[data-testid="row-anchor"]')).toHaveText("+29");
      await expect(c.locator('[data-testid="anchor-key"]')).toHaveText(/elo gap/i);
      // the venue chip stays: it is why the number moved
      await expect(c.locator('[data-testid="home-badge"]')).toHaveText("H");
      // and the price is the new favourite's leg — the DR's 62¢, not 19¢
      await expect(c).toContainText("ask 62¢");
      await expect(c).not.toContainText("ask 19¢");
    });

  test("no home term at a neutral venue: the raw gap stands", async ({ page }) => {
    const board = JSON.parse(JSON.stringify(WITH_DR));
    const r = board.rows.find((x: { event_id: string }) => x.event_id === DR_NIC.event_id);
    r.venue_class = { class: "NEUTRAL", home_side: null };
    await openInterim(page, board);
    const c = card(page);
    // a national card has no match page to open (rowHref), so the order is
      // read off the favourite's own name line, whose title is "fav v opp"
      await expect(c.locator('[title="Nicaragua v Dominican Republic"]')).toHaveCount(1);
    await expect(c.locator('[data-testid="row-anchor"]')).toHaveText("+36");
    await expect(c.locator('[data-testid="home-badge"]')).toHaveText("N");
    await expect(c).toContainText("ask 19¢");
  });

  test("a headline the backend serves is printed as served — value, unit, label",
    async ({ page }) => {
      const board = JSON.parse(JSON.stringify(WITH_DR));
      const r = board.rows.find((x: { event_id: string }) => x.event_id === DR_NIC.event_id);
      r.national.headline = { value: 0.42, unit: "goals", label: "xg gap" };
      await openInterim(page, board);
      const c = card(page);
      await expect(c.locator('[data-testid="row-anchor"]')).toHaveText("+0.42");
      await expect(c.locator('[data-testid="anchor-key"]')).toHaveText(/xg gap/i);
      // the backend named the favourite by its own headline: not re-read here
      // a national card has no match page to open (rowHref), so the order is
      // read off the favourite's own name line, whose title is "fav v opp"
      await expect(c.locator('[title="Nicaragua v Dominican Republic"]')).toHaveCount(1);
    });
});

/* ══ THE CORNER SAYS WHAT IT IS MADE OF, AND WHEN IT IS CLOSE (2026-09-25)
 *  Operator's choice after the held-out hit-rate table: a venue line under
 *  the Elo gap ("+52 rating · +65 home" / "· neutral"), and the number
 *  drawn faint under 100 Elo, where the named favourite won 35–44% of
 *  held-out national matches. The backend serves "Elo points", which must
 *  print whole, not "+117.30". */
const GEO_NIR = CHAMP_BOARD.rows.find((r) =>
  r.home === "Georgia" && r.away === "Northern Ireland")!;
const geo = (page: Page) =>
  page.locator(`[data-testid="picker-row"][data-event="${GEO_NIR.event_id}"]`);

test.describe("the corner: a venue line, and a close call drawn faint", () => {
  test("a home call says so: rating and home term, signed to the favourite",
    async ({ page }) => {
      await openInterim(page);
      const k = card(page).locator('[data-testid="anchor-key"]');
      await expect(k).toContainText(/\u221236 rating · \+65 home/i);
      // derived from the recording, never typed: the favourite's rating
      // minus the opponent's, on the row's own overall axis
      const o = (GEO_NIR as unknown as { field: { axes: { ovr: {
        fav: { value: number }; opp: { value: number } } } } }).field.axes.ovr;
      const raw = Math.round(o.fav.value - o.opp.value);
      const g = geo(page).locator('[data-testid="anchor-key"]');
      await expect(g).toContainText(`+${raw} rating · +65 home`, { ignoreCase: true });
    });

  test("a neutral venue says neutral, and carries no home term", async ({ page }) => {
    const board = JSON.parse(JSON.stringify(WITH_DR));
    const r = board.rows.find((x: { event_id: string }) => x.event_id === DR_NIC.event_id);
    r.venue_class = { class: "NEUTRAL", home_side: null };
    await openInterim(page, board);
    await expect(card(page).locator('[data-testid="anchor-key"]'))
      .toContainText(/\+36 rating · neutral/i);
  });

  test("under 100 Elo the number is drawn faint; from 100 it is not", async ({ page }) => {
    await openInterim(page);
    const close = card(page).locator('[data-testid="row-anchor"]');
    await expect(close).toHaveText("+29");
    await expect(close).toHaveAttribute("data-close", "1");
    await expect(close).toHaveClass(/text-ink-faint/);
    const clear = geo(page).locator('[data-testid="row-anchor"]');
    await expect(clear).not.toHaveAttribute("data-close", "1");
    await expect(clear).toHaveClass(/text-ink-hi/);
  });

  test("the backend's headline in Elo points prints whole, with its own venue line",
    async ({ page }) => {
      const board = JSON.parse(JSON.stringify(WITH_DR));
      const r = board.rows.find((x: { event_id: string }) => x.event_id === GEO_NIR.event_id);
      r.national.headline = { value: 117.3, unit: "Elo points", label: "ELO GAP",
        favourite_side: "home",
        components: { raw_gap_home_minus_away: 52.3, venue_term_home_minus_away: 65.0,
                      venue_class: "TRUE_HOME", host_side: "home" } };
      const d = board.rows.find((x: { event_id: string }) => x.event_id === DR_NIC.event_id);
      d.national.headline = { value: 44.2, unit: "Elo points", label: "ELO GAP",
        favourite_side: "home",
        components: { raw_gap_home_minus_away: -20.8, venue_term_home_minus_away: 65.0,
                      venue_class: "TRUE_HOME", host_side: "home" } };
      await openInterim(page, board);
      await expect(geo(page).locator('[data-testid="row-anchor"]')).toHaveText("+117");
      await expect(geo(page).locator('[data-testid="anchor-key"]'))
        .toContainText(/\+52 rating · \+65 home/i);
      const dr = card(page).locator('[data-testid="row-anchor"]');
      await expect(dr).toHaveText("+44");
      await expect(dr).toHaveAttribute("data-close", "1");
    });
});

/* ══ THE SORT MENU OFFERS WHAT THE ROWS CARRY (2026-09-24) ════════════
 *  A national row has no league table, so GD/g, ppg and rank gap are null
 *  on every card; a menu offering them offers orderings that order
 *  nothing. The national menu is kickoff, the headline and the field rank
 *  gap; the club menu is untouched. */
const bandOptions = (page: Page) => page.locator('[data-testid="band-sort"]').first()
  .evaluate((sel) => [...(sel as HTMLSelectElement).options]
    .map((o) => ({ value: o.value, label: o.textContent?.trim() })));

test.describe("the sort menu offers only keys the rows carry", () => {
  test("a national band: kickoff, the headline, the field rank gap — nothing else",
    async ({ page }) => {
      await openChampionships(page);
      expect(await bandOptions(page)).toEqual([
        { value: "kickoff", label: "kickoff" },
        // named by the headline the cards print (interim: the Elo gap)
        { value: "headline", label: "elo gap" },
        { value: "field_rank", label: "field rank gap" },
      ]);
    });

  test("the Leagues menu is the club menu, verbatim", async ({ page }) => {
    await routeBoth(page);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    expect(await bandOptions(page)).toEqual(
      SORT_MODES.map((m) => ({ value: m.id, label: m.label })));
  });

  test("sorting a band by the headline orders every column's cards by it",
    async ({ page }) => {
      await openChampionships(page);
      const sel = page.locator('[data-testid="band-sort"]').first();
      const day = await sel.getAttribute("data-day");
      await sel.selectOption("headline");
      await page.waitForTimeout(200);
      const perCol = await page.locator(`[data-testid="day-track"][data-day="${day}"]`)
        .evaluateAll((tracks) => tracks.map((t) =>
          [...t.querySelectorAll('[data-testid="row-anchor"]')].map((a) =>
            Number((a.textContent ?? "").replace("−", "-").replace("+", "")))));
      expect(perCol.flat().length).toBeGreaterThan(1);
      for (const v of perCol) {
        expect(v, "descending |headline gap|")
          .toEqual([...v].sort((a, b) => Math.abs(b) - Math.abs(a)));
      }
    });
});

test.describe("the Championships board wears the Leagues board's chrome", () => {
  test("the pill strip and the chooser: four pills, all lit, 4 of 4 drawn",
    async ({ page }) => {
      await openChampionships(page);
      const pills = page.locator('[data-testid="ribbon-pill"]');
      await expect(pills).toHaveCount(4);
      await expect(page.locator('[data-testid="ribbon-pill"][aria-selected="true"]')).toHaveCount(4);
      const slugs = await pills.evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.slug));
      expect(slugs).toEqual([...COLUMNS]);
      await expect(page.locator('[data-testid="column-chooser-summary"]')).toContainText("4 of 4");
    });

  test("every column header carries its stage chip and its (i)", async ({ page }) => {
    await openChampionships(page);
    for (const col of COLUMNS) {
      const head = page.locator(`[data-testid="col-head"][data-league="${col}"]`);
      await expect(head.locator('[data-testid="col-stage"]')).not.toBeEmpty();
      await expect(head.locator('[data-testid="col-notes-open"]')).toBeAttached();
    }
    await expect(page.locator('[data-testid="col-head"][data-league="unl"] [data-testid="col-stage"]'))
      .toHaveText(/league phase · md 1\/6/i);
    // the Gulf Cup is under way: its stage, and the matchday off its tables
    await expect(page.locator('[data-testid="col-head"][data-league="gulfcup"] [data-testid="col-stage"]'))
      .toHaveText(/group stage · md \d/i);
  });

  test("a column with nothing in the window reads as rest days, with its next date",
    async ({ page }) => {
      /* no column of the recorded window is empty (the Asian Cup's, which
         was, left the board on 2026-09-25), so the Gulf Cup's rows are
         taken out: between two stages of a tournament that is exactly
         what it would look like. Its teams' next fixtures stay. */
      const board = { ...CHAMP_BOARD,
        rows: CHAMP_BOARD.rows.filter((r) => r.column !== "gulfcup") };
      const teams = Object.values(CHAMP_BOARD.competitions.gulfcup.teams ?? {}) as
        Array<{ next_fixture?: { kickoff?: string } | null }>;
      const next = teams.map((t) => t.next_fixture?.kickoff).filter(Boolean).sort()[0]!;
      await openChampionships(page, board);
      const col = page.locator('[data-testid="league-col"][data-league="gulfcup"]');
      await expect(col.locator('[data-testid="col-empty"]')).toHaveCount(0);
      const rest = col.locator('[data-testid="rest-day"]:visible');
      expect(await rest.count()).toBeGreaterThan(0);
      await expect(rest.first()).toContainText(/Arabian Gulf Cup — rest day/i);
      const when = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles",
        weekday: "long", month: "short", day: "numeric" }).format(new Date(next)).toLowerCase();
      await expect(rest.first()).toContainText(`next · ${when}`, { ignoreCase: true });
      // a tournament under way says when it resumes, not that it "starts"
      await expect(page.locator('[data-testid="col-head"][data-league="gulfcup"] [data-testid="col-stage"]'))
        .toHaveText(/^next /i);
    });

  test("the Leagues board draws no national slot at all",
    async ({ page }) => {
      await routeBoth(page);
      await page.goto("/bet-suggester");
      await page.waitForSelector('[data-testid="league-col"]');
      for (const id of ["national-pts", "national-gp", "xi-chip",
                        "group-chip", "price-side", "col-stage", "col-floor"]) {
        await expect(page.locator(`[data-testid="${id}"]`)).toHaveCount(0);
      }
      await expect(page.locator('[data-testid="form-strip"] [data-friendly]')).toHaveCount(0);
      expect(await page.locator('[data-testid="league-col"]').count())
        .toBe(Object.keys(BOARD_EIGHT.leagues).length);
    });
});

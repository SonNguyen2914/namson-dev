import { expect, test, type Locator, type Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";
import { block, liveBlock, withModelMarket } from "./model-market";
import { openDetails } from "./review-details";

/* THE FINISHED CARD'S MODEL AND MARKET, FROZEN AT THE T-10 LOCK
 * (Son, 2026-10-07).
 *
 * The backend's T-10 sweep freezes the board card's model-vs-market block
 * once, inside the match's last ten minutes (backend src/mm_lock/), and
 * the review serves it as `mm_lock` with a per-match `result_lean`. The
 * finished card draws it with the BOARD CARD'S OWN lines — header home
 * code · DRAW · away code, model first, market second, one decimal, the
 * top outcome bright — labelled "at T−10 · HH:MM", the verdict box as it
 * stood at the lock, and one plain line saying what happened:
 *
 *            VIL    DRAW   BET          at T−10 · 11:52
 *    model   31.0%  26.0%  43.0%
 *    market  30.0%  25.0%  45.0%
 *    [● MODEL · AGREE]
 *    BET won · both leaned BET
 *
 * (or "FCB won · model leaned ELV, market FCB" when they differ: one
 * "leaned", carried across the comma, so the line fits the board's
 * tightest card)
 *
 * In neutral ink: never green or red for right or wrong. A match with no
 * lock says "not recorded" in grey, its sentence on the hover. Nothing is
 * tallied.
 *
 * AND THE CARD IS QUIET (Son, 2026-10-07: "too wordy … a new user won't
 * read all of that"). The face is the header, this block, the board's
 * read in one line and the verdicts as chips; everything else is under
 * one "Details" disclosure, verbatim. Beside a lock that shows a market,
 * the archive's own T−10 section never claims there is no market.
 *
 * Hermetic: the recorded eight-column board and its review, dressed in
 * the backend's exact wire shape. Every clock is the recorded kickoff's. */

const json = (body: unknown) => ({ status: 200, contentType: "application/json",
  body: JSON.stringify(body) });

type Row = Record<string, unknown> & { event_id: string; league: string;
  kickoff: string; result: { home: number; away: number; winner: string } };

/** Villarreal (HOME) v Real Betis (AWAY), 1–2: the AWAY side is both
 *  sides' favourite — the column order must still be home · DRAW · away. */
const AGREE = "401882877";
/** SV Elversberg v Bayern Munich, 1–2: model leaned the home side. */
const CONFLICT = "401884791";
/** Leeds United v Newcastle United, 4–1: the model leaned the DRAW. */
const DRAW_LEAN = "401879280";
/** Brest v Paris Saint-Germain, re-scored 1–1 here: a draw. */
const DRAWN = "401876465";
/** Internazionale v Udinese, 5–3: no model read at the lock. */
const NO_MODEL = "401874966";
/** San Diego FC v Philadelphia Union: no lock row. */
const NOT_RECORDED = "761814";
/** PSV v Sparta: the store could not be read. */
const UNREAD = "401875605";
/** León v Atlético de San Luis: an older backend, no key at all. */
const NO_KEY = "401876977";

const SLUGS = ["epl", "laliga", "mls", "ligamx", "bundesliga", "seriea",
               "ligue1", "eredivisie"];

function lock(over: {
  model?: { h: number; d: number; a: number } | null;
  market?: { h: number; d: number; a: number } | null;
  codes: { h: string; a: string }; kickoff: string; before?: number;
}) {
  const b = block({ model: over.model, market: over.market, codes: over.codes });
  const ko = new Date(over.kickoff).getTime();
  const before = over.before ?? 480;
  return { ...b, status: "recorded", reason: null, note: null,
    source: "picker_mm_lock",
    locked_at: new Date(ko - before * 1000).toISOString(),
    kickoff_at_lock: new Date(ko).toISOString(),
    seconds_before_kickoff: before };
}

const absent = (status: "not_recorded" | "unread") => ({
  status, reason: status === "not_recorded" ? "no_lock_row" : "store_read_failed",
  note: status === "not_recorded" ? "model/market not recorded for this match"
    : "the model/market lock store could not be read — not read for this match",
  source: "picker_mm_lock", locked_at: null, kickoff_at_lock: null,
  seconds_before_kickoff: null, model: null, market: null, verdict: null,
  top: null, model_meta: null, model_why: null, market_why: null,
  book_flag: null, codes: null, market_meta: null });

type L = "H" | "D" | "A";
function lean(outcome: L, model: L | null, market: L | null,
              status = "compared") {
  return { status, reason: null, outcome, outcome_basis: "final_score",
    model_lean: model, model_lean_why: model ? null : "no_read",
    model_matched: status === "compared" && model ? model === outcome : null,
    market_lean: market, market_lean_why: market ? null : "no_read",
    market_matched: status === "compared" && market ? market === outcome : null };
}

function review() {
  const r = JSON.parse(JSON.stringify(REVIEW_EIGHT)) as { finished: Row[] };
  const at = (id: string) => r.finished.find((x) => x.event_id === id)!;
  const set = (id: string, mm: unknown, rl: unknown) =>
    Object.assign(at(id), { mm_lock: mm, result_lean: rl });
  // AGREE is the FULL card: a captured board read and both verdicts known,
  // so the face's longest board line and chip row are measured too
  Object.assign(at(AGREE), {
    pre_kickoff: { ...(at(AGREE).pre_kickoff as object), origin: "captured",
      origin_label: "CAPTURED", unavailable_reason: null,
      captured_at: "2026-09-14T17:30:00Z", captured_seconds_before_kickoff: 5400,
      captured_lead_band: "near_kickoff", board_date: "20260914",
      reconstructed_from: null,
      state: { refused: false, league: "laliga", home: "Villarreal",
        away: "Real Betis", favourite: "Real Betis", opponent: "Villarreal",
        fav_side: "away", resolution: {}, ppg_gap: 0.42, gdg_gap: 0.88,
        rank_gap: 6, gp_current: { home: 4, away: 4, min: 4 },
        cross_league: false, fav_source: "rank",
        tiers: { ovr: [1, 3], atk: [1, 2], def: [2, 3] },
        tier_gaps: { ovr: 2, atk: 1, def: 1 }, shape: "SPLIT",
        form: { fav: null, opp: null, scope: "LaLiga", scope_is_cup: false },
        src: "current", weights: null, kalshi: null, venue: null,
        venue_class: null,
        current_only: { gdg_gap: null, ppg_gap: null, rank_gap: null },
        gap_note: null, reg_time_note: null,
        table_notes: { home: null, away: null }, ranks: { fav: 4, opp: 10 },
        refused_reason: null } },
    fit: { ...(at(AGREE).fit as object), favourite_won: true,
           favourite_won_reason: "winner=away fav_side=away",
           confirmed_at_20: false,
           confirm_reason: "tilt_label=TILT_OPP on_target 1-3" },
  });
  set(AGREE, lock({ model: { h: 0.31, d: 0.26, a: 0.43 },
                    market: { h: 0.30, d: 0.25, a: 0.45 },
                    codes: { h: "VIL", a: "BET" }, kickoff: at(AGREE).kickoff }),
      lean("A", "A", "A"));
  set(CONFLICT, lock({ model: { h: 0.452, d: 0.262, a: 0.286 },
                       market: { h: 0.120, d: 0.180, a: 0.700 },
                       codes: { h: "ELV", a: "FCB" },
                       kickoff: at(CONFLICT).kickoff, before: 591 }),
      lean("A", "H", "A"));
  set(DRAW_LEAN, lock({ model: { h: 0.33, d: 0.36, a: 0.31 },
                        market: { h: 0.52, d: 0.26, a: 0.22 },
                        codes: { h: "LEE", a: "NEW" },
                        kickoff: at(DRAW_LEAN).kickoff }),
      lean("H", "D", "H"));
  Object.assign(at(DRAWN), { result: { home: 1, away: 1, winner: "draw",
                                       source: "espn_scoreboard" } });
  set(DRAWN, lock({ model: { h: 0.14, d: 0.22, a: 0.64 },
                    market: { h: 0.12, d: 0.20, a: 0.68 },
                    codes: { h: "BRE", a: "PSG" }, kickoff: at(DRAWN).kickoff }),
      lean("D", "A", "A"));
  set(NO_MODEL, lock({ model: null, market: { h: 0.71, d: 0.17, a: 0.12 },
                       codes: { h: "INT", a: "UDI" },
                       kickoff: at(NO_MODEL).kickoff }),
      lean("H", null, "H"));
  set(NOT_RECORDED, absent("not_recorded"),
      lean("A", null, null, "not_recorded"));
  set(UNREAD, absent("unread"), lean("H", null, null, "unread"));
  // NO_KEY: left exactly as the recorded payload — no mm_lock key at all
  return r;
}

async function open(page: Page, width = 1440, spacing?: string) {
  await page.setViewportSize({ width, height: 1200 });
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD_EIGHT)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(review())));
  await page.addInitScript((slugs) => {
    try {
      for (const s of slugs) window.localStorage.setItem(`picker.reviewopen.${s}`, "1");
    } catch { /* storage refused: the tails stay shut and the test says so */ }
  }, SLUGS);
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"]');
  await expect(page.getByTestId("review-row")).toHaveCount(8);
  if (spacing) {
    await page.addStyleTag({ content: `[data-testid="review-row"],
      [data-testid="picker-row"], [data-testid="picker-refusal"]
      { letter-spacing: ${spacing} !important }` });
  }
}

const card = (page: Page, id: string) =>
  page.locator(`[data-testid="review-row"][data-event="${id}"]`);
const section = (page: Page, id: string) => card(page, id).getByTestId("mm-lock");
const title = async (l: Locator) => (await l.getAttribute("title")) ?? "";

async function ink(page: Page, cls: string) {
  return page.evaluate((c) => {
    const probe = document.createElement("span");
    probe.className = c;
    document.body.appendChild(probe);
    const v = getComputedStyle(probe).color;
    probe.remove();
    return v;
  }, cls);
}

test.describe("a finished card with a lock", () => {
  test.beforeEach(async ({ page }) => { await open(page); });

  test("AGREE, the favourite AWAY: home · DRAW · away, model first, top bright, "
    + "the box as it stood", async ({ page }) => {
    const s = section(page, AGREE);
    await s.scrollIntoViewIfNeeded();
    await expect(s).toHaveAttribute("data-status", "recorded");
    // the header is the FIXTURE's home and away, never favourite-first
    const heads = await Promise.all(["h", "d", "a"].map(async (k) => {
      const l = s.getByTestId(`mm-head-${k}`);
      return { k, text: await l.innerText(), box: (await l.boundingBox())! };
    }));
    expect(heads.map((h) => h.text)).toEqual(["VIL", "DRAW", "BET"]);
    expect(heads[0].box.x).toBeLessThan(heads[1].box.x);
    expect(heads[1].box.x).toBeLessThan(heads[2].box.x);
    const want = { model: ["31.0%", "26.0%", "43.0%"],
                   market: ["30.0%", "25.0%", "45.0%"] } as const;
    for (const lab of ["model", "market"] as const) {
      for (const [i, h] of heads.entries()) {
        const v = s.getByTestId(`mm-${lab}-${h.k}`);
        await expect(v).toHaveText(want[lab][i]);
        const vb = (await v.boundingBox())!;
        expect(Math.abs((vb.x + vb.width / 2) - (h.box.x + h.box.width / 2)),
          `${lab} ${h.k} under ${h.text}`).toBeLessThanOrEqual(1.5);
      }
    }
    // model above market
    const mb = (await s.getByTestId("mm-model-label").boundingBox())!;
    const kb = (await s.getByTestId("mm-market-label").boundingBox())!;
    expect(mb.y).toBeLessThan(kb.y);
    // the away favourite is bright on BOTH lines — a frozen read is drawn
    // as it stood, not greyed like the in-play board card
    const hi = await ink(page, "text-ink-hi");
    for (const lab of ["model", "market"]) {
      const top = s.getByTestId(`mm-${lab}-a`);
      await expect(top).toHaveAttribute("data-top", "1");
      expect(await top.evaluate((e) => getComputedStyle(e).color)).toBe(hi);
      await expect(s.getByTestId(`mm-${lab}-h`)).toHaveAttribute("data-top", "0");
    }
    await expect(s.getByTestId("mm-pre-kickoff")).toHaveCount(0);
    // the box: AGREE as at the lock, in the board's own green
    const box = s.getByTestId("mm-verdict");
    await expect(box).toHaveText("MODEL · AGREE");
    await expect(box).toHaveAttribute("data-phase", "at_lock");
    expect(await box.evaluate((e) => getComputedStyle(e).color))
      .toBe(await ink(page, "text-up"));
    // the label and the time: the lock's own clock, in the card's zone
    await expect(s.getByTestId("mm-lock-when")).toHaveText(/^at T−10 · \d{2}:\d{2}$/);
    const ko = new Date(review().finished.find((x) => x.event_id === AGREE)!
      .kickoff).getTime();
    const hhmm = new Date(ko - 480_000).toLocaleTimeString("en-GB", {
      timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit",
      hour12: false });
    await expect(s.getByTestId("mm-lock-when")).toHaveText(`at T−10 · ${hhmm}`);
    // every hover says it is frozen
    for (const id of ["mm-lock-when", "mm-model-label", "mm-market-label",
                      "mm-verdict"]) {
      expect(await title(s.getByTestId(id)), id).toContain("Frozen at the T−10 lock");
    }
    expect(await title(s.getByTestId("mm-model-label"))).toContain("shadow, not advice");
    // the result line
    await expect(s.getByTestId("mm-result-line")).toHaveText("BET won · both leaned BET");
  });

  test("CONFLICT: the box as it stood, and each side's lean named", async ({ page }) => {
    const s = section(page, CONFLICT);
    await s.scrollIntoViewIfNeeded();
    await expect(s.getByTestId("mm-verdict")).toHaveText("MODEL · CONFLICT");
    expect(await s.getByTestId("mm-verdict").evaluate((e) => getComputedStyle(e).color))
      .toBe(await ink(page, "text-warn"));
    await expect(s.getByTestId("mm-model-h")).toHaveAttribute("data-top", "1");
    await expect(s.getByTestId("mm-market-a")).toHaveAttribute("data-top", "1");
    await expect(s.getByTestId("mm-model-h")).toHaveText("45.2%");
    await expect(s.getByTestId("mm-market-a")).toHaveText("70.0%");
    await expect(s.getByTestId("mm-result-line"))
      .toHaveText("FCB won · model leaned ELV, market FCB");
  });

  test("the result line's wording, every case", async ({ page }) => {
    const want: Array<[string, string]> = [
      [AGREE, "BET won · both leaned BET"],
      [CONFLICT, "FCB won · model leaned ELV, market FCB"],
      [DRAW_LEAN, "LEE won · model leaned DRAW, market LEE"],
      [DRAWN, "Draw · both leaned PSG"],
      [NO_MODEL, "INT won · no model read, market leaned INT"],
    ];
    for (const [id, line] of want) {
      await expect(section(page, id).getByTestId("mm-result-line"), id).toHaveText(line);
    }
    // the box on a no-model lock is the board's own NONE box
    await expect(section(page, NO_MODEL).getByTestId("mm-verdict"))
      .toHaveText("MODEL · NONE");
    await expect(section(page, NO_MODEL).getByTestId("mm-model-empty"))
      .toHaveText("no model read");
  });

  test("the result line is neutral ink, and no card says right or wrong",
    async ({ page }) => {
      const mid = await ink(page, "text-ink-mid");
      const lines = page.getByTestId("mm-result-line");
      await expect(lines).toHaveCount(5);
      for (const c of await lines.evaluateAll((els) =>
        els.map((e) => getComputedStyle(e).color))) expect(c).toBe(mid);
      const classes = await lines.evaluateAll((els) =>
        els.map((e) => e.getAttribute("class") ?? "").join(" "));
      for (const hue of ["up", "neg", "warn", "pos", "live", "green", "red",
                         "emerald", "rose", "accent"]) {
        expect(classes).not.toMatch(new RegExp(`(?:^|\\s)text-${hue}(?:[\\s/]|$)`));
      }
      const words = (await page.getByTestId("review-tail").allInnerTexts()).join(" ");
      expect(words).not.toMatch(/\b(right|wrong|correct|called it|hit rate|record)\b/i);
      // and no tally: nothing on the page counts leans or matches
      expect(words).not.toMatch(/\d+\s*(of|\/)\s*\d+\s*(leaned|matched|right)/i);
    });
});

test.describe("a finished card without a lock", () => {
  test.beforeEach(async ({ page }) => { await open(page); });

  test("not recorded, in grey words — no lines, no box, no zeros", async ({ page }) => {
    const s = section(page, NOT_RECORDED);
    await s.scrollIntoViewIfNeeded();
    await expect(s).toHaveAttribute("data-status", "not_recorded");
    const words = s.getByTestId("mm-lock-absent");
    await expect(words).toHaveText("not recorded");
    await expect(s.getByTestId("mm-lock-label")).toHaveText("model · market");
    expect(await title(words)).toContain("Model/market not recorded for this match");
    expect(await words.evaluate((e) => getComputedStyle(e).color))
      .toBe(await ink(page, "text-ink-faint"));
    await expect(s.getByTestId("mm-lines")).toHaveCount(0);
    await expect(s.getByTestId("mm-verdict")).toHaveCount(0);
    await expect(s.getByTestId("mm-result-line")).toHaveCount(0);
    expect(await s.innerText()).not.toMatch(/\d+(\.\d)?%/);
  });

  test("a store that could not be read says so, apart from not recorded",
    async ({ page }) => {
      const s = section(page, UNREAD);
      await expect(s).toHaveAttribute("data-status", "unread");
      await expect(s.getByTestId("mm-lock-absent")).toHaveText("not read");
      expect(await title(s.getByTestId("mm-lock-absent"))).toContain("store");
    });

  test("an older backend with no key at all is named, and the card draws",
    async ({ page }) => {
      const s = section(page, NO_KEY);
      await expect(s).toHaveAttribute("data-status", "missing");
      await expect(s.getByTestId("mm-lock-absent")).toHaveText("not sent");
      expect(await title(s.getByTestId("mm-lock-absent")))
        .toContain("sends no model/market lock");
      await expect(card(page, NO_KEY).getByTestId("review-score")).toBeVisible();
    });
});

/* ONE CARD, ONE CLAIM ABOUT THE MARKET (coordinator review, 2026-10-07).
 * The "market at T-10" section is the match ARCHIVE's own capture of the
 * book, in cents; the lock is the board's capture, as percentages. Beside
 * a lock that shows a market, the archive section never says there is no
 * market: when it has no book it is not drawn, and its absence rides the
 * lock's market hover; when it has one it stays, labelled as the
 * archive's capture so the two cannot be read as one claim. */
test.describe("the archive's T−10 book beside a lock", () => {
  const ABSENCE = /not in this payload|no T-10 book|no T-10 capture|none stored|sends no T-10/i;
  const archiveBook = (status: "present" | "absent") => status === "absent"
    ? { status: "absent", absent_reason: "no_t10_rung", absent_detail: null,
        absent_note: "no T-10 capture stored for this fixture",
        source: "match_archive.prematch.t10", rung: "t10", captured_at: null,
        seconds_before_kickoff: null, price_clock: null, event_ticker: null,
        legs: null, ask_sum_c: null, mid_sum_c: null, overround_c: null,
        overround_reason: null, market_favourite: null, picker_favourite: null }
    : { status: "present", absent_reason: null, absent_detail: null,
        absent_note: null, source: "match_archive.prematch.t10", rung: "t10",
        captured_at: "2026-09-13T15:21:00+00:00", seconds_before_kickoff: 540,
        price_clock: { quotes_captured_at: "2026-09-13T15:21:04+00:00",
                       seconds_before_kickoff: 536, basis: "archive clock" },
        event_ticker: "SYNTH", legs: {
          home: { label: "SV Elversberg", ask_c: 13, mid_c: 12, bid_c: 11 },
          draw: { label: "Draw", ask_c: 19, mid_c: 18, bid_c: 17 },
          away: { label: "Bayern Munich", ask_c: 72, mid_c: 71, bid_c: 70 } },
        ask_sum_c: 104, mid_sum_c: 101, overround_c: 4, overround_reason: null,
        market_favourite: { side: "away", label: "Bayern Munich", basis: "mid",
                            price_c: 71, tie: false, tied_sides: [], reason: null },
        picker_favourite: null };

  async function openWith(page: Page, books: Record<string, unknown>) {
    await page.setViewportSize({ width: 1440, height: 1200 });
    const r = review();
    for (const [id, b] of Object.entries(books)) {
      Object.assign(r.finished.find((x) => x.event_id === id)!, { market_t10: b });
    }
    await page.route("**/api/picker/board**", (x) => x.fulfill(json(BOARD_EIGHT)));
    await page.route("**/api/picker/review**", (x) => x.fulfill(json(r)));
    await page.addInitScript((slugs) => {
      try {
        for (const sl of slugs) window.localStorage.setItem(`picker.reviewopen.${sl}`, "1");
      } catch { /* the count below says so */ }
    }, SLUGS);
    await page.goto("/bet-suggester");
    await expect(page.getByTestId("review-row")).toHaveCount(8);
  }

  test("a card with a lock that shows a market never says there is none — "
    + "closed or open", async ({ page }) => {
    // AGREE: no archive key at all; CONFLICT: the archive stored none;
    // NO_MODEL: a lock with a market and no model
    await openWith(page, { [CONFLICT]: archiveBook("absent") });
    for (const id of [AGREE, CONFLICT, DRAW_LEAN, DRAWN, NO_MODEL]) {
      const c = card(page, id);
      expect(await c.innerText(), `${id} face`).not.toMatch(ABSENCE);
      await openDetails(c);
      expect(await c.innerText(), `${id} details`).not.toMatch(ABSENCE);
      await expect(c.getByTestId("market-t10")).toHaveCount(0);
    }
    // the archive's absence is not lost: it rides the lock's market hover
    expect(await title(section(page, CONFLICT).getByTestId("mm-market-label")))
      .toContain("no T-10 capture stored for this fixture");
    // CONTROL: with no lock, the archive section still names its absence
    const nr = card(page, NOT_RECORDED);
    await openDetails(nr);
    await expect(nr.getByTestId("market-t10")).toContainText(/not in this payload/);
  });

  test("an archive book beside a lock stays, labelled as the archive's "
    + "capture", async ({ page }) => {
    await openWith(page, { [CONFLICT]: archiveBook("present") });
    const c = card(page, CONFLICT);
    await openDetails(c);
    const m = c.getByTestId("market-t10");
    await expect(m).toHaveAttribute("data-status", "present");
    await expect(c.getByTestId("market-t10-label"))
      .toHaveText(/book in cents · archive capture/i);
    await expect(m.getByTestId("market-t10-leg")).toHaveCount(3);
    expect(await title(section(page, CONFLICT).getByTestId("mm-market-label")))
      .not.toContain("separate T−10 capture");
  });
});

/* THE QUIET FACE (Son, 2026-10-07). A new user's card — no lock and no
 * pre-kickoff read — shows the header, "not recorded", "no pre-kickoff
 * read", the chips and "Details", and nothing else; Details opens and
 * closes from the keyboard; closed, it costs every card the same. */
test.describe("the quiet face", () => {
  test.beforeEach(async ({ page }) => { await open(page); });

  test("a new user's card: the header, two absences in words, the chips, "
    + "Details — nothing else", async ({ page }) => {
    const c = card(page, NOT_RECORDED);
    await c.scrollIntoViewIfNeeded();
    // every visible line, top to bottom
    const lines = (await c.innerText()).split("\n").map((l) => l.trim())
      .filter(Boolean);
    const allowed = [
      /^\d{2}$/, /^FT$/, /^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2} [AP]M$/,
      /^San Diego FC$/, /^0–5$/, /^Philadelphia Union$/, /^→$/,
      /^model · market$/, /^not recorded$/, /^no pre-kickoff read$/,
      /^not judged$/, /^exploratory$/, /^Details$/, /^▸$/, /^Details ▸$/,
    ];
    // innerText carries the CSS uppercase, so the words compare caselessly
    for (const l of lines) {
      expect(allowed.some((a) => new RegExp(a.source, "i").test(l)),
        `"${l}" is on a new user's card`)
        .toBe(true);
    }
    await expect(c.getByTestId("mm-lock-absent")).toHaveText("not recorded");
    await expect(c.getByTestId("board-line")).toHaveText("no pre-kickoff read");
    await expect(c.getByTestId("fit-not-judged")).toHaveText("not judged");
    await expect(c.getByTestId("fit-chip-result")).toHaveCount(0);
    await expect(c.getByTestId("fit-chip-read")).toHaveCount(0);
    expect(await title(c.getByTestId("exploratory-chip")))
      .toContain("NOT PREREGISTERED");
    expect(await c.innerText()).not.toMatch(/(^|\D)0(\.0)?%/);
  });

  test("a full card's face: the board's read in one line, both verdicts as "
    + "chips, no paragraph", async ({ page }) => {
    const c = card(page, AGREE);
    await c.scrollIntoViewIfNeeded();
    const bl = c.getByTestId("board-line");
    await expect(bl).toHaveAttribute("data-origin", "captured");
    expect((await bl.innerText()).replace(/\s+/g, " "))
      .toBe("Board: Real Betis +0.88 GD/g · split tiers");
    await expect(c.getByTestId("fit-chip-result")).toHaveText("Favourite won ✓");
    await expect(c.getByTestId("fit-chip-read")).toHaveText("20′ read ✗");
    await expect(c.getByTestId("fit-not-judged")).toHaveCount(0);
    // neutral ink: the tick and the cross carry the answer, not a colour
    const mid = await ink(page, "text-ink-mid");
    for (const id of ["fit-chip-result", "fit-chip-read"]) {
      expect(await c.getByTestId(id).evaluate((e) => getComputedStyle(e).color))
        .toBe(mid);
    }
    // and inside Details the reasons read in words, the codes on the hover
    await openDetails(c);
    await expect(c.getByTestId("fit-result"))
      .toContainText("the away side won; the favourite was the away side");
    await expect(c.getByTestId("fit-read"))
      .toContainText("volume tilted to the opponent; on target 1–3");
    await expect(c.getByTestId("fit-read").locator(
      '[title="tilt_label=TILT_OPP on_target 1-3"]')).toHaveCount(1);
  });

  test("Details opens and closes from the keyboard, and the words are inside",
    async ({ page }) => {
      const c = card(page, CONFLICT);
      await c.scrollIntoViewIfNeeded();
      const details = c.getByTestId("review-details");
      const before = (await c.boundingBox())!.height;
      await expect(c.getByTestId("pre-kickoff")).toBeHidden();
      await c.getByTestId("review-details-toggle").focus();
      await page.keyboard.press("Enter");
      await expect(details).toHaveAttribute("open", "");
      await expect(c.getByTestId("pre-kickoff")).toBeVisible();
      await expect(c.getByTestId("what-happened")).toBeVisible();
      await expect(c.getByTestId("fit-result")).toBeVisible();
      await expect(c.getByTestId("confirm-note")).toContainText("NOT PREREGISTERED");
      expect((await c.boundingBox())!.height).toBeGreaterThan(before + 100);
      await page.keyboard.press("Space");
      await expect(details).not.toHaveAttribute("open", "");
      await expect(c.getByTestId("pre-kickoff")).toBeHidden();
      expect(Math.abs((await c.boundingBox())!.height - before)).toBeLessThanOrEqual(1);
    });

  test("closed, every card with a lock is one height, and every card without "
    + "is another", async ({ page }) => {
      const h = async (ids: string[]) => Promise.all(ids.map(async (id) =>
        Math.round((await card(page, id).boundingBox())!.height * 10) / 10));
      const withLock = await h([AGREE, CONFLICT, DRAW_LEAN, DRAWN, NO_MODEL]);
      const without = await h([NOT_RECORDED, UNREAD, NO_KEY]);
      expect(Math.max(...withLock) - Math.min(...withLock), `${withLock}`)
        .toBeLessThanOrEqual(2);
      expect(Math.max(...without) - Math.min(...without), `${without}`)
        .toBeLessThanOrEqual(2);
    });
});

/* SAME CARD SIZE RULES AS THE BOARD (2026-10-07). At the board's widths —
 * 1440, the tightest four-column 1280, and 1180 — with the glyphs
 * squeezed, as drawn, and widened (a rasteriser can be narrower OR wider
 * than this machine's): every line of the frozen section is ONE line, the
 * result line is not cut, the section is the same height on every card
 * whatever its verdict word or sentence, and nothing scrolls sideways. */
const SPACINGS = ["-0.03em", "0em", "0.03em"] as const;
for (const width of [1440, 1280, 1180] as const) {
  for (const spacing of SPACINGS) {
    test(`one-line rows and equal heights at ${width}px, letter-spacing ${spacing}`,
      async ({ page }) => {
        await open(page, width, spacing);
        await page.waitForTimeout(150);
        const rec = page.locator('[data-testid="mm-lock"][data-status="recorded"]');
        await expect(rec).toHaveCount(5);
        const rows = await rec.evaluateAll((secs) => secs.map((s) => {
          const one = (sel: string) => [...s.querySelectorAll<HTMLElement>(sel)]
            .map((e) => {
              const lh = parseFloat(getComputedStyle(e).lineHeight)
                || parseFloat(getComputedStyle(e).fontSize) * 1.5;
              return { h: e.getBoundingClientRect().height, lh,
                       cut: e.scrollWidth > e.clientWidth + 1 };
            });
          const tops = (sel: string) => new Set([...s.querySelectorAll<HTMLElement>(sel)]
            .map((e) => Math.round(e.getBoundingClientRect().top))).size;
          return {
            id: s.closest('[data-testid="review-row"]')?.getAttribute("data-event"),
            height: Math.round(s.getBoundingClientRect().height * 10) / 10,
            result: one('[data-testid="mm-result-line"]'),
            when: one('[data-testid="mm-lock-when"]'),
            box: one('[data-testid="mm-verdict"]'),
            headTops: tops('[data-testid^="mm-head-"]'),
            modelTops: tops('[data-testid^="mm-model-"]:not([data-testid="mm-model-label"])'),
            marketTops: tops('[data-testid^="mm-market-"]:not([data-testid="mm-market-label"])'),
            labelH: [...s.querySelectorAll<HTMLElement>(
              '[data-testid="mm-model-label"], [data-testid="mm-market-label"]')]
              .map((e) => e.getBoundingClientRect().height),
            headerTops: tops('[data-testid="mm-lock-when"], [data-testid="mm-lock-label"]'),
          };
        }));
        for (const r of rows) {
          for (const k of ["result", "when", "box"] as const) {
            for (const e of r[k]) {
              expect(e.h, `${r.id} ${k} is one line (${e.h} v ${e.lh})`)
                .toBeLessThan(e.lh * 1.6 + 6);
            }
          }
          expect(r.result[0].cut, `${r.id}: the result line is cut`).toBe(false);
          expect(r.headTops, `${r.id} header`).toBe(1);
          expect(r.modelTops, `${r.id} model line`).toBe(1);
          expect(r.marketTops, `${r.id} market line`).toBe(1);
          expect(r.headerTops, `${r.id} label row`).toBe(1);
          for (const h of r.labelH) expect(h, `${r.id} label`).toBeLessThan(20);
        }
        // the frozen section is the same height on every card that has one
        const hs = rows.map((r) => r.height);
        expect(Math.max(...hs) - Math.min(...hs), `heights ${JSON.stringify(rows.map(
          (r) => [r.id, r.height]))}`).toBeLessThanOrEqual(2);
        // the face's one-liners: the board line and the chip row, on EVERY
        // card, are one line and not cut
        const faceLines = await page.locator('[data-testid="review-row"]').evaluateAll(
          (cs) => cs.map((c) => {
            const bl = c.querySelector<HTMLElement>('[data-testid="board-line"]')!;
            const chips = [...c.querySelectorAll<HTMLElement>(
              '[data-testid="fit-chips"] > *')];
            return { id: c.getAttribute("data-event"),
                     board: bl.getBoundingClientRect().height,
                     boardCut: bl.scrollWidth > bl.clientWidth + 1,
                     chipTops: new Set(chips.map((e) =>
                       Math.round(e.getBoundingClientRect().top))).size };
          }));
        for (const f of faceLines) {
          expect(f.board, `${f.id} board line`).toBeLessThan(26);
          expect(f.boardCut, `${f.id} board line cut`).toBe(false);
          expect(f.chipTops, `${f.id} chips`).toBe(1);
        }
        // the grey "not recorded" line is one line too
        const absent = await page.getByTestId("mm-lock-absent").evaluateAll((els) =>
          els.map((e) => ({ h: e.getBoundingClientRect().height,
                            lh: parseFloat(getComputedStyle(e).lineHeight)
                              || parseFloat(getComputedStyle(e).fontSize) * 1.5,
                            cut: e.scrollWidth > e.clientWidth + 1,
                            text: (e as HTMLElement).innerText })));
        expect(absent.length).toBe(3);
        for (const a of absent) {
          expect(a.h, a.text).toBeLessThan(a.lh * 1.6 + 6);
          expect(a.cut, `cut: ${a.text}`).toBe(false);
        }
        // no sideways scroll
        expect(await page.evaluate(() =>
          document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
      });
  }
}

/* THE BOARD CARD AT FULL TIME (Son, 2026-10-07). While the match is under
 * way the box reads IN PLAY; once it has ended (`post`, on the row or on
 * its tape's clock) it reads FULL TIME — grey and solid, never AGREE or
 * CONFLICT — and the model line stays "pre-kickoff" grey. The watch row it
 * sits in stays one line at the board's widths, squeezed and widened. */
test.describe("the board card at full time", () => {
  const LIVE = "401882872", DONE = "401879273", TAPE_DONE = "401884790";

  function board() {
    const b = withModelMarket(BOARD_EIGHT) as unknown as {
      rows: Array<Record<string, unknown>>; refusals: Array<Record<string, unknown>> };
    const at = (id: string) => [...b.rows, ...b.refusals].find((x) => x.event_id === id)!;
    at(LIVE).model_vs_market = block({});
    at(DONE).model_vs_market = block({ model: { h: 0.301, d: 0.250, a: 0.449 } });
    at(TAPE_DONE).model_vs_market = block({});
    Object.assign(at(LIVE), { state: "in", in_play: true, live: liveBlock("in") });
    Object.assign(at(DONE), { state: "post", in_play: false, live: liveBlock("post") });
    // the scoreboard still says `in`, the tape's clock says it is over
    Object.assign(at(TAPE_DONE), { state: "in", in_play: true, live: liveBlock("post") });
    return b;
  }
  const bcard = (page: Page, id: string) => page.locator(
    `[data-testid="picker-row"][data-event="${id}"], `
    + `[data-testid="picker-refusal"][data-event="${id}"]`).first();

  async function openBoard(page: Page, width = 1440, spacing?: string) {
    await page.setViewportSize({ width, height: 1000 });
    await page.route("**/api/picker/board**", (r) => r.fulfill(json(board())));
    await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW_EIGHT)));
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="league-col"]');
    if (spacing) {
      await page.addStyleTag({ content: `[data-testid="picker-row"],
        [data-testid="picker-refusal"] { letter-spacing: ${spacing} !important }` });
    }
  }

  test("FULL TIME once ended, IN PLAY while under way", async ({ page }) => {
    await openBoard(page);
    const low = await ink(page, "text-ink-low");
    const faint = await ink(page, "text-ink-faint");
    for (const [id, word, phase] of [[DONE, "FULL TIME", "full_time"],
                                     [TAPE_DONE, "FULL TIME", "full_time"],
                                     [LIVE, "IN PLAY", "in_play"]] as const) {
      const c = bcard(page, id);
      await c.scrollIntoViewIfNeeded();
      const box = c.getByTestId("mm-verdict");
      await expect(box, id).toHaveText(word);
      await expect(box).toHaveAttribute("data-phase", phase);
      const bs = await box.evaluate((e) => {
        const cs = getComputedStyle(e);
        return { color: cs.color, style: cs.borderTopStyle };
      });
      expect(bs).toEqual({ color: low, style: "solid" });
      expect(await title(box)).toMatch(/agree\/conflict compares pre-match reads only/i);
      expect(await c.innerText()).not.toMatch(/\b(AGREE|CONFLICT)\b/);
      // the model line stays pre-kickoff grey
      await expect(c.getByTestId("mm-pre-kickoff")).toBeVisible();
      for (const k of ["h", "d", "a"]) {
        expect(await c.getByTestId(`mm-model-${k}`).evaluate(
          (e) => getComputedStyle(e).color)).toBe(faint);
      }
    }
  });

  for (const width of [1440, 1280, 1180] as const) {
    for (const spacing of SPACINGS) {
      test(`the FULL TIME watch row is one line at ${width}px, ${spacing}`,
        async ({ page }) => {
          await openBoard(page, width, spacing);
          for (const id of [DONE, LIVE]) {
            const c = bcard(page, id);
            await c.scrollIntoViewIfNeeded();
            const n = await c.getByTestId("watch-toggle").evaluate((e) => new Set(
              [...e.querySelectorAll<HTMLElement>(
                '[data-testid="mm-verdict"], button, span[class*="rounded"]')]
                .filter((b) => b.getBoundingClientRect().height > 0)
                .map((b) => Math.round(b.getBoundingClientRect().top))).size);
            expect(n, `${id} watch row`).toBe(1);
          }
        });
    }
  }
});

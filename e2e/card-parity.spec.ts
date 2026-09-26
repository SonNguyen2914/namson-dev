/** A NATIONAL CARD IS A CLUB CARD — PROVED BY WALKING BOTH.
 *
 *  "I told you to copy everything and some of them are still behind like
 *   the clean/split/hollow design. We have them already just copy it."
 *                                                  (operator, 2026-09-25)
 *
 *  The Championships board's card was rebuilt "slot by slot" on
 *  2026-09-24, and a day later it still differed from the Leagues card
 *  in ways nobody had listed: the SPLIT chip lost its tear, the shape
 *  explainer (`i`) was missing. Both were forks nobody could see without
 *  putting the two cards side by side, which is what this file does,
 *  mechanically, on the two recorded boards.
 *
 *  THE RULE IT ENFORCES. Every element a club card draws is drawn on a
 *  national card, with the same tag and the same classes, and vice
 *  versa — EXCEPT for a declared list, and every entry on that list is
 *  there because the DATA differs, never because the style does. Adding
 *  a national-only mark, or dropping a club one, fails here until
 *  somebody writes down why.
 *
 *  Tone classes are compared as a FAMILY, not a value: a SPLIT chip and a
 *  CLEAN one, a cell that is ahead and one that is behind, the gold rim of
 *  a day's rank-1 card — the data picks which tone a mark wears, so the
 *  test asks that both cards have the mark, not that both recordings
 *  happen to hold the same verdicts. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT, routeEight } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { CLUB_H2H_BOARD, CLUB_H2H_CLOCK } from "./club-h2h-recorded";
import {
  licensedRead, shapeFromGaps, venueAdjusted, type BoardRow, type FieldAxis,
} from "../src/lib/pickerApi";

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

/** Marks only ONE side's data can carry — each with its reason. */
const ONLY_NATIONAL: Record<string, string> = {
  "group-chip": "a national fixture belongs to a group table; a club league fixture has none (a club cup tie names its competition in the same slot, `competition-badge`)",
  "xi-chip": "both starting XIs published — the national payload carries `lineups`; no club row does",
  "field-ranks-open": "the `#`: a national card is read on its competition's own field, which ranks each team per axis; a league card draws it only when its row carries `field_rank` (see the test below), which the recorded club board predates",
  "field-floor-mark": "the dagger on a band the placeability floor refused; only a field has a floor",
  "national-pts": "the group-table points gap; a club's table gap is `ppg`",
  "national-gp": "games played in the group table; a club's is `gp` off its league table",
  "price-side": "whose yes a REFUSED national card's quote is; a national book is two named teams",
  "shape-absent": "a one-axis national row (`field_partial`) carries no shape; every club row does",
  "field-axes-absent": "the backend's sentence for the axes a partial field does not measure",
};
const ONLY_CLUB: Record<string, string> = {
  "tier-read": "the shape (i): drawn only where no `#` is (the 2026-09-10 rule). Every national card has field ranks and so a `#`; a league row without `field_rank` keeps its (i)",
  "own-rates": "each club's own ppg / GD/g beside a withheld gap; a national team has no league rate",
  "gap-note": "why a club gap is withheld (cross-league); a national card withholds none",
  "competition-badge": "a cup tie folded into a league column; a national column is its own competition",
  "rated-in": "which league table each club was rated on; a national card is read on one field",
};

/** Tone: the data chooses among these, so only the FAMILY is compared —
 *  including the venue badge's (`H` in line, `N` in warn: a neutral ground
 *  is common in national football and rare in a club league). */
const TONE = /^(?:hover:)?(?:text|border|bg|ring)-(?:up|neg|warn|accent|line|line-strong|ink-faint|ink-hi|ink-low)(?:\/\d+)?$|^sc-(?:clean|hollow|intact|cut|h|v|level|ovr-level|ovr-behind)$|^\[background:linear-gradient|^font-(?:semibold|normal)$/;

type Mark = { tag: string; cls: string[] };
type Anatomy = Record<string, Mark[]>;

/** Every data-testid'd element on every card of a board, with its tag
 *  and its non-tone classes. */
async function anatomy(page: Page): Promise<Anatomy> {
  return page.locator('[data-testid="picker-row"]').evaluateAll((cards) => {
    const out: Record<string, { tag: string; cls: string[] }[]> = {};
    for (const card of cards) {
      for (const n of [card, ...card.querySelectorAll("[data-testid]")]) {
        const id = (n as HTMLElement).dataset.testid!;
        (out[id] ??= []).push({ tag: n.tagName.toLowerCase(), cls: [...n.classList] });
      }
    }
    return out;
  });
}

const strip = (cls: string[]) => cls.filter((c) => !TONE.test(c)).sort().join(" ");
const shapes = (marks: Mark[]) => new Set(marks.map((m) => `${m.tag}.${strip(m.cls)}`));

/** THE LEAGUES BOARD, on the recording that carries `h2h` (backend
 *  board-data-gaps, 2026-09-25) — so the club card being compared is the
 *  card as it is drawn today, head-to-head included. */
async function clubBoard(page: Page, board: unknown = CLUB_H2H_BOARD) {
  await page.clock.install({ time: new Date(CLUB_H2H_CLOCK) });
  await routeEight(page, board);
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="picker-row"]');
  return anatomy(page);
}

async function nationalBoard(page: Page) {
  await page.clock.install({ time: new Date(CHAMP_CLOCK) });
  await page.addInitScript(() => {
    try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
  });
  await routeEight(page);
  await page.route("**/api/championships/**", (r) => r.fulfill(json(CHAMP_BOARD)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="league-col"][data-league="unl"] [data-testid="picker-row"]');
  return anatomy(page);
}

test("a national card draws every mark a club card draws, in the same classes, "
   + "and nothing else but the declared data-only marks", async ({ browser }) => {
  const a = await browser.newPage(), b = await browser.newPage();
  const club = await clubBoard(a);
  const nat = await nationalBoard(b);
  await a.close(); await b.close();

  const clubIds = Object.keys(club), natIds = Object.keys(nat);
  // the walk found a real card on each side, not an empty board
  expect(clubIds).toContain("shape-chip");
  expect(natIds).toContain("shape-chip");

  const missing = clubIds.filter((id) => !natIds.includes(id) && !(id in ONLY_CLUB));
  expect(missing, "club marks the national card does not draw").toEqual([]);
  const extra = natIds.filter((id) => !clubIds.includes(id) && !(id in ONLY_NATIONAL));
  expect(extra, "national marks with no club counterpart and no declared reason").toEqual([]);

  // the same mark, drawn the same way: tag and every non-tone class
  for (const id of clubIds.filter((x) => natIds.includes(x))) {
    const c = shapes(club[id]), n = shapes(nat[id]);
    for (const s of n) {
      expect(c.has(s), `national "${id}" is drawn as ${s}; the club card draws it as ${[...c].join(" | ")}`)
        .toBe(true);
    }
  }
});

test("where the # is drawn the shape (i) is not: a national card carries the #, "
   + "and speaks of a team", async ({ page }) => {
    /* the 2026-09-10 rule, kept by the operator on 2026-09-25 ("there is
       a (#) icon which show the ranking better"): the # is the one
       ranking view, and a card that draws it draws no (i) */
    await nationalBoard(page);
    const cards = page.locator('[data-testid="picker-row"]');
    const withHash = cards.filter({ has: page.getByTestId("field-ranks-open") });
    expect(await withHash.count()).toBeGreaterThan(0);
    await expect(withHash.getByTestId("tier-read")).toHaveCount(0);
    const card = withHash.first();
    await card.getByTestId("field-ranks-open").click();
    await expect(card.getByTestId("field-ranks")).toContainText(/ovr\s*#\d+v#\d+/i);
    // the prose that remains names a team, never a club
    await expect(card.locator('span[title^="tier bands in this competition"]'))
      .toHaveAttribute("title", /every band the team's 95% interval touches/);
  });

test("a SPLIT national card is torn along the unit that gave way, as a club card is",
  async ({ page }) => {
    await nationalBoard(page);
    /* derived from the recording, read the way the card reads it: through
       its favourite rule (venueAdjusted) and with attack and defence at
       their licensed count (licensedRead), the shape re-read off those
       gaps by the backend's rule. Every SPLIT whose attack or defence gap
       does not back the favourite is a cut, horizontal for attack and
       vertical for defence (PickerRead.cutOf). */
    const drawn = (CHAMP_BOARD.rows as unknown as BoardRow[]).map(venueAdjusted)
      .filter((r) => r.field).map((r) => {
        const ax = r.field!.axes as Record<string, FieldAxis>;
        const g = Object.fromEntries(["ovr", "atk", "def"].map((k) =>
          [k, licensedRead(ax[k])?.tier_gap ?? ax[k].tier_gap]));
        return { event_id: r.event_id, g, shape: shapeFromGaps(g) };
      });
    const cut = drawn.filter((r) => r.shape === "SPLIT" && (r.g.atk! <= 0 || r.g.def! <= 0));
    expect(cut.length).toBeGreaterThan(0);
    for (const r of cut) {
      const axis = r.g.atk! <= 0 ? "h" : "v";
      await expect(page.locator(`[data-testid="picker-row"][data-event="${r.event_id}"] [data-testid="shape-chip"]`))
        .toHaveAttribute("data-cut", axis);
    }
    await expect(page.locator(".sc-tear")).toHaveCount(cut.length);
    await expect(page.locator("[data-cut-withheld]")).toHaveCount(0);
    // the column header still says, once, that atk/def are indicative
    expect(await page.locator('[data-testid="col-floor"]').count()).toBeGreaterThan(0);
  });

/* ══ THE HEAD-TO-HEAD ON A CLUB CARD (2026-09-25) ═════════════════════
 *  The national card's compact "h2h 0-0-1", in the same slot, style and
 *  component (PickerColumn.H2hStat), off the club row's own `h2h` — the
 *  national block's shape, `tally` keyed by THIS fixture's home/away. */
type ClubH2h = { available: boolean; source: string | null; reason?: string | null;
  window: { from?: string; label?: string } | null;
  tally: { home: number; draw: number; away: number } };
type ClubRow = { event_id: string; fav_side: "home" | "away"; favourite: string; h2h: ClubH2h };
const CLUB_ROWS = CLUB_H2H_BOARD.rows as unknown as ClubRow[];
const clubItem = (page: Page, id: string) =>
  page.locator(`[data-testid="picker-row"][data-event="${id}"] [data-testid="h2h"]`);

test.describe("a club card carries the head-to-head, as a national card does", () => {
  test("a pairing that met: favourite won-drew-lost, and the window on hover",
    async ({ page }) => {
      await clubBoard(page);
      const met = CLUB_ROWS.filter((r) => r.h2h.tally.home + r.h2h.tally.draw + r.h2h.tally.away > 0);
      expect(met.length).toBeGreaterThan(5);
      for (const r of met) {
        const t = r.h2h.tally, opp = r.fav_side === "home" ? "away" : "home";
        const item = clubItem(page, r.event_id);
        await expect(item).toHaveText(`h2h ${t[r.fav_side]}-${t.draw}-${t[opp]}`);
        // the window is the backend's, stated per pairing — never typed here
        await expect(item).toHaveAttribute("title",
          `previous meetings in our match corpus, ${r.h2h.window!.label}: ${r.favourite} won ${t[r.fav_side]}, drew ${t.draw}, lost ${t[opp]}`);
      }
    });

  test("the same slot, the same classes as the national item", async ({ browser }) => {
    const a = await browser.newPage(), b = await browser.newPage();
    await clubBoard(a);
    await nationalBoard(b);
    const read = (p: Page) => p.locator('[data-testid="picker-row"] [data-testid="h2h"]').first()
      .evaluate((e) => ({ cls: e.className, inner: e.firstElementChild?.className,
        // its neighbour to the left is the stats line's previous item
        parent: e.parentElement?.className }));
    expect(await read(a)).toEqual(await read(b));
    await a.close(); await b.close();
  });

  test("a measured absence over the window says so; a refused club and an older "
     + "board draw nothing", async ({ page }) => {
    const none = CLUB_ROWS.find((r) => !r.h2h.available && r.h2h.window)!;
    expect(none, "the recording holds a measured absence").toBeTruthy();
    // the corpus REFUSED a club (ambiguous/unknown): the recorded block, on a
    // recorded refusal, moved onto one ranked row
    const refusedBlock = (CLUB_H2H_BOARD.refusals as unknown as Array<{ h2h: ClubH2h }>)
      .find((r) => r.h2h.window === null)!.h2h;
    expect(refusedBlock.reason).toMatch(/did not resolve to one corpus club/);
    const board = JSON.parse(JSON.stringify(CLUB_H2H_BOARD));
    const target = board.rows.find((r: ClubRow) => r.h2h.available);
    target.h2h = refusedBlock;
    await clubBoard(page, board);
    const item = clubItem(page, none.event_id);
    const since = /^(\d{4})-(\d{2})/.exec(none.h2h.window!.from!)!;
    await expect(item).toHaveText(`h2h none since ${since[1]}-${since[2]}`);
    await expect(item).toHaveAttribute("title", none.h2h.reason!);
    await expect(clubItem(page, target.event_id)).toHaveCount(0);
    // a board built before the key: no item anywhere, never a blank one
    await page.goto("about:blank");
    await routeEight(page, BOARD_EIGHT);
    await page.goto("/bet-suggester");
    await page.waitForSelector('[data-testid="picker-row"]');
    await expect(page.locator('[data-testid="picker-row"] [data-testid="h2h"]')).toHaveCount(0);
  });
});

/* ══ NATIONAL ATTACK AND DEFENCE AT THE LICENSED BAND COUNT ═══════════
 *  The backend serves each axis's cut at the count its resolution licenses
 *  (`field.axes.atk|def.licensed`) beside the declared five; the card draws
 *  that one, in the club card's own "2v3" format. */
test("national attack and defence are drawn at the licensed count, in the club format",
  async ({ page }) => {
    await nationalBoard(page);
    type Side = { tier: number; tier_set: number[] };
    type Ax = { fav: Side; opp: Side; licensed?: { bands: number; fav?: Side; opp?: Side } | null };
    const rows = (CHAMP_BOARD.rows as unknown as BoardRow[]).map(venueAdjusted) as unknown as
      Array<{ event_id: string; field?: { axes: Record<string, Ax> } | null }>;
    let differs = 0;
    for (const r of rows.filter((x) => x.field)) {
      for (const k of ["atk", "def"] as const) {
        const a = r.field!.axes[k], l = a.licensed;
        if (!l?.fav || !l?.opp) continue;
        const cell = page.locator(`[data-testid="picker-row"][data-event="${r.event_id}"] [data-tier="${k}"]`);
        await expect(cell.locator(`[data-tier-pair="${k}"]`)).toHaveText(`${l.fav.tier}v${l.opp.tier}`);
        await expect(cell).toHaveAttribute("data-bands", String(l.bands));
        if (l.fav.tier !== a.fav.tier || l.opp.tier !== a.opp.tier) differs += 1;
      }
      // overall stays on the declared five
      await expect(page.locator(`[data-testid="picker-row"][data-event="${r.event_id}"] [data-tier="ovr"]`))
        .not.toHaveAttribute("data-bands", /.*/);
    }
    // non-vacuity: the recording holds pairs the licensed cut moves
    expect(differs).toBeGreaterThan(0);
  });

/* ══ A DISPUTED RESULT IS NOT A LETTER (backend 2026-09-25) ═══════════
 *  Where ESPN's and API-Football's scores give different W/D/L, the form
 *  string carries "?" and the cell is drawn as unknown — never in a
 *  verdict colour. */
test("a result the providers dispute is drawn as unknown, not as W, D or L",
  async ({ page }) => {
    await nationalBoard(page);
    const rows = CHAMP_BOARD.rows as unknown as Array<{ event_id: string;
      form?: { fav?: string; opp?: string } | null }>;
    const hit = rows.filter((r) => `${r.form?.fav ?? ""}${r.form?.opp ?? ""}`.includes("?"));
    expect(hit.length, "the recording holds a disputed result").toBeGreaterThan(0);
    const cells = page.locator('[data-testid="form-strip"] i[data-r="?"]');
    expect(await cells.count()).toBeGreaterThan(0);
    for (const c of await cells.all()) {
      await expect(c).toHaveClass(/border-dashed/);
      await expect(c).not.toHaveClass(/bg-up|bg-neg|bg-line-strong/);
      await expect(c).toHaveAttribute("title", /disputed/);
    }
  });

/* ══ A LEAGUE CARD WITH FIELD RANKS GETS THE #, AND LOSES THE (i) ═════
 *  (operator, 2026-09-25: "I don't need that info in the (i)"). The row's
 *  `field_rank` is the backend's confirmed shape (src/picker/field_rank.py
 *  on board-data-gaps, 2026-09-25; not yet in a recording): {size, axes:
 *  {ovr|atk|def: {fav|opp: {rank} | null}}}. The ranks below are the test's own, on a
 *  recorded row; nothing else on the row is touched. */
test("a league row carrying field_rank draws the # (the same panel) and no (i); "
   + "a row without it is unchanged", async ({ page }) => {
    const board = JSON.parse(JSON.stringify(CLUB_H2H_BOARD));
    const row = board.rows[0];
    const other = board.rows[1];
    delete other.field_rank;   // an older board: no key at all
    row.field_rank = { size: 154, axes: {
      ovr: { fav: { rank: 21 }, opp: { rank: 25 } },
      atk: { fav: { rank: 48 }, opp: { rank: 83 } },
      def: { fav: { rank: 18 }, opp: null } } };   // a side the field cannot place
    const bare = board.rows[2];
    bare.field_rank = { size: 154, axes: { ovr: { fav: { rank: 3 }, opp: { rank: 9 } },
      atk: { fav: null, opp: null } } };             // nothing placed on this axis
    await clubBoard(page, board);
    const card = page.locator(`[data-testid="picker-row"][data-event="${row.event_id}"]`);
    await expect(card.getByTestId("tier-read")).toHaveCount(0);
    const open = card.getByTestId("field-ranks-open");
    await expect(open).toHaveAttribute("data-size", "154");
    await expect(open).toHaveAttribute("data-axes", "ovr,atk,def");
    await open.click();
    const panel = card.getByTestId("field-ranks");
    await expect(panel.locator('[data-rank-axis="ovr"]')).toHaveText(/ovr\s*#21v#25/i);
    await expect(panel.locator('[data-rank-axis="atk"]')).toHaveText(/atk\s*#48v#83/i);
    // a side the field cannot place is a dash, never 0; the domestic key
    // carries no floor flag, so no dagger either
    await expect(panel.locator('[data-rank-axis="def"]')).toHaveText(/def\s*#18v\u2014/i);
    await expect(panel.getByTestId("field-floor-mark")).toHaveCount(0);
    // an axis with neither side placed is not drawn
    await expect(page.locator(`[data-testid="picker-row"][data-event="${bare.event_id}"] [data-testid="field-ranks-open"]`))
      .toHaveAttribute("data-axes", "ovr");
    // the league read is untouched: its own tier pairs, its own rank pair
    for (const k of ["ovr", "atk", "def"] as const) {
      await expect(card.locator(`[data-tier-pair="${k}"]`))
        .toHaveText(`${row.tiers[k][0]}v${row.tiers[k][1]}`);
    }
    await expect(card.getByTestId("rank-pair")).toHaveAttribute("data-basis", "league");
    // and a row without the key is the card it always was
    const plain = page.locator(`[data-testid="picker-row"][data-event="${other.event_id}"]`);
    await expect(plain.getByTestId("tier-read")).toHaveCount(1);
    await expect(plain.getByTestId("field-ranks-open")).toHaveCount(0);
  });

test("the recorded field_rank reads as the backend's own reference pairing",
  async ({ page }) => {
    /* backend 585d813f's reference values, read off the RECORDING rather
       than typed: Nottingham Forest (fav) ovr 21, atk 48, def 18; Crystal
       Palace ovr 25, atk 83, def 16, of 154 */
    type FR = { size: number; axes: Record<string, { fav: { rank: number } | null;
      opp: { rank: number } | null } | null> };
    const r = (CLUB_H2H_BOARD.rows as unknown as Array<{ event_id: string;
      favourite: string; opponent: string; field_rank?: FR }>)
      .find((x) => x.favourite === "Nottingham Forest" && x.opponent === "Crystal Palace")!;
    expect(r.field_rank!.size).toBe(154);
    await clubBoard(page);
    const card = page.locator(`[data-testid="picker-row"][data-event="${r.event_id}"]`);
    await expect(card.getByTestId("tier-read")).toHaveCount(0);
    await card.getByTestId("field-ranks-open").click();
    for (const k of ["ovr", "atk", "def"]) {
      const a = r.field_rank!.axes[k]!;
      await expect(card.locator(`[data-rank-axis="${k}"]`))
        .toHaveText(new RegExp(`${k}\\s*#${a.fav!.rank}v#${a.opp!.rank}`, "i"));
    }
  });

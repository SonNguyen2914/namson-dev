import { expect, test, type Page } from "@playwright/test";

import { COMP_NEWS_FIXTURES, COMP_NEWS_KEY, NEWS_ROW }
  from "./comp-news-recorded";

// AN ABSENCE LIST IS AN OBJECT, AND AN UNREAD ONE IS NOT "NONE"
// (audit 2026-09-28, frontend 8e7b335 / backend e40efef1).
//
// THE DEFECT. The competition viewer tested
//
//     f.news && (f.news.absences?.length ?? 0) > 0
//
// and the backend sends `absences` as an OBJECT — `{provider, records,
// record_count, stored_records, freshness, …}` (team_news.fixture_news).
// An object has no `length`, so "N reported absence(s)" could not render
// for any fixture, ever: seven players listed out on a recorded
// production read drew exactly what a fixture with no read at all drew.
//
// THE TWO HALVES, KEPT APART. A count now comes off `records`, and only
// players the provider STILL lists are counted. And the states that
// carry no count are not collapsed: an EMPTY list is the provider
// listing no one — which the backend itself says is not evidence nobody
// is out — while a failed fetch, a fixture never captured and a dormant
// plane are all UNKNOWN. None of them is drawn as a zero.
//
// EVERY PAYLOAD HERE IS THE WIRE'S (e2e/comp-news-recorded.ts): the
// Leagues Cup fixtures route as captured, each row's `news` block the
// backend's own fixture_news() output — nothing typed in this file but
// the one variant the backend's own `meaning` failure shape supplies.

type Row = (typeof COMP_NEWS_FIXTURES)["fixtures"][number];

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

const rowOf = (id: number): Row => {
  const r = COMP_NEWS_FIXTURES.fixtures.find((f) => f.fixture_id === id);
  if (!r) throw new Error(`recorded row ${id} is missing`);
  return r;
};

/** The fields of a row's absence block these tests read. The recorded
 *  rows differ in shape (the dormant one has no `absences` at all), so
 *  the read is narrowed here, once, and throws on a row without one. */
type Absences = {
  records: { player_name: string; still_reported: boolean | null }[];
  record_count: number | null;
  freshness: { state: string };
};
const absencesIn = (id: number): Absences => {
  const a = (rowOf(id).news as { absences?: Absences }).absences;
  if (!a) throw new Error(`recorded row ${id} carries no absence block`);
  return a;
};

async function open(page: Page, body: unknown = COMP_NEWS_FIXTURES) {
  // HERMETIC: everything this page reads besides the fixtures — markets,
  // the field, the tournament — answers a named 503 from here, never a
  // backend. Registered first so the fixtures route below wins.
  await page.route("**/api/**", (r) =>
    r.fulfill(json({ detail: "not served in this recorded world" }, 503)));
  await page.route(`**/api/comp/${COMP_NEWS_KEY}/fixtures**`,
    (r) => r.fulfill(json(body)));
  await page.goto(`/bet-suggester/comp/${COMP_NEWS_KEY}`);
  await expect(page.getByRole("heading", { level: 1 }))
    .toHaveText(COMP_NEWS_FIXTURES.display);
}

/** The row's absence line, with its <details> opened. */
async function absencesOf(page: Page, id: number) {
  const r = rowOf(id);
  const row = page.locator("details").filter({
    has: page.locator("summary",
      { hasText: `${r.home.name} v ${r.away.name}` }),
  });
  await expect(row).toHaveCount(1);
  // the row's OWN summary — MarketVsRead nests a <details> inside
  await row.locator(":scope > summary").click();
  return row.getByTestId("comp-absences");
}

test("a read that LISTED players says how many and who — the line that "
   + "could never render", async ({ page }) => {
    await open(page);
    const line = await absencesOf(page, NEWS_ROW.ok);
    await expect(line).toBeVisible();
    await expect(line).toHaveAttribute("data-absence-state", "listed");
    // derived from the payload beside it, never typed: the players the
    // provider still lists
    const recs = absencesIn(NEWS_ROW.ok).records;
    const current = recs.filter((x) => x.still_reported !== false);
    expect(current.length, "the recorded read lists players").toBeGreaterThan(1);
    await expect(line).toContainText(`${current.length} reported absences`);
    for (const x of current) await expect(line).toContainText(x.player_name);
    // the RAW record_count double-counts API-Football's duplicated rows
    // (14 records for 7 players here) — that is not the number of absences
    const raw = absencesIn(NEWS_ROW.ok).record_count;
    expect(raw).not.toBe(current.length);
    await expect(line).not.toContainText(`${raw} reported`);
  });

test("a player the provider stopped listing is not counted as out",
  async ({ page }) => {
    await open(page);
    const line = await absencesOf(page, NEWS_ROW.retraction);
    const recs = absencesIn(NEWS_ROW.retraction).records;
    const gone = recs.filter((x) => x.still_reported === false);
    const still = recs.filter((x) => x.still_reported !== false);
    expect(gone.length, "the recording carries a retraction").toBe(1);
    await expect(line).toHaveAttribute("data-absence-state", "listed");
    await expect(line).toContainText("1 reported absence ");
    await expect(line).toContainText("1 no longer listed");
    await expect(line).toContainText(still[0].player_name);
    await expect(line).not.toContainText(gone[0].player_name);
  });

test("an EMPTY list is the provider listing no one — said as that, never "
   + "as a zero and never as 'nobody is out'", async ({ page }) => {
    await open(page);
    const line = await absencesOf(page, NEWS_ROW.empty);
    expect(absencesIn(NEWS_ROW.empty).freshness.state)
      .toBe("empty");
    await expect(line).toHaveAttribute("data-absence-state", "none_listed");
    await expect(line).toContainText("the provider lists no absences");
    await expect(line).toContainText("not a claim that nobody is out");
    await expect(line).not.toContainText(/\b0\b/);
    await expect(line).not.toContainText("unknown");
  });

for (const [which, why] of [
  ["unavailable", "the provider could not be read"],
  ["never_captured", "not captured yet"],
  ["dormant", "the team-news plane is off"],
] as const) {
  test(`${which}: a read nobody could make is UNKNOWN, not none — `
     + "and not a zero", async ({ page }) => {
      await open(page);
      const line = await absencesOf(page, NEWS_ROW[which]);
      await expect(line).toHaveAttribute("data-absence-state", "unknown");
      await expect(line).toContainText(why);
      await expect(line).toContainText("Not the same as none reported");
      // …and neither of the two sentences a read that ANSWERED earns
      await expect(line).not.toContainText("reported absence");
      await expect(line).not.toContainText("lists no absences");
      await expect(line).not.toContainText(/\b0\b/);
    });
}

test("the absence line is not hidden behind a `meaning` that failed to "
   + "build", async ({ page }) => {
    // The line lived inside the `meaning` box, so any fixture whose
    // meaning failed lost its absences with it. The failure shape is the
    // backend's own (src/competitions.py: `{"available": False,
    // "reason": type(exc).__name__}`).
    const ok = rowOf(NEWS_ROW.ok);
    await open(page, {
      ...COMP_NEWS_FIXTURES,
      fixtures: [{ ...ok, meaning: { available: false, reason: "KeyError" } }],
    });
    const line = await absencesOf(page, NEWS_ROW.ok);
    await expect(line).toBeVisible();
    await expect(line).toHaveAttribute("data-absence-state", "listed");
  });

test("a fixture with no news block draws no absence line at all",
  async ({ page }) => {
    // THE NON-VACUITY HALF. The backend attaches `news` only inside 48h;
    // a row without it is not a read, and inventing "unknown" for every
    // distant fixture would be noise with no read behind it.
    const bare = { ...rowOf(NEWS_ROW.ok) } as Partial<Row>;
    delete bare.news;
    await open(page, { ...COMP_NEWS_FIXTURES, fixtures: [bare] });
    const r = rowOf(NEWS_ROW.ok);
    const row = page.locator("details").filter({
      has: page.locator("summary",
        { hasText: `${r.home.name} v ${r.away.name}` }),
    });
    await row.locator(":scope > summary").click();
    await expect(row.getByText(/group phase|advance/i).first()).toBeVisible();
    await expect(row.getByTestId("comp-absences")).toHaveCount(0);
  });

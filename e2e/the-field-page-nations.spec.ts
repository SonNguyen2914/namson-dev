// THE FIELD PAGE'S THIRD MODE — "National teams" (approved 2026-09-24).
//
// The four Championships competitions — UEFA and CONCACAF Nations
// Leagues, the Arabian Gulf Cup (the AFC Asian Cup's place since
// 2026-09-25), AFCON qualifying — one table each, drawn on
// ONE SHARED AXIS because all four are cut from one national-team corpus
// at one pass count. GET /api/field/nations.
//
// HERMETIC. The three field reads are answered from recordings of the
// backend's own output (`nations-recorded.ts`, `field-page-recorded.ts`);
// every other /api/ read is a named 503. Nothing here reaches a backend
// except the one unmocked proxy check at the bottom, which reads the
// hold-out's echo and not a backend answer.
//
// WHAT IS UNDER GUARD:
//   a  three segments, Leagues | Cups | National teams; the choice is
//      remembered; the Leagues and Cups views NEVER ask /api/field/nations
//   b  the pills: the four competitions in the payload's (the operator's)
//      order, the first alone lit, each on its own --lg-* light, select
//      all / deselect all
//   c  ONE SHARED AXIS across every table shown, on the span of the
//      selected competitions' full bands — and a per-table axis the day
//      the backend says the four are not one measurement
//   d  every figure the lede and the tag state is the payload's: pass
//      count, match count, window — never a typed 10
//   e  a team absent on an axis is NAMED under its table, never filled
//   f  the "no bridge" chip is on exactly the rows that carry the caveat,
//      with the payload's own sentence on hover
//   g  the ≥2 note, the empty states, a failed read named
//
// Regenerating the recording: in the backend worktree (last taken on
// `board-data-gaps`, 2026-09-25), write GET /api/field/nations through
// FastAPI's TestClient to a file and trim it by the rule in
// nations-recorded.ts's header (drop rows only).
import { expect, test, type Page, type Request } from "@playwright/test";

import { CUPS, LEAGUES } from "./field-page-recorded";
import { NATIONS } from "./nations-recorded";
import { expectForwarded } from "./proxy-forwarding";
import { auditFloor } from "./the-touch-floor";
import type {
  NationCompetition, NationFields, NationRow,
} from "../src/lib/fieldPageApi";

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

/** Every request the page made for the national read, recorded. */
type Asked = { nations: string[] };

async function serve(page: Page, nations: unknown = NATIONS,
                     opts: { nationsStatus?: number } = {}): Promise<Asked> {
  const asked: Asked = { nations: [] };
  page.on("request", (r: Request) => {
    if (new URL(r.url()).pathname === "/api/field/nations") asked.nations.push(r.url());
  });
  await page.route("**/api/**", (r) => r.fulfill(json({
    detail: "the-field-page-nations answers every non-field read itself",
  }, 503)));
  await page.route("**/api/field/leagues", (r) => r.fulfill(json(LEAGUES)));
  await page.route("**/api/field/cups", (r) => r.fulfill(json(CUPS)));
  await page.route("**/api/field/nations", (r) =>
    r.fulfill(json(nations, opts.nationsStatus ?? 200)));
  return asked;
}

async function toNations(page: Page) {
  await page.getByTestId("mode-nations").click();
  await expect(page.getByTestId("nation-table").first()).toBeVisible();
}

async function openNations(page: Page, nations: unknown = NATIONS) {
  const asked = await serve(page, nations);
  await page.goto("/bet-suggester/ratings");
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  await toNations(page);
  return asked;
}

const comps = (p: NationFields = NATIONS) => p.competitions;
const byKey = (k: string) => comps().find((c) => c.key === k)!;
const pill = (page: Page, k: string) =>
  page.locator(`[data-testid="nation-pill"][data-key="${k}"]`);
const section = (page: Page, k: string) =>
  page.locator(`[data-testid="nation-section"][data-nation="${k}"]`);

/** The full band a row's bar is placed by, as the page reads it. */
const crossOf = (r: NationRow) => ({
  lo: r.lo_cross_confederation ?? r.lo, hi: r.hi_cross_confederation ?? r.hi,
});
/** The span of every full band on one axis of the given competitions. */
function spanOf(cs: NationCompetition[], axis = "overall") {
  const rs = cs.flatMap((c) => c.axes[axis].rows).map(crossOf)
    .filter((b) => b.lo != null && b.hi != null) as { lo: number; hi: number }[];
  return { lo: Math.min(...rs.map((b) => b.lo)), hi: Math.max(...rs.map((b) => b.hi)) };
}
const leftOf = (page: Page, k: string, team: string) =>
  section(page, k).locator(`[data-testid="nation-row"][data-team="${team}"]`)
    .getByTestId("bar-point")
    .evaluate((e) => parseFloat((e as HTMLElement).style.left));

// ═════════════════════════ a · the switch ══════════════════════════════

test("THREE SEGMENTS: Leagues | Cups | National teams, and the third draws "
   + "the national field", async ({ page }) => {
  await serve(page);
  await page.goto("/bet-suggester/ratings");
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  const seg = page.locator('[role="group"][aria-label="what the page rates"] button');
  await expect(seg).toHaveCount(3);
  expect((await seg.allInnerTexts()).map((t) => t.toLowerCase()))
    .toEqual(["leagues", "cups", "national teams"]);
  await toNations(page);
  await expect(page.getByTestId("mode-nations")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("mode-leagues")).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("mode-cups")).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("field-table")).toHaveCount(0);
  await expect(page.getByTestId("cup-table")).toHaveCount(0);
  // and back: each view is the one it was
  await page.getByTestId("mode-cups").click();
  await expect(page.getByTestId("cup-table").first()).toBeVisible();
  await expect(page.getByTestId("nation-table")).toHaveCount(0);
});

test("the National teams choice is REMEMBERED across a reload", async ({ page }) => {
  await openNations(page);
  await page.reload();
  await expect(page.getByTestId("nation-table").first()).toBeVisible();
  await expect(page.getByTestId("mode-nations")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("mode-leagues").click();
  await page.reload();
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  await expect(page.getByTestId("nation-table")).toHaveCount(0);
});

test("the Leagues and Cups views NEVER call /api/field/nations; the first "
   + "visit to National teams calls it once", async ({ page }) => {
  const asked = await serve(page);
  await page.goto("/bet-suggester/ratings");
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  await page.getByTestId("mode-cups").click();
  await expect(page.getByTestId("cup-table").first()).toBeVisible();
  await page.getByTestId("mode-leagues").click();
  await expect(page.getByTestId("field-table").first()).toBeVisible();
  await page.getByTestId("mode-cups").click();
  await expect(page.getByTestId("cup-table").first()).toBeVisible();
  await page.waitForTimeout(500);
  expect(asked.nations, "a Leagues/Cups view asked for the national read")
    .toEqual([]);
  await toNations(page);
  await page.getByTestId("mode-leagues").click();
  await toNations(page);
  expect(asked.nations).toHaveLength(1);
});

// ═════════════════════════ b · the pills ════════════════════════════════

test("FOUR PILLS in the payload's order, the first alone lit, each on its "
   + "own light", async ({ page }) => {
  await openNations(page);
  const pills = page.getByTestId("nation-pill");
  await expect(pills).toHaveCount(comps().length);
  expect(await pills.evaluateAll((els) => els.map((e) => e.getAttribute("data-key"))))
    .toEqual(comps().map((c) => c.key));
  expect(comps().map((c) => c.key)).toEqual(["unl", "cnl", "gulfcup", "afcon"]);
  // the arrival reveal settles first, then every label reads whole
  await expect(page.locator('[data-churn="1"]')).toHaveCount(0, { timeout: 5000 });
  for (const [i, c] of comps().entries()) {
    await expect(pill(page, c.key)).toHaveAttribute("aria-pressed", i === 0 ? "true" : "false");
    await expect.poll(() => pill(page, c.key).evaluate((e) => Array.from(
      e.querySelectorAll("[data-cell]")).map((x) => x.textContent).join("")))
      .toBe(c.display);
  }
  // THE LIGHT IS THE TOKEN: each dot resolves to its --lg-* value, four
  // distinct lights, none of them the brand gold every unknown key gets
  const tokens = await page.evaluate((keys) => keys.map((k) =>
    getComputedStyle(document.documentElement).getPropertyValue(`--lg-${k}`).trim()),
  comps().map((c) => c.key));
  expect(tokens).toEqual(["#8192fd", "#ed5edf", "#95d147", "#e699cc"]);
  const dots = await pills.evaluateAll((els) => els.map((e) =>
    getComputedStyle(e.querySelector('[data-testid="pill-dot"]')!).backgroundColor));
  expect(dots).toEqual(["rgb(129, 146, 253)", "rgb(237, 94, 223)",
    "rgb(149, 209, 71)", "rgb(230, 153, 204)"]);
  await expect(page.getByTestId("nation-section")).toHaveCount(1);
  await expect(section(page, "unl")).toBeVisible();
  // a pill toggles its own table
  await pill(page, "afcon").click();
  expect(await page.getByTestId("nation-section").evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-nation")))).toEqual(["unl", "afcon"]);
  await pill(page, "unl").click();
  expect(await page.getByTestId("nation-section").evaluateAll((els) =>
    els.map((e) => e.getAttribute("data-nation")))).toEqual(["afcon"]);
});

test("select all / deselect all says what a press will do, and empties to a "
   + "named state", async ({ page }) => {
  await openNations(page);
  const all = page.getByTestId("nation-select-all");
  await expect(all).toHaveText("select all");
  await expect(all).not.toHaveAttribute("aria-pressed", /.*/);
  await all.click();
  await expect(page.getByTestId("nation-section")).toHaveCount(comps().length);
  await expect(all).toHaveText("deselect all");
  const total = comps().reduce((n, c) => n + c.axes.overall.rows.length, 0);
  await expect(page.getByTestId("nation-count")).toHaveText(`${total} of ${total} teams`);
  await all.click();
  await expect(page.getByTestId("nation-section")).toHaveCount(0);
  await expect(page.getByTestId("nation-empty"))
    .toContainText("No competition selected");
  await expect(page.getByTestId("nation-count")).toHaveText("0 of 0 teams");
});

// ═════════════════════════ c · one shared axis ═══════════════════════════

test("ONE SHARED AXIS: with all four selected every bar sits on the span of "
   + "all four competitions' full bands", async ({ page }) => {
  await openNations(page);
  await page.getByTestId("nation-select-all").click();
  const { lo, hi } = spanOf(comps());
  // NON-VACUITY: the competitions' own spans differ, so a per-table axis
  // would put at least one of these points somewhere else
  const own = comps().map((c) => spanOf([c]));
  expect(new Set(own.map((s) => `${s.lo}:${s.hi}`)).size).toBe(comps().length);
  for (const c of comps()) {
    for (const r of c.axes.overall.rows) {
      const want = ((r.value as number) - lo) / (hi - lo) * 100;
      expect(await leftOf(page, c.key, r.team), `${c.key}/${r.team}`)
        .toBeCloseTo(want, 1);
    }
  }
  // the Gulf Cup's leader sits where the SHARED axis puts it — well away
  // from where an axis of the Gulf Cup's own would
  const ac = byKey("gulfcup");
  const top = ac.axes.overall.rows[0];
  const alone = spanOf([ac]);
  const perTable = ((top.value as number) - alone.lo) / (alone.hi - alone.lo) * 100;
  expect(Math.abs(await leftOf(page, "gulfcup", top.team) - perTable))
    .toBeGreaterThan(5);
});

test("the axis follows the SELECTION: two competitions share the span of "
   + "those two, on attack as on overall", async ({ page }) => {
  await openNations(page);
  await pill(page, "gulfcup").click();
  await page.locator('[data-testid="nation-axis-button"][data-axis="attack"]').click();
  const two = [byKey("unl"), byKey("gulfcup")];
  const { lo, hi } = spanOf(two, "attack");
  for (const c of two) {
    for (const r of c.axes.attack.rows) {
      expect(await leftOf(page, c.key, r.team), `${c.key}/${r.team}`)
        .toBeCloseTo(((r.value as number) - lo) / (hi - lo) * 100, 1);
    }
  }
});

test("…and the day the backend says the four are NOT one measurement, each "
   + "table owns its axis and the note says so", async ({ page }) => {
  const p = clone(NATIONS);
  p.shared_axis = { same_corpus: true, same_passes: false, one_measurement: false };
  await openNations(page, p);
  await page.getByTestId("nation-select-all").click();
  await expect(page.getByTestId("nations-split-note")).toContainText("not one measurement");
  await expect(page.getByTestId("nations-comparable")).toContainText("not one measurement");
  for (const c of comps(p)) {
    const { lo, hi } = spanOf([c]);
    const r = c.axes.overall.rows[0];
    expect(await leftOf(page, c.key, r.team))
      .toBeCloseTo(((r.value as number) - lo) / (hi - lo) * 100, 1);
  }
});

test("the ≥2 note is there only at TWO OR MORE competitions", async ({ page }) => {
  await openNations(page);
  const note = page.getByTestId("nations-split-note");
  await expect(note).toHaveCount(0);
  await pill(page, "cnl").click();
  await expect(note).toContainText("2 competitions, one measurement.");
  await pill(page, "afcon").click();
  await expect(note).toContainText("3 competitions, one measurement.");
  await pill(page, "unl").click();
  await pill(page, "cnl").click();
  await expect(note).toHaveCount(0);
});

// ═════════════════════════ d · the fit is the payload's ═══════════════════

test("the pass count, match count and window are READ, never typed",
  async ({ page }) => {
    await openNations(page);
    const n = NATIONS;
    await expect(page.getByTestId("field-tag")).toContainText(`${n.passes} passes`);
    await expect(page.getByTestId("field-tag")).toContainText("four competitions");
    await expect(page.getByTestId("nations-passes")).toHaveText(`${n.passes} passes`);
    await expect(page.getByTestId("nations-corpus"))
      .toContainText(`${n.fixtures!.toLocaleString("en-US")} internationals`);
    await expect(page.getByTestId("nations-corpus"))
      .toContainText(`from ${n.window!.start!.slice(0, 4)}`);
    await expect(page.getByTestId("nations-comparable"))
      .toContainText(`${n.friendly_only_bridge_teams} teams meet another confederation`);
    await expect(section(page, "unl").getByTestId("nation-note"))
      .toContainText(`${byKey("unl").passes} passes`);
    // and 10 — the v1 count the prototype printed — is nowhere unless served
    expect(n.passes).not.toBe(10);
    await expect(page.locator("main")).not.toContainText("10 passes");
  });

test("…so a payload at another count and window says THAT", async ({ page }) => {
  const p = clone(NATIONS);
  p.passes = 7;
  p.fixtures = 1234;
  p.window = { start: "2020-01-01", end: "2026-01-31" };
  for (const c of p.competitions) { c.passes = 7; c.axes.overall.passes = 7; }
  await openNations(page, p);
  await expect(page.getByTestId("field-tag")).toContainText("7 passes");
  await expect(page.getByTestId("nations-passes")).toHaveText("7 passes");
  await expect(page.getByTestId("nations-corpus")).toContainText("1,234 internationals from 2020");
  await expect(section(page, "unl").getByTestId("nation-note")).toContainText("7 passes");
});

// ═════════════════════════ e · not measured, named ═══════════════════════

test("a team with no figure on an axis is NAMED under its table, never filled",
  async ({ page }) => {
    await openNations(page);
    const named = comps().flatMap((c) => c.not_measured.map((m) => ({ c, m })));
    expect(named.length, "the recording names an unmeasured team").toBeGreaterThan(0);
    await page.getByTestId("nation-select-all").click();
    // overall: nobody is missing, so no line
    await expect(page.getByTestId("nation-absent")).toHaveCount(0);
    for (const axis of ["attack", "defence"]) {
      await page.locator(`[data-testid="nation-axis-button"][data-axis="${axis}"]`).click();
      for (const { c, m } of named) {
        const line = section(page, c.key).getByTestId("nation-absent");
        await expect(line).toContainText(`${m.team} has no ${axis}.`);
        await expect(line).toContainText(m.why);
        await expect(line).toContainText("Named, not filled.");
        await expect(section(page, c.key)
          .locator(`[data-testid="nation-row"][data-team="${m.team}"]`)).toHaveCount(0);
      }
    }
  });

// ═════════════════════════ f · the no-bridge chip ═════════════════════════

test("the NO BRIDGE chip is on exactly the rows that carry the caveat, with "
   + "the payload's own sentence", async ({ page }) => {
  await openNations(page);
  await page.getByTestId("nation-select-all").click();
  let seen = 0;
  for (const c of comps()) {
    for (const r of c.axes.overall.rows) {
      const tr = section(page, c.key).locator(`[data-testid="nation-row"][data-team="${r.team}"]`);
      const has = (r.caveats ?? []).includes("band_from_zero_bridges");
      await expect(tr.locator('[data-caveat="band_from_zero_bridges"]'), `${c.key}/${r.team}`)
        .toHaveCount(has ? 1 : 0);
      if (has) {
        seen += 1;
        await expect(tr.locator('[data-caveat="band_from_zero_bridges"]')).toHaveText("no bridge");
        const title = await tr.getByTestId("caveat-chip").first().getAttribute("title");
        expect(title).toContain(NATIONS.caveat_notes!.band_from_zero_bridges);
        await expect(tr.getByTestId("bridge-count")).toContainText(String(r.bridge_fixtures));
      }
    }
  }
  expect(seen, "the recording carries no-bridge rows").toBeGreaterThan(0);
});

test("the floor chip is on every below-floor row, and the goal axes say so "
   + "once in the header too", async ({ page }) => {
  await openNations(page);
  const unl = byKey("unl");
  await expect(section(page, "unl").getByTestId("floor-chip"))
    .toHaveCount(unl.axes.overall.rows.filter((r) => r.below_floor).length);
  await page.locator('[data-testid="nation-axis-button"][data-axis="attack"]').click();
  const bf = unl.axes.attack.rows.filter((r) => r.below_floor).length;
  expect(bf).toBe(unl.axes.attack.rows.length);
  await expect(section(page, "unl").getByTestId("floor-chip")).toHaveCount(bf);
  await expect(section(page, "unl").getByTestId("nation-note"))
    .toContainText("every team below the floor");
  /* RESTATED 2026-09-25, on the re-recording (backend 6bf7e06b reads
     attack and defence from shots). This asserted the licensed-cut line
     on UNL ATTACK, which was declared above its licence (4 of 5 bands).
     Read from shots it resolves 5.0 levels and is no longer above it, so
     the line must be ABSENT there — asserted — and PRESENT on UNL
     defence, which still is (3 of 5). Both conditions read off the
     payload, so neither is a typed band count. */
  expect(unl.axes.attack.declared_above_licence).toBe(false);
  await expect(section(page, "unl").getByTestId("nation-note"))
    .not.toContainText("bands its resolution licenses");
  expect(unl.axes.defence.declared_above_licence).toBe(true);
  await page.locator('[data-testid="nation-axis-button"][data-axis="defence"]').click();
  await expect(section(page, "unl").getByTestId("nation-note"))
    .toContainText(`tiered at the ${unl.axes.defence.bands_licensed} bands its resolution licenses`);
});

// ═════════════════════════ g · rows, search, failure ══════════════════════

test("rows are ranked by value; a search FINDS a team without renumbering it",
  async ({ page }) => {
    await openNations(page);
    const rows = [...byKey("unl").axes.overall.rows]
      .sort((a, b) => (b.value as number) - (a.value as number));
    expect(await section(page, "unl").getByTestId("nation-row")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-team"))))
      .toEqual(rows.map((r) => r.team));
    const last = rows[rows.length - 1];
    await page.getByLabel("find a team in the selected competitions").fill(last.team);
    await expect(section(page, "unl").getByTestId("nation-row")).toHaveCount(1);
    await expect(section(page, "unl").getByTestId("nation-row"))
      .toHaveAttribute("data-rank", String(rows.length));
    await page.getByLabel("find a team in the selected competitions").fill("zzzz");
    await expect(section(page, "unl")).toContainText("No team matches this filter.");
  });

test("a failed national read is NAMED, and the other two views still draw",
  async ({ page }) => {
    await serve(page, { detail: "national-team field unavailable: bytes refused" },
                { nationsStatus: 503 });
    await page.goto("/bet-suggester/ratings");
    await page.getByTestId("mode-nations").click();
    await expect(page.getByTestId("nations-read-error"))
      .toContainText("national-team field unavailable: bytes refused");
    await expect(page.getByTestId("nation-table")).toHaveCount(0);
    await page.getByTestId("mode-leagues").click();
    await expect(page.getByTestId("field-table").first()).toBeVisible();
  });

test("no decide vocabulary in the national view", async ({ page }) => {
  await openNations(page);
  await page.getByTestId("nation-select-all").click();
  const body = (await page.locator("main").innerText()).toLowerCase();
  for (const banned of ["you should", "cash out", "sell", "buy now",
    "bet on", "back the", "best pick", "take this", "value bet"]) {
    expect(body, banned).not.toContain(banned);
  }
});

test("the coarse-pointer 44px floor holds in the national view", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
    deviceScaleFactor: 3, reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await openNations(page);
  const a = await auditFloor(page);
  expect(a.census).toBeGreaterThan(10);
  expect(a.examples).toEqual([]);
  expect(a.pressFail).toBe(0);
  expect(a.theft).toBe(0);
  await ctx.close();
});

// ═════════════════════════ the proxy forwards it ══════════════════════════

test("the proxy forwards /api/field/nations — unmocked on purpose",
  async ({ request }) => {
    await expectForwarded(request, "field", "nations");
  });

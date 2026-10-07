/** EVERY COMPETITION ON THE TWO BOARDS HAS A MATCH HUB (2026-10-01).
 *
 *  Son's decision that day: "every competition needs match hubs". Four
 *  had one (MLS, EPL, La Liga, Liga MX); the other seven — Bundesliga,
 *  Serie A, Ligue 1, Eredivisie on the Leagues board, the UEFA and
 *  Concacaf Nations Leagues and AFCON on the Championships board — had a
 *  column and no page behind it. Their hubs read the generic per-match
 *  route `/api/comp/{key}/match/{event_id}` (TRIVELA `src/match_hubs.py`),
 *  which sends `model: null` beside a NAMED `model_refusal` and the
 *  board's frozen read, read only, under `board_read`.
 *
 *  HERMETIC. Every /api/ read is answered in the page; the payloads below
 *  are SYNTHETIC, written in that route's shape, and every fixture in
 *  them kicks off on or before 2026-09-27. No real result is read.
 *
 *  THE COMPETITION SET IS DERIVED, NEVER TYPED, in the last test: it is
 *  the two recorded boards' own declarations (`declarationOf`), the same
 *  door the landing page reads its columns through. */
import { test, expect, type Page } from "@playwright/test";
import { BOARD_EIGHT } from "./eight-columns";
import { CHAMP_BOARD, CHAMP_CLOCK } from "./championships-recorded";
import { expectForwarded } from "./proxy-forwarding";
import { declarationOf, type Board } from "../src/lib/pickerApi";
import { NO_MODEL_HUBS } from "../src/lib/compHub";
import { HUB_MATCH_KEYS } from "../src/lib/suggesterProxy";

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});

const SEVEN = Object.keys(NO_MODEL_HUBS) as Array<keyof typeof NO_MODEL_HUBS>;
const CHAMPS = new Set(["unl", "cnl", "afcon"]);

const REFUSAL = {
  state: "no_model_plane",
  // TRIVELA src/match_hubs.py NO_MODEL_WHY since hub-champ-fix (2026-10-06)
  why: "no shadow model is fitted for this competition, so no approval "
    + "decision exists and no shadow-model number appears on this page. The "
    + "trader's model line (`traders_model`), when served, is the trading "
    + "agent's own pre-match read — experimental, labelled tested or "
    + "untested, not an approved shadow model. The board's own pre-kickoff "
    + "read, when one was frozen, is under `board_read` — a read, not a "
    + "signal.",
  instead: "board_read", note: null,
};
const ABSENT_READ = {
  origin: "unavailable", origin_label: "NOT AVAILABLE",
  origin_note: "no pre-kickoff board read was frozen for this fixture",
  unavailable_reason: "not_frozen", store_read: "ok", state: null,
};
const CAPTURED_READ = {
  origin: "captured", origin_label: "CAPTURED",
  origin_note: "frozen from the live board before kickoff — this is what "
    + "the picker actually said",
  captured_at: "2026-09-19T08:00:00+00:00",
  captured_lead_band_means: "taken the day before kickoff",
  unavailable_reason: null, store_read: "ok", corrections: 0,
  state: { fav_side: "home" },
};

type State = "pre" | "in" | "post";
/** Synthetic, and every kickoff is on or before 2026-09-27. */
const WHEN: Record<State, { date: string; clock: string; detail: string }> = {
  pre: { date: "2026-09-27T18:00Z", clock: "2026-09-27T12:00:00Z", detail: "Sun, September 27th" },
  in: { date: "2026-09-26T18:00Z", clock: "2026-09-26T18:40:00Z", detail: "38'" },
  post: { date: "2026-09-20T18:00Z", clock: "2026-09-22T12:00:00Z", detail: "FT" },
};

function payload(key: string, state: State, extra: Record<string, unknown> = {}) {
  const w = WHEN[state];
  const scored = state !== "pre";
  return {
    competition: key, display: key, espn_league: "synthetic",
    match: {
      id: "990001", date: w.date, state, detail: w.detail,
      minute: state === "in" ? "38'" : undefined,
      venue: "Synthetic Ground",
      home: { name: "Northtown", abbrev: "NTH", score: scored ? "2" : undefined },
      away: { name: "Southport", abbrev: "STH", score: scored ? "1" : undefined },
      stats: scored ? [{ key: "possessionPct", label: "Possession", home: "55", away: "45" }] : [],
      events: scored ? [{ minute: "12'", type: "Goal", team: "NTH", text: "Goal", scoring: true }] : [],
      scouting: { last_five: [], head_to_head: [] },
    },
    book: null, books: [],
    book_meta: { status: "unavailable", means: "no Kalshi series lists this competition" },
    model: null, model_refusal: REFUSAL, board_read: ABSENT_READ,
    lineups: null,
    framing: "Shadow · not advice — a read, not a signal.",
    generated_at: w.clock,
    ...extra,
  };
}

async function openHub(page: Page, key: string, body: unknown, clock: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.clock.install({ time: new Date(clock) });
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route(`**/api/comp/${key}/match/990001`, (r) => r.fulfill(json(body)));
  await page.goto(`/bet-suggester/${key}/990001`);
  return errors;
}

for (const key of SEVEN) {
  for (const state of ["pre", "in", "post"] as State[]) {
    test(`${key} hub, ${state}: renders, names the absent model, advises nothing`, async ({ page }) => {
      const errors = await openHub(page, key, payload(key, state), WHEN[state].clock);
      const refusal = page.getByTestId("model-refusal");
      await expect(refusal).toBeVisible();
      await expect(refusal).toHaveAttribute("data-state", "no_model_plane");
      await expect(refusal).toContainText("no shadow model for this competition");
      await expect(refusal).not.toContainText("traders_model");
      // the payload's key never reaches the reader; words do
      await expect(refusal).not.toContainText("`");
      await expect(refusal).not.toContainText("board_read");
      await expect(page.getByTestId("board-read")).toHaveAttribute("data-origin", "unavailable");
      await expect(page.getByTestId("board-read")).toContainText("no board read on record");
      await expect(page.getByText("NTH vs STH").first()).toBeVisible();
      if (state !== "pre") {
        await expect(page.locator("body")).toContainText("2");
        await expect(page.locator("body")).toContainText("Possession");
      }
      await expect(page.locator("body")).toContainText("shadow · not advice");
      await expect(page.locator("body")).toContainText("a read, not a signal");
      await expect(page.getByText(/^TAKE$/)).toHaveCount(0);
      await expect(page.getByTestId("section-down")).toHaveCount(0);
      expect(errors, "the page threw").toEqual([]);
    });
  }
}

test("a captured board read is drawn with its label and clock, never its numbers", async ({ page }) => {
  const errors = await openHub(page, "bundesliga",
    payload("bundesliga", "post", { board_read: CAPTURED_READ }), WHEN.post.clock);
  const read = page.getByTestId("board-read");
  await expect(read).toHaveAttribute("data-origin", "captured");
  await expect(read).toContainText("CAPTURED");
  await expect(read).toContainText("taken the day before kickoff");
  await expect(read).toContainText("a read, not a signal");
  await expect(read).not.toContainText("fav_side");
  expect(errors).toEqual([]);
});

test("a hub whose payload is missing sections draws what it has and names what it lost", async ({ page }) => {
  // no stats, no events, no scouting, no sides, no book fields, and one
  // event that is not an object: the shape no section was written for
  const thin = payload("unl", "in");
  thin.match = { id: "990001", date: WHEN.in.date, state: "in",
    events: [null] } as unknown as typeof thin.match;
  delete (thin as Record<string, unknown>).books;
  delete (thin as Record<string, unknown>).board_read;
  const errors = await openHub(page, "unl", thin, WHEN.in.clock);
  await expect(page.getByTestId("model-refusal")).toBeVisible();
  await expect(page.getByTestId("board-read")).toContainText("no board read on record");
  // the page is still a page: its footer drew
  await expect(page.locator("body")).toContainText("no shadow model · trader's model where served");
  expect(errors, "a section's throw escaped its boundary").toEqual([]);
});

test("the trader's model line draws its 1X2 and says tested or untested (2026-10-06)", async ({ page }) => {
  const tm = { title: "trader's model (tested)", tested: true, available: true,
    label: "experimental, unproven", model: "unified-nb-v1", source: "unified_model",
    verdict: "NOT_WORSE", p_home: 0.452, p_draw: 0.271, p_away: 0.277 };
  const errors = await openHub(page, "cnl",
    payload("cnl", "pre", { traders_model: tm }), WHEN.pre.clock);
  const line = page.getByTestId("traders-model");
  await expect(line).toHaveAttribute("data-tested", "yes");
  await expect(line).toContainText("trader's model (tested)");
  await expect(line).toContainText("experimental, unproven");
  await expect(page.getByTestId("traders-model-1x2")).toContainText("NTH 45.2% · draw 27.1% · STH 27.7%");
  expect(errors).toEqual([]);
});

test("an absent trader's read is named, never an empty bar", async ({ page }) => {
  const tm = { title: "trader's model (untested)", tested: false, available: false,
    label: "experimental, unproven", why: "fixture_not_keyed" };
  const errors = await openHub(page, "seriea",
    payload("seriea", "pre", { traders_model: tm }), WHEN.pre.clock);
  await expect(page.getByTestId("traders-model")).toHaveAttribute("data-tested", "no");
  await expect(page.getByTestId("traders-model-absent")).toContainText("fixture_not_keyed");
  expect(errors).toEqual([]);
});

test("a payload with no match block is a named failure, not a crash", async ({ page }) => {
  const errors = await openHub(page, "afcon", { model: null, model_refusal: REFUSAL }, WHEN.pre.clock);
  await expect(page.locator("body")).toContainText("no match block");
  expect(errors).toEqual([]);
});

test("the proxy forwards each new hub's per-match path, and nothing beside it", async ({ request }) => {
  expect([...HUB_MATCH_KEYS].sort(), "the proxy's hub keys are the hubs' keys").toEqual([...SEVEN].sort());
  for (const key of SEVEN) await expectForwarded(request, "comp", `${key}/match/990001`);
  for (const bad of ["bundesliga/match/abc", "unl/match/990001/x", "afcon/match/.."]) {
    const r = await request.get(`/api/comp/${bad}`);
    expect(await r.text(), bad).toContain("unknown comp route");
  }
});

// ── the boards: every card of the seven opens its hub ────────────────

async function openBoard(page: Page, champ: boolean) {
  await page.clock.install({ time: new Date(champ ? CHAMP_CLOCK : "2026-09-15T11:32:30Z") });
  if (champ) {
    await page.addInitScript(() => {
      try { window.localStorage.setItem("board-mode", "championships"); } catch { /* none */ }
    });
  }
  await page.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD_EIGHT)));
  await page.route("**/api/picker/review**", (r) =>
    r.fulfill(json({ rows: [], refusals: [], leagues: {} })));
  await page.route("**/api/championships/board**", (r) =>
    r.fulfill(json(champ ? CHAMP_BOARD : {}, champ ? 200 : 503)));
  await page.goto("/bet-suggester");
  await page.waitForSelector('[data-testid="picker-row"]');
}

async function cardLinks(page: Page) {
  return page.locator('[data-testid="picker-row"]').evaluateAll((els) => els.map((e) => ({
    league: e.getAttribute("data-league") ?? "",
    href: e.querySelector("a[href]")?.getAttribute("href") ?? null,
  })));
}

for (const champ of [false, true]) {
  test(`${champ ? "Championships" : "Leagues"} mode: every card of the seven links to its own hub`, async ({ page }) => {
    await openBoard(page, champ);
    const cards = (await cardLinks(page)).filter((c) => SEVEN.includes(c.league as never));
    const want = SEVEN.filter((k) => CHAMPS.has(k) === champ);
    // non-vacuity: every one of this mode's competitions drew a card
    expect([...new Set(cards.map((c) => c.league))].sort()).toEqual([...want].sort());
    for (const c of cards) {
      expect(c.href, `${c.league} card is unlinked`).toMatch(
        new RegExp(`^/bet-suggester/${c.league}/\\d{1,12}$`));
    }
  });
}

// ── the derived eleven ───────────────────────────────────────────────

test("the board's own declarations name eleven competitions, and each card opens a hub that renders", async ({ browser }) => {
  test.setTimeout(180_000);
  const declared = [
    ...(declarationOf(BOARD_EIGHT as unknown as Board) ?? []),
    ...(declarationOf(CHAMP_BOARD as unknown as Board) ?? []),
  ];
  expect(new Set(declared).size, `declared: ${declared.join(", ")}`).toBe(11);
  expect(declared.length).toBe(11);

  const href = new Map<string, string>();
  for (const champ of [false, true]) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await openBoard(p, champ);
    for (const c of await cardLinks(p)) {
      if (c.href && !href.has(c.league)) href.set(c.league, c.href);
    }
    await ctx.close();
  }

  for (const key of declared) {
    const h = href.get(key);
    expect(h, `${key}: no card on its board links anywhere`).toMatch(
      new RegExp(`^/bet-suggester/${key}/(\\d{1,12})$`));
    const id = h!.split("/").pop()!;
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const errors: string[] = [];
    p.on("pageerror", (e) => errors.push(String(e)));
    await p.clock.install({ time: new Date(WHEN.pre.clock) });
    await p.route("**/api/**", (r) => r.fulfill(json({ detail: "hermetic" }, 503)));
    // the hub's own read, wherever its config points it: the four league
    // planes at /api/<league>/match, the seven at /api/comp/<key>/match
    let asked = "";
    await p.route(/\/api\/(?:comp\/)?[a-z0-9-]+\/match\/\d+(?:\?.*)?$/, (r) => {
      asked = new URL(r.request().url()).pathname;
      const b = payload(key, "pre");
      r.fulfill(json({ ...b, match: { ...b.match, id } }));
    });
    await p.goto(h!);
    await expect(p.getByText("NTH vs STH").first(), `${key} hub did not render`).toBeVisible();
    expect(asked, `${key} hub read the wrong route`).toBe(
      SEVEN.includes(key as never) ? `/api/comp/${key}/match/${id}` : `/api/${key}/match/${id}`);
    expect(errors, `${key} hub threw`).toEqual([]);
    await ctx.close();
  }
});

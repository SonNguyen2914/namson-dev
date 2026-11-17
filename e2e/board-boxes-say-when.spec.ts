import { expect, test, type Page } from "@playwright/test";

// THE SWITCH SHOWS ONLY THE BOARDS THAT PLAY SOON — AND THE TOP BAR NO
// LONGER CARRIES CUP CHIPS.
//
// Son, 2026-11-16: "UCL and EFL can be removed entirely because we have
// them in the cups … Leagues can be removed too and we can link the
// league individual page by clicking the league name in the league's
// schedule header." Then, the same day: a Leagues | Cups | Nations box
// APPEARS only when its board has a kickoff today, tomorrow or the day
// after (LA days), read from ONE request (/api/board/soon); if only one
// board would be shown, the whole switch is hidden and the page shows
// that board.
//
// MISSING IS NEVER ZERO: a failed read, a route that is not deployed yet,
// a payload of the wrong shape, or a mode the read could not measure
// keeps its box. Only a MEASURED quiet window hides one. A remembered
// board that is hidden falls back without overwriting the remembered
// choice; a `?mode=` link opens its board regardless.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

const TZ = "America/Los_Angeles";
const _fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
});
const TODAY = _fmt.format(new Date());
function plusDays(key: string, n: number) {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  const p = (x: number) => String(x).padStart(2, "0");
  return `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())}`;
}
/** 19:30Z is mid-day in LA under either offset, so it cannot slide days. */
function kickoffOn(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 19, 30)).toISOString()
    .replace(".000Z", "Z");
}

type Comps = Record<string, [string, number[]]>;
/** One mode's block: `comps` maps slug -> [display, day offsets]. */
const mode = (comps: Comps, unknown: string[] = []) => ({
  asked: [...Object.keys(comps), ...unknown],
  comps: Object.fromEntries(Object.entries(comps).map(([slug, [display, offs]]) =>
    [slug, { display, kickoffs: offs.map((o) => kickoffOn(plusDays(TODAY, o))) }])),
  unknown,
});
const QUIET = mode({});
/** The whole payload; every mode not given is a measured quiet one. */
const soon = (m: Partial<Record<"leagues" | "cups" | "nations", unknown>>) => ({
  days: 4,
  modes: { leagues: QUIET, cups: QUIET, nations: QUIET, ...m },
  framing: "kickoff times only",
});

const BOARD = {
  generated_at: "2026-11-16T12:00:00Z", date: "20261116", days: 7,
  leagues: {
    mls: { src: "current", min_current_gp: 22, clubs: 30, kind: "league" },
    bundesliga: { src: "current", min_current_gp: 5, clubs: 18, kind: "league" },
  },
  rows: [], refusals: [],
};
/** The Cups tab's board (asked BY NAME with `?leagues=`). */
const CUP_BOARD = {
  ...BOARD,
  leagues: {
    ucl: { src: "current", min_current_gp: 2, clubs: 36, kind: "cup" },
    eflcup: { src: "current", min_current_gp: 2, clubs: 8, kind: "cup" },
    facup: { src: "current", min_current_gp: 2, clubs: 64, kind: "cup" },
  },
};
const REVIEW = {
  generated_at: "2026-11-16T12:00:00Z", date: "20261116", back: 7,
  window: { from: "20261109", to: "20261116" },
  store: { backend: "memory", writable: true },
  leagues: {}, finished: [], refusals: [],
};

/** `served` is the /api/board/soon body, or a status code to fail it. */
async function open(page: Page, served: unknown | number,
                    where = "/trivela", stored?: string) {
  const asked: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url()); asked.push(u.pathname + u.search);
  });
  if (stored) await page.addInitScript((m) => {
    try { localStorage.setItem("board-mode", m); } catch { /* none */ }
  }, stored);
  // catch-all FIRST: Playwright tries the most recent handler first
  await page.route("**/api/**", (r) => r.fulfill(json({}, 503)));
  await page.route("**/api/picker/board**", (r) =>
    r.fulfill(json(/[?&]leagues=/.test(r.request().url()) ? CUP_BOARD : BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route("**/api/board/soon**", (r) =>
    typeof served === "number"
      ? r.fulfill(json({ detail: "not served" }, served))
      : r.fulfill(json(served)));
  await page.route("**/api/championships/board**", (r) =>
    r.fulfill(json({ ...BOARD, leagues: {} })));
  await page.route("**/api/championships/review**", (r) => r.fulfill(json(REVIEW)));
  await page.goto(where);
  return asked;
}

const sw = (page: Page) => page.getByTestId("board-mode");
const box = (page: Page, m: string) => page.getByTestId(`board-mode-${m}`);

/** After the soon read has landed: the switch starts as all three boxes
 *  on first paint, so a "hidden" assertion must wait for the read. */
async function settled(page: Page) {
  await page.waitForLoadState("networkidle");
}

/** Which board the page is showing, off the request it made for it. */
const boardAsked = (asked: string[]) => {
  const last = [...asked].reverse().find((u) =>
    u.startsWith("/api/picker/board") || u.startsWith("/api/championships/board"));
  if (!last) return null;
  if (last.startsWith("/api/championships/board")) return "nations";
  return /[?&]leagues=[^&]*ucl/.test(last) ? "cups" : "leagues";
};

const storedMode = (page: Page) =>
  page.evaluate(() => { try { return localStorage.getItem("board-mode"); } catch { return "x"; } });

// ───────────────────────────────────────────── the top bar, after

test("the top bar has no UCL, EFL Cup or Leagues chip; Friendlies stays",
  async ({ page }) => {
    await open(page, 503);
    const bar = page.locator("header.topbar");
    await expect(bar.getByRole("link", { name: "Friendlies" })).toHaveCount(1);
    for (const href of ["/trivela/ucl", "/trivela/efl-cup", "/trivela/leagues"])
      await expect(bar.locator(`a[href="${href}"]`)).toHaveCount(0);
    await expect(bar.locator("[data-soon]")).toHaveCount(0);
  });

for (const where of ["/trivela/leagues", "/trivela/ratings"]) {
  test(`no cup chip on ${where} either`, async ({ page }) => {
    await page.route("**/api/**", (r) => r.fulfill(json({}, 503)));
    await page.goto(where);
    const bar = page.locator("header.topbar");
    await expect(bar).toBeVisible();
    for (const href of ["/trivela/ucl", "/trivela/efl-cup"])
      await expect(bar.locator(`a[href="${href}"]`)).toHaveCount(0);
  });
}

// ───────────────────────────────────────────── which boxes are drawn

test("three boards playing: all three boxes", async ({ page }) => {
  await open(page, soon({
    leagues: mode({ epl: ["Premier League", [0]] }),
    cups: mode({ ucl: ["UCL", [1]] }),
    nations: mode({ unl: ["UEFA Nations League", [2]] }),
  }));
  await settled(page);
  for (const m of ["leagues", "cups", "nations"]) await expect(box(page, m)).toBeVisible();
});

test("two boards playing: only their two boxes, in order", async ({ page }) => {
  await open(page, soon({
    leagues: mode({ epl: ["Premier League", [0]] }),
    cups: mode({ eflcup: ["EFL Cup", [2]] }),
  }));
  await settled(page);
  await expect(box(page, "nations")).toHaveCount(0);
  await expect(sw(page).getByRole("button")).toHaveText(["Leagues", "Cups"]);
});

test("a game three days out does not count — the window is three days",
  async ({ page }) => {
    await open(page, soon({
      leagues: mode({ epl: ["Premier League", [0]] }),
      cups: mode({ ucl: ["UCL", [1]] }),
      nations: mode({ unl: ["UEFA Nations League", [3]] }),
    }));
    await settled(page);
    await expect(box(page, "nations")).toHaveCount(0);
  });

test("ONE board playing hides the whole switch and shows that board",
  async ({ page }) => {
    const asked = await open(page, soon({ cups: mode({ ucl: ["UCL", [0]] }) }));
    await settled(page);
    await expect(sw(page)).toHaveCount(0);
    await expect.poll(() => boardAsked(asked)).toBe("cups");
    // a fallback, not a choice: nothing was remembered
    expect(await storedMode(page)).toBeNull();
  });

test("NO board measured playing hides the switch and shows Leagues",
  async ({ page }) => {
    const asked = await open(page, soon({}), "/trivela", "nations");
    await settled(page);
    await expect(sw(page)).toHaveCount(0);
    await expect.poll(() => boardAsked(asked)).toBe("leagues");
    expect(await storedMode(page)).toBe("nations");
  });

// ───────────────────────────────────────────── a failed read hides nothing

for (const [why, served] of [
  ["a 404 (route not deployed yet)", 404],
  ["a 503", 503],
  ["a 200 that is not the route's shape", { detail: "not served" }],
] as const) {
  test(`${why}: all three boxes, as before`, async ({ page }) => {
    await open(page, served);
    await settled(page);
    for (const m of ["leagues", "cups", "nations"]) await expect(box(page, m)).toBeVisible();
  });
}

test("a mode the read could not measure keeps its box", async ({ page }) => {
  // nations block missing entirely; cups has an unread competition
  await open(page, { days: 4, modes: {
    leagues: mode({ epl: ["Premier League", [0]] }),
    cups: mode({ eflcup: ["EFL Cup", [6]] }, ["ucl"]),
  } });
  await settled(page);
  for (const m of ["leagues", "cups", "nations"]) await expect(box(page, m)).toBeVisible();
});

// ───────────────────────────────────────────── the selected board

test("a remembered board that is hidden falls back to the first box drawn, "
   + "and the memory is kept", async ({ page }) => {
  const asked = await open(page, soon({
    leagues: mode({ epl: ["Premier League", [0]] }),
    cups: mode({ ucl: ["UCL", [1]] }),
  }), "/trivela", "nations");
  await settled(page);
  await expect(box(page, "leagues")).toHaveAttribute("aria-pressed", "true");
  await expect(box(page, "nations")).toHaveCount(0);
  await expect.poll(() => boardAsked(asked)).toBe("leagues");
  expect(await storedMode(page)).toBe("nations");
});

test("a click is a choice and is remembered", async ({ page }) => {
  await open(page, soon({
    leagues: mode({ epl: ["Premier League", [0]] }),
    cups: mode({ ucl: ["UCL", [1]] }),
  }));
  await settled(page);
  await box(page, "cups").click();
  await expect(box(page, "cups")).toHaveAttribute("aria-pressed", "true");
  expect(await storedMode(page)).toBe("cups");
});

test("?mode= opens that board even when its box would be hidden",
  async ({ page }) => {
    const asked = await open(page, soon({
      leagues: mode({ epl: ["Premier League", [0]] }),
      cups: mode({ ucl: ["UCL", [1]] }),
    }), "/trivela?mode=nations");
    await settled(page);
    await expect.poll(() => boardAsked(asked)).toBe("nations");
    // the board on screen keeps its box so the reader sees where they are
    await expect(box(page, "nations")).toHaveAttribute("aria-pressed", "true");
    expect(await storedMode(page)).toBeNull();
  });

test("ONE request for every board — no per-competition fixture reads",
  async ({ page }) => {
    const asked = await open(page, soon({ cups: mode({ ucl: ["UCL", [1]] }) }));
    await settled(page);
    expect(asked.filter((p) => p.startsWith("/api/board/soon"))).toHaveLength(1);
    expect(asked.filter((p) => /^\/api\/comp\/[^/]+\/fixtures/.test(p))).toEqual([]);
  });

// ───────────────────────────────────────────── the league page, from its name

test("a league column's name links to that league's page; other columns stay text",
  async ({ page }) => {
    await open(page, 503);
    const mls = page.locator('[data-testid="col-head"][data-league="mls"]');
    const link = mls.getByTestId("col-head-link");
    await expect(link).toHaveAttribute("href", "/trivela/leagues?league=mls");
    await expect(link).toHaveText(/MLS/i);
    // underline and ↗ only on hover
    const arrow = link.getByTestId("col-head-link-arrow");
    await expect(arrow).toBeHidden();
    await expect(link).toHaveCSS("text-decoration-line", "none");
    await link.hover();
    await expect(arrow).toBeVisible();
    await expect(link).toHaveCSS("text-decoration-line", "underline");
    await expect(page.locator(
      '[data-testid="col-head"][data-league="bundesliga"] [data-testid="col-head-link"]'))
      .toHaveCount(0);
    await link.click();
    await expect(page).toHaveURL(/\/trivela\/leagues\?league=mls$/);
  });

test("on the Cups tab, the UCL and EFL Cup names are their pages' door",
  async ({ page }) => {
    /* the chips that used to lead to these pages are gone; the column
       name is the door now, and a cup with no page stays plain text */
    await open(page, 503, "/trivela?mode=cups");
    for (const [slug, href] of [["ucl", "/trivela/ucl"], ["eflcup", "/trivela/efl-cup"]]) {
      await expect(page.locator(
        `[data-testid="col-head"][data-league="${slug}"] [data-testid="col-head-link"]`))
        .toHaveAttribute("href", href);
    }
    await expect(page.locator('[data-testid="col-head"][data-league="facup"]'))
      .toBeVisible();
    await expect(page.locator(
      '[data-testid="col-head"][data-league="facup"] [data-testid="col-head-link"]'))
      .toHaveCount(0);
  });
